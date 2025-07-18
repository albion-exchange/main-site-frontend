/**
 * @fileoverview Service Container for Dependency Injection
 * Provides centralized access to all services and handles dependency management
 */

import AssetService from './AssetService';
import TokenService from './TokenService';
import ConfigService from './ConfigService';
import WalletDataService from './WalletDataService';

export interface ServiceContainer {
  assetService: AssetService;
  tokenService: TokenService;
  configService: ConfigService;
  walletDataService: WalletDataService;
}

class ServiceContainerImpl implements ServiceContainer {
  private _assetService: AssetService;
  private _tokenService: TokenService;
  private _configService: ConfigService;
  private _walletDataService: WalletDataService;

  constructor() {
    // Initialize services in dependency order
    this._configService = new ConfigService();
    this._assetService = new AssetService();
    this._tokenService = new TokenService();
    this._walletDataService = new WalletDataService();
  }

  get assetService(): AssetService {
    return this._assetService;
  }

  get tokenService(): TokenService {
    return this._tokenService;
  }

  get configService(): ConfigService {
    return this._configService;
  }

  get walletDataService(): WalletDataService {
    return this._walletDataService;
  }
}

// Export singleton instance
export const serviceContainer: ServiceContainer = new ServiceContainerImpl();

// Export convenience functions for direct access
export const useAssetService = () => serviceContainer.assetService;
export const useTokenService = () => serviceContainer.tokenService;
export const useConfigService = () => serviceContainer.configService;
export const useWalletDataService = () => serviceContainer.walletDataService;