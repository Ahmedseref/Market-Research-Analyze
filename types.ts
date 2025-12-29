export interface MarketNeed {
  region: string;
  interestLevel: string;
  notes: string;
}

export interface PriceAnalysis {
  region: string;
  averagePriceRange: string;
}

export interface TargetCustomer {
  segment: string;
  attractiveness: string;
}

export interface Competitor {
  name: string;
  strengths: string[];
  weaknesses: string[];
}

export interface AnalysisReportData {
  productName: string;
  marketNeed: MarketNeed[];
  demandLevel: {
    level: 'High' | 'Medium' | 'Low' | string;
    justification: string;
  };
  priceAnalysis: PriceAnalysis[];
  targetCustomers: TargetCustomer[];
  competitorAnalysis: {
    keyCompetitors: Competitor[];
    competitiveLandscape: string;
  };
  strategicSummary: {
    bestRegion: string;
    mostProfitableCustomer: string;
    recommendedStrategy: string;
  };
}

export interface Source {
  uri: string;
  title: string;
}

export interface ChartDataItem {
  label: string;
  value: number; // A percentage value from 0 to 100 for the bar width
  displayValue: string; // The original string to display (e.g., "$50 - $70")
  colorClass: string; // Tailwind CSS color class
  tooltip?: string; // Optional text for tooltips or notes
}
