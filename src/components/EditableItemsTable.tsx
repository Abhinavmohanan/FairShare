'use client';

import { useState } from 'react';
import { ExtractedItem } from '@/types';

interface EditableItemsTableProps {
  items: ExtractedItem[];
  onChange: (items: ExtractedItem[]) => void;
  className?: string;
}

export default function EditableItemsTable({ items, onChange, className = '' }: EditableItemsTableProps) {
  const [editingCell, setEditingCell] = useState<{ row: number; field: keyof ExtractedItem } | null>(null);

  const handleCellClick = (rowIndex: number, field: keyof ExtractedItem) => {
    setEditingCell({ row: rowIndex, field });
  };

  const handleCellChange = (rowIndex: number, field: keyof ExtractedItem, value: string) => {
    const newItems = [...items];
    if (field === 'item_name') {
      newItems[rowIndex][field] = value;
    } else {
      const numValue = parseFloat(value) || 0;
      newItems[rowIndex][field] = numValue;
    }
    onChange(newItems);
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, _rowIndex: number, _field: keyof ExtractedItem) => {
    if (e.key === 'Enter') {
      setEditingCell(null);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const addNewItem = () => {
    const newItem: ExtractedItem = {
      item_name: 'New Item',
      quantity: 1,
      unit_price: 0
    };
    onChange([...items, newItem]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Item Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Unit Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Total
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-700 font-medium text-center">
                  {index + 1}
                </td>
                <td className="px-4 py-3">
                  {editingCell?.row === index && editingCell.field === 'item_name' ? (
                    <input
                      type="text"
                      value={item.item_name}
                      onChange={(e) => handleCellChange(index, 'item_name', e.target.value)}
                      onBlur={handleCellBlur}
                      onKeyDown={(e) => handleKeyDown(e, index, 'item_name')}
                      className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      autoFocus
                    />
                  ) : (
                    <div
                      onClick={() => handleCellClick(index, 'item_name')}
                      className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded text-gray-900"
                    >
                      {item.item_name}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingCell?.row === index && editingCell.field === 'quantity' ? (
                    <input
                      type="number"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => handleCellChange(index, 'quantity', e.target.value)}
                      onBlur={handleCellBlur}
                      onKeyDown={(e) => handleKeyDown(e, index, 'quantity')}
                      className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      autoFocus
                    />
                  ) : (
                    <div
                      onClick={() => handleCellClick(index, 'quantity')}
                      className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded text-gray-900"
                    >
                      {item.quantity}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingCell?.row === index && editingCell.field === 'unit_price' ? (
                    <input
                      type="number"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => handleCellChange(index, 'unit_price', e.target.value)}
                      onBlur={handleCellBlur}
                      onKeyDown={(e) => handleKeyDown(e, index, 'unit_price')}
                      className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      autoFocus
                    />
                  ) : (
                    <div
                      onClick={() => handleCellClick(index, 'unit_price')}
                      className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded text-gray-900"
                    >
                      ₹{item.unit_price.toFixed(2)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-900 font-medium">
                  ₹{(item.quantity * item.unit_price).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-800 transition-colors duration-200"
                    title="Remove item"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={4} className="px-4 py-3 text-right font-medium text-gray-900">
                Total:
              </td>
              <td className="px-4 py-3 font-bold text-gray-900">
                ₹{calculateTotal().toFixed(2)}
              </td>
              <td className="px-4 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <button
          onClick={addNewItem}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Item
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Click on any cell to edit. Press Enter or click outside to save.
        </p>
      </div>
    </div>
  );
}
