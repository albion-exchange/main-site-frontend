# Component Guide

## Naming Conventions

### Component Names
- **PascalCase**: All component files use PascalCase (e.g., `Button.svelte`, `AssetCard.svelte`)
- **Descriptive**: Names should clearly indicate the component's purpose
- **Specific**: Avoid generic names like `Item.svelte` or `Component.svelte`

### Props and Variables
- **camelCase**: All props and variables use camelCase
- **Boolean props**: Use positive naming (e.g., `isVisible` not `hidden`)
- **Event handlers**: Prefix with `on` or `handle` (e.g., `onClick`, `handleSubmit`)

### CSS Classes
- **kebab-case**: All CSS classes use kebab-case
- **BEM methodology**: Block__Element--Modifier pattern where appropriate
- **Semantic**: Classes should describe purpose, not appearance

## Atomic Design System

### Atoms

Atoms are the fundamental building blocks of the UI. They should be:
- **Highly reusable** across different contexts
- **Minimal** in terms of props and functionality
- **Self-contained** with no external dependencies
- **Accessible** following WCAG guidelines

#### Button Components

```svelte
<!-- Primary usage -->
<Button variant="primary" size="medium" on:click={handleClick}>
  Save Changes
</Button>

<!-- Secondary with loading state -->
<Button variant="secondary" loading={isLoading} disabled={!isValid}>
  Submit
</Button>

<!-- Icon button -->
<Button variant="ghost" size="small" aria-label="Close dialog">
  <Icon name="x" />
</Button>
```

**Props Interface:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
}
```

#### Form Components

```svelte
<!-- Text input -->
<FormField 
  label="Asset Name" 
  placeholder="Enter asset name"
  bind:value={assetName}
  error={nameError}
  required
/>

<!-- Checkbox -->
<Checkbox 
  label="I agree to the terms" 
  bind:checked={agreedToTerms}
  required
/>

<!-- Radio group -->
<RadioGroup 
  label="Investment type"
  options={investmentTypes}
  bind:value={selectedType}
/>
```

### Molecules

Molecules combine atoms to create meaningful UI units:

#### Card Components

```svelte
<!-- Basic card -->
<Card hoverable clickable on:click={handleCardClick}>
  <CardImage src={asset.image} alt={asset.name} />
  <CardContent>
    <h3>{asset.name}</h3>
    <p>{asset.description}</p>
  </CardContent>
  <CardActions>
    <Button variant="primary">View Details</Button>
    <Button variant="secondary">Add to Watchlist</Button>
  </CardActions>
</Card>

<!-- Icon card for metrics -->
<IconCard 
  icon="trending-up" 
  title="Total Returns" 
  value={formatCurrency(totalReturns)}
  trend={returnsTrend}
/>
```

#### Data Display

```svelte
<!-- Metric display -->
<MetricDisplay 
  label="Annual Yield" 
  value="8.5%" 
  change="+0.3%"
  trend="up"
/>

<!-- Status badge -->
<StatusBadge 
  status="active" 
  size="small"
/>
```

### Organisms

Organisms are complex UI sections that may contain business logic:

#### Data Tables

```svelte
<DataTable 
  data={assets} 
  columns={assetColumns}
  sortable
  filterable
  on:rowClick={handleRowClick}
  on:sort={handleSort}
>
  <svelte:fragment slot="actions" let:row>
    <Button size="small" on:click={() => editAsset(row.id)}>
      Edit
    </Button>
  </svelte:fragment>
</DataTable>
```

#### Navigation

```svelte
<TabNavigation 
  tabs={[
    { id: 'overview', label: 'Overview' },
    { id: 'performance', label: 'Performance' },
    { id: 'documents', label: 'Documents' }
  ]}
  bind:activeTab
/>
```

#### Charts

```svelte
<Chart 
  type="line"
  data={performanceData}
  options={{
    responsive: true,
    legend: { position: 'bottom' }
  }}
  on:dataPointClick={handleDataPointClick}
/>
```

## Component Composition Patterns

### Container-Presenter Pattern

```svelte
<!-- Container (Smart Component) -->
<script>
  import { useAssetData } from '$lib/composables';
  import AssetPresenter from './AssetPresenter.svelte';
  
  export let assetId;
  
  const { state, loadData } = useAssetData(assetId);
  
  $: if (assetId) loadData(assetId);
</script>

{#if $state.loading}
  <AssetSkeleton />
{:else if $state.error}
  <ErrorMessage error={$state.error} />
{:else}
  <AssetPresenter asset={$state.data} />
{/if}

<!-- Presenter (Dumb Component) -->
<script>
  export let asset;
</script>

<Card>
  <h2>{asset.name}</h2>
  <p>{asset.description}</p>
  <!-- ... presentation logic only ... -->
</Card>
```

### Compound Components

```svelte
<!-- API usage -->
<AssetDetailView assetId="asset-1">
  <AssetHeader slot="header" />
  <AssetMetrics slot="metrics" />
  <AssetChart slot="chart" />
  <AssetActions slot="actions" />
</AssetDetailView>

<!-- Implementation -->
<script>
  export let assetId;
  // ... data loading logic
</script>

<div class="asset-detail">
  <header class="asset-detail__header">
    <slot name="header" {asset} />
  </header>
  
  <main class="asset-detail__content">
    <slot name="metrics" {asset} />
    <slot name="chart" {asset} />
  </main>
  
  <footer class="asset-detail__actions">
    <slot name="actions" {asset} />
  </footer>
</div>
```

### Render Props Pattern

```svelte
<!-- Data provider component -->
<script>
  export let children;
  export let assetId;
  
  const { state } = useAssetData(assetId);
</script>

{@render children($state)}

<!-- Usage -->
<AssetDataProvider assetId="asset-1">
  {#snippet children(assetState)}
    {#if assetState.loading}
      <Spinner />
    {:else}
      <AssetCard asset={assetState.data} />
    {/if}
  {/snippet}
</AssetDataProvider>
```

## Accessibility Guidelines

### Semantic HTML
- Use proper HTML elements (`<button>`, `<nav>`, `<main>`, etc.)
- Provide meaningful alt text for images
- Use proper heading hierarchy

### ARIA Attributes
```svelte
<!-- Button with aria-label -->
<button aria-label="Close dialog" on:click={closeDialog}>
  <Icon name="x" />
</button>

<!-- Expandable section -->
<button 
  aria-expanded={isExpanded}
  aria-controls="section-content"
  on:click={toggleExpanded}
>
  Toggle Section
</button>
<div id="section-content" aria-hidden={!isExpanded}>
  <!-- Content -->
</div>

<!-- Form with proper labels -->
<label for="asset-name">Asset Name</label>
<input 
  id="asset-name" 
  type="text" 
  aria-describedby="name-help"
  bind:value={assetName}
/>
<div id="name-help">Enter a descriptive name for the asset</div>
```

### Keyboard Navigation
- Ensure all interactive elements are keyboard accessible
- Implement proper focus management
- Use `tabindex` appropriately

## Performance Guidelines

### Component Optimization

```svelte
<!-- Use reactive statements efficiently -->
<script>
  export let assets;
  
  // Good: Only recalculate when assets change
  $: totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  
  // Avoid: Expensive calculations in templates
  // {assets.reduce((sum, asset) => sum + asset.value, 0)}
</script>

<!-- Lazy load heavy components -->
<script>
  import { browser } from '$app/environment';
  
  let HeavyChart;
  
  $: if (browser && showChart) {
    import('./HeavyChart.svelte').then(module => {
      HeavyChart = module.default;
    });
  }
</script>

{#if showChart && HeavyChart}
  <svelte:component this={HeavyChart} data={chartData} />
{/if}
```

### Bundle Size
- Import only what you need
- Use dynamic imports for large components
- Optimize images and assets

## Testing Guidelines

### Component Tests

```typescript
// Button.test.ts
import { render, fireEvent } from '@testing-library/svelte';
import Button from './Button.svelte';

describe('Button', () => {
  it('should handle click events', async () => {
    const handleClick = vi.fn();
    const { getByRole, component } = render(Button, {
      props: { children: 'Click me' }
    });
    
    component.$on('click', handleClick);
    
    await fireEvent.click(getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### Integration Tests

```typescript
// AssetCard.test.ts
import { render } from '@testing-library/svelte';
import AssetCard from './AssetCard.svelte';

describe('AssetCard', () => {
  const mockAsset = {
    id: '1',
    name: 'Test Asset',
    value: 100000
  };
  
  it('should display asset information', () => {
    const { getByText } = render(AssetCard, {
      props: { asset: mockAsset }
    });
    
    expect(getByText('Test Asset')).toBeInTheDocument();
    expect(getByText('$100,000')).toBeInTheDocument();
  });
});
```

## Error Handling

### Component Error Boundaries

```svelte
<!-- ErrorBoundary.svelte -->
<script>
  export let fallback = null;
  
  let error = null;
  
  function handleError(event) {
    error = event.detail;
    console.error('Component error:', error);
  }
</script>

<svelte:window on:error={handleError} />

{#if error}
  {#if fallback}
    {@render fallback(error)}
  {:else}
    <div class="error-boundary">
      <h3>Something went wrong</h3>
      <p>Please try refreshing the page</p>
    </div>
  {/if}
{:else}
  <slot />
{/if}
```

### Usage in Components

```svelte
<script>
  import { createErrorBoundary } from '$lib/utils/errorHandling';
  
  const boundary = createErrorBoundary(() => 'Loading failed');
  
  async function loadData() {
    const result = await boundary(async () => {
      return await assetService.getAsset(assetId);
    });
    
    if (result) {
      asset = result;
    }
  }
</script>
```

This guide ensures consistent, maintainable, and accessible component development across the application.