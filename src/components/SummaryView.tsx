'use client';

import { useState } from 'react';
import { useBillStore } from '@/store/billStore';
import { calculatePersonSummaries, formatCurrency, generateWhatsAppMessage } from '@/utils';
import jsPDF from 'jspdf';

interface SummaryViewProps {
  onReset?: () => void;
}

export default function SummaryView({ onReset }: SummaryViewProps) {
  const { people, items, shares, taxAmount, setTaxAmount } = useBillStore();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const summaries = calculatePersonSummaries(items, shares, people, taxAmount);
  const grandTotal = summaries.reduce((sum, s) => sum + s.finalTotal, 0);
  const totalSubtotal = summaries.reduce((sum, s) => sum + s.subtotal, 0);

  const handleTaxChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setTaxAmount(numValue);
  };

  const downloadPDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const margin = 20;
      let y = margin;

      // Title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Bill Split Summary', pageWidth / 2, y, { align: 'center' });
      y += 20;

      // Date
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, y);
      y += 15;

      // People list
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('People:', margin, y);
      y += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      summaries.forEach((summary, index) => {
        pdf.text(`${index + 1}. ${summary.person.name} (Total: ₹${summary.finalTotal.toFixed(2)})`, margin + 5, y);
        y += 6;
      });
      y += 10;

      // Items table header
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Items:', margin, y);
      y += 10;

      // Items
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      items.forEach((item) => {
        const itemTotal = item.quantity * item.unit_price;
        pdf.text(`${item.item_name} (${item.quantity} × ₹${item.unit_price.toFixed(2)}) = ₹${itemTotal.toFixed(2)}`, margin + 5, y);
        y += 6;
      });

      y += 10;

      // Summary table header
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Split Summary:', margin, y);
      y += 15;

      // Table headers
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Person', margin, y);
      pdf.text('Subtotal', margin + 60, y);
      pdf.text('Tax/Tip', margin + 100, y);
      pdf.text('Total', margin + 140, y);
      y += 8;

      // Separator line
      pdf.line(margin, y - 2, pageWidth - margin, y - 2);
      y += 5;

      // Summary rows
      pdf.setFont('helvetica', 'normal');
      summaries.forEach((summary) => {
        pdf.text(summary.person.name, margin, y);
        pdf.text(`₹${summary.subtotal.toFixed(2)}`, margin + 60, y);
        pdf.text(`₹${summary.taxShare.toFixed(2)}`, margin + 100, y);
        pdf.text(`₹${summary.finalTotal.toFixed(2)}`, margin + 140, y);
        y += 8;
      });

      y += 5;
      
      // Total line
      pdf.line(margin, y - 2, pageWidth - margin, y - 2);
      y += 5;
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Grand Total:', margin + 100, y);
      pdf.text(`₹${grandTotal.toFixed(2)}`, margin + 140, y);

      y += 20;

      // Detailed breakdown for each person
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Detailed Breakdown by Person:', margin, y);
      y += 15;

      summaries.forEach((summary, personIndex) => {
        // Check if we need a new page
        if (y > 250) {
          pdf.addPage();
          y = margin;
        }

        // Person header
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${summary.person.name}:`, margin, y);
        y += 10;

        // Person's items
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        let personTotal = 0;

        items.forEach((item, itemIndex) => {
          const personShare = shares[itemIndex]?.[personIndex] || 0;
          if (personShare > 0) {
            const itemCost = personShare * item.unit_price;
            personTotal += itemCost;
            pdf.text(`  • ${item.item_name}: ${personShare} × ₹${item.unit_price.toFixed(2)} = ₹${itemCost.toFixed(2)}`, margin + 5, y);
            y += 6;
          }
        });

        if (personTotal === 0) {
          pdf.text('  • No items assigned', margin + 5, y);
          y += 6;
        }

        // Person summary
        y += 3;
        pdf.setFont('helvetica', 'bold');
        pdf.text(`  Subtotal: ₹${summary.subtotal.toFixed(2)}`, margin + 5, y);
        y += 6;
        pdf.text(`  Tax/Tip Share: ₹${summary.taxShare.toFixed(2)}`, margin + 5, y);
        y += 6;
        pdf.text(`  Final Total: ₹${summary.finalTotal.toFixed(2)}`, margin + 5, y);
        y += 15;
      });

      // Footer
      y += 10;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text('Generated by Smart Bill Splitter', pageWidth / 2, y, { align: 'center' });
      y += 5;
      pdf.text('Vibe coded using GitHub Copilot by Abhinav Mohanan', pageWidth / 2, y, { align: 'center' });
      y += 5;
      pdf.text('https://github.com/Abhinavmohanan', pageWidth / 2, y, { align: 'center' });

      // Save the PDF
      pdf.save(`bill-split-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const shareViaWhatsApp = () => {
    const message = generateWhatsAppMessage(summaries);
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (items.length === 0 || people.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-gray-500">No bill data found. Please start by uploading a bill.</p>
        {onReset && (
          <button
            onClick={onReset}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Start Over
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bill Split Summary</h2>
        <p className="text-gray-600">
          Review the final breakdown and add tax/tip if needed
        </p>
      </div>

      {/* Tax/Tip Input */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Tax/Tip</h3>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <label htmlFor="tax-amount" className="text-sm font-medium text-gray-700 min-w-fit">
            Tax/Tip Amount:
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-medium text-gray-700">₹</span>
            <input
              id="tax-amount"
              type="number"
              step="0.01"
              min="0"
              value={taxAmount}
              onChange={(e) => handleTaxChange(e.target.value)}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
              placeholder="0.00"
            />
          </div>
          <p className="text-sm text-gray-500 max-w-md">
            This will be split proportionally based on each person&apos;s subtotal
          </p>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Person
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subtotal
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tax/Tip Share
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Final Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summaries.map((summary) => (
                <tr key={summary.person.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-semibold">
                          {summary.person.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{summary.person.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatCurrency(summary.subtotal)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                    {formatCurrency(summary.taxShare)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-lg text-green-600">
                    {formatCurrency(summary.finalTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                  Total
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900">
                  {formatCurrency(totalSubtotal)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900">
                  {formatCurrency(taxAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-xl text-green-600">
                  {formatCurrency(grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4 p-4">
          {summaries.map((summary) => (
            <div key={summary.person.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-semibold text-lg">
                    {summary.person.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-gray-900">{summary.person.name}</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(summary.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tax/Tip Share:</span>
                  <span className="font-medium text-gray-600">{formatCurrency(summary.taxShare)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-green-600">{formatCurrency(summary.finalTotal)}</span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Mobile Total Summary */}
          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
            <h3 className="font-bold text-lg text-blue-900 mb-3">Grand Total</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-blue-800">Subtotal:</span>
                <span className="font-bold text-blue-900">{formatCurrency(totalSubtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-800">Tax/Tip:</span>
                <span className="font-bold text-blue-900">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-blue-300">
                <span className="text-xl font-bold text-blue-900">Final Total:</span>
                <span className="text-2xl font-bold text-green-600">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={downloadPDF}
          disabled={isGeneratingPDF}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          {isGeneratingPDF ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Download PDF</span>
            </>
          )}
        </button>
        
        <button
          onClick={shareViaWhatsApp}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.306"/>
          </svg>
          <span>Share via WhatsApp</span>
        </button>

        {onReset && (
          <button
            onClick={onReset}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Start Over</span>
          </button>
        )}
      </div>

      {/* Item Details */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Item Breakdown</h3>
        <div className="grid gap-2 text-sm">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between">
              <span>{item.item_name} ({item.quantity} × ₹{item.unit_price.toFixed(2)})</span>
              <span className="font-medium">₹{(item.quantity * item.unit_price).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
