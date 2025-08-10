import { render, screen } from '@testing-library/svelte/svelte5';
import { describe, it, expect } from 'vitest';
import AssetCard from '$lib/components/patterns/assets/AssetCard.svelte';

const asset = {
  id: '0xasset',
  name: 'Permian Basin-3',
  description: 'Test asset',
  coverImage: '',
  images: [],
  galleryImages: [],
  location: { state: 'TX', county: 'Reeves', country: 'USA', coordinates: { lat: 0, lng: 0 }, waterDepth: null },
  operator: { name: 'Operator', website: '', experience: '' },
  technical: { fieldType: 'Oil', depth: 0, license: '', estimatedLife: '', firstOil: '', infrastructure: '', environmental: '', expectedEndDate: '', crudeBenchmark: '', pricing: { benchmarkPremium: '0', transportCosts: '0' } },
  production: { current: '0', status: 'producing', units: { production: 0, revenue: 0 } },
  terms: { interestType: 'royalty', amount: 0, paymentFrequency: 30 },
  assetTerms: { interestType: 'royalty', amount: 0, paymentFrequency: 30 },
  plannedProduction: { oilPriceAssumption: 80, oilPriceAssumptionCurrency: 'USD', projections: [] },
  historicalProduction: [],
  monthlyReports: [],
  metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
};

const tokens = [
  {
    contractAddress: '0xtoken',
    symbol: 'PBR1',
    releaseName: 'Permian Basin-3 Release 1',
    tokenType: 'royalty',
    firstPaymentDate: '2024-01',
    sharePercentage: 10,
    decimals: 18,
    supply: { maxSupply: (1000n * 10n**18n).toString(), mintedSupply: (500n * 10n**18n).toString() },
    payoutData: [],
    asset: {
      assetName: 'Permian Basin-3',
      description: '',
      location: { state: 'TX', county: 'Reeves', country: 'USA' },
      operator: { name: 'Operator', website: '', experienceYears: 0 },
      technical: { fieldType: 'Oil', depth: 0, license: '', estimatedLifeMonths: 0, firstOil: '2024-01', infrastructure: '', environmental: '', expectedEndDate: '2030-01', crudeBenchmark: '', pricing: { benchmarkPremium: 0, transportCosts: 0 } },
      assetTerms: { interestType: 'royalty', amount: 0, amountTooltip: '', paymentFrequencyDays: 30 },
      production: { current: '0', status: 'producing', units: { production: 0, revenue: 0 } },
      plannedProduction: { oilPriceAssumption: 80, oilPriceAssumptionCurrency: 'USD', projections: [] },
      historicalProduction: [],
      receiptsData: [], operationalMetrics: {}, documents: [], coverImage: '', galleryImages: []
    },
    metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  },
];

describe('AssetCard', () => {
  it('renders asset name and Available Tokens section', async () => {
    render(AssetCard, { props: { asset, token: tokens as any } });
    expect(await screen.findByText('Permian Basin-3')).toBeInTheDocument();
    expect(await screen.findByText(/Available Tokens/i)).toBeInTheDocument();
  });
});