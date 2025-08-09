import { render, screen } from '@testing-library/svelte/svelte5';
import { vi, describe, it, beforeEach, expect } from 'vitest';

vi.mock('$app/stores', async () => {
  const { readable } = await import('svelte/store');
  return {
    page: readable({ url: new URL('http://localhost/assets/0xc699575fe18f00104d926f0167cd858ce6d8b32e'), params: { id: '0xc699575fe18f00104d926f0167cd858ce6d8b32e' }, route: {}, status: 200, error: null, data: {} }),
    navigating: readable(null),
    updated: { subscribe: () => () => {} },
  } as any;
});

vi.mock('svelte-wagmi', async () => {
  const { writable } = await import('svelte/store');
  return {
    web3Modal: writable({ open: () => {} }),
    signerAddress: writable('0x1111111111111111111111111111111111111111'),
    connected: writable(true),
    loading: writable(false),
    wagmiConfig: {},
    chainId: writable(8453),
    disconnectWagmi: async () => {},
  } as any;
});

vi.mock('$lib/network', async () => {
  const actual = await vi.importActual<any>('$lib/network');
  const ADDRESS = '0xc699575fe18f00104d926f0167cd858ce6d8b32e';
  return { ...actual, PINATA_GATEWAY: 'https://gateway.pinata.cloud/ipfs', ENERGY_FIELDS: [ { name: 'Permian Basin-3 Release 1', sftTokens: [ { address: ADDRESS, claims: [] } ] } ] };
});

vi.mock('$lib/decodeMetadata/helpers', async () => ({
  decodeSftInformation: vi.fn(() => ({
    contractAddress: '0x000000000000000000000000c699575fe18f00104d926f0167cd858ce6d8b32e',
    symbol: 'PBR1',
    releaseName: 'Permian Basin-3 Release 1',
    tokenType: 'royalty',
    firstPaymentDate: '2024-01-01',
    sharePercentage: 10,
    payoutData: [],
    asset: { assetName: 'Permian Basin-3', description: 'Test asset', coverImage: '', galleryImages: [], location: { state: 'TX', county: 'Reeves', country: 'USA' }, operator: { name: 'Operator' }, technical: {}, production: { current: '0', status: 'producing', units: { production: 0, revenue: 0 } }, assetTerms: { interestType: 'royalty', amount: 0, paymentFrequencyDays: 30 }, plannedProduction: { oilPriceAssumption: 0, oilPriceAssumptionCurrency: 'USD', projections: [] }, historicalProduction: [] },
    metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  })),
}));

vi.mock('$lib/queries/getSfts', () => ({ getSfts: vi.fn(async () => [ { id: '0xc699575fe18f00104d926f0167cd858ce6d8b32e', totalShares: '0', deployTimestamp: `${Math.floor(Date.now()/1000)}`, symbol: 'PBR1', name: 'Permian Basin-3', tokenHolders: [] } ]) }));
vi.mock('$lib/queries/getSftMetadata', () => ({ getSftMetadata: vi.fn(async () => [ { id: 'm', subject: '0x000000000000000000000000c699575fe18f00104d926f0167cd858ce6d8b32e', meta: '0x', metaHash: '0x', sender: '0x1111111111111111111111111111111111111111' } ]) }));

vi.stubGlobal('fetch', vi.fn(async (url: any) => new Response(new Blob([new Uint8Array([1,2,3])]), { status: 200 })));

vi.mock('$lib/composables', async () => {
  const { readable } = await import('svelte/store');
  const asset = {
    id: '0xc699575fe18f00104d926f0167cd858ce6d8b32e',
    name: 'Permian Basin-3',
    description: '',
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
  return {
    useAssetDetailData: (assetId: string) => ({
      state: readable({ asset, tokens: [], loading: false, error: null }),
      loadAssetData: () => {},
    }),
    useDataExport: () => ({ exportProductionData: () => {}, exportPaymentHistory: () => {} }),
    useTooltip: () => ({ show: () => {}, hide: () => {}, isVisible: readable(false) }),
    useEmailNotification: () => ({ state: readable({}), setEmail: () => {}, submitEmail: () => {} }),
  } as any;
});

import AssetDetailPage from '../routes/(main)/assets/[id]/+page.svelte';

describe('Asset detail page E2E (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Overview tab and basic info', async () => {
    render(AssetDetailPage, { props: { data: { params: { id: '0xc699575fe18f00104d926f0167cd858ce6d8b32e' } } } as any });
    const overviewEls = await screen.findAllByText(/Overview/i);
    expect(overviewEls.length).toBeGreaterThan(0);
    const nameEls = await screen.findAllByText('Permian Basin-3');
    expect(nameEls.length).toBeGreaterThan(0);
  }, 30000);
});