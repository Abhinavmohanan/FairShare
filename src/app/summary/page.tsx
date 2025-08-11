'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SummaryView from '@/components/SummaryView';
import { useBillStore } from '@/store/billStore';

export default function SummaryPage() {
  const router = useRouter();
  const { items, people, reset } = useBillStore();

  // Redirect if no data
  useEffect(() => {
    if (items.length === 0 || people.length === 0) {
      router.push('/');
    }
  }, [items.length, people.length, router]);

  const handleReset = () => {
    reset();
    router.push('/');
  };

  const handleBack = () => {
    router.push('/assign');
  };

  // Show loading or nothing while redirecting
  if (items.length === 0 || people.length === 0) {
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
              Back to Assign
            </button>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                {/* Step indicator */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-green-600 text-white">
                  1
                </div>
                <div className="flex-1 h-1 rounded bg-green-600"></div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-green-600 text-white">
                  2
                </div>
                <div className="flex-1 h-1 rounded bg-green-600"></div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-blue-600 text-white">
                  3
                </div>
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-green-600 font-medium">Add People</span>
                <span className="text-green-600 font-medium">Assign Shares</span>
                <span className="text-blue-600 font-medium">Summary</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <SummaryView onReset={handleReset} />
        </div>
      </div>
    </div>
  );
}
