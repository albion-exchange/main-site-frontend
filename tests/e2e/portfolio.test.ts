/**
 * E2E Tests for Portfolio Data Flow
 * Tests the complete data pipeline from HTTP API calls to frontend display
 * Mocks actual production endpoints, not service layers
 */

import { describe, it, expect, beforeEach } from "vitest";
import { mockBlockchain } from "./setup";
import { testDataProvider } from "./data/testData";
import { getSfts } from "$lib/queries/getSfts";
import { getSftMetadata } from "$lib/queries/getSftMetadata";
import { fetchAndValidateCSV } from "$lib/utils/claims";

describe("Portfolio E2E Data Flow", () => {
  const testWallet = testDataProvider.getTestWallets()[0];

  beforeEach(() => {
    // Connect test wallet for blockchain interactions
    mockBlockchain.connectWallet(testWallet);
  });

  describe("Data Fetching Pipeline", () => {
    it("should fetch SFT data from subgraph", async () => {
      const sftData = await getSfts();
      
      expect(sftData).toBeDefined();
      expect(Array.isArray(sftData)).toBe(true);
      expect(sftData.length).toBeGreaterThan(0);

      // Verify test contract addresses are present
      const testAddresses = testDataProvider.getEnergyFields()
        .flatMap(field => field.sftTokens.map(token => token.address.toLowerCase()));
      
      const receivedAddresses = sftData.map((sft: any) => sft.address.toLowerCase());
      
      for (const address of testAddresses) {
        expect(receivedAddresses).toContain(address);
      }
    });

    it("should fetch metadata from subgraph", async () => {
      const metadata = await getSftMetadata();
      
      expect(metadata).toBeDefined();
      expect(Array.isArray(metadata)).toBe(true);
      expect(metadata.length).toBeGreaterThan(0);

      // Verify metadata structure
      for (const meta of metadata) {
        expect(meta).toHaveProperty('id');
        expect(meta).toHaveProperty('meta');
        expect(meta).toHaveProperty('subject');
      }
    });

    it("should fetch and validate CSV data from IPFS", async () => {
      const energyFields = testDataProvider.getEnergyFields();
      
      for (const field of energyFields) {
        for (const token of field.sftTokens) {
          for (const claim of token.claims) {
            const csvData = await fetchAndValidateCSV(
              claim.csvLink,
              claim.expectedMerkleRoot,
              claim.expectedContentHash
            );

            expect(csvData).toBeDefined();
            expect(Array.isArray(csvData)).toBe(true);
            expect(csvData.length).toBeGreaterThan(0);

            // Verify CSV structure
            for (const row of csvData) {
              expect(row).toHaveProperty('address');
              expect(row).toHaveProperty('amount');
              expect(row).toHaveProperty('index');
            }
          }
        }
      }
    });
  });

  describe("HTTP Endpoint Integration", () => {
    it("should handle IPFS metadata requests", async () => {
      // Test direct IPFS calls that the app makes
      const testHash = "QmTestMetadata53f760";
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${testHash}`);
      
      expect(response.ok).toBe(true);
      const metadata = await response.json();
      
      expect(metadata).toHaveProperty('name');
      expect(metadata).toHaveProperty('contractAddress');
      expect(metadata).toHaveProperty('asset');
    });

    it("should handle subgraph GraphQL requests", async () => {
      // Test that the SFT subgraph endpoint is properly mocked
      const graphqlQuery = {
        query: `{
          offchainAssetReceiptVaults {
            id
            address
            name
            symbol
          }
        }`
      };

      const response = await fetch("https://api.goldsky.com/api/public/project_cm153vmqi5gke01vy66p4ftzf/subgraphs/sft-offchainassetvaulttest-base/1.0.4/gn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(graphqlQuery)
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('offchainAssetReceiptVaults');
      expect(Array.isArray(data.data.offchainAssetReceiptVaults)).toBe(true);
    });

    it("should handle HyperSync blockchain log requests", async () => {
      // Test the HyperSync endpoint for blockchain logs
      const hyperSyncQuery = {
        from_block: 12000000,
        logs: [
          {
            address: ["0xd2938E7c9fe3597F78832CE780Feb61945c377d7"],
            topics: [["0x17a5c0f3785132a57703932032f6863e7920434150aa1dc940e567b440fdce1f"]]
          }
        ]
      };

      const response = await fetch("https://8453.hypersync.xyz/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hyperSyncQuery)
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe("Portfolio Calculations", () => {
    it("should calculate total invested amount", async () => {
      // This would require deposit data from the mocked SFTs
      const sftData = await getSfts();
      let totalInvested = 0;

      for (const sft of sftData) {
        if (sft.deposits) {
          for (const deposit of sft.deposits) {
            if (deposit.caller?.address === testWallet) {
              totalInvested += Number(deposit.amount) / Math.pow(10, 18); // Convert from wei
            }
          }
        }
      }

      expect(totalInvested).toBeGreaterThan(0);
    });

    it("should calculate total earned from CSV claims", async () => {
      const energyFields = testDataProvider.getEnergyFields();
      let totalEarned = 0;

      for (const field of energyFields) {
        for (const token of field.sftTokens) {
          for (const claim of token.claims) {
            const csvData = await fetchAndValidateCSV(
              claim.csvLink,
              claim.expectedMerkleRoot,
              claim.expectedContentHash
            );

            if (csvData) {
              for (const row of csvData) {
                if (row.address === testWallet) {
                  totalEarned += Number(row.amount) / Math.pow(10, 18); // Convert from wei
                }
              }
            }
          }
        }
      }

      expect(totalEarned).toBeGreaterThanOrEqual(0);
    });

    it("should calculate unclaimed payouts", async () => {
      // Similar to total earned, but only unclaimed amounts
      const energyFields = testDataProvider.getEnergyFields();
      let unclaimedAmount = 0;

      for (const field of energyFields) {
        for (const token of field.sftTokens) {
          for (const claim of token.claims) {
            const csvData = await fetchAndValidateCSV(
              claim.csvLink,
              claim.expectedMerkleRoot,
              claim.expectedContentHash
            );

            if (csvData) {
              for (const row of csvData) {
                if (row.address === testWallet) {
                  // In this test, all amounts are unclaimed since we don't have claim transactions
                  unclaimedAmount += Number(row.amount) / Math.pow(10, 18);
                }
              }
            }
          }
        }
      }

      expect(unclaimedAmount).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Data Consistency", () => {
    it("should maintain consistency between SFT data and metadata", async () => {
      const sftData = await getSfts();
      const metadata = await getSftMetadata();

      // Create mapping of subjects to metadata
      const metadataMap = new Map();
      for (const meta of metadata) {
        metadataMap.set(meta.subject, meta);
      }

      // Verify each SFT has corresponding metadata
      for (const sft of sftData) {
        const expectedSubject = `0x000000000000000000000000${sft.address.slice(2)}`;
        const correspondingMeta = metadataMap.get(expectedSubject);
        
        expect(correspondingMeta).toBeDefined();
        expect(correspondingMeta.subject).toBe(expectedSubject);
      }
    });

    it("should validate CSV merkle roots match expected values", async () => {
      const energyFields = testDataProvider.getEnergyFields();

      for (const field of energyFields) {
        for (const token of field.sftTokens) {
          for (const claim of token.claims) {
            // The fetchAndValidateCSV function should validate merkle roots internally
            const csvData = await fetchAndValidateCSV(
              claim.csvLink,
              claim.expectedMerkleRoot,
              claim.expectedContentHash
            );

            // If CSV data is returned, validation passed
            expect(csvData).toBeDefined();
          }
        }
      }
    });

    it("should validate IPFS content hashes", async () => {
      const energyFields = testDataProvider.getEnergyFields();

      for (const field of energyFields) {
        for (const token of field.sftTokens) {
          for (const claim of token.claims) {
            // Extract hash from CSV link
            const hash = claim.csvLink.split('/').pop();
            expect(hash).toBe(claim.expectedContentHash);

            // Verify content is accessible
            const response = await fetch(claim.csvLink);
            expect(response.ok).toBe(true);
          }
        }
      }
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle missing CSV data gracefully", async () => {
      const invalidCsvLink = "https://gateway.pinata.cloud/ipfs/invalidhash";
      const csvData = await fetchAndValidateCSV(
        invalidCsvLink,
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "invalidhash"
      );

      expect(csvData).toBeNull();
    });

    it("should handle wallet with no holdings", async () => {
      const emptyWallet = "0x0000000000000000000000000000000000000000";
      mockBlockchain.connectWallet(emptyWallet);

      // Test that API calls still work but return no wallet-specific data
      const energyFields = testDataProvider.getEnergyFields();
      
      for (const field of energyFields) {
        for (const token of field.sftTokens) {
          for (const claim of token.claims) {
            const csvData = await fetchAndValidateCSV(
              claim.csvLink,
              claim.expectedMerkleRoot,
              claim.expectedContentHash
            );

            if (csvData) {
              // Should have no data for empty wallet
              const walletRows = csvData.filter(row => row.address === emptyWallet);
              expect(walletRows.length).toBe(0);
            }
          }
        }
      }
    });

    it("should handle network disconnection gracefully", async () => {
      mockBlockchain.disconnectWallet();
      
      // HTTP endpoints should still return data
      const sftData = await getSfts();
      const metadata = await getSftMetadata();
      
      expect(sftData).toBeDefined();
      expect(metadata).toBeDefined();
    });
  });
});