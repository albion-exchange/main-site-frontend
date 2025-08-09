# E2E Testing Framework

This directory contains End-to-End (E2E) tests that verify the complete data flow from **actual HTTP API calls** to frontend display. The tests mock the real production endpoints, not service layers, ensuring that refactoring services won't break the tests.

## Overview

The E2E tests verify that:
1. **HTTP API endpoints work correctly** - IPFS gateway, subgraph APIs, blockchain APIs
2. **Data fetching functions get expected responses** - Raw API responses match expected format
3. **Frontend data processing is correct** - CSV validation, merkle trees, calculations
4. **End-to-end flow is preserved** - From HTTP call to final display values

## Key Design Decision: HTTP Endpoint Mocking

**✅ What we mock**: Actual production HTTP endpoints
- `https://gateway.pinata.cloud/ipfs/*` (IPFS Gateway)
- `https://api.goldsky.com/...` (Subgraph APIs)
- `https://8453.hypersync.xyz/query` (HyperSync API)
- `https://www.alphavantage.co/query` (Market data API)

**❌ What we DON'T mock**: Service layers, utilities, transforms
- AssetService, TokenService (you can refactor these freely)
- Data transformation functions 
- Business logic calculations

This means you can completely rewrite your services and the tests will still pass as long as the final results are correct.

## Test Structure

### Test Files
- `portfolio.test.ts` - Tests complete portfolio data flow from HTTP → display
- `claims.test.ts` - Tests claims processing and CSV validation from HTTP → calculations
- `assets.test.ts` - Tests asset metadata fetching from IPFS → data structure

### Mock Infrastructure  
- `mocks/fetch.ts` - **HTTP Endpoint Mock** that intercepts actual production URLs
- `mocks/blockchain.ts` - Mock smart contract calls (since these don't use fetch)
- `data/testData.ts` - Comprehensive test data based on real contract addresses

### Real Production Endpoints Mocked

```typescript
// These exact URLs are intercepted and mocked:
const endpoints = {
  SFT_SUBGRAPH: "https://api.goldsky.com/api/public/project_cm153vmqi5gke01vy66p4ftzf/subgraphs/sft-offchainassetvaulttest-base/1.0.4/gn",
  METADATA_SUBGRAPH: "https://api.goldsky.com/api/public/project_clv14x04y9kzi01saerx7bxpg/subgraphs/metadata-base/2025-07-06-594f/gn",
  ORDERBOOK_SUBGRAPH: "https://api.goldsky.com/api/public/project_clv14x04y9kzi01saerx7bxpg/subgraphs/ob4-base/2024-12-13-9c39/gn",
  PINATA_GATEWAY: "https://gateway.pinata.cloud/ipfs",
  HYPERSYNC_API: "https://8453.hypersync.xyz/query",
  ALPHA_VANTAGE: "https://www.alphavantage.co/query"
};
```

## Smart Contracts and Data Sources

The tests use data from these real energy fields:

### Bakken Horizon-2
- **Contracts**: `0xd5316ca888491575befc0273a00de2186c53f760`, `0xea9a6f77483a07bc287dfb8dad151042376eb153`
- **CSV Claims**: 4 different IPFS files with payout data
- **Merkle Roots**: Validated against expected on-chain values

### Gulf of Mexico-4  
- **Contract**: `0xae69a129b626b1e8fce196ef8e7d5faea3be753f`
- **CSV Claims**: 1 IPFS file with payout data

### Permian Basin-3 Release 1
- **Contract**: `0xc699575fe18f00104d926f0167cd858ce6d8b32e`  
- **CSV Claims**: 1 IPFS file with payout data

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests once (CI mode)
npm run test:e2e:run

# Run specific test file
npx vitest tests/e2e/portfolio.test.ts

# Run with verbose output
npx vitest tests/e2e/portfolio.test.ts --reporter=verbose
```

## Test Scenarios

### 1. HTTP Endpoint Integration
- ✅ Direct IPFS metadata requests to Pinata Gateway
- ✅ GraphQL queries to Goldsky subgraph APIs
- ✅ HyperSync blockchain log queries
- ✅ Alpha Vantage market data requests

### 2. Data Pipeline Verification
- ✅ `getSfts()` → subgraph query → SFT data structure
- ✅ `getSftMetadata()` → subgraph query → metadata array
- ✅ `fetchAndValidateCSV()` → IPFS fetch → CSV validation → merkle tree
- ✅ Raw data → transformed data → frontend calculations

### 3. Security Validations
- ✅ CSV merkle root validation against expected on-chain values
- ✅ IPFS content-addressed hash verification
- ✅ Data structure validation and error handling
- ✅ Invalid endpoint responses (404, malformed data)

### 4. Calculation Verification
- ✅ Portfolio totals (invested, earned, unclaimed amounts)
- ✅ Claims processing with wallet filtering
- ✅ Asset performance metrics from production data
- ✅ Arithmetic consistency across all calculations

## Benefits for Service Refactoring

### ✅ Safe to Refactor
- **Service classes** (AssetService, TokenService) - completely rewrite them
- **Data transformation logic** - change how raw data becomes UI data  
- **Store management** - change from stores to contexts to state machines
- **Utility functions** - reorganize, rename, restructure
- **Business logic** - improve calculations and data processing

### ✅ Tests Will Still Pass If
- HTTP endpoints return the same data structure
- Final calculated values remain mathematically correct
- Data validation logic preserves security checks
- Frontend receives properly formatted display data

### ❌ Tests Will Fail If  
- You change the expected calculation results
- You break CSV merkle tree validation
- You modify IPFS content hash verification
- You alter the final data structure expected by the frontend

## Mock Behavior

The HTTP endpoint mock:

1. **Logs unmocked calls** - Any HTTP call not in the endpoint list gets logged as a warning
2. **Returns realistic data** - Uses actual contract addresses and IPFS hashes
3. **Validates request format** - Ensures GraphQL queries and API calls are well-formed
4. **Maintains data relationships** - SFT data connects properly to metadata and CSV files

## Example: Safe Service Refactoring

```typescript
// BEFORE: Current messy service
class TokenService {
  // Current implementation with messy logic
}

// AFTER: Clean refactored service  
class TokenService {
  // Completely new implementation
  // As long as it calls the same HTTP endpoints
  // and produces the same final calculations,
  // tests will pass!
}
```

## Debugging

If tests fail during refactoring:

1. **Check console logs** - See which HTTP endpoints are being called
2. **Verify calculation results** - Ensure mathematical consistency
3. **Test data transformations** - Check that raw → UI transformations work
4. **Validate security logic** - Ensure merkle trees and hashes still validate
5. **Compare final output** - Make sure frontend gets expected data structure

## Adding New Tests

When adding new test scenarios:

1. **Use existing HTTP endpoints** - Don't mock new URLs unless absolutely necessary
2. **Focus on end-to-end flows** - Test from HTTP call to final calculation
3. **Use testDataProvider** - Leverage existing realistic test data
4. **Test error scenarios** - Invalid responses, network failures, bad data

This design ensures your tests provide real protection against regressions while giving you complete freedom to improve the underlying code architecture.