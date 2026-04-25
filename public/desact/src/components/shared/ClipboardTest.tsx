import React, { useState } from 'react';
import { Button } from '../ui/button';
import { createCopyHandler, copyToClipboard, promptManualCopy } from './copyUtils';

/**
 * Test component for clipboard functionality
 * This can be used to debug clipboard issues in different environments
 */
export const ClipboardTest: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);
  
  const handleCopyCode = createCopyHandler(setCopiedCode);
  
  const testCode = `import React from 'react';
import { Button } from './ui/button';

export const TestComponent = () => {
  return (
    <div className="p-4">
      <Button>Click me</Button>
    </div>
  );
};`;

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testDirectCopy = async () => {
    try {
      const success = await copyToClipboard(testCode);
      addTestResult(`Direct copy: ${success ? 'SUCCESS' : 'FAILED'}`);
    } catch (err) {
      addTestResult(`Direct copy: ERROR - ${err.message}`);
    }
  };

  const testHandlerCopy = () => {
    try {
      handleCopyCode(testCode, 'test-handler');
      addTestResult('Handler copy: EXECUTED (check if modal appeared)');
    } catch (err) {
      addTestResult(`Handler copy: ERROR - ${err.message}`);
    }
  };

  const testManualCopy = () => {
    try {
      promptManualCopy(testCode);
      addTestResult('Manual copy: MODAL SHOWN');
    } catch (err) {
      addTestResult(`Manual copy: ERROR - ${err.message}`);
    }
  };

  return (
    <div className="p-6 bg-white border border-brown-200 rounded-lg shadow-sm max-w-2xl">
      <h3 className="text-lg font-semibold mb-4 text-brown-900">Clipboard Test Panel</h3>
      
      <div className="space-y-3 mb-6">
        <Button 
          onClick={testDirectCopy}
          className="w-full justify-start bg-blue-600 hover:bg-blue-700"
        >
          Test Direct Copy (copyToClipboard)
        </Button>
        
        <Button 
          onClick={testHandlerCopy}
          className="w-full justify-start bg-green-600 hover:bg-green-700"
        >
          Test Handler Copy (createCopyHandler)
        </Button>
        
        <Button 
          onClick={testManualCopy}
          className="w-full justify-start bg-orange-600 hover:bg-orange-700"
        >
          Test Manual Copy Modal
        </Button>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2 text-brown-700">Test Results:</h4>
        <div className="bg-gray-50 border rounded p-3 min-h-[100px] font-mono text-xs">
          {testResults.length === 0 ? (
            <div className="text-gray-500">No tests run yet...</div>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="mb-1">
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2 text-brown-700">Copy Status:</h4>
        <div className="text-sm">
          {copiedCode === 'test-handler' ? (
            <span className="text-green-600 font-medium">✓ Copy successful!</span>
          ) : (
            <span className="text-gray-500">No recent copy</span>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-600">
        <p className="mb-2"><strong>How to use:</strong></p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Test each method to see which works in your environment</li>
          <li>If direct copy fails, the handler should show manual copy modal</li>
          <li>Check browser console for detailed error messages</li>
          <li>Try in different browsers and security contexts</li>
        </ul>
      </div>
    </div>
  );
};