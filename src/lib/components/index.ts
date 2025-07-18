/**
 * @fileoverview Components Index
 * 
 * Main export file for all components, organized by atomic design principles.
 * This provides a clean, hierarchical way to import components throughout the app.
 * 
 * @example
 * // Import specific atoms
 * import { Button, Input } from '$lib/components/atoms';
 * 
 * // Import specific molecules
 * import { FormField, MetricCard } from '$lib/components/molecules';
 * 
 * // Import from main index
 * import { Button, FormField, AssetMetrics } from '$lib/components';
 */

// Re-export atomic design components
export * from './atoms';
export * from './molecules';
export * from './organisms';
export * from './templates';

// Legacy component exports for backward compatibility
// These will be gradually migrated to atomic design structure
export { default as TokenPurchaseWidget } from './TokenPurchaseWidget.svelte';
export { default as WalletModal } from './WalletModal.svelte';

// Asset-specific components (to be migrated)
export { default as AssetCard } from './assets/AssetCard.svelte';
export { default as AssetDetailHeader } from './assets/AssetDetailHeader.svelte';
export { default as AssetOverviewTab } from './assets/AssetOverviewTab.svelte';

// Layout components (to be migrated to templates)
export * from './layout';

// Carousel components (to be migrated)
export * from './carousel';

// Legacy UI components (deprecated - use atomic design components instead)
// These are kept for backward compatibility but should be replaced
// with atoms, molecules, or organisms over time