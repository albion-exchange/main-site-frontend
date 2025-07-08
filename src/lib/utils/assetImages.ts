// Import all asset cover images
import europaWressleCover from '$lib/data/assets/europa-wressle-release-1/cover.jpg';
import bakkenHorizonCover from '$lib/data/assets/bakken-horizon-field/cover.jpeg';
import permianBasinCover from '$lib/data/assets/permian-basin-venture/cover.jpg';
import gulfMexicoCover from '$lib/data/assets/gulf-mexico-deep-water/cover.avif';

// Import gallery images
import europaWressleGallery1 from '$lib/data/assets/europa-wressle-release-1/gallery/2025-07-07 21.50.33.jpg';
import europaWressleGallery2 from '$lib/data/assets/europa-wressle-release-1/gallery/2025-07-07 21.50.38.jpg';
import europaWressleGallery3 from '$lib/data/assets/europa-wressle-release-1/gallery/2025-07-07 21.50.41.jpg';

// Map of asset IDs to their cover images
export const assetCoverImages: Record<string, string> = {
  'europa-wressle-release-1': europaWressleCover,
  'bakken-horizon-field': bakkenHorizonCover,
  'permian-basin-venture': permianBasinCover,
  'gulf-mexico-deep-water': gulfMexicoCover
};

// Function to get cover image for an asset
export function getAssetCoverImage(assetId: string): string {
  return assetCoverImages[assetId] || europaWressleCover; // Default fallback
}

// Gallery images for each asset
export const assetGalleryImages: Record<string, string[]> = {
  'europa-wressle-release-1': [
    europaWressleGallery1,
    europaWressleGallery2,
    europaWressleGallery3
  ],
  'bakken-horizon-field': [],
  'permian-basin-venture': [],
  'gulf-mexico-deep-water': []
};

// Function to get gallery images for an asset
export function getAssetGalleryImages(assetId: string): string[] {
  return assetGalleryImages[assetId] || [];
}