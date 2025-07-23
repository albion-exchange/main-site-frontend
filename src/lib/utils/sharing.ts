import { createTrackableURL, extractAssetIdFromURL, trackShareEvent, type ShareTrackingEvent } from './tracking';

export interface ShareData {
	title: string;
	text: string;
	url: string;
}

export function getShareText(assetName: string): string {
	return `Unlock fractional ownership in a real-world oil field with this tokenized RWA asset: ${assetName}`;
}

export function getShareUrls(shareData: ShareData) {
	const { title, text, url } = shareData;
	const assetId = extractAssetIdFromURL(url);
	
	// Add UTM parameters for each sharing platform
	const twitterUrl = createTrackableURL(url, 'twitter', assetId);
	const linkedinUrl = createTrackableURL(url, 'linkedin', assetId);
	const telegramUrl = createTrackableURL(url, 'telegram', assetId);
	const whatsappUrl = createTrackableURL(url, 'whatsapp', assetId);
	const emailUrl = createTrackableURL(url, 'email', assetId);

	const encodedTwitterUrl = encodeURIComponent(twitterUrl);
	const encodedLinkedinUrl = encodeURIComponent(linkedinUrl);
	const encodedTelegramUrl = encodeURIComponent(telegramUrl);
	const encodedWhatsappUrl = encodeURIComponent(whatsappUrl);
	const encodedEmailUrl = encodeURIComponent(emailUrl);
	
	const encodedText = encodeURIComponent(text);
	const encodedTitle = encodeURIComponent(title);

	return {
		twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedTwitterUrl}`,
		linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLinkedinUrl}`,
		telegram: `https://t.me/share/url?url=${encodedTelegramUrl}&text=${encodedText}`,
		whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedWhatsappUrl}`,
		email: `mailto:?subject=${encodedTitle}&body=${encodedText}%0D%0A%0D%0A${encodedEmailUrl}`,
	};
}

export async function shareViaWebAPI(shareData: ShareData): Promise<boolean> {
	if (!navigator.share) {
		return false;
	}

	try {
		const assetId = extractAssetIdFromURL(shareData.url);
		
		// For mobile native sharing, we'll add UTM parameters to track as mobile share
		const mobileShareData = {
			...shareData,
			url: createTrackableURL(shareData.url, 'mobile', assetId)
		};
		
		// Track the share event
		trackShareEvent({
			action: 'share_clicked',
			platform: 'mobile',
			asset_id: assetId,
			url: mobileShareData.url,
			timestamp: new Date()
		});
		
		await navigator.share(mobileShareData);
		
		// Track successful share
		trackShareEvent({
			action: 'share_completed',
			platform: 'mobile',
			asset_id: assetId,
			url: mobileShareData.url,
			timestamp: new Date()
		});
		
		return true;
	} catch (error) {
		// User cancelled or error occurred
		console.warn('Web Share API failed:', error);
		return false;
	}
}

export function copyToClipboard(text: string): Promise<void> {
	return navigator.clipboard.writeText(text);
}
