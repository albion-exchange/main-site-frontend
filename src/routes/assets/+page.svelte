<script lang="ts">
	import { onMount } from 'svelte';
	import dataStoreService from '$lib/services/DataStoreService';
	import type { Asset } from '$lib/types/dataStore';
	import AssetCard from '$lib/components/assets/AssetCard.svelte';
	import TokenPurchaseWidget from '$lib/components/TokenPurchaseWidget.svelte';

	let viewMode = 'grid';
	let loading = true;
	let allAssets: Asset[] = [];
	
	// Token purchase widget state
	let showPurchaseWidget = false;
	let selectedAssetId = null;

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

	// Return all assets without sorting
	$: filteredAssets = allAssets;
	
	function handleBuyTokens(event) {
		selectedAssetId = event.detail.assetId;
		showPurchaseWidget = true;
	}
	
	function handlePurchaseSuccess(event) {
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
		{#if filteredAssets.length === 0}
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

	/* Filter Section Styles */
	.filter-section {
		margin-bottom: 3rem;
		padding: 2rem;
		background: var(--color-light-gray);
	}

	.filter-controls {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.search-group {
		max-width: 100%;
	}

	.filter-row {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		align-items: flex-end;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-width: 150px;
		flex: 1;
	}

	.filter-control-label {
		font-size: 0.9rem;
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
	}

	.search-input {
		width: 100%;
		padding: 0.75rem 1rem;
		border: 1px solid var(--color-secondary);
		background: var(--color-white);
		font-family: var(--font-family);
		font-weight: var(--font-weight-medium);
		color: var(--color-black);
		transition: border-color 0.2s ease;
	}

	.search-input:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.search-input:hover {
		border-color: var(--color-primary);
	}

	.filter-select {
		padding: 0.75rem 1rem;
		border: 1px solid var(--color-secondary);
		background: var(--color-white);
		font-size: 0.9rem;
		font-weight: var(--font-weight-medium);
		color: var(--color-black);
		font-family: var(--font-family);
		cursor: pointer;
		transition: border-color 0.2s ease;
	}

	.filter-select:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.filter-select:hover {
		border-color: var(--color-primary);
	}

	.clear-filter-btn {
		background: var(--color-white);
		color: var(--color-secondary);
		border: 1px solid var(--color-secondary);
		padding: 0.75rem 1rem;
		font-size: 0.9rem;
		font-weight: var(--font-weight-semibold);
		font-family: var(--font-family);
		cursor: pointer;
		transition: all 0.2s ease;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		white-space: nowrap;
	}

	.clear-filter-btn:hover {
		background: var(--color-secondary);
		color: var(--color-white);
	}

	.controls-section {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		padding: 1.5rem 2rem;
		margin-bottom: 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.asset-count-section,
	.view-controls {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.control-label {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.asset-count {
		color: var(--color-black);
		font-weight: var(--font-weight-medium);
		font-size: 0.9rem;
	}

	.view-btn {
		padding: 0.5rem 1rem;
		border: 1px solid var(--color-light-gray);
		background: var(--color-white);
		color: var(--color-black);
		font-family: var(--font-family);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.view-btn:hover {
		border-color: var(--color-black);
	}

	.view-btn.active {
		background: var(--color-black);
		color: var(--color-white);
		border-color: var(--color-black);
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

	.asset-card {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		padding: 2rem;
		transition: border-color 0.2s ease;
	}

	.asset-card:hover {
		border-color: var(--color-primary);
	}

	.asset-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 2rem;
	}

	.asset-info h3 {
		font-size: 1.1rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
	}

	.asset-location {
		font-size: 0.8rem;
		color: var(--color-secondary);
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.25rem;
	}

	.asset-operator {
		font-size: 0.7rem;
		color: var(--color-black);
		font-weight: var(--font-weight-medium);
	}

	.asset-badges {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: flex-end;
	}

	.status-badge {
		background: var(--color-black);
		color: var(--color-white);
		padding: 0.25rem 0.5rem;
		font-size: 0.7rem;
		font-weight: var(--font-weight-bold);
	}

	.status-badge {
		padding: 0.25rem 0.5rem;
		font-size: 0.7rem;
		font-weight: var(--font-weight-bold);
	}

	.status-badge.producing {
		background: var(--color-light-gray);
		color: var(--color-primary);
	}

	.status-badge.funding {
		background: var(--color-light-gray);
		color: var(--color-secondary);
	}

	.asset-metrics {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.metric {
		text-align: center;
	}

	.metric-value {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-primary);
		margin-bottom: 0.25rem;
	}

	.metric-label {
		font-size: 0.7rem;
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.asset-details {
		margin-bottom: 2rem;
		padding-top: 2rem;
		border-top: 1px solid var(--color-light-gray);
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.75rem;
		font-size: 0.8rem;
	}

	.detail-row span:first-child {
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
	}

	.detail-row span:last-child {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
	}

	.token-info {
		margin-bottom: 2rem;
	}

	.info-header {
		display: flex;
		justify-content: space-between;
		font-size: 0.8rem;
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
	}

	.asset-actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.assets-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.asset-list-item {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		padding: 1.5rem;
		display: grid;
		grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
		gap: 2rem;
		align-items: center;
		transition: border-color 0.2s ease;
	}

	.asset-list-item:hover {
		border-color: var(--color-primary);
	}

	.list-asset-info h4 {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.25rem;
		font-size: 1rem;
	}

	.list-asset-info p {
		font-size: 0.8rem;
		color: var(--color-secondary);
		font-weight: var(--font-weight-medium);
	}

	.list-payout,
	.list-value {
		text-align: center;
	}

	.list-status,
	.list-status {
		text-align: center;
	}

	.list-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-primary,
	.btn-secondary {
		padding: 0.75rem 1rem;
		text-align: center;
		text-decoration: none;
		font-weight: var(--font-weight-semibold);
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		transition: background-color 0.2s ease;
		display: inline-block;
	}

	.btn-primary {
		background: var(--color-black);
		color: var(--color-white);
	}

	.btn-primary:hover {
		background: var(--color-secondary);
	}

	.btn-secondary {
		background: var(--color-white);
		color: var(--color-secondary);
		border: 1px solid var(--color-secondary);
	}

	.btn-secondary:hover {
		background: var(--color-secondary);
		color: var(--color-white);
	}

	.btn-primary-small,
	.btn-secondary-small {
		padding: 0.5rem 1rem;
		text-align: center;
		text-decoration: none;
		font-weight: var(--font-weight-semibold);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		transition: background-color 0.2s ease;
		display: inline-block;
	}

	.btn-primary-small {
		background: var(--color-black);
		color: var(--color-white);
	}

	.btn-primary-small:hover {
		background: var(--color-secondary);
	}

	.btn-secondary-small {
		background: var(--color-white);
		color: var(--color-secondary);
		border: 1px solid var(--color-secondary);
	}

	.btn-secondary-small:hover {
		background: var(--color-secondary);
		color: var(--color-white);
	}

	@media (max-width: 768px) {
		.assets-page {
			padding: 2rem 1rem;
		}

		.page-header h1 {
			font-size: 2rem;
		}

		.controls-section {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}

		.asset-count-section,
		.view-controls {
			justify-content: center;
		}

		.filter-row {
			flex-direction: column;
			align-items: stretch;
		}

		.filter-group {
			min-width: auto;
			flex: none;
		}

		.filter-section {
			padding: 1rem;
		}

		.assets-grid {
			grid-template-columns: 1fr;
		}

		.asset-list-item {
			grid-template-columns: 1fr;
			gap: 1rem;
			text-align: center;
		}

		.list-actions {
			justify-content: center;
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