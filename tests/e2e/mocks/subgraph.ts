/**
 * Mock Subgraph API for E2E tests
 * Handles GraphQL queries for SFTs and metadata
 */

import { testDataProvider } from "../data/testData";

export class MockSubgraphAPI {
  private sftSubgraphUrl = "https://api.goldsky.com/api/public/project_cm153vmqi5gke01vy66p4ftzf/subgraphs/sft-offchainassetvaulttest-base/1.0.4/gn";
  private metadataSubgraphUrl = "https://api.goldsky.com/api/public/project_clv14x04y9kzi01saerx7bxpg/subgraphs/metadata-base/2025-07-06-594f/gn";
  private originalFetch: typeof fetch;

  constructor() {
    this.originalFetch = global.fetch;
  }

  async start() {
    // This mock is handled by intercepting fetch in the existing fetch mock
    console.log("Mock Subgraph API started");
  }

  async stop() {
    console.log("Mock Subgraph API stopped");
  }

  reset() {
    // Reset any state if needed
  }

  // This method is called by the fetch mock when subgraph URLs are detected
  async handleSubgraphRequest(url: string, body: string): Promise<Response> {
    try {
      const requestBody = JSON.parse(body);
      const query = requestBody.query;

      if (url.includes("sft-offchainassetvaulttest")) {
        return this.handleSftQuery(query);
      } else if (url.includes("metadata-base")) {
        return this.handleMetadataQuery(query);
      }

      return new Response(JSON.stringify({ errors: [{ message: "Unknown subgraph" }] }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ errors: [{ message: "Invalid query" }] }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  private async handleSftQuery(query: string): Promise<Response> {
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
  }

  private async handleMetadataQuery(query: string): Promise<Response> {
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
  }
}

// Extend the IPFS mock to also handle subgraph requests
const originalCreateMockFetch = MockIPFSGateway.prototype.createMockFetch;

// We need to import this properly, but for now let's create a singleton
export const mockSubgraphAPI = new MockSubgraphAPI();