import { NextRequest, NextResponse } from 'next/server';

interface ExtractedItem {
  item_name: string;
  quantity: number;
  unit_price: number;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Google AI API key is not configured. Please add GOOGLE_AI_API_KEY to your environment variables.',
          errorType: 'MISSING_API_KEY'
        },
        { status: 500 }
      );
    }

    try {
      console.log('Processing file with Gemini Vision API...');
      
      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString('base64');
      
      const mimeType = file.type;

      const prompt = `
Analyze this receipt/bill image and extract ALL menu items with their quantities and prices.

Return ONLY a valid JSON array in this exact format:
[
  {
    "item_name": "Item Name",
    "quantity": 1,
    "unit_price": 12.99
  }
]

IMPORTANT RULES:
- Extract ALL food/beverage/product items from the receipt, do not limit the number
- Skip only headers, restaurant name, totals, tax, tips, service charges, etc.
- If quantity is not specified, assume 1
- Convert total prices to unit prices if quantity > 1
- Use reasonable prices (between 0.50 and 2000.00)
- If text is unclear, make reasonable assumptions for restaurant/store items
- Include every single item that appears on the bill
- Do not include any explanation, markdown formatting, or extra text
- Return ONLY the JSON array, nothing else
`;

      // Retry logic with exponential backoff for rate limiting
      const maxRetries = 3;
      let lastError: Error | null = null;
      let response: Response | null = null;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          // Add delay before retry (exponential backoff)
          if (attempt > 0) {
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Max 10s delay
            console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms delay...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }

          // Create AbortController for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

          response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey,
            },
            body: JSON.stringify({
              contents: [{
                parts: [
                  {
                    text: prompt
                  },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64Data
                    }
                  }
                ]
              }],
              generationConfig: {
                temperature: 0.1,
                topK: 1,
                topP: 1,
                maxOutputTokens: 4000,
              }
            }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          // If we get a 429 (rate limit), retry
          if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 2000;
            console.log(`Rate limited (429). Waiting ${waitTime}ms before retry...`);
            lastError = new Error(`Rate limit exceeded (attempt ${attempt + 1}/${maxRetries})`);
            
            if (attempt < maxRetries - 1) {
              await new Promise(resolve => setTimeout(resolve, waitTime));
              continue;
            }
          }

          // If successful, break out of retry loop
          if (response.ok) {
            break;
          }

          // For other errors, throw immediately
          if (response.status !== 429) {
            const errorBody = await response.text();
            console.error('Gemini API error response:', errorBody);
            throw new Error(`Gemini API request failed: ${response.status} - ${errorBody}`);
          }
        } catch (error) {
          lastError = error as Error;
          
          // If it's an abort error (timeout), retry
          if (error instanceof Error && error.name === 'AbortError') {
            console.log(`Request timeout (attempt ${attempt + 1}/${maxRetries})`);
            if (attempt === maxRetries - 1) {
              throw new Error('Request timeout after multiple attempts. Please try again.');
            }
            continue;
          }
          
          // For other errors during fetch, retry only if it's a network error
          if (attempt < maxRetries - 1 && error instanceof TypeError) {
            console.log(`Network error (attempt ${attempt + 1}/${maxRetries}):`, error.message);
            continue;
          }
          
          throw error;
        }
      }

      if (!response || !response.ok) {
        if (response?.status === 429) {
          throw new Error('RATE_LIMIT_EXCEEDED: The API rate limit has been exceeded. Please wait a moment and try again.');
        }
        throw lastError || new Error('Failed to get response from Gemini API');
      }

      const result = await response.json();
      console.log('Gemini API response:', result);
      
      const candidate = result.candidates?.[0];
      const generatedText = candidate?.content?.parts?.[0]?.text;
      const finishReason = candidate?.finishReason;
      
      if (!generatedText) {
        throw new Error('No response from Gemini');
      }

      console.log('Generated text:', generatedText);
      console.log('Finish reason:', finishReason);

      // Check if response was truncated due to max tokens
      if (finishReason === 'MAX_TOKENS') {
        console.warn('Response was truncated due to max tokens. The bill may have more items than extracted.');
        // We could implement a two-pass approach here if needed
      }

      // Extract JSON from the response with improved regex
      let jsonMatch = generatedText.match(/\[[\s\S]*?\]/);
      
      if (!jsonMatch) {
        // Try to find JSON without complete closing bracket (in case of truncation)
        const openMatch = generatedText.match(/\[[\s\S]*/);
        if (openMatch) {
          let jsonStr = openMatch[0];
          // Try to fix incomplete JSON
          if (!jsonStr.endsWith(']')) {
            // Remove incomplete last item and add closing bracket
            const lastCommaIndex = jsonStr.lastIndexOf(',');
            if (lastCommaIndex > -1) {
              jsonStr = jsonStr.substring(0, lastCommaIndex) + ']';
            } else {
              jsonStr += ']';
            }
          }
          jsonMatch = [jsonStr];
        }
      }
      
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Gemini response');
      }

      const items: ExtractedItem[] = JSON.parse(jsonMatch[0]);
      
      // Validate and filter items
      const validItems = items.filter((item: ExtractedItem) => 
        item.item_name && 
        typeof item.quantity === 'number' && 
        typeof item.unit_price === 'number' &&
        item.unit_price > 0 &&
        item.quantity > 0
      );

      if (validItems.length === 0) {
        throw new Error('No valid items extracted');
      }

      console.log('Successfully extracted items:', validItems);
      
      // Log info about extraction
      if (finishReason === 'MAX_TOKENS') {
        console.warn(`⚠️ Extracted ${validItems.length} items, but the response was truncated. The bill may contain more items.`);
      } else {
        console.info(`✅ Successfully extracted ${validItems.length} items from the bill.`);
      }

      // Calculate total amount
      const totalAmount = validItems.reduce((total, item) => total + (item.quantity * item.unit_price), 0);

      const response_data = {
        success: true,
        data: {
          items: validItems.map(item => ({
            description: item.item_name,
            quantity: item.quantity,
            unitPrice: item.unit_price
          })),
          totalAmount,
          fileName: file.name,
          processedAt: new Date().toISOString(),
          mode: 'gemini-vision'
        }
      };

      return NextResponse.json(response_data);

    } catch (error) {
      console.error('Gemini processing failed:', error);
      
      return NextResponse.json(
        { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to process image with Gemini AI',
          errorType: 'GEMINI_PROCESSING_ERROR'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('File processing error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process image' 
      },
      { status: 500 }
    );
  }
}
