# Albion Marketplace - Architecture Documentation

## Overview

The Albion Marketplace is a SvelteKit-based web application for tokenized asset investment. The application follows a layered architecture with clear separation of concerns and atomic design principles.

## Architecture Layers

### 1. Component Architecture (Atomic Design)

The UI components are organized using atomic design principles:

```
src/lib/components/
├── atoms/           # Basic UI elements
├── molecules/       # Simple combinations
├── organisms/       # Complex sections
├── templates/       # Page layouts
└── ui/             # Backward compatibility exports
```

#### Atoms (Basic Building Blocks)
- **Purpose**: Fundamental UI elements that cannot be broken down further
- **Examples**: Button, Label, FormField, StatusBadge
- **Guidelines**: 
  - Should be highly reusable
  - Minimal props interface
  - No business logic

#### Molecules (Simple Combinations)
- **Purpose**: Groups of atoms working together as a unit
- **Examples**: Card, MetricDisplay, ButtonGroup
- **Guidelines**:
  - Combine atoms to create meaningful UI units
  - Handle simple interactions
  - Minimal state management

#### Organisms (Complex Sections)
- **Purpose**: Groups of molecules and/or atoms forming complex UI sections
- **Examples**: Modal, Chart, DataTable, TabNavigation
- **Guidelines**:
  - Can contain business logic
  - Handle complex interactions
  - May connect to services/stores

#### Templates (Page Layouts)
- **Purpose**: Page-level layouts that combine organisms
- **Examples**: DefaultPageTemplate, AssetDetailTemplate
- **Guidelines**:
  - Define page structure
  - Handle routing concerns
  - Minimal business logic

### 2. Service Layer

The service layer provides business logic and data access:

```
src/lib/services/
├── AssetService.ts      # Asset-specific operations
├── TokenService.ts      # Token-specific operations
├── WalletDataService.ts # Wallet and transaction data
├── ConfigService.ts     # Configuration management
└── ServiceContainer.ts  # Dependency injection
```

#### Service Responsibilities

**AssetService**
```typescript
/**
 * @fileoverview Asset Management Service
 * 
 * Responsibilities:
 * - Load and cache asset data
 * - Transform raw data to UI-ready format
 * - Provide asset-related business logic
 * - Calculate asset metrics
 * 
 * Dependencies:
 * - ConfigService for data access
 * 
 * Data Flow:
 * ConfigService -> AssetService -> UI Components
 */
```

**TokenService**
```typescript
/**
 * @fileoverview Token Management Service
 * 
 * Responsibilities:
 * - Manage token data and metadata
 * - Handle token-specific calculations
 * - Provide token filtering and sorting
 * 
 * Dependencies:
 * - ConfigService for token mapping
 * - AssetService for asset relationships
 */
```

**WalletDataService**
```typescript
/**
 * @fileoverview Wallet Data Service
 * 
 * Responsibilities:
 * - Manage wallet connection and data
 * - Calculate portfolio metrics
 * - Handle transaction history
 * - Provide investment analytics
 * 
 * Dependencies:
 * - External wallet providers
 * - TokenService for token data
 */
```

### 3. State Management

State is managed through a combination of stores and composables:

```
src/lib/stores/          # Global state
src/lib/composables/     # Reusable state logic
```

#### Store Architecture
- **Global State**: Application-wide data (user preferences, theme)
- **Derived Stores**: Computed values from multiple sources
- **Local State**: Component-specific state via composables

#### Composable Pattern
```typescript
// Example composable structure
export function useAssetData(assetId: string) {
  // State management
  const state = writable({ loading: true, data: null, error: null });
  
  // Business logic
  const loadData = async () => { /* ... */ };
  
  // Return interface
  return {
    state: readonly(state),
    loadData,
    // ... other methods
  };
}
```

### 4. Data Flow

The application follows a unidirectional data flow:

```
Raw Data -> Services -> Stores -> Composables -> Components
```

#### Data Transformation Pipeline

1. **Raw Data Sources**
   - Static JSON files
   - API responses
   - Wallet connections

2. **Service Layer Processing**
   - Data validation
   - Business logic application
   - Caching strategies

3. **Store/Composable Layer**
   - State management
   - Reactive updates
   - UI-specific transformations

4. **Component Layer**
   - Presentation logic
   - User interactions
   - Event handling

### 5. Error Handling

Centralized error handling with severity levels:

```typescript
// Error types and handling
export enum ErrorSeverity {
  LOW = 'low',      // Non-critical, log only
  MEDIUM = 'medium', // Show user notification
  HIGH = 'high'     // Block user action, require attention
}

// Error boundary pattern
const boundary = createErrorBoundary(fallbackFn);
const result = await boundary(riskyOperation);
```

#### Error Flow
1. **Service Level**: Catch and wrap errors with context
2. **Composable Level**: Handle service errors, provide fallbacks
3. **Component Level**: Display error states, user feedback
4. **Global Level**: Error reporting and logging

### 6. Type System

Consistent type definitions with clear transformation boundaries:

```
src/lib/types/
├── uiTypes.ts          # UI-specific types
├── sharedTypes.ts      # Shared domain types
├── MetaboardTypes.ts   # External API types
└── transformations.ts  # Type transformation utilities
```

#### Type Architecture Principles

1. **Single Source of Truth**: Core domain types defined once
2. **Clear Boundaries**: Separate types for different layers
3. **Transformation Functions**: Explicit type conversions
4. **Type Safety**: Strict TypeScript configuration

Example:
```typescript
// Core domain type
interface CoreAsset {
  depth: number;        // Always number in meters
  expectedEndDate: Date; // Always Date object
}

// UI display type
interface DisplayAsset {
  depth: string;        // "3,200m" - formatted for display
  expectedEndDate: string; // "Dec 2028" - formatted date
}

// Transformation functions
export const AssetTransforms = {
  toDisplay: (core: CoreAsset): DisplayAsset => ({
    depth: `${formatNumber(core.depth)}m`,
    expectedEndDate: formatDate(core.expectedEndDate)
  }),
  fromDisplay: (display: DisplayAsset): CoreAsset => ({
    depth: parseInt(display.depth.replace('m', '').replace(',', '')),
    expectedEndDate: new Date(display.expectedEndDate)
  })
};
```

## Development Guidelines

### 1. Component Development

- **Atoms**: Focus on reusability and simplicity
- **Molecules**: Combine atoms meaningfully
- **Organisms**: Handle complex interactions
- **Templates**: Define page structure

### 2. Service Development

- **Single Responsibility**: Each service has one clear purpose
- **Dependency Injection**: Use ServiceContainer for dependencies
- **Error Handling**: Wrap operations with proper error context
- **Testing**: Comprehensive unit tests for business logic

### 3. State Management

- **Local First**: Use local state when possible
- **Composables**: Extract reusable state logic
- **Reactive**: Leverage Svelte's reactivity
- **Minimal**: Keep state minimal and normalized

### 4. Testing Strategy

- **Unit Tests**: Services, utilities, composables
- **Component Tests**: Atoms, molecules, organisms
- **Integration Tests**: Service interactions
- **E2E Tests**: Critical user journeys

### 5. Performance Considerations

- **Code Splitting**: Route-based and feature-based
- **Lazy Loading**: Non-critical components
- **Caching**: Service-level data caching
- **Reactivity**: Efficient reactive updates

## Migration and Maintenance

### From Legacy Architecture

1. **Component Migration**: Move components to atomic design structure
2. **Service Extraction**: Extract business logic from components
3. **Type Consolidation**: Merge duplicate type definitions
4. **Test Addition**: Add comprehensive test coverage

### Ongoing Maintenance

1. **Documentation**: Keep architecture docs updated
2. **Testing**: Maintain test coverage above 80%
3. **Performance**: Regular performance audits
4. **Dependencies**: Keep dependencies updated

## Future Considerations

### Scalability

- **Micro-frontends**: Consider for large team scaling
- **State Management**: Evaluate advanced state solutions if needed
- **API Layer**: Add GraphQL or advanced caching if data complexity grows

### Technology Evolution

- **SvelteKit Updates**: Stay current with framework updates
- **Build Tools**: Evaluate new build optimizations
- **Browser APIs**: Leverage new web platform features

This architecture provides a solid foundation for maintainable, scalable, and testable code while following modern web development best practices.