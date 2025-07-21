# MailChimp Integration Documentation

## Overview

This document outlines the MailChimp integration implemented for the Albion platform, including newsletter subscriptions and token release notifications.

## Features Implemented

### 1. MailChimp Service (`src/lib/services/MailchimpService.ts`)

A comprehensive service class that handles:

- **Newsletter Subscriptions**: Users can subscribe to general platform updates
- **Token Release Notifications**: Users can subscribe to notifications for specific asset token releases
- **Embedded Form Support**: Ready to integrate with actual MailChimp embedded forms
- **Error Handling**: Proper error handling and user feedback

#### Key Methods:

- `subscribeToNewsletter(email, firstName?, lastName?)`: Subscribe to general newsletter
- `subscribeToTokenNotifications(email, asset, tokenReleaseId?, firstName?, lastName?)`: Subscribe to token-specific notifications
- `getNewsletterEmbedFormHtml()`: Returns placeholder HTML for MailChimp newsletter form
- `getTokenNotificationEmbedFormHtml()`: Returns placeholder HTML for token notification form

### 2. Custom MailChimp Component (`src/lib/components/components/MailchimpSignup.svelte`)

A reusable Svelte component that provides:

- **Styled Email Input**: Follows the platform's design language
- **Flexible Layout**: Horizontal and vertical layout options
- **Size Variants**: Small, medium, and large sizing
- **Status Feedback**: Success, error, and loading states
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Responsive Design**: Works on mobile and desktop

#### Props:

- `placeholder`: Input placeholder text
- `buttonText`: Submit button text
- `size`: Component size ('small' | 'medium' | 'large')
- `layout`: Layout direction ('horizontal' | 'vertical')
- `isSubmitting`: Loading state
- `submitStatus`: Current status ('idle' | 'success' | 'error')
- `errorMessage`: Error message to display
- `successMessage`: Success message to display

### 3. Enhanced "Notify Me" Functionality

Updated the asset detail page (`src/routes/(main)/assets/[id]/+page.svelte`) to:

- **Integrate MailChimp**: Uses the MailChimp service instead of mock API
- **Capture Asset Info**: Records which asset and token release user is interested in
- **Better UX**: Improved modal with release information display
- **Error Handling**: Proper error states and user feedback

### 4. Footer Newsletter Signup

Enhanced the main layout footer (`src/routes/(main)/+layout.svelte`) with:

- **Newsletter Section**: Replaces "Stay Connected" with newsletter signup
- **Inline Signup**: Newsletter subscription directly in footer
- **Social Links**: Maintains existing social media links
- **Responsive**: Works across all device sizes

### 5. Support Page Conversion

Converted the contact page (`src/routes/(main)/contact/+page.svelte`) to a support page:

- **Quick Help Section**: Three main help categories
- **Removed Contact Form**: Simplified to support-focused content
- **Still Need Help Section**: Email and Telegram support options
- **Updated Navigation**: Footer link now says "Support"

## Configuration Required

To complete the MailChimp integration, you'll need to:

### 1. Environment Variables

Add the following to your environment configuration:

```env
MAILCHIMP_API_KEY=your_mailchimp_api_key
MAILCHIMP_DATA_CENTER=your_data_center (e.g., us1, us2, etc.)
MAILCHIMP_NEWSLETTER_LIST_ID=your_newsletter_list_id
MAILCHIMP_TOKEN_NOTIFICATION_LIST_ID=your_token_notifications_list_id
```

### 2. MailChimp Account Setup

1. **Create Lists**:
   - Newsletter list for general updates
   - Token notifications list for release alerts

2. **Custom Fields**:
   - `ASSET`: Asset name (for token notifications)
   - `TOKENID`: Token release ID (for token notifications)

3. **Embedded Forms**:
   - Replace placeholder HTML in `MailchimpService.ts` with actual embedded forms
   - Style the forms to match your design system

### 3. Production Implementation

The current implementation includes placeholder/simulation code for development. For production:

1. **Replace Simulation**: Update `MailchimpService.subscribe()` method to make actual API calls
2. **Add Real Forms**: Replace embedded form HTML with your actual MailChimp forms
3. **Error Handling**: Enhance error handling for production scenarios
4. **Rate Limiting**: Add appropriate rate limiting for API calls

## Usage Examples

### Newsletter Signup (Footer)

```svelte
<MailchimpSignup 
    placeholder="Enter your email"
    buttonText="Subscribe"
    size="small"
    layout="vertical"
    isSubmitting={isSubmitting}
    submitStatus={status}
    on:submit={handleNewsletterSignup}
/>
```

### Token Notification Signup (Asset Page)

```svelte
<MailchimpSignup 
    placeholder="Enter your email address"
    buttonText="Notify Me"
    layout="vertical"
    isSubmitting={isSubmitting}
    submitStatus={status}
    on:submit={handleTokenNotification}
/>
```

## File Changes Summary

### New Files:
- `src/lib/services/MailchimpService.ts` - MailChimp service implementation
- `src/lib/components/components/MailchimpSignup.svelte` - Reusable signup component
- `MAILCHIMP_INTEGRATION.md` - This documentation file

### Modified Files:
- `src/lib/services/index.ts` - Added MailChimp service exports
- `src/lib/components/components/index.ts` - Added MailchimpSignup component export
- `src/routes/(main)/+layout.svelte` - Added newsletter signup to footer
- `src/routes/(main)/assets/[id]/+page.svelte` - Enhanced notify me functionality
- `src/routes/(main)/contact/+page.svelte` - Converted to support page

## Testing

The integration includes:
- Form validation
- Error state handling
- Success state feedback
- Responsive design testing
- Accessibility compliance

## Next Steps

1. **Set up MailChimp Account**: Create lists and configure custom fields
2. **Get API Keys**: Obtain MailChimp API credentials
3. **Replace Placeholders**: Update embedded form HTML with real forms
4. **Production Deployment**: Implement real API calls and error handling
5. **Analytics**: Add tracking for subscription success rates
6. **A/B Testing**: Test different signup copy and placements

## Support

For questions about this integration, contact the development team or refer to:
- [MailChimp API Documentation](https://mailchimp.com/developer/)
- [MailChimp Embedded Forms Guide](https://mailchimp.com/help/add-a-signup-form-to-your-website/)