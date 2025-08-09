/**
 * E2E Tests for Claims Data Flow
 * Tests the complete claims pipeline from CSV fetching to payout calculations
 */

import { describe, it, expect, beforeEach } from "vitest";
import { mockBlockchain } from "./setup";
import { testDataProvider } from "./data/testData";
import { 
  fetchAndValidateCSV, 
  sortClaimsData, 
  getMerkleTree, 
  getLeaf, 
  getProofForLeaf,
  validateCSVIntegrity,
  validateIPFSContent
} from "$lib/utils/claims";
import { getTradesForClaims } from "$lib/queries/getTrades";

describe("Claims E2E Data Flow", () => {
  const testWallet = testDataProvider.getTestWallets()[0];
  const energyFields = testDataProvider.getEnergyFields();

  beforeEach(() => {
    mockBlockchain.connectWallet(testWallet);
  });

  describe("CSV Validation and Processing", () => {
    it("should validate CSV integrity with merkle roots", async () => {
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

            // Test the validation function directly
            const validation = validateCSVIntegrity(csvData!, claim.expectedMerkleRoot);
            
            if (claim.expectedMerkleRoot !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
              expect(validation.isValid).toBe(true);
              expect(validation.merkleRoot).toBe(claim.expectedMerkleRoot);
            }
          }
        }
      }
    });

    it("should validate IPFS content addressing", async () => {
      for (const field of energyFields) {
        for (const token of field.sftTokens) {
          for (const claim of token.claims) {
            const validation = await validateIPFSContent(
              claim.csvLink,
              claim.expectedContentHash
            );

            expect(validation.isValid).toBe(true);
            expect(validation.contentHash).toBe(claim.expectedContentHash);
          }
        }
      }
    });

    it("should generate consistent merkle trees from CSV data", async () => {
      for (const field of energyFields) {
        for (const token of field.sftTokens) {
          for (const claim of token.claims) {
            const csvData = await fetchAndValidateCSV(
              claim.csvLink,
              claim.expectedMerkleRoot,
              claim.expectedContentHash
            );

            if (csvData) {
              const tree = getMerkleTree(csvData);
              expect(tree).toBeDefined();
              expect(tree.root).toBeDefined();

              // Verify merkle proofs for each entry
              for (const row of csvData) {
                const leaf = getLeaf(row.index, row.address, row.amount);
                const proofResult = getProofForLeaf(tree, leaf);
                
                expect(proofResult).toBeDefined();
                expect(proofResult.leafValue).toBe(leaf);
                expect(Array.isArray(proofResult.proof)).toBe(true);
              }
            }
          }
        }
      }
    });
  });

  describe("Claims Data Sorting and Processing", () => {
    it("should sort claims data correctly for connected wallet", async () => {
      for (const field of energyFields) {
        for (const token of field.sftTokens) {
          for (const claim of token.claims) {
            const csvData = await fetchAndValidateCSV(
              claim.csvLink,
              claim.expectedMerkleRoot,
              claim.expectedContentHash
            );

            if (csvData) {
              // Mock trades data (empty for this test since we don't have real trades)
              const trades: any[] = [];
              
              const sortedData = await sortClaimsData(
                csvData,
                trades,
                testWallet,
                field.name
              );

              expect(sortedData).toBeDefined();
              expect(sortedData).toHaveProperty('claimedCsv');
              expect(sortedData).toHaveProperty('unclaimedCsv');
              expect(sortedData).toHaveProperty('claims');
              expect(sortedData).toHaveProperty('holdings');
              expect(sortedData).toHaveProperty('totalEarned');
              expect(sortedData).toHaveProperty('totalClaimedAmount');
              expect(sortedData).toHaveProperty('totalUnclaimedAmount');

              // Verify wallet-specific filtering
              expect(sortedData.ownerAddress).toBe(testWallet);

              // Check that unclaimed amount is calculated correctly
              const expectedUnclaimed = csvData
                .filter(row => row.address === testWallet)
                .reduce((sum, row) => sum + BigInt(row.amount), BigInt(0));

              expect(BigInt(sortedData.totalUnclaimedAmount)).toBe(expectedUnclaimed);
            }
          }
        }
      }
    });

    it("should handle multiple claims for the same field", async () => {
      const bakkenField = energyFields.find(f => f.name === "Bakken Horizon-2");
      if (!bakkenField) return;

      let totalEarned = BigInt(0);
      let totalUnclaimed = BigInt(0);

      for (const token of bakkenField.sftTokens) {
        for (const claim of token.claims) {
          const csvData = await fetchAndValidateCSV(
            claim.csvLink,
            claim.expectedMerkleRoot,
            claim.expectedContentHash
          );

          if (csvData) {
            const sortedData = await sortClaimsData(
              csvData,
              [], // No trades
              testWallet,
              bakkenField.name
            );

            totalEarned += BigInt(sortedData.totalEarned);
            totalUnclaimed += BigInt(sortedData.totalUnclaimedAmount);
          }
        }
      }

      expect(totalEarned).toBeGreaterThan(BigInt(0));
      expect(totalUnclaimed).toBeGreaterThan(BigInt(0));
    });
  });

  describe("Payout Calculations", () => {
    it("should calculate correct payout amounts per token", async () => {
      for (const field of energyFields) {
        for (const token of field.sftTokens) {
          for (const claim of token.claims) {
            const csvData = await fetchAndValidateCSV(
              claim.csvLink,
              claim.expectedMerkleRoot,
              claim.expectedContentHash
            );

            if (csvData) {
              const walletRows = csvData.filter(row => row.address === testWallet);
              
              for (const row of walletRows) {
                const amount = BigInt(row.amount);
                expect(amount).toBeGreaterThan(BigInt(0));
                
                // Verify amount is in reasonable range (between 0.01 and 10 ETH)
                const amountInEth = Number(amount) / Math.pow(10, 18);
                expect(amountInEth).toBeGreaterThan(0.01);
                expect(amountInEth).toBeLessThan(10);
              }
            }
          }
        }
      }
    });

    it("should maintain arithmetic consistency across calculations", async () => {
      for (const field of energyFields) {
        let fieldTotalEarned = BigInt(0);
        let fieldTotalUnclaimed = BigInt(0);

        for (const token of field.sftTokens) {
          for (const claim of token.claims) {
            const csvData = await fetchAndValidateCSV(
              claim.csvLink,
              claim.expectedMerkleRoot,
              claim.expectedContentHash
            );

            if (csvData) {
              const sortedData = await sortClaimsData(
                csvData,
                [],
                testWallet,
                field.name
              );

              // totalEarned should equal totalClaimed + totalUnclaimed
              const totalEarned = BigInt(sortedData.totalEarned);
              const totalClaimed = BigInt(sortedData.totalClaimedAmount);
              const totalUnclaimed = BigInt(sortedData.totalUnclaimedAmount);

              expect(totalEarned).toBe(totalClaimed + totalUnclaimed);

              fieldTotalEarned += totalEarned;
              fieldTotalUnclaimed += totalUnclaimed;
            }
          }
        }

        // Field totals should be consistent
        expect(fieldTotalEarned).toBeGreaterThanOrEqual(fieldTotalUnclaimed);
      }
    });
  });

  describe("Claim History Generation", () => {
    it("should generate proper claim history format", async () => {
      for (const field of energyFields) {
        for (const token of field.sftTokens) {
          for (const claim of token.claims) {
            const csvData = await fetchAndValidateCSV(
              claim.csvLink,
              claim.expectedMerkleRoot,
              claim.expectedContentHash
            );

            if (csvData) {
              const sortedData = await sortClaimsData(
                csvData,
                [],
                testWallet,
                field.name
              );

              // Verify claims array structure
              expect(Array.isArray(sortedData.claims)).toBe(true);
              
              for (const claim of sortedData.claims) {
                expect(claim).toHaveProperty('date');
                expect(claim).toHaveProperty('amount');
                expect(claim).toHaveProperty('asset');
                expect(claim).toHaveProperty('txHash');
                expect(claim).toHaveProperty('status');
                
                expect(claim.asset).toBe(field.name);
                expect(claim.status).toBe('completed');
              }

              // Verify holdings array structure
              expect(Array.isArray(sortedData.holdings)).toBe(true);
              
              for (const holding of sortedData.holdings) {
                expect(holding).toHaveProperty('id');
                expect(holding).toHaveProperty('name');
                expect(holding).toHaveProperty('unclaimedAmount');
                expect(holding).toHaveProperty('totalEarned');
                expect(holding).toHaveProperty('status');
                
                expect(holding.name).toBe(field.name);
                expect(holding.status).toBe('producing');
              }
            }
          }
        }
      }
    });
  });

  describe("Security Validations", () => {
    it("should reject invalid merkle roots", async () => {
      const field = energyFields[0];
      const token = field.sftTokens[0];
      const claim = token.claims[0];

      const csvData = await fetchAndValidateCSV(
        claim.csvLink,
        "0x1234567890123456789012345678901234567890123456789012345678901234", // Invalid root
        claim.expectedContentHash
      );

      // Should return null for invalid merkle root
      expect(csvData).toBeNull();
    });

    it("should reject invalid IPFS hashes", async () => {
      const field = energyFields[0];
      const token = field.sftTokens[0];
      const claim = token.claims[0];

      const csvData = await fetchAndValidateCSV(
        claim.csvLink,
        claim.expectedMerkleRoot,
        "invalidhash123" // Invalid IPFS hash
      );

      expect(csvData).toBeNull();
    });

    it("should validate CSV data structure", async () => {
      const field = energyFields[0];
      const token = field.sftTokens[0];
      const claim = token.claims[0];

      const csvData = await fetchAndValidateCSV(
        claim.csvLink,
        claim.expectedMerkleRoot,
        claim.expectedContentHash
      );

      if (csvData) {
        for (const row of csvData) {
          // Validate address format
          expect(row.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
          
          // Validate amount is numeric
          expect(typeof row.amount).toBe('string');
          expect(!isNaN(Number(row.amount))).toBe(true);
          expect(Number(row.amount)).toBeGreaterThan(0);
          
          // Validate index
          expect(typeof row.index).toBe('string');
          expect(!isNaN(Number(row.index))).toBe(true);
          expect(Number(row.index)).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  describe("Integration with Trade Data", () => {
    it("should handle empty trade data", async () => {
      const field = energyFields[0];
      const token = field.sftTokens[0];
      const claim = token.claims[0];

      const csvData = await fetchAndValidateCSV(
        claim.csvLink,
        claim.expectedMerkleRoot,
        claim.expectedContentHash
      );

      if (csvData) {
        const sortedData = await sortClaimsData(
          csvData,
          [], // Empty trades
          testWallet,
          field.name
        );

        // With no trades, all CSV data should be unclaimed
        expect(sortedData.claimedCsv.length).toBe(0);
        expect(sortedData.unclaimedCsv.length).toBeGreaterThan(0);
        expect(BigInt(sortedData.totalClaimedAmount)).toBe(BigInt(0));
        expect(BigInt(sortedData.totalUnclaimedAmount)).toBeGreaterThan(BigInt(0));
      }
    });
  });
});