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
  plannedProduction: { oilPriceAssumption: 0, oilPriceAssumptionCurrency: 'USD', projections: [] },
  metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
};

describe('AssetCard', () => {
  it('renders asset name and status', async () => {
    render(AssetCard, { props: { asset } });
    expect(await screen.findByText('Permian Basin-3')).toBeInTheDocument();
    expect(await screen.findByText(/PRODUCING/i)).toBeInTheDocument();
  });
});