# Asset Data Structure

Each asset folder contains all data and resources related to that specific asset in a unified structure.

## Folder Structure

```
asset-name/
├── asset.json          # Main asset data and configuration
├── cover.jpg          # Cover image for the asset (can be .jpg, .jpeg, .png, .avif, etc.)
├── gallery/           # Folder for additional asset images
│   └── (empty for now, add images here)
└── tokens/            # Folder containing all token data
    ├── token_1.json   # Individual token data files
    ├── token_2.json
    └── token_future.json  # Future token release information
```

## Example Structure

```
europa-wressle-release-1/
├── asset.json         # Asset configuration and data
├── cover.jpg         # Main asset image
├── gallery/          # Additional images folder
└── tokens/           # Token information
    ├── eur_wr1.json
    ├── eur_wr2.json
    ├── eur_wr3.json
    └── eur_wr4_future.json
```

## Adding New Images

1. **Cover Image**: Place the main asset image as `cover.[ext]` in the asset root folder
2. **Gallery Images**: Add additional images to the `gallery/` folder
3. **Update Image Imports**: When adding gallery images, update `/src/lib/utils/assetImages.ts` to import and expose them

## Benefits

- **Unified Structure**: All asset-related data in one place
- **Easy Maintenance**: Clear organization makes updates simple
- **Scalability**: Easy to add new assets by copying the folder structure
- **Type Safety**: TypeScript ensures data consistency across assets