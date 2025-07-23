# Social Sharing UTM Implementation Summary

## Overview

I have successfully updated the existing social sharing functionality from the asset profile page to include UTM parameters for tracking different sharing mediums. This implementation allows you to track the effectiveness of various sharing platforms and user behavior.

## What Was Implemented

### 1. Enhanced Sharing Utilities (`/src/lib/utils/sharing.ts`)
- **Updated `getShareUrls()` function** to include UTM parameters for all platforms
- **Enhanced `shareViaWebAPI()` function** for mobile sharing with tracking
- **Integrated with centralized tracking utilities**

### 2. New Tracking Utilities (`/src/lib/utils/tracking.ts`)
- **UTM Parameter Generation**: Centralized function to add UTM parameters to URLs
- **Platform-Specific Configurations**: Pre-configured UTM settings for each sharing platform
- **Analytics Event Tracking**: Ready-to-integrate tracking for analytics services
- **Asset ID Extraction**: Utility to extract asset ID from URLs for content tracking

### 3. Updated Asset Detail Header (`/src/lib/components/patterns/assets/AssetDetailHeader.svelte`)
- **Enhanced share handlers** with UTM tracking and analytics events
- **Copy link functionality** now includes UTM parameters
- **Analytics event logging** for all sharing actions

### 4. Comprehensive Testing (`/src/lib/utils/tracking.test.ts`)
- **10 test cases** covering all UTM tracking functionality
- **Edge case handling** for null values and invalid URLs
- **Platform configuration validation**

## UTM Parameter Structure

All shared URLs now include:

| Parameter | Description | Example Values |
|-----------|-------------|----------------|
| `utm_source` | Specific platform | `twitter`, `linkedin`, `telegram`, `whatsapp`, `email_share`, `native_share`, `manual_copy` |
| `utm_medium` | Medium category | `social`, `email`, `mobile`, `copy_link` |
| `utm_campaign` | Campaign identifier | `asset_share` (consistent across all shares) |
| `utm_content` | Asset identifier | `asset_eur-wr` (when available) |

## Platform-Specific Tracking

### Desktop Sharing
- **Twitter**: `utm_source=twitter&utm_medium=social`
- **LinkedIn**: `utm_source=linkedin&utm_medium=social`
- **Telegram**: `utm_source=telegram&utm_medium=social`
- **WhatsApp**: `utm_source=whatsapp&utm_medium=social`
- **Email**: `utm_source=email_share&utm_medium=email`
- **Copy Link**: `utm_source=manual_copy&utm_medium=copy_link`

### Mobile Sharing
- **Native Share API**: `utm_source=native_share&utm_medium=mobile`

## Example URLs

### Original Asset URL
```
https://yoursite.com/assets/eur-wr
```

### Twitter Share URL
```
https://yoursite.com/assets/eur-wr?utm_source=twitter&utm_medium=social&utm_campaign=asset_share&utm_content=asset_eur-wr
```

### Mobile Share URL
```
https://yoursite.com/assets/eur-wr?utm_source=native_share&utm_medium=mobile&utm_campaign=asset_share&utm_content=asset_eur-wr
```

## Mobile Sharing Answer

**Question**: "For mobile is it possible to do the same with sharing since it's relying on the native sharing system, or do we just track it as shared via mobile?"

**Answer**: Yes, we track mobile sharing as "shared via mobile" using `utm_medium=mobile` and `utm_source=native_share`. This is the most accurate approach because:

1. **Privacy Limitation**: The Web Share API doesn't expose which app the user selects to share to
2. **Consistent Tracking**: All mobile native shares are fundamentally the same user action
3. **Clear Analytics**: You can easily distinguish between desktop platform-specific shares and mobile native shares
4. **UTM Parameters Still Work**: The shared URL includes UTM parameters, so you can track when users visit from mobile shares

## Analytics Integration Ready

The implementation includes placeholders for popular analytics services:

### Google Analytics 4
```javascript
gtag('event', 'share', {
  method: event.platform,
  content_type: 'asset',
  content_id: event.asset_id
});
```

### Mixpanel
```javascript
mixpanel.track('Asset Shared', {
  platform: event.platform,
  asset_id: event.asset_id,
  url: event.url
});
```

## Files Modified

1. **`/src/lib/utils/sharing.ts`** - Enhanced with UTM parameters
2. **`/src/lib/utils/tracking.ts`** - New centralized tracking utilities
3. **`/src/lib/components/patterns/assets/AssetDetailHeader.svelte`** - Updated with tracking events
4. **`/src/lib/utils/README.md`** - Comprehensive documentation
5. **`/src/lib/utils/tracking.test.ts`** - Complete test suite

## Analytics You Can Now Track

With this implementation, you can track:

1. **Share Button Clicks**: Which platforms users click most
2. **Share Completion**: Which shares are actually completed (mobile)
3. **Copy Link Usage**: How often users manually copy links
4. **Platform Effectiveness**: Which platforms drive the most traffic back
5. **Asset Performance**: Which assets are shared most
6. **Medium Performance**: Desktop vs mobile sharing patterns

## Next Steps

1. **Connect Analytics**: Uncomment and configure your preferred analytics service in `tracking.ts`
2. **Monitor Performance**: Use UTM parameters in your analytics dashboard to track sharing effectiveness
3. **A/B Testing**: Experiment with different share text for different platforms
4. **Custom Campaigns**: Add support for different campaign names for special promotions

The implementation is production-ready and maintains backward compatibility while adding comprehensive tracking capabilities.