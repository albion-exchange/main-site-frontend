/**
 * Mock IPFS Gateway for E2E tests
 * Serves CSV files and metadata for the test smart contracts
 */

import { testDataProvider } from "../data/testData";

export class MockIPFSGateway {
  private baseUrl = "https://gateway.pinata.cloud/ipfs";
  private originalFetch: typeof fetch;

  constructor() {
    this.originalFetch = global.fetch;
  }

  async start() {
    // Mock fetch for IPFS requests
    global.fetch = this.createMockFetch();
    console.log("Mock IPFS Gateway started");
  }

  async stop() {
    // Restore original fetch
    global.fetch = this.originalFetch;
    console.log("Mock IPFS Gateway stopped");
  }

  reset() {
    // Reset any state if needed
  }

  private createMockFetch() {
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      
      // Check if this is an IPFS request
      if (url.includes(this.baseUrl)) {
        return this.handleIpfsRequest(url);
      }
      
      // For non-IPFS requests, use the original fetch
      return this.originalFetch(input, init);
    };
  }

  private async handleIpfsRequest(url: string): Promise<Response> {
    const hash = url.split('/').pop();
    
    if (!hash) {
      return new Response("Not Found", { status: 404 });
    }

    // Handle CSV files
    const csvData = testDataProvider.getCsvData(hash);
    if (csvData.length > 0) {
      const csvText = this.convertArrayToCsv(csvData);
      return new Response(csvText, {
        status: 200,
        headers: { 'Content-Type': 'text/csv' }
      });
    }

    // Handle IPFS metadata
    const metadata = testDataProvider.getIpfsMetadata(hash);
    if (metadata) {
      return new Response(JSON.stringify(metadata), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle cover images (return a placeholder)
    if (hash.startsWith('QmTestCover')) {
      return new Response("mock-image-data", {
        status: 200,
        headers: { 'Content-Type': 'image/jpeg' }
      });
    }

    return new Response("Not Found", { status: 404 });
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