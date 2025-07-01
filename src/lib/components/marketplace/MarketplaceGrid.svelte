<script lang="ts">
	import { onMount } from 'svelte';
	import AssetCard from '../assets/AssetCard.svelte';
	import { AssetService } from '$lib/services';
	import type { Asset } from '$lib/types';

	export let searchQuery = '';
	export let filterType = '';

	let assets: Asset[] = [];
	let filteredAssets: Asset[] = [];
	let loading = true;

	onMount(() => {
		loadAssets();
	});

	function loadAssets() {
		loading = true;
		// Load assets from AssetService
		assets = AssetService.getAssets();
		filterAssets();
		loading = false;
	}

	function filterAssets() {
		let result = assets;

		// Apply search filter
		if (searchQuery.trim()) {
			result = AssetService.searchAssets(searchQuery);
		}

		// Apply type filter
		if (filterType) {
			result = result.filter(asset => asset.fieldType === filterType);
		}

		filteredAssets = result;
	}

	// React to search and filter changes
	$: {
		searchQuery;
		filterType;
		filterAssets();
	}

	// Get unique field types for filtering
	$: fieldTypes = [...new Set(assets.map(asset => asset.fieldType))];

	function handleAssetClick(asset: Asset) {
		// Navigate to asset detail page
		window.location.href = `/marketplace/assets/${asset.id}`;
	}
</script>

<div class="marketplace-container">
	<header class="marketplace-header">
		<div class="title-section">
			<h1>Asset Marketplace</h1>
			<p>Discover and invest in tokenized oil field assets</p>
		</div>

		<div class="controls">
			<div class="search-box">
				<input
					type="text"
					placeholder="Search assets..."
					bind:value={searchQuery}
					class="search-input"
				/>
			</div>

			<div class="filter-box">
				<select bind:value={filterType} class="filter-select">
					<option value="">All Field Types</option>
					{#each fieldTypes as fieldType}
						<option value={fieldType}>{fieldType}</option>
					{/each}
				</select>
			</div>
		</div>
	</header>

	<div class="marketplace-content">
		{#if loading}
			<div class="loading-state">
				<div class="spinner"></div>
				<p>Loading assets...</p>
			</div>
		{:else if filteredAssets.length === 0}
			<div class="empty-state">
				<h3>No assets found</h3>
				<p>
					{#if searchQuery || filterType}
						Try adjusting your search or filter criteria.
					{:else}
						No assets are currently available in the marketplace.
					{/if}
				</p>
			</div>
		{:else}
			<div class="asset-grid">
				{#each filteredAssets as asset (asset.id)}
					<div on:click={() => handleAssetClick(asset)} on:keydown={(e) => e.key === 'Enter' && handleAssetClick(asset)} role="button" tabindex="0">
						<AssetCard {asset} />
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<div class="marketplace-stats">
		<div class="stat">
			<span class="stat-number">{filteredAssets.length}</span>
			<span class="stat-label">Available Assets</span>
		</div>
		<div class="stat">
			<span class="stat-number">{fieldTypes.length}</span>
			<span class="stat-label">Field Types</span>
		</div>
		<div class="stat">
			<span class="stat-number">
				{filteredAssets.reduce((sum, asset) => sum + asset.tokenContracts.length, 0)}
			</span>
			<span class="stat-label">Token Contracts</span>
		</div>
	</div>
</div>

<style>
	.marketplace-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.marketplace-header {
		margin-bottom: 3rem;
	}

	.title-section {
		text-align: center;
		margin-bottom: 2rem;
	}

	.title-section h1 {
		font-size: 2.5rem;
		font-weight: 700;
		color: #1a202c;
		margin: 0 0 0.5rem 0;
	}

	.title-section p {
		font-size: 1.125rem;
		color: #718096;
		margin: 0;
	}

	.controls {
		display: flex;
		gap: 1rem;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
	}

	.search-box, .filter-box {
		display: flex;
		flex-direction: column;
	}

	.search-input, .filter-select {
		padding: 0.75rem 1rem;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		font-size: 0.875rem;
		background: white;
		min-width: 200px;
	}

	.search-input:focus, .filter-select:focus {
		outline: none;
		border-color: #3182ce;
		box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
	}

	.marketplace-content {
		margin-bottom: 3rem;
	}

	.loading-state, .empty-state {
		text-align: center;
		padding: 4rem 2rem;
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid #e2e8f0;
		border-top: 3px solid #3182ce;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto 1rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.empty-state h3 {
		font-size: 1.5rem;
		color: #2d3748;
		margin: 0 0 0.5rem 0;
	}

	.empty-state p {
		color: #718096;
		margin: 0;
	}

	.asset-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 2rem;
	}

	.marketplace-stats {
		display: flex;
		justify-content: center;
		gap: 3rem;
		padding: 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 12px;
		color: white;
	}

	.stat {
		text-align: center;
	}

	.stat-number {
		display: block;
		font-size: 2rem;
		font-weight: 700;
		margin-bottom: 0.25rem;
	}

	.stat-label {
		font-size: 0.875rem;
		opacity: 0.9;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	@media (max-width: 768px) {
		.marketplace-container {
			padding: 1rem;
		}

		.title-section h1 {
			font-size: 2rem;
		}

		.controls {
			flex-direction: column;
			align-items: stretch;
		}

		.search-input, .filter-select {
			min-width: auto;
		}

		.asset-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.marketplace-stats {
			gap: 1.5rem;
		}

		.stat-number {
			font-size: 1.5rem;
		}
	}
</style>