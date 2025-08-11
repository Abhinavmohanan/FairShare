export interface ExtractedItem {
  item_name: string;
  quantity: number;
  unit_price: number;
}

export interface OcrItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface OcrResponse {
  items: OcrItem[];
  totalAmount: number;
  fileName: string;
  processedAt: string;
  mode?: 'gemini-vision' | 'manual';
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  errorType?: 'MISSING_API_KEY' | 'GEMINI_PROCESSING_ERROR' | 'NETWORK_ERROR' | 'VALIDATION_ERROR';
}

export interface ApiSuccessResponse {
  success: true;
  data: OcrResponse;
}

export interface Person {
  id: string;
  name: string;
}

export interface ShareAssignment {
  personId: string;
  itemIndex: number;
  share: number;
}

export interface PersonSummary {
  person: Person;
  subtotal: number;
  taxShare: number;
  finalTotal: number;
}
