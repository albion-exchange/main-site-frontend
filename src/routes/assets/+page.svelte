<script lang="ts">
	import { onMount } from 'svelte';
	import dataStoreService from '$lib/services/DataStoreService';
	import type { Asset } from '$lib/types/dataStore';
	import AssetCard from '$lib/components/assets/AssetCard.svelte';
	import TokenPurchaseWidget from '$lib/components/TokenPurchaseWidget.svelte';
	import { SecondaryButton } from '$lib/components/ui';

	let viewMode = 'grid';
	let loading = true;
	let allAssets: Asset[] = [];
	let showSoldOutAssets = false;
	
	// Token purchase widget state
	let showPurchaseWidget = false;
	let selectedAssetId: string | null = null;

	onMount(async () => {
		try {
			// Load assets from data store
			allAssets = dataStoreService.getAllAssets();
			loading = false;
		} catch (error) {
			console.error('Error loading assets:', error);
			loading = false;
		}
	});

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(amount);
	}

	// Check if an asset has available tokens
	function hasAvailableTokens(asset: Asset): boolean {
		const tokens = dataStoreService.getTokensByAssetId(asset.id);
		return tokens.some(token => {
			const supply = dataStoreService.getTokenSupply(token.contractAddress);
			return supply && supply.availableSupply > 0;
		});
	}
	
	// Filter assets based on availability
	$: filteredAssets = showSoldOutAssets 
		? allAssets 
		: allAssets.filter(asset => hasAvailableTokens(asset));
	
	// Count sold out assets
	$: soldOutCount = allAssets.filter(asset => !hasAvailableTokens(asset)).length;
	
	function handleBuyTokens(event: CustomEvent) {
		selectedAssetId = event.detail.assetId;
		showPurchaseWidget = true;
	}
	
	function handlePurchaseSuccess(event: CustomEvent) {
		console.log('Purchase successful:', event.detail);
		showPurchaseWidget = false;
	}
	
	function handleWidgetClose() {
		showPurchaseWidget = false;
		selectedAssetId = null;
	}
	
	// Tailwind class mappings
	$: pageClasses = 'py-16 px-8 max-w-6xl mx-auto';
	$: headerClasses = 'text-center mb-16';
	$: mainTitleClasses = 'text-5xl font-extrabold mb-4 text-black';
	$: subtitleClasses = 'text-xl text-black';
	$: loadingStateClasses = 'text-center py-16 px-8 text-black';
	$: emptyStateClasses = 'text-center py-16 px-8 border border-light-gray bg-white';
	$: emptyTitleClasses = 'text-2xl font-extrabold mb-4 text-black';
	$: emptyDescriptionClasses = 'mb-8 text-black';
	$: assetsGridClasses = 'grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-8';
	$: viewPreviousSectionClasses = 'text-center mt-12 py-8';
	
	// Mobile responsive classes
	$: mobilePageClasses = 'md:py-16 py-8 md:px-8 px-4 max-w-6xl mx-auto';
	$: mobileHeaderClasses = 'text-center md:mb-16 mb-8';
	$: mobileTitleClasses = 'md:text-5xl text-3xl font-extrabold md:mb-4 mb-3 text-black';
	$: mobileSubtitleClasses = 'md:text-xl text-base text-black';
	$: mobileAssetsGridClasses = 'grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] md:gap-8 gap-6';
	$: mobileLoadingStateClasses = 'text-center md:py-16 py-8 md:px-8 px-4 text-black';
	$: mobileEmptyStateClasses = 'text-center md:py-16 py-8 md:px-8 px-4 border border-light-gray bg-white';
	$: mobileViewPreviousSectionClasses = 'text-center md:mt-12 mt-8 md:py-8 py-6';
	$: smallMobilePageClasses = 'sm:py-8 py-6 sm:px-4 px-3 max-w-6xl mx-auto';
	$: smallMobileTitleClasses = 'sm:text-3xl text-[1.75rem] font-extrabold md:mb-4 mb-3 text-black';
	$: smallMobileAssetsGridClasses = 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 sm:gap-6 gap-4';
</script>

<svelte:head>
	<title>Assets - Albion</title>
	<meta name="description" content="Browse available oil field assets for investment" />
</svelte:head>

<main class={smallMobilePageClasses}>
	<header class={mobileHeaderClasses}>
		<h1 class={smallMobileTitleClasses}>Available Assets</h1>
		<p class={mobileSubtitleClasses}>Discover tokenized oil field investments</p>
	</header>

	{#if loading}
		<div class={mobileLoadingStateClasses}>
			<p>Loading assets...</p>
		</div>
	{:else}

		<!-- Assets Display -->
		{#if filteredAssets.length === 0 && !showSoldOutAssets}
			<div class={mobileEmptyStateClasses}>
				<h3 class={emptyTitleClasses}>No Available Assets</h3>
				<p class={emptyDescriptionClasses}>All assets are currently sold out.</p>
			</div>
		{:else if filteredAssets.length === 0}
			<div class={mobileEmptyStateClasses}>
				<h3 class={emptyTitleClasses}>No Assets Found</h3>
				<p class={emptyDescriptionClasses}>Try adjusting your search criteria or filters to find assets.</p>
			</div>
		{:else}
			<div class={smallMobileAssetsGridClasses}>
				{#each filteredAssets as asset}
					<AssetCard {asset} on:buyTokens={handleBuyTokens} />
				{/each}
			</div>
		{/if}
		
		<!-- View Previous Assets Button -->
		{#if soldOutCount > 0 && !showSoldOutAssets}
			<div class={mobileViewPreviousSectionClasses}>
				<SecondaryButton on:click={() => showSoldOutAssets = true}>
					View Sold Out Assets ({soldOutCount})
				</SecondaryButton>
			</div>
		{:else if showSoldOutAssets && soldOutCount > 0}
			<div class={mobileViewPreviousSectionClasses}>
				<SecondaryButton on:click={() => showSoldOutAssets = false}>
					Hide Sold Out Assets
				</SecondaryButton>
			</div>
		{/if}
	{/if}
</main>


<!-- Token Purchase Widget -->
<TokenPurchaseWidget 
	bind:isOpen={showPurchaseWidget}
	assetId={selectedAssetId}
	on:purchaseSuccess={handlePurchaseSuccess}
	on:close={handleWidgetClose}
/>