/**
 * @fileoverview Chart data composable
 * Handles data transformation for various chart types
 */

import type { Asset, Token } from "$lib/types/uiTypes";
import type { MonthlyReport } from "$lib/types/uiTypes";

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface MultiSeriesDataPoint {
  date: string;
  [key: string]: number | string;
}

/**
 * Composable for generating chart data
 */
export function useChartData() {
  /**
   * Generate production chart data
   */
  function getProductionChartData(
    reports: MonthlyReport[],
    options: {
      includeMovingAverage?: boolean;
      movingAveragePeriod?: number;
    } = {},
  ): MultiSeriesDataPoint[] {
    if (!reports?.length) return [];

    const data = reports.map((report, index) => {
      const point: MultiSeriesDataPoint = {
        date: report.month,
        production: report.production,
      };

      // Add moving average if requested
      if (
        options.includeMovingAverage &&
        index >= (options.movingAveragePeriod || 3) - 1
      ) {
        const period = options.movingAveragePeriod || 3;
        const sum = reports
          .slice(index - period + 1, index + 1)
          .reduce((acc, r) => acc + r.production, 0);
        point.movingAverage = sum / period;
      }

      return point;
    });

    return data;
  }

  /**
   * Generate revenue vs expenses chart data
   */
  function getFinancialChartData(
    reports: MonthlyReport[],
  ): MultiSeriesDataPoint[] {
    if (!reports?.length) return [];

    return reports.map((report) => ({
      date: report.month,
      revenue: report.revenue || 0,
      expenses: report.expenses || 0,
      netIncome: report.netIncome || 0,
    }));
  }

  /**
   * Generate payout history chart data
   */
  function getPayoutChartData(
    reports: MonthlyReport[],
    tokenCount: number = 1,
  ): ChartDataPoint[] {
    if (!reports?.length) return [];

    return reports
      .filter((report) => report.payoutPerToken && report.payoutPerToken > 0)
      .map((report) => ({
        date: report.month,
        value: (report.payoutPerToken || 0) * tokenCount,
        label: `$${((report.payoutPerToken || 0) * tokenCount).toFixed(2)}`,
      }));
  }

  /**
   * Generate cumulative production chart data
   */
  function getCumulativeProductionData(
    reports: MonthlyReport[],
  ): ChartDataPoint[] {
    if (!reports?.length) return [];

    let cumulative = 0;
    return reports.map((report) => {
      cumulative += report.production;
      return {
        date: report.month,
        value: cumulative,
        label: `${cumulative.toLocaleString()} BBL`,
      };
    });
  }

  /**
   * Generate production efficiency chart data
   */
  function getEfficiencyChartData(
    reports: MonthlyReport[],
    metrics?: {
      uptime?: { percentage: number; period: string };
      waterCut?: { percentage: number; period: string };
    },
  ): MultiSeriesDataPoint[] {
    if (!reports?.length) return [];

    // Calculate efficiency based on revenue per barrel
    return reports.map((report) => {
      const revenuePerBarrel =
        report.production > 0 ? (report.revenue || 0) / report.production : 0;

      return {
        date: report.month,
        revenuePerBarrel,
        production: report.production,
        uptime: metrics?.uptime?.percentage || 100,
      };
    });
  }

  /**
   * Generate comparison chart data for multiple assets
   */
  function getComparisonChartData(
    assets: Array<{
      asset: Asset;
      metric: "production" | "revenue" | "netIncome";
    }>,
  ): MultiSeriesDataPoint[] {
    // Find all unique months across all assets
    const allMonths = new Set<string>();
    assets.forEach(({ asset }) => {
      asset.monthlyReports?.forEach((report) => {
        allMonths.add(report.month);
      });
    });

    // Sort months
    const sortedMonths = Array.from(allMonths).sort();

    // Build data points
    return sortedMonths.map((month) => {
      const point: MultiSeriesDataPoint = { date: month };

      assets.forEach(({ asset, metric }) => {
        const report = asset.monthlyReports?.find((r) => r.month === month);
        if (report) {
          point[asset.name] = report[metric] || 0;
        }
      });

      return point;
    });
  }

  /**
   * Format chart data for specific chart libraries
   */
  function formatForChartLibrary(
    data: ChartDataPoint[] | MultiSeriesDataPoint[],
    library: "chartjs" | "d3" | "recharts" = "recharts",
  ): any {
    switch (library) {
      case "chartjs":
        // Format for Chart.js
        if (data.length === 0) return { labels: [], datasets: [] };

        const labels = data.map((d) => d.date);
        const datasets = Object.keys(data[0])
          .filter((key) => key !== "date")
          .map((key) => ({
            label: key,
            data: data.map((d) => (d as any)[key]),
          }));

        return { labels, datasets };

      case "d3":
        // D3 typically uses the raw data
        return data;

      case "recharts":
      default:
        // Recharts uses the data as-is
        return data;
    }
  }

  /**
   * Calculate trend line data
   */
  function getTrendLineData(
    data: ChartDataPoint[],
    type: "linear" | "exponential" = "linear",
  ): ChartDataPoint[] {
    if (data.length < 2) return [];

    // Simple linear regression
    const n = data.length;
    const sumX = data.reduce((sum, _, i) => sum + i, 0);
    const sumY = data.reduce((sum, d) => sum + d.value, 0);
    const sumXY = data.reduce((sum, d, i) => sum + i * d.value, 0);
    const sumX2 = data.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return data.map((d, i) => ({
      date: d.date,
      value: slope * i + intercept,
      label: "Trend",
    }));
  }

  return {
    getProductionChartData,
    getFinancialChartData,
    getPayoutChartData,
    getCumulativeProductionData,
    getEfficiencyChartData,
    getComparisonChartData,
    formatForChartLibrary,
    getTrendLineData,
  };
}
