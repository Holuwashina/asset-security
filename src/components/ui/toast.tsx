"use client";

import React from 'react';
import { useToast } from '@/lib/hooks/useToast';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            min-w-80 max-w-md p-4 rounded-lg shadow-lg border flex items-start gap-3
            transition-all duration-300 ease-in-out
            ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : ''}
            ${toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : ''}
            ${toast.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : ''}
            ${toast.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' : ''}
          `}
        >
          <div className="flex-shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
            {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
            {toast.type === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-600" />}
            {toast.type === 'info' && <Info className="h-5 w-5 text-blue-600" />}
          </div>
          
          <div className="flex-1 text-sm font-medium">
            {toast.message}
          </div>
          
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 ml-2 hover:opacity-70 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;