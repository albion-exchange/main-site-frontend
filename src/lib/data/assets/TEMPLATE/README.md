# Asset Template

This folder contains template files for creating new assets in the Albion platform.

## Usage

1. **Copy this entire TEMPLATE folder** and rename it to your asset's ID (e.g., `my-new-asset`)
2. **Update asset.json** with your asset's specific information
3. **Add cover image** - place your main asset image as `cover.[ext]` (jpg, png, etc.)
4. **Update token files** in the `tokens/` folder with your token information
5. **Add gallery images** to the `gallery/` folder (optional)
6. **Update future.json** with planned future releases (optional)

## File Structure

```
TEMPLATE/
├── asset.json          # Main asset configuration and data
├── cover.jpg          # Main asset image (add your own)
├── gallery/           # Additional asset images (optional)
├── tokens/            # Token information folder
│   ├── example_token.json    # Current token data
│   └── future.json          # Future release information
└── README.md         # This file
```

## Key Fields to Update

### asset.json
- `id`: Unique asset identifier (kebab-case)
- `name`: Display name for the asset
- `description`: Asset description
- `location`: Geographic information
- `operator`: Operating company details
- `technical`: Field specifications and technical details
- `assetTerms`: Royalty terms and payment frequency
- `monthlyReports`: Historical production and revenue data
- `plannedProduction`: Future production projections
- `productionHistory`: Historical production data
- `operationalMetrics`: Current operational performance

### tokens/example_token.json
- `contractAddress`: Ethereum contract address
- `name`: Token display name
- `symbol`: Token ticker symbol
- `assetId`: Must match the asset folder name
- `supply`: Token supply information
- `holders`: Current token holders (if any)
- `payoutHistory`: Historical payout data

### tokens/future.json
- Array of future release objects
- `whenRelease`: Release timeframe (e.g., "Q2 2025")
- `description`: Release description
- `emoji`: Display emoji for the release

## Data Requirements

- All monetary values in USD
- Production values in BOE (Barrels of Oil Equivalent)
- Dates in ISO 8601 format (YYYY-MM-DD)
- Coordinates in decimal degrees
- Contract addresses in hex format (0x...)

## Image Guidelines

- **Cover image**: High-quality asset photo (1200x800px recommended)
- **Gallery images**: Additional asset photos for the gallery tab
- Supported formats: JPG, PNG, AVIF, WebP

## Validation

After creating your asset:
1. Ensure all JSON files are valid
2. Test that images load correctly
3. Verify data displays properly in the UI
4. Check that calculations work as expected

## Notes

- Asset IDs should be unique and use kebab-case formatting
- Remove any unused fields rather than leaving them empty
- Ensure historical data is consistent and accurate
- Test thoroughly before deploying to production