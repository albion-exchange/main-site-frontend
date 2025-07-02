export interface MonthlyReport {
  month: string; // YYYY-MM format
  production: number; // barrels
  revenue: number; // USD
  expenses: number; // USD
  netIncome: number; // USD
  payoutPerToken?: number; // USD per token
}

export interface AssetLocation {
  state: string;
  county: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface AssetOperator {
  name: string;
  website?: string;
  experience: string; // e.g., "15+ years"
}

export interface Asset {
  id: string;
  name: string;
  description: string;
  images: string[]; // URLs to images
  location: AssetLocation;
  operator: AssetOperator;
  
  // Asset details
  fieldType: string; // e.g., "Conventional Oil", "Shale Oil"
  estimatedReserves: number; // barrels
  drillingDate: string; // ISO date
  
  // Performance data
  monthlyReports: MonthlyReport[];
  
  // Associated smart contracts
  tokenContracts: string[]; // contract addresses
  
  // Metadata
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}