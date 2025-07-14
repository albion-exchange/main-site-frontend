# Tailwind CSS Refactoring Guide

This guide explains how to reduce code duplication in the Albion frontend by using reusable components and utility classes.

## Overview

The refactoring approach focuses on:
1. **Extracting common patterns** into reusable utility classes
2. **Creating semantic components** for frequently used UI patterns
3. **Centralizing style definitions** for consistency

## New Structure

### 1. Style Utilities (`/src/lib/styles/`)

- **`typography.js`** - Reusable text styles (headings, labels, body text)
- **`layouts.js`** - Common layout patterns (grids, containers, sections)
- **`buttons.js`** - Button style variants

### 2. New Components (`/src/lib/components/ui/`)

- **`SectionTitle.svelte`** - Consistent heading styles
- **`MetricDisplay.svelte`** - Standardized metric/stat displays
- **`TabButton.svelte`** - Reusable tab navigation buttons
- **`GridContainer.svelte`** - Responsive grid layouts

## Before vs After Examples

### Example 1: Section Titles

**Before (30+ characters per usage):**
```svelte
<h2 class="text-3xl md:text-2xl font-extrabold text-black uppercase tracking-wider">My Title</h2>
```

**After (1 component):**
```svelte
<SectionTitle>My Title</SectionTitle>
```

### Example 2: Metric Display

**Before (5-8 lines):**
```svelte
<div class="text-center">
  <div class="text-3xl font-extrabold text-black mb-2">$47,250</div>
  <div class="text-xs font-bold text-black uppercase tracking-wider mb-1">Total Value</div>
  <div class="text-xs text-secondary font-medium">Real-time</div>
</div>
```

**After (1 component):**
```svelte
<MetricDisplay value="$47,250" label="Total Value" note="Real-time" />
```

### Example 3: Grid Layouts

**Before:**
```svelte
<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
  <!-- content -->
</div>
```

**After:**
```svelte
<GridContainer columns={3}>
  <!-- content -->
</GridContainer>
```

## Migration Strategy

### Phase 1: Import Utilities (Quick Win)
1. Import style utilities in existing components
2. Replace hardcoded class strings with utility references
3. No breaking changes, immediate code reduction

```svelte
<script>
  import { typography, layouts } from '$lib/styles';
</script>

<!-- Use predefined classes -->
<h2 class={typography.sectionTitle}>Title</h2>
<div class={layouts.card}>Content</div>
```

### Phase 2: Adopt New Components (Gradual)
1. Replace common patterns with new components
2. Start with new features/pages
3. Gradually refactor existing pages

### Phase 3: Remove Duplicate Classes (Cleanup)
1. Remove reactive class assignments that duplicate
2. Consolidate similar patterns
3. Update remaining hardcoded classes

## Benefits

1. **Reduced Code Size**
   - 50-70% reduction in Tailwind class repetition
   - Smaller component files
   - Less CSS in final bundle

2. **Improved Maintainability**
   - Change styles in one place
   - Consistent design system
   - Easier onboarding for new developers

3. **Better Developer Experience**
   - Autocomplete for component props
   - Type safety with TypeScript
   - Clear component APIs

4. **Performance**
   - Fewer unique CSS classes
   - Better tree-shaking
   - Smaller bundle sizes

## Common Patterns to Refactor

### 1. Page Sections
```svelte
<!-- Instead of repeating these classes -->
<section class="py-16 px-8 md:py-12 md:px-8 max-w-6xl mx-auto">

<!-- Use layout utilities -->
<section class="{layouts.pageSection} {layouts.pageContainer}">
```

### 2. Card Components
```svelte
<!-- Instead of -->
<div class="bg-white border border-light-gray p-8 transition-all duration-200 hover:shadow-card-hover">

<!-- Use -->
<Card hoverable>
  <CardContent>
```

### 3. Form Buttons
```svelte
<!-- Instead of -->
<button class="px-8 py-4 bg-black text-white border-none font-figtree font-extrabold text-sm uppercase tracking-wider cursor-pointer transition-colors duration-200 hover:bg-secondary">

<!-- Use -->
<PrimaryButton>
```

### 4. Status Indicators
```svelte
<!-- Instead of -->
<span class="bg-light-gray text-secondary px-2 py-1 text-xs font-bold uppercase tracking-wider">

<!-- Use -->
<StatusBadge status="active">
```

## Next Steps

1. **Review the example page** at `/example-refactored` to see the patterns in action
2. **Start with new features** using the new components
3. **Gradually refactor** existing pages during regular maintenance
4. **Add new patterns** as you identify more repetition

## Estimated Impact

Based on analysis of the current codebase:
- **~40% reduction** in total lines of code
- **~60% reduction** in repeated class definitions
- **Consistent styling** across all pages
- **Faster development** for new features

## Questions?

The refactoring is designed to be adopted gradually without breaking existing functionality. Start small and expand usage as you become comfortable with the new patterns.