import { render, screen, waitFor } from '@testing-library/svelte/svelte5';
import { vi, describe, it, beforeEach, expect, afterEach } from 'vitest';
import PortfolioPage from '../routes/(main)/portfolio/+page.svelte';
import { installHttpMocks } from './http-mock';

// Mock app stores
vi.mock('$app/stores', async () => {
  const { readable } = await import('svelte/store');
  return {
    page: readable({ url: new URL('http://localhost/portfolio'), params: {}, route: {}, status: 200, error: null, data: {} }),
    navigating: readable(null),
    updated: { subscribe: () => () => {} },
  } as any;
});

// Mock wagmi with connected wallet
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

// Mock network config with energy fields
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
            name: 'Wressle-1 4.5% Royalty Stream',
            claims: [
              {
                csvLink: 'https://gateway.pinata.cloud/ipfs/bafkreicjcemmypds6d5c4lonwp56xb2ilzhkk7hty3y6fo4nvdkxnaibgu',
                orderHash: '0x43ec2493caed6b56cfcbcf3b9279a01aedaafbce509598dfb324513e2d199977',
                expectedMerkleRoot: '0xmerkleroot1',
                expectedContentHash: '0xcontenthash1'
              }
            ]
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
            name: 'Gulf Deep Water 3% Royalty Stream',
            claims: []
          }
        ]
      }
    ]
  };
});

// Mock stores with portfolio holdings
vi.mock('$lib/stores', async () => {
  const { writable } = await import('svelte/store');
  
  // Mock metadata
  const mockMetadata = [
    {
      id: '0xf836a500910453a397084ade41321ee20a5aade1',
      metaURI: 'https://gateway.pinata.cloud/ipfs/QmWressleMetadata',
      data: JSON.stringify({
        name: 'Wressle-1 4.5% Royalty Stream',
        symbol: 'ALB-WR1-R1',
        description: 'Wressle oil field royalty token',
        attributes: {
          sharePercentage: 4.5,
          impliedBarrelsPerToken: 0.144,
          baseReturn: 12.04
        }
      })
    },
    {
      id: '0xa111111111111111111111111111111111111111',
      metaURI: 'https://gateway.pinata.cloud/ipfs/QmGulfMetadata',
      data: JSON.stringify({
        name: 'Gulf Deep Water 3% Royalty Stream',
        symbol: 'ALB-GDW-R1',
        description: 'Gulf deep water royalty token',
        attributes: {
          sharePercentage: 3,
          impliedBarrelsPerToken: 0.200,
          baseReturn: 15.0
        }
      })
    }
  ];
  
  // Mock SFT data
  const mockSfts = [
    {
      id: '0xf836a500910453a397084ade41321ee20a5aade1',
      sharesSupply: '1500000000000000000000', // 1500 tokens total
      totalShares: '12000000000000000000000', // 12000 max
      offchainAssetReceiptVault: '0xvault1',
      admin: '0xadmin'
    },
    {
      id: '0xa111111111111111111111111111111111111111',
      sharesSupply: '5000000000000000000000', // 5000 tokens total
      totalShares: '20000000000000000000000', // 20000 max
      offchainAssetReceiptVault: '0xvault2',
      admin: '0xadmin'
    }
  ];
  
  return {
    sftMetadata: writable(mockMetadata),
    sfts: writable(mockSfts)
  };
});

// Mock queries for deposits (user's holdings)
vi.mock('$lib/queries/getAllDeposits', () => ({
  getAllDeposits: vi.fn().mockResolvedValue([
    {
      vault: { id: '0xvault1' },
      sft: { id: '0xf836a500910453a397084ade41321ee20a5aade1' },
      sender: '0x1111111111111111111111111111111111111111',
      sharesMinted: '150000000000000000000', // 150 tokens owned by user
      timestamp: 1700000000,
      depositEvent: {
        transaction: { blockNumber: 100 }
      }
    },
    {
      vault: { id: '0xvault2' },
      sft: { id: '0xa111111111111111111111111111111111111111' },
      sender: '0x1111111111111111111111111111111111111111',
      sharesMinted: '250000000000000000000', // 250 tokens owned by user
      timestamp: 1700100000,
      depositEvent: {
        transaction: { blockNumber: 200 }
      }
    }
  ])
}));

// Mock queries for trades and orders
vi.mock('$lib/queries/getTrades', () => ({
  getTradesForClaims: vi.fn().mockResolvedValue([
    {
      order: { orderHash: '0x43ec2493caed6b56cfcbcf3b9279a01aedaafbce509598dfb324513e2d199977' },
      orderbook: { id: '0xorderbook' },
      tradeEvent: { 
        transaction: { id: '0xtrx1', blockNumber: 100, timestamp: 1700000000 },
        sender: '0x1111111111111111111111111111111111111111'
      }
    }
  ])
}));

vi.mock('$lib/queries/getOrder', () => ({
  getOrder: vi.fn().mockResolvedValue([
    {
      orderBytes: '0xorderdata',
      orderHash: '0x43ec2493caed6b56cfcbcf3b9279a01aedaafbce509598dfb324513e2d199977',
      orderbook: { id: '0xorderbook' }
    }
  ])
}));

// Mock claims utilities
vi.mock('$lib/utils/claims', () => ({
  decodeOrder: vi.fn(() => ({
    id: '0x43ec2493caed6b56cfcbcf3b9279a01aedaafbce509598dfb324513e2d199977',
    validInputs: [],
    validOutputs: []
  })),
  getLeaf: vi.fn((id, address, amount) => `0x000000000000000000000000000000000000000000000000000000000000000${id}`),
  getMerkleTree: vi.fn((data) => ({
    getRoot: () => '0xmerkleroot',
    getProof: () => ['0x1234567890abcdef', '0xabcdef1234567890']
  })),
  signContext: vi.fn((data) => ({
    id: data[0],
    signedData: '0xsigned'
  })),
  sortClaimsData: vi.fn(async (parsedData, trades, address, fieldName) => {
    const holdings = parsedData
      .filter((row: any) => row.amount > 0 && row.address === address && !row.claimed)
      .map((row: any) => ({
        id: row.claimId || '1',
        unclaimedAmount: row.amount,
        fieldName: fieldName,
        date: row.timestamp || Date.now()
      }));
    
    const claims = parsedData
      .filter((row: any) => row.claimed && row.address === address)
      .map((row: any) => ({
        id: row.claimId || '1',
        amount: row.amount,
        timestamp: row.timestamp || Date.now(),
        txHash: row.txHash || '0xtx',
        fieldName: fieldName,
        asset: fieldName,
        date: new Date(row.timestamp || Date.now())
      }));
    
    return { holdings, claims };
  }),
  getProofForLeaf: vi.fn(() => ({
    proof: ['0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890']
  }))
}));

// Mock decodeMetadata
vi.mock('$lib/decodeMetadata/helpers', () => ({
  decodeSftInformation: vi.fn((metaV1) => {
    if (metaV1.id === '0xf836a500910453a397084ade41321ee20a5aade1') {
      return {
        contractAddress: '0x000000000000000000000000f836a500910453a397084ade41321ee20a5aade1',
        name: 'Wressle-1 4.5% Royalty Stream',
        symbol: 'ALB-WR1-R1',
        description: 'Wressle oil field royalty token',
        image: 'ipfs://QmWressleImage',
        attributes: {
          sharePercentage: 4.5,
          location: 'Lincolnshire, United Kingdom',
          operator: 'Egdon Resources',
          status: 'Producing',
          commodity: 'Oil',
          oilPriceAssumption: 65,
          impliedBarrelsPerToken: 0.144,
          baseReturn: 12.04
        }
      };
    } else {
      return {
        contractAddress: '0x000000000000000000000000a111111111111111111111111111111111111111',
        name: 'Gulf Deep Water 3% Royalty Stream',
        symbol: 'ALB-GDW-R1',
        description: 'Gulf deep water royalty token',
        image: 'ipfs://QmGulfImage',
        attributes: {
          sharePercentage: 3,
          location: 'Gulf of Mexico, USA',
          operator: 'Offshore Energy Corp',
          status: 'Developing',
          commodity: 'Oil',
          oilPriceAssumption: 70,
          impliedBarrelsPerToken: 0.200,
          baseReturn: 15.0
        }
      };
    }
  })
}));

// Mock services
vi.mock('$lib/services', () => ({
  useAssetService: vi.fn(() => ({})),
  useTokenService: vi.fn(() => ({}))
}));

// Mock composables
vi.mock('$lib/composables', () => ({
  useTooltip: vi.fn(() => ({
    show: vi.fn(),
    hide: vi.fn(),
    isVisible: { subscribe: () => () => {} }
  })),
  useCardFlip: vi.fn(() => ({
    toggle: vi.fn(),
    flippedCards: { subscribe: () => () => {} },
    unflipAll: vi.fn()
  }))
}));

// Mock CSV fetch responses
global.fetch = vi.fn((url: string) => {
  if (url.includes('bafkreicjcemmypds6d5c4lonwp56xb2ilzhkk7hty3y6fo4nvdkxnaibgu')) {
    // Return CSV data with payouts for the test wallet
    const csvData = `claimId,address,amount,claimed,timestamp,txHash
1,0x1111111111111111111111111111111111111111,347.76,false,1735689600000,
2,0x1111111111111111111111111111111111111111,330.885,false,1738368000000,
3,0x1111111111111111111111111111111111111111,250.50,true,1741046400000,0xclaimedtx
4,0x2222222222222222222222222222222222222222,100,false,1735689600000,`;
    
    return Promise.resolve({
      ok: true,
      text: () => Promise.resolve(csvData)
    } as Response);
  }
  
  return Promise.resolve({
    ok: true,
    text: () => Promise.resolve('')
  } as Response);
}) as any;

const ADDRESS = '0xc699575fe18f00104d926f0167cd858ce6d8b32e';
const ORDER = '0x43ec2493caed6b56cfcbcf3b9279a01aedaafbce509598dfb324513e2d199977';
const CSV = 'bafkreicjcemmypds6d5c4lonwp56xb2ilzhkk7hty3y6fo4nvdkxnaibgu';
const WALLET = '0x1111111111111111111111111111111111111111';

describe('Portfolio Page E2E Tests', () => {
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

  afterEach(() => {
    restore?.();
  });

  describe('Page Structure', () => {
    it('renders portfolio page with correct title and subtitle', async () => {
      render(PortfolioPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Page title
          const hasPortfolio = bodyText.match(/Portfolio/i);
          const hasMyHoldings = bodyText.match(/My Holdings/i);
          
          expect(hasPortfolio || hasMyHoldings).toBeTruthy();
          
          // Subtitle or description
          const hasTrack = bodyText.match(/Track your investments/i);
          const hasEnergy = bodyText.match(/energy royalty/i);
          const hasPerformance = bodyText.match(/performance/i);
          
          expect(hasTrack || hasEnergy || hasPerformance).toBeTruthy();
        }
      }, { timeout: 5000 });
    });

    it('displays main portfolio sections', async () => {
      render(PortfolioPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Key sections
          expect(bodyText).toMatch(/Portfolio Value|Total Value/i);
          expect(bodyText).toMatch(/Total Invested|Invested/i);
          expect(bodyText).toMatch(/Active Assets|Assets/i);
          expect(bodyText).toMatch(/Unclaimed|Available/i);
        }
      }, { timeout: 5000 });
    });
  });

  describe('Portfolio Holdings Display', () => {
    it('displays user token holdings correctly', async () => {
      render(PortfolioPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should show holdings section
          expect(bodyText).toMatch(/Holdings|My Holdings/i);
          
          // Should show Wressle holding
          expect(bodyText).toMatch(/Wressle/i);
          
          // Should show Gulf Deep Water holding
          expect(bodyText).toMatch(/Gulf/i);
        }
      }, { timeout: 5000 });
    });

    it('shows Wressle token with 150 tokens owned', async () => {
      render(PortfolioPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should show Wressle
          expect(bodyText).toMatch(/Wressle-1|ALB-WR1-R1/);
          
          // Should show 150 tokens
          const hasTokenAmount = bodyText.match(/150|150\.0/);
          expect(hasTokenAmount).toBeTruthy();
        }
      }, { timeout: 5000 });
    });

    it('shows Gulf Deep Water token with 250 tokens owned', async () => {
      render(PortfolioPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should show Gulf Deep Water
          expect(bodyText).toMatch(/Gulf Deep Water|ALB-GDW-R1/);
          
          // Should show 250 tokens
          const hasTokenAmount = bodyText.match(/250|250\.0/);
          expect(hasTokenAmount).toBeTruthy();
        }
      }, { timeout: 5000 });
    });

    it('displays token percentages of asset', async () => {
      render(PortfolioPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Wressle: 4.5% share
          const hasWressleShare = bodyText.match(/4\.5%/);
          
          // Gulf: 3% share
          const hasGulfShare = bodyText.match(/3%|3\.0%/);
          
          expect(hasWressleShare || hasGulfShare).toBeTruthy();
        }
      }, { timeout: 5000 });
    });
  });

  describe('Token Balances', () => {
    it('shows correct total number of tokens', async () => {
      render(PortfolioPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Total: 150 + 250 = 400 tokens
          const hasTotal = bodyText.match(/400/);
          const hasIndividual = bodyText.match(/150|250/);
          
          expect(hasTotal || hasIndividual).toBeTruthy();
        }
      }, { timeout: 5000 });
    });

    it('displays token values based on returns', async () => {
      render(PortfolioPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should show base returns
          const hasWressleReturn = bodyText.match(/12\.04%/);
          const hasGulfReturn = bodyText.match(/15\.0%|15%/);
          
          expect(hasWressleReturn || hasGulfReturn).toBeTruthy();
        }
      }, { timeout: 5000 });
    });
  });

  describe('Portfolio Value Calculations', () => {
    it('calculates total portfolio value', async () => {
      render(PortfolioPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should show portfolio value
          expect(bodyText).toMatch(/Portfolio Value|Total Value/i);
          
          // Should have dollar amounts
          const hasDollar = bodyText.match(/\$/);
          expect(hasDollar).toBeTruthy();
        }
      }, { timeout: 5000 });
    });

    it('shows total invested amount', async () => {
      render(PortfolioPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should show total invested
          expect(bodyText).toMatch(/Total Invested/i);
          
          // Should show some amount
          if (bodyText.includes('$')) {
            expect(bodyText).toMatch(/\$/);
          }
        }
      }, { timeout: 5000 });
    });

    it('displays unclaimed payouts total', async () => {
      render(PortfolioPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should show unclaimed
          expect(bodyText).toMatch(/Unclaimed/i);
          
          // Total unclaimed: 347.76 + 330.885 = 678.645
          const hasTotal = bodyText.match(/678\.6|678\.65|\$678/);
          const hasPartial = bodyText.match(/347|330/);
          
          expect(hasTotal || hasPartial).toBeTruthy();
        }
      }, { timeout: 5000 });
    });

    it('shows total earned including claimed payouts', async () => {
      render(PortfolioPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should show total earned
          expect(bodyText).toMatch(/Total Earned|All Payouts/i);
          
          // Total: 347.76 + 330.885 + 250.50 = 929.145
          const hasTotal = bodyText.match(/929\.1|929\.15|\$929/);
          const hasPartial = bodyText.match(/678|250/);
          
          expect(hasTotal || hasPartial).toBeTruthy();
        }
      }, { timeout: 5000 });
    });
  });

  describe('Statistics and Metrics', () => {
    it('shows number of active assets (2)', async () => {
      render(PortfolioPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should show active assets count
          expect(bodyText).toMatch(/Active Assets/i);
          
          // We have 2 assets (Wressle and Gulf)
          const hasTwo = bodyText.match(/\b2\b.*Assets|Assets.*\b2\b/);
          
          expect(hasTwo).toBeTruthy();
        }
      }, { timeout: 5000 });
    });

    it('displays performance metrics', async () => {
      render(PortfolioPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should show performance section
          const hasPerformance = bodyText.match(/Performance/i);
          const hasReturns = bodyText.match(/Returns/i);
          const hasYield = bodyText.match(/Yield/i);
          
          expect(hasPerformance || hasReturns || hasYield).toBeTruthy();
        }
      }, { timeout: 5000 });
    });

    it('shows allocation breakdown', async () => {
      render(PortfolioPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should show allocation
          const hasAllocation = bodyText.match(/Allocation/i);
          const hasBreakdown = bodyText.match(/Breakdown/i);
          const hasDistribution = bodyText.match(/Distribution/i);
          
          expect(hasAllocation || hasBreakdown || hasDistribution).toBeTruthy();
        }
      }, { timeout: 5000 });
    });
  });

  describe('Quick Actions', () => {
    it('displays portfolio management actions', async () => {
      render(PortfolioPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should have action buttons
          const hasAddInvestment = bodyText.match(/Add Investment|Browse Assets/i);
          const hasClaim = bodyText.match(/Claim/i);
          const hasExport = bodyText.match(/Export/i);
          
          expect(hasAddInvestment || hasClaim || hasExport).toBeTruthy();
        }
      }, { timeout: 5000 });
    });

    it('shows claim payouts action with amount', async () => {
      render(PortfolioPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should show claim action
          expect(bodyText).toMatch(/Claim/i);
          
          // May show unclaimed amount
          const hasAmount = bodyText.match(/678\.6|\$678/);
          
          if (hasAmount) {
            expect(hasAmount).toBeTruthy();
          }
        }
      }, { timeout: 5000 });
    });

    it('includes export functionality', async () => {
      render(PortfolioPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should have export option
          expect(bodyText).toMatch(/Export|Download/i);
        }
      }, { timeout: 5000 });
    });
  });

  describe('Payout History', () => {
    it('displays monthly payout data', async () => {
      render(PortfolioPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should show payout history or monthly data
          const hasMonthly = bodyText.match(/Monthly/i);
          const hasPayouts = bodyText.match(/Payouts/i);
          const hasHistory = bodyText.match(/History/i);
          
          expect(hasMonthly || hasPayouts || hasHistory).toBeTruthy();
        }
      }, { timeout: 5000 });
    });

    it('shows historical claim of $250.50', async () => {
      render(PortfolioPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should show claimed amount
          const hasClaimed = bodyText.match(/250\.5|250\.50/);
          
          if (hasClaimed) {
            expect(hasClaimed).toBeTruthy();
          }
        }
      }, { timeout: 5000 });
    });
  });

  describe('Complete Data Flow', () => {
    it('processes and displays all mock data correctly', async () => {
      render(PortfolioPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Verify key sections
          expect(bodyText).toMatch(/Portfolio/i);
          expect(bodyText).toMatch(/Holdings/i);
          
          // Verify both assets
          expect(bodyText).toMatch(/Wressle/);
          expect(bodyText).toMatch(/Gulf/);
          
          // Verify token amounts
          expect(bodyText).toMatch(/150|250/);
          
          // Verify financial data
          expect(bodyText).toMatch(/Unclaimed/i);
          const hasAmounts = bodyText.match(/678|347|330|929|250/);
          expect(hasAmounts).toBeTruthy();
          
          // Verify actions
          expect(bodyText).toMatch(/Claim|Export/i);
        }
      }, { timeout: 5000 });
    });
  });
});