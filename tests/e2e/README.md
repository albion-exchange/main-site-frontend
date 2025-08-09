# E2E Testing Framework

This directory contains End-to-End (E2E) tests that verify the complete data flow from API calls to frontend display. The tests use the actual smart contract addresses and IPFS hashes provided to ensure realistic testing scenarios.

## Overview

The E2E tests verify that:
1. **API calls work correctly** - IPFS metadata, blockchain data, CSV claims
2. **Data transformation is accurate** - Services process raw data correctly  
3. **Frontend calculations are correct** - Portfolio totals, claims, payouts
4. **Data integrity is maintained** - Merkle roots, content hashes, validations

## Test Structure

### Test Files
- `portfolio.test.ts` - Tests complete portfolio data flow
- `claims.test.ts` - Tests claims processing and CSV validation
- `assets.test.ts` - Tests asset detail data and calculations

### Mock Infrastructure
- `mocks/fetch.ts` - Unified fetch mock routing all API calls
- `mocks/ipfs.ts` - Mock IPFS gateway serving CSV and metadata
- `mocks/subgraph.ts` - Mock GraphQL API for SFT and metadata queries
- `mocks/blockchain.ts` - Mock smart contract calls and wallet operations

### Test Data
- `data/testData.ts` - Comprehensive test data based on real contract addresses
- Uses actual IPFS hashes: `bafkreiceeasgwffk27kvrgfh4dihiekb7iiznqyjpbabavjrucymv2pobe`, etc.
- Uses actual contract addresses: `0xd5316ca888491575befc0273a00de2186c53f760`, etc.

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

### 1. Data Fetching Pipeline
- ✅ Fetch SFT data from subgraph
- ✅ Fetch metadata from subgraph  
- ✅ Fetch and validate CSV data from IPFS
- ✅ Verify data structure and content

### 2. Service Layer Integration
- ✅ Load assets through AssetService
- ✅ Load tokens through TokenService
- ✅ Calculate token supply information
- ✅ Process IPFS metadata correctly

### 3. Portfolio Calculations
- ✅ Calculate total invested amount from deposits
- ✅ Calculate total earned from CSV claims
- ✅ Calculate unclaimed payouts
- ✅ Verify arithmetic consistency

### 4. Claims Processing
- ✅ Validate CSV integrity with merkle roots
- ✅ Validate IPFS content addressing
- ✅ Generate consistent merkle trees
- ✅ Sort claims data by wallet address
- ✅ Calculate payout amounts correctly

### 5. Security Validations
- ✅ Reject invalid merkle roots
- ✅ Reject invalid IPFS hashes
- ✅ Validate CSV data structure
- ✅ Verify address formats and amounts

### 6. Data Consistency
- ✅ Maintain consistency between SFT data and metadata
- ✅ Validate merkle roots match expected values
- ✅ Verify IPFS content hashes
- ✅ Handle missing data gracefully

## Mock Behavior

The mock infrastructure simulates:

1. **IPFS Gateway** - Serves CSV files and metadata for test contract addresses
2. **Subgraph APIs** - Returns SFT and metadata for test contracts
3. **HyperSync API** - Returns blockchain logs for claims processing
4. **Smart Contracts** - Returns max supply, balances, and handles claim transactions
5. **Wallet Connection** - Simulates MetaMask wallet connection

## Validation Logic

The tests verify the same validation logic used in production:

1. **CSV Integrity** - Merkle tree validation against on-chain roots
2. **IPFS Content** - Content-addressed verification using CIDs
3. **Data Structure** - Required fields, formats, and ranges
4. **Arithmetic** - Mathematical consistency across calculations
5. **Security** - Input validation and error handling

## Test Data Consistency

All test data is generated to be:
- **Realistic** - Uses actual contract addresses and IPFS hashes
- **Consistent** - Maintains relationships between SFTs, metadata, and CSV data
- **Deterministic** - Same test runs produce same results
- **Comprehensive** - Covers all major data scenarios

## Debugging Tests

To debug failing tests:

1. Check console output for mock service logs
2. Verify test data generation in `testData.ts`
3. Add logging to specific test scenarios
4. Use VS Code debugger with breakpoints
5. Check that mock responses match expected formats

## Adding New Tests

To add new test scenarios:

1. Create test file in appropriate category
2. Import required mock services from `setup.ts`
3. Use `testDataProvider` for consistent test data
4. Follow existing patterns for assertions
5. Update this README with new test coverage

## CI/CD Integration

The E2E tests are designed to run in CI environments:
- No external dependencies required
- All data mocked locally
- Fast execution (< 30 seconds total)
- Detailed error reporting
- Coverage reporting integration