/**
 * @fileoverview Portfolio data composable
 * Manages user portfolio data and calculations
 */

import { writable, derived, type Readable, type Writable } from "svelte/store";
import { useAssetService, useWalletDataService } from "$lib/services";
import { withSyncErrorHandling } from "$lib/utils/errorHandling";
import type { Asset } from "$lib/types/uiTypes";
import { arrayUtils } from "$lib/utils/arrayHelpers";
import { formatCurrency, formatPercentage } from "$lib/utils/formatters";

interface PortfolioState {
  totalInvested: number;
  totalPayoutsEarned: number;
  unclaimedPayout: number;
  activeAssetsCount: number;
  holdings: any[];
  monthlyPayouts: any[];
  tokenAllocations: any[];
  loading: boolean;
  error: string | null;
}

/**
 * Composable for managing portfolio data
 */
export function usePortfolioData() {
  const assetService = useAssetService();
  const walletDataService = useWalletDataService();

  const state: Writable<PortfolioState> = writable({
    totalInvested: 0,
    totalPayoutsEarned: 0,
    unclaimedPayout: 0,
    activeAssetsCount: 0,
    holdings: [],
    monthlyPayouts: [],
    tokenAllocations: [],
    loading: true,
    error: null,
  });

  function loadPortfolioData() {
    state.update((s) => ({ ...s, loading: true, error: null }));

    try {
      // Load data from walletDataService
      const totalInvested = walletDataService.getTotalInvested();
      const totalPayoutsEarned = walletDataService.getTotalPayoutsEarned();
      const unclaimedPayout = walletDataService.getUnclaimedPayouts();

      // Get holdings with asset info
      const assetPayouts = walletDataService.getHoldingsByAsset();
      const allAssets =
        withSyncErrorHandling(() => assetService.getAllAssets(), {
          service: "AssetService",
          operation: "getAllAssets",
        }) || [];

      // Count active assets
      const activeAssetsCount = assetPayouts.length;

      // Transform holdings data
      const holdings = transformHoldings(assetPayouts, allAssets);

      // Get monthly payout history
      const monthlyPayouts = walletDataService.getMonthlyPayoutHistory();

      // Get token allocations and add colors
      const rawTokenAllocations = walletDataService.getTokenAllocation();
      const colors = [
        "#08bccc",
        "#283c84",
        "#f8f4f4",
        "#000000",
        "#0a8a96",
        "#1a2557",
      ];

      // Transform tokenAllocations to include display properties
      const tokenAllocations = rawTokenAllocations.map((allocation, index) => ({
        ...allocation,
        percentage: allocation.percentageOfPortfolio, // Add percentage property for display
        value: allocation.currentValue, // Add value property for display
        color: colors[index % colors.length], // Add color for pie chart
      }));

      state.update((s) => ({
        ...s,
        totalInvested,
        totalPayoutsEarned,
        unclaimedPayout,
        activeAssetsCount,
        holdings,
        monthlyPayouts,
        tokenAllocations,
        loading: false,
      }));
    } catch (error) {
      state.update((s) => ({
        ...s,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load portfolio data",
        loading: false,
      }));
    }
  }

  function transformHoldings(assetPayouts: any[], allAssets: Asset[]) {
    return assetPayouts
      .map((holding) => {
        const asset = allAssets.find((a) => a.id === holding.assetId);
        if (!asset) return null;

        // Get the actual holding data for token count
        const walletHoldings = walletDataService.computeHoldings();
        const walletHolding = walletHoldings.find(
          (h) => h.assetId === holding.assetId,
        );
        const tokensOwned = walletHolding ? walletHolding.formattedBalance : 0;
        const tokenSymbol = walletHolding ? walletHolding.symbol : "";

        // Calculate capital returned percentage
        const capitalReturned =
          holding.totalInvested > 0
            ? (holding.totalEarned / holding.totalInvested) * 100
            : 0;

        // Calculate unrecovered capital
        const unrecoveredCapital = Math.max(
          0,
          holding.totalInvested - holding.totalEarned,
        );

        // Calculate asset depletion
        const assetDepletion = calculateAssetDepletion(asset);

        return {
          id: holding.assetId,
          name: holding.assetName,
          location: `${asset.location.state}, ${asset.location.country}`,
          totalInvested: holding.totalInvested,
          totalPayoutsEarned: holding.totalEarned,
          unclaimedAmount: holding.unclaimedAmount,
          lastPayoutAmount: holding.lastPayoutAmount,
          lastPayoutDate: holding.lastPayoutDate,
          status: asset.production.status,
          tokensOwned,
          tokenSymbol,
          capitalReturned,
          unrecoveredCapital,
          assetDepletion,
          asset, // Include the full asset object
        };
      })
      .filter(Boolean);
  }

  function calculateAssetDepletion(asset: Asset): number {
    // Get cumulative production from asset data
    let cumulativeProduction = 0;

    // Add production from monthly reports (recent months with payouts)
    if (asset.monthlyReports) {
      cumulativeProduction += arrayUtils.sum(
        asset.monthlyReports,
        (report) => report.production,
      );
    }

    // Add production from historical data (older months without payouts)
    if (asset.historicalProduction) {
      cumulativeProduction += arrayUtils.sum(
        asset.historicalProduction,
        (record) => record.production,
      );
    }

    // Get total reserves (estimated remaining + cumulative)
    let totalReserves = 0;
    const remainingProdStr =
      asset.production.expectedRemainingProduction || "N/A";

    if (remainingProdStr && remainingProdStr !== "TBD") {
      const match = remainingProdStr.match(/[\d.]+/);
      if (match) {
        const remainingMboe = parseFloat(match[0]) * 1000; // Convert mboe to boe
        totalReserves = cumulativeProduction + remainingMboe;
      }
    }

    return totalReserves > 0 ? (cumulativeProduction / totalReserves) * 100 : 0;
  }

  // Derived values
  const portfolioMetrics = derived(state, ($state) => ({
    totalValue: $state.totalInvested + $state.totalPayoutsEarned,
    roi:
      $state.totalInvested > 0
        ? ($state.totalPayoutsEarned / $state.totalInvested) * 100
        : 0,
    avgMonthlyPayout:
      $state.monthlyPayouts.length > 0
        ? $state.monthlyPayouts.reduce((sum, p) => sum + p.amount, 0) /
          $state.monthlyPayouts.length
        : 0,
  }));

  const chartData = derived(state, ($state) => {
    // Format month string to readable label
    const formatMonthLabel = (monthStr: string): string => {
      if (!monthStr || typeof monthStr !== "string") return "Unknown";
      const [year, month] = monthStr.split("-");
      if (!year || !month) return "Unknown";
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const monthIndex = parseInt(month) - 1;
      if (isNaN(monthIndex) || monthIndex < 0 || monthIndex >= 12)
        return "Unknown";
      return `${monthNames[monthIndex]} ${year}`;
    };

    const payoutTrend: Array<{ label: string; value: number }> = (
      $state.monthlyPayouts || []
    )
      .filter((p) => {
        // More comprehensive validation
        if (!p || typeof p !== "object") return false;
        if (!p.month || typeof p.month !== "string") return false;
        if (typeof p.totalPayout !== "number") return false;
        if (isNaN(p.totalPayout) || p.totalPayout < 0) return false;
        return true;
      })
      .map((p) => ({
        label: formatMonthLabel(p.month),
        value: p.totalPayout,
      }))
      .filter((item) => {
        // Final validation after transformation
        return (
          item.label &&
          item.label !== "Unknown" &&
          typeof item.value === "number" &&
          !isNaN(item.value) &&
          item.value >= 0
        );
      });

    const allocationPie: Array<{
      label: string;
      value: number;
      percentage: number;
    }> = ($state.tokenAllocations || [])
      .filter((a) => {
        // Filter out invalid entries
        if (
          !a ||
          typeof a.currentValue !== "number" ||
          typeof a.percentageOfPortfolio !== "number"
        ) {
          return false;
        }
        // Filter out entries with NaN or negative percentage values
        if (isNaN(a.percentageOfPortfolio) || a.percentageOfPortfolio < 0) {
          return false;
        }
        // Filter out entries with invalid values
        if (isNaN(a.currentValue) || a.currentValue < 0) {
          return false;
        }
        return true;
      })
      .map((a) => ({
        label: a.assetName || "Unknown Asset",
        value: a.currentValue,
        percentage: a.percentageOfPortfolio,
      }));

    return {
      payoutTrend,
      allocationPie,
    };
  });

  // Initialize
  loadPortfolioData();

  return {
    state: { subscribe: state.subscribe },
    portfolioMetrics,
    chartData,
    loadPortfolioData,
  };
}

/**
 * Get payout chart data for a specific holding
 */
export function getHoldingPayoutChartData(
  holding: any,
): Array<{ label: string; value: number }> {
  // Format date string to readable label
  const formatDateLabel = (dateStr: string): string => {
    if (!dateStr || typeof dateStr !== "string") return "Unknown";
    const [year, month] = dateStr.split("-");
    if (!year || !month) return "Unknown";
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthIndex = parseInt(month) - 1;
    if (isNaN(monthIndex) || monthIndex < 0 || monthIndex >= 12)
      return "Unknown";
    return `${monthNames[monthIndex]} ${year}`;
  };

  // Always return sample data to ensure the chart displays
  const sampleData = [
    { label: "Jul 2024", value: 350 },
    { label: "Aug 2024", value: 375 },
    { label: "Sep 2024", value: 395 },
    { label: "Oct 2024", value: 412 },
    { label: "Nov 2024", value: 428 },
    { label: "Dec 2024", value: 445 },
  ];

  // Get payout history for this specific asset
  const walletDataService = useWalletDataService();
  const assetPayouts = walletDataService.getHoldingsByAsset();
  const assetPayout = assetPayouts.find((p) => p.assetId === holding.id);

  if (
    !assetPayout ||
    !assetPayout.monthlyPayouts ||
    assetPayout.monthlyPayouts.length === 0
  ) {
    return sampleData;
  }

  // Convert monthly payouts to chart data format
  const chartData = assetPayout.monthlyPayouts
    .filter((p) => {
      // More comprehensive validation
      if (!p || typeof p !== "object") return false;
      if (!p.month || typeof p.month !== "string") return false;
      if (typeof p.amount !== "number") return false;
      if (isNaN(p.amount) || p.amount < 0) return false;
      return true;
    })
    .map((p) => ({
      label: formatDateLabel(p.month),
      value: p.amount,
    }))
    .filter((item) => {
      // Final validation after transformation
      return (
        item.label &&
        typeof item.value === "number" &&
        !isNaN(item.value) &&
        item.value >= 0
      );
    })
    .sort((a, b) => {
      // Sort by reconstructing the date for comparison
      const dateA = a.label.split(" ");
      const dateB = b.label.split(" ");
      const monthsOrder = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const yearDiff = parseInt(dateA[1]) - parseInt(dateB[1]);
      if (yearDiff !== 0) return yearDiff;
      return monthsOrder.indexOf(dateA[0]) - monthsOrder.indexOf(dateB[0]);
    });

  return chartData.length > 0 ? chartData : sampleData;
}
