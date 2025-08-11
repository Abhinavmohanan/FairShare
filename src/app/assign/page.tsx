'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PeopleListForm from '@/components/PeopleListForm';
import ShareAssignmentTable from '@/components/ShareAssignmentTable';
import { useBillStore } from '@/store/billStore';

export default function AssignPage() {
  const router = useRouter();
  const [step, setStep] = useState<'people' | 'shares'>('people');
  const { items, people } = useBillStore();

  // Redirect if no items
  useEffect(() => {
    if (items.length === 0) {
      router.push('/');
    }
  }, [items.length, router]);

  const handlePeopleComplete = () => {
    setStep('shares');
  };

  const handleSharesComplete = () => {
    router.push('/summary');
  };

  const handleBack = () => {
    if (step === 'shares') {
      setStep('people');
    } else {
      router.push('/');
    }
  };

  // Show loading or nothing while redirecting
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                {/* Step indicator */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === 'people' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                }`}>
                  1
                </div>
                <div className={`flex-1 h-1 rounded ${
                  step === 'shares' ? 'bg-green-600' : 'bg-gray-300'
                }`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === 'shares' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'
                }`}>
                  2
                </div>
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className={step === 'people' ? 'text-blue-600 font-medium' : 'text-gray-500'}>
                  Add People
                </span>
                <span className={step === 'shares' ? 'text-blue-600 font-medium' : 'text-gray-500'}>
                  Assign Shares
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {step === 'people' && (
            <PeopleListForm onComplete={handlePeopleComplete} />
          )}
          
          {step === 'shares' && (
            <ShareAssignmentTable onComplete={handleSharesComplete} />
          )}
        </div>
      </div>
    </div>
  );
}
