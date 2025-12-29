
import React from 'react';

interface ReportCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export const ReportCard: React.FC<ReportCardProps> = ({ title, icon, children }) => {
  return (
    <div className="bg-gray-800/70 border border-gray-700 rounded-xl shadow-lg backdrop-blur-sm p-6 h-full">
      <div className="flex items-center mb-4">
        <div className="text-cyan-400 mr-3">
            {React.cloneElement(icon as React.ReactElement, { className: "h-6 w-6" })}
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      <div className="text-gray-300">
        {children}
      </div>
    </div>
  );
};
