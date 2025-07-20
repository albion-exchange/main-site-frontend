<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import type { Asset } from '$lib/types/uiTypes';
	import { useTokenService } from '$lib/services';
	import { Card, CardImage, CardContent, CardActions, PrimaryButton, SecondaryButton } from '$lib/components/components';
	import { formatCurrency, formatEndDate } from '$lib/utils/formatters';

	export let asset: Asset;
	
	const dispatch = createEventDispatcher();
	const tokenService = useTokenService();
	
	// Use asset data directly from the data store
	$: latestReport = asset.monthlyReports[asset.monthlyReports.length - 1] || null;

	// Get the primary token for this asset (first active token found)
	$: assetTokens = tokenService.getTokensByAssetId(asset.id);
	$: primaryToken = assetTokens.length > 0 ? assetTokens[0] : null;
	
	// Check if any tokens are available
	$: hasAvailableTokens = assetTokens.some(token => {
		const supply = tokenService.getTokenSupply(token.contractAddress);
		return supply && supply.available > 0;
	});

	// Extract token data with fallbacks
	$: shareOfAsset = primaryToken?.sharePercentage ? `${primaryToken.sharePercentage}%` : 'TBD';
	
	function handleBuyTokens() {
		dispatch('buyTokens', { assetId: asset.id });
	}
	
	// Mobile-optimized class mappings
	$: headerClasses = 'mb-4';
	$: headerMainClasses = 'flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4';
	$: nameLocationClasses = 'flex-1';
	$: operatorClasses = 'flex flex-col items-start sm:items-end text-left sm:text-right';
	$: operatorLabelClasses = 'text-xs sm:text-sm text-gray-500 font-medium mb-1 font-figtree';
	$: operatorNameClasses = 'text-sm sm:text-base text-black font-extrabold font-figtree';
	$: assetNameClasses = 'text-base sm:text-lg lg:text-xl font-extrabold text-black m-0 mb-2 leading-tight text-left font-figtree';
	$: assetLocationClasses = 'text-gray-500 text-sm sm:text-base m-0 text-left font-figtree';
	$: assetDescriptionClasses = 'text-gray-700 text-sm leading-relaxed m-0 mb-4 line-clamp-2 font-figtree lg:line-clamp-3 lg:text-base lg:mb-6';
	$: highlightedStatsClasses = 'grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 my-3 lg:my-4 p-3 lg:p-4 bg-white rounded-lg';
	$: highlightStatClasses = 'flex flex-col items-center text-center';
	$: highlightValueClasses = 'text-lg sm:text-xl lg:text-2xl font-extrabold text-secondary mb-1 font-figtree';
	$: highlightLabelClasses = 'text-xs lg:text-sm text-gray-500 font-medium font-figtree';
	$: viewDetailsSectionClasses = 'mt-4 lg:mt-6';

</script>

<Card hoverable clickable heightClass="h-full flex flex-col" on:click={() => window.location.href = `/assets/${asset.id}`}>
	<CardImage src={asset.coverImage} alt={asset.name} zoomOnHover />
	
	<CardContent paddingClass="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col">
		<header class={headerClasses}>
			<div class={headerMainClasses}>
				<div class={nameLocationClasses}>
					<h3 class={assetNameClasses}>{asset.name}</h3>
					<p class={assetLocationClasses}>{asset.location.state}, {asset.location.country}</p>
				</div>
				<div class={operatorClasses}>
					<span class={operatorLabelClasses}>Operator</span>
					<span class={operatorNameClasses}>{asset.operator.name}</span>
				</div>
			</div>
		</header>
		
		<!-- Simplified Key Stats -->
		<div class={highlightedStatsClasses}>
			<div class={highlightStatClasses}>
				<span class={highlightValueClasses}>{asset.production?.expectedRemainingProduction || 'TBD'}</span>
				<span class={highlightLabelClasses}>Exp. Remaining</span>
			</div>
			{#if latestReport}
				<div class={highlightStatClasses}>
					<span class={highlightValueClasses}>{formatCurrency(latestReport.netIncome ?? 0, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
					<span class={highlightLabelClasses}>Last Payment</span>
				</div>
			{/if}
			<!-- Third stat only on larger screens -->
			<div class="hidden lg:flex lg:flex-col lg:items-center lg:text-center">
				<span class={highlightValueClasses}>{formatEndDate(asset.technical.expectedEndDate)}</span>
				<span class={highlightLabelClasses}>End Date</span>
			</div>
		</div>
		
		<!-- Simplified description -->
		<p class={assetDescriptionClasses}>{asset.description}</p>
		
		<!-- Action button - simplified messaging -->
		<div class={viewDetailsSectionClasses + ' mt-auto'}>
			<PrimaryButton href="/assets/{asset.id}" fullWidth on:click={(e) => e.stopPropagation()}>
				{hasAvailableTokens ? 'View & Buy Tokens' : 'View Details'}
			</PrimaryButton>
		</div>
	</CardContent>
</Card>

