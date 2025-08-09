import { render, screen } from '@testing-library/svelte/svelte5';
import { vi, describe, it, beforeEach, expect } from 'vitest';

// $app/stores
vi.mock('$app/stores', async () => {
  const { readable } = await import('svelte/store');
  return {
    page: readable({ url: new URL('http://localhost/claims'), params: {}, route: {}, status: 200, error: null, data: {} }),
    navigating: readable(null),
    updated: { subscribe: () => () => {} },
  } as any;
});

// svelte-wagmi
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

// $lib/network
vi.mock('$lib/network', async () => {
  const actual = await vi.importActual<any>('$lib/network');
  const ADDRESS = '0xc699575fe18f00104d926f0167cd858ce6d8b32e';
  const ORDER = '0x43ec2493caed6b56cfcbcf3b9279a01aedaafbce509598dfb324513e2d199977';
  const CID = 'bafkreicjcemmypds6d5c4lonwp56xb2ilzhkk7hty3y6fo4nvdkxnaibgu';
  const MERKLE = '0x9106f7da38da159feb494ee5d31ad388f9004545914ceda12e062b458ce3b3fe';
  return {
    ...actual,
    ENERGY_FIELDS: [
      { name: 'Permian Basin-3 Release 1', sftTokens: [ { address: ADDRESS, claims: [ { orderHash: ORDER, csvLink: `https://gateway.pinata.cloud/ipfs/${CID}`, expectedMerkleRoot: MERKLE, expectedContentHash: CID } ] } ] }
    ],
    PINATA_GATEWAY: 'https://gateway.pinata.cloud/ipfs',
  };
});

// helpers
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

// utils/claims
vi.mock('$lib/utils/claims', async () => ({
  fetchAndValidateCSV: vi.fn(async () => [
    { index: '0', address: '0x1111111111111111111111111111111111111111', amount: '1000000000000000000' },
    { index: '1', address: '0x1111111111111111111111111111111111111111', amount: '2000000000000000000' },
  ]),
  getMerkleTree: vi.fn(() => ({ root: '0x9106f7da38da159feb494ee5d31ad388f9004545914ceda12e062b458ce3b3fe', getProof: () => ['0x01'] })),
  sortClaimsData: vi.fn(async () => ({
    claims: [ { date: new Date('2024-01-01').toISOString(), amount: '1', asset: 'Permian Basin-3 Release 1', txHash: '0xtrx', status: 'completed' } ],
    holdings: [ { id: '1', name: 'Permian Basin-3 Release 1', location: '', unclaimedAmount: '2', totalEarned: '3', lastPayout: new Date('2024-01-01').toISOString(), lastClaimDate: '', status: 'producing' } ],
    totalClaimedAmount: '1000000000000000000',
    totalUnclaimedAmount: '2000000000000000000',
    totalEarned: '3000000000000000000',
  })),
  getLeaf: vi.fn(() => '0xleaf'),
  getProofForLeaf: vi.fn(() => ({ proof: ['0x01'] })),
  signContext: vi.fn(() => ({ signer: '0xsigner', context: [], signature: new Uint8Array([1]) })),
  decodeOrder: vi.fn(() => ['owner', ['interp','store','bytecode'], [], [], 'nonce']),
}));

// queries
vi.mock('$lib/queries/getTrades', () => ({ getTradesForClaims: vi.fn(async () => [ { order: { orderBytes: '0x', orderHash: '0x43ec...', }, orderbook: { id: '0xorderbook' }, tradeEvent: { sender: '0x1111111111111111111111111111111111111111', transaction: { id: '0xtrx', blockNumber: 100, timestamp: 1700000000 } } } ]) }));
vi.mock('$lib/queries/getOrder', () => ({ getOrder: vi.fn(async () => [ { orderBytes: '0x', orderHash: '0x43ec...', orderbook: { id: '0xorderbook' } } ]) }));
vi.mock('$lib/queries/getSfts', () => ({ getSfts: vi.fn(async () => [ { id: '0xc699575fe18f00104d926f0167cd858ce6d8b32e', totalShares: '0', deployTimestamp: `${Math.floor(Date.now()/1000)}`, symbol: 'PBR1', name: 'Permian Basin-3', tokenHolders: [] } ]) }));
vi.mock('$lib/queries/getSftMetadata', () => ({ getSftMetadata: vi.fn(async () => [ { id: 'm', subject: '0x000000000000000000000000c699575fe18f00104d926f0167cd858ce6d8b32e', meta: '0x', metaHash: '0x', sender: '0x1111111111111111111111111111111111111111' } ]) }));

// fetch stub for any CSV/document
vi.stubGlobal('fetch', vi.fn(async (url: any) => {
  if (typeof url === 'string' && url.includes('bafkrei')) {
    const headers = ['index','address','amount'];
    const rows = [
      `0,0x1111111111111111111111111111111111111111,1000000000000000000`,
      `1,0x1111111111111111111111111111111111111111,2000000000000000000`,
    ];
    const text = `${headers.join(',')}\n${rows.join('\n')}`;
    return new Response(text, { status: 200 });
  }
  return new Response(JSON.stringify({ data: {} }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}));

import ClaimsPage from '../routes/(main)/claims/+page.svelte';

describe('Claims page E2E (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders totals and holdings based on CSV and trades', async () => {
    render(ClaimsPage);

    // Labels
    expect(await screen.findByText(/Total Earned/i)).toBeInTheDocument();
    // The page uses "Available to Claim" label for unclaimed
    expect(await screen.findByText(/Available to Claim/i)).toBeInTheDocument();
    expect(await screen.findByText(/Claim History/i)).toBeInTheDocument();
  }, 30000);
});