/**
 * Unified fetch mock for E2E tests
 * Routes requests to appropriate mock services
 */

import { MockIPFSGateway } from "./ipfs";
import { MockSubgraphAPI } from "./subgraph";

export class UnifiedFetchMock {
  private ipfsGateway: MockIPFSGateway;
  private subgraphAPI: MockSubgraphAPI;
  private originalFetch: typeof fetch;

  constructor() {
    this.ipfsGateway = new MockIPFSGateway();
    this.subgraphAPI = new MockSubgraphAPI();
    this.originalFetch = global.fetch;
  }

  install() {
    global.fetch = this.createMockFetch();
  }

  uninstall() {
    global.fetch = this.originalFetch;
  }

  private createMockFetch() {
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      
      // Route IPFS requests
      if (url.includes('gateway.pinata.cloud/ipfs')) {
        return this.handleIPFSRequest(url);
      }
      
      // Route subgraph requests
      if (url.includes('api.goldsky.com') && init?.method === 'POST') {
        return this.handleSubgraphRequest(url, init.body as string);
      }

      // Route HyperSync requests (for claims data)
      if (url.includes('hypersync.xyz')) {
        return this.handleHyperSyncRequest(url, init?.body as string);
      }

      // For any other requests, use original fetch or return 404
      try {
        return await this.originalFetch(input, init);
      } catch {
        return new Response("Not Found", { status: 404 });
      }
    };
  }

  private async handleIPFSRequest(url: string): Promise<Response> {
    return this.ipfsGateway['handleIpfsRequest'](url);
  }

  private async handleSubgraphRequest(url: string, body: string): Promise<Response> {
    return this.subgraphAPI.handleSubgraphRequest(url, body);
  }

  private async handleHyperSyncRequest(url: string, body: string): Promise<Response> {
    // Mock HyperSync API for blockchain log queries
    try {
      const requestBody = JSON.parse(body);
      
      // Return mock log data for claims
      const mockLogs = {
        data: [
          {
            blocks: [
              { number: 12000000, timestamp: "0x65f0a123" }
            ],
            logs: [
              {
                block_number: 12000000,
                transaction_hash: `0x${Math.random().toString(16).substr(2, 64)}`,
                data: this.generateMockLogData(),
                address: "0xd2938E7c9fe3597F78832CE780Feb61945c377d7",
                topic0: "0x17a5c0f3785132a57703932032f6863e7920434150aa1dc940e567b440fdce1f"
              }
            ]
          }
        ],
        next_block: 12000001
      };

      return new Response(JSON.stringify(mockLogs), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch {
      return new Response("Bad Request", { status: 400 });
    }
  }

  private generateMockLogData(): string {
    // Generate mock encoded log data for claims
    // This should match the format expected by the decodeLogData function
    const mockAddress = "0x742d35Cc6834C532532C5c2BF03B4e99E6d7eA4C";
    const mockContext = [
      [], [], [], [], [], [],
      [1, "100000000000000000"] // index and amount
    ];
    
    // Encode similar to how ethers would encode [address, uint256[][]]
    return "0x000000000000000000000000742d35cc6834c532532c5c2bf03b4e99e6d7ea4c0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000700000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001800000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000016345785d8a0000";
  }
}

// Export singleton
export const fetchMock = new UnifiedFetchMock();