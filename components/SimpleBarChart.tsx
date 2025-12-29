
import React from 'react';
import type { ChartDataItem } from '../types';

interface SimpleBarChartProps {
  data: ChartDataItem[];
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-gray-500 text-center py-4">No data available for chart.</p>;
  }

  return (
    <div className="space-y-5">
      {data.map((item, index) => (
        <div key={index} className="group relative z-10 hover:z-20">
          <div className="flex justify-between items-center mb-1.5 text-sm">
            <span className="font-semibold text-gray-100 truncate pr-2 group-hover:text-cyan-400 transition-colors duration-200">
              {item.label}
            </span>
            <span className="font-mono text-gray-400 group-hover:text-gray-200 transition-colors duration-200">
              {item.displayValue}
            </span>
          </div>
          
          <div className="w-full bg-gray-700/50 rounded-full h-4 overflow-visible relative cursor-default">
            {/* The actual progress bar */}
            <div
              className={`h-4 rounded-full transition-all duration-1000 ease-out transform group-hover:scale-x-[1.01] group-hover:brightness-110 shadow-sm ${item.colorClass}`}
              style={{ 
                width: `${item.value}%`,
                transformOrigin: 'left'
              }}
            />

            {/* Enhanced Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max max-w-[280px] px-4 py-2 text-xs text-white bg-gray-900 border border-gray-700 rounded-lg shadow-2xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-50">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between border-b border-gray-700 pb-1 mb-1">
                  <span className="font-bold text-cyan-400 uppercase tracking-wider text-[10px]">Region</span>
                  <span className="font-medium text-gray-300 ml-4">{item.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-400 uppercase tracking-wider text-[10px]">Value</span>
                  <span className="font-mono font-bold text-white ml-4">{item.displayValue}</span>
                </div>
                {item.tooltip && (
                  <div className="mt-2 pt-2 border-t border-gray-800 text-gray-400 italic leading-relaxed">
                    {item.tooltip}
                  </div>
                )}
              </div>
              {/* Tooltip Arrow */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-gray-900"></div>
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-gray-700 -z-10 mt-[1px]"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
