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
		const tokens = dataStoreService.getTokensByAssetId(asset.id).filter(token => token.tokenType === 'royalty');
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

<main class="assets-page">
	<header class="page-header">
		<h1>Available Assets</h1>
		<p>Discover tokenized oil field investments</p>
	</header>

	{#if loading}
		<div class="loading-state">
			<p>Loading assets...</p>
		</div>
	{:else}

		<!-- Assets Display -->
		{#if filteredAssets.length === 0 && !showSoldOutAssets}
			<div class="empty-state">
				<h3>No Available Assets</h3>
				<p>All assets are currently sold out.</p>
			</div>
		{:else if filteredAssets.length === 0}
			<div class="empty-state">
				<h3>No Assets Found</h3>
				<p>Try adjusting your search criteria or filters to find assets.</p>
			</div>
		{:else}
			<div class="assets-grid">
				{#each filteredAssets as asset}
					<AssetCard {asset} on:buyTokens={handleBuyTokens} />
				{/each}
			</div>
		{/if}
		
		<!-- View Previous Assets Button -->
		{#if soldOutCount > 0 && !showSoldOutAssets}
			<div class="view-previous-section">
				<SecondaryButton on:click={() => showSoldOutAssets = true}>
					View Sold Out Assets ({soldOutCount})
				</SecondaryButton>
			</div>
		{:else if showSoldOutAssets && soldOutCount > 0}
			<div class="view-previous-section">
				<SecondaryButton on:click={() => showSoldOutAssets = false}>
					Hide Sold Out Assets
				</SecondaryButton>
			</div>
		{/if}
	{/if}
</main>

<style>
	.assets-page {
		padding: 4rem 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.page-header {
		text-align: center;
		margin-bottom: 4rem;
	}

	.page-header h1 {
		font-size: 3rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 1rem;
		color: var(--color-black);
	}

	.page-header p {
		font-size: 1.25rem;
		color: var(--color-black);
	}

	.loading-state {
		text-align: center;
		padding: 4rem 2rem;
		color: var(--color-black);
	}


	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		border: 1px solid var(--color-light-gray);
		background: var(--color-white);
	}

	.empty-state h3 {
		font-size: 1.5rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 1rem;
		color: var(--color-black);
	}

	.empty-state p {
		margin-bottom: 2rem;
		color: var(--color-black);
	}

	.assets-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: 2rem;
	}

	.view-previous-section {
		text-align: center;
		margin-top: 3rem;
		padding: 2rem 0;
	}


	@media (max-width: 768px) {
		.assets-page {
			padding: 2rem 1rem;
		}

		.page-header h1 {
			font-size: 2rem;
		}

		.assets-grid {
			grid-template-columns: 1fr;
		}
	}
</style>

<!-- Token Purchase Widget -->
<TokenPurchaseWidget 
	bind:isOpen={showPurchaseWidget}
	assetId={selectedAssetId}
	on:purchaseSuccess={handlePurchaseSuccess}
	on:close={handleWidgetClose}
/>