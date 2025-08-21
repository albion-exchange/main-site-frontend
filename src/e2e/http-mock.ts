// Reusable HTTP-level fetch mock for subgraph and IPFS endpoints

import axios from 'axios';
import { createEncodedMetadata, wressleMetadata } from './cbor-test-helper';

export type SftMockData = {
  address: string;
  name: string;
  symbol: string;
  totalShares: string;
  metadata?: any;
};

export type HttpMockConfig = {
  sftSubgraphUrl: string;
  metadataSubgraphUrl: string;
  orderbookSubgraphUrl: string;
  ipfsGateway: string;
  wallet: string;
  address: string; // Keep for backward compatibility
  orderHash: string;
  csvCid: string;
  hypersyncUrl?: string;
  sfts?: SftMockData[]; // Optional array of SFT data
};

export function installHttpMocks(cfg: HttpMockConfig) {
  const originalFetch = globalThis.fetch;
  const originalAxiosPost = axios.post;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    const method = init?.method || 'GET';

    // CSV file from IPFS - Using Wressle production values
    if (url.startsWith(`${cfg.ipfsGateway}/`) && url.includes(cfg.csvCid)) {
      // May: $347.76, June: $330.885 from Wressle projections
      // Note: amounts are in wei (18 decimals)
      const csv = `index,address,amount\n0,${cfg.wallet.toLowerCase()},347760000000000000000\n1,${cfg.wallet.toLowerCase()},330885000000000000000\n2,0x2222222222222222222222222222222222222222,336240000000000000000`;
      return new Response(csv, { status: 200, headers: { 'Content-Type': 'text/csv' } });
    }
    
    // Second CSV file from IPFS - for other claims
    if (url.startsWith(`${cfg.ipfsGateway}/`) && url.includes('bafkreiothercsvfile')) {
      const csv = `index,address,amount\n0,${cfg.wallet.toLowerCase()},250000000000000000000\n1,${cfg.wallet.toLowerCase()},180000000000000000000\n2,0x3333333333333333333333333333333333333333,150000000000000000000`;
      return new Response(csv, { status: 200, headers: { 'Content-Type': 'text/csv' } });
    }

    // Token metadata from IPFS with planned production for ~12% base return
    if (url.startsWith(`${cfg.ipfsGateway}/`) && url.includes('QmWressleMetadata')) {
      const metadata = {
        name: 'Wressle-1 4.5% Royalty Stream',
        symbol: 'ALB-WR1-R1',
        contractAddress: cfg.address,
        attributes: {
          sharePercentage: 2.5, // 2.5% royalty from actual Wressle data
          oilPriceAssumption: 65, // Exact value from Wressle data
          benchmarkPremium: -1.3,  // Actual Wressle benchmark discount
          baseReturn: 12.04,  // Calculated exact base return
          bonusReturn: 3472.2,  // Calculated exact bonus return with 1500 minted
          location: 'Lincolnshire, United Kingdom',
          operator: 'Egdon Resources',
          status: 'Producing',
          benchmark: 'Brent',
          commodity: 'Oil',
          paymentFrequency: '30 days',
          breakEvenOilPrice: 6.94,
          impliedBarrelsPerToken: 0.144,
          transportCosts: 0,
          plannedProduction: {
            oilPriceAssumption: 65,
            oilPriceAssumptionCurrency: 'USD',
            projections: [
              // Exact production data from wressle-r1.json
              { month: '2025-05', production: 347.76, revenue: 0 },
              { month: '2025-06', production: 330.885, revenue: 0 },
              { month: '2025-07', production: 336.24, revenue: 0 },
              { month: '2025-08', production: 330.615, revenue: 0 },
              { month: '2025-09', production: 314.64, revenue: 0 },
              { month: '2025-10', production: 319.725, revenue: 0 },
              { month: '2025-11', production: 304.245, revenue: 0 },
              { month: '2025-12', production: 302.85, revenue: 0 },
              { month: '2026-01', production: 297.72, revenue: 0 },
              { month: '2026-02', production: 252.675, revenue: 0 },
              { month: '2026-03', production: 280.08, revenue: 0 },
              { month: '2026-04', production: 136.26, revenue: 0 },
              { month: '2026-05', production: 397.125, revenue: 0 },
              { month: '2026-06', production: 339.75, revenue: 0 },
              { month: '2026-07', production: 328.095, revenue: 0 },
              { month: '2026-08', production: 305.1, revenue: 0 },
              { month: '2026-09', production: 301.32, revenue: 0 },
              { month: '2026-10', production: 317.025, revenue: 0 },
              { month: '2026-11', production: 307.665, revenue: 0 },
              { month: '2026-12', production: 311.355, revenue: 0 },
              { month: '2027-01', production: 273.96, revenue: 0 },
              { month: '2027-02', production: 221.58, revenue: 0 },
              { month: '2027-03', production: 229.14, revenue: 0 },
              { month: '2027-04', production: 219.375, revenue: 0 },
              { month: '2027-05', production: 227.655, revenue: 0 },
              { month: '2027-06', production: 217.08, revenue: 0 },
              { month: '2027-07', production: 217.755, revenue: 0 },
              { month: '2027-08', production: 203.85, revenue: 0 },
              { month: '2027-09', production: 184.455, revenue: 0 },
              { month: '2027-10', production: 177.885, revenue: 0 },
              { month: '2027-11', production: 159.84, revenue: 0 },
              { month: '2027-12', production: 225.78, revenue: 0 }  // Fixed the last month value
            ]
          }
        }
      };
      return new Response(JSON.stringify(metadata), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Subgraph POST endpoints
    if (method.toUpperCase() === 'POST') {
      try {
        const body = typeof init?.body === 'string' ? init!.body : '';
        const query = body;

        // SFT subgraph
        if (url === cfg.sftSubgraphUrl) {
          // Default to vaults response for test queries
          if (query.includes('depositWithReceipts')) {
            const data = {
              data: {
                depositWithReceipts: [
                  {
                    id: 'dep1',
                    amount: '1500000000000000000', // 1.5 tokens
                    caller: { address: cfg.wallet },
                    offchainAssetReceiptVault: { 
                      id: cfg.address,
                      name: 'Wressle-1 4.5% Royalty Stream',
                      symbol: 'ALB-WR1-R1'
                    },
                  },
                ],
              },
            };
            return jsonRes(data);
          }
          if (query.includes('offchainAssetReceiptVaults')) {
            // Use provided SFTs array or default to single SFT for backward compatibility
            const sftVaults = cfg.sfts ? cfg.sfts.map(sft => ({
              id: sft.address,
              totalShares: sft.totalShares,
              sharesSupply: sft.totalShares,
              address: sft.address,
              deployer: cfg.wallet,
              admin: cfg.wallet,
              name: sft.name,
              symbol: sft.symbol,
              deployTimestamp: `${Math.floor(Date.now() / 1000)}`,
              receiptContractAddress: sft.address,
              tokenHolders: [
                {
                  address: cfg.wallet,
                  balance: '1500000000000000000' // 1.5 tokens
                }
              ],
              shareHolders: [],
              shareTransfers: [],
              receiptBalances: [],
              certifications: [],
              receiptVaultInformations: [],
              deposits: [],
              withdraws: [],
              activeAuthorizer: { address: cfg.wallet, rolesGranted: [], roleHolders: [], roles: [], roleRevokes: [] },
            })) : [
              // Default single SFT for backward compatibility
              {
                id: cfg.address,
                totalShares: '1500000000000000000000',
                sharesSupply: '1500000000000000000000',
                address: cfg.address,
                deployer: cfg.wallet,
                admin: cfg.wallet,
                name: 'Wressle-1 4.5% Royalty Stream',
                symbol: 'ALB-WR1-R1',
                deployTimestamp: `${Math.floor(Date.now() / 1000)}`,
                receiptContractAddress: cfg.address,
                tokenHolders: [
                  {
                    address: cfg.wallet,
                    balance: '1500000000000000000' // 1.5 tokens
                  }
                ],
                shareHolders: [],
                shareTransfers: [],
                receiptBalances: [],
                certifications: [],
                receiptVaultInformations: [],
                deposits: [],
                withdraws: [],
                activeAuthorizer: { address: cfg.wallet, rolesGranted: [], roleHolders: [], roles: [], roleRevokes: [] },
              }
            ];
            
            const data = {
              data: {
                offchainAssetReceiptVaults: sftVaults,
              },
            };
            return jsonRes(data);
          }
          // Default response for any other SFT query (like 'test')
          const defaultData = {
            data: {
              vaults: [{
                id: cfg.address,
                sharesSupply: '1500000000000000000000', // 1500 tokens minted
                totalShares: '1500000000000000000000', // 1500 tokens in wei
                name: 'Wressle-1 4.5% Royalty Stream',
                symbol: 'ALB-WR1-R1'
              }]
            }
          };
          return jsonRes(defaultData);
        }

        // Metadata subgraph
        if (url === cfg.metadataSubgraphUrl) {
          if (query.includes('metaV1S')) {
            // Create metadata for all SFTs
            const metadataEntries = cfg.sfts ? cfg.sfts.map((sft, index) => ({
              id: `meta-${index + 1}`,
              meta: createEncodedMetadata(sft.metadata || wressleMetadata),
              subject: `0x000000000000000000000000${sft.address.slice(2)}`,
              metaHash: `0x${(1234 + index).toString(16)}`,
              sender: cfg.wallet,
            })) : [
              // Default single metadata for backward compatibility
              {
                id: 'meta-1',
                meta: createEncodedMetadata(wressleMetadata),
                subject: `0x000000000000000000000000${cfg.address.slice(2)}`,
                metaHash: '0x1234',
                sender: cfg.wallet,
              }
            ];
            
            const data = {
              data: {
                metaV1S: metadataEntries,
              },
            };
            return jsonRes(data);
          }
          // Default response for any other metadata query
          const defaultMetaData = {
            data: {
              metaV1S: [{
                metaURI: 'QmWressleMetadata',
                data: JSON.stringify({
                  name: 'Wressle-1 4.5% Royalty Stream',
                  symbol: 'ALB-WR1-R1'
                })
              }]
            }
          };
          return jsonRes(defaultMetaData);
        }

        // Orderbook subgraph
        if (url === cfg.orderbookSubgraphUrl) {
          if (query.includes('trades')) {
            const data = {
              data: {
                trades: [
                  {
                    order: { orderBytes: '0x', orderHash: cfg.orderHash },
                    orderbook: { id: '0xorderbook' },
                    tradeEvent: { transaction: { id: '0xtrx', blockNumber: 100, timestamp: 1700000000 }, sender: cfg.wallet },
                  },
                ],
              },
            };
            return jsonRes(data);
          }
          if (query.includes('orders')) {
            const data = {
              data: {
                orders: [
                  { orderBytes: '0x', orderHash: cfg.orderHash, orderbook: { id: '0xorderbook' } },
                ],
              },
            };
            return jsonRes(data);
          }
        }
      } catch {
        // fallthrough to original
      }
    }

    return originalFetch(input, init);
  }) as any;

  if (cfg.hypersyncUrl) {
    axios.post = (async (url: string, payload?: any) => {
      if (url === cfg.hypersyncUrl) {
        // Return empty logs array to simulate no claimed payouts
        // This matches what would happen if there are no Context events on-chain
        return {
          data: {
            data: [
              {
                blocks: [
                  { number: 100, timestamp: '0x65f5e100' },
                ],
                logs: [], // Empty array - no claimed payouts yet
              },
            ],
            next_block: 101,
          },
        } as any;
      }
      return originalAxiosPost(url as any, payload);
    }) as any;
  }

  return () => {
    globalThis.fetch = originalFetch;
    axios.post = originalAxiosPost;
  };
}

function jsonRes(obj: any) {
  return new Response(JSON.stringify(obj), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}