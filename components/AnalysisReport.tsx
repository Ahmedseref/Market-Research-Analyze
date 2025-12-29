
import React, { useState } from 'react';
import type { AnalysisReportData, Source, ChartDataItem, MarketNeed, PriceAnalysis } from '../types';
import { ReportCard } from './ReportCard';
import { SimpleBarChart } from './SimpleBarChart';
import { 
  GlobeIcon, 
  DollarSignIcon, 
  TargetIcon, 
  LightbulbIcon, 
  TrendUpIcon, 
  LinkIcon, 
  ShieldIcon, 
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon 
} from './Icons';

interface AnalysisReportProps {
  report: AnalysisReportData;
  sources: Source[];
}

const getDemandColor = (level: string) => {
    switch (level?.toLowerCase()) {
        case 'high': return 'text-green-400';
        case 'medium': return 'text-yellow-400';
        case 'low': return 'text-red-400';
        default: return 'text-gray-400';
    }
};

const prepareMarketNeedChartData = (data: MarketNeed[]): ChartDataItem[] => {
    return data.map(item => {
        let value = 33;
        let colorClass = 'bg-red-500';
        if (item.interestLevel.toLowerCase().includes('increasing')) {
            value = 100;
            colorClass = 'bg-green-500';
        } else if (item.interestLevel.toLowerCase().includes('stable')) {
            value = 66;
            colorClass = 'bg-yellow-500';
        }
        return {
            label: item.region,
            value: value,
            displayValue: item.interestLevel,
            colorClass: colorClass,
            tooltip: item.notes,
        };
    });
};

const parsePrice = (priceRange: string): number => {
    const numbers = priceRange.match(/\d+(\.\d+)?/g);
    if (!numbers) return 0;
    const numericValues = numbers.map(parseFloat);
    if (numericValues.length === 0) return 0;
    return numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
};

const preparePriceAnalysisChartData = (data: PriceAnalysis[]): ChartDataItem[] => {
    const prices = data.map(item => ({ ...item, avgPrice: parsePrice(item.averagePriceRange) }));
    const maxPrice = Math.max(...prices.map(p => p.avgPrice), 0);
    
    if (maxPrice === 0) {
      return data.map(item => ({
        label: item.region,
        value: 0,
        displayValue: item.averagePriceRange,
        colorClass: 'bg-cyan-500',
      }));
    }

    return prices.map(item => ({
        label: item.region,
        value: (item.avgPrice / maxPrice) * 100,
        displayValue: item.averagePriceRange,
        colorClass: 'bg-cyan-500',
    }));
};

export const AnalysisReport: React.FC<AnalysisReportProps> = ({ report, sources }) => {
  const [activeTab, setActiveTab] = useState<'market' | 'commercial' | 'sources'>('market');
  
  const marketNeedChartData = prepareMarketNeedChartData(report.marketNeed);
  const priceAnalysisChartData = preparePriceAnalysisChartData(report.priceAnalysis);

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex justify-center border-b border-gray-700/50">
        <nav className="flex space-x-4 md:space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('market')}
            className={`
              py-4 px-1 border-b-2 font-bold text-[10px] md:text-sm transition-all duration-200 uppercase tracking-widest
              ${activeTab === 'market' 
                ? 'border-cyan-500 text-cyan-400' 
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'}
            `}
          >
            Market Overview
          </button>
          <button
            onClick={() => setActiveTab('commercial')}
            className={`
              py-4 px-1 border-b-2 font-bold text-[10px] md:text-sm transition-all duration-200 uppercase tracking-widest
              ${activeTab === 'commercial' 
                ? 'border-cyan-500 text-cyan-400' 
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'}
            `}
          >
            Pricing & Customers
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`
              py-4 px-1 border-b-2 font-bold text-[10px] md:text-sm transition-all duration-200 uppercase tracking-widest
              ${activeTab === 'sources' 
                ? 'border-cyan-500 text-cyan-400' 
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'}
            `}
          >
            Research Sources
          </button>
        </nav>
      </div>

      <div className="animate-fade-in transition-all duration-300 min-h-[400px]">
        {activeTab === 'market' && (
          <div className="space-y-12">
            {/* Overview Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ReportCard title="Overall Demand Level" icon={<TrendUpIcon />}>
                  <div className="text-center py-2">
                      <p className={`text-5xl font-extrabold ${getDemandColor(report.demandLevel.level)} mb-2`}>
                          {report.demandLevel.level}
                      </p>
                      <div className="bg-gray-900/40 p-3 rounded-lg border border-gray-700/50">
                        <p className="text-gray-300 text-sm italic leading-relaxed">{report.demandLevel.justification}</p>
                      </div>
                  </div>
              </ReportCard>
              <ReportCard title="Strategic Summary" icon={<LightbulbIcon />}>
                  <div className="space-y-4 text-sm">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-widest text-cyan-500 font-bold">Recommended Region</span>
                        <span className="text-white text-base font-medium">{report.strategicSummary.bestRegion}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-widest text-cyan-500 font-bold">High-Value Segment</span>
                        <span className="text-white text-base font-medium">{report.strategicSummary.mostProfitableCustomer}</span>
                      </div>
                      <div className="flex flex-col gap-1 pt-2 border-t border-gray-700/50">
                        <span className="text-[10px] uppercase tracking-widest text-cyan-500 font-bold">Execution Strategy</span>
                        <p className="text-gray-300 leading-relaxed">{report.strategicSummary.recommendedStrategy}</p>
                      </div>
                  </div>
              </ReportCard>
            </div>

            {/* Market Geography Section */}
            <ReportCard title="Market Need & Regional Interest" icon={<GlobeIcon />}>
              <div className="pt-2">
                <SimpleBarChart data={marketNeedChartData} />
              </div>
            </ReportCard>
            
            {/* Competitor Analysis */}
            {report.competitorAnalysis && (
              <ReportCard title="Competitor Analysis" icon={<ShieldIcon />}>
                <div className="space-y-8">
                  <div className="flex items-start gap-4 bg-cyan-950/20 p-5 rounded-xl border border-cyan-800/30">
                      <UsersIcon className="h-6 w-6 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-200 text-sm leading-relaxed">
                        <span className="font-bold text-cyan-400 block mb-1">Landscape Overview</span>
                        {report.competitorAnalysis.competitiveLandscape}
                      </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {report.competitorAnalysis.keyCompetitors.map((competitor, index) => (
                      <div key={index} className="overflow-hidden bg-gray-900/60 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-colors duration-300 shadow-xl">
                        <div className="bg-gray-800/80 px-5 py-3 border-b border-gray-700 flex justify-between items-center">
                          <h4 className="font-bold text-lg text-white tracking-tight">{competitor.name}</h4>
                          <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-1 rounded uppercase font-bold">Key Player</span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-700">
                          <div className="p-5 bg-green-950/5">
                            <div className="flex items-center gap-2 mb-3">
                              <CheckCircleIcon className="h-4 w-4 text-green-500" />
                              <h5 className="font-bold text-xs uppercase tracking-widest text-green-400">Strengths</h5>
                            </div>
                            <ul className="space-y-2">
                              {competitor.strengths.map((strength, sIndex) => (
                                <li key={sIndex} className="text-sm text-gray-300 flex items-start gap-2">
                                  <span className="text-green-500/60 mt-1">•</span>
                                  <span>{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-5 bg-red-950/5">
                            <div className="flex items-center gap-2 mb-3">
                              <XCircleIcon className="h-4 w-4 text-red-500" />
                              <h5 className="font-bold text-xs uppercase tracking-widest text-red-400">Weaknesses</h5>
                            </div>
                            <ul className="space-y-2">
                              {competitor.weaknesses.map((weakness, wIndex) => (
                                <li key={wIndex} className="text-sm text-gray-300 flex items-start gap-2">
                                  <span className="text-red-500/60 mt-1">•</span>
                                  <span>{weakness}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ReportCard>
            )}
          </div>
        )}

        {activeTab === 'commercial' && (
          <div className="space-y-8 animate-fade-in">
            {/* Pricing and Customers Tab Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ReportCard title="Pricing Analysis" icon={<DollarSignIcon />}>
                  <div className="pt-2">
                      <SimpleBarChart data={priceAnalysisChartData} />
                  </div>
              </ReportCard>

              <ReportCard title="Target Customer Segments" icon={<TargetIcon />}>
                  <div className="space-y-4">
                    {report.targetCustomers.map((item, index) => (
                        <div key={index} className="p-4 bg-gray-900/40 rounded-xl border border-gray-700/50 hover:bg-gray-900/60 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <strong className="font-bold text-white text-sm">{item.segment}</strong>
                              <span className="text-[10px] font-bold text-cyan-400 border border-cyan-400/30 px-2 py-0.5 rounded-full uppercase">Priority</span>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">{item.attractiveness}</p>
                        </div>
                    ))}
                  </div>
              </ReportCard>
            </div>
            
            <div className="p-6 bg-cyan-950/10 border border-cyan-800/20 rounded-2xl">
              <h4 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
                <LightbulbIcon className="h-5 w-5" />
                Pricing Strategy Recommendation
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed italic">
                Based on current market trends, a {report.strategicSummary.recommendedStrategy.toLowerCase().includes('premium') ? 'Value-Based Premium' : 'Competitive Penetration'} pricing model is recommended for {report.strategicSummary.bestRegion}.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'sources' && (
          <div className="animate-fade-in space-y-6">
            <ReportCard title="Research Data Sources" icon={<LinkIcon />}>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                The analysis provided in this report is grounded in the following live web data and market research sources.
              </p>
              {sources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sources.map((source, index) => (
                        <a 
                          key={index} 
                          href={source.uri} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="group flex items-center gap-3 p-3 bg-gray-900/40 rounded-lg border border-gray-700/50 hover:border-cyan-500/50 hover:bg-gray-900/80 transition-all duration-200 overflow-hidden"
                        >
                            <div className="flex-shrink-0 bg-gray-800 p-2 rounded group-hover:bg-cyan-950 transition-colors">
                              <LinkIcon className="h-4 w-4 text-cyan-400" />
                            </div>
                            <span className="text-xs text-gray-300 group-hover:text-cyan-400 truncate transition-colors font-medium">
                                {source.title || source.uri}
                            </span>
                        </a>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-900/40 rounded-xl border border-dashed border-gray-700">
                  <p className="text-gray-500 italic">No specific external links were recorded for this analysis session.</p>
                </div>
              )}
            </ReportCard>

            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Research Methodology</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                This report utilizes Google Search Grounding through the Gemini 3 Pro model to access real-time market signals, competitor announcements, and regional demand trends. Data is cross-referenced across multiple categories to provide a holistic strategic overview.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
