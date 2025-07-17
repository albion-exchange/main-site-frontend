/**
 * Export composable
 * Extracts CSV export functionality from components
 */

import type { CoreAsset, CoreProductionData } from '$lib/types/core';
import type { Token } from '$lib/types/uiTypes';
import { formatters } from '$lib/utils/formatters';

export interface ExportOptions {
  filename?: string;
  includeHeaders?: boolean;
}

/**
 * Generate CSV content from data array
 */
function generateCSV(headers: string[], rows: (string | number)[][]): string {
  const csvRows = [headers, ...rows];
  return csvRows.map(row => 
    row.map(field => 
      typeof field === 'string' && field.includes(',') 
        ? `"${field}"` 
        : field.toString()
    ).join(',')
  ).join('\n');
}

/**
 * Download CSV file
 */
function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Create export composable
 */
export function useExport() {
  /**
   * Export production data for an asset
   */
  const exportProductionData = (
    asset: CoreAsset, 
    options: ExportOptions = {}
  ): void => {
    if (!asset.productionData || asset.productionData.length === 0) {
      console.warn('No production data available to export');
      return;
    }

    const filename = options.filename || `${asset.id}-production-data.csv`;
    
    const headers = [
      'Month',
      'Production (bbl)',
      'Revenue (USD)',
      'Expenses (USD)',
      'Net Income (USD)'
    ];

    const rows = asset.productionData.map(data => [
      formatters.date.monthYear(data.month),
      data.production.toString(),
      (data.revenue ?? 0).toString(),
      (data.expenses ?? 0).toString(),
      (data.netIncome ?? 0).toString()
    ]);

    const csvContent = generateCSV(headers, rows);
    downloadCSV(csvContent, filename);
  };

  /**
   * Export token payment history
   */
  const exportTokenPayments = (
    tokenAddress: string,
    paymentHistory: any[], // TODO: Type this properly when payment types are defined
    options: ExportOptions = {}
  ): void => {
    if (!paymentHistory || paymentHistory.length === 0) {
      console.warn('No payment history available to export');
      return;
    }

    const filename = options.filename || `${tokenAddress}-payments.csv`;
    
    const headers = [
      'Month',
      'Date',
      'Total Payout (USD)',
      'Payout Per Token (USD)',
      'Oil Price (USD/bbl)',
      'Gas Price (USD/MMBtu)',
      'Production Volume (bbl)'
    ];

    const rows = paymentHistory.map(payment => [
      payment.month || '',
      payment.date || '',
      (payment.totalPayout ?? 0).toString(),
      (payment.payoutPerToken ?? 0).toString(),
      (payment.oilPrice ?? 0).toString(),
      (payment.gasPrice ?? 0).toString(),
      (payment.productionVolume ?? 0).toString()
    ]);

    const csvContent = generateCSV(headers, rows);
    downloadCSV(csvContent, filename);
  };

  /**
   * Export asset summary data
   */
  const exportAssetSummary = (
    asset: CoreAsset,
    options: ExportOptions = {}
  ): void => {
    const filename = options.filename || `${asset.id}-summary.csv`;
    
    const headers = ['Property', 'Value'];
    
    const rows = [
      ['Asset ID', asset.id],
      ['Asset Name', asset.name],
      ['Field Type', asset.fieldType],
      ['Depth', `${asset.depth}m`],
      ['Current Production', formatters.production.daily(asset.currentProduction)],
      ['Interest Type', asset.assetTerms.interestType],
      ['Interest Amount', `${asset.assetTerms.amount}%`],
      ['Payment Frequency', `Every ${asset.assetTerms.paymentFrequencyDays} days`],
      ['Location', `${asset.location.field}, ${asset.location.region}, ${asset.location.country}`],
      ['Expected End Date', asset.expectedEndDate ? formatters.date.monthYear(asset.expectedEndDate) : 'TBD'],
      ['Estimated Life', asset.estimatedLife]
    ];

    if (asset.operationalMetrics) {
      rows.push(
        ['Uptime', formatters.percentage(asset.operationalMetrics.uptime.percentage)],
        ['Daily Production Target', formatters.production.daily(asset.operationalMetrics.dailyProduction.target, asset.operationalMetrics.dailyProduction.unit)],
        ['Incident Free Days', asset.operationalMetrics.hseMetrics.incidentFreeDays.toString()],
        ['Safety Rating', asset.operationalMetrics.hseMetrics.safetyRating]
      );
    }

    const csvContent = generateCSV(headers, rows);
    downloadCSV(csvContent, filename);
  };

  /**
   * Export all asset data (production + summary)
   */
  const exportAllAssetData = (
    asset: CoreAsset,
    options: ExportOptions = {}
  ): void => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = options.filename || `${asset.id}-complete-export-${timestamp}.csv`;
    
    const summaryHeaders = ['Section', 'Property', 'Value'];
    const summaryRows: (string | number)[][] = [
      ['Asset Info', 'Asset ID', asset.id],
      ['Asset Info', 'Asset Name', asset.name],
      ['Asset Info', 'Description', asset.description],
      ['Location', 'Field', asset.location.field],
      ['Location', 'Region', asset.location.region],
      ['Location', 'Country', asset.location.country],
      ['Location', 'Coordinates', formatters.coordinates(asset.location.coordinates.latitude, asset.location.coordinates.longitude)],
      ['Technical', 'Field Type', asset.fieldType],
      ['Technical', 'Depth', `${asset.depth}m`],
      ['Technical', 'Estimated Life', asset.estimatedLife],
      ['Terms', 'Interest Type', asset.assetTerms.interestType],
      ['Terms', 'Interest Amount', `${asset.assetTerms.amount}%`],
      ['Terms', 'Payment Frequency', `Every ${asset.assetTerms.paymentFrequencyDays} days`]
    ];

    if (asset.location.waterDepth) {
      summaryRows.push(['Location', 'Water Depth', `${asset.location.waterDepth}m`]);
    }

    if (asset.operationalMetrics) {
      summaryRows.push(
        ['Operations', 'Current Production', formatters.production.daily(asset.operationalMetrics.dailyProduction.current, asset.operationalMetrics.dailyProduction.unit)],
        ['Operations', 'Production Target', formatters.production.daily(asset.operationalMetrics.dailyProduction.target, asset.operationalMetrics.dailyProduction.unit)],
        ['Operations', 'Uptime', formatters.percentage(asset.operationalMetrics.uptime.percentage)],
        ['Safety', 'Incident Free Days', asset.operationalMetrics.hseMetrics.incidentFreeDays.toString()],
        ['Safety', 'Safety Rating', asset.operationalMetrics.hseMetrics.safetyRating]
      );
    }

    // Add production data
    if (asset.productionData && asset.productionData.length > 0) {
      summaryRows.push(['', '', '']); // Empty row
      summaryRows.push(['Production History', 'Month', 'Production (bbl)']);
      
      asset.productionData.forEach(data => {
        summaryRows.push([
          'Production History',
          formatters.date.monthYear(data.month),
          data.production.toString()
        ]);
      });
    }

    const csvContent = generateCSV(summaryHeaders, summaryRows);
    downloadCSV(csvContent, filename);
  };

  return {
    exportProductionData,
    exportTokenPayments,
    exportAssetSummary,
    exportAllAssetData
  };
}