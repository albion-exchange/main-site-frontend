import type { Asset } from '$lib/types';

export const permianBeta: Asset = {
  id: 'permian-beta',
  name: 'Permian Basin Beta',
  description: 'High-yield shale oil operation in the prolific Permian Basin. Utilizing advanced hydraulic fracturing techniques to maximize production from proven shale formations.',
  images: [
    '/images/assets/permian-beta-1.jpg',
    '/images/assets/permian-beta-drilling.jpg',
    '/images/assets/permian-beta-aerial.jpg'
  ],
  location: {
    state: 'Texas',
    county: 'Midland County',
    coordinates: {
      lat: 32.0387,
      lng: -101.9605
    }
  },
  operator: {
    name: 'Permian Shale Operators',
    website: 'https://permianshale.com',
    experience: '12+ years'
  },
  fieldType: 'Shale Oil',
  estimatedReserves: 485000, // barrels
  drillingDate: '2022-08-20',
  monthlyReports: [
    {
      month: '2024-01',
      production: 2850,
      revenue: 199500,
      expenses: 78000,
      netIncome: 121500,
      distributionPerToken: 0.81
    },
    {
      month: '2024-02',
      production: 2720,
      revenue: 190400,
      expenses: 75200,
      netIncome: 115200,
      distributionPerToken: 0.77
    },
    {
      month: '2024-03',
      production: 2950,
      revenue: 206500,
      expenses: 82000,
      netIncome: 124500,
      distributionPerToken: 0.83
    },
    {
      month: '2024-04',
      production: 2890,
      revenue: 202300,
      expenses: 80500,
      netIncome: 121800,
      distributionPerToken: 0.81
    },
    {
      month: '2024-05',
      production: 3120,
      revenue: 218400,
      expenses: 86800,
      netIncome: 131600,
      distributionPerToken: 0.88
    }
  ],
  tokenContracts: [
    '0x2345678901234567890123456789012345678901', // royalty token
    '0x1987654321098765432109876543210987654321'  // payment token
  ],
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-06-01T00:00:00Z'
};