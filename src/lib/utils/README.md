# Social Sharing and UTM Tracking

This document explains the implementation of UTM parameter tracking for social sharing across the platform.

## Overview

All social sharing links now include UTM parameters to track the medium, source, and campaign for analytics purposes. This allows us to measure the effectiveness of different sharing platforms and understand user behavior.

## UTM Parameter Structure

Each shared URL includes the following UTM parameters:

- `utm_source`: The specific platform (e.g., 'twitter', 'linkedin', 'telegram')
- `utm_medium`: The medium category (e.g., 'social', 'email', 'mobile', 'copy_link')
- `utm_campaign`: Always set to 'asset_share' for asset sharing
- `utm_content`: Asset ID (e.g., 'asset_eur-wr') when available

## Supported Platforms

### Desktop/Web Sharing

1. **Twitter**
   - Source: `twitter`
   - Medium: `social`
   - Opens Twitter intent with pre-filled text and tracked URL

2. **LinkedIn**
   - Source: `linkedin`
   - Medium: `social`
   - Opens LinkedIn sharing dialog with tracked URL

3. **Telegram**
   - Source: `telegram`
   - Medium: `social`
   - Opens Telegram sharing with pre-filled text and tracked URL

4. **WhatsApp**
   - Source: `whatsapp`
   - Medium: `social`
   - Opens WhatsApp with pre-filled message and tracked URL

5. **Email**
   - Source: `email_share`
   - Medium: `email`
   - Opens default email client with pre-filled subject/body and tracked URL

6. **Copy Link**
   - Source: `manual_copy`
   - Medium: `copy_link`
   - Copies tracked URL to clipboard

### Mobile Sharing

For mobile devices, the platform uses the native Web Share API when available:

- **Native Mobile Sharing**
  - Source: `native_share`
  - Medium: `mobile`
  - Uses device's native sharing capabilities
  - Falls back to copy link if Web Share API fails

## Implementation Details

### Files Modified

1. **`/src/lib/utils/sharing.ts`**
   - Updated to include UTM parameters in all sharing URLs
   - Integrated with tracking utilities

2. **`/src/lib/utils/tracking.ts`** (New)
   - Centralized UTM parameter generation
   - Analytics event tracking
   - Platform-specific configurations

3. **`/src/lib/components/patterns/assets/AssetDetailHeader.svelte`**
   - Updated to use new tracking utilities
   - Added analytics event tracking for all share actions

### Key Functions

#### `createTrackableURL(originalUrl, platform, assetId?)`
Creates a URL with appropriate UTM parameters for the specified platform.

#### `trackShareEvent(event)`
Logs sharing events for analytics (currently logs to console, ready for integration with analytics services).

#### `extractAssetIdFromURL(url)`
Extracts asset ID from URL for content tracking.

## Example URLs

### Original URL
```
https://example.com/assets/eur-wr
```

### Twitter Share URL
```
https://example.com/assets/eur-wr?utm_source=twitter&utm_medium=social&utm_campaign=asset_share&utm_content=asset_eur-wr
```

### Mobile Share URL
```
https://example.com/assets/eur-wr?utm_source=native_share&utm_medium=mobile&utm_campaign=asset_share&utm_content=asset_eur-wr
```

## Analytics Integration

The tracking system is designed to be easily integrated with analytics services:

### Google Analytics 4
Uncomment and configure in `tracking.ts`:
```javascript
gtag('event', 'share', {
  method: event.platform,
  content_type: 'asset',
  content_id: event.asset_id,
  custom_parameter_1: event.url
});
```

### Mixpanel
Uncomment and configure in `tracking.ts`:
```javascript
mixpanel.track('Asset Shared', {
  platform: event.platform,
  asset_id: event.asset_id,
  url: event.url,
  action: event.action
});
```

## Mobile vs Desktop Tracking

### Desktop
- Each platform (Twitter, LinkedIn, etc.) is tracked separately
- Users click platform-specific buttons
- UTM parameters identify the exact social platform

### Mobile
- Uses native sharing API when available
- All mobile shares are tracked as `medium=mobile`, `source=native_share`
- Cannot distinguish between different apps user chooses to share to
- This is a limitation of the Web Share API - we only know the user initiated a share, not which app they selected

### Recommendation for Mobile
Since mobile sharing uses the native system, we track it as a single "mobile" medium. This is the most accurate approach because:

1. **Privacy**: The Web Share API doesn't expose which app the user selects
2. **Consistency**: All mobile native shares are fundamentally the same action
3. **Clarity**: Analytics clearly distinguish between desktop platform-specific shares and mobile native shares

## Future Enhancements

1. **A/B Testing**: Test different share text for different platforms
2. **Deep Analytics**: Track conversion rates from shared links
3. **Custom Campaigns**: Support different campaign names for different contexts
4. **Share Buttons Analytics**: Track which share buttons are most clicked
5. **Geographic Tracking**: Add UTM terms for geographic campaigns