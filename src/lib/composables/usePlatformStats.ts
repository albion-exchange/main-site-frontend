/**
 * @fileoverview Platform statistics composable
 * Manages platform-wide statistics and calculations
 */

import {
  writable,
  derived,
  type Readable,
  type Writable,
  get,
} from "svelte/store";
import {
  useConfigService,
  useAssetService,
  useTokenService,
} from "$lib/services";
import { withSyncErrorHandling } from "$lib/utils/errorHandling";
import { sfts } from "$lib/stores";
import { formatEther } from "ethers";
import { ENERGY_FEILDS } from "$lib/network";
import { formatSmartNumber } from "$lib/utils/formatters";

interface PlatformStatsState {
  totalAssets: number;
  totalInvested: number;
  activeInvestors: number;
  totalRegions: number;
  monthlyGrowthRate: number;
  loading: boolean;
  error: string | null;
}

/**
 * Composable for platform statistics that uses sfts data
 */
export function usePlatformStats() {
  // Return a derived store that calculates platform stats from sfts data
  const platformStats = derived(sfts, ($sfts) => {
    if (!$sfts || $sfts.length === 0) {
      return {
        loading: true,
        totalAssets: 0,
        totalInvested: 0,
        activeInvestors: 0,
        totalRegions: 0,
        monthlyGrowthRate: 0,
        error: null,
      };
    }

    try {
      const totalTokenHolders = $sfts.reduce(
        (acc, sft) => acc + (sft.tokenHolders?.length || 0),
        0,
      );
      
      // Get all assets from the asset service for accurate count
      const assetService = useAssetService();
      const allAssets = assetService.getAllAssets();
      const totalAssets = allAssets.length;
      
      // Use ENERGY_FEILDS for regions count
      const totalRegions = ENERGY_FEILDS.length;
      
      const totalInvested = $sfts.reduce(
        (acc, sft) => acc + BigInt(sft.totalShares || 0),
        BigInt(0),
      );
      const stats = {
        loading: false,
        totalAssets: totalAssets,
        totalInvested: Number(formatEther(totalInvested)), // Keep as raw number
        activeInvestors: totalTokenHolders,
        totalRegions: totalRegions,
        monthlyGrowthRate: 2, // Don't know what this is yet
        error: null,
      };
      return stats;
    } catch (error) {
      return {
        loading: false,
        totalAssets: 0,
        totalInvested: 0,
        activeInvestors: 0,
        totalRegions: 0,
        monthlyGrowthRate: 0,
        error:
          error instanceof Error ? error.message : "Failed to calculate stats",
      };
    }
  });

  // Formatted values for display
  const formattedStats = derived(platformStats, ($stats) => ({
    totalInvested: formatSmartNumber($stats.totalInvested, {
      prefix: "$",
      threshold: 1000000,
      forceCompact: true,
    }),
    totalAssets: ($stats.totalAssets || 0).toString(),
    activeInvestors: formatSmartNumber($stats.activeInvestors || 0, {
      threshold: 1000,
    }),
    regionsText: `Across ${$stats.totalRegions} regions`,
    growthTrend: {
      value: $stats.monthlyGrowthRate,
      positive: $stats.monthlyGrowthRate >= 0,
    },
  }));

  return {
    platformStats,
    formattedStats,
  };
}
