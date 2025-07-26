/**
 * @fileoverview Service Container for Dependency Injection
 * Provides centralized access to all services and handles dependency management
 */

import assetService from "./AssetService";
import tokenService from "./TokenService";
import configService from "./ConfigService";
import walletDataService from "./WalletDataService";

export interface ServiceContainer {
  assetService: typeof assetService;
  tokenService: typeof tokenService;
  configService: typeof configService;
  walletDataService: typeof walletDataService;
}

export const serviceContainer: ServiceContainer = {
  assetService,
  tokenService,
  configService,
  walletDataService,
};

// Export convenience functions for direct access
export const useAssetService = () => serviceContainer.assetService;
export const useTokenService = () => serviceContainer.tokenService;
export const useConfigService = () => serviceContainer.configService;
export const useWalletDataService = () => serviceContainer.walletDataService;
