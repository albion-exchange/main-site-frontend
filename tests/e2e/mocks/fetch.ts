/**
 * HTTP Endpoint Mock for E2E tests
 * Mocks the actual API endpoints that the application calls
 */

import { testDataProvider } from "../data/testData";

export class HTTPEndpointMock {
  private originalFetch: typeof fetch;

  // Actual production endpoints
  private readonly endpoints = {
    SFT_SUBGRAPH: "https://api.goldsky.com/api/public/project_cm153vmqi5gke01vy66p4ftzf/subgraphs/sft-offchainassetvaulttest-base/1.0.4/gn",
    ORDERBOOK_SUBGRAPH: "https://api.goldsky.com/api/public/project_clv14x04y9kzi01saerx7bxpg/subgraphs/ob4-base/2024-12-13-9c39/gn",
    METADATA_SUBGRAPH: "https://api.goldsky.com/api/public/project_clv14x04y9kzi01saerx7bxpg/subgraphs/metadata-base/2025-07-06-594f/gn",
    PINATA_GATEWAY: "https://gateway.pinata.cloud/ipfs",
    HYPERSYNC_API: "https://8453.hypersync.xyz/query",
    ALPHA_VANTAGE: "https://www.alphavantage.co/query"
  };

  constructor() {
    this.originalFetch = global.fetch;
  }

  install() {
    global.fetch = this.createMockFetch();
    console.log("HTTP Endpoint Mock installed - intercepting real API calls");
  }

  uninstall() {
    global.fetch = this.originalFetch;
    console.log("HTTP Endpoint Mock uninstalled");
  }

  private createMockFetch() {
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      
      // Mock PINATA IPFS Gateway
      if (url.includes(this.endpoints.PINATA_GATEWAY)) {
        return this.mockPinataGateway(url);
      }
      
      // Mock Goldsky Subgraph APIs
      if (url === this.endpoints.SFT_SUBGRAPH && init?.method === 'POST') {
        return this.mockSftSubgraph(init.body as string);
      }
      
      if (url === this.endpoints.METADATA_SUBGRAPH && init?.method === 'POST') {
        return this.mockMetadataSubgraph(init.body as string);
      }
      
      if (url === this.endpoints.ORDERBOOK_SUBGRAPH && init?.method === 'POST') {
        return this.mockOrderbookSubgraph(init.body as string);
      }

      // Mock HyperSync API
      if (url === this.endpoints.HYPERSYNC_API && init?.method === 'POST') {
        return this.mockHyperSyncAPI(init.body as string);
      }

      // Mock Alpha Vantage API
      if (url.includes(this.endpoints.ALPHA_VANTAGE)) {
        return this.mockAlphaVantageAPI(url);
      }

      // For unmocked endpoints, log and return 404
      console.warn(`Unmocked HTTP call to: ${url}`);
      return new Response("Not Found - Add this endpoint to the mock", { status: 404 });
    };
  }

  // Mock PINATA IPFS Gateway
  private async mockPinataGateway(url: string): Promise<Response> {
    const hash = url.split('/').pop();
    
    if (!hash) {
      return new Response("Not Found", { status: 404 });
    }

    // Mock CSV files
    const csvData = testDataProvider.getCsvData(hash);
    if (csvData.length > 0) {
      const csvText = this.convertArrayToCsv(csvData);
      return new Response(csvText, {
        status: 200,
        headers: { 'Content-Type': 'text/csv' }
      });
    }

    // Mock IPFS metadata
    const metadata = testDataProvider.getIpfsMetadata(hash);
    if (metadata) {
      return new Response(JSON.stringify(metadata), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Mock cover images
    if (hash.startsWith('QmTestCover')) {
      return new Response("mock-image-data", {
        status: 200,
        headers: { 'Content-Type': 'image/jpeg' }
      });
    }

    return new Response("Not Found", { status: 404 });
  }

  // Mock SFT Subgraph API
  private async mockSftSubgraph(body: string): Promise<Response> {
    try {
      const requestBody = JSON.parse(body);
      const query = requestBody.query;

      // Return mock SFT data
      const sftData = testDataProvider.getSftData();
      
      const response = {
        data: {
          offchainAssetReceiptVaults: sftData
        }
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ errors: [{ message: "Invalid GraphQL query" }] }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Mock Metadata Subgraph API
  private async mockMetadataSubgraph(body: string): Promise<Response> {
    try {
      const requestBody = JSON.parse(body);
      const query = requestBody.query;

      // Return mock metadata
      const metadata = testDataProvider.getMetadata();
      
      const response = {
        data: {
          metaV1S: metadata
        }
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ errors: [{ message: "Invalid GraphQL query" }] }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Mock Orderbook Subgraph API
  private async mockOrderbookSubgraph(body: string): Promise<Response> {
    try {
      const requestBody = JSON.parse(body);
      
      // Return empty orderbook data for now
      const response = {
        data: {
          orders: [],
          tradeEvents: []
        }
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ errors: [{ message: "Invalid GraphQL query" }] }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Mock HyperSync API
  private async mockHyperSyncAPI(body: string): Promise<Response> {
    try {
      const requestBody = JSON.parse(body);
      
      // Return mock blockchain log data
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
    } catch (error) {
      return new Response("Bad Request", { status: 400 });
    }
  }

  // Mock Alpha Vantage API
  private async mockAlphaVantageAPI(url: string): Promise<Response> {
    // Extract commodity from URL
    const urlParams = new URLSearchParams(url.split('?')[1]);
    const commodity = urlParams.get('function') || 'WTI';
    
    // Return mock commodity price data
    const mockData = {
      "Meta Data": {
        "1. Information": `Daily Prices for ${commodity}`,
        "2. Symbol": commodity,
        "3. Last Refreshed": "2024-01-15"
      },
      "Time Series (Daily)": {
        "2024-01-15": {
          "1. open": "72.50",
          "2. high": "74.20",
          "3. low": "71.80",
          "4. close": "73.45"
        },
        "2024-01-14": {
          "1. open": "71.90",
          "2. high": "73.10", 
          "3. low": "71.40",
          "4. close": "72.50"
        }
      }
    };

    return new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private generateMockLogData(): string {
    // Generate mock encoded log data for claims
    const mockAddress = "0x742d35Cc6834C532532C5c2BF03B4e99E6d7eA4C";
    
    // Encode similar to how ethers would encode [address, uint256[][]]
    return "0x000000000000000000000000742d35cc6834c532532c5c2bf03b4e99e6d7ea4c0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000700000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001800000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000016345785d8a0000";
  }

  private convertArrayToCsv(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header] || '').join(','))
    ];
    
    return csvRows.join('\n');
  }
}

// Export singleton
export const httpEndpointMock = new HTTPEndpointMock();