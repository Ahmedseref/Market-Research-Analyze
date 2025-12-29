
export interface MarketNeed {
  region: string;
  interestLevel: string;
  score: number; // 0-100 score for visualization
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

export interface SocialLink {
  platform: string;
  url: string;
}

export interface Competitor {
  name: string;
  strengths: string[];
  weaknesses: string[];
  location?: string;
  website?: string;
  email?: string;
  tags?: string[];
  revenueUSD?: string;
  employeeCount?: string;
  socialLinks?: SocialLink[];
  mapUri?: string;
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
  value: number; 
  displayValue: string; 
  colorClass: string; 
  tooltip?: string; 
}
