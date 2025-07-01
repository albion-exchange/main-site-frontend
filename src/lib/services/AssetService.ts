import { ASSETS } from '$lib/data/assets';
import type { Asset, MonthlyReport } from '$lib/types';

export class AssetService {
  /**
   * Get all assets
   */
  static getAssets(): Asset[] {
    return ASSETS;
  }

  /**
   * Get asset by ID
   */
  static getAssetById(id: string): Asset | null {
    return ASSETS.find(asset => asset.id === id) || null;
  }

  /**
   * Get assets by field type
   */
  static getAssetsByType(fieldType: string): Asset[] {
    return ASSETS.filter(asset => asset.fieldType === fieldType);
  }

  /**
   * Search assets by name or description
   */
  static searchAssets(query: string): Asset[] {
    const searchTerm = query.toLowerCase();
    return ASSETS.filter(asset => 
      asset.name.toLowerCase().includes(searchTerm) ||
      asset.description.toLowerCase().includes(searchTerm) ||
      asset.location.state.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get latest monthly report for an asset
   */
  static getLatestReport(assetId: string): MonthlyReport | null {
    const asset = this.getAssetById(assetId);
    if (!asset || asset.monthlyReports.length === 0) return null;
    
    // Sort by month descending and return the latest
    return asset.monthlyReports
      .sort((a, b) => b.month.localeCompare(a.month))[0];
  }

  /**
   * Calculate total income for an asset
   */
  static getTotalIncome(assetId: string): number {
    const asset = this.getAssetById(assetId);
    if (!asset) return 0;
    
    return asset.monthlyReports.reduce((sum, report) => sum + report.netIncome, 0);
  }

  /**
   * Calculate average monthly production for an asset
   */
  static getAverageProduction(assetId: string): number {
    const asset = this.getAssetById(assetId);
    if (!asset || asset.monthlyReports.length === 0) return 0;
    
    const totalProduction = asset.monthlyReports.reduce((sum, report) => sum + report.production, 0);
    return totalProduction / asset.monthlyReports.length;
  }

  /**
   * Get performance metrics for an asset
   */
  static getPerformanceMetrics(assetId: string) {
    const asset = this.getAssetById(assetId);
    if (!asset) return null;

    const totalIncome = this.getTotalIncome(assetId);
    const averageProduction = this.getAverageProduction(assetId);
    const latestReport = this.getLatestReport(assetId);
    
    return {
      totalIncome,
      averageProduction,
      latestReport,
      monthlyReportsCount: asset.monthlyReports.length
    };
  }
}