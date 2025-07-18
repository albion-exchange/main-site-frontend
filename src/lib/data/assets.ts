/**
 * Mock Asset Data
 * 
 * This file contains mock data for testing and development purposes.
 */

export interface AssetOverview {
  id: string;
  name: string;
  location: string;
  totalValue: number;
  tokenPrice: number;
  tokensAvailable: number;
  totalTokens: number;
  expectedReturn: number;
  productionStart: Date;
  images: string[];
  status: 'active' | 'funding' | 'completed';
  riskLevel: 'low' | 'medium' | 'high';
  estimatedProduction: number;
  operator: string;
}

export const mockAssets: AssetOverview[] = [
  {
    id: '1',
    name: 'Permian Basin Well #247',
    location: 'Texas, USA',
    totalValue: 2500000,
    tokenPrice: 50,
    tokensAvailable: 45000,
    totalTokens: 50000,
    expectedReturn: 0.12,
    productionStart: new Date('2024-03-15'),
    images: ['/assets/well-1.jpg', '/assets/well-1-aerial.jpg'],
    status: 'active',
    riskLevel: 'medium',
    estimatedProduction: 150000,
    operator: 'Eagle Energy Partners'
  },
  {
    id: '2',
    name: 'Eagle Ford Shale Project',
    location: 'Texas, USA',
    totalValue: 1800000,
    tokenPrice: 25,
    tokensAvailable: 12000,
    totalTokens: 72000,
    expectedReturn: 0.15,
    productionStart: new Date('2024-04-01'),
    images: ['/assets/well-2.jpg'],
    status: 'active',
    riskLevel: 'medium',
    estimatedProduction: 120000,
    operator: 'Lone Star Drilling'
  },
  {
    id: '3',
    name: 'Bakken Formation Site',
    location: 'North Dakota, USA',
    totalValue: 3200000,
    tokenPrice: 75,
    tokensAvailable: 8500,
    totalTokens: 42667,
    expectedReturn: 0.18,
    productionStart: new Date('2024-05-15'),
    images: ['/assets/well-3.jpg'],
    status: 'funding',
    riskLevel: 'high',
    estimatedProduction: 200000,
    operator: 'Northern Plains Energy'
  },
  {
    id: '4',
    name: 'Marcellus Shale Gas Well',
    location: 'Pennsylvania, USA',
    totalValue: 1500000,
    tokenPrice: 30,
    tokensAvailable: 25000,
    totalTokens: 50000,
    expectedReturn: 0.14,
    productionStart: new Date('2024-02-01'),
    images: ['/assets/well-4.jpg'],
    status: 'active',
    riskLevel: 'low',
    estimatedProduction: 180000,
    operator: 'Northeast Energy Corp'
  },
  {
    id: '5',
    name: 'Offshore Gulf Platform',
    location: 'Gulf of Mexico, USA',
    totalValue: 5000000,
    tokenPrice: 100,
    tokensAvailable: 15000,
    totalTokens: 50000,
    expectedReturn: 0.20,
    productionStart: new Date('2024-06-01'),
    images: ['/assets/platform-1.jpg'],
    status: 'funding',
    riskLevel: 'high',
    estimatedProduction: 300000,
    operator: 'Gulf Coast Energy'
  }
];

export const mockPlatformStats = {
  totalValue: 52000000,
  activeInvestors: 1247,
  averageReturn: 0.145,
  totalWells: 23,
  totalVolume: 987654321,
  monthlyGrowth: 8.2
};