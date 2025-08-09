import { render, screen } from '@testing-library/svelte/svelte5';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import HomePage from '../routes/(main)/+page.svelte';
import { installHttpMocks } from './http-mock';

vi.mock('$app/stores', async () => {
  const { readable } = await import('svelte/store');
  return {
    page: readable({ url: new URL('http://localhost/'), params: {}, route: {}, status: 200, error: null, data: {} }),
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
  return {
    ...actual,
    BASE_SFT_SUBGRAPH_URL: 'https://example.com/sft',
    BASE_METADATA_SUBGRAPH_URL: 'https://example.com/meta',
    BASE_ORDERBOOK_SUBGRAPH_URL: 'https://example.com/orderbook',
    PINATA_GATEWAY: 'https://gateway.pinata.cloud/ipfs',
  };
});

const ADDRESS = '0xc699575fe18f00104d926f0167cd858ce6d8b32e';
const ORDER = '0x43ec2493caed6b56cfcbcf3b9279a01aedaafbce509598dfb324513e2d199977';
const CSV = 'bafkreicjcemmypds6d5c4lonwp56xb2ilzhkk7hty3y6fo4nvdkxnaibgu';
const WALLET = '0x1111111111111111111111111111111111111111';

describe('Home page E2E (integration) with HTTP mocks', () => {
  let restore: () => void;
  beforeEach(() => {
    vi.clearAllMocks();
    restore = installHttpMocks({
      sftSubgraphUrl: 'https://example.com/sft',
      metadataSubgraphUrl: 'https://example.com/meta',
      orderbookSubgraphUrl: 'https://example.com/orderbook',
      ipfsGateway: 'https://gateway.pinata.cloud/ipfs',
      wallet: WALLET,
      address: ADDRESS,
      orderHash: ORDER,
      csvCid: CSV,
    });
  });

  it('renders hero and featured sections', async () => {
    render(HomePage);
    // Check unique heading
    expect(await screen.findByRole('heading', { name: /Institutional Grade Energy DeFi/i })).toBeInTheDocument();
    // Check CTA buttons by role and accessible name
    expect(await screen.findByRole('link', { name: /Explore Investments/i })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /Learn How It Works/i })).toBeInTheDocument();
  }, 30000);
});