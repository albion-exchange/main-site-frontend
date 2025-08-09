import { render, screen, waitFor } from '@testing-library/svelte/svelte5';
import { vi, describe, it, beforeEach, expect } from 'vitest';

// Provide $app/stores with a minimal page store for route context
vi.mock('$app/stores', async () => {
  const { readable } = await import('svelte/store');
  return {
    page: readable({ url: new URL('http://localhost/portfolio'), params: {}, route: {}, status: 200, error: null, data: {} }),
    navigating: readable(null),
    updated: { subscribe: () => () => {} },
  } as any;
});

// Mock svelte-wagmi without external refs
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

// Mock $lib/network with in-factory constants (avoid hoist refs)
vi.mock('$lib/network', async () => {
  const actual = await vi.importActual<any>('$lib/network');
  const ADDRESS = '0xc699575fe18f00104d926f0167cd858ce6d8b32e';
  const ORDER = '0x43ec2493caed6b56cfcbcf3b9279a01aedaafbce509598dfb324513e2d199977';
  const CID = 'bafkreicjcemmypds6d5c4lonwp56xb2ilzhkk7hty3y6fo4nvdkxnaibgu';
  const MERKLE = '0x9106f7da38da159feb494ee5d31ad388f9004545914ceda12e062b458ce3b3fe';
  return {
    ...actual,
    ENERGY_FIELDS: [
      {
        name: 'Permian Basin-3 Release 1',
        sftTokens: [
          {
            address: ADDRESS,
            claims: [
              {
                orderHash: ORDER,
                csvLink: `https://gateway.pinata.cloud/ipfs/${CID}`,
                expectedMerkleRoot: MERKLE,
                expectedContentHash: CID,
              },
            ],
          },
        ],
      },
    ],
    PINATA_GATEWAY: 'https://gateway.pinata.cloud/ipfs',
    BASE_ORDERBOOK_SUBGRAPH_URL: 'https://example.com/orderbook',
    BASE_SFT_SUBGRAPH_URL: 'https://example.com/sft',
    BASE_METADATA_SUBGRAPH_URL: 'https://example.com/meta',
  };
});

// Mock decodeSftInformation
vi.mock('$lib/decodeMetadata/helpers', async () => {
  const ADDRESS = '0xc699575fe18f00104d926f0167cd858ce6d8b32e';
  return {
    decodeSftInformation: vi.fn(() => ({
      contractAddress: `0x000000000000000000000000${ADDRESS.slice(2)}`,
      symbol: 'PBR1',
      releaseName: 'Permian Basin-3 Release 1',
      tokenType: 'royalty',
      firstPaymentDate: '2024-01-01',
      sharePercentage: 10,
      payoutData: [],
      asset: {
        assetName: 'Permian Basin-3',
        description: 'Test asset',
        coverImage: '',
        galleryImages: [],
        location: { state: 'TX', county: 'Reeves', country: 'USA' },
        operator: { name: 'Operator', website: '', experience: '' },
        technical: { fieldType: 'Oil', depth: 0, license: '', estimatedLife: '', firstOil: '', infrastructure: '', environmental: '', expectedEndDate: '', crudeBenchmark: '', pricing: { benchmarkPremium: 0, transportCosts: 0 } },
        production: { current: '0', status: 'producing', units: { production: 0, revenue: 0 } },
        assetTerms: { interestType: 'royalty', amount: 0, paymentFrequencyDays: 30 },
        plannedProduction: { oilPriceAssumption: 0, oilPriceAssumptionCurrency: 'USD', projections: [] },
        historicalProduction: [],
      },
      metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    })),
  };
});

// Mock CSV utilities used in portfolio page
vi.mock('$lib/utils/claims', async () => {
  return {
    getMerkleTree: vi.fn(() => ({ root: '0x9106f7da38da159feb494ee5d31ad388f9004545914ceda12e062b458ce3b3fe', getProof: () => ['0x01'] })),
    sortClaimsData: vi.fn(async () => ({
      claimedCsv: [
        { index: '0', address: '0x1111111111111111111111111111111111111111', amount: '1000000000000000000', claimed: true, decodedLog: { timestamp: new Date('2024-01-01').toISOString() } },
      ],
      unclaimedCsv: [
        { index: '1', address: '0x1111111111111111111111111111111111111111', amount: '2000000000000000000', claimed: false },
      ],
      claims: [
        { date: new Date('2024-01-01').toISOString(), amount: '1', asset: 'Permian Basin-3 Release 1', txHash: '0xtrx', status: 'completed' },
      ],
      holdings: [
        { id: '1', name: 'Permian Basin-3 Release 1', location: '', unclaimedAmount: '2', totalEarned: '3', lastPayout: new Date('2024-01-01').toISOString(), lastClaimDate: '', status: 'producing' },
      ],
      totalClaims: 2,
      claimedCount: 1,
      unclaimedCount: 1,
      totalClaimedAmount: '1000000000000000000',
      totalUnclaimedAmount: '2000000000000000000',
      totalEarned: '3000000000000000000',
      ownerAddress: '0x1111111111111111111111111111111111111111',
    })),
    getLeaf: vi.fn(() => '0xleaf'),
    getProofForLeaf: vi.fn(() => ({ proof: ['0x01'] })),
    signContext: vi.fn(() => ({ signer: '0xsigner', context: [], signature: new Uint8Array([1]) })),
    decodeOrder: vi.fn(() => ['owner', ['interp','store','bytecode'], [], [], 'nonce']),
  };
});

// Mock queries: getTradesForClaims, getOrder, getAllDeposits
vi.mock('$lib/queries/getTrades', () => ({
  getTradesForClaims: vi.fn(async () => [
    {
      order: { orderBytes: '0x', orderHash: '0x43ec2493caed6b56cfcbcf3b9279a01aedaafbce509598dfb324513e2d199977' },
      orderbook: { id: '0xorderbook' },
      tradeEvent: { sender: '0x1111111111111111111111111111111111111111', transaction: { id: '0xtrx', blockNumber: 100, timestamp: 1700000000 } },
      amount: 3000000000000000000,
      sftAddress: '0xc699575fe18f00104d926f0167cd858ce6d8b32e',
    },
  ]),
}));
vi.mock('$lib/queries/getOrder', () => ({
  getOrder: vi.fn(async () => [{ orderBytes: '0x', orderHash: '0x43ec2493caed6b56cfcbcf3b9279a01aedaafbce509598dfb324513e2d199977', orderbook: { id: '0xorderbook' } }]),
}));
vi.mock('$lib/queries/getAllDeposits', () => ({
  getAllDeposits: vi.fn(async (_owner: string) => [
    { id: 'dep1', amount: '1000000000000000000', offchainAssetReceiptVault: { id: '0xc699575fe18f00104d926f0167cd858ce6d8b32e' } },
  ]),
}));

// Mock fetch for CSV text used in portfolio page
vi.stubGlobal('fetch', vi.fn(async (url: any) => {
  if (typeof url === 'string' && url.includes('bafkrei')) {
    const headers = ['index', 'address', 'amount'];
    const rows = [
      `0,0x1111111111111111111111111111111111111111,1000000000000000000`,
      `1,0x1111111111111111111111111111111111111111,2000000000000000000`,
      `2,0x2222222222222222222222222222222222222222,3000000000000000000`,
    ];
    const text = `${headers.join(',')}\n${rows.join('\n')}`;
    return new Response(text, { status: 200 });
  }
  return new Response(JSON.stringify({ data: {} }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}));

// Import after mocks
import PortfolioPage from '../routes/(main)/portfolio/+page.svelte';
import { sfts, sftMetadata } from '$lib/stores';

const ADDRESS = '0xc699575fe18f00104d926f0167cd858ce6d8b32e';

function seedStores() {
  sfts.set([
    { id: ADDRESS, totalShares: '1000000000000000000000', deployTimestamp: `${Math.floor(Date.now()/1000)}`, symbol: 'PBR1', name: 'Permian Basin-3', tokenHolders: [] } as any,
  ]);
  sftMetadata.set([
    { id: 'meta-1', subject: `0x000000000000000000000000${ADDRESS.slice(2)}`, meta: '0x', metaHash: '0x', sender: '0x1111111111111111111111111111111111111111' } as any,
  ]);
}

describe('Portfolio page E2E (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    seedStores();
  });

  it('computes holdings and totals from deposits and CSV data', async () => {
    render(PortfolioPage);

    const title = await screen.findByText(/My Portfolio/i);
    expect(title).toBeInTheDocument();

    const nameEls = await screen.findAllByText('Permian Basin-3');
    expect(nameEls.length).toBeGreaterThan(0);

    const bodyText = document.body.textContent || '';
    expect(bodyText).toMatch(/Total Invested/i);
    expect(bodyText).toMatch(/All Payouts/i);
    expect(bodyText).toMatch(/Unclaimed/i);
  }, 30000);
});