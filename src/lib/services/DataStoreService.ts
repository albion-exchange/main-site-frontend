/**
 * DataStoreService - Service layer for accessing static asset and token data
 * This service uses the unified asset metadata structure
 */

import type { 
  AssetMetadata,
  MonthlyData,
  AssetData,
  PlannedProductionProjection
} from '$lib/types/assetMetadataTypes';
import { TokenType, ProductionStatus } from '$lib/types/assetMetadataTypes';
import type { 
  Asset, 
  Token, 
  MarketData,
  UserTokenBalance 
} from '$lib/types/uiTypes';
import { getTokenReturns, type TokenReturns } from '$lib/utils/returnCalculations';

// Import configuration data
import marketData from '$lib/data/marketData.json';
import platformStats from '$lib/data/platformStats.json';
import companyInfo from '$lib/data/companyInfo.json';
import defaultValues from '$lib/data/defaultValues.json';

// Import all mock asset metadata
import bakHf1Metadata from '$lib/data/mockAssetMetadata/bak-hf1.json';
import bakHf2Metadata from '$lib/data/mockAssetMetadata/bak-hf2.json';
import eurWr1Metadata from '$lib/data/mockAssetMetadata/eur-wr1.json';
import eurWr2Metadata from '$lib/data/mockAssetMetadata/eur-wr2.json';
import eurWr3Metadata from '$lib/data/mockAssetMetadata/eur-wr3.json';
import perBv1Metadata from '$lib/data/mockAssetMetadata/per-bv1.json';
import gomDw1Metadata from '$lib/data/mockAssetMetadata/gom-dw1.json';

// Future release data (mock data for now)
const eurWr4Future = [{ whenRelease: "Q2 2025", description: "Additional Wressle release" }];
const bakHf3Future = [{ whenRelease: "Q3 2025", description: "Additional Bakken release" }];
const perBv2Future = [{ whenRelease: "Q4 2025", description: "Additional Permian release" }];
const gomDw2Future = [{ whenRelease: "Q1 2026", description: "Additional Gulf of Mexico release" }];

class DataStoreService {
  private assetMetadata: Record<string, AssetMetadata>;
  private assetsCache: Map<string, Asset> = new Map();
  private tokensCache: Map<string, Token> = new Map();

  constructor() {
    // Initialize asset metadata with proper date conversions
    this.assetMetadata = {
      [bakHf1Metadata.contractAddress]: this.convertJsonToAssetMetadata(bakHf1Metadata as any),
      [bakHf2Metadata.contractAddress]: this.convertJsonToAssetMetadata(bakHf2Metadata as any),
      [eurWr1Metadata.contractAddress]: this.convertJsonToAssetMetadata(eurWr1Metadata as any),
      [eurWr2Metadata.contractAddress]: this.convertJsonToAssetMetadata(eurWr2Metadata as any),
      [eurWr3Metadata.contractAddress]: this.convertJsonToAssetMetadata(eurWr3Metadata as any),
      [perBv1Metadata.contractAddress]: this.convertJsonToAssetMetadata(perBv1Metadata as any),
      [gomDw1Metadata.contractAddress]: this.convertJsonToAssetMetadata(gomDw1Metadata as any),
    };
  }

  // Helper method to convert JSON data to AssetMetadata with proper Date objects
  private convertJsonToAssetMetadata(jsonData: any): AssetMetadata {
    return {
      ...jsonData,
      monthlyData: jsonData.monthlyData.map((data: any) => ({
        ...data,
        tokenPayout: {
          ...data.tokenPayout,
          date: new Date(data.tokenPayout.date)
        }
      })),
      asset: {
        ...jsonData.asset,
        operationalMetrics: jsonData.asset.operationalMetrics ? {
          ...jsonData.asset.operationalMetrics,
          hseMetrics: {
            ...jsonData.asset.operationalMetrics.hseMetrics,
            lastIncidentDate: new Date(jsonData.asset.operationalMetrics.hseMetrics.lastIncidentDate)
          }
        } : jsonData.asset.operationalMetrics
      },
      metadata: {
        ...jsonData.metadata,
        createdAt: new Date(jsonData.metadata.createdAt),
        updatedAt: new Date(jsonData.metadata.updatedAt)
      }
    };
  }

  // Helper method to convert AssetMetadata to legacy Asset format
  private assetMetadataToAsset(assetMetadata: AssetMetadata): Asset {
    const assetId = this.getAssetIdFromToken(assetMetadata);
    
    // Check cache first
    if (this.assetsCache.has(assetId)) {
      return this.assetsCache.get(assetId)!;
    }

    const asset: Asset = {
      id: assetId,
      name: assetMetadata.assetName,
      description: assetMetadata.asset.description,
      images: [],
      location: {
        ...assetMetadata.asset.location,
        waterDepth: assetMetadata.asset.location.waterDepth
      },
      operator: {
        ...assetMetadata.asset.operator,
        experience: `${assetMetadata.asset.operator.experienceYears}+ years`
      },
      technical: {
        ...assetMetadata.asset.technical,
        depth: `${assetMetadata.asset.technical.depth}m`,
        estimatedLife: `${Math.ceil(assetMetadata.asset.technical.estimatedLifeMonths / 12)}+ years`,
        pricing: {
          benchmarkPremium: assetMetadata.asset.technical.pricing.benchmarkPremium < 0 
            ? `-$${Math.abs(assetMetadata.asset.technical.pricing.benchmarkPremium)}`
            : `+$${assetMetadata.asset.technical.pricing.benchmarkPremium}`,
          transportCosts: assetMetadata.asset.technical.pricing.transportCosts === 0
            ? "Title transfer at well head"
            : `$${assetMetadata.asset.technical.pricing.transportCosts}`
        }
      },
      production: {
        ...assetMetadata.asset.production,
        status: this.convertProductionStatus(assetMetadata.asset.production.status),
        units: {
          production: assetMetadata.asset.production.units.production === 1 ? "BOE (Barrels of Oil Equivalent)" : "MCF (Thousand Cubic Feet)",
          revenue: "USD"
        }
      },
      assetTerms: {
        ...assetMetadata.asset.assetTerms,
        amount: `${assetMetadata.asset.assetTerms.amount}% of gross`,
        paymentFrequency: `Monthly within ${assetMetadata.asset.assetTerms.paymentFrequencyDays} days`
      },
      tokenContracts: this.getTokenContractsByAssetId(assetId),
      monthlyReports: assetMetadata.monthlyData.map(data => ({
        month: data.month,
        production: data.assetData.production,
        revenue: data.assetData.revenue,
        expenses: data.assetData.expenses,
        netIncome: data.assetData.netIncome,
        payoutPerToken: data.tokenPayout.payoutPerToken
      })),
      productionHistory: assetMetadata.asset.productionHistory,
      plannedProduction: assetMetadata.asset.plannedProduction,
      operationalMetrics: assetMetadata.asset.operationalMetrics ? {
        ...assetMetadata.asset.operationalMetrics,
        dailyProduction: {
          ...assetMetadata.asset.operationalMetrics.dailyProduction,
          unit: assetMetadata.asset.operationalMetrics.dailyProduction.unit
        },
        uptime: {
          ...assetMetadata.asset.operationalMetrics.uptime,
          period: assetMetadata.asset.operationalMetrics.uptime.period
        },
        hseMetrics: {
          ...assetMetadata.asset.operationalMetrics.hseMetrics,
          incidentFreeDays: assetMetadata.asset.operationalMetrics.hseMetrics.incidentFreeDays
        }
      } : undefined,
      metadata: {
        createdAt: assetMetadata.metadata.createdAt.toISOString(),
        updatedAt: assetMetadata.metadata.updatedAt.toISOString()
      }
    };

    this.assetsCache.set(assetId, asset);
    return asset;
  }

  // Helper method to convert AssetMetadata to legacy Token format
  private assetMetadataToToken(assetMetadata: AssetMetadata): Token {
    // Check cache first
    if (this.tokensCache.has(assetMetadata.contractAddress)) {
      return this.tokensCache.get(assetMetadata.contractAddress)!;
    }

    const token: Token = {
      contractAddress: assetMetadata.contractAddress,
      name: assetMetadata.releaseName,
      symbol: assetMetadata.symbol,
      decimals: assetMetadata.decimals,
      tokenType: assetMetadata.tokenType === TokenType.Royalty ? 'royalty' : 'payment',
      assetId: this.getAssetIdFromToken(assetMetadata),
      isActive: true,
      supply: {
        maxSupply: assetMetadata.supply.maxSupply,
        mintedSupply: assetMetadata.supply.mintedSupply
      },
      holders: [], // Not included in merged token format
      payoutHistory: assetMetadata.monthlyData.map(data => ({
        month: data.month,
        date: data.tokenPayout.date.toISOString().split('T')[0],
        totalPayout: data.tokenPayout.totalPayout,
        payoutPerToken: data.tokenPayout.payoutPerToken,
        oilPrice: data.realisedPrice.oilPrice,
        gasPrice: data.realisedPrice.gasPrice,
        productionVolume: data.assetData.production,
        txHash: data.tokenPayout.txHash
      })),
      sharePercentage: assetMetadata.sharePercentage,
      firstPaymentDate: assetMetadata.firstPaymentDate,
      metadata: {
        createdAt: assetMetadata.metadata.createdAt.toISOString(),
        updatedAt: assetMetadata.metadata.updatedAt.toISOString()
      }
    };

    this.tokensCache.set(assetMetadata.contractAddress, token);
    return token;
  }

  // Helper to get asset ID from token
  private getAssetIdFromToken(assetMetadata: AssetMetadata): string {
    // Extract asset ID from token name or use a mapping
    const assetNameMapping: Record<string, string> = {
      'Bakken Horizon-2 Royalty Stream': 'bakken-horizon-field',
      'Wressle-1 Royalty Stream': 'europa-wressle-release-1',
      'Permian Basin-3 Royalty Stream': 'permian-basin-venture',
      'Gulf of Mexico-4 Royalty Stream': 'gulf-mexico-deep-water'
    };
    
    return assetNameMapping[assetMetadata.assetName] || assetMetadata.assetName.toLowerCase().replace(/\s+/g, '-');
  }

  // Helper to get all token contracts for an asset
  private getTokenContractsByAssetId(assetId: string): string[] {
    return Object.values(this.assetMetadata)
      .filter(token => this.getAssetIdFromToken(token) === assetId)
      .map(token => token.contractAddress);
  }

  // Helper to convert ProductionStatus enum to string
  private convertProductionStatus(status: ProductionStatus): 'funding' | 'producing' | 'completed' {
    switch (status) {
      case ProductionStatus.Producing:
        return 'producing';
      case ProductionStatus.Development:
      case ProductionStatus.Exploration:
        return 'funding';
      case ProductionStatus.Suspended:
      case ProductionStatus.Decommissioned:
        return 'completed';
      default:
        return 'producing';
    }
  }

  // Asset-related methods

  /**
   * Get all assets
   */
  getAllAssets(): Asset[] {
    const assetMap = new Map<string, Asset>();
    
    Object.values(this.assetMetadata).forEach(assetMetadata => {
      const asset = this.assetMetadataToAsset(assetMetadata);
      assetMap.set(asset.id, asset);
    });
    
    return Array.from(assetMap.values());
  }

  /**
   * Get asset by ID
   */
  getAssetById(assetId: string): Asset | null {
    const assets = this.getAllAssets();
    return assets.find(asset => asset.id === assetId) || null;
  }

  /**
   * Get assets by status
   */
  getAssetsByStatus(status: 'funding' | 'producing' | 'completed'): Asset[] {
    return this.getAllAssets().filter(asset => asset.production.status === status);
  }

  /**
   * Get assets by location (state/country)
   */
  getAssetsByLocation(location: string): Asset[] {
    return this.getAllAssets().filter(asset => 
      asset.location.state.toLowerCase().includes(location.toLowerCase()) ||
      asset.location.country.toLowerCase().includes(location.toLowerCase())
    );
  }

  /**
   * Search assets by name or description
   */
  searchAssets(query: string): Asset[] {
    const searchTerm = query.toLowerCase();
    return this.getAllAssets().filter(asset => 
      asset.name.toLowerCase().includes(searchTerm) ||
      asset.description.toLowerCase().includes(searchTerm)
    );
  }

  // Token-related methods

  /**
   * Get all tokens
   */
  getAllTokens(): Token[] {
    return Object.values(this.assetMetadata).map(assetMetadata => 
      this.assetMetadataToToken(assetMetadata)
    );
  }

  /**
   * Get token by contract address
   */
  getTokenByAddress(contractAddress: string): Token | null {
    const assetMetadata = this.assetMetadata[contractAddress];
    return assetMetadata ? this.assetMetadataToToken(assetMetadata) : null;
  }

  /**
   * Get asset metadata by contract address
   */
  getAssetMetadataByAddress(contractAddress: string): AssetMetadata | null {
    return this.assetMetadata[contractAddress] || null;
  }

  /**
   * Get token by symbol
   */
  getTokenBySymbol(symbol: string): Token | null {
    const assetMetadata = Object.values(this.assetMetadata).find(token => token.symbol === symbol);
    return assetMetadata ? this.assetMetadataToToken(assetMetadata) : null;
  }

  /**
   * Get tokens by asset ID
   */
  getTokensByAssetId(assetId: string): Token[] {
    return Object.values(this.assetMetadata)
      .filter(token => this.getAssetIdFromToken(token) === assetId)
      .map(token => this.assetMetadataToToken(token));
  }

  /**
   * Get tokens by type
   */
  getTokensByType(tokenType: 'royalty' | 'payment'): Token[] {
    const assetMetadataType = tokenType === 'royalty' ? TokenType.Royalty : TokenType.WorkingInterest;
    return Object.values(this.assetMetadata)
      .filter(token => token.tokenType === assetMetadataType)
      .map(token => this.assetMetadataToToken(token));
  }

  /**
   * Get active trading tokens only
   */
  getActiveTokens(): Token[] {
    return this.getAllTokens(); // All tokens are active in the merged format
  }

  /**
   * Get royalty tokens (excludes payment tokens)
   */
  getRoyaltyTokens(): Token[] {
    return this.getTokensByType('royalty');
  }

  /**
   * Get payment tokens only
   */
  getPaymentTokens(): Token[] {
    return this.getTokensByType('payment');
  }

  /**
   * Get selectable tokens (available for purchase)
   */
  getSelectableTokens(): Token[] {
    return this.getAllTokens();
  }

  // Combined asset-token methods

  /**
   * Get asset with its associated tokens
   */
  getAssetWithTokens(assetId: string): { asset: Asset; tokens: Token[] } | null {
    const asset = this.getAssetById(assetId);
    if (!asset) return null;

    const tokens = this.getTokensByAssetId(assetId);
    return { asset, tokens };
  }

  // Market data methods (mock implementations for now)

  /**
   * Get market data for all active tokens
   */
  getAllMarketData(): MarketData[] {
    const marketData: MarketData[] = [];
    
    this.getActiveTokens().forEach(token => {
      // Generate mock market data based on token
      const basePrice = 1.0;
      const priceChange = (Math.random() - 0.5) * 0.1;
      const volume = Math.random() * 1000000;
      
      marketData.push({
        symbol: token.symbol,
        price: basePrice + priceChange,
        change: priceChange,
        changePercent: (priceChange / basePrice) * 100,
        volume: volume,
        bid: basePrice + priceChange - 0.01,
        ask: basePrice + priceChange + 0.01,
        spread: 0.02,
        high24h: basePrice + Math.abs(priceChange) + 0.05,
        low24h: basePrice - Math.abs(priceChange) - 0.05,
        marketCap: parseFloat(token.supply.mintedSupply) / Math.pow(10, token.decimals) * (basePrice + priceChange)
      });
    });

    return marketData;
  }

  /**
   * Get market data for a specific token
   */
  getTokenMarketData(symbol: string): MarketData | null {
    const token = this.getTokenBySymbol(symbol);
    if (!token) return null;

    // Generate mock market data based on token
    const basePrice = 1.0;
    const priceChange = (Math.random() - 0.5) * 0.1;
    const volume = Math.random() * 1000000;
    
    return {
      symbol: token.symbol,
      price: basePrice + priceChange,
      change: priceChange,
      changePercent: (priceChange / basePrice) * 100,
      volume: volume,
      bid: basePrice + priceChange - 0.01,
      ask: basePrice + priceChange + 0.01,
      spread: 0.02,
      high24h: basePrice + Math.abs(priceChange) + 0.05,
      low24h: basePrice - Math.abs(priceChange) - 0.05,
      marketCap: parseFloat(token.supply.mintedSupply) / Math.pow(10, token.decimals) * (basePrice + priceChange)
    };
  }

  // Utility methods

  /**
   * Get latest monthly report for an asset
   */
  getLatestMonthlyReport(assetId: string) {
    const asset = this.getAssetById(assetId);
    if (!asset || asset.monthlyReports.length === 0) return null;

    return asset.monthlyReports[asset.monthlyReports.length - 1];
  }

  /**
   * Get calculated returns for a token based on planned production
   */
  getCalculatedTokenReturns(contractAddress: string): TokenReturns | null {
    const token = this.getTokenByAddress(contractAddress);
    if (!token) return null;

    const asset = this.getAssetById(token.assetId);
    if (!asset) return null;

    return getTokenReturns(asset, token);
  }

  /**
   * Calculate expected remaining production from planned production data
   */
  getCalculatedRemainingProduction(assetId: string): string {
    const asset = this.getAssetById(assetId);
    if (!asset?.plannedProduction?.projections) {
      return 'TBD';
    }

    // Sum all production from planned production projections
    const totalProduction = asset.plannedProduction.projections.reduce(
      (sum, projection) => sum + projection.production, 
      0
    );

    // Convert to mboe (thousand barrels)
    const productionInMboe = totalProduction / 1000;

    // Format with appropriate precision
    if (productionInMboe >= 10) {
      return `${Math.round(productionInMboe * 10) / 10} mboe`;
    } else {
      return `${Math.round(productionInMboe * 100) / 100} mboe`;
    }
  }

  /**
   * Calculate total portfolio value for given token balances
   */
  calculatePortfolioValue(balances: UserTokenBalance[]): number {
    return balances.reduce((total, balance) => total + balance.currentValue, 0);
  }

  /**
   * Get asset performance metrics
   */
  getAssetPerformanceMetrics(assetId: string) {
    const asset = this.getAssetById(assetId);
    if (!asset) return null;

    const reports = asset.monthlyReports;
    if (reports.length === 0) return null;

    const latest = reports[reports.length - 1];
    const previous = reports.length > 1 ? reports[reports.length - 2] : null;

    return {
      latestProduction: latest.production,
      latestNetIncome: latest.netIncome,
      latestPayoutPerToken: latest.payoutPerToken,
      monthOverMonthProductionChange: previous 
        ? ((latest.production - previous.production) / previous.production) * 100 
        : 0,
      monthOverMonthIncomeChange: previous 
        ? ((latest.netIncome - previous.netIncome) / previous.netIncome) * 100 
        : 0,
      totalProductionLast12Months: reports.slice(-12).reduce((sum, report) => sum + report.production, 0),
      totalIncomeLast12Months: reports.slice(-12).reduce((sum, report) => sum + report.netIncome, 0)
    };
  }

  /**
   * Format currency values
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Format token amounts (with decimals consideration)
   */
  formatTokenAmount(amount: string, decimals: number = 18): string {
    const value = parseFloat(amount) / Math.pow(10, decimals);
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  }

  /**
   * Get token supply information
   */
  getTokenSupply(contractAddress: string) {
    const token = this.getTokenByAddress(contractAddress);
    if (!token) return null;

    const maxSupply = parseFloat(token.supply.maxSupply) / Math.pow(10, token.decimals);
    const mintedSupply = parseFloat(token.supply.mintedSupply) / Math.pow(10, token.decimals);
    const supplyUtilization = (mintedSupply / maxSupply) * 100;

    return {
      maxSupply,
      mintedSupply,
      supplyUtilization,
      availableSupply: maxSupply - mintedSupply
    };
  }

  /**
   * Get platform statistics
   */
  getPlatformStatistics() {
    const allAssets = this.getAllAssets();
    const allTokens = this.getAllTokens();
    
    // Calculate total assets
    const totalAssets = allAssets.length;
    
    // Calculate total invested from all tokens' minted supply
    const totalInvested = allTokens.reduce((sum, token) => {
      const mintedTokens = parseFloat(token.supply.mintedSupply) / Math.pow(10, token.decimals);
      // Use $1 per token as base estimation
      return sum + mintedTokens;
    }, 0);
    
    // Calculate total payouts from monthly reports
    const totalPayouts = allAssets.reduce((sum, asset) => {
      return sum + asset.monthlyReports.reduce((assetSum, report) => assetSum + report.netIncome, 0);
    }, 0);
    
    // Get active token holders count (using a default since holders data is not in merged format)
    const totalHolders = 1000; // Mock value
    
    return {
      totalAssets,
      totalInvested,
      totalPayouts,
      totalHolders
    };
  }

  /**
   * Get token payout history data
   */
  getTokenPayoutHistory(contractAddress: string) {
    const assetMetadata = this.assetMetadata[contractAddress];
    if (!assetMetadata) return null;

    const recentPayouts = assetMetadata.monthlyData.map(data => ({
      month: data.month,
      date: data.tokenPayout.date.toISOString().split('T')[0],
      totalPayout: data.tokenPayout.totalPayout,
      payoutPerToken: data.tokenPayout.payoutPerToken,
      oilPrice: data.realisedPrice.oilPrice,
      gasPrice: data.realisedPrice.gasPrice,
      productionVolume: data.assetData.production,
      txHash: data.tokenPayout.txHash
    }));

    const totalPayouts = recentPayouts.length;
    const averageMonthlyPayout = recentPayouts.length > 0 
      ? recentPayouts.reduce((sum, payout) => sum + payout.payoutPerToken, 0) / totalPayouts 
      : 0;

    return {
      recentPayouts,
      totalPayouts,
      averageMonthlyPayout,
      totalPaid: recentPayouts.reduce((sum, payout) => sum + payout.totalPayout, 0)
    };
  }

  /**
   * Get market data configuration
   */
  getMarketData() {
    return marketData;
  }

  /**
   * Get platform statistics
   */
  getPlatformStats() {
    return platformStats;
  }

  /**
   * Get company information
   */
  getCompanyInfo() {
    return companyInfo;
  }

  /**
   * Get estimated token value based on region
   */
  getEstimatedTokenValue(assetId: string): number {
    const asset = this.getAssetById(assetId);
    if (!asset) return marketData.tokenPricing.defaultEstimatedValue;

    // Determine region based on asset location or ID
    let regionKey: 'europe' | 'bakken' | 'permian' | 'gulf-mexico' = 'europe'; // default
    if (assetId.includes('bakken')) regionKey = 'bakken';
    else if (assetId.includes('permian')) regionKey = 'permian';
    else if (assetId.includes('gulf')) regionKey = 'gulf-mexico';

    const multiplier = marketData.tokenPricing.regionMultipliers[regionKey] || 1.0;
    return marketData.tokenPricing.defaultEstimatedValue * multiplier;
  }

  /**
   * Get oil price scenarios
   */
  getOilPriceScenarios() {
    return marketData.scenarios.oilPrice;
  }

  /**
   * Get platform fees configuration
   */
  getPlatformFees() {
    return marketData.platformFees;
  }

  /**
   * Get default fallback values
   */
  getDefaultValues() {
    return defaultValues;
  }

  /**
   * Get future token releases (flattened from all assets)
   */
  getFutureReleases(): Array<{assetId: string, tokenId: string, whenRelease: string, description?: string, emoji?: string}> {
    const allReleases: Array<{assetId: string, tokenId: string, whenRelease: string, description?: string, emoji?: string}> = [];
    
    // Add Europa Wressle releases
    eurWr4Future.forEach(release => {
      allReleases.push({ assetId: 'europa-wressle-release-1', tokenId: 'eur_wr4', ...release });
    });
    
    // Add Bakken Horizon releases
    bakHf3Future.forEach(release => {
      allReleases.push({ assetId: 'bakken-horizon-field', tokenId: 'bak_hf3', ...release });
    });
    
    // Add Permian Basin releases
    perBv2Future.forEach(release => {
      allReleases.push({ assetId: 'permian-basin-venture', tokenId: 'per_bv2', ...release });
    });
    
    // Add Gulf of Mexico releases
    gomDw2Future.forEach(release => {
      allReleases.push({ assetId: 'gulf-mexico-deep-water', tokenId: 'gom_dw2', ...release });
    });
    
    return allReleases;
  }

  /**
   * Get future releases for a specific asset (sorted chronologically)
   */
  getFutureReleasesByAsset(assetId: string) {
    const releases = this.getFutureReleases();
    const assetReleases = releases.filter(release => release.assetId === assetId);
    
    // Sort by whenRelease chronologically
    assetReleases.sort((a, b) => a.whenRelease.localeCompare(b.whenRelease));
    
    return assetReleases;
  }

  /**
   * Get next future release for a specific asset (earliest chronologically)
   */
  getFutureReleaseByAsset(assetId: string) {
    const releases = this.getFutureReleasesByAsset(assetId);
    if (releases.length === 0) return null;
    
    // Sort by whenRelease and return first (next upcoming)
    releases.sort((a, b) => {
      // Simple string comparison should work for "Q1 2025" format
      return a.whenRelease.localeCompare(b.whenRelease);
    });
    
    return releases[0];
  }

  /**
   * Get next upcoming release across all assets
   */
  getNextRelease() {
    const releases = this.getFutureReleases();
    if (releases.length === 0) return null;
    
    // Sort by whenRelease and return first
    releases.sort((a, b) => a.whenRelease.localeCompare(b.whenRelease));
    return releases[0];
  }
}

// Export singleton instance
const dataStoreService = new DataStoreService();
export default dataStoreService;
export { dataStoreService };