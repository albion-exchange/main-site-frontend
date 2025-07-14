<script lang="ts">
	import { onMount } from 'svelte';
	import dataStoreService from '$lib/services/DataStoreService';
	import type { Asset } from '$lib/types/dataStore';
	import AssetCard from '$lib/components/assets/AssetCard.svelte';
	import TokenPurchaseWidget from '$lib/components/TokenPurchaseWidget.svelte';
	import { SecondaryButton, SectionTitle, Card, CardContent } from '$lib/components/ui';

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
</script>

<svelte:head>
	<title>Assets - Albion</title>
	<meta name="description" content="Browse available oil field assets for investment" />
</svelte:head>

<main class="max-w-6xl mx-auto">
	<!-- Header Section -->
	<section class="py-16 px-8 md:py-12 md:px-8 text-center">
		<SectionTitle level="h1" size="page">Available Assets</SectionTitle>
		<p class="text-2xl md:text-3xl text-black leading-relaxed mt-6 font-figtree">Discover tokenized oil field investments</p>
	</section>

	{#if loading}
		<!-- Loading State -->
		<div class="py-16 px-8 md:py-12 md:px-8 text-center">
			<p class="text-base text-black leading-relaxed">Loading assets...</p>
		</div>
	{:else}
		<!-- Assets Section -->
		<section class="py-16 px-8 md:py-12 md:px-8">
			{#if filteredAssets.length === 0 && !showSoldOutAssets}
				<!-- No Available Assets -->
				<Card>
					<CardContent>
						<div class="text-center">
							<SectionTitle level="h3" size="card">No Available Assets</SectionTitle>
							<p class="text-base text-black leading-relaxed mt-4">All assets are currently sold out.</p>
						</div>
					</CardContent>
				</Card>
			{:else if filteredAssets.length === 0}
				<!-- No Assets Found -->
				<Card>
					<CardContent>
						<div class="text-center">
							<SectionTitle level="h3" size="card">No Assets Found</SectionTitle>
							<p class="text-base text-black leading-relaxed mt-4">Try adjusting your search criteria or filters to find assets.</p>
						</div>
					</CardContent>
				</Card>
			{:else}
				<!-- Assets Grid -->
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
					{#each filteredAssets as asset}
						<AssetCard {asset} on:buyTokens={handleBuyTokens} />
					{/each}
				</div>
			{/if}
			
			<!-- View Sold Out Assets Toggle -->
			{#if soldOutCount > 0 && !showSoldOutAssets}
				<div class="text-center mt-12">
					<SecondaryButton on:click={() => showSoldOutAssets = true}>
						View Sold Out Assets ({soldOutCount})
					</SecondaryButton>
				</div>
			{:else if showSoldOutAssets && soldOutCount > 0}
				<div class="text-center mt-12">
					<SecondaryButton on:click={() => showSoldOutAssets = false}>
						Hide Sold Out Assets
					</SecondaryButton>
				</div>
			{/if}
		</section>
	{/if}
</main>


<!-- Token Purchase Widget -->
<TokenPurchaseWidget 
	bind:isOpen={showPurchaseWidget}
	assetId={selectedAssetId}
	on:purchaseSuccess={handlePurchaseSuccess}
	on:close={handleWidgetClose}
/>

<style>
	/* All styling handled by reusable components and utilities */
</style>