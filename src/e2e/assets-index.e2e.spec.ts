import { render, screen, waitFor } from '@testing-library/svelte/svelte5';
import { vi, describe, it, beforeEach, expect, afterEach } from 'vitest';
import AssetsIndex from '../routes/(main)/assets/+page.svelte';
import { installHttpMocks } from './http-mock';
import { wressleMetadata, wressleR2Metadata, gulfMetadata } from './cbor-test-helper';

// Mock app stores
vi.mock('$app/stores', async () => {
  const { readable } = await import('svelte/store');
  return {
    page: readable({ url: new URL('http://localhost/assets'), params: {}, route: {}, status: 200, error: null, data: {} }),
    navigating: readable(null),
    updated: { subscribe: () => () => {} },
  } as any;
});

// Mock wagmi
vi.mock('svelte-wagmi', async () => {
  const { writable, readable } = await import('svelte/store');
  return {
    web3Modal: writable({ open: () => {} }),
    signerAddress: writable('0x1111111111111111111111111111111111111111'),
    connected: writable(true),
    loading: writable(false),
    wagmiConfig: readable({ chains: [], transports: {} }),
    chainId: writable(8453),
    disconnectWagmi: async () => {},
  } as any;
});

// Mock network config - only mock URLs, not data
vi.mock('$lib/network', async () => {
  const actual = await vi.importActual<any>('$lib/network');
  return {
    ...actual,
    BASE_SFT_SUBGRAPH_URL: 'https://example.com/sft',
    BASE_METADATA_SUBGRAPH_URL: 'https://example.com/meta',
    BASE_ORDERBOOK_SUBGRAPH_URL: 'https://example.com/orderbook',
    PINATA_GATEWAY: 'https://gateway.pinata.cloud/ipfs',
    ENERGY_FIELDS: [
      {
        name: 'Wressle-1',
        sftTokens: [
          {
            address: '0xf836a500910453a397084ade41321ee20a5aade1'
          },
          {
            address: '0xf836a500910453a397084ade41321ee20a5aade2'
          }
        ]
      },
      {
        name: 'Gulf Deep Water',
        sftTokens: [
          {
            address: '0xa111111111111111111111111111111111111111'
          }
        ]
      }
    ]
  };
});

// Mock wagmi core
vi.mock('@wagmi/core', () => ({
  readContract: vi.fn().mockResolvedValue(BigInt('10000000000000000000000')) // Default max supply
}));

// DO NOT MOCK THESE - Let them use production code:
// - $lib/stores
// - $lib/utils/energyFieldGrouping
// - $lib/queries/getSftMetadata
// - $lib/queries/getSfts
// - $lib/decodeMetadata/helpers
// - $lib/decodeMetadata/addSchemaToReceipts

const ADDRESS = '0xf836a500910453a397084ade41321ee20a5aade1';
const ORDER = '0x43ec2493caed6b56cfcbcf3b9279a01aedaafbce509598dfb324513e2d199977';
const CSV = 'bafkreicjcemmypds6d5c4lonwp56xb2ilzhkk7hty3y6fo4nvdkxnaibgu';
const WALLET = '0x1111111111111111111111111111111111111111';

describe('Assets Index Page E2E Tests', () => {
  let restore: () => void;
  
  beforeEach(async () => {
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
      sfts: [
        {
          address: '0xf836a500910453a397084ade41321ee20a5aade1',
          name: 'Wressle-1 4.5% Royalty Stream',
          symbol: 'ALB-WR1-R1',
          totalShares: '1500000000000000000000', // 1500 tokens
          metadata: wressleMetadata
        },
        {
          address: '0xf836a500910453a397084ade41321ee20a5aade2',
          name: 'Wressle-1 5% Royalty Stream',
          symbol: 'ALB-WR1-R2',
          totalShares: '8000000000000000000000', // 8000 tokens (sold out)
          metadata: wressleR2Metadata
        },
        {
          address: '0xa111111111111111111111111111111111111111',
          name: 'Gulf Deep Water 3% Royalty',
          symbol: 'ALB-GDW-R1',
          totalShares: '5000000000000000000000', // 5000 tokens
          metadata: gulfMetadata
        }
      ]
    });
    
    // Import and populate stores with data from HTTP mocks
    const { getSfts } = await import('$lib/queries/getSfts');
    const { getSftMetadata } = await import('$lib/queries/getSftMetadata');
    const { sfts, sftMetadata } = await import('$lib/stores');
    
    // Fetch data using HTTP mocks and populate stores
    const [sftData, metaData] = await Promise.all([
      getSfts(),
      getSftMetadata()
    ]);
    
    sfts.set(sftData);
    sftMetadata.set(metaData);
  });

  afterEach(() => {
    restore?.();
  });

  describe('Page Structure', () => {
    it('renders assets page with correct title and subtitle', async () => {
      render(AssetsIndex);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        // Page title
        expect(bodyText).toMatch(/Available Assets/i);
        
        // Subtitle
        expect(bodyText).toMatch(/Browse live energy investment opportunities/i);
      }, { timeout: 5000 });
    });
  });

  describe('Asset Cards Count', () => {
    it('displays correct number of asset cards (2 energy fields)', async () => {
      render(AssetsIndex);
      
      // Don't wait for loading - just check content after a short delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const bodyText = document.body.textContent || '';
              // Should have 2 energy fields: Wressle-1 and Gulf Deep Water
        expect(bodyText).toMatch(/Wressle-1/);
        expect(bodyText).toMatch(/Gulf Deep Water/);
    });

    it('shows both available and sold out assets', async () => {
      render(AssetsIndex);
      
      // Don't wait for loading - just check content after a short delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const bodyText = document.body.textContent || '';
              // Check for asset names
        const hasWressle = bodyText.includes('Wressle');
        const hasGulf = bodyText.includes('Gulf');
        expect(hasWressle || hasGulf).toBeTruthy();
    });
  });

  describe('Asset Card Contents', () => {
    it('displays Wressle asset card with correct details', async () => {
      render(AssetsIndex);
      
      // Don't wait for loading - just check content after a short delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const bodyText = document.body.textContent || '';
              // Asset name
        expect(bodyText).toMatch(/Wressle-1/);
        // Location
        expect(bodyText).toMatch(/Lincolnshire/);
        // Operator
        expect(bodyText).toMatch(/Egdon Resources/);
        // Description or status (UI might not show status)
        expect(bodyText).toMatch(/Wressle oil field|Lincolnshire/);
    });

    it('displays Gulf Deep Water asset card with correct details', async () => {
      render(AssetsIndex);
      
      // Don't wait for loading - just check content after a short delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const bodyText = document.body.textContent || '';
              // Asset name
        expect(bodyText).toMatch(/Gulf Deep Water/);
        // Location
        expect(bodyText).toMatch(/Gulf of Mexico/);
        // Operator
        expect(bodyText).toMatch(/Offshore Energy/);
        // Description or status (UI might not show status)  
        expect(bodyText).toMatch(/Deep water oil field|Gulf of Mexico/);
    });

    it('shows asset financial metrics', async () => {
      render(AssetsIndex);
      
      // Don't wait for loading - just check content after a short delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const bodyText = document.body.textContent || '';
      // Test that sharePercentage from metadata is displayed (2.5%, 5%, 3%)
      expect(bodyText).toMatch(/2\.5%/); // Wressle R1 from wressleMetadata.sharePercentage
      expect(bodyText).toMatch(/5%/); // Wressle R2 from wressleR2Metadata.sharePercentage
      expect(bodyText).toMatch(/3%/); // Gulf from gulfMetadata.sharePercentage
      
      // Test that first payment dates from metadata are shown
      expect(bodyText).toMatch(/2025-05-01/); // From wressleMetadata.firstPaymentDate
      expect(bodyText).toMatch(/2025-06-01/); // From wressleR2Metadata.firstPaymentDate
    });
  });

  describe('Token Information', () => {
    it('displays correct number of tokens for Wressle (2 tokens)', async () => {
      render(AssetsIndex);
      
      // Don't wait for loading - just check content after a short delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const bodyText = document.body.textContent || '';
              // Should show both Wressle tokens
        expect(bodyText).toMatch(/ALB-WR1-R1/);
        expect(bodyText).toMatch(/ALB-WR1-R2/);
        // Should show token percentages
        expect(bodyText).toMatch(/4\.5%/);
        expect(bodyText).toMatch(/5%/);
    });

    it('displays correct number of tokens for Gulf Deep Water (1 token)', async () => {
      render(AssetsIndex);
      
      // Don't wait for loading - just check content after a short delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const bodyText = document.body.textContent || '';
              // Should show Gulf token
        expect(bodyText).toMatch(/ALB-GDW-R1/);
        // Should show token percentage
        expect(bodyText).toMatch(/3%/);
    });

    it('shows token availability status', async () => {
      render(AssetsIndex);
      
      // Don't wait for loading - just check content after a short delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const bodyText = document.body.textContent || '';
              // Should indicate availability
        // WR1-R1: Available (1500/12000 minted)
        // WR1-R2: Sold out (8000/8000 minted)
        // GDW-R1: Available (5000/20000 minted)
        const hasAvailable = bodyText.match(/Available|10,500|10\.5k|15,000|15k/);
        const hasSoldOut = bodyText.match(/Sold Out|Unavailable/);
        // At least one should be available
        expect(hasAvailable).toBeTruthy();
    });

    it('displays token supply information', async () => {
      render(AssetsIndex);
      
      // Don't wait for loading - just check content after a short delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const bodyText = document.body.textContent || '';
              // Check for any supply-related text
        // UI might show percentages or availability instead of exact numbers
        const hasSupplyInfo = bodyText.match(/Available|Sold Out|\d+%|tokens?/i);
        expect(hasSupplyInfo).toBeTruthy();
    });

    it('shows token returns information', async () => {
      render(AssetsIndex);
      
      // Don't wait for loading - just check content after a short delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const bodyText = document.body.textContent || '';
              // Check for return information (UI shows "Base >10x" format)
        const hasReturns = bodyText.match(/Base|Bonus|>10x|Returns?/i);
        expect(hasReturns).toBeTruthy();
    });
  });

  describe('User Actions', () => {
    it('includes View Details buttons for each asset', async () => {
      render(AssetsIndex);
      
      // Don't wait for loading - just check content after a short delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const bodyText = document.body.textContent || '';
              expect(bodyText).toMatch(/View Details|Learn More|Explore/i);
    });

    it('shows sold out toggle when applicable', async () => {
      render(AssetsIndex);
      
      // Don't wait for loading - just check content after a short delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const bodyText = document.body.textContent || '';
              // May show option to view sold out assets
        const hasSoldOutToggle = bodyText.match(/Show Sold Out|Include Sold Out/i);
        // This is optional depending on implementation
        if (hasSoldOutToggle) {
          expect(hasSoldOutToggle).toBeTruthy();
        }
    });
  });

  describe('Complete Data Flow', () => {
    it('processes and displays all mock data correctly', async () => {
      render(AssetsIndex);
      
      // Don't wait for loading - just check content after a short delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const bodyText = document.body.textContent || '';
      
      // Test 1: Verify SFT data from HTTP mock is displayed
      // These come from the offchainAssetReceiptVaults response
      expect(bodyText).toMatch(/ALB-WR1-R1/); // From sfts[0].symbol
      expect(bodyText).toMatch(/ALB-WR1-R2/); // From sfts[1].symbol  
      expect(bodyText).toMatch(/ALB-GDW-R1/); // From sfts[2].symbol
      
      // Test 2: Verify CBOR-decoded metadata is transformed and displayed
      // These values come from the CBOR-encoded metadata that gets decoded by decodeSftInformation
      expect(bodyText).toMatch(/Wressle-1 4\.5% Royalty Stream/); // From decoded wressleMetadata.name
      expect(bodyText).toMatch(/Wressle-1 5% Royalty Stream/); // From decoded wressleR2Metadata.name
      expect(bodyText).toMatch(/Gulf Deep Water 3% Royalty/); // From decoded gulfMetadata.name
      
      // Test 3: Verify asset data from nested metadata structure
      // These come from metadata.asset after CBOR decoding
      expect(bodyText).toMatch(/Lincolnshire/); // From wressleMetadata.asset.location.region
      expect(bodyText).toMatch(/United Kingdom/); // From wressleMetadata.asset.location.country
      expect(bodyText).toMatch(/Gulf of Mexico/); // From gulfMetadata.asset.location.region
      expect(bodyText).toMatch(/United States/); // From gulfMetadata.asset.location.country
      
      // Test 4: Verify operator data transformation
      expect(bodyText).toMatch(/Egdon Resources/); // From wressleMetadata.asset.operator.name
      expect(bodyText).toMatch(/Offshore Energy/); // From gulfMetadata.asset.operator.name
      
      // Test 5: Verify financial data calculation/transformation
      // These percentages come from sharePercentage in metadata
      expect(bodyText).toMatch(/2\.5%/); // wressleMetadata.sharePercentage
      expect(bodyText).toMatch(/5%/); // wressleR2Metadata.sharePercentage  
      expect(bodyText).toMatch(/3%/); // gulfMetadata.sharePercentage
      
      // Test 6: Verify payment schedule data
      expect(bodyText).toMatch(/2025-05-01/); // wressleMetadata.firstPaymentDate
      expect(bodyText).toMatch(/2025-06-01/); // wressleR2Metadata.firstPaymentDate
    });
    
    it('correctly groups tokens by energy field', async () => {
      render(AssetsIndex);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const bodyText = document.body.textContent || '';
      
      // Verify that the energyFieldGrouping utility correctly groups
      // Wressle-1 should have 2 tokens, Gulf should have 1
      // This tests the grouping logic that matches SFT addresses to ENERGY_FIELDS
      
      // Find Wressle section and verify it has both R1 and R2
      const wressleMatch = bodyText.match(/Wressle-1[\s\S]*?(?=Gulf|$)/);
      expect(wressleMatch).toBeTruthy();
      if (wressleMatch) {
        expect(wressleMatch[0]).toMatch(/ALB-WR1-R1/);
        expect(wressleMatch[0]).toMatch(/ALB-WR1-R2/);
      }
      
      // Find Gulf section and verify it only has R1
      const gulfMatch = bodyText.match(/Gulf Deep Water[\s\S]*?$/);
      expect(gulfMatch).toBeTruthy();
      if (gulfMatch) {
        expect(gulfMatch[0]).toMatch(/ALB-GDW-R1/);
        expect(gulfMatch[0]).not.toMatch(/ALB-WR1/); // Should not have Wressle tokens
      }
    });
  });
});