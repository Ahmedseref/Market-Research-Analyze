
import React, { useState } from 'react';
import { ProductInputForm } from './components/ProductInputForm';
import { AnalysisReport } from './components/AnalysisReport';
import { LoadingSpinner } from './components/LoadingSpinner';
import { analyzeProduct } from './services/geminiService';
import type { AnalysisReportData, Source } from './types';
import { LogoIcon, AlertCircleIcon } from './components/Icons';

const App: React.FC = () => {
  const [report, setReport] = useState<AnalysisReportData | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (productDescription: string) => {
    setIsLoading(true);
    setError(null);
    setReport(null);
    setSources([]);

    try {
      const { reportData, sources: reportSources } = await analyzeProduct(productDescription);
      setReport(reportData);
      setSources(reportSources);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <LogoIcon className="h-12 w-12 text-cyan-400"/>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
              Market Research Analyzer
            </h1>
          </div>
          <p className="text-lg text-gray-400">
            Get AI-powered insights into product demand, pricing, and target customers.
          </p>
        </header>

        <main>
          <ProductInputForm onAnalyze={handleAnalyze} isLoading={isLoading} />

          {error && (
            <div className="mt-8 bg-red-900/20 border-l-4 border-red-500 text-red-100 px-6 py-4 rounded-r-lg shadow-xl animate-fade-in flex items-start gap-4">
              <AlertCircleIcon className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-lg mb-1">Analysis Failed</p>
                <p className="text-red-300/90 leading-relaxed">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="mt-3 text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
          
          {isLoading && <LoadingSpinner />}

          {report && !isLoading && (
            <div className="mt-12 animate-fade-in">
              <h2 className="text-3xl font-bold text-center mb-8 text-white">
                Analysis for: <span className="text-cyan-400">{report.productName}</span>
              </h2>
              <AnalysisReport report={report} sources={sources} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
