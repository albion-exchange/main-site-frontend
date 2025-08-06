import { ENERGY_FIELDS } from "$lib/network";
import { get } from 'svelte/store';
import { assets } from '$lib/stores/blockchainStore';

/**
 * Check if an energy field has incomplete releases (< 100% shares allocated)
 * @param assetId - The asset ID or energy field name to check
 * @returns Promise<boolean> - True if there are future releases available
 */
export async function hasIncompleteReleases(assetId: string): Promise<boolean> {
  // Find the matching energy field
  const energyField = ENERGY_FIELDS.find(field => 
    field.name === assetId ||
    field.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === assetId
  );
  
  if (!energyField) return false;
  
  try {
    // Get the asset from the blockchain store
    const assetsMap = get(assets);
    const asset = assetsMap.get(assetId);
    
    if (!asset) return false;
    
    // Calculate total share percentage from asset's tokens
    const totalSharePercentage = asset.tokens.reduce((sum, token) => {
      return sum + (token.sharePercentage || 0);
    }, 0);
    
    return totalSharePercentage < 100;
  } catch (error) {
    console.error(`Error checking incomplete releases for ${assetId}:`, error);
    return false;
  }
}