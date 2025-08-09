/**
 * E2E Tests for Asset Detail Data Flow
 * Tests asset metadata processing and detail page calculations
 */

import { describe, it, expect, beforeEach } from "vitest";
import { testDataProvider } from "./data/testData";
import AssetService from "$lib/services/AssetService";
import TokenService from "$lib/services/TokenService";
import { TypeTransformations } from "$lib/types/transformations";

describe("Asset Detail E2E Data Flow", () => {
  beforeEach(() => {
    // Clear service caches
    AssetService.clearCache();
    TokenService.clearCache();
  });

  describe("Asset Data Loading", () => {
    it("should load and transform asset data correctly", async () => {
      const assets = AssetService.getAllAssets();
      
      expect(assets).toBeDefined();
      expect(Array.isArray(assets)).toBe(true);
      expect(assets.length).toBeGreaterThan(0);

      for (const asset of assets) {
        // Verify required asset properties
        expect(asset).toHaveProperty('id');
        expect(asset).toHaveProperty('name');
        expect(asset).toHaveProperty('location');
        expect(asset).toHaveProperty('production');
        expect(asset).toHaveProperty('monthlyReports');
        
        // Verify location data
        expect(asset.location).toHaveProperty('country');
        expect(asset.location).toHaveProperty('state');
        expect(asset.location.country).toBe('USA');
        
        // Verify production data
        expect(asset.production).toHaveProperty('status');
        expect(asset.production.status).toBe('producing');
        
        // Verify monthly reports
        expect(Array.isArray(asset.monthlyReports)).toBe(true);
        expect(asset.monthlyReports.length).toBeGreaterThan(0);
      }
    });

    it("should associate assets with correct energy fields", async () => {
      const energyFields = testDataProvider.getEnergyFields();
      const assets = AssetService.getAllAssets();

      // Should have one asset per energy field
      expect(assets.length).toBe(energyFields.length * 2); // 2 tokens per field on average

      for (const field of energyFields) {
        const fieldAssets = assets.filter(asset => 
          asset.name.includes(field.name.split('-')[0]) ||
          asset.id.includes(field.name.toLowerCase().replace(/\s+/g, '-'))
        );
        
        expect(fieldAssets.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Asset Performance Calculations", () => {
    it("should calculate cumulative production correctly", () => {
      const assets = AssetService.getAllAssets();
      
      for (const asset of assets) {
        const cumulativeStats = AssetService.getCumulativeProduction(asset.id);
        
        expect(cumulativeStats).toBeDefined();
        expect(cumulativeStats).toHaveProperty('totalProduction');
        expect(cumulativeStats).toHaveProperty('totalRevenue');
        expect(cumulativeStats).toHaveProperty('monthCount');
        
        expect(cumulativeStats.totalProduction).toBeGreaterThan(0);
        expect(cumulativeStats.totalRevenue).toBeGreaterThan(0);
        expect(cumulativeStats.monthCount).toBe(asset.monthlyReports.length);
        
        // Verify calculations match manual sum
        const manualTotalProduction = asset.monthlyReports.reduce(
          (sum, report) => sum + (report.production || 0), 0
        );
        const manualTotalRevenue = asset.monthlyReports.reduce(
          (sum, report) => sum + (report.revenue || 0), 0
        );
        
        expect(cumulativeStats.totalProduction).toBe(manualTotalProduction);
        expect(cumulativeStats.totalRevenue).toBe(manualTotalRevenue);
      }
    });

    it("should calculate average monthly revenue correctly", () => {
      const assets = AssetService.getAllAssets();
      
      for (const asset of assets) {
        const avgRevenue = AssetService.getAverageMonthlyRevenue(asset.id);
        
        expect(avgRevenue).toBeGreaterThan(0);
        
        // Verify calculation
        const manualAverage = asset.monthlyReports.reduce(
          (sum, report) => sum + (report.revenue || 0), 0
        ) / asset.monthlyReports.length;
        
        expect(avgRevenue).toBe(manualAverage);
      }
    });

    it("should analyze production trends correctly", () => {
      const assets = AssetService.getAllAssets();
      
      for (const asset of assets) {
        const performance = AssetService.getAssetPerformance(asset.id);
        
        expect(performance).toBeDefined();
        expect(performance).toHaveProperty('averageMonthlyRevenue');
        expect(performance).toHaveProperty('productionTrend');
        expect(performance).toHaveProperty('lastMonthRevenue');
        
        expect(['up', 'down', 'stable']).toContain(performance.productionTrend);
        expect(performance.averageMonthlyRevenue).toBeGreaterThan(0);
        expect(performance.lastMonthRevenue).toBeGreaterThan(0);
      }
    });
  });

  describe("Asset Timeline Data", () => {
    it("should generate production timeline correctly", () => {
      const assets = AssetService.getAllAssets();
      
      for (const asset of assets) {
        const timeline = AssetService.getProductionTimeline(asset.id);
        
        expect(Array.isArray(timeline)).toBe(true);
        expect(timeline.length).toBe(asset.monthlyReports.length);
        
        // Verify timeline is sorted by month
        for (let i = 1; i < timeline.length; i++) {
          expect(timeline[i].month >= timeline[i-1].month).toBe(true);
        }
        
        // Verify all timeline entries have required fields
        for (const entry of timeline) {
          expect(entry).toHaveProperty('month');
          expect(entry).toHaveProperty('production');
          expect(entry).toHaveProperty('revenue');
          
          expect(entry.production).toBeGreaterThan(0);
          expect(entry.revenue).toBeGreaterThan(0);
        }
      }
    });

    it("should get latest monthly report correctly", () => {
      const assets = AssetService.getAllAssets();
      
      for (const asset of assets) {
        const latestReport = AssetService.getLatestMonthlyReport(asset.id);
        
        expect(latestReport).toBeDefined();
        
        // Should be the most recent report by month
        const manualLatest = asset.monthlyReports.reduce((latest, current) => 
          current.month > latest.month ? current : latest
        );
        
        expect(latestReport.month).toBe(manualLatest.month);
        expect(latestReport.production).toBe(manualLatest.production);
        expect(latestReport.revenue).toBe(manualLatest.revenue);
      }
    });
  });

  describe("Asset-Token Relationships", () => {
    it("should correctly associate tokens with assets", async () => {
      const assets = AssetService.getAllAssets();
      const tokens = TokenService.getAllTokens();
      
      expect(assets.length).toBeGreaterThan(0);
      expect(tokens.length).toBeGreaterThan(0);
      
      // Each token should be associated with an asset
      for (const token of tokens) {
        const associatedAsset = AssetService.getAssetByTokenAddress(token.contractAddress);
        expect(associatedAsset).toBeDefined();
      }
    });

    it("should calculate token returns based on asset performance", async () => {
      const tokens = TokenService.getAllTokens();
      
      for (const token of tokens) {
        const returns = TokenService.getTokenReturns(token.contractAddress);
        
        if (returns) {
          expect(returns).toHaveProperty('currentReturn');
          expect(returns).toHaveProperty('projectedAnnualReturn');
          expect(returns).toHaveProperty('totalReturn');
          
          expect(returns.currentReturn).toBeGreaterThanOrEqual(0);
          expect(returns.projectedAnnualReturn).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  describe("Data Filtering and Search", () => {
    it("should filter assets by production status", () => {
      const producingAssets = AssetService.getAssetsByStatus('producing');
      
      expect(Array.isArray(producingAssets)).toBe(true);
      expect(producingAssets.length).toBeGreaterThan(0);
      
      for (const asset of producingAssets) {
        expect(asset.production.status).toBe('producing');
      }
    });

    it("should filter assets by location", () => {
      const usaAssets = AssetService.getAssetsByLocation('USA');
      
      expect(Array.isArray(usaAssets)).toBe(true);
      expect(usaAssets.length).toBeGreaterThan(0);
      
      for (const asset of usaAssets) {
        expect(asset.location.country).toBe('USA');
      }
      
      // Test state-specific filtering
      const texasAssets = AssetService.getAssetsByLocation('USA', 'Texas');
      
      for (const asset of texasAssets) {
        expect(asset.location.country).toBe('USA');
        expect(asset.location.state).toBe('Texas');
      }
    });

    it("should search assets by name and location", () => {
      const assets = AssetService.getAllAssets();
      
      // Test search by partial name
      const searchResults = AssetService.searchAssets('Basin');
      expect(searchResults.length).toBeGreaterThan(0);
      
      for (const result of searchResults) {
        expect(
          result.name.toLowerCase().includes('basin') ||
          result.location?.state?.toLowerCase().includes('basin')
        ).toBe(true);
      }
    });
  });

  describe("Data Transformation Consistency", () => {
    it("should maintain data integrity through transformations", async () => {
      const assets = AssetService.getAllAssets();
      
      for (const asset of assets) {
        // Verify all required UI fields are present and valid
        expect(typeof asset.id).toBe('string');
        expect(asset.id.length).toBeGreaterThan(0);
        
        expect(typeof asset.name).toBe('string');
        expect(asset.name.length).toBeGreaterThan(0);
        
        expect(asset.location).toBeDefined();
        expect(asset.production).toBeDefined();
        expect(Array.isArray(asset.monthlyReports)).toBe(true);
        
        // Verify numerical data is properly formatted
        for (const report of asset.monthlyReports) {
          expect(typeof report.production).toBe('number');
          expect(typeof report.revenue).toBe('number');
          expect(report.production).toBeGreaterThan(0);
          expect(report.revenue).toBeGreaterThan(0);
        }
      }
    });

    it("should handle missing or null data gracefully", () => {
      // Test with asset that might have incomplete data
      const assets = AssetService.getAllAssets();
      
      for (const asset of assets) {
        // These calls should not throw even if some data is missing
        expect(() => AssetService.getCumulativeProduction(asset.id)).not.toThrow();
        expect(() => AssetService.getAverageMonthlyRevenue(asset.id)).not.toThrow();
        expect(() => AssetService.getAssetPerformance(asset.id)).not.toThrow();
        expect(() => AssetService.getProductionTimeline(asset.id)).not.toThrow();
      }
    });
  });
});