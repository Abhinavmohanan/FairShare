'use client';

import { useBillStore } from '@/store/billStore';

interface ShareAssignmentTableProps {
  onComplete?: () => void;
}

export default function ShareAssignmentTable({ onComplete }: ShareAssignmentTableProps) {
  const { 
    people, 
    items, 
    shares, 
    updateShare, 
    getUnassignedQuantity, 
    isAllItemsAssigned,
    getPersonSubtotal 
  } = useBillStore();

  const handleShareChange = (itemIndex: number, personIndex: number, value: string) => {
    // Round to 2 decimal places to prevent floating point precision issues
    const numValue = Math.round((parseFloat(value) || 0) * 100) / 100;
    updateShare(itemIndex, personIndex, numValue);
  };

  const canProceed = isAllItemsAssigned();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Assign Shares</h2>
        <p className="text-gray-600">
          Enter how much of each item each person consumed. Make sure all quantities are assigned.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500">No items found. Please go back and upload a bill first.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Price
                      </th>
                      {people.map((person) => (
                        <th
                          key={person.id}
                          className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider"
                        >
                          {person.name}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Unassigned
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item, itemIndex) => {
                    const unassigned = getUnassignedQuantity(itemIndex);
                    const hasError = Math.abs(unassigned) > 0.01;
                    
                    return (
                      <tr key={itemIndex} className={hasError ? 'bg-red-25' : 'hover:bg-gray-50'}>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {item.item_name}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-900">
                          ₹{item.unit_price.toFixed(2)}
                        </td>
                        {people.map((person, personIndex) => (
                          <td key={person.id} className="px-4 py-3">
                            <div className="flex justify-center">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                max={item.quantity}
                                value={shares[itemIndex]?.[personIndex] || 0}
                                onChange={(e) => handleShareChange(itemIndex, personIndex, e.target.value)}
                                className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                              />
                            </div>
                          </td>
                        ))}
                        <td className={`px-4 py-3 text-center font-medium ${
                          hasError ? 'text-red-600 bg-red-50' : 'text-green-600'
                        }`}>
                          {unassigned.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {items.map((item, itemIndex) => {
              const unassigned = getUnassignedQuantity(itemIndex);
              const hasError = Math.abs(unassigned) > 0.01;
              
              return (
                <div key={itemIndex} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900">{item.item_name}</h4>
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>Qty: {item.quantity}</span>
                      <span>Price: ₹{item.unit_price.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {people.map((person, personIndex) => (
                      <div key={person.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-xs">
                              {person.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{person.name}</span>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max={item.quantity}
                          value={shares[itemIndex]?.[personIndex] || 0}
                          onChange={(e) => handleShareChange(itemIndex, personIndex, e.target.value)}
                          className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                        />
                      </div>
                    ))}
                    
                    <div className={`flex justify-between items-center pt-2 border-t ${
                      hasError ? 'border-red-200' : 'border-gray-200'
                    }`}>
                      <span className="text-sm font-medium text-gray-700">Unassigned:</span>
                      <span className={`font-bold ${
                        hasError ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {unassigned.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Subtotals */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Live Subtotals</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {people.map((person, personIndex) => {
                const subtotal = getPersonSubtotal(personIndex);
                return (
                  <div
                    key={person.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {person.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{person.name}</span>
                    </div>
                    <span className="font-bold text-green-600">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Validation Messages */}
          {!canProceed && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-red-800 font-medium">Assignment incomplete</p>
                  <p className="text-red-700 text-sm">
                    All items must have their full quantities assigned (Unassigned column should be 0.00)
                  </p>
                </div>
              </div>
            </div>
          )}

          {canProceed && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-800 font-medium">
                  All items assigned! Ready to proceed to summary.
                </p>
              </div>
            </div>
          )}

          {/* Continue Button */}
          <div className="flex justify-center">
            <button
              onClick={onComplete}
              disabled={!canProceed}
              className={`px-8 py-3 rounded-lg font-medium transition-colors duration-200 ${
                canProceed
                  ? 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue to Summary
            </button>
          </div>
        </>
      )}
    </div>
  );
}
