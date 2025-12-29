
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center my-16 animate-fade-in">
        <div className="relative h-16 w-16">
            <div className="absolute top-0 left-0 h-full w-full border-4 border-gray-700 rounded-full"></div>
            <div className="absolute top-0 left-0 h-full w-full border-t-4 border-cyan-500 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-lg font-semibold text-gray-300">Performing Market Analysis...</p>
        <p className="text-sm text-gray-500">This may take a moment.</p>
    </div>
  );
};
