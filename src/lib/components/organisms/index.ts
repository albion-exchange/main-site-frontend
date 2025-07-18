/**
 * @fileoverview Organisms Index
 * 
 * Organisms are complex UI components that combine molecules and atoms to form
 * distinct sections of an interface. They typically contain business logic
 * and application-specific functionality.
 * 
 * Design Principles:
 * - Combine multiple molecules to create meaningful interface sections
 * - Contain minimal business logic (prefer composition over implementation)
 * - Maintain clear responsibilities and single purpose
 * - Provide complete functional units of the interface
 */

// Export all organism components
export { default as AssetMetrics } from './AssetMetrics.svelte';
export { default as PaymentHistory } from './PaymentHistory.svelte';