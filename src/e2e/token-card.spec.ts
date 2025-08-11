import { render, screen } from '@testing-library/svelte/svelte5';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import AssetDetailPage from '../routes/(main)/assets/[id]/+page.svelte';

vi.mock('$app/stores', async () => {
  const { readable } = await import('svelte/store');
  return {
    page: readable({ url: new URL('http://localhost/assets/0xabc'), params: { id: '0xabc' }, route: {}, status: 200, error: null, data: {} }),
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

// Mock composable to inject asset and tokens
vi.mock('$lib/composables', async () => {
  const { readable } = await import('svelte/store');
  const token = {
    contractAddress: '0xtoken', symbol: 'PBR1', releaseName: 'Permian Basin-3 Release 1', tokenType: 'royalty', firstPaymentDate: '2024-01', sharePercentage: 10, decimals: 18,
    supply: { maxSupply: (1000n * 10n**18n).toString(), mintedSupply: (500n * 10n**18n).toString() }, payoutData: [],
    asset: { assetName: 'Permian Basin-3', description: '', location: { state: 'TX', county: 'Reeves', country: 'USA' } } as any, metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  } as any;
  const asset = {
    id: '0xabc', name: 'Permian Basin-3', description: '', coverImage: '', images: [], galleryImages: [],
    location: { state: 'TX', county: 'Reeves', country: 'USA', coordinates: { lat: 0, lng: 0 }, waterDepth: null },
    operator: { name: 'Operator', website: '', experience: '' },
    technical: { fieldType: 'Oil', depth: 0, license: '', estimatedLife: '', firstOil: '', infrastructure: '', environmental: '', expectedEndDate: '', crudeBenchmark: '', pricing: { benchmarkPremium: '0', transportCosts: '0' } },
    production: { current: '0', status: 'producing', units: { production: 0, revenue: 0 } },
    terms: { interestType: 'royalty', amount: 0, paymentFrequency: 30 }, assetTerms: { interestType: 'royalty', amount: 0, paymentFrequency: 30 },
    plannedProduction: { oilPriceAssumption: 80, oilPriceAssumptionCurrency: 'USD', projections: [] },
    monthlyReports: [], historicalProduction: [], metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  } as any;
  return {
    useAssetDetailData: (id: string) => ({ state: readable({ asset, tokens: [token], loading: false, error: null }), loadAssetData: () => {} }),
    useDataExport: () => ({ exportProductionData: () => {}, exportPaymentHistory: () => {} }),
    useTooltip: () => ({ show: () => {}, hide: () => {}, isVisible: readable(false) }),
    useEmailNotification: () => ({ state: readable({}), setEmail: () => {}, submitEmail: () => {} }),
  } as any;
});

describe('Token card on asset detail page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('renders token symbol and actions', async () => {
    render(AssetDetailPage, { props: { data: { params: { id: '0xabc' } } } as any });
    expect(await screen.findByText('PBR1')).toBeInTheDocument();
    // Buy call to action exists on token card
    expect(await screen.findAllByText(/Buy/i)).toBeTruthy();
  }, 30000);
});