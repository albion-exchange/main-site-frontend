# Service Architecture Documentation

## Overview

The application uses a modern service architecture with focused, single-responsibility services managed through a centralized service container. This architecture provides clear separation of concerns, improved testability, and consistent error handling.

## Service Container Pattern

### Core Implementation

```typescript
// src/lib/services/ServiceContainer.ts
export interface ServiceContainer {
  assetService: AssetService;
  tokenService: TokenService;
  configService: ConfigService;
  walletDataService: WalletDataService;
}

// Usage in components/composables
import { useAssetService, useTokenService } from '$lib/services';

const assetService = useAssetService();
const tokenService = useTokenService();
```

### Benefits

1. **Dependency Injection**: Easy to mock services for testing
2. **Singleton Management**: Single instance per service across the app
3. **Type Safety**: Full TypeScript support with proper typing
4. **Consistent Access**: Uniform pattern for service consumption

## Service Responsibilities

### AssetService (`src/lib/services/AssetService.ts`)

**Responsibility**: Asset-related data operations and business logic

**Key Methods**:
- `getAllAssets()`: Get all assets with UI transformations
- `getAssetById(id)`: Get specific asset by ID
- `getAssetsByStatus(status)`: Filter assets by production status
- `getAssetsByLocation(country, state?)`: Filter assets by location
- `searchAssets(query)`: Text search across asset data
- `getLatestMonthlyReport(assetId)`: Get most recent production report
- `getAverageMonthlyRevenue(assetId)`: Calculate average revenue

**Data Sources**: 
- Asset metadata JSON files
- Monthly production reports
- Asset location and status data

### TokenService (`src/lib/services/TokenService.ts`)

**Responsibility**: Token-related data operations and calculations

**Key Methods**:
- `getAllTokens()`: Get all tokens with UI transformations
- `getTokenByAddress(address)`: Get token by contract address
- `getTokensByAssetId(assetId)`: Get all tokens for specific asset
- `getTokensByType(type)`: Filter by 'royalty' or 'payment' tokens
- `getAvailableTokens()`: Get tokens with available supply
- `getTokenSupply(address)`: Get supply information for token
- `getTokenPayoutHistory(address)`: Get payout history
- `getTokenReturns(address)`: Calculate token return metrics
- `searchTokens(query)`: Text search across token data

**Data Sources**:
- Token metadata JSON files
- Asset-token mapping configuration
- Supply and payout calculations

### ConfigService (`src/lib/services/ConfigService.ts`)

**Responsibility**: Configuration management and platform settings

**Key Methods**:
- `getPlatformStats()`: Platform-wide statistics
- `getMarketConfig()`: Market data and pricing
- `getCompanyConfig()`: Company information
- `getFutureReleases()`: All upcoming token releases
- `getFutureReleasesByAsset(assetId)`: Asset-specific releases
- `getCurrentOilPrice()`: Current oil commodity price
- `getPlatformFee()`: Transaction fee percentage

**Data Sources**:
- `marketData.json`: Commodity prices and market indicators
- `platformStats.json`: Platform-wide metrics
- `companyInfo.json`: Company details and contact info
- `futureReleases.json`: Upcoming token release schedule

### WalletDataService (`src/lib/services/WalletDataService.ts`)

**Responsibility**: User wallet data and transaction management

**Key Methods**:
- `getTotalInvested()`: Total user investment amount
- `getTotalPayoutsEarned()`: Total earned from payouts
- `getUnclaimedPayouts()`: Current unclaimed balance
- `getHoldingsByAsset()`: Holdings grouped by asset
- `getMonthlyPayoutHistory()`: Historical payout data
- `getTokenAllocation()`: Portfolio allocation breakdown
- `getAllTransactions()`: Complete transaction history
- `getActiveAssetsCount()`: Number of assets user has invested in

**Data Sources**:
- `wallet.json`: Mock wallet transaction and payout data
- Integration with Asset and Token services for enriched data

## Error Handling System

### Error Types and Codes

```typescript
// src/lib/utils/errorHandling.ts
export enum ErrorCode {
  // Data related
  ASSET_NOT_FOUND = 'ASSET_NOT_FOUND',
  TOKEN_NOT_FOUND = 'TOKEN_NOT_FOUND',
  DATA_LOAD_FAILED = 'DATA_LOAD_FAILED',
  
  // Service related
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  CACHE_ERROR = 'CACHE_ERROR',
  
  // Business logic
  INVALID_CALCULATION = 'INVALID_CALCULATION',
  INSUFFICIENT_DATA = 'INSUFFICIENT_DATA'
}
```

### Error Handling Patterns

```typescript
// Synchronous operations
const asset = withSyncErrorHandling(
  () => assetService.getAssetById(assetId),
  { service: 'AssetService', operation: 'getAssetById' }
);

// Asynchronous operations
const data = await withErrorHandling(
  () => loadAssetData(),
  { service: 'AssetService', operation: 'loadAssetData' }
);
```

### Error Severity Levels

- **LOW**: Non-blocking issues, logged silently
- **MEDIUM**: User notification, graceful degradation
- **HIGH**: Blocking issues, user intervention required
- **CRITICAL**: System-level failures, telemetry reporting

## Usage Guidelines

### Component Integration

```typescript
// In Svelte components
<script lang="ts">
  import { useAssetService, useTokenService } from '$lib/services';
  
  const assetService = useAssetService();
  const tokenService = useTokenService();
  
  // Use services directly
  $: assets = assetService.getAllAssets();
  $: tokens = tokenService.getTokensByAssetId(assetId);
</script>
```

### Composable Integration

```typescript
// In composables
export function useAssetData(assetId: string) {
  const assetService = useAssetService();
  const tokenService = useTokenService();
  
  function loadAsset() {
    const asset = withSyncErrorHandling(
      () => assetService.getAssetById(assetId),
      { service: 'AssetService', operation: 'getAssetById' }
    );
    
    // ... handle result
  }
}
```

### Testing with Mocks

```typescript
// In tests
import { ServiceContainer } from '$lib/services/ServiceContainer';

const mockAssetService = {
  getAllAssets: jest.fn(() => []),
  getAssetById: jest.fn(() => null)
};

const mockContainer: ServiceContainer = {
  assetService: mockAssetService,
  // ... other services
};
```

## Data Flow Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Components    │────│   Composables    │────│   Services      │
│                 │    │                  │    │                 │
│ - Pages         │    │ - useAssetData   │    │ - AssetService  │
│ - UI Components │    │ - useTokenData   │    │ - TokenService  │
│ - Forms         │    │ - usePlatform    │    │ - ConfigService │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                                        │
                                               ┌─────────────────┐
                                               │   Data Sources  │
                                               │                 │
                                               │ - JSON Files    │
                                               │ - Calculations  │
                                               │ - Transformers  │
                                               └─────────────────┘
```

## Performance Considerations

### Caching Strategy
- Services are singleton instances
- Data transformation results cached where appropriate
- Lazy loading of large datasets

### Memory Management
- Services initialized only when needed
- Clear separation prevents circular dependencies
- Efficient data structures for lookups

### Error Recovery
- Graceful degradation on service failures
- Fallback data for critical operations
- Non-blocking error reporting

## Migration Benefits

### Before (DataStoreService)
- ❌ Single large service with mixed responsibilities
- ❌ 900+ lines of code in one file
- ❌ Difficult to test individual features
- ❌ No clear separation of concerns
- ❌ Limited error handling

### After (Focused Services)
- ✅ Clear single responsibility per service
- ✅ 200-300 lines per focused service
- ✅ Easy to mock and test
- ✅ Clear architectural boundaries
- ✅ Comprehensive error handling
- ✅ Dependency injection support

## Future Extensibility

The service architecture is designed for easy extension:

1. **New Services**: Add to ServiceContainer interface
2. **Service Dependencies**: Inject via constructor
3. **Error Handling**: Use existing error patterns
4. **Testing**: Follow established mocking patterns
5. **Data Sources**: Add new sources per service responsibility

This architecture provides a solid foundation for scaling the application while maintaining code quality and developer experience.