/**
 * @fileoverview Tracking Utilities
 * Centralizes tracking and analytics functionality for social sharing and user interactions
 */

export interface UTMParameters {
	utm_source: string;
	utm_medium: string;
	utm_campaign: string;
	utm_content?: string;
	utm_term?: string;
}

export interface ShareTrackingEvent {
	action: 'share_clicked' | 'share_completed' | 'copy_link';
	platform: 'twitter' | 'linkedin' | 'telegram' | 'whatsapp' | 'email' | 'mobile' | 'copy_link';
	asset_id?: string | null;
	url: string;
	timestamp: Date;
}

/**
 * Generate UTM parameters for tracking sharing medium
 */
export function generateUTMParameters(
	source: string,
	medium: string,
	campaign: string = 'asset_share',
	content?: string,
	term?: string
): UTMParameters {
	const params: UTMParameters = {
		utm_source: source,
		utm_medium: medium,
		utm_campaign: campaign,
	};

	if (content) params.utm_content = content;
	if (term) params.utm_term = term;

	return params;
}

/**
 * Add UTM parameters to a URL
 */
export function addUTMParameters(
	url: string,
	medium: string,
	source: string,
	campaign: string = 'asset_share',
	content?: string,
	term?: string
): string {
	const urlObj = new URL(url);
	const params = generateUTMParameters(source, medium, campaign, content, term);
	
	Object.entries(params).forEach(([key, value]) => {
		if (value) {
			urlObj.searchParams.set(key, value);
		}
	});

	return urlObj.toString();
}

/**
 * Track sharing events (placeholder for analytics integration)
 */
export function trackShareEvent(event: ShareTrackingEvent): void {
	// Log to console for development
	console.log('Share Event:', event);
	
	// TODO: Integrate with analytics service (e.g., Google Analytics, Mixpanel, etc.)
	// Example integrations:
	
	// Google Analytics 4
	// if (typeof gtag !== 'undefined') {
	//   gtag('event', 'share', {
	//     method: event.platform,
	//     content_type: 'asset',
	//     content_id: event.asset_id,
	//     custom_parameter_1: event.url
	//   });
	// }
	
	// Mixpanel
	// if (typeof mixpanel !== 'undefined') {
	//   mixpanel.track('Asset Shared', {
	//     platform: event.platform,
	//     asset_id: event.asset_id,
	//     url: event.url,
	//     action: event.action
	//   });
	// }
}

/**
 * Get UTM parameters for specific sharing platforms
 */
export const SHARING_UTM_CONFIGS = {
	twitter: {
		source: 'twitter',
		medium: 'social',
		campaign: 'asset_share'
	},
	linkedin: {
		source: 'linkedin',
		medium: 'social',
		campaign: 'asset_share'
	},
	telegram: {
		source: 'telegram',
		medium: 'social',
		campaign: 'asset_share'
	},
	whatsapp: {
		source: 'whatsapp',
		medium: 'social',
		campaign: 'asset_share'
	},
	email: {
		source: 'email_share',
		medium: 'email',
		campaign: 'asset_share'
	},
	mobile: {
		source: 'native_share',
		medium: 'mobile',
		campaign: 'asset_share'
	},
	copy_link: {
		source: 'manual_copy',
		medium: 'copy_link',
		campaign: 'asset_share'
	}
} as const;

/**
 * Create trackable URL for a specific platform
 */
export function createTrackableURL(
	originalUrl: string,
	platform: keyof typeof SHARING_UTM_CONFIGS,
	assetId?: string | null
): string {
	const config = SHARING_UTM_CONFIGS[platform];
	const content = assetId ? `asset_${assetId}` : undefined;
	
	return addUTMParameters(
		originalUrl,
		config.medium,
		config.source,
		config.campaign,
		content
	);
}

/**
 * Extract asset ID from URL (utility function)
 */
export function extractAssetIdFromURL(url: string): string | null {
	try {
		const urlObj = new URL(url);
		const pathParts = urlObj.pathname.split('/');
		const assetsIndex = pathParts.indexOf('assets');
		
		if (assetsIndex !== -1 && assetsIndex + 1 < pathParts.length) {
			return pathParts[assetsIndex + 1];
		}
	} catch (error) {
		console.warn('Failed to extract asset ID from URL:', error);
	}
	
	return null;
}