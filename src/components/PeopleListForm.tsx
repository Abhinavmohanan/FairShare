'use client';

import { useState } from 'react';
import { useBillStore } from '@/store/billStore';

interface PeopleListFormProps {
  onComplete?: () => void;
}

export default function PeopleListForm({ onComplete }: PeopleListFormProps) {
  const [newPersonName, setNewPersonName] = useState('');
  const [error, setError] = useState('');
  
  const { people, addPerson, removePerson } = useBillStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = newPersonName.trim();
    if (!trimmedName) {
      setError('Please enter a name');
      return;
    }

    if (people.some(person => person.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError('This person is already added');
      return;
    }

    addPerson(trimmedName);
    setNewPersonName('');
    setError('');
  };

  const handleRemovePerson = (personId: string) => {
    removePerson(personId);
  };

  const canProceed = people.length >= 2;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Who&apos;s Sharing the Bill?</h2>
        <p className="text-gray-600">Add at least 2 people to split the bill</p>
      </div>

      {/* Add Person Form */}
      <form onSubmit={handleSubmit} className="flex space-x-3">
        <div className="flex-1">
          <input
            type="text"
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            placeholder="Enter person's name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
          />
          {error && (
            <p className="text-red-600 text-sm mt-1">{error}</p>
          )}
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          Add Person
        </button>
      </form>

      {/* People List */}
      {people.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            People ({people.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((person) => (
              <div
                key={person.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {person.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900">{person.name}</span>
                </div>
                <button
                  onClick={() => handleRemovePerson(person.id)}
                  className="text-red-600 hover:text-red-800 transition-colors duration-200"
                  title={`Remove ${person.name}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation Message */}
      {people.length === 1 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-yellow-800 text-sm">
              Add at least one more person to continue
            </p>
          </div>
        </div>
      )}

      {/* Continue Button */}
      {canProceed && (
        <div className="flex justify-center">
          <button
            onClick={onComplete}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
          >
            Continue to Share Assignment
          </button>
        </div>
      )}

      {/* Empty State */}
      {people.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <p className="text-gray-500">No people added yet. Start by adding someone above.</p>
        </div>
      )}
    </div>
  );
}
