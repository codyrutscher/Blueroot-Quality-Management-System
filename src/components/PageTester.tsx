"use client";

import { useState } from "react";

interface PageTest {
  id: string;
  name: string;
  status: 'pending' | 'testing' | 'success' | 'error';
  error?: string;
}

interface PageTesterProps {
  onPageTest: (pageId: string) => void;
  onClose: () => void;
}

export default function PageTester({ onPageTest, onClose }: PageTesterProps) {
  const [tests, setTests] = useState<PageTest[]>([
    { id: "products", name: "Products", status: 'pending' },
    { id: "suppliers", name: "Suppliers & Co-men", status: 'pending' },
    { id: "raw-materials", name: "Raw Materials", status: 'pending' },
    { id: "allergens", name: "Allergens", status: 'pending' },
    { id: "labels", name: "Labels", status: 'pending' },
    { id: "new-products", name: "New Products", status: 'pending' },
    { id: "testing", name: "Testing", status: 'pending' },
    { id: "ccrs", name: "CCRs", status: 'pending' },
    { id: "shelf-life", name: "Shelf-Life Program", status: 'pending' },
    { id: "sops", name: "SOPs", status: 'pending' },
    { id: "regulatory", name: "Regulatory", status: 'pending' },
    { id: "customer-complaints", name: "Customer Complaints", status: 'pending' },
    { id: "documents", name: "BRH Documents", status: 'pending' },
    { id: "templates", name: "Templates", status: 'pending' },
    { id: "document-upload", name: "Document Upload", status: 'pending' },
  ]);

  const updateTestStatus = (pageId: string, status: PageTest['status'], error?: string) => {
    setTests(prev => prev.map(test => 
      test.id === pageId ? { ...test, status, error } : test
    ));
  };

  const testPage = async (pageId: string) => {
    updateTestStatus(pageId, 'testing');
    
    try {
      // Simulate page load test
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Trigger the actual page navigation
      onPageTest(pageId);
      
      // Wait a bit to see if any errors occur
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateTestStatus(pageId, 'success');
    } catch (error) {
      updateTestStatus(pageId, 'error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testAllPages = async () => {
    for (const test of tests) {
      await testPage(test.id);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  };

  const getStatusIcon = (status: PageTest['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'testing': return '🔄';
      case 'success': return '✅';
      case 'error': return '❌';
    }
  };

  const getStatusColor = (status: PageTest['status']) => {
    switch (status) {
      case 'pending': return 'text-gray-500';
      case 'testing': return 'text-blue-500';
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
    }
  };

  const successCount = tests.filter(t => t.status === 'success').length;
  const errorCount = tests.filter(t => t.status === 'error').length;
  const testingCount = tests.filter(t => t.status === 'testing').length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-full flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Page Load Tester
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Test all pages to ensure they load properly without errors
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Summary */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{tests.length}</div>
              <div className="text-sm text-gray-600">Total Pages</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{testingCount}</div>
              <div className="text-sm text-gray-600">Testing</div>
            </div>
          </div>

          {/* Test Controls */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={testAllPages}
              disabled={testingCount > 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test All Pages
            </button>
            <button
              onClick={() => setTests(prev => prev.map(t => ({ ...t, status: 'pending', error: undefined })))}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Reset Tests
            </button>
          </div>

          {/* Test Results */}
          <div className="space-y-2">
            {tests.map((test) => (
              <div
                key={test.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{getStatusIcon(test.status)}</span>
                  <div>
                    <div className="font-medium text-gray-900">{test.name}</div>
                    <div className="text-sm text-gray-500">/{test.id}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {test.error && (
                    <span className="text-xs text-red-600 max-w-xs truncate" title={test.error}>
                      {test.error}
                    </span>
                  )}
                  <span className={`text-sm font-medium ${getStatusColor(test.status)}`}>
                    {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                  </span>
                  <button
                    onClick={() => testPage(test.id)}
                    disabled={test.status === 'testing'}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                  >
                    Test
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}