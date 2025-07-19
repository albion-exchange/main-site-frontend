<script lang="ts">
	import type { Asset } from '$lib/types/uiTypes';
	import { getImageUrl } from '$lib/utils/imagePath';
	import { formatCurrency } from '$lib/utils/formatters';
	import { StatsCard } from '$lib/components/components';

	export let asset: Asset;
	export let tokenCount: number = 0;
	export let onTokenSectionClick: (() => void) | undefined = undefined;

	function formatEndDate(dateStr: string): string {
		if (!dateStr || dateStr === 'undefined') return 'TBD';
		const parts = dateStr.split('-');
		if (parts.length < 2) return 'TBD';
		const [year, month] = parts;
		const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
						 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		const monthIndex = parseInt(month) - 1;
		if (monthIndex < 0 || monthIndex >= 12) return 'TBD';
		return `${monthNames[monthIndex]} ${year}`;
	}

	function getAssetImage(assetData: Asset | null): string {
		return assetData?.coverImage || '/images/eur-wr-cover.jpg';
	}
</script>

<!-- Breadcrumb -->
<div class="max-w-6xl mx-auto px-8">
	<nav class="mb-8 text-sm font-medium">
		<a href="/assets" class="text-secondary no-underline hover:text-black">← Back to Assets</a>
		<span class="mx-2 text-light-gray">/</span>
		<span class="text-black font-semibold">{asset?.name || 'Asset Details'}</span>
	</nav>
</div>

<!-- Asset Header -->
<div class="max-w-6xl mx-auto px-8">
	<div class="bg-white border border-light-gray section-no-border mb-8">
		<div class="py-12">
			<div class="mb-12">
				<div class="flex md:items-start items-center md:flex-row flex-col md:gap-8 gap-4 mb-8">
					<div class="w-16 h-16 rounded-lg overflow-hidden border border-light-gray">
						<img 
							src={getImageUrl(getAssetImage(asset))} 
							alt={asset?.name || 'Asset'}
							loading="lazy"
							class="w-full h-full object-cover"
						/>
					</div>
					<div class="flex-1">
						<div class="flex justify-between items-start gap-4 mb-4">
							<h1 class="typography-display text-black uppercase tracking-tight m-0">{asset?.name}</h1>
							<div class="flex flex-col items-end gap-2 flex-shrink-0">
								<div class="typography-label text-black">Share this investment:</div>
								<div class="flex gap-2">
									<button class="flex items-center justify-center w-8 h-8 bg-white border border-light-gray text-black cursor-pointer transition-all duration-200 rounded hover:bg-light-gray hover:border-secondary hover:text-secondary" title="Share asset on Twitter" aria-label="Share asset on Twitter" on:click={() => window.open(`https://twitter.com/intent/tweet?text=Check out this energy investment opportunity: ${asset?.name} on @Albion&url=${encodeURIComponent(window.location.href)}`, '_blank')}>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
											<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
										</svg>
									</button>
									<button class="flex items-center justify-center w-8 h-8 bg-white border border-light-gray text-black cursor-pointer transition-all duration-200 rounded hover:bg-light-gray hover:border-secondary hover:text-secondary" title="Share asset on LinkedIn" aria-label="Share asset on LinkedIn" on:click={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
											<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
										</svg>
									</button>
									<button class="flex items-center justify-center w-8 h-8 bg-white border border-light-gray text-black cursor-pointer transition-all duration-200 rounded hover:bg-light-gray hover:border-secondary hover:text-secondary" title="Share asset on Telegram" aria-label="Share asset on Telegram" on:click={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=Check out this energy investment opportunity: ${asset?.name}`, '_blank')}>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
											<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
										</svg>
									</button>
									<button class="flex items-center justify-center w-8 h-8 bg-white border border-light-gray text-black cursor-pointer transition-all duration-200 rounded hover:bg-light-gray hover:border-secondary hover:text-secondary" title="Share asset via email" aria-label="Share asset via email" on:click={() => window.open(`mailto:?subject=Investment Opportunity: ${asset?.name}&body=I thought you might be interested in this energy investment opportunity:%0D%0A%0D%0A${asset?.name}%0D%0A${window.location.href}%0D%0A%0D%0ACheck it out on Albion!`, '_blank')}>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
											<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
										</svg>
									</button>
									<button class="flex items-center justify-center w-8 h-8 bg-white border border-light-gray text-black cursor-pointer transition-all duration-200 rounded hover:bg-light-gray hover:border-secondary hover:text-secondary" title="Copy asset link" aria-label="Copy asset link" on:click={() => { navigator.clipboard.writeText(window.location.href); /* You could add a toast notification here */ }}>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
											<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
											<path d="m14 11-7.54.54-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
										</svg>
									</button>
								</div>
							</div>
						</div>
						<div class="flex items-center gap-4 mb-2">
							<span class="text-secondary font-medium text-sm">📍 {asset?.location?.state}, {asset?.location?.country}</span>
						</div>
						<div class="text-black opacity-70 text-sm">
							<span>Operated by {asset?.operator?.name}</span>
							<span>•</span>
							<span>License {asset?.technical?.license}</span>
						</div>
					</div>
				</div>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-8">
				<StatsCard
					title="Current Production"
					value={asset?.production?.current || '0'}
					subtitle="BOE/day"
					size="large"
				/>
				<StatsCard
					title="Last Monthly Revenue"
					value={asset?.monthlyReports?.[asset.monthlyReports.length - 1]?.netIncome 
						? formatCurrency(asset.monthlyReports[asset.monthlyReports.length - 1].netIncome)
						: '$0'}
					subtitle={asset?.monthlyReports?.[asset.monthlyReports.length - 1]?.month 
						? formatEndDate(asset.monthlyReports[asset.monthlyReports.length - 1].month + '-01')
						: 'N/A'}
					size="large"
					valueColor="primary"
				/>
				<div 
					class="cursor-pointer transition-all duration-200 rounded hover:-translate-y-1 hover:shadow-lg" 
					on:click={onTokenSectionClick} 
					on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTokenSectionClick?.(); } }} 
					role="button" 
					tabindex="0"
				>
					<StatsCard
						title="Available Tokens"
						value={tokenCount.toString()}
						subtitle="👆 Click to view tokens"
						size="large"
					/>
				</div>
			</div>
		</div>
	</div>
</div>