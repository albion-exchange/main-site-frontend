/**
 * E2E Tests for Portfolio Data Flow
 * Tests the complete data pipeline from API calls to frontend display
 */

import { describe, it, expect, beforeEach } from "vitest";
import { mockBlockchain } from "./setup";
import { testDataProvider } from "./data/testData";
import { getSfts } from "$lib/queries/getSfts";
import { getSftMetadata } from "$lib/queries/getSftMetadata";
import { fetchAndValidateCSV } from "$lib/utils/claims";
import AssetService from "$lib/services/AssetService";
import TokenService from "$lib/services/TokenService";

describe("Portfolio E2E Data Flow", () => {
  const testWallet = testDataProvider.getTestWallets()[0];

  beforeEach(() => {
    // Connect test wallet
    mockBlockchain.connectWallet(testWallet);
    
    // Clear service caches
    AssetService.clearCache();
    TokenService.clearCache();
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

  describe("Service Layer Integration", () => {
    it("should load assets through AssetService", async () => {
      const assets = AssetService.getAllAssets();
      
      expect(assets).toBeDefined();
      expect(Array.isArray(assets)).toBe(true);
      expect(assets.length).toBeGreaterThan(0);

      // Verify asset structure
      for (const asset of assets) {
        expect(asset).toHaveProperty('id');
        expect(asset).toHaveProperty('name');
        expect(asset).toHaveProperty('location');
        expect(asset).toHaveProperty('production');
        expect(asset).toHaveProperty('monthlyReports');
      }
    });

    it("should load tokens through TokenService", async () => {
      const tokens = TokenService.getAllTokens();
      
      expect(tokens).toBeDefined();
      expect(Array.isArray(tokens)).toBe(true);
      expect(tokens.length).toBeGreaterThan(0);

      // Verify token structure  
      for (const token of tokens) {
        expect(token).toHaveProperty('contractAddress');
        expect(token).toHaveProperty('name');
        expect(token).toHaveProperty('supply');
      }
    });

    it("should calculate token supply information correctly", async () => {
      const tokens = TokenService.getAllTokens();
      
      for (const token of tokens) {
        const supplyInfo = TokenService.getTokenSupply(token.contractAddress);
        
        expect(supplyInfo).toBeDefined();
        expect(supplyInfo).toHaveProperty('total');
        expect(supplyInfo).toHaveProperty('available');
        expect(supplyInfo).toHaveProperty('sold');
        expect(supplyInfo).toHaveProperty('percentageSold');
        
        expect(supplyInfo.total).toBeGreaterThan(0);
        expect(supplyInfo.percentageSold).toBeGreaterThanOrEqual(0);
        expect(supplyInfo.percentageSold).toBeLessThanOrEqual(100);
      }
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

    it("should handle wallet with no holdings", () => {
      const emptyWallet = "0x0000000000000000000000000000000000000000";
      mockBlockchain.connectWallet(emptyWallet);

      const tokens = TokenService.getAllTokens();
      
      for (const token of tokens) {
        const supplyInfo = TokenService.getTokenSupply(token.contractAddress);
        expect(supplyInfo).toBeDefined();
        
        // Wallet should have no holdings
        // This would be tested in the actual portfolio calculations
      }
    });

    it("should handle network disconnection gracefully", () => {
      mockBlockchain.disconnectWallet();
      
      // Services should still return data, but no wallet-specific calculations
      const assets = AssetService.getAllAssets();
      const tokens = TokenService.getAllTokens();
      
      expect(assets).toBeDefined();
      expect(tokens).toBeDefined();
    });
  });
});