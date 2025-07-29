/**
 * @fileoverview Platform statistics composable
 * Manages platform-wide statistics and calculations
 */

import {
  derived,
} from "svelte/store";
import { sfts, sftMetadata } from "$lib/stores";
import { formatEther } from "ethers";
import { formatSmartNumber } from "$lib/utils/formatters";
import { decodeSftInformation } from "$lib/decodeMetadata/helpers";
import { generateAssetInstanceFromSftMeta } from "$lib/decodeMetadata/addSchemaToReceipts";
import { ENERGY_FIELDS } from "$lib/network";

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
  // Return a derived store that calculates platform stats from sfts and metadata
  const platformStats = derived([sfts, sftMetadata], ([$sfts, $sftMetadata]) => {
    if (!$sfts || $sfts.length === 0 || !$sftMetadata) {
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
      
      // Use ENERGY_FIELDS as canonical source for asset counting
      const totalAssets = ENERGY_FIELDS.length;
      
      // Decode metadata to get country information
      const decodedMeta = $sftMetadata.map((metaV1) => decodeSftInformation(metaV1));
      const countries = new Set<string>();
      
      // Only process tokens that are in ENERGY_FIELDS
      for (const field of ENERGY_FIELDS) {
        for (const tokenAddress of field.sftTokens) {
          const sft = $sfts.find(s => s.id.toLowerCase() === tokenAddress.toLowerCase());
          if (sft) {
            const pinnedMetadata = decodedMeta.find(
              (meta) => meta?.contractAddress === `0x000000000000000000000000${sft.id.slice(2)}`
            );
            if (pinnedMetadata && pinnedMetadata.asset) {
              // Add country to set
              const country = pinnedMetadata.asset.location?.country;
              if (country && country.trim() !== '') {
                countries.add(country);
              }
            }
          }
        }
      }
      
      const totalRegions = countries.size;
      
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
    regionsText: `Across ${$stats.totalRegions} countries`,
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
