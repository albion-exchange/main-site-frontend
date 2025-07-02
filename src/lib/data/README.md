# Albion Data Stores Documentation

This directory contains the static JSON data stores for assets and tokens in the Albion platform. The data is separated into two main stores with a clear relationship structure.

## 📁 File Structure

```
src/lib/data/
├── assets.json          # Asset data store
├── tokens.json          # Token data store
└── README.md            # This documentation
```

## 🏗️ Data Architecture

### Asset-Token Relationship

- **Assets** represent physical oil field projects with operational data
- **Tokens** represent blockchain contracts associated with assets
- **Relationship**: Assets have `tokenContracts[]` that link to token `contractAddress` keys

```
Asset.tokenContracts[] → Token.contractAddress (keys in tokens.json)
Token.assetId → Asset.id (keys in assets.json)
```

## 📋 Adding New Assets

To add a new asset, follow these steps:

### 1. Generate a Unique Asset ID
- Use kebab-case format (e.g., `"my-new-oil-field"`)
- Must be unique across all assets
- Should be descriptive and URL-friendly

### 2. Add Asset to `assets.json`

Copy this template into the `assets` object:

```json
{
  "assets": {
    "your-asset-id": {
      "id": "your-asset-id",
      "name": "Your Asset Name",
      "description": "Detailed description of the oil field project",
      "images": [
        "/images/assets/your-asset-1.jpg",
        "/images/assets/your-asset-2.jpg"
      ],
      "location": {
        "state": "State/Province",
        "county": "County/Region",
        "country": "Country",
        "coordinates": {
          "lat": 0.0,
          "lng": 0.0
        },
        "waterDepth": "1,850m" // or null for onshore
      },
      "operator": {
        "name": "Operating Company Name",
        "website": "https://company.com",
        "experience": "20+ years"
      },
      "technical": {
        "fieldType": "Conventional Oil", // or "Shale Oil", "Deep Water Oil", etc.
        "depth": "4,500m",
        "license": "LICENSE-123",
        "estimatedLife": "20+ years",
        "firstOil": "2024-Q1",
        "infrastructure": "Description of infrastructure",
        "environmental": "Environmental compliance details",
        "estimatedReserves": 125000000 // in barrels
      },
      "production": {
        "capacity": "8,500 bbl/day",
        "current": "6,200 bbl/day",
        "peak": "9,200 bbl/day",
        "reserves": "125M bbl",
        "drillingDate": "2021-05-12",
        "status": "producing" // "funding", "producing", or "completed"
      },
      "financial": {
        "currentPayout": 15.2,
        "basePayout": 14.1,
        "totalValue": 8500000,
        "minInvestment": 10000,
        "breakeven": 45.60,
        "operatingCosts": 35.20,
        "totalInvestment": "$280M",
      },
      "investment": {
        "tokensAvailable": 400000,
        "tokensSold": 324000,
        "investorCount": 672,
        "daysToFunding": 45
      },
      "tokenContracts": [
        "0x8901234567123456789012356f089012345", // Link to tokens
        "0x9012345678234567890123467f090123456"
      ],
      "monthlyReports": [
        {
          "month": "2024-11",
          "production": 186000,
          "revenue": 16740000,
          "expenses": 6540000,
          "netIncome": 10200000,
          "payoutPerToken": 25.50
        }
      ],
      "metadata": {
        "createdAt": "2024-04-18T13:45:00Z",
        "updatedAt": "2024-12-01T17:10:00Z"
      }
    }
  }
}
```

### 3. Field Descriptions

#### **Required Fields:**
- `id`: Unique identifier (kebab-case)
- `name`: Display name for the asset
- `description`: Marketing description
- `images`: Array of image URLs (place images in `/static/images/assets/`)

#### **Location Fields:**
- `state`: State/province where asset is located
- `county`: County/region
- `country`: Country name
- `coordinates`: Latitude and longitude for mapping
- `waterDepth`: For offshore assets, or `null` for onshore

#### **Financial Fields:**
- `currentPayout`: Current annual payout percentage (e.g., 15.2)
- `totalValue`: Total asset value in USD
- `minInvestment`: Minimum investment amount in USD
- `breakeven`: Breakeven oil price per barrel
- `operatingCosts`: Operating costs per barrel

#### **Investment Tracking:**
- `tokensAvailable`: Total tokens that can be sold
- `tokensSold`: Number of tokens already sold
- `investorCount`: Current number of investors
- `daysToFunding`: Days remaining in funding period

## 🪙 Adding New Tokens

Each asset should have associated tokens. Add tokens to `tokens.json`:

### 1. Generate Contract Address
- Use a valid Ethereum-style address format
- Must be unique across all tokens
- This serves as the key in the tokens object

### 2. Add Token to `tokens.json`

```json
{
  "tokens": {
    "0x1234567890abcdef1234567890abcdef12345678": {
      "contractAddress": "0x1234567890abcdef1234567890abcdef12345678",
      "name": "Your Asset Name - Tranche A",
      "symbol": "YOUR-AST-A",
      "decimals": 18,
      "totalSupply": "50000000000000000000000",
      "tokenType": "royalty", // or "payment"
      "tranche": {
        "id": "A",
        "name": "Tranche A - Priority",
        "payout": 14.8,
        "minInvestment": 1000,
        "available": 50000,
        "sold": 43750,
        "terms": "First priority on payouts, premium payout",
        "description": "Highest payout with priority payout rights",
        "selectable": true
      },
      "pricing": {
        "currentPrice": 12.45,
        "priceChange": 0.15,
        "priceChangePercent": 1.22,
        "bid": 12.43,
        "ask": 12.47,
        "volume24h": 24500,
        "marketCap": 622500
      },
      "assetId": "your-asset-id", // MUST match asset ID
      "isActive": true,
      "metadata": {
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-12-01T15:30:00Z"
      }
    }
  }
}
```

### 3. Token Types

#### **Royalty Tokens** (`"tokenType": "royalty"`)
- Represent ownership in asset revenue streams
- Have tranche information with payout rates
- Used for investment and trading
- Decimals: usually 18

#### **Payment Tokens** (`"tokenType": "payment"`)
- Used for payments and payouts
- No tranche information (`"tranche": null`)
- Stable price around $1.00
- Decimals: usually 6

### 4. Link Tokens to Assets

After creating tokens, update the asset's `tokenContracts` array:

```json
{
  "assets": {
    "your-asset-id": {
      "tokenContracts": [
        "0x1234567890abcdef1234567890abcdef12345678", // Royalty token
        "0x2345678901bcdef01234567890abcdef23456789"  // Payment token
      ]
    }
  }
}
```

## 🔧 Using the Data

### Import the Service

```typescript
import dataStoreService from '$lib/services/DataStoreService';
```

### Common Operations

```typescript
// Get all assets
const assets = dataStoreService.getAllAssets();

// Get specific asset with tokens
const assetWithTokens = dataStoreService.getAssetWithTokens('your-asset-id');

// Get token by symbol
const token = dataStoreService.getTokenBySymbol('YOUR-AST-A');

// Get market data for trading
const marketData = dataStoreService.getMarketData();

// Search assets
const searchResults = dataStoreService.searchAssets('texas');
```

## ✅ Validation Checklist

Before adding new data, ensure:

- [ ] Asset ID is unique and kebab-case
- [ ] All required fields are filled
- [ ] Token contract addresses are unique
- [ ] Token `assetId` matches asset `id`
- [ ] Asset `tokenContracts` includes all token addresses
- [ ] Images exist in `/static/images/assets/`
- [ ] All dates are in ISO format
- [ ] Numbers are properly formatted (no commas in JSON)

## 🚀 Deployment

After adding data:

1. **Test locally** - Verify data loads correctly
2. **Check TypeScript** - Run `npm run check`
3. **Build project** - Run `npm run build`
4. **Deploy** - Data is automatically included in build

## 📊 Data Relationships

```
Asset (europa-wressle-release-1)
├── tokenContracts: ["0x123...", "0x234..."]
│
Token (0x123...)
├── assetId: "europa-wressle-release-1"
├── symbol: "EUR-WR1-A"
└── tranche: { ... }

Token (0x234...)
├── assetId: "europa-wressle-release-1"
├── symbol: "EUR-WR1-PAY"
└── tranche: null (payment token)
```

## 🔍 Example: Complete New Asset

See the existing assets in `assets.json` for complete examples, particularly:
- `europa-wressle-release-1` - Offshore conventional oil
- `bakken-horizon-field` - Onshore shale oil
- `permian-basin-venture` - Unconventional oil
- `gulf-mexico-deep-water` - Deep water offshore

Each example shows different asset types with their corresponding token structures.