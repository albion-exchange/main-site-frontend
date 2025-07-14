<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Asset } from '$lib/types/dataStore';
	import dataStoreService from '$lib/services/DataStoreService';
	import { Card, CardImage, CardContent, CardActions, PrimaryButton, SecondaryButton } from '$lib/components/ui';
	import { getAssetCoverImage } from '$lib/utils/assetImages';

	export let asset: Asset;
	
	const dispatch = createEventDispatcher();

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
	$: highlightValueClasses = 'text-xl font-bold text-secondary mb-1';
	$: highlightLabelClasses = 'text-xs text-gray-500 uppercase font-medium tracking-wider';
	$: headerClasses = 'mb-4';
	$: headerMainClasses = 'flex justify-between items-start gap-4';
	$: nameLocationClasses = 'flex-1';
	$: operatorClasses = 'flex flex-col items-end text-right';
	$: operatorLabelClasses = 'text-xs text-gray-500 uppercase font-medium tracking-wider mb-1';
	$: operatorNameClasses = 'text-sm text-black font-semibold';
	$: assetNameClasses = 'text-xl font-semibold text-black m-0 mb-2 min-h-[3.125rem] leading-tight flex items-start';
	$: assetLocationClasses = 'text-gray-500 text-sm m-0';
	$: assetDescriptionClasses = 'text-gray-700 text-sm leading-relaxed m-0 mb-6 line-clamp-3';
	$: viewDetailsSectionClasses = 'my-6';
	$: tokensSectionClasses = 'my-6';
	$: tokensTitleClasses = 'text-base font-semibold text-black m-0 mb-4 uppercase tracking-wider';
	$: tokensListClasses = 'flex flex-col gap-3';
	$: tokensListScrollableClasses = 'flex flex-col gap-3 max-h-[13rem] overflow-y-auto pr-2 relative';
	$: tokenButtonClasses = 'flex justify-between items-center w-full p-4 bg-white rounded-none cursor-pointer transition-all duration-200 text-left relative hover:bg-gray-50';
	$: tokenButtonLeftClasses = 'flex flex-col gap-1';
	$: tokenButtonRightClasses = 'flex flex-col items-end gap-2';
	$: tokenSymbolClasses = 'font-bold text-sm text-black uppercase';
	$: tokenNameClasses = 'text-xs text-gray-500 leading-tight';
	$: tokenPaymentDateClasses = 'text-xs text-secondary font-medium mt-1';
	$: returnsDisplayClasses = 'flex items-center gap-2';
	$: returnItemClasses = 'flex flex-col items-center text-center';
	$: returnLabelClasses = 'text-xs text-gray-500 uppercase font-medium tracking-wider';
	$: returnValueClasses = 'text-base text-primary font-bold';
	$: returnValueBonusClasses = 'text-base text-primary font-bold';
	$: returnDividerClasses = 'text-sm text-gray-500 font-medium mx-1';
	$: buyCtaClasses = 'text-sm font-bold text-black uppercase tracking-wider';
	
	// Mobile responsive classes
	$: mobileHighlightedStatsClasses = 'grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 my-3 md:my-4 p-3 md:p-4 bg-white rounded-lg';
	$: mobileHighlightValueClasses = 'text-lg md:text-xl font-bold text-secondary mb-1';
	$: mobileHighlightLabelClasses = 'text-[0.7rem] md:text-xs text-gray-500 uppercase font-medium tracking-wider';
	$: mobileAssetNameClasses = 'text-lg md:text-xl font-semibold text-black m-0 mb-2 min-h-[2.75rem] md:min-h-[3.125rem] leading-tight flex items-start';
	$: mobileAssetDescriptionClasses = 'text-gray-700 text-xs md:text-sm leading-relaxed m-0 mb-4 md:mb-6 line-clamp-3';
	$: mobileTokensTitleClasses = 'text-sm md:text-base font-semibold text-black m-0 mb-4 uppercase tracking-wider';
	$: mobileTokenButtonClasses = 'flex flex-col sm:flex-row justify-between items-start sm:items-center w-full p-3 md:p-4 bg-white rounded-none cursor-pointer transition-all duration-200 text-left relative hover:bg-gray-50 gap-3 sm:gap-0';
	$: mobileTokenButtonRightClasses = 'flex flex-row sm:flex-col w-full sm:w-auto justify-between sm:justify-end items-center sm:items-end gap-2';
	$: mobileTokenSymbolClasses = 'font-bold text-xs md:text-sm text-black uppercase';
	$: mobileTokenNameClasses = 'text-[0.7rem] md:text-xs text-gray-500 leading-tight';
	$: mobileTokenPaymentDateClasses = 'text-[0.65rem] md:text-xs text-secondary font-medium mt-1';
	$: mobileReturnsDisplayClasses = 'flex items-center gap-1 md:gap-2';
	$: mobileReturnValueClasses = 'text-xs md:text-base text-primary font-bold';
	$: mobileReturnValueBonusClasses = 'text-xs md:text-base text-primary font-bold';
	$: mobileReturnLabelClasses = 'text-[0.55rem] md:text-xs text-gray-500 uppercase font-medium tracking-wider';
	$: mobileBuyCtaClasses = 'text-xs md:text-sm font-bold text-black uppercase tracking-wider';
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
				<span class={mobileHighlightLabelClasses}>Expected Remaining</span>
			</div>
			<div class={highlightStatClasses}>
				<span class={mobileHighlightValueClasses}>{formatEndDate(asset.technical.expectedEndDate)}</span>
				<span class={mobileHighlightLabelClasses}>Expected End Date</span>
			</div>
			{#if latestReport}
				<div class={highlightStatClasses}>
					<span class={mobileHighlightValueClasses}>{formatCurrency(latestReport.netIncome)}</span>
					<span class={mobileHighlightLabelClasses}>Latest Payment</span>
				</div>
			{/if}
		</div>
		
		<p class={mobileAssetDescriptionClasses}>{asset.description}</p>
		
		<div class="flex-grow"></div>
		
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
					<div class="{availableTokens.length > 2 ? tokensListScrollableClasses : tokensListClasses} scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
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
						<div class="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white via-white to-transparent pointer-events-none flex items-end justify-center pb-1">
							<svg class="w-5 h-5 text-gray-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
							</svg>
						</div>
					{/if}
				</div>
			</div>
		{/if}
		</div>
		
	</CardContent>
</Card>

