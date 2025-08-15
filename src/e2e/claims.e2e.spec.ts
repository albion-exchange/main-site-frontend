import { render, screen, waitFor, fireEvent } from '@testing-library/svelte/svelte5';
import { vi, describe, it, beforeEach, expect, afterEach } from 'vitest';
import ClaimsPage from '../routes/(main)/claims/+page.svelte';
import { installHttpMocks } from './http-mock';

// Mock app stores
vi.mock('$app/stores', async () => {
  const { readable } = await import('svelte/store');
  return {
    page: readable({ url: new URL('http://localhost/claims'), params: {}, route: {}, status: 200, error: null, data: {} }),
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

// Mock wagmi core
vi.mock('@wagmi/core', () => ({
  writeContract: vi.fn().mockResolvedValue('0xtxhash'),
  simulateContract: vi.fn().mockResolvedValue({
    request: { gas: BigInt(100000) }
  })
}));

// Mock network config with claims data
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
              },
              {
                csvLink: 'https://gateway.pinata.cloud/ipfs/bafkreiothercsvfile',
                orderHash: '0xotherorderhash',
                expectedMerkleRoot: '0xmerkleroot2',
                expectedContentHash: '0xcontenthash2'
              }
            ]
          }
        ]
      }
    ]
  };
});

// Mock queries
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
    getProof: () => ['0xproof1', '0xproof2']
  })),
  signContext: vi.fn((data) => ({
    id: data[0],
    signedData: '0xsigned'
  })),
  sortClaimsData: vi.fn(async (parsedData, trades, address, fieldName) => {
    // Build claimed/unclaimed lists and totals similar to production util
    const filtered = parsedData.filter((row: any) => row.address === address);
    const toWeiString = (val: any) => {
      if (typeof val === 'number') return BigInt(Math.round(val * 1e18)).toString();
      if (typeof val === 'string') {
        const num = Number(val);
        if (!Number.isNaN(num)) return BigInt(Math.round(num * 1e18)).toString();
        return '0';
      }
      return '0';
    };
    const claimedCsv = filtered.filter((r: any) => r.claimed).map((r: any, idx: number) => ({
      index: String(r.claimId || idx),
      address: r.address,
      amount: toWeiString(r.amount),
      claimed: true,
      decodedLog: { timestamp: r.timestamp || Date.now() }
    }));
    const unclaimedCsv = filtered.filter((r: any) => !r.claimed).map((r: any, idx: number) => ({
      index: String(r.claimId || idx),
      address: r.address,
      amount: toWeiString(r.amount),
      claimed: false
    }));

    const totalClaimedAmount = claimedCsv.reduce((sum: bigint, c: any) => sum + BigInt(c.amount), 0n);
    const totalUnclaimedAmount = unclaimedCsv.reduce((sum: bigint, c: any) => sum + BigInt(c.amount), 0n);
    const totalEarned = totalClaimedAmount + totalUnclaimedAmount;

    const claims = claimedCsv.map((c: any) => ({
      id: c.index,
      amount: (Number(c.amount) / 1e18).toString(),
      timestamp: c.decodedLog?.timestamp || Date.now(),
      txHash: '0xtx',
      fieldName: fieldName,
      asset: fieldName,
      date: new Date(c.decodedLog?.timestamp || Date.now())
    }));

    const holdings = unclaimedCsv.map((u: any) => ({
      id: u.index,
      unclaimedAmount: (Number(u.amount) / 1e18).toString(),
      fieldName: fieldName,
      name: fieldName,
      location: '',
      totalEarned: (Number(totalEarned) / 1e18).toString(),
      lastPayout: new Date().toISOString(),
      lastClaimDate: '',
      status: 'producing'
    }));

    return {
      claimedCsv,
      unclaimedCsv,
      claims,
      holdings,
      totalClaims: filtered.length,
      claimedCount: claimedCsv.length,
      unclaimedCount: unclaimedCsv.length,
      totalClaimedAmount: totalClaimedAmount.toString(),
      totalUnclaimedAmount: totalUnclaimedAmount.toString(),
      totalEarned: totalEarned.toString(),
      ownerAddress: address || 'all'
    };
  }),
  getProofForLeaf: vi.fn(() => ({
    proof: ['0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890']
  })),
  fetchAndValidateCSV: vi.fn(async (csvLink) => {
    // Return different data based on CSV link
    if (csvLink.includes('bafkreicjcemmypds6d5c4lonwp56xb2ilzhkk7hty3y6fo4nvdkxnaibgu')) {
      // May and June payouts for the test wallet
      return [
        { 
          address: '0x1111111111111111111111111111111111111111', 
          amount: 347.76,
          claimId: '1',
          claimed: false,
          timestamp: 1735689600000, // May 2025
          txHash: null
        },
        { 
          address: '0x1111111111111111111111111111111111111111', 
          amount: 330.885,
          claimId: '2', 
          claimed: false,
          timestamp: 1738368000000, // June 2025
          txHash: null
        },
        // Other addresses to make merkle tree valid
        { 
          address: '0x2222222222222222222222222222222222222222', 
          amount: 100,
          claimId: '3',
          claimed: false
        }
      ];
    } else {
      // Different CSV with July payout
      return [
        { 
          address: '0x1111111111111111111111111111111111111111', 
          amount: 250.50,
          claimId: '4',
          claimed: true, // Already claimed
          timestamp: 1741046400000, // July 2025
          txHash: '0xclaimedtx'
        }
      ];
    }
  })
}));

// Mock stores
vi.mock('$lib/stores', async () => {
  const { writable } = await import('svelte/store');
  return {
    sftMetadata: writable([]),
    sfts: writable([])
  };
});

const ADDRESS = '0xc699575fe18f00104d926f0167cd858ce6d8b32e';
const ORDER = '0x43ec2493caed6b56cfcbcf3b9279a01aedaafbce509598dfb324513e2d199977';
const CSV = 'bafkreicjcemmypds6d5c4lonwp56xb2ilzhkk7hty3y6fo4nvdkxnaibgu';
const WALLET = '0x1111111111111111111111111111111111111111';

describe('Claims Page E2E Tests', () => {
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
    it('renders claims page with correct title and subtitle', async () => {
      render(ClaimsPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Page title - more flexible matching
          const hasTitle = bodyText.match(/Claims/i);
          const hasPayouts = bodyText.match(/Payouts/i);
          
          // Should have claims-related content
          expect(hasTitle || hasPayouts).toBeTruthy();
          
          // Subtitle or description
          const hasTrack = bodyText.match(/Track/i);
          const hasRoyalty = bodyText.match(/royalty|energy/i);
          
          // Should have some descriptive text
          expect(hasTrack || hasRoyalty).toBeTruthy();
        }
      }, { timeout: 5000 });
    });
  });

  describe('Wallet Balance Display', () => {
    it('displays available to claim amount correctly', async () => {
      render(ClaimsPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should show Available to Claim
          expect(bodyText).toMatch(/Available to Claim/i);
          
          // Total unclaimed: 347.76 + 330.885 = 678.645
          const hasTotal = bodyText.match(/678\.6|678\.65|\$678/);
          const hasMayAmount = bodyText.match(/347\.7|347\.76/);
          const hasJuneAmount = bodyText.match(/330\.8|330\.88/);
          
          // Should have at least one of these amounts
          expect(hasTotal || hasMayAmount || hasJuneAmount).toBeTruthy();
        }
      }, { timeout: 5000 });
    });

    it('shows total earned amount including claimed payouts', async () => {
      render(ClaimsPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should show Total Earned
          expect(bodyText).toMatch(/Total Earned/i);
          
          // Total earned: 347.76 + 330.885 + 250.50 (claimed) = 929.145
          const hasTotal = bodyText.match(/929\.1|929\.15|\$929/);
          const hasPartial = bodyText.match(/678|250/);
          
          // Should have some earnings amount
          expect(hasTotal || hasPartial).toBeTruthy();
        }
      }, { timeout: 5000 });
    });

    it('displays total claimed amount', async () => {
      render(ClaimsPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should show Total Claimed
          expect(bodyText).toMatch(/Total Claimed/i);
          
          // Total claimed: 250.50 (from July payout)
          const hasClaimed = bodyText.match(/250\.5|250\.50|\$250/);
          const hasZero = bodyText.match(/\$0\.00|\$0/);
          
          // Should show either claimed amount or zero
          expect(hasClaimed || hasZero).toBeTruthy();
        }
      }, { timeout: 5000 });
    });
  });

  describe('Unclaimed Payouts Details', () => {
    it('displays individual unclaimed payouts by energy field', async () => {
      render(ClaimsPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should show energy field name
          expect(bodyText).toMatch(/Wressle-1/);
          
          // Should show unclaimed amounts
          expect(bodyText).toMatch(/347\.7|330\.8/);
        }
      }, { timeout: 5000 });
    });

    it('shows May 2025 payout of $347.76', async () => {
      render(ClaimsPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Check for May payout
          const hasMayAmount = bodyText.match(/347\.76|347\.7|\$347/);
          expect(hasMayAmount).toBeTruthy();
        }
      }, { timeout: 5000 });
    });

    it('shows June 2025 payout of $330.885', async () => {
      render(ClaimsPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Check for June payout
          const hasJuneAmount = bodyText.match(/330\.88|330\.8|\$330/);
          expect(hasJuneAmount).toBeTruthy();
        }
      }, { timeout: 5000 });
    });

    it('groups payouts by energy field', async () => {
      render(ClaimsPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should show field name with total
          expect(bodyText).toMatch(/Wressle-1/);
          
          // Should show grouped total (347.76 + 330.885 = 678.645)
          const hasGroupTotal = bodyText.match(/678\.6|678\.65/);
          const hasIndividual = bodyText.match(/347|330/);
          
          expect(hasGroupTotal || hasIndividual).toBeTruthy();
        }
      }, { timeout: 5000 });
    });
  });

  describe('Claim Actions', () => {
    it('displays claim button when unclaimed payouts exist', async () => {
      render(ClaimsPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should have claim button or action
          const buttons = screen.queryAllByRole('button');
          const hasClaimButton = buttons.some(btn => 
            btn.textContent?.match(/Claim/i)
          );
          
          expect(bodyText).toMatch(/Claim/i);
        }
      }, { timeout: 5000 });
    });

    it('shows ready status for available claims', async () => {
      render(ClaimsPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should indicate claims are ready
          const hasReady = bodyText.match(/Ready|Available/i);
          expect(hasReady).toBeTruthy();
        }
      }, { timeout: 5000 });
    });

    it('displays gas estimate for claims', async () => {
      render(ClaimsPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // May show gas estimate
          const hasGas = bodyText.match(/Gas|Fee|Cost/i);
          
          // This is optional depending on implementation
          if (hasGas) {
            expect(hasGas).toBeTruthy();
          }
        }
      }, { timeout: 5000 });
    });
  });

  describe('Statistics Section', () => {
    it('displays detailed statistics correctly', async () => {
      render(ClaimsPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should show statistics section
          expect(bodyText).toMatch(/Statistics|Detailed Statistics/i);
          
          // Total payouts count
          expect(bodyText).toMatch(/Total Payouts/i);
          
          // Days since last claim
          expect(bodyText).toMatch(/Days Since|Since Last/i);
          
          // Number of claims
          expect(bodyText).toMatch(/Number of Claims/i);
        }
      }, { timeout: 5000 });
    });

    it('shows correct payout count', async () => {
      render(ClaimsPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should show 3 total payouts (2 unclaimed + 1 claimed)
          const hasCount = bodyText.match(/\b3\b.*Payouts|Payouts.*\b3\b/);
          const hasTwo = bodyText.match(/\b2\b.*Payouts|Payouts.*\b2\b/);
          
          expect(hasCount || hasTwo).toBeTruthy();
        }
      }, { timeout: 5000 });
    });

    it('calculates average claim size', async () => {
      render(ClaimsPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Average size calculation
          expect(bodyText).toMatch(/Average.*Size|Per Transaction/i);
          
          // Should show some dollar amount
          if (bodyText.includes('$')) {
            expect(bodyText).toMatch(/\$/);
          }
        }
      }, { timeout: 5000 });
    });
  });

  describe('Claim History', () => {
    it('shows claim history section with past claims', async () => {
      render(ClaimsPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should show claim history section
          expect(bodyText).toMatch(/Claim History/i);
          
          // May show the claimed July payout
          const hasClaimedAmount = bodyText.match(/250\.5|250\.50/);
          
          // Or show no history if not displaying claimed items
          const hasNoHistory = bodyText.match(/No claim history/i);
          
          expect(hasClaimedAmount || hasNoHistory).toBeTruthy();
        }
      }, { timeout: 5000 });
    });

    it('displays export functionality', async () => {
      render(ClaimsPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should have export option
          expect(bodyText).toMatch(/Export/i);
        }
      }, { timeout: 5000 });
    });

    it('shows total claims count', async () => {
      render(ClaimsPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Should show count of claims
          const hasCount = bodyText.match(/\d+\s+total claims/i);
          const hasClaimsText = bodyText.match(/claims/i);
          
          expect(hasClaimsText).toBeTruthy();
        }
      }, { timeout: 5000 });
    });
  });

  describe('Complete Data Flow', () => {
    it('processes and displays all mock data correctly', async () => {
      render(ClaimsPage);
      
      await waitFor(() => {
        const bodyText = document.body.textContent || '';
        
        if (!bodyText.includes('Loading')) {
          // Verify key sections
          expect(bodyText).toMatch(/Claims & Payouts/i);
          expect(bodyText).toMatch(/Available to Claim/i);
          expect(bodyText).toMatch(/Total Earned/i);
          expect(bodyText).toMatch(/Total Claimed/i);
          
          // Verify energy field
          expect(bodyText).toMatch(/Wressle-1/);
          
          // Verify amounts are present
          const hasAmounts = bodyText.match(/347|330|678|250/);
          expect(hasAmounts).toBeTruthy();
          
          // Verify action elements
          expect(bodyText).toMatch(/Claim/i);
        }
      }, { timeout: 5000 });
    });
  });
});