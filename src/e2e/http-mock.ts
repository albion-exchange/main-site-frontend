// Reusable HTTP-level fetch mock for subgraph and IPFS endpoints

export type HttpMockConfig = {
  sftSubgraphUrl: string;
  metadataSubgraphUrl: string;
  orderbookSubgraphUrl: string;
  ipfsGateway: string;
  wallet: string;
  address: string;
  orderHash: string;
  csvCid: string;
};

export function installHttpMocks(cfg: HttpMockConfig) {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    const method = init?.method || 'GET';

    // CSV file from IPFS
    if (url.startsWith(`${cfg.ipfsGateway}/`) && url.includes(cfg.csvCid)) {
      const csv = `index,address,amount\n0,${cfg.wallet},1000000000000000000\n1,${cfg.wallet},2000000000000000000\n2,0x2222222222222222222222222222222222222222,3000000000000000000`;
      return new Response(csv, { status: 200 });
    }

    // Subgraph POST endpoints
    if (method.toUpperCase() === 'POST') {
      try {
        const body = typeof init?.body === 'string' ? init!.body : '';
        const query = body;

        // SFT subgraph
        if (url === cfg.sftSubgraphUrl) {
          if (query.includes('depositWithReceipts')) {
            const data = {
              data: {
                depositWithReceipts: [
                  {
                    id: 'dep1',
                    amount: '1000000000000000000',
                    caller: { address: cfg.wallet },
                    offchainAssetReceiptVault: { id: cfg.address },
                  },
                ],
              },
            };
            return jsonRes(data);
          }
          if (query.includes('offchainAssetReceiptVaults')) {
            const data = {
              data: {
                offchainAssetReceiptVaults: [
                  {
                    id: cfg.address,
                    totalShares: '0',
                    address: cfg.address,
                    deployer: cfg.wallet,
                    admin: cfg.wallet,
                    name: 'Permian Basin-3',
                    symbol: 'PBR1',
                    deployTimestamp: `${Math.floor(Date.now() / 1000)}`,
                    receiptContractAddress: cfg.address,
                    tokenHolders: [],
                    shareHolders: [],
                    shareTransfers: [],
                    receiptBalances: [],
                    certifications: [],
                    receiptVaultInformations: [],
                    deposits: [],
                    withdraws: [],
                    activeAuthorizer: { address: cfg.wallet, rolesGranted: [], roleHolders: [], roles: [], roleRevokes: [] },
                  },
                ],
              },
            };
            return jsonRes(data);
          }
        }

        // Metadata subgraph
        if (url === cfg.metadataSubgraphUrl) {
          if (query.includes('metaV1S')) {
            const data = {
              data: {
                metaV1S: [
                  {
                    id: 'meta-1',
                    meta: '0x',
                    subject: `0x000000000000000000000000${cfg.address.slice(2)}`,
                    metaHash: '0x',
                    sender: cfg.wallet,
                  },
                ],
              },
            };
            return jsonRes(data);
          }
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

  return () => {
    globalThis.fetch = originalFetch;
  };
}

function jsonRes(obj: any) {
  return new Response(JSON.stringify(obj), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}