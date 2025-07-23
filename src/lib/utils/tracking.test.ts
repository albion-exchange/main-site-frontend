import { describe, it, expect } from 'vitest';
import { 
	addUTMParameters, 
	createTrackableURL, 
	extractAssetIdFromURL,
	SHARING_UTM_CONFIGS 
} from './tracking';

describe('UTM Tracking Utilities', () => {
	describe('addUTMParameters', () => {
		it('should add UTM parameters to a URL', () => {
			const originalUrl = 'https://example.com/assets/eur-wr';
			const result = addUTMParameters(originalUrl, 'social', 'twitter', 'asset_share', 'asset_eur-wr');
			
			const url = new URL(result);
			expect(url.searchParams.get('utm_source')).toBe('twitter');
			expect(url.searchParams.get('utm_medium')).toBe('social');
			expect(url.searchParams.get('utm_campaign')).toBe('asset_share');
			expect(url.searchParams.get('utm_content')).toBe('asset_eur-wr');
		});

		it('should handle URLs with existing query parameters', () => {
			const originalUrl = 'https://example.com/assets/eur-wr?existing=param';
			const result = addUTMParameters(originalUrl, 'social', 'twitter');
			
			const url = new URL(result);
			expect(url.searchParams.get('existing')).toBe('param');
			expect(url.searchParams.get('utm_source')).toBe('twitter');
			expect(url.searchParams.get('utm_medium')).toBe('social');
		});
	});

	describe('createTrackableURL', () => {
		it('should create trackable URL for twitter', () => {
			const originalUrl = 'https://example.com/assets/eur-wr';
			const result = createTrackableURL(originalUrl, 'twitter', 'eur-wr');
			
			const url = new URL(result);
			expect(url.searchParams.get('utm_source')).toBe('twitter');
			expect(url.searchParams.get('utm_medium')).toBe('social');
			expect(url.searchParams.get('utm_campaign')).toBe('asset_share');
			expect(url.searchParams.get('utm_content')).toBe('asset_eur-wr');
		});

		it('should create trackable URL for email', () => {
			const originalUrl = 'https://example.com/assets/eur-wr';
			const result = createTrackableURL(originalUrl, 'email', 'eur-wr');
			
			const url = new URL(result);
			expect(url.searchParams.get('utm_source')).toBe('email_share');
			expect(url.searchParams.get('utm_medium')).toBe('email');
		});

		it('should handle null asset ID', () => {
			const originalUrl = 'https://example.com/assets/eur-wr';
			const result = createTrackableURL(originalUrl, 'twitter', null);
			
			const url = new URL(result);
			expect(url.searchParams.get('utm_source')).toBe('twitter');
			expect(url.searchParams.get('utm_content')).toBeNull();
		});
	});

	describe('extractAssetIdFromURL', () => {
		it('should extract asset ID from URL', () => {
			const url = 'https://example.com/assets/eur-wr';
			const result = extractAssetIdFromURL(url);
			expect(result).toBe('eur-wr');
		});

		it('should return null for URLs without asset ID', () => {
			const url = 'https://example.com/about';
			const result = extractAssetIdFromURL(url);
			expect(result).toBeNull();
		});

		it('should handle URLs with additional path segments', () => {
			const url = 'https://example.com/assets/eur-wr/overview';
			const result = extractAssetIdFromURL(url);
			expect(result).toBe('eur-wr');
		});

		it('should handle invalid URLs', () => {
			const url = 'not-a-valid-url';
			const result = extractAssetIdFromURL(url);
			expect(result).toBeNull();
		});
	});

	describe('SHARING_UTM_CONFIGS', () => {
		it('should have correct configurations for all platforms', () => {
			expect(SHARING_UTM_CONFIGS.twitter).toEqual({
				source: 'twitter',
				medium: 'social',
				campaign: 'asset_share'
			});

			expect(SHARING_UTM_CONFIGS.email).toEqual({
				source: 'email_share',
				medium: 'email',
				campaign: 'asset_share'
			});

			expect(SHARING_UTM_CONFIGS.mobile).toEqual({
				source: 'native_share',
				medium: 'mobile',
				campaign: 'asset_share'
			});
		});
	});
});