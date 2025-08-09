/**
 * E2E Tests for Asset Metadata HTTP Endpoints
 * Tests IPFS metadata fetching and data structure validation
 */

import { describe, it, expect } from "vitest";
import { testDataProvider } from "./data/testData";

describe("Asset Metadata HTTP Endpoints", () => {

  describe("IPFS Metadata Fetching", () => {
    it("should fetch asset metadata from IPFS for all test contracts", async () => {
      const energyFields = testDataProvider.getEnergyFields();
      
      for (const field of energyFields) {
        for (const token of field.sftTokens) {
          // Generate metadata hash for this token
          const metadataHash = `QmTestMetadata${token.address.slice(-8)}`;
          
          // Test direct IPFS call
          const response = await fetch(`https://gateway.pinata.cloud/ipfs/${metadataHash}`);
          
          expect(response.ok).toBe(true);
          const metadata = await response.json();
          
          // Verify metadata structure
          expect(metadata).toHaveProperty('name');
          expect(metadata).toHaveProperty('contractAddress');
          expect(metadata).toHaveProperty('asset');
          expect(metadata.contractAddress).toBe(token.address);
          
          // Verify asset sub-structure
          expect(metadata.asset).toHaveProperty('id');
          expect(metadata.asset).toHaveProperty('name');
          expect(metadata.asset).toHaveProperty('location');
          expect(metadata.asset).toHaveProperty('production');
          expect(metadata.asset).toHaveProperty('monthlyReports');
        }
      }
    });

    it("should provide consistent data structure across all energy fields", async () => {
      const energyFields = testDataProvider.getEnergyFields();
      const allMetadata = [];
      
      // Fetch all metadata
      for (const field of energyFields) {
        for (const token of field.sftTokens) {
          const metadataHash = `QmTestMetadata${token.address.slice(-8)}`;
          const response = await fetch(`https://gateway.pinata.cloud/ipfs/${metadataHash}`);
          const metadata = await response.json();
          allMetadata.push({ field: field.name, metadata });
        }
      }

      // Verify consistent structure
      for (const item of allMetadata) {
        const { metadata } = item;
        
        // Location data consistency
        expect(metadata.asset.location.country).toBe('USA');
        expect(metadata.asset.location.state).toMatch(/^(North Dakota|Louisiana|Texas)$/);
        
        // Production data consistency
        expect(metadata.asset.production.status).toBe('producing');
        expect(metadata.asset.production.startDate).toBe('2023-01-01');
        
        // Monthly reports consistency
        expect(Array.isArray(metadata.asset.monthlyReports)).toBe(true);
        expect(metadata.asset.monthlyReports.length).toBe(3);
        
        for (const report of metadata.asset.monthlyReports) {
          expect(report).toHaveProperty('month');
          expect(report).toHaveProperty('production');
          expect(report).toHaveProperty('revenue');
          expect(typeof report.production).toBe('number');
          expect(typeof report.revenue).toBe('number');
          expect(report.production).toBeGreaterThan(0);
          expect(report.revenue).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("Production Data Validation", () => {
    it("should provide realistic production and revenue data", async () => {
      const energyFields = testDataProvider.getEnergyFields();
      
      for (const field of energyFields) {
        for (const token of field.sftTokens) {
          const metadataHash = `QmTestMetadata${token.address.slice(-8)}`;
          const response = await fetch(`https://gateway.pinata.cloud/ipfs/${metadataHash}`);
          const metadata = await response.json();
          
          // Verify production numbers are realistic
          for (const report of metadata.asset.monthlyReports) {
            // Production should be between 1000 and 10000 barrels per month
            expect(report.production).toBeGreaterThan(1000);
            expect(report.production).toBeLessThan(10000);
            
            // Revenue should be realistic for oil production (>$100k per month)
            expect(report.revenue).toBeGreaterThan(100000);
            expect(report.revenue).toBeLessThan(1000000);
            
            // Revenue per barrel should be reasonable ($50-$100 per barrel)
            const revenuePerBarrel = report.revenue / report.production;
            expect(revenuePerBarrel).toBeGreaterThan(50);
            expect(revenuePerBarrel).toBeLessThan(100);
          }
        }
      }
    });

    it("should have chronological monthly report data", async () => {
      const energyFields = testDataProvider.getEnergyFields();
      
      for (const field of energyFields) {
        for (const token of field.sftTokens) {
          const metadataHash = `QmTestMetadata${token.address.slice(-8)}`;
          const response = await fetch(`https://gateway.pinata.cloud/ipfs/${metadataHash}`);
          const metadata = await response.json();
          
          const reports = metadata.asset.monthlyReports;
          
          // Verify reports are in chronological order
          for (let i = 1; i < reports.length; i++) {
            expect(reports[i].month > reports[i-1].month).toBe(true);
          }
          
          // Verify month format
          for (const report of reports) {
            expect(report.month).toMatch(/^\d{4}-\d{2}$/);
          }
        }
      }
    });
  });

  describe("Asset-Energy Field Mapping", () => {
    it("should correctly map assets to their energy fields", async () => {
      const energyFields = testDataProvider.getEnergyFields();
      
      for (const field of energyFields) {
        for (const token of field.sftTokens) {
          const metadataHash = `QmTestMetadata${token.address.slice(-8)}`;
          const response = await fetch(`https://gateway.pinata.cloud/ipfs/${metadataHash}`);
          const metadata = await response.json();
          
          // Asset name should relate to energy field name
          const fieldNamePart = field.name.split('-')[0]; // e.g., "Bakken Horizon"
          expect(metadata.asset.name).toContain(fieldNamePart.split(' ')[0]); // "Bakken"
          
          // Contract address should match
          expect(metadata.contractAddress).toBe(token.address);
        }
      }
    });

    it("should provide unique asset IDs for each token", async () => {
      const energyFields = testDataProvider.getEnergyFields();
      const assetIds = new Set();
      
      for (const field of energyFields) {
        for (const token of field.sftTokens) {
          const metadataHash = `QmTestMetadata${token.address.slice(-8)}`;
          const response = await fetch(`https://gateway.pinata.cloud/ipfs/${metadataHash}`);
          const metadata = await response.json();
          
          // Asset ID should be unique
          expect(assetIds.has(metadata.asset.id)).toBe(false);
          assetIds.add(metadata.asset.id);
          
          // Asset ID should be URL-friendly
          expect(metadata.asset.id).toMatch(/^[a-z0-9-]+$/);
        }
      }
    });
  });

  describe("Error Handling", () => {
    it("should handle missing IPFS metadata gracefully", async () => {
      const invalidHash = "QmInvalidHash123";
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${invalidHash}`);
      
      expect(response.status).toBe(404);
    });

    it("should validate metadata completeness", async () => {
      const energyFields = testDataProvider.getEnergyFields();
      
      for (const field of energyFields) {
        for (const token of field.sftTokens) {
          const metadataHash = `QmTestMetadata${token.address.slice(-8)}`;
          const response = await fetch(`https://gateway.pinata.cloud/ipfs/${metadataHash}`);
          const metadata = await response.json();
          
          // Ensure all required fields are present and non-empty
          expect(metadata.name).toBeTruthy();
          expect(metadata.asset.name).toBeTruthy();
          expect(metadata.asset.operator.name).toBeTruthy();
          expect(metadata.asset.location.country).toBeTruthy();
          expect(metadata.asset.location.state).toBeTruthy();
          expect(metadata.asset.production.status).toBeTruthy();
          expect(metadata.asset.monthlyReports.length).toBeGreaterThan(0);
        }
      }
    });
  });
});