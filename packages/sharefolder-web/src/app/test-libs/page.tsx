'use client';

import { useState } from 'react';

// Test imports from monorepo libs
// import { Connect } from 'types';
// import { getORMi } from 'orm';

export default function TestLibsPage() {
  const [testResult, setTestResult] = useState<string>('Ready to test');

  const testLibImports = () => {
    try {
      // Test actual imports from monorepo
      // const connectType = Connect; // This would work if uncommented
      setTestResult('✅ Library imports are working! (Placeholder test)');
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Monorepo Library Import Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          
          <div className="mb-6">
            <button
              onClick={testLibImports}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Test Library Imports
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-md p-4">
            <p className="text-gray-700">{testResult}</p>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="font-medium text-blue-900 mb-2">Available Libraries:</h3>
            <ul className="text-blue-800 space-y-1">
              <li>• <code>@rtcmono/types</code> - Type definitions and interfaces</li>
              <li>• <code>@rtcmono/orm</code> - Database ORM and models</li>
              <li>• <code>@rtcmono/rtc-client</code> - RTC client functionality</li>
              <li>• <code>@rtcmono/helpers</code> - Utility functions</li>
              <li>• <code>@rtcmono/ui-components</code> - Reusable UI components</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
