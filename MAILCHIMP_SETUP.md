# MailChimp Integration Setup Guide

This guide explains how to set up MailChimp integration for the Albion platform.

## Features

- **Newsletter Subscription**: Users can subscribe to the newsletter from the footer
- **Token Release Notifications**: Users can subscribe to notifications for specific asset token releases
- **Asset-Specific Tagging**: Subscribers are tagged with relevant asset information for targeted campaigns

## Prerequisites

1. A MailChimp account
2. Two MailChimp audience lists:
   - One for general newsletter subscriptions
   - One for token release notifications

## Setup Instructions

### 1. MailChimp Account Setup

1. Go to [MailChimp](https://mailchimp.com) and create an account
2. Create two audience lists:
   - **Newsletter List**: For general marketing communications
   - **Token Notifications List**: For asset-specific token release notifications

### 2. Get Your MailChimp API Key

1. In your MailChimp account, go to **Account & Billing** → **Extras** → **API keys**
2. Create a new API key and copy it
3. Note your server prefix (e.g., "us1", "us2") from the API key

### 3. Get Your List IDs

1. In your MailChimp account, go to **Audience** → **All contacts**
2. Click **Settings** → **Audience name and defaults**
3. The Audience ID is displayed at the bottom of the page
4. Repeat for both lists

### 4. Environment Configuration

Create a `.env.local` file (or update your existing one) with the following variables:

```bash
MAILCHIMP_API_KEY=your_api_key_here-us1
MAILCHIMP_SERVER=us1
MAILCHIMP_NEWSLETTER_LIST_ID=your_newsletter_list_id
MAILCHIMP_TOKEN_NOTIFICATIONS_LIST_ID=your_notifications_list_id
```

Replace the values with your actual MailChimp credentials.

### 5. Merge Fields Setup (Optional)

For better targeting, you can set up custom merge fields in your MailChimp lists:

**Newsletter List:**
- `FNAME` (First Name)
- `LNAME` (Last Name)

**Token Notifications List:**
- `FNAME` (First Name)
- `LNAME` (Last Name)
- `ASSET_ID` (Asset ID)
- `ASSET_NAME` (Asset Name)
- `TOKEN_RELEASE_ID` (Token Release ID)
- `NOTIFICATION_TYPE` (Notification Type)

## Usage

### Newsletter Subscription

Users can subscribe to the newsletter using the form in the footer:

```typescript
// API endpoint: POST /api/newsletter
{
  "email": "user@example.com",
  "firstName": "John", // optional
  "lastName": "Doe"    // optional
}
```

### Token Release Notifications

Users can subscribe to notifications for specific assets:

```typescript
// API endpoint: POST /api/token-notifications
{
  "email": "user@example.com",
  "assetId": "asset-123",
  "assetName": "Eagle Ford Shale",
  "tokenReleaseId": "release-456", // optional
  "notificationType": "token_release"
}
```

## Tagging Strategy

The system automatically applies tags to subscribers:

**Newsletter Subscribers:**
- No specific tags (can be customized)

**Token Notification Subscribers:**
- `token-notifications`: Identifies users interested in token notifications
- `asset-{assetId}`: Asset-specific tag for targeting
- `{notificationType}`: Type of notification (e.g., "token_release")
- `release-{tokenReleaseId}`: Specific release tag (if provided)

## Campaign Management

### Sending Token Release Notifications

You can programmatically send notifications when new tokens are released:

```typescript
import { createMailChimpService, MAILCHIMP_LISTS } from '$lib/services';

const mailChimpService = createMailChimpService();

await mailChimpService.sendTokenReleaseNotification(
  MAILCHIMP_LISTS.TOKEN_NOTIFICATIONS,
  'asset-123',
  'Eagle Ford Shale',
  'release-456',
  {
    subject: 'New Token Release: Eagle Ford Shale',
    previewText: 'New tokens are now available for investment',
    htmlContent: '<h1>New tokens available!</h1><p>...</p>',
    textContent: 'New tokens available! ...'
  }
);
```

## Error Handling

The integration includes robust error handling:

- **Existing Members**: If a user is already subscribed, their tags and preferences are updated
- **API Failures**: Graceful fallback with user-friendly messages
- **Rate Limiting**: MailChimp API rate limits are respected

## Testing

During development, you can use MailChimp's test mode or create separate test audience lists to avoid affecting production subscribers.

## Security Notes

- API keys are kept secure on the server side
- All MailChimp operations are performed via server-side API endpoints
- Client-side code never exposes MailChimp credentials

## Troubleshooting

### Common Issues

1. **"Member Exists" errors**: This is normal and handled automatically
2. **Invalid API key**: Check your API key format and server prefix
3. **List not found**: Verify your list IDs are correct
4. **Rate limiting**: The service includes automatic retry logic

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG=mailchimp:*
```

This will log detailed information about MailChimp API calls and responses.

## Next Steps

1. Set up automated email campaigns in MailChimp
2. Create email templates for token release notifications
3. Set up audience segmentation based on tags
4. Configure automation workflows for welcome emails
5. Set up reporting and analytics tracking