import React from 'react';
import { AlertTriangle, Info, Shield } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from './components/ui/alert';
import { Button } from './components/ui/button';

const SecurityAlertExample = () => {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold mb-4">Corrected Security Alert - Smaller Text Size</h2>
      
      {/* Security Alert with Corrected Smaller Text Sizes */}
      <Alert variant="destructive" className="space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 mt-0.5" />
          <div className="flex-1 space-y-4">
            <AlertTitle className="text-lg">Security Alert</AlertTitle>
            <AlertDescription>
              Multiple failed login attempts detected for your account.
            </AlertDescription>
            
            <div className="bg-red-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <h4 className="text-sm font-semibold text-red-900">Suspicious Activity Detected</h4>
              </div>
              
              {/* FIXED: Changed from text-sm to text-xs and reduced spacing */}
              <div className="space-y-1 text-xs">
                <div><span className="font-semibold text-red-900">Time:</span> <span className="text-red-800">Today at 2:45 PM</span></div>
                <div><span className="font-semibold text-red-900">Location:</span> <span className="text-red-800">Unknown location (IP: 192.168.1.***)</span></div>
                <div><span className="font-semibold text-red-900">Attempts:</span> <span className="text-red-800">5 failed login attempts</span></div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">Recommended:</p>
                  <p className="text-blue-800 text-sm">Change your password and enable two-factor authentication.</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                Dismiss
              </Button>
              <Button size="sm" className="bg-brown-600 hover:bg-brown-700 text-white">
                <Shield className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </Alert>

      {/* Show the Fix Applied */}
      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-semibold text-green-900 mb-2">✅ Text Size Fix Applied</h3>
        <div className="text-sm text-green-800 space-y-1">
          <p><strong>Before:</strong> <code>space-y-2 text-sm</code> (16px text with 8px spacing)</p>
          <p><strong>After:</strong> <code>space-y-1 text-xs</code> (12px text with 4px spacing)</p>
          <p><strong>Header:</strong> Added <code>text-sm</code> to "Suspicious Activity Detected" heading</p>
          <p><strong>Recommended text:</strong> Already properly sized with <code>text-sm</code></p>
        </div>
      </div>

      {/* Code Example */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-semibold mb-2">Code Changes Required:</h3>
        <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
{`// In your AlertsPage.tsx, find this section and make these changes:

// BEFORE (too large):
<div className="space-y-2 text-sm">
  <h4 className="font-semibold text-red-900">Suspicious Activity Detected</h4>
  <div><span className="font-semibold text-red-900">Time:</span> ...</div>
  ...
</div>

// AFTER (correct size):
<div className="space-y-3">
  <h4 className="text-sm font-semibold text-red-900">Suspicious Activity Detected</h4>
  <div className="space-y-1 text-xs">
    <div><span className="font-semibold text-red-900">Time:</span> ...</div>
    <div><span className="font-semibold text-red-900">Location:</span> ...</div>
    <div><span className="font-semibold text-red-900">Attempts:</span> ...</div>
  </div>
</div>`}
        </pre>
      </div>
    </div>
  );
};

export default SecurityAlertExample;