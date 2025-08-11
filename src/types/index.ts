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
  mode?: 'mock' | 'gemini-vision' | 'mock-fallback';
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
