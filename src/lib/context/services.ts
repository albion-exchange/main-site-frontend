/**
 * Services Context - Svelte context for dependency injection
 * 
 * Provides clean access to services in Svelte components
 * Enables service mocking for testing
 * Ensures consistent service usage patterns
 */

import { getContext, setContext } from 'svelte';
import type { ServiceContainer } from '$lib/services/ServiceContainer';
import { getServiceContainer } from '$lib/services/ServiceContainer';
import type { AssetService } from '$lib/services/AssetService';
import type { TokenService } from '$lib/services/TokenService';
import type { CacheService } from '$lib/services/CacheService';

// Context key
const SERVICES_CONTEXT_KEY = 'services';

/**
 * Set services context
 */
export function setServicesContext(container?: ServiceContainer): ServiceContainer {
  const services = container || getServiceContainer();
  setContext(SERVICES_CONTEXT_KEY, services);
  return services;
}

/**
 * Get services context
 */
export function getServicesContext(): ServiceContainer {
  const services = getContext<ServiceContainer>(SERVICES_CONTEXT_KEY);
  if (!services) {
    // Fallback to global container if no context is set
    return getServiceContainer();
  }
  return services;
}

/**
 * Individual service hooks for convenient access
 */

/**
 * Get AssetService from context
 */
export function useAssetService(): AssetService {
  const services = getServicesContext();
  return services.assetService;
}

/**
 * Get TokenService from context
 */
export function useTokenService(): TokenService {
  const services = getServicesContext();
  return services.tokenService;
}

/**
 * Get CacheService from context
 */
export function useCacheService(): CacheService {
  const services = getServicesContext();
  return services.cacheService;
}

/**
 * Get all services from context
 */
export function useServices(): ServiceContainer {
  return getServicesContext();
}

/**
 * Service hooks with built-in reactivity for common operations
 */

/**
 * Hook to get all assets with reactivity
 */
export function useAssets() {
  const assetService = useAssetService();
  
  // This would be more reactive in a real Svelte store implementation
  // For now, it's a simple function that returns a promise
  return {
    getAllAssets: () => assetService.getAllAssets(),
    getAssetById: (id: string) => assetService.getAssetById(id),
    searchAssets: (options: any) => assetService.searchAssets(options),
    getAssetStats: () => assetService.getAssetStats()
  };
}

/**
 * Hook to get all tokens with reactivity
 */
export function useTokens() {
  const tokenService = useTokenService();
  
  return {
    getAllTokens: () => tokenService.getAllTokens(),
    getTokenByAddress: (address: string) => tokenService.getTokenByAddress(address),
    getTokensByAssetId: (assetId: string) => tokenService.getTokensByAssetId(assetId),
    getTokenStats: () => tokenService.getTokenStats(),
    getTokenPayoutHistory: (address: string) => tokenService.getTokenPayoutHistory(address)
  };
}

/**
 * Hook for combined asset and token operations
 */
export function useAssetTokenData() {
  const assetService = useAssetService();
  const tokenService = useTokenService();
  
  return {
    getAssetWithTokens: async (assetId: string) => {
      const [asset, tokens] = await Promise.all([
        assetService.getAssetById(assetId),
        tokenService.getTokensByAssetId(assetId)
      ]);
      
      return asset ? { asset, tokens } : null;
    },
    
    getTokenWithAsset: async (tokenAddress: string) => {
      const token = await tokenService.getTokenByAddress(tokenAddress);
      if (!token) return null;
      
      const asset = await assetService.getAssetById(token.assetId);
      return asset ? { token, asset } : null;
    }
  };
}

/**
 * Hook for service statistics and monitoring
 */
export function useServiceMonitoring() {
  const services = useServices();
  
  return {
    getServiceStats: () => {
      if ('getServiceStats' in services) {
        return (services as any).getServiceStats();
      }
      return null;
    },
    
    refreshServices: async () => {
      if ('refresh' in services) {
        return (services as any).refresh();
      }
    },
    
    clearCaches: () => {
      services.assetService.clearCache();
      services.tokenService.clearCache();
      services.cacheService.clearAll();
    }
  };
}