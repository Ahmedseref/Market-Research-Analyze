
import React, { useState } from 'react';
import { AnalyzeIcon } from './Icons';

interface ProductInputFormProps {
  onAnalyze: (productDescription: string) => void;
  isLoading: boolean;
}

export const ProductInputForm: React.FC<ProductInputFormProps> = ({ onAnalyze, isLoading }) => {
  const [productDescription, setProductDescription] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productDescription.trim() && !isLoading) {
      onAnalyze(productDescription.trim());
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
      <form onSubmit={handleSubmit}>
        <label htmlFor="product-description" className="block text-sm font-medium text-gray-300 mb-2">
          Enter a product name or description
        </label>
        <textarea
          id="product-description"
          rows={3}
          className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow duration-200"
          placeholder="e.g., 'eco-friendly bamboo toothbrushes' or 'portable solar charger for smartphones'"
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !productDescription.trim()}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              <AnalyzeIcon className="h-5 w-5" />
              Analyze Market
            </>
          )}
        </button>
      </form>
    </div>
  );
};
