import React from 'react';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';
import { Check, X, AlertTriangle, Info } from 'lucide-react';

export function ToastTest() {
  const handleToast = (type: string) => {
    console.log('Toast button clicked:', type);
    
    try {
      switch (type) {
        case 'success':
          toast.success('Success! This is a test toast notification.');
          break;
        case 'error':
          toast.error('Error! This is a test toast notification.');
          break;
        case 'warning':
          toast.warning('Warning! This is a test toast notification.');
          break;
        case 'info':
          toast.info('Info! This is a test toast notification.');
          break;
        default:
          toast('Default toast notification');
      }
      console.log('Toast function executed successfully');
    } catch (error) {
      console.error('Toast error:', error);
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Toast Test Component</h1>
      <div className="flex flex-wrap gap-4">
        <Button onClick={() => handleToast('success')} className="bg-green-600 hover:bg-green-700">
          <Check className="w-4 h-4 mr-2" />
          Success Toast
        </Button>
        <Button onClick={() => handleToast('error')} variant="destructive">
          <X className="w-4 h-4 mr-2" />
          Error Toast
        </Button>
        <Button onClick={() => handleToast('warning')} className="bg-yellow-600 hover:bg-yellow-700">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Warning Toast
        </Button>
        <Button onClick={() => handleToast('info')} className="bg-blue-600 hover:bg-blue-700">
          <Info className="w-4 h-4 mr-2" />
          Info Toast
        </Button>
        <Button onClick={() => handleToast('default')} variant="outline">
          Default Toast
        </Button>
      </div>
    </div>
  );
}