/**
 * @fileoverview Data export composable
 * Handles CSV export functionality for various data types
 */

import type { Asset, Token } from '$lib/types/uiTypes';
import { useTokenService } from '$lib/services';
import { withSyncErrorHandling } from '$lib/utils/errorHandling';
import { formatCurrency, formatNumber } from '$lib/utils/formatters';

export interface ExportOptions {
  filename?: string;
  includeHeaders?: boolean;
}

/**
 * Composable for exporting data to CSV
 */
export function useDataExport() {
  
  /**
   * Generic CSV export function
   */
  function exportToCSV(
    data: any[][],
    headers: string[],
    filename: string
  ): void {
    const csvContent = [
      headers,
      ...data
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
  
  /**
   * Export asset production data
   */
  function exportProductionData(asset: Asset, options: ExportOptions = {}): void {
    if (!asset?.monthlyReports?.length) {
      console.warn('No production data to export');
      return;
    }
    
    const headers = [
      'Month',
      'Production (bbl)',
      'Revenue (USD)',
      'Expenses (USD)',
      'Net Income (USD)',
      'Payout Per Token (USD)'
    ];
    
    const data = asset.monthlyReports.map(report => [
      report.month,
      report.production.toString(),
      (report.revenue ?? 0).toString(),
      (report.expenses ?? 0).toString(),
      (report.netIncome ?? 0).toString(),
      (report.payoutPerToken ?? 0).toFixed(4)
    ]);
    
    const filename = options.filename || `${asset.id}-production-data.csv`;
    exportToCSV(data, headers, filename);
  }
  
  /**
   * Export token payment history
   */
  function exportPaymentHistory(tokens: Token[], options: ExportOptions = {}): void {
    const tokenService = useTokenService();
    
    if (!tokens.length) {
      console.warn('No tokens to export payment data for');
      return;
    }
    
    // Get payment data from the first token (they should all have same payment history)
    const paymentData = withSyncErrorHandling(
      () => tokenService.getTokenPayoutHistory(tokens[0].contractAddress),
      { service: 'TokenService', operation: 'getTokenPayoutHistory' }
    );
    if (!paymentData?.recentPayouts?.length) {
      console.warn('No payment history found');
      return;
    }
    
    const headers = [
      'Month',
      'Date',
      'Total Payout (USD)',
      'Payout Per Token (USD)',
      'Oil Price (USD/bbl)',
      'Gas Price (USD/MMBtu)',
      'Production Volume (bbl)'
    ];
    
    const data = paymentData.recentPayouts.map(payout => [
      payout.month,
      payout.date,
      payout.totalPayout.toFixed(2),
      payout.payoutPerToken.toFixed(4),
      payout.oilPrice.toFixed(2),
      payout.gasPrice.toFixed(2),
      payout.productionVolume.toString()
    ]);
    
    const filename = options.filename || `${tokens[0].assetId}-payment-history.csv`;
    exportToCSV(data, headers, filename);
  }
  
  /**
   * Export asset summary data
   */
  function exportAssetSummary(asset: Asset, options: ExportOptions = {}): void {
    const headers = ['Field', 'Value'];
    
    const data = [
      ['Asset Name', asset.name],
      ['Asset ID', asset.id],
      ['Location', `${asset.location.state}, ${asset.location.country}`],
      ['Operator', asset.operator.name],
      ['Status', asset.production.status],
      ['Depth', asset.geology.depth],
      ['Type', asset.geology.type],
      ['Interest Type', asset.terms.interestType],
      ['Revenue Share', asset.terms.amount],
      ['Payment Frequency', asset.terms.paymentFrequency],
      ['Estimated Life', asset.geology.estimatedLife],
      ['Water Depth', asset.location.waterDepth || 'Onshore']
    ];
    
    const filename = options.filename || `${asset.id}-summary.csv`;
    exportToCSV(data, headers, filename);
  }
  
  /**
   * Export performance metrics
   */
  function exportPerformanceMetrics(
    asset: Asset,
    metrics: {
      totalProduction?: number;
      totalRevenue?: number;
      avgMonthlyRevenue?: number;
      profitMargin?: number;
    },
    options: ExportOptions = {}
  ): void {
    const headers = ['Metric', 'Value'];
    
    const data = [
      ['Asset Name', asset.name],
      ['Total Production (bbl)', metrics.totalProduction ? formatNumber(metrics.totalProduction) : 'N/A'],
      ['Total Revenue (USD)', metrics.totalRevenue ? formatCurrency(metrics.totalRevenue, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : 'N/A'],
['Avg Monthly Revenue (USD)', metrics.avgMonthlyRevenue ? formatCurrency(metrics.avgMonthlyRevenue, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : 'N/A'],
      ['Profit Margin (%)', metrics.profitMargin ? `${metrics.profitMargin.toFixed(2)}%` : 'N/A'],
      ['Report Count', asset.monthlyReports?.length.toString() || '0']
    ];
    
    const filename = options.filename || `${asset.id}-performance-metrics.csv`;
    exportToCSV(data, headers, filename);
  }
  
  return {
    exportToCSV,
    exportProductionData,
    exportPaymentHistory,
    exportAssetSummary,
    exportPerformanceMetrics
  };
}