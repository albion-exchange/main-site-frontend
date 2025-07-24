# Albion Frontend Architecture

## Component Hierarchy – Atomic Design

This project adopts the Atomic Design methodology to structure UI components in a clear, scalable way.

```
src/lib/components/
└── atoms/        # Basic, indivisible UI primitives (Button, Input, Icon)
└── molecules/    # Groups of atoms working together (ButtonGroup, FormField, DataRow)
└── organisms/    # Powerful, self-contained sections (AssetCard, FeaturedTokenCarousel)
└── templates/    # Page-level layouts that arrange organisms (PageLayout, HeroSection)
└── pages/        # Thin wrappers that compose templates + data for a given route
```

### Migration plan

1. **Atoms & Molecules first** – All primitives already living in `components/ui` are being migrated into `atoms/` or `molecules/`. During the transition, we re-export them so existing imports keep working.
2. **Organisms & Templates** – Larger feature blocks (e.g. `AssetCard`, `TokenPurchaseWidget`, layout components) move into their respective directories.
3. **Pages layer** – Each route component (`src/routes/**/+page.svelte`) should become a thin orchestrator that composes templates and fetches data through stores/composables.

Re-exports live in `components/index.ts` so the migration is incremental and non-breaking.

## Naming Conventions

• **Domain entities**: `PascalCase` (`Asset`, `Token`, `User`)
• **Collections** (arrays/stores): plural (`assets`, `tokens`)
• **Computed / derived values**: phrase starting with adjective or verb (`formattedAssetName`, `isWalletConnected`)
• **Events**: past-tense verbs (`onAssetSelected`), custom Svelte events use `kebab-case` (`asset-selected`).

## Type Boundaries

1. **Core domain** (`src/lib/types/core/*`): canonical types used across layers.
2. **Display/UI** (`src/lib/types/display/*`): presentational shapes with formatted strings.
3. **Transform functions** (`src/lib/utils/transforms/*`): explicit mappers (`toDisplay`, `fromDisplay`).

## Testing Strategy

- **Unit tests**: Vitest + Testing Library for components/composables. Specs live next to source (`.test.ts` / `.test.svelte`).
- **Integration tests**: (future) Playwright for full-page flows.
- Run all tests via `npm test`.

---

> This document is part of **Phase 3 – Polish**. Follow it when creating new code or refactoring legacy code.
