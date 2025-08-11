import { ExtractedItem, Person, PersonSummary } from '@/types';

export function calculateSplit(
  items: ExtractedItem[],
  shares: number[][],
  people: Person[]
): number[] {
  return people.map((_, personIndex) => {
    return items.reduce((total, item, itemIndex) => {
      const personShare = shares[itemIndex]?.[personIndex] || 0;
      return total + (personShare * item.unit_price);
    }, 0);
  });
}

export function applyTaxProportionally(
  subtotals: number[],
  taxAmount: number
): number[] {
  const totalSubtotal = subtotals.reduce((sum, subtotal) => sum + subtotal, 0);
  
  if (totalSubtotal === 0) {
    return subtotals.map(() => 0);
  }
  
  return subtotals.map(subtotal => {
    const taxShare = (subtotal / totalSubtotal) * taxAmount;
    return subtotal + taxShare;
  });
}

export function calculatePersonSummaries(
  items: ExtractedItem[],
  shares: number[][],
  people: Person[],
  taxAmount: number
): PersonSummary[] {
  const subtotals = calculateSplit(items, shares, people);
  const totalSubtotal = subtotals.reduce((sum, subtotal) => sum + subtotal, 0);
  
  return people.map((person, index) => {
    const subtotal = subtotals[index];
    const taxShare = totalSubtotal > 0 ? (subtotal / totalSubtotal) * taxAmount : 0;
    const finalTotal = subtotal + taxShare;
    
    return {
      person,
      subtotal,
      taxShare,
      finalTotal,
    };
  });
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

export function generateWhatsAppMessage(summaries: PersonSummary[]): string {
  let message = "🧾 *Bill Split Summary*\n\n";
  
  summaries.forEach(summary => {
    message += `👤 *${summary.person.name}*\n`;
    message += `   Subtotal: ${formatCurrency(summary.subtotal)}\n`;
    message += `   Tax/Tip: ${formatCurrency(summary.taxShare)}\n`;
    message += `   *Total: ${formatCurrency(summary.finalTotal)}*\n\n`;
  });
  
  const grandTotal = summaries.reduce((sum, s) => sum + s.finalTotal, 0);
  message += `💰 *Grand Total: ${formatCurrency(grandTotal)}*`;
  
  return encodeURIComponent(message);
}

export function validateFileType(file: File): boolean {
  return file.type.startsWith('image/');
}

export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}
