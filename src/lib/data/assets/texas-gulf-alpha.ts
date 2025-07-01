import type { Asset } from '$lib/types';

export const texasGulfAlpha: Asset = {
  id: 'texas-gulf-alpha',
  name: 'Texas Gulf Field Alpha',
  description: 'A productive conventional oil field located in the heart of Texas Gulf Coast region. This mature field has demonstrated consistent production with excellent infrastructure and proven reserves.',
  images: [
    '/images/assets/texas-gulf-alpha-1.jpg',
    '/images/assets/texas-gulf-alpha-2.jpg',
    '/images/assets/texas-gulf-alpha-map.jpg'
  ],
  location: {
    state: 'Texas',
    county: 'Harris County',
    coordinates: {
      lat: 29.7604,
      lng: -95.3698
    }
  },
  operator: {
    name: 'Gulf Coast Energy LLC',
    website: 'https://gulfcoastenergy.com',
    experience: '20+ years'
  },
  fieldType: 'Conventional Oil',
  estimatedReserves: 125000, // barrels
  drillingDate: '2019-03-15',
  monthlyReports: [
    {
      month: '2024-01',
      production: 1250,
      revenue: 87500,
      expenses: 23000,
      netIncome: 64500,
      distributionPerToken: 0.32
    },
    {
      month: '2024-02',
      production: 1180,
      revenue: 82600,
      expenses: 21500,
      netIncome: 61100,
      distributionPerToken: 0.31
    },
    {
      month: '2024-03',
      production: 1320,
      revenue: 92400,
      expenses: 24800,
      netIncome: 67600,
      distributionPerToken: 0.34
    },
    {
      month: '2024-04',
      production: 1275,
      revenue: 89250,
      expenses: 23200,
      netIncome: 66050,
      distributionPerToken: 0.33
    },
    {
      month: '2024-05',
      production: 1395,
      revenue: 97650,
      expenses: 25100,
      netIncome: 72550,
      distributionPerToken: 0.36
    }
  ],
  tokenContracts: [
    '0x1234567890123456789012345678901234567890', // royalty token
    '0x0987654321098765432109876543210987654321'  // payment token
  ],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-06-01T00:00:00Z'
};