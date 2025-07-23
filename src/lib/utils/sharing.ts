export interface ShareData {
	title: string;
	text: string;
	url: string;
}

// ADD: helper to append common UTM parameters
export function addUtmParams(rawUrl: string, medium: string): string {
	try {
		const url = new URL(rawUrl, typeof window !== 'undefined' ? window.location.origin : undefined);
		url.searchParams.set('utm_medium', medium);
		url.searchParams.set('utm_source', medium);
		url.searchParams.set('utm_campaign', 'share');
		return url.toString();
	} catch {
		// Fallback for invalid URLs or environments without URL constructor support
		const separator = rawUrl.includes('?') ? '&' : '?';
		return `${rawUrl}${separator}utm_medium=${medium}&utm_source=${medium}&utm_campaign=share`;
	}
}

export function getShareText(assetName: string): string {
	return `Unlock fractional ownership in a real-world oil field with this tokenized RWA asset: ${assetName}`;
}

export function getShareUrls(shareData: ShareData) {
	const { title, text, url } = shareData;
	const encodedText = encodeURIComponent(text);
	const encodedTitle = encodeURIComponent(title);

	// Build encoded URLs with channel-specific UTM parameters
	const encodedWith = (medium: string) => encodeURIComponent(addUtmParams(url, medium));

	return {
		twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedWith('twitter')}`,
		linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedWith('linkedin')}`,
		telegram: `https://t.me/share/url?url=${encodedWith('telegram')}&text=${encodedText}`,
		whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedWith('whatsapp')}`,
		email: `mailto:?subject=${encodedTitle}&body=${encodedText}%0D%0A%0D%0A${encodedWith('email')}`,
	};
}

export async function shareViaWebAPI(shareData: ShareData): Promise<boolean> {
	if (!navigator.share) {
		return false;
	}

	try {
		await navigator.share(shareData);
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
