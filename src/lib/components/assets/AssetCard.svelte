<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import type { Asset } from '$lib/types/dataStore';
	import dataStoreService from '$lib/services/DataStoreService';
	import { Card, CardImage, CardContent, CardActions, PrimaryButton, SecondaryButton } from '$lib/components/ui';
	import { getAssetCoverImage } from '$lib/utils/assetImages';

	export let asset: Asset;
	
	const dispatch = createEventDispatcher();
	
	// Scroll state management
	let scrollContainer: HTMLDivElement;
	let canScrollUp = false;
	let canScrollDown = false;
	
	function checkScrollPosition() {
		if (!scrollContainer) return;
		
		const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
		
		// Check if we can scroll up (not at top)
		canScrollUp = scrollTop > 0;
		
		// Check if we can scroll down (not at bottom)
		// Adding a small threshold (2px) to account for rounding errors
		canScrollDown = scrollTop + clientHeight < scrollHeight - 2;
	}
	
	function handleScroll() {
		checkScrollPosition();
	}
	
	onMount(() => {
		// Initial check after a small delay to ensure DOM is ready
		setTimeout(checkScrollPosition, 100);
	});
	
	// Re-check scroll position when available tokens change
	$: if (scrollContainer && hasAvailableTokens) {
		// Use requestAnimationFrame to ensure DOM is updated
		requestAnimationFrame(() => {
			checkScrollPosition();
		});
	}

	// Use asset data directly from the data store
	$: latestReport = asset.monthlyReports[asset.monthlyReports.length - 1] || null;

	// Get the primary token for this asset (first active token found)
	$: assetTokens = dataStoreService.getTokensByAssetId(asset.id);
	$: primaryToken = assetTokens.length > 0 ? assetTokens[0] : null;
	
	// Check if any tokens are available
	$: hasAvailableTokens = assetTokens.some(token => {
		const supply = dataStoreService.getTokenSupply(token.contractAddress);
		return supply && supply.availableSupply > 0;
	});

	// Extract token data with fallbacks
	$: shareOfAsset = primaryToken?.sharePercentage ? `${primaryToken.sharePercentage}%` : 'TBD';

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	function formatNumber(num: number): string {
		return new Intl.NumberFormat('en-US').format(Math.round(num));
	}

	function formatEndDate(dateStr: string): string {
		if (!dateStr) return 'TBD';
		const [year, month] = dateStr.split('-');
		const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
							 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		return `${monthNames[parseInt(month) - 1]} ${year}`;
	}

	function getAssetImage(asset: Asset): string {
		return getAssetCoverImage(asset.id);
	}
	
	function handleBuyTokens() {
		dispatch('buyTokens', { assetId: asset.id });
	}
	
	// Tailwind class mappings
	$: highlightedStatsClasses = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-4 p-4 bg-white rounded-lg';
	$: highlightStatClasses = 'flex flex-col items-center text-center';
	$: highlightValueClasses = 'text-2xl font-extrabold text-secondary mb-1 font-figtree';
	$: highlightLabelClasses = 'text-sm text-gray-500 font-medium font-figtree';
	$: headerClasses = 'mb-4';
	$: headerMainClasses = 'flex justify-between items-start gap-4';
	$: nameLocationClasses = 'flex-1';
	$: operatorClasses = 'flex flex-col items-end text-right';
	$: operatorLabelClasses = 'text-sm text-gray-500 font-medium mb-1 font-figtree';
	$: operatorNameClasses = 'text-base text-black font-extrabold font-figtree';
	$: assetNameClasses = 'text-lg font-extrabold text-black m-0 mb-2 min-h-[3.125rem] leading-tight flex items-start font-figtree';
	$: assetLocationClasses = 'text-gray-500 text-base m-0 font-figtree';
	$: assetDescriptionClasses = 'text-gray-700 text-base leading-relaxed m-0 mb-6 line-clamp-3 min-h-[4.5rem] font-figtree';
	$: viewDetailsSectionClasses = 'mt-6 mb-6';
	$: tokensSectionClasses = 'my-6';
	$: tokensTitleClasses = 'text-lg font-extrabold text-black m-0 mb-4 font-figtree';
	$: tokensListClasses = 'flex flex-col gap-3';
	$: tokensListScrollableClasses = 'flex flex-col gap-3 max-h-[13rem] overflow-y-auto pr-2 relative';
	$: tokenButtonClasses = 'flex justify-between items-center w-full p-4 bg-white rounded-none cursor-pointer transition-all duration-200 text-left relative hover:bg-light-gray border border-light-gray hover:shadow-sm hover:-translate-y-0.5';
	$: tokenButtonLeftClasses = 'flex flex-col gap-1';
	$: tokenButtonRightClasses = 'flex flex-col items-end gap-2';
	$: tokenSymbolClasses = 'font-extrabold text-base text-black font-figtree';
	$: tokenNameClasses = 'text-sm text-gray-500 leading-tight font-figtree';
	$: tokenPaymentDateClasses = 'text-xs text-secondary font-medium mt-1';
	$: returnsDisplayClasses = 'flex items-center gap-2';
	$: returnItemClasses = 'flex flex-col items-center text-center';
	$: returnLabelClasses = 'text-xs text-gray-500 font-medium';
	$: returnValueClasses = 'text-lg text-primary font-extrabold font-figtree';
	$: returnValueBonusClasses = 'text-lg text-primary font-extrabold font-figtree';
	$: returnDividerClasses = 'text-sm text-gray-500 font-medium mx-1';
	$: buyCtaClasses = 'text-base font-extrabold text-black font-figtree';
	
	// Mobile responsive classes using Tailwind
	$: mobileHighlightedStatsClasses = 'grid grid-cols-3 gap-1 md:gap-3 my-3 md:my-4 p-3 md:p-4 bg-white rounded-lg';
	$: mobileHighlightValueClasses = 'text-xl md:text-2xl font-extrabold text-secondary mb-1 font-figtree';
	$: mobileHighlightLabelClasses = 'text-xs md:text-sm text-gray-500 font-medium font-figtree';
	$: mobileAssetNameClasses = 'text-base md:text-lg font-extrabold text-black m-0 mb-2 min-h-[2.75rem] md:min-h-[3.125rem] leading-tight flex items-start font-figtree';
	$: mobileAssetDescriptionClasses = 'text-gray-700 text-sm md:text-base leading-relaxed m-0 mb-4 md:mb-6 line-clamp-3 h-[4rem] md:h-[4.5rem] font-figtree';
	$: mobileTokensTitleClasses = 'text-base md:text-lg font-extrabold text-black m-0 mb-4 font-figtree';
	$: mobileTokenButtonClasses = 'flex flex-col sm:flex-row justify-between items-start sm:items-center w-full p-3 md:p-4 bg-white rounded-none cursor-pointer transition-all duration-200 text-left relative hover:bg-light-gray border border-light-gray hover:shadow-sm hover:-translate-y-0.5 gap-3 sm:gap-0';
	$: mobileTokenButtonRightClasses = 'flex flex-row sm:flex-col w-full sm:w-auto justify-between sm:justify-end items-center sm:items-end gap-2';
	$: mobileTokenSymbolClasses = 'font-extrabold text-sm md:text-base text-black font-figtree';
	$: mobileTokenNameClasses = 'text-xs md:text-sm text-gray-500 leading-tight font-figtree';
	$: mobileTokenPaymentDateClasses = 'text-[0.65rem] md:text-xs text-secondary font-medium mt-1';
	$: mobileReturnsDisplayClasses = 'flex items-center gap-1 md:gap-2';
	$: mobileReturnValueClasses = 'text-sm md:text-lg text-primary font-extrabold font-figtree';
	$: mobileReturnValueBonusClasses = 'text-sm md:text-lg text-primary font-extrabold font-figtree';
	$: mobileReturnLabelClasses = 'text-[0.55rem] md:text-xs text-gray-500 font-medium';
	$: mobileBuyCtaClasses = 'text-sm md:text-base font-extrabold text-black font-figtree';
	$: smallMobileHeaderMainClasses = 'flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4';
	$: smallMobileOperatorClasses = 'flex flex-col items-start sm:items-end text-left sm:text-right';

</script>

<Card hoverable clickable heightClass="h-full flex flex-col" on:click={() => window.location.href = `/assets/${asset.id}`}>
	<CardImage src={getAssetImage(asset)} alt={asset.name} zoomOnHover />
	
	<CardContent paddingClass="p-8 flex-1 flex flex-col">
		<header class={headerClasses}>
			<div class={smallMobileHeaderMainClasses}>
				<div class={nameLocationClasses}>
					<h3 class={mobileAssetNameClasses}>{asset.name}</h3>
					<p class={assetLocationClasses}>{asset.location.state}, {asset.location.country}</p>
				</div>
				<div class={smallMobileOperatorClasses}>
					<span class={operatorLabelClasses}>Operator</span>
					<span class={operatorNameClasses}>{asset.operator.name}</span>
				</div>
			</div>
		</header>
		
		<!-- Highlighted Big Stats -->
		<div class={mobileHighlightedStatsClasses}>
			<div class={highlightStatClasses}>
				<span class={mobileHighlightValueClasses}>{dataStoreService.getCalculatedRemainingProduction(asset.id)}</span>
				<span class={mobileHighlightLabelClasses}>Exp. Remaining</span>
			</div>
			<div class={highlightStatClasses}>
				<span class={mobileHighlightValueClasses}>{formatEndDate(asset.technical.expectedEndDate)}</span>
				<span class={mobileHighlightLabelClasses}>End Date</span>
			</div>
			{#if latestReport}
				<div class={highlightStatClasses}>
					<span class={mobileHighlightValueClasses}>{formatCurrency(latestReport.netIncome)}</span>
					<span class={mobileHighlightLabelClasses}>Last Payment</span>
				</div>
			{/if}
		</div>
		
		<p class={mobileAssetDescriptionClasses}>{asset.description}</p>
		
		<div>
			<!-- View Details Button -->
			<div class={viewDetailsSectionClasses}>
				<PrimaryButton href="/assets/{asset.id}" fullWidth on:click={(e) => e.stopPropagation()}>
					{hasAvailableTokens ? 'View details and buy tokens' : 'View details'}
				</PrimaryButton>
			</div>

			<!-- Available Tokens Section -->
			{#if hasAvailableTokens}
			{@const availableTokens = assetTokens.filter(token => {
				const supply = dataStoreService.getTokenSupply(token.contractAddress);
				return supply && supply.availableSupply > 0;
			})}
			<div class={tokensSectionClasses}>
				<h4 class={mobileTokensTitleClasses}>Available Token Releases</h4>
				<div class="relative">
					<div 
						bind:this={scrollContainer}
						on:scroll={handleScroll}
						class="{availableTokens.length > 2 ? tokensListScrollableClasses : tokensListClasses} scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
						{#each availableTokens as token}
						{@const calculatedReturns = dataStoreService.getCalculatedTokenReturns(token.contractAddress)}
						{@const baseReturn = calculatedReturns?.baseReturn ? Math.round(calculatedReturns.baseReturn) : 0}
						{@const bonusReturn = calculatedReturns?.bonusReturn ? Math.round(calculatedReturns.bonusReturn) : 0}
						{@const firstPaymentMonth = token.firstPaymentDate || 'TBD'}
						<button 
							class={mobileTokenButtonClasses} 
							on:click|stopPropagation={() => handleBuyTokens()}
						>
							<div class={tokenButtonLeftClasses}>
								<span class={mobileTokenSymbolClasses}>{token.symbol}</span>
								<span class={mobileTokenNameClasses}>{token.name}</span>
								<span class={mobileTokenPaymentDateClasses}>First payment: {firstPaymentMonth}</span>
							</div>
							<div class={mobileTokenButtonRightClasses}>
								<div class={mobileReturnsDisplayClasses}>
									<div class={returnItemClasses}>
										<span class={mobileReturnLabelClasses}>Est. Base</span>
										<span class={mobileReturnValueClasses}>{baseReturn}%</span>
									</div>
									<div class={returnDividerClasses}>+</div>
									<div class={returnItemClasses}>
										<span class={mobileReturnLabelClasses}>Est. Bonus</span>
										<span class={mobileReturnValueBonusClasses}>{bonusReturn}%</span>
									</div>
								</div>
								<span class={mobileBuyCtaClasses}>Buy Now →</span>
							</div>
						</button>
					{/each}
					</div>
					{#if availableTokens.length > 2}
						<!-- Scroll indicators -->
						{#if canScrollUp}
							<div class="absolute top-0 left-0 right-0 h-8 bg-white border-b border-light-gray pointer-events-none flex items-center justify-center">
								<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
								</svg>
							</div>
						{/if}
						
						{#if canScrollDown}
							<div class="absolute bottom-0 left-0 right-0 h-8 bg-white border-t border-light-gray pointer-events-none flex items-center justify-center">
								<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
								</svg>
							</div>
						{/if}
					{/if}
				</div>
			</div>
		{/if}
		</div>
		
	</CardContent>
</Card>

