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
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);
  const encodedTitle = encodeURIComponent(title);

  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedText}%0D%0A%0D%0A${encodedUrl}`,
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
    console.warn("Web Share API failed:", error);
    return false;
  }
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
