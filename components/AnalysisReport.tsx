
import React, { useState, useMemo } from 'react';
import type { AnalysisReportData, Source, ChartDataItem, MarketNeed, PriceAnalysis, Competitor } from '../types';
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
  XCircleIcon,
  MailIcon,
  AlertCircleIcon,
  // Fix: Import AnalyzeIcon which was missing and causing a compilation error
  AnalyzeIcon
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
        let colorClass = 'bg-gray-500';
        const score = item.score || 0;
        if (score > 75) colorClass = 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
        else if (score > 40) colorClass = 'bg-cyan-500';
        else colorClass = 'bg-indigo-500';
        
        return {
            label: item.region,
            value: score,
            displayValue: `${item.interestLevel} (${score}/100)`,
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

const CompetitorCard: React.FC<{ comp: Competitor }> = ({ comp }) => (
  <div className="overflow-hidden bg-gray-900/60 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-all duration-300 shadow-xl group">
    {/* Header Section */}
    <div className="bg-gray-800/80 px-6 py-4 border-b border-gray-700 flex flex-wrap justify-between items-center gap-2">
      <div>
        <h4 className="font-bold text-xl text-white tracking-tight group-hover:text-cyan-400 transition-colors">{comp.name}</h4>
        {comp.location && (
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
            <GlobeIcon className="h-3 w-3" /> {comp.location}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        {comp.mapUri && (
          <a href={comp.mapUri} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-blue-900/30 text-blue-400 px-2 py-1 rounded border border-blue-800/50 font-bold hover:bg-blue-800/50 transition-colors flex items-center gap-1">
            VIEW MAP
          </a>
        )}
      </div>
    </div>

    {/* Details Row: Website, Email, and Revenue */}
    <div className="px-6 py-3 bg-gray-800/40 border-b border-gray-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-[11px]">
        {comp.website && (
          <div className="flex items-center gap-2">
            <LinkIcon className="h-3 w-3 text-cyan-500" />
            <span className="text-cyan-500 font-bold uppercase tracking-widest text-[9px]">Web:</span>
            <a href={comp.website.startsWith('http') ? comp.website : `https://${comp.website}`} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-cyan-400 truncate">
              {comp.website.replace(/(^\w+:|^)\/\//, '')}
            </a>
          </div>
        )}
        {comp.email && (
          <div className="flex items-center gap-2">
            <MailIcon className="h-3 w-3 text-cyan-500" />
            <span className="text-cyan-500 font-bold uppercase tracking-widest text-[9px]">Email:</span>
            <span className="text-gray-300 truncate">{comp.email}</span>
          </div>
        )}
        {comp.revenueUSD && (
          <div className="flex items-center gap-2">
            <DollarSignIcon className="h-3 w-3 text-green-500" />
            <span className="text-green-500 font-bold uppercase tracking-widest text-[9px]">Revenue:</span>
            <span className="text-green-400 font-mono font-bold">{comp.revenueUSD}</span>
          </div>
        )}
        {comp.employeeCount && (
          <div className="flex items-center gap-2">
            <UsersIcon className="h-3 w-3 text-blue-400" />
            <span className="text-blue-400 font-bold uppercase tracking-widest text-[9px]">Size:</span>
            <span className="text-gray-300">{comp.employeeCount} employees</span>
          </div>
        )}
    </div>

    {/* Social Links Row */}
    {comp.socialLinks && comp.socialLinks.length > 0 && (
      <div className="px-6 py-2 bg-gray-900/40 border-b border-gray-700 flex flex-wrap gap-4">
        {comp.socialLinks.map((social, idx) => (
          <a 
            key={idx} 
            href={social.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[9px] font-bold text-gray-500 hover:text-cyan-400 transition-colors uppercase tracking-widest"
          >
            <LinkIcon className="h-3 w-3" />
            {social.platform}
          </a>
        ))}
      </div>
    )}
    
    {/* Grid Content: Strengths and Weaknesses */}
    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-700 border-b border-gray-700">
      <div className="p-5 bg-green-950/5">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircleIcon className="h-4 w-4 text-green-500" />
          <h5 className="font-bold text-xs uppercase tracking-widest text-green-400">Key Strengths</h5>
        </div>
        <ul className="space-y-2">
          {comp.strengths.map((str, i) => (
            <li key={i} className="text-sm text-gray-300 flex items-start gap-2 leading-tight">
              <span className="text-green-500/60 mt-1">•</span>
              <span>{str}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-5 bg-red-950/5">
        <div className="flex items-center gap-2 mb-3">
          <XCircleIcon className="h-4 w-4 text-red-500" />
          <h5 className="font-bold text-xs uppercase tracking-widest text-red-400">Identified Gaps</h5>
        </div>
        <ul className="space-y-2">
          {comp.weaknesses.map((weak, i) => (
            <li key={i} className="text-sm text-gray-300 flex items-start gap-2 leading-tight">
              <span className="text-red-500/60 mt-1">•</span>
              <span>{weak}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>

    {/* Footer: Tags and Map */}
    <div className="p-4 bg-gray-800/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex flex-wrap gap-1.5">
        {comp.tags && comp.tags.length > 0 ? comp.tags.map((tag, i) => (
          <a 
            key={i} 
            href={`https://www.google.com/maps/search/${encodeURIComponent(tag)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-700 uppercase tracking-tighter hover:border-cyan-500/50 hover:text-cyan-400 hover:bg-gray-700 transition-all flex items-center gap-1 group/tag"
          >
            <GlobeIcon className="h-2 w-2 opacity-0 group-hover/tag:opacity-100 transition-opacity" />
            {tag}
          </a>
        )) : (
          <span className="text-[9px] text-gray-500 italic">No category tags</span>
        )}
      </div>
    </div>

    {/* Map Thumbnail Overlay */}
    {comp.mapUri && (
      <div className="h-24 w-full bg-gray-800 border-t border-gray-700 overflow-hidden relative group-hover:h-32 transition-all duration-500">
         <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent z-10 pointer-events-none" />
         <div className="w-full h-full flex flex-col items-center justify-center bg-[url('https://www.google.com/maps/vt/pb=!1m4!1m3!1i12!2i2048!3i1365!2m3!1e0!2sm!3i420120488!3m8!2sen!3sus!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m1!5f2')] bg-cover opacity-20 group-hover:opacity-40 transition-opacity grayscale hover:grayscale-0">
            <GlobeIcon className="h-6 w-6 text-cyan-400 mb-1 animate-pulse" />
            <a href={comp.mapUri} target="_blank" rel="noopener noreferrer" className="text-[9px] text-cyan-400 font-bold hover:underline z-20 uppercase tracking-widest">
              Open Company Location
            </a>
         </div>
      </div>
    )}
  </div>
);

export const AnalysisReport: React.FC<AnalysisReportProps> = ({ report, sources }) => {
  const [activeTab, setActiveTab] = useState<'market' | 'competitors' | 'commercial' | 'sources'>('market');
  const [competitorFilter, setCompetitorFilter] = useState('');
  
  const marketNeedChartData = prepareMarketNeedChartData(report.marketNeed);
  const priceAnalysisChartData = preparePriceAnalysisChartData(report.priceAnalysis);

  const filteredCompetitors = useMemo(() => {
    if (!competitorFilter.trim()) return report.competitorAnalysis.keyCompetitors;
    
    // Split the filter into individual keywords (space or comma separated)
    const keywords = competitorFilter
        .toLowerCase()
        .split(/[ ,]+/)
        .filter(k => k.length > 0);

    if (keywords.length === 0) return report.competitorAnalysis.keyCompetitors;

    return report.competitorAnalysis.keyCompetitors.filter(comp => {
      // For a competitor to match, it must satisfy ALL keywords
      return keywords.every(keyword => {
        const inName = comp.name.toLowerCase().includes(keyword);
        const inTags = comp.tags?.some(tag => tag.toLowerCase().includes(keyword));
        const inLocation = comp.location?.toLowerCase().includes(keyword);
        return inName || inTags || inLocation;
      });
    });
  }, [report.competitorAnalysis.keyCompetitors, competitorFilter]);

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex justify-center border-b border-gray-700/50 sticky top-0 bg-gray-900 z-50 pt-2 shadow-xl">
        <nav className="flex space-x-2 md:space-x-8 overflow-x-auto no-scrollbar pb-2 px-4" aria-label="Tabs">
          {[
            { id: 'market', label: 'Market Overview' },
            { id: 'competitors', label: 'Competitors' },
            { id: 'commercial', label: 'Commercials' },
            { id: 'sources', label: 'Sources' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                py-4 px-1 border-b-2 font-bold text-[9px] md:text-sm transition-all duration-200 uppercase tracking-widest whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'border-cyan-500 text-cyan-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="transition-all duration-300 min-h-[400px]">
        {activeTab === 'market' && (
          <div className="space-y-12 animate-fade-in">
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
            
            <ReportCard title="Market Need & Regional Interest" icon={<GlobeIcon />}>
              <div className="pt-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {report.marketNeed.map((need, idx) => (
                    <div key={idx} className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 flex flex-col items-center justify-between text-center group hover:border-cyan-500 transition-colors">
                      <div className="mb-2">
                        <span className="text-[10px] uppercase tracking-widest text-cyan-500 font-bold">{need.region}</span>
                        <h4 className="text-lg font-bold text-white mt-1 group-hover:text-cyan-400 transition-colors">{need.interestLevel}</h4>
                      </div>
                      <div className="w-full bg-gray-800 h-2 rounded-full mt-4 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${need.score > 75 ? 'bg-emerald-500' : need.score > 40 ? 'bg-cyan-500' : 'bg-indigo-500'}`}
                          style={{ width: `${need.score}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-4 leading-relaxed line-clamp-3">{need.notes}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/50">
                  <h5 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4">Saturation Heatmap Data</h5>
                  <SimpleBarChart data={marketNeedChartData} />
                </div>
              </div>
            </ReportCard>
          </div>
        )}

        {activeTab === 'competitors' && (
          <div className="space-y-10 animate-fade-in">
            {/* Header and Filter */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gray-800/40 p-6 rounded-2xl border border-gray-700">
              <div className="flex items-start gap-4">
                <ShieldIcon className="h-8 w-8 text-cyan-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-xl text-white mb-1">Competitive Landscape</h4>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
                    {report.competitorAnalysis.competitiveLandscape}
                  </p>
                </div>
              </div>
              
              <div className="flex-shrink-0 min-w-[320px]">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search multiple (e.g. 'Software, USA')..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 pl-10 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-200 placeholder-gray-500"
                    value={competitorFilter}
                    onChange={(e) => setCompetitorFilter(e.target.value)}
                  />
                  <AnalyzeIcon className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
                  {competitorFilter && (
                    <button 
                      onClick={() => setCompetitorFilter('')}
                      className="absolute right-3 top-3.5 text-gray-500 hover:text-white"
                    >
                      <XCircleIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="mt-2 text-[10px] text-gray-500 flex justify-between px-1">
                  <span>Found {filteredCompetitors.length} matching entities</span>
                  {competitorFilter && <span className="text-cyan-600 font-bold">Multi-filter Active</span>}
                </div>
              </div>
            </div>

            {/* Competitor Cards */}
            {filteredCompetitors.length > 0 ? (
              <div className="grid grid-cols-1 gap-8">
                {filteredCompetitors.map((comp, idx) => (
                  <CompetitorCard key={idx} comp={comp} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-900/40 border border-dashed border-gray-700 rounded-2xl">
                <AlertCircleIcon className="h-10 w-10 text-gray-600 mx-auto mb-4" />
                <h5 className="text-gray-400 font-bold mb-1 uppercase tracking-widest text-xs">No competitors match your criteria</h5>
                <button 
                  onClick={() => setCompetitorFilter('')}
                  className="text-cyan-500 text-sm hover:underline font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'commercial' && (
          <div className="space-y-8 animate-fade-in">
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
          </div>
        )}
      </div>
    </div>
  );
};
