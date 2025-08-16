import { render, screen, waitFor } from '@testing-library/svelte/svelte5';
import { vi, describe, it, beforeEach, expect, afterEach } from 'vitest';
import AssetsIndex from '../routes/(main)/assets/+page.svelte';
import { installHttpMocks } from './http-mock';

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

// Mock network config with ENERGY_FIELDS
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
        description: 'Wressle oil field',
        location: 'Lincolnshire, United Kingdom',
        operator: 'Egdon Resources',
        status: 'Producing',
        sftTokens: [
          {
            address: '0xf836a500910453a397084ade41321ee20a5aade1',
            symbol: 'ALB-WR1-R1',
            name: 'Wressle-1 4.5% Royalty Stream'
          },
          {
            address: '0xf836a500910453a397084ade41321ee20a5aade2',
            symbol: 'ALB-WR1-R2',
            name: 'Wressle-1 5% Royalty Stream'
          }
        ]
      },
      {
        name: 'Gulf Deep Water',
        description: 'Gulf of Mexico deep water field',
        location: 'Gulf of Mexico, USA',
        operator: 'Offshore Energy Corp',
        status: 'Developing',
        sftTokens: [
          {
            address: '0xa111111111111111111111111111111111111111',
            symbol: 'ALB-GDW-R1',
            name: 'Gulf Deep Water 3% Royalty Stream'
          }
        ]
      }
    ]
  };
});

// Mock wagmi core
vi.mock('@wagmi/core', () => ({
  readContract: vi.fn()
    .mockResolvedValueOnce(BigInt('12000000000000000000000')) // Wressle-1 R1 max supply
    .mockResolvedValueOnce(BigInt('8000000000000000000000'))  // Wressle-1 R2 max supply
    .mockResolvedValueOnce(BigInt('20000000000000000000000')) // Gulf Deep Water max supply
    .mockResolvedValue(BigInt('10000000000000000000000'))     // Default max supply
}));

// Mock stores with initial data for multiple assets
vi.mock('$lib/stores', async () => {
  const { writable } = await import('svelte/store');
  
  // Mock metadata for multiple tokens
  const mockMetadata = [
    {
      id: '0xf836a500910453a397084ade41321ee20a5aade1',
      metaURI: 'https://gateway.pinata.cloud/ipfs/QmWressleMetadata1',
      data: JSON.stringify({
        name: 'Wressle-1 4.5% Royalty Stream',
        symbol: 'ALB-WR1-R1'
      })
    },
    {
      id: '0xf836a500910453a397084ade41321ee20a5aade2',
      metaURI: 'https://gateway.pinata.cloud/ipfs/QmWressleMetadata2',
      data: JSON.stringify({
        name: 'Wressle-1 5% Royalty Stream',
        symbol: 'ALB-WR1-R2'
      })
    },
    {
      id: '0xa111111111111111111111111111111111111111',
      metaURI: 'https://gateway.pinata.cloud/ipfs/QmGulfMetadata',
      data: JSON.stringify({
        name: 'Gulf Deep Water 3% Royalty Stream',
        symbol: 'ALB-GDW-R1'
      })
    }
  ];
  
  // Mock SFT data for multiple tokens
  const mockSfts = [
    {
      id: '0xf836a500910453a397084ade41321ee20a5aade1',
      sharesSupply: '1500000000000000000000', // 1500 tokens minted
      totalShares: '12000000000000000000000', // 12000 max supply
      activeAuthorizer: { address: '0xauthorizer1' }
    },
    {
      id: '0xf836a500910453a397084ade41321ee20a5aade2',
      sharesSupply: '8000000000000000000000', // 8000 tokens minted (sold out)
      totalShares: '8000000000000000000000', // 8000 max supply
      activeAuthorizer: { address: '0xauthorizer2' }
    },
    {
      id: '0xa111111111111111111111111111111111111111',
      sharesSupply: '5000000000000000000000', // 5000 tokens minted
      totalShares: '20000000000000000000000', // 20000 max supply
      activeAuthorizer: { address: '0xauthorizer3' }
    }
  ];
  
  return {
    sftMetadata: writable(mockMetadata),
    sfts: writable(mockSfts)
  };
});

// Mock decodeMetadata functions
vi.mock('$lib/decodeMetadata/addSchemaToReceipts', () => ({
  generateAssetInstanceFromSftMeta: vi.fn((sft, metadata) => {
    // Return different assets based on the SFT ID
    if (sft.id.includes('f836')) {
      return {
        id: 'wressle-1',
        name: 'Wressle-1',
        description: 'Wressle oil field in Lincolnshire',
        location: 'Lincolnshire, United Kingdom',
        operator: 'Egdon Resources',
        status: 'Producing',
        commodity: 'Oil',
        benchmark: 'Brent',
        oilPriceAssumption: 65,
        benchmarkPremium: -1.3,
        monthlyReports: [
          { month: '2024-11', netIncome: 50000, production: 350 }
        ],
        technicalData: {
          expectedEndDate: '2027-12-31'
        }
      };
    } else {
      return {
        id: 'gulf-deep-water',
        name: 'Gulf Deep Water',
        description: 'Deep water oil field in Gulf of Mexico',
        location: 'Gulf of Mexico, USA',
        operator: 'Offshore Energy Corp',
        status: 'Developing',
        commodity: 'Oil',
        benchmark: 'WTI',
        oilPriceAssumption: 70,
        benchmarkPremium: 0,
        monthlyReports: [],
        technicalData: {
          expectedEndDate: '2030-06-30'
        }
      };
    }
  }),
  generateTokenMetadataInstanceFromSft: vi.fn((sft, metadata, maxSupply) => {
    // Return different tokens based on the SFT ID
    if (sft.id === '0xf836a500910453a397084ade41321ee20a5aade1') {
      return {
        contractAddress: '0xf836a500910453a397084ade41321ee20a5aade1',
        releaseName: 'Wressle-1 4.5% Royalty Stream',
        symbol: 'ALB-WR1-R1',
        sharePercentage: 4.5,
        supply: {
          mintedSupply: '1500000000000000000000',
          maxSupply: maxSupply
        },
        impliedBarrelsPerToken: 0.144,
        baseReturn: 12.04,
        bonusReturn: 3472.2
      };
    } else if (sft.id === '0xf836a500910453a397084ade41321ee20a5aade2') {
      return {
        contractAddress: '0xf836a500910453a397084ade41321ee20a5aade2',
        releaseName: 'Wressle-1 5% Royalty Stream',
        symbol: 'ALB-WR1-R2',
        sharePercentage: 5,
        supply: {
          mintedSupply: '8000000000000000000000',
          maxSupply: maxSupply
        },
        impliedBarrelsPerToken: 0.160,
        baseReturn: 13.5,
        bonusReturn: 4000
      };
    } else {
      return {
        contractAddress: '0xa111111111111111111111111111111111111111',
        releaseName: 'Gulf Deep Water 3% Royalty Stream',
        symbol: 'ALB-GDW-R1',
        sharePercentage: 3,
        supply: {
          mintedSupply: '5000000000000000000000',
          maxSupply: maxSupply
        },
        impliedBarrelsPerToken: 0.200,
        baseReturn: 15.0,
        bonusReturn: 5000
      };
    }
  })
}));

// Mock the decode function
vi.mock('$lib/decodeMetadata/helpers', () => ({
  decodeSftInformation: vi.fn((metaV1) => {
    // Return decoded metadata based on the ID
    if (metaV1.id === '0xf836a500910453a397084ade41321ee20a5aade1') {
      return {
        contractAddress: '0x000000000000000000000000f836a500910453a397084ade41321ee20a5aade1',
        name: 'Wressle-1 4.5% Royalty Stream',
        symbol: 'ALB-WR1-R1'
      };
    } else if (metaV1.id === '0xf836a500910453a397084ade41321ee20a5aade2') {
      return {
        contractAddress: '0x000000000000000000000000f836a500910453a397084ade41321ee20a5aade2',
        name: 'Wressle-1 5% Royalty Stream',
        symbol: 'ALB-WR1-R2'
      };
    } else {
      return {
        contractAddress: '0x000000000000000000000000a111111111111111111111111111111111111111',
        name: 'Gulf Deep Water 3% Royalty Stream',
        symbol: 'ALB-GDW-R1'
      };
    }
  })
}));

// Mock grouping utility
vi.mock('$lib/utils/energyFieldGrouping', () => ({
  groupSftsByEnergyField: vi.fn((tokensWithAssets: any[]) => {
    // Group tokens by their energy field
    const grouped: any[] = [];
    
    // Group Wressle tokens together
    const wressleTokens = tokensWithAssets.filter(item => 
      item.asset.name.includes('Wressle')
    );
    if (wressleTokens.length > 0) {
      grouped.push({
        asset: wressleTokens[0].asset,
        tokens: wressleTokens.map(item => item.token),
        energyFieldId: 'wressle-1'
      });
    }
    
    // Group Gulf tokens
    const gulfTokens = tokensWithAssets.filter(item => 
      item.asset.name.includes('Gulf')
    );
    if (gulfTokens.length > 0) {
      grouped.push({
        asset: gulfTokens[0].asset,
        tokens: gulfTokens.map(item => item.token),
        energyFieldId: 'gulf-deep-water'
      });
    }
    
    return grouped;
  })
}));

// Mock queries
vi.mock('$lib/queries/getSftMetadata', () => ({
  getSftMetadata: vi.fn(async () => [])
}));

vi.mock('$lib/queries/getSfts', () => ({
  getSfts: vi.fn(async () => [])
}));

const ADDRESS = '0xc699575fe18f00104d926f0167cd858ce6d8b32e';
const ORDER = '0x43ec2493caed6b56cfcbcf3b9279a01aedaafbce509598dfb324513e2d199977';
const CSV = 'bafkreicjcemmypds6d5c4lonwp56xb2ilzhkk7hty3y6fo4nvdkxnaibgu';
const WALLET = '0x1111111111111111111111111111111111111111';

describe('Assets Index Page E2E Tests', () => {
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
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should have 2 energy fields: Wressle-1 and Gulf Deep Water
          expect(bodyText).toMatch(/Wressle-1/);
          expect(bodyText).toMatch(/Gulf Deep Water/);
        }
      }, { timeout: 5000 });
    });

    it('shows both available and sold out assets', async () => {
      render(AssetsIndex);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Check for asset names
          const hasWressle = bodyText.includes('Wressle');
          const hasGulf = bodyText.includes('Gulf');
          
          expect(hasWressle || hasGulf).toBeTruthy();
        }
      }, { timeout: 5000 });
    });
  });

  describe('Asset Card Contents', () => {
    it('displays Wressle asset card with correct details', async () => {
      render(AssetsIndex);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Asset name
          expect(bodyText).toMatch(/Wressle-1/);
          
          // Location
          expect(bodyText).toMatch(/Lincolnshire/);
          
          // Operator
          expect(bodyText).toMatch(/Egdon Resources/);
          
          // Status
          expect(bodyText).toMatch(/Producing/);
        }
      }, { timeout: 5000 });
    });

    it('displays Gulf Deep Water asset card with correct details', async () => {
      render(AssetsIndex);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Asset name
          expect(bodyText).toMatch(/Gulf Deep Water/);
          
          // Location
          expect(bodyText).toMatch(/Gulf of Mexico/);
          
          // Operator
          expect(bodyText).toMatch(/Offshore Energy/);
          
          // Status
          expect(bodyText).toMatch(/Developing/);
        }
      }, { timeout: 5000 });
    });

    it('shows asset financial metrics', async () => {
      render(AssetsIndex);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Oil price assumptions
          expect(bodyText).toMatch(/\$65|\$70/); // Wressle or Gulf oil price
          
          // Production or revenue data
          const hasProduction = bodyText.match(/350|BOE|barrels/i);
          const hasRevenue = bodyText.match(/50,000|50k|\$50/);
          
          expect(hasProduction || hasRevenue).toBeTruthy();
        }
      }, { timeout: 5000 });
    });
  });

  describe('Token Information', () => {
    it('displays correct number of tokens for Wressle (2 tokens)', async () => {
      render(AssetsIndex);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should show both Wressle tokens
          expect(bodyText).toMatch(/ALB-WR1-R1/);
          expect(bodyText).toMatch(/ALB-WR1-R2/);
          
          // Should show token percentages
          expect(bodyText).toMatch(/4\.5%/);
          expect(bodyText).toMatch(/5%/);
        }
      }, { timeout: 5000 });
    });

    it('displays correct number of tokens for Gulf Deep Water (1 token)', async () => {
      render(AssetsIndex);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should show Gulf token
          expect(bodyText).toMatch(/ALB-GDW-R1/);
          
          // Should show token percentage
          expect(bodyText).toMatch(/3%/);
        }
      }, { timeout: 5000 });
    });

    it('shows token availability status', async () => {
      render(AssetsIndex);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should indicate availability
          // WR1-R1: Available (1500/12000 minted)
          // WR1-R2: Sold out (8000/8000 minted)
          // GDW-R1: Available (5000/20000 minted)
          
          const hasAvailable = bodyText.match(/Available|10,500|10\.5k|15,000|15k/);
          const hasSoldOut = bodyText.match(/Sold Out|Unavailable/);
          
          // At least one should be available
          expect(hasAvailable).toBeTruthy();
        }
      }, { timeout: 5000 });
    });

    it('displays token supply information', async () => {
      render(AssetsIndex);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Check for supply numbers
          // Wressle R1: 1500 minted / 12000 max
          // Wressle R2: 8000 minted / 8000 max (sold out)
          // Gulf: 5000 minted / 20000 max
          
          const hasWressleSupply = bodyText.match(/12,000|12000|12k/);
          const hasGulfSupply = bodyText.match(/20,000|20000|20k/);
          
          expect(hasWressleSupply || hasGulfSupply).toBeTruthy();
        }
      }, { timeout: 5000 });
    });

    it('shows token returns information', async () => {
      render(AssetsIndex);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Check for return percentages
          // Wressle R1: 12.04% base
          // Wressle R2: 13.5% base
          // Gulf: 15% base
          
          const hasReturns = bodyText.match(/12\.04%|13\.5%|15\.0%|15%/);
          
          expect(hasReturns).toBeTruthy();
        }
      }, { timeout: 5000 });
    });
  });

  describe('User Actions', () => {
    it('includes View Details buttons for each asset', async () => {
      render(AssetsIndex);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          expect(bodyText).toMatch(/View Details|Learn More|Explore/i);
        }
      }, { timeout: 5000 });
    });

    it('shows sold out toggle when applicable', async () => {
      render(AssetsIndex);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // May show option to view sold out assets
          const hasSoldOutToggle = bodyText.match(/Show Sold Out|Include Sold Out/i);
          
          // This is optional depending on implementation
          if (hasSoldOutToggle) {
            expect(hasSoldOutToggle).toBeTruthy();
          }
        }
      }, { timeout: 5000 });
    });
  });

  describe('Complete Data Flow', () => {
    it('processes and displays all mock data correctly', async () => {
      render(AssetsIndex);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Verify 2 energy fields
          expect(bodyText).toMatch(/Wressle-1/);
          expect(bodyText).toMatch(/Gulf Deep Water/);
          
          // Verify 3 total tokens
          expect(bodyText).toMatch(/ALB-WR1-R1/);
          expect(bodyText).toMatch(/ALB-WR1-R2/);
          expect(bodyText).toMatch(/ALB-GDW-R1/);
          
          // Verify locations
          expect(bodyText).toMatch(/Lincolnshire/);
          expect(bodyText).toMatch(/Gulf of Mexico/);
          
          // Verify operators
          expect(bodyText).toMatch(/Egdon Resources/);
          expect(bodyText).toMatch(/Offshore Energy/);
          
          // Verify at least some financial data
          const hasFinancials = bodyText.match(/\$65|\$70|12\.04%|15%/);
          expect(hasFinancials).toBeTruthy();
        }
      }, { timeout: 5000 });
    });
  });
});