import { ENERGY_FIELDS } from "$lib/network";
import { get } from 'svelte/store';
import { getAssetById } from '$lib/stores/blockchainStore';
import { createUrlSlug } from '$lib/utils/formatters';

/**
 * Check if an energy field has incomplete releases (< 100% shares allocated)
 * @param assetId - The asset ID or energy field name to check
 * @returns Promise<boolean> - True if there are future releases available
 */
export async function hasIncompleteReleases(assetId: string): Promise<boolean> {
  // Find the matching energy field by slugified name
  const energyField = ENERGY_FIELDS.find(field => 
    createUrlSlug(field.name) === assetId
  );
  
  if (!energyField) return false;
  
  try {
    // Get the asset from the blockchain store using getAssetById
    const assetStore = getAssetById(assetId);
    const asset = get(assetStore);
    
    if (!asset) return false;
    
    // Calculate total share percentage from asset's tokens
    const totalSharePercentage = asset.tokens.reduce((sum: number, token: any) => {
      return sum + (token.sharePercentage || 0);
    }, 0);
    
    return totalSharePercentage < 100;
  } catch (error) {
    console.error(`Error checking incomplete releases for ${assetId}:`, error);
    return false;
  }
}