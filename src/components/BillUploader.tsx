'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useBillStore } from '@/store/billStore';
import { ExtractedItem, OcrResponse } from '@/types';
// Make sure EditableItemsTable.tsx exists in the same folder, or update the path if it's elsewhere
import EditableItemsTable from './EditableItemsTable';

interface BillUploaderProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function BillUploader({ onSuccess, onError }: BillUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ocrResults, setOcrResults] = useState<OcrResponse | null>(null);
  const [editableItems, setEditableItems] = useState<ExtractedItem[]>([]);

  // Debug logging for state changes
  useEffect(() => {
    console.log('State updated - ocrResults:', !!ocrResults, 'editableItems.length:', editableItems.length);
  }, [ocrResults, editableItems]);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { setItems } = useBillStore();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        setError('');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        setError('');
        // Clear any previous results
        setOcrResults(null);
        setEditableItems([]);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Only image files (JPG, PNG) are allowed');
      return false;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return false;
    }

    return true;
  };

  const processFile = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError('');
    setOcrResults(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      console.log('Processing image with Gemini Vision API...');
      
      const response = await fetch('/api/gemini', { 
        method: 'POST', 
        body: formData 
      });

      const result = await response.json();

      if (result.success) {
        console.log('Processing successful, result.data:', result.data);
        setOcrResults(result.data);
        
        // Convert OcrItems to ExtractedItems for editing
        const extractedItems: ExtractedItem[] = result.data.items.map((item: any) => ({
          item_name: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice
        }));
        console.log('Setting editable items:', extractedItems);
        setEditableItems(extractedItems);
        
        console.log('State after setting - ocrResults should exist, editableItems length:', extractedItems.length);
        
        // Don't call onSuccess here - wait for user to confirm items
        
        // Show notice about which method was used
        if (result.data.mode === 'mock' || result.data.mode === 'mock-fallback') {
          console.info('Using mock data. Configure GOOGLE_AI_API_KEY in .env.local to use Gemini Vision API.');
        } else {
          console.info('Successfully processed image with Gemini Vision API.');
        }
      } else {
        setError(result.error || 'Failed to process image');
        onError?.(result.error || 'Failed to process image');
      }
    } catch (err) {
      const errorMessage = 'Network error occurred while processing image';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetUploader = () => {
    setSelectedFile(null);
    setOcrResults(null);
    setEditableItems([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleItemsChange = (items: ExtractedItem[]) => {
    setEditableItems(items);
  };

  const handleConfirmItems = () => {
    setItems(editableItems);
    onSuccess?.();
  };

  const calculateUpdatedTotal = () => {
    return editableItems.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
  };

  const handleClick = () => {
    // Don't allow file selection if already processing or if results are showing
    if (loading || ocrResults) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Bill</h1>
        <p className="text-gray-600">Upload an image of your restaurant bill to get started</p>
      </div>

      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          loading || ocrResults 
            ? 'cursor-default' 
            : 'cursor-pointer'
        } ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : selectedFile
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileSelect}
        />
        
        {!selectedFile ? (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-900">
                Drop your bill image here
              </p>
              <p className="text-lg text-blue-600 mt-2">
                or click to browse files
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supports: JPG, PNG (max 10MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Click here to select a different file
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-600 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {selectedFile && !ocrResults && (
        <div className="flex justify-center space-x-4">
          <button
            onClick={resetUploader}
            disabled={loading}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={processFile}
            disabled={loading}
            className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <span>Process Bill</span>
            )}
          </button>
        </div>
      )}

      {/* OCR Results */}
      {ocrResults && editableItems.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Extracted Items
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Edit the items below, then confirm to proceed.
              </p>
            </div>
            <button
              onClick={resetUploader}
              className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1.5 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors duration-200"
            >
              Upload Another Bill
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">File:</p>
                <p className="font-medium text-gray-900">{ocrResults.fileName}</p>
              </div>
              <div>
                <p className="text-gray-600">Processed:</p>
                <p className="font-medium text-gray-900">
                  {new Date(ocrResults.processedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Original Total:</p>
                <p className="font-medium text-gray-900">₹{ocrResults.totalAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600">Current Total:</p>
                <p className="font-semibold text-green-600">₹{calculateUpdatedTotal().toFixed(2)}</p>
              </div>
            </div>
          </div>

          <EditableItemsTable
            items={editableItems}
            onChange={handleItemsChange}
            className="shadow-sm"
          />

          {ocrResults.mode === 'mock' || ocrResults.mode === 'mock-fallback' ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-blue-800">
                  <strong>Demo Mode:</strong> Using mock data. Configure GOOGLE_AI_API_KEY in .env.local to use Gemini Vision API.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-green-800">
                  <strong>Gemini Vision:</strong> Successfully processed using Google's Gemini Vision API.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={handleConfirmItems}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
            >
              Confirm Items & Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
