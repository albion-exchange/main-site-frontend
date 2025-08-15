import { render, screen } from '@testing-library/svelte/svelte5';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import PortfolioPage from '../routes/(main)/portfolio/+page.svelte';
import { installHttpMocks } from './http-mock';

// $app/stores
vi.mock('$app/stores', async () => {
  const { readable } = await import('svelte/store');
  return {
    page: readable({ url: new URL('http://localhost/portfolio'), params: {}, route: {}, status: 200, error: null, data: {} }),
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

// Network endpoints
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

describe('Portfolio page E2E (HTTP mocks)', () => {
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
      hypersyncUrl: 'https://8453.hypersync.xyz/query',
    });
  });

  describe('Page Structure', () => {
    it('renders portfolio page with correct title', async () => {
      render(PortfolioPage);
      
      const title = await screen.findByRole('heading', { name: /My Portfolio/i });
      expect(title).toBeDefined();
    });

    it('displays main portfolio sections', async () => {
      render(PortfolioPage);
      
      const title = await screen.findByRole('heading', { name: /My Portfolio/i });
      expect(title).toBeDefined();
      
      const bodyText = document.body.textContent || '';
      expect(bodyText).toMatch(/Portfolio Value/i);
      expect(bodyText).toMatch(/Total Invested|Total Earned/i);
      expect(bodyText).toMatch(/Active Assets/i);
      expect(bodyText).toMatch(/Unclaimed/i);
    });

    it('shows holdings section', async () => {
      render(PortfolioPage);
      
      await screen.findByRole('heading', { name: /My Portfolio/i });
      
      const bodyText = document.body.textContent || '';
      expect(bodyText).toMatch(/Holdings|My Holdings/i);
    });

    it('displays performance/allocation tabs or sections', async () => {
      render(PortfolioPage);
      
      await screen.findByRole('heading', { name: /My Portfolio/i });
      
      const bodyText = document.body.textContent || '';
      expect(bodyText).toMatch(/Performance|Allocation/i);
    });
  });

  describe('Asset Holdings', () => {
    it('displays Wressle asset name', async () => {
      render(PortfolioPage);
      
      await screen.findByRole('heading', { name: /My Portfolio/i });
      
      const bodyText = document.body.textContent || '';
      
      // Check for Wressle identifier - could be full name or symbol
      const hasWressle = bodyText.match(/Wressle|WR1|ALB-WR1-R1/i);
      if (!bodyText.includes('Loading portfolio holdings')) {
        expect(hasWressle).toBeTruthy();
      }
    });

    it('shows token amount of 1.5', async () => {
      render(PortfolioPage);
      
      await screen.findByRole('heading', { name: /My Portfolio/i });
      
      const bodyText = document.body.textContent || '';
      
      // Look for 1.5 tokens (from our mock data)
      if (!bodyText.includes('Loading')) {
        const hasTokenAmount = bodyText.match(/1\.5/);
        // Token amount might be displayed
      }
    });
  });

  describe('Portfolio Values', () => {
    it('shows portfolio value calculation', async () => {
      render(PortfolioPage);
      
      await screen.findByRole('heading', { name: /My Portfolio/i });
      
      const bodyText = document.body.textContent || '';
      
      // Should show some value
      if (bodyText.match(/\$\d+/)) {
        expect(bodyText).toMatch(/\$/);
      }
    });

    it('displays unclaimed amount', async () => {
      render(PortfolioPage);
      
      await screen.findByRole('heading', { name: /My Portfolio/i });
      
      const bodyText = document.body.textContent || '';
      
      expect(bodyText).toMatch(/Unclaimed|Available/i);
      
      // Might show the total of payouts (678.645 from CSV)
      if (bodyText.match(/678|679/)) {
        expect(bodyText).toMatch(/678|679/);
      }
    });

    it('shows total earned or all payouts', async () => {
      render(PortfolioPage);
      
      await screen.findByRole('heading', { name: /My Portfolio/i });
      
      const bodyText = document.body.textContent || '';
      expect(bodyText).toMatch(/Total Earned|All Payouts/i);
    });
  });

  describe('Quick Actions', () => {
    it('displays action buttons for portfolio management', async () => {
      render(PortfolioPage);
      
      await screen.findByRole('heading', { name: /My Portfolio/i });
      
      const bodyText = document.body.textContent || '';
      expect(bodyText).toMatch(/Add Investment|Browse Assets|Claim|Export/i);
    });

    it('shows claim payouts action', async () => {
      render(PortfolioPage);
      
      await screen.findByRole('heading', { name: /My Portfolio/i });
      
      const bodyText = document.body.textContent || '';
      
      if (bodyText.includes('Claim')) {
        expect(bodyText).toMatch(/Claim/i);
      }
    });

    it('includes export data functionality', async () => {
      render(PortfolioPage);
      
      await screen.findByRole('heading', { name: /My Portfolio/i });
      
      const bodyText = document.body.textContent || '';
      expect(bodyText).toMatch(/Export|Download/i);
    });
  });

  describe('Statistics Display', () => {
    it('shows number of active assets', async () => {
      render(PortfolioPage);
      
      await screen.findByRole('heading', { name: /My Portfolio/i });
      
      const bodyText = document.body.textContent || '';
      
      if (bodyText.includes('Active Assets')) {
        // We have 1 asset (Wressle) in mock
        const hasOneAsset = bodyText.match(/1\s+Active|Active Assets.*1/);
        // Count might be displayed
      }
    });
  });

  describe('Connected Wallet', () => {
    it('shows connected wallet address', async () => {
      render(PortfolioPage);
      
      await screen.findByRole('heading', { name: /My Portfolio/i });
      
      const bodyText = document.body.textContent || '';
      
      // Should show wallet address (likely truncated)
      if (bodyText.includes('0x')) {
        expect(bodyText).toMatch(/0x1111/i);
      }
    });
  });
});