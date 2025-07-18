/**
 * @fileoverview Service Container for Dependency Injection
 * Provides centralized access to all services and handles dependency management
 */

import assetService from './AssetService';
import tokenService from './TokenService';
import configService from './ConfigService';
import walletDataService from './WalletDataService';

export interface ServiceContainer {
  assetService: typeof assetService;
  tokenService: typeof tokenService;
  configService: typeof configService;
  walletDataService: typeof walletDataService;
}

class ServiceContainerImpl implements ServiceContainer {
  constructor() {
    // Services are already singleton instances
  }

  get assetService() {
    return assetService;
  }

  get tokenService() {
    return tokenService;
  }

  get configService() {
    return configService;
  }

  get walletDataService() {
    return walletDataService;
  }
}

// Export singleton instance
export const serviceContainer: ServiceContainer = new ServiceContainerImpl();

// Export convenience functions for direct access
export const useAssetService = () => serviceContainer.assetService;
export const useTokenService = () => serviceContainer.tokenService;
export const useConfigService = () => serviceContainer.configService;
export const useWalletDataService = () => serviceContainer.walletDataService;