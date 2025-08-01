/**
 * @fileoverview Platform statistics composable
 * Manages platform-wide statistics and calculations
 */

import {
  derived,
} from "svelte/store";
import { sfts, sftMetadata } from "$lib/stores";
import { formatEther } from "viem";
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
    console.log('=== Platform Stats Calculation ===');
    console.log('$sfts data:', $sfts);
    console.log('$sfts length:', $sfts?.length);
    console.log('$sftMetadata:', $sftMetadata);
    console.log('ENERGY_FIELDS:', ENERGY_FIELDS);
    
    if (!$sfts || $sfts.length === 0 || !$sftMetadata) {
      console.log('No data yet, returning loading state');
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
      // Collect unique addresses across all contracts
      const uniqueHolders = new Set<string>();
      const holderDetails = new Map<string, string[]>(); // Map of holder address to array of contract addresses
      
      $sfts.forEach(sft => {
        if (sft.tokenHolders && Array.isArray(sft.tokenHolders)) {
          sft.tokenHolders.forEach(holder => {
            if (holder.address && holder.balance && Number(holder.balance) > 0) {
              const holderAddr = holder.address.toLowerCase();
              // Add to unique holders set
              uniqueHolders.add(holderAddr);
              
              // Track which contracts this holder has tokens in
              if (!holderDetails.has(holderAddr)) {
                holderDetails.set(holderAddr, []);
              }
              holderDetails.get(holderAddr)!.push(sft.address || sft.id);
            }
          });
        }
      });
      
      // Log all unique holders with their contract holdings
      console.log(`Total unique investors: ${uniqueHolders.size}`);
      console.log('Investor details:');
      holderDetails.forEach((contracts, holder) => {
        console.log(`  ${holder}:`);
        contracts.forEach(contract => {
          console.log(`    - ${contract}`);
        });
      });
      
      const totalTokenHolders = uniqueHolders.size;
      
      // Use ENERGY_FIELDS as canonical source for asset counting
      const totalAssets = ENERGY_FIELDS.length;
      
      // Decode metadata to get country information
      const decodedMeta = $sftMetadata.map((metaV1) => decodeSftInformation(metaV1));
      const countries = new Set<string>();
      
      // Only process tokens that are in ENERGY_FIELDS
      for (const field of ENERGY_FIELDS) {
        for (const tokenInfo of field.sftTokens) {
          const tokenAddress = tokenInfo.address.toLowerCase();
          const sft = $sfts.find(s => s.id.toLowerCase() === tokenAddress);
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
      
      console.log('=== STARTING TOTAL INVESTED CALCULATION ===');
      console.log('Number of SFTs:', $sfts.length);
      console.log('Energy fields to check:', ENERGY_FIELDS.map(f => f.name));
      
      // Calculate total invested by summing totalShares from ENERGY_FIELDS tokens only
      // Since each token costs $1 USDT, total invested = total minted tokens
      let totalInvested = 0;
      
      console.log('Calculating total invested...');
      
      // Only count tokens that are in ENERGY_FIELDS (active assets)
      for (const field of ENERGY_FIELDS) {
        console.log(`Checking field: ${field.name}`);
        for (const tokenInfo of field.sftTokens) {
          const tokenAddress = tokenInfo.address.toLowerCase();
          console.log(`  Looking for token: ${tokenAddress}`);
          
          const sft = $sfts.find(s => s.id.toLowerCase() === tokenAddress);
          if (sft) {
            console.log(`  Found SFT:`, {
              id: sft.id,
              name: sft.name,
              totalShares: sft.totalShares,
              hasDeposits: sft.deposits?.length > 0
            });
            
            if (sft.totalShares && sft.totalShares !== "0") {
              // totalShares is in wei format (18 decimals), convert to USD
              const shares = Number(formatEther(sft.totalShares));
              totalInvested += shares;
              console.log(`  ✓ Added ${shares} USD from ${sft.name}`);
            } else {
              console.log(`  ✗ No totalShares for ${sft.name}`);
            }
          } else {
            console.log(`  ✗ SFT not found in data`);
          }
        }
      }
      console.log('Total invested across platform:', totalInvested, 'USD');
      const stats = {
        loading: false,
        totalAssets: totalAssets,
        totalInvested: totalInvested, // Already converted to number
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
    regionsText: `Across ${$stats.totalRegions} ${$stats.totalRegions === 1 ? 'country' : 'countries'}`,
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
