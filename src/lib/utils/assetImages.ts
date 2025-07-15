// Import all asset cover images from new structure
import europaWressleCover from '$lib/data/images/eur-wr-cover.jpg';
import bakkenHorizonCover from '$lib/data/images/bak-hf-cover.jpeg';
import permianBasinCover from '$lib/data/images/per-bv-cover.jpg';
import gulfMexicoCover from '$lib/data/images/gom-dw-cover.avif';

// Map of asset IDs to their cover images
export const assetCoverImages: Record<string, string> = {
  'europa-wressle-release-1': europaWressleCover,
  'bakken-horizon-field': bakkenHorizonCover,
  'permian-basin-venture': permianBasinCover,
  'gulf-mexico-deep-water': gulfMexicoCover,
  // New token-based asset IDs
  'eur-wr1': europaWressleCover,
  'eur-wr2': europaWressleCover,
  'eur-wr3': europaWressleCover,
  'bak-hf1': bakkenHorizonCover,
  'bak-hf2': bakkenHorizonCover,
  'gom-dw1': gulfMexicoCover,
  'per-bv1': permianBasinCover
};

// Function to get cover image for an asset
export function getAssetCoverImage(assetId: string): string {
  return assetCoverImages[assetId] || europaWressleCover; // Default fallback
}