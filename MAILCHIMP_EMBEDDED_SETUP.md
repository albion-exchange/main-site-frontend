# MailChimp Embedded Forms Setup Guide

This guide explains how to configure the MailChimp embedded forms used in the Albion platform.

## Overview

The platform now uses **MailChimp embedded forms** for all email collection:
- ✅ **100% secure** - No API keys exposed
- ✅ **Zero server-side code** required
- ✅ **Custom styling** that matches your design perfectly
- ✅ **MailChimp handles everything** - spam protection, validation, storage

## Setup Instructions

### 1. Create MailChimp Lists

Create two separate audience lists in your MailChimp account:

1. **Newsletter List** - For general marketing communications
2. **Token Notifications List** - For asset-specific token release notifications

### 2. Set Up Merge Fields (Optional but Recommended)

For the **Token Notifications List**, add these custom merge fields:

1. Go to **Audience** → **All contacts** → **Settings** → **Audience fields and *|MERGE|* tags**
2. Add these fields:
   - `ASSET_ID` (Text) - The ID of the asset they're interested in
   - `ASSET_NAME` (Text) - The name of the asset
   - `NOTIFICATION_TYPE` (Text) - Type of notification (e.g., "token_release")

### 3. Generate Embed Codes

#### For Newsletter List:
1. Go to **Audience** → **All contacts** → **Signup forms** → **Embedded forms**
2. Choose "Naked" form (minimal styling)
3. Copy the form HTML
4. Note the action URL format: `https://your-domain.us1.list-manage.com/subscribe/post?u=USER_ID&id=LIST_ID`

#### For Token Notifications List:
1. Repeat the same process for your token notifications list
2. Make sure to include the custom merge fields in the form

### 4. Update the Code

#### Newsletter Form (Footer)
In `src/routes/+layout.svelte`, replace the placeholder values:

```html
<form action="https://your-domain.us1.list-manage.com/subscribe/post?u=YOUR_USER_ID&id=YOUR_LIST_ID" 
      method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" target="_blank">
```

Replace:
- `your-domain.us1` with your MailChimp server (e.g., `albion.us1`)
- `YOUR_USER_ID` with your MailChimp user ID
- `YOUR_LIST_ID` with your newsletter list ID

#### Token Notifications Form (Asset Pages)
In `src/routes/assets/[id]/+page.svelte`, replace the placeholder values:

```html
<form action="https://your-domain.us1.list-manage.com/subscribe/post?u=YOUR_USER_ID&id=YOUR_TOKEN_LIST_ID" 
      method="post" id="mc-embedded-subscribe-form-token" name="mc-embedded-subscribe-form-token" target="_blank">
```

Replace:
- `your-domain.us1` with your MailChimp server
- `YOUR_USER_ID` with your MailChimp user ID  
- `YOUR_TOKEN_LIST_ID` with your token notifications list ID

Also update the honeypot field:
```html
<input type="text" name="b_YOUR_USER_ID_YOUR_TOKEN_LIST_ID" tabindex="-1" value="">
```

### 5. How to Find Your IDs

#### User ID and Server:
- Go to **Account** → **Account & Billing** → **Extras** → **API keys**
- Create an API key (you won't use it, but it shows the format)
- From `abc123def456-us1`, your server is `us1` and user ID is in the API key

#### List IDs:
1. Go to **Audience** → **All contacts**
2. Click **Settings** → **Audience name and defaults**
3. The **Audience ID** is shown at the bottom

## Example Configuration

Here's what your final URLs should look like:

```
Newsletter Form:
https://albionexchange.us1.list-manage.com/subscribe/post?u=a1b2c3d4e5&id=f6g7h8i9j0

Token Notifications Form:
https://albionexchange.us1.list-manage.com/subscribe/post?u=a1b2c3d4e5&id=k1l2m3n4o5
```

## Security Benefits

✅ **No API keys** - Everything is handled client-side  
✅ **No server exposure** - No credentials on your server  
✅ **MailChimp security** - Spam protection, rate limiting, validation  
✅ **GDPR compliant** - MailChimp handles compliance  
✅ **No vulnerabilities** - Nothing to compromise  

## Styling

The forms are styled to match your existing design using custom CSS in `src/app.css`. The styling completely overrides MailChimp's default styling with `!important` declarations.

## Testing

1. **Test Newsletter Signup:**
   - Go to your site footer
   - Enter an email and submit
   - Check your MailChimp newsletter list for the new subscriber

2. **Test Token Notifications:**
   - Go to any asset page
   - Click "Get Notified" 
   - Enter an email and submit
   - Check your token notifications list
   - Verify the asset information was captured in merge fields

## Success Pages

By default, users will be redirected to MailChimp's success page after submission. To customize this:

1. In MailChimp, go to **Audience** → **Signup forms** → **Form builder**
2. Set a custom confirmation page URL
3. Or customize the default MailChimp success page

## Campaign Targeting

With the embedded forms, you can easily target campaigns:

- **Newsletter subscribers**: Target everyone in the newsletter list
- **Asset-specific**: Use merge fields to target subscribers interested in specific assets
- **Notification type**: Target based on notification preferences

## Troubleshooting

### Form not submitting?
- Check that the action URL is correct
- Verify list IDs match your MailChimp lists
- Ensure the honeypot field name matches your list

### Styling issues?
- The CSS overrides are in `src/app.css`
- All rules use `!important` to override MailChimp defaults
- Check browser dev tools for conflicting styles

### Not receiving emails?
- Check MailChimp spam/abuse monitoring
- Verify your domain reputation
- Check MailChimp audience health

## Benefits vs Server-Side API

| Aspect | Embedded Forms | Server-Side API |
|--------|---------------|-----------------|
| Security | ✅ No credentials exposed | ⚠️ API keys on server |
| Complexity | ✅ Simple HTML forms | ❌ Server endpoints + validation |
| Maintenance | ✅ MailChimp handles everything | ❌ You handle errors, updates |
| Cost | ✅ No server processing | ❌ Server resources used |
| Reliability | ✅ MailChimp's infrastructure | ⚠️ Your server must be up |

The embedded forms approach is simpler, more secure, and more reliable than server-side API integration.