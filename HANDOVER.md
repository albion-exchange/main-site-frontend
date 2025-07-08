# Albion Frontend Handover Documentation

This document provides comprehensive specifications for the Albion royalty token platform frontend in this repo, so to help you understand what functionality is important as you review it.

## Project Overview

**Core User Flows:**
1. Browse available energy assets and their associated tokens
2. Connect Web3 wallet
3. Purchase royalty tokens with USD/cryptocurrency
4. [TBD] Monitor portfolio performance and claim payouts
5. View detailed asset production data and distributions

## Architecture Overview

### Data Architecture - File-Based System

**Critical: The platform uses a file-based data system for assets and tokens. Token-related info such as supply and distributions will be replaced by on-chain data where available, but otherwise I'm thinking that we just update/add files here to list new assets and tokens, rather than having a backend**

```
src/lib/data/
├── assets/                           # Asset data organized by asset ID
│   ├── {asset-id}/
│   │   ├── asset.json               # Core asset information
│   │   ├── cover.{ext}              # Main asset image for cards
│   │   ├── gallery/                 # Additional images for gallery
│   │   └── tokens/                  # Associated token data for the asset
│   │       ├── {token-name}.json    # Individual token files - SOME DATA REPLACED WITH ONCHAIN METRICS
│   │       └── *_future.json        # Future release data
│   └── TEMPLATE/                    # Template for new assets
├── companyInfo.json                 # Platform company data
├── defaultValues.json               # Fallback values for calculations
├── marketData.json                  # Market pricing and platform stats - REPLACE WITH EXTERNAL DATASOURCE
└── platformStats.json               # Global platform metrics - REPLACE WITH ONCHAIN METRICS
```

**Why This Matters:**
- New assets can be added by creating new folders and JSON files

### Technology Stack

- **Framework:** Svelte/SvelteKit
- **Language:** TypeScript with strict type checking
- **Styling:** Custom CSS with CSS variables for theming
- **Blockchain:** Web3 integration for wallet connectivity
- **Build:** Vite for development and bundling

## Design System Specifications

### Design Philosophy
- **Clean Geometric Minimalism**: Simple shapes, clear hierarchy, generous whitespace
- **Tech Forward Modernism**: Contemporary, digital-first aesthetic
- **Restrained Palette**: Limited color usage for maximum impact
- **White Background**: Clean, uncluttered base with strategic color accents
- **No Gradients**: Flat design with solid colors only

### Typography
- **Primary Font**: FigTree (Google Fonts)
- **Titles/Headings**: FigTree Extra Bold
- **Body Text**: FigTree Regular

### Color Palette
```css
--color-black: #000000          /* Primary text, strong emphasis */
--color-white: #ffffff          /* Backgrounds, negative space */
--color-primary: #08bccc        /* CTAs, interactive elements, key accents */
--color-secondary: #283c84      /* Headers, navigation, secondary emphasis */
--color-light-gray: #f8f4f4     /* Subtle backgrounds, borders, dividers */
```

### Component Library 
> REUSE OPTIONAL. THIS IS JUST HOW CLAUDE DID IT

**Existing UI Components:**
- `Card`, `CardImage`, `CardContent`, `CardActions` - Base card system
- `Button`, `PrimaryButton`, `SecondaryButton` - Button variants
- `Metric` - Statistical display component
- `StatusBadge` - Status indicators (producing, funding, sold out)
- `ActionCard` - CTA cards for quick actions
- `TabNavigation` - Tabbed interfaces
- `FormField` - Form inputs with validation
- `Modal` - Overlays and dialogs

## Key Financial Calculations

**Location:** `/src/lib/utils/returnCalculations.ts`

### 1. Base Return and Bonus Return

```typescript
// Base Return (Conservative - uses MAX supply)
const baseReturn = (totalProduction * oilPrice * sharePercentage / maxSupply / 1) * 100;
const annualizedBaseReturn = Math.pow(1 + baseReturn/100, 1/years) - 1) * 100;

// Bonus Return (Optimistic - uses MINTED supply)
const bonusReturn = (totalProduction * oilPrice * sharePercentage / mintedSupply / 1) * 100;
const annualizedBonusReturn = Math.pow(1 + bonusReturn/100, 1/years) - 1) * 100;
const bonus = annualizedBonusReturn - annualizedBaseReturn;
```

### 2. Implied Barrels Per Token

```typescript
const totalProduction = plannedProduction.projections.reduce((sum, p) => sum + p.production, 0);
const impliedBarrelsPerToken = totalProduction / mintedSupply;
```

### 3. Breakeven Oil Price

```typescript
const breakEvenOilPrice = 1 / impliedBarrelsPerToken;
```

**Critical:** These calculations determine the displayed expected returns and investment attractiveness.

## Business Logic and Rules

### Token Availability States

**Available Tokens:**
- Condition: `availableSupply > 0` where `availableSupply = maxSupply - mintedSupply`
- Display: Green "Available" badge, enabled buy button
- Action: Purchase widget opens on click

**Sold Out Tokens:**
- Condition: `availableSupply <= 0`
- Display: Gray "Sold Out" badge, disabled button
- Action: No purchase possible

**Future Releases:**
- Source: `*_future.json` files in asset token directories
- Display: "Coming Soon" cards with timeline
- Action: Email notification signup

### Token Purchase Flow

1. **Validation Checks:**
   - Token must be active (`isActive: true`)
   - Available supply must be greater than purchase amount
   - User must agree to terms

2. **Purchase Calculation:**
   - Fixed 1:1 ratio (1 USD = 1 token)
   - Platform fee: Currently FREE (was 0.5%)
   - Gas fees calculated separately
   >  0.5% IS A PLACEHOLDER AS WELL

3. **Web3 Integration:**
   - Wallet connection required
   - Smart contract interaction for token minting
   - Transaction confirmation and status tracking

### Featured Token Selection

**Homepage Carousel Logic:** 
> NO NEED FOR COMPLEX LOGIC YET.
```typescript
const featuredTokens = getRoyaltyTokens()
  .filter(token => {
    const availableSupply = maxSupply - mintedSupply;
    return availableSupply >= 1000 && token.isActive;
  })
  .slice(0, 3);
```

## Critical Functional Requirements

### Asset Detail Page

**Tab Navigation:**
- Overview: Asset fundamentals and terms
- Production Data: Historical and projected production charts
- Past Payments: Revenue history and payout data
- Gallery: Asset photos and visual documentation
- Documents: Legal and technical reports (placeholder)

**Token Cards:**
- Front: Token metrics, estimated returns, buy button
- Back: Distribution history (flip animation)
- Click behavior: Buy button opens purchase widget, card flip on "History" button

**Social Sharing:**
- Twitter, LinkedIn, Telegram, Email sharing
- Copy link functionality
- Asset-specific sharing text

### Asset Listing Page

**Filtering Logic:**
- Shows available tokens by default
- "View Sold Out Assets" toggle to show/hide unavailable
- Count of sold-out assets displayed
- Search/filter by location, operator, field type

### Email Notification System

**Triggers:**
- Future token release interest
- Newsletter signups
- Contact form submissions

**Implementation:**
- Modal overlay with form validation
- Success/error state handling
- Auto-close after submission

## Asset and Token Data Structures

> FEEL FREE TO CHANGE THIS
> ESPECIALLY SINCE ONCHAIN DATA MAY COME
> IN A DIFFERENT STRUCTURE

### Asset JSON Schema

```typescript
interface Asset {
  id: string;                          // Unique identifier (kebab-case)
  name: string;                        // Display name
  description: string;                 // Asset description
  location: {
    state: string;
    county: string;
    country: string;
    coordinates: { lat: number; lng: number };
    waterDepth?: string | null;        // For offshore assets
  };
  operator: {
    name: string;
    website?: string;
    experience: string;
  };
  technical: {
    fieldType: string;                 // "Conventional Oil", "Shale Oil", etc.
    depth: string;
    license: string;
    estimatedLife: string;
    firstOil: string;
    infrastructure: string;
    environmental: string;
    expectedEndDate: string;           // YYYY-MM format
    crudeBenchmark: string;           // "Brent", "WTI"
    pricing: {
      benchmarkPremium: string;       // "+$1.80", "-$1.30"
      transportCosts: string;
    };
  };
  assetTerms: {
    interestType: string;             // "Royalty"
    amount: string;                   // "4.5% of gross"
    amountTooltip?: string;
    paymentFrequency: string;
  };
  production: {
    current: string;                  // "300 boe/day"
    status: 'funding' | 'producing' | 'completed';
    units?: {
      production: string;
      revenue: string;
    };
  };
  tokenContracts: string[];           // Contract addresses
  monthlyReports: MonthlyReport[];    // Historical performance
  plannedProduction?: PlannedProduction; // Future projections
  productionHistory?: MonthlyReport[]; // Alternative to monthlyReports
  operationalMetrics?: OperationalMetrics;
  metadata: {
    createdAt: string;
    updatedAt: string;
  };
}
```

### Token JSON Schema

```typescript
interface Token {
  contractAddress: string;            // Unique contract address
  name: string;                       // Full token name
  symbol: string;                     // Trading symbol
  decimals: number;                   // Usually 18 for royalty tokens
  tokenType: 'royalty' | 'payment';
  assetId: string;                   // Links to Asset.id
  isActive: boolean;
  firstPaymentDate?: string;         // "March 2025"
  supply: {
    maxSupply: string;               // BigInt as string
    mintedSupply: string;            // BigInt as string
  };
  holders: Array<{
    address: string;
    balance: string;                 // BigInt as string
  }>;
  payoutHistory: Array<{
    month: string;                   // YYYY-MM
    date: string;                    // YYYY-MM-DD
    totalPayout: number;             // USD
    payoutPerToken: number;          // USD per token
    oilPrice: number;                // USD per barrel
    gasPrice: number;                // USD per MMBtu
    productionVolume: number;        // barrels
    txHash: string;                  // Transaction hash
  }>;
  sharePercentage?: number;          // Asset ownership %
  metadata: {
    createdAt: string;
    updatedAt: string;
  };
}
```

## Image Asset Management

**Asset Images:**
- Cover images: `/src/lib/data/assets/{asset-id}/cover.{ext}`
- Gallery images: `/src/lib/data/assets/{asset-id}/gallery/`
- Utility functions: `/src/lib/utils/assetImages.ts`

**Image Naming Convention:**
- Cover: `cover.jpg`, `cover.png`, `cover.avif`, `cover.webp`
- Gallery: Any filename in gallery directory

## Development Workflow

### Adding New Assets

1. **Create Asset Directory:**
   ```
   src/lib/data/assets/new-asset-name/
   ├── asset.json
   ├── cover.jpg
   ├── gallery/
   └── tokens/
       ├── primary_token.json
       └── future_release.json
   ```

2. **Use TEMPLATE Directory:**
   - Copy from `/src/lib/data/assets/TEMPLATE/`
   - Update all placeholder values
   - Follow JSON schema specifications

3. **Image Requirements:**
   - Cover: 1200x800px recommended
   - Gallery: 4:3 aspect ratio preferred
   - Formats: JPG, PNG, AVIF, WebP supported

### Token Supply Management

**BigInt Handling:**
> THIS IS ALL CLAUDE. CHANGE AS NEEDED

- All supply values stored as strings (e.g., "200000000000000000000000")
- Convert for display: `parseFloat(supply) / Math.pow(10, decimals)`
- Standard decimals: 18 

### Testing Considerations

**Key Test Scenarios:**
- Token availability state changes
- Purchase flow with various wallet states
- Return calculations with different oil prices
- Portfolio calculations with multiple holdings
- Mobile responsive behavior
- Asset data loading and error states

## Security Considerations
> I HAVE NOT THOUGHT THROUGH NOR ASKED CLAUDE TO THINK THROUGH SECURITY HERE AT ALL

## Performance Requirements

**Responsive Design:**
> I HAVE DONE VERY BASIC STEPS TO MAKE IT PASSABLY MOBILE FRIENDLY, BUT IT IS CERTAINLY
> NOT MOBILE-FIRST OR MOBILE OPTIMISED IN ANY WAY

## Deployment Notes

**Static Asset Optimization:**
- Image compression and format optimization
- JSON minification for data files
- CSS/JS bundling and tree shaking
- CDN integration for global delivery

**Critical Success Factors:**
1. Maintain the file-based asset/token data structure
2. Implement accurate financial calculations exactly as specified
3. Follow the clean geometric design system consistently
4. Ensure Web3 wallet integration works seamlessly
5. Optimize for mobile-first responsive design