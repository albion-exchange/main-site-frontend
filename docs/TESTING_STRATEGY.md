# Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for the Albion Marketplace application, including unit tests, integration tests, and end-to-end testing approaches.

## Testing Pyramid

```
                    E2E Tests
                  /           \
              Integration Tests
            /                   \
        Unit Tests (Services & Utils)
      /                           \
  Component Tests              Composable Tests
```

## Testing Frameworks and Tools

### Core Testing Stack
- **Vitest**: Fast unit testing framework with TypeScript support
- **@testing-library/svelte**: Component testing utilities
- **jsdom**: DOM environment for component tests
- **@vitest/ui**: Visual test runner interface

### Additional Tools
- **MSW (Mock Service Worker)**: API mocking for integration tests
- **Playwright**: End-to-end testing (future consideration)
- **@testing-library/jest-dom**: Enhanced DOM assertions

## Testing Categories

### 1. Unit Tests

**Purpose**: Test individual functions, utilities, and service methods in isolation.

**Coverage**: 
- All utility functions (`src/lib/utils/`)
- Service layer business logic (`src/lib/services/`)
- Composable logic (`src/lib/composables/`)

**Example Structure**:
```typescript
// formatters.test.ts
describe('formatCurrency', () => {
  it('should format positive numbers correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });
  
  it('should handle edge cases', () => {
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(-100)).toBe('-$100.00');
  });
});
```

### 2. Component Tests

**Purpose**: Test component rendering, props, events, and user interactions.

**Coverage**:
- Atoms: Button, FormField, Label, StatusBadge
- Molecules: Card, MetricDisplay, ButtonGroup
- Organisms: Modal, Chart, DataTable

**Testing Patterns**:

```typescript
// Button.test.ts
describe('Button Component', () => {
  it('renders with correct props', () => {
    const { getByRole } = render(Button, {
      props: { variant: 'primary', children: 'Test Button' }
    });
    
    const button = getByRole('button');
    expect(button).toHaveClass('btn-primary');
    expect(button).toHaveTextContent('Test Button');
  });
  
  it('handles user interactions', async () => {
    const handleClick = vi.fn();
    const { getByRole, component } = render(Button, {
      props: { children: 'Click me' }
    });
    
    component.$on('click', handleClick);
    await fireEvent.click(getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledOnce();
  });
  
  it('supports accessibility features', () => {
    const { getByRole } = render(Button, {
      props: { 
        children: 'Save',
        'aria-label': 'Save document'
      }
    });
    
    expect(getByRole('button')).toHaveAttribute('aria-label', 'Save document');
  });
});
```

### 3. Composable Tests

**Purpose**: Test stateful logic, data fetching, and reactive behavior.

**Coverage**:
- Data fetching composables (`useAssetData`, `usePortfolioData`)
- UI state composables (`useTooltip`, `useCardFlip`)
- Business logic composables (`useDataExport`)

**Testing Patterns**:

```typescript
// useAssetData.test.ts
describe('useAssetData', () => {
  it('loads asset data correctly', async () => {
    const mockAsset = { id: '1', name: 'Test Asset' };
    vi.mocked(assetService.getAsset).mockResolvedValue(mockAsset);
    
    const { state, loadAsset } = useAssetData();
    
    await loadAsset('1');
    
    expect(get(state).loading).toBe(false);
    expect(get(state).data).toEqual(mockAsset);
    expect(get(state).error).toBeNull();
  });
  
  it('handles loading states', () => {
    const { state, loadAsset } = useAssetData();
    
    loadAsset('1'); // Don't await to test loading state
    
    expect(get(state).loading).toBe(true);
    expect(get(state).data).toBeNull();
  });
});
```

### 4. Service Tests

**Purpose**: Test business logic, data transformation, and service interactions.

**Coverage**:
- AssetService calculations and filtering
- TokenService token operations
- WalletDataService portfolio calculations
- ConfigService data loading

**Mocking Strategy**:

```typescript
// AssetService.test.ts
vi.mock('$lib/services/ConfigService', () => ({
  default: {
    getAllAssets: vi.fn(),
    getAssetById: vi.fn()
  }
}));

describe('AssetService', () => {
  let assetService: AssetService;
  let mockConfigService: any;
  
  beforeEach(() => {
    mockConfigService = {
      getAllAssets: vi.fn(),
      getAssetById: vi.fn()
    };
    assetService = new AssetService(mockConfigService);
  });
  
  it('calculates asset metrics correctly', () => {
    const asset = createMockAsset({
      totalSupply: 1000,
      availableSupply: 600,
      pricePerToken: 100
    });
    
    const metrics = assetService.calculateAssetMetrics(asset);
    
    expect(metrics.soldPercentage).toBe(40);
    expect(metrics.totalValue).toBe(100000);
  });
});
```

### 5. Integration Tests

**Purpose**: Test component and service interactions, data flow between layers.

**Coverage**:
- Page-level component data loading
- Service layer interactions
- Error handling flows
- User workflows

**Setup**:

```typescript
// AssetDetailPage.integration.test.ts
describe('Asset Detail Page Integration', () => {
  beforeEach(() => {
    // Setup MSW handlers
    server.use(
      rest.get('/api/assets/:id', (req, res, ctx) => {
        return res(ctx.json(mockAssetData));
      })
    );
  });
  
  it('loads and displays asset data', async () => {
    const { getByText, findByText } = render(AssetDetailPage, {
      props: { assetId: 'asset-1' }
    });
    
    // Should show loading state initially
    expect(getByText('Loading...')).toBeInTheDocument();
    
    // Should display asset data after loading
    await findByText('Solar Farm Alpha');
    expect(getByText('$1,000,000')).toBeInTheDocument();
  });
});
```

## Test Organization

### File Naming Convention
- Unit tests: `*.test.ts`
- Component tests: `*.test.ts` (same directory as component)
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.e2e.test.ts`

### Directory Structure
```
src/
├── lib/
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── Button.svelte
│   │   │   └── Button.test.ts
│   │   └── molecules/
│   ├── services/
│   │   ├── AssetService.ts
│   │   └── AssetService.test.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   └── formatters.test.ts
│   └── composables/
│       ├── useAssetData.ts
│       └── useAssetData.test.ts
└── test/
    ├── setup.ts
    ├── mocks/
    └── fixtures/
```

## Mock Strategy

### Service Mocks
```typescript
// test/mocks/services.ts
export const mockAssetService = {
  getAllAssets: vi.fn(),
  getAssetById: vi.fn(),
  calculateAssetMetrics: vi.fn()
};

export const mockWalletService = {
  connect: vi.fn(),
  getBalance: vi.fn(),
  getTransactions: vi.fn()
};
```

### Data Fixtures
```typescript
// test/fixtures/assets.ts
export const createMockAsset = (overrides = {}) => ({
  id: 'asset-1',
  name: 'Test Asset',
  totalSupply: 1000000,
  availableSupply: 500000,
  pricePerToken: 100,
  ...overrides
});

export const mockAssets = [
  createMockAsset({ id: 'asset-1', name: 'Solar Farm' }),
  createMockAsset({ id: 'asset-2', name: 'Wind Turbine' })
];
```

### API Mocking
```typescript
// test/mocks/api.ts
import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const server = setupServer(
  rest.get('/api/assets', (req, res, ctx) => {
    return res(ctx.json(mockAssets));
  }),
  
  rest.get('/api/assets/:id', (req, res, ctx) => {
    const { id } = req.params;
    const asset = mockAssets.find(a => a.id === id);
    return asset ? res(ctx.json(asset)) : res(ctx.status(404));
  })
);
```

## Test Coverage Goals

### Coverage Targets
- **Overall**: 85%+ code coverage
- **Services**: 95%+ coverage (critical business logic)
- **Utils**: 95%+ coverage (pure functions)
- **Components**: 80%+ coverage (UI logic)
- **Composables**: 90%+ coverage (stateful logic)

### Coverage Exclusions
- Type definitions files
- Configuration files
- Generated code
- Third-party library wrappers

## Continuous Integration

### Pre-commit Hooks
```json
{
  "pre-commit": [
    "npm run test:unit",
    "npm run lint",
    "npm run type-check"
  ]
}
```

### CI Pipeline
```yaml
# .github/workflows/test.yml
- name: Run Tests
  run: |
    npm run test:coverage
    npm run test:integration
    
- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

## Testing Best Practices

### 1. Test Structure (AAA Pattern)
```typescript
describe('Feature', () => {
  it('should do something', () => {
    // Arrange
    const input = createTestData();
    const service = new TestService();
    
    // Act
    const result = service.process(input);
    
    // Assert
    expect(result).toEqual(expectedOutput);
  });
});
```

### 2. Test Isolation
- Each test should be independent
- Use `beforeEach` for setup
- Clean up after tests
- Avoid shared state

### 3. Meaningful Test Names
```typescript
// Good
it('should format currency with USD locale and 2 decimal places')
it('should throw validation error when email is invalid')
it('should disable submit button when form is invalid')

// Avoid
it('should work correctly')
it('should test the function')
```

### 4. Test Edge Cases
```typescript
describe('formatCurrency', () => {
  it('handles normal values', () => { /* ... */ });
  it('handles zero values', () => { /* ... */ });
  it('handles negative values', () => { /* ... */ });
  it('handles very large numbers', () => { /* ... */ });
  it('handles null/undefined', () => { /* ... */ });
});
```

### 5. Async Testing
```typescript
// Use async/await
it('should load data correctly', async () => {
  const promise = loadData();
  await expect(promise).resolves.toEqual(expectedData);
});

// Test loading states
it('should show loading state', () => {
  const { getByText } = render(Component);
  loadData(); // Don't await
  expect(getByText('Loading...')).toBeInTheDocument();
});
```

## Performance Testing

### Load Testing Components
```typescript
// Performance-critical components
describe('Chart Performance', () => {
  it('should render large datasets efficiently', () => {
    const largeDataset = generateMockData(10000);
    const startTime = performance.now();
    
    render(Chart, { props: { data: largeDataset } });
    
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(100); // 100ms threshold
  });
});
```

### Memory Leak Testing
```typescript
describe('Component Cleanup', () => {
  it('should clean up subscriptions on destroy', () => {
    const { component } = render(Component);
    const spy = vi.spyOn(component, '$destroy');
    
    component.$destroy();
    
    expect(spy).toHaveBeenCalled();
    // Verify no lingering subscriptions
  });
});
```

This comprehensive testing strategy ensures high code quality, prevents regressions, and supports confident refactoring and feature development.