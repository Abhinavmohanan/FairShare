# FairShare

A Next.js 14 application that uses OCR to extract items from restaurant bills and splits them fairly among multiple people.

## Features

- **Free OCR Processing**: Built-in Tesseract.js for 100% free OCR (no API keys required)
- **Premium OCR**: Optional Google Cloud Vision API and Gemini AI for higher accuracy
- **Smart Splitting**: Assign fractional shares of each item to different people
- **Tax Calculation**: Proportionally split tax and tips based on each person's subtotal
- **Export Options**: Download PDF summaries or share via WhatsApp
- **Responsive Design**: Modern UI built with Tailwind CSS
- **State Management**: Zustand for clean, type-safe state management

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Free OCR**: Tesseract.js (client-side, no API required)
- **Premium OCR**: Google Cloud Vision API (optional)
- **AI**: Google Gemini API (optional)
- **PDF Generation**: jsPDF

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- (Optional) Google Cloud Vision API credentials
- (Optional) Google Gemini API key

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd bill-sharing-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.local.example .env.local
   ```

4. (Optional) Configure API keys in `.env.local`:
   ```env
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   GOOGLE_CLOUD_PRIVATE_KEY=your-private-key
   GOOGLE_CLOUD_CLIENT_EMAIL=your-client-email
   GEMINI_API_KEY=your-gemini-api-key
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### 1. Upload Bill (/)
- Drag and drop or click to upload a bill image (JPG, PNG)
- The app will process the image and extract items using OCR
- Review and edit the extracted items if needed
- Click "Confirm Items & Continue"

### 2. Assign Shares (/assign)
- **Step 1**: Add people who are sharing the bill (minimum 2)
- **Step 2**: Assign fractional shares for each item to each person
  - Enter how much of each item each person consumed
  - Ensure all quantities are fully assigned (Unassigned column shows 0.00)
- View live subtotal calculations
- Click "Continue to Summary"

### 3. Summary (/summary)
- Review the final breakdown for each person
- Add tax/tip amount (split proportionally)
- Download PDF summary or share via WhatsApp
- Start over with a new bill

## Demo Mode

The app works completely **FREE** out of the box using Tesseract.js for OCR processing. No API keys or external services required!

- **Free Tier**: Uses Tesseract.js (100% free, client-side OCR)
- **Premium Tier**: Optionally configure Google Cloud Vision and Gemini APIs for higher accuracy
- **Fallback**: Mock data if OCR fails

This allows you to test all features immediately without any setup.

## API Endpoints

- `POST /api/ocr-free` - Free OCR using Tesseract.js (default)
- `POST /api/ocr` - Premium OCR using Google Cloud Vision + Gemini AI
- `POST /api/ocr-mock` - Fallback mock data endpoint

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── assign/            # Share assignment page
│   ├── summary/           # Summary page
│   └── page.tsx           # Bill upload page
├── components/            # React components
│   ├── BillUploader.tsx
│   ├── EditableItemsTable.tsx
│   ├── Navigation.tsx
│   ├── PeopleListForm.tsx
│   ├── ShareAssignmentTable.tsx
│   └── SummaryView.tsx
├── store/                 # Zustand store
│   └── billStore.ts
├── types/                 # TypeScript type definitions
│   └── index.ts
└── utils/                 # Utility functions
    └── index.ts
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
