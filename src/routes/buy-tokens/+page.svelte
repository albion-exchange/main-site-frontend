<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import dataStoreService from '$lib/services/DataStoreService';
	import type { Token, Asset } from '$lib/types/dataStore';

	let loading = true;
	let tokens: Token[] = [];
	let filteredTokens: Token[] = [];
	let allAssets: Asset[] = [];
	let error: string | null = null;
	let selectedAssetId: string | null = null;
	let selectedAssetName: string | null = null;

	onMount(async () => {
		try {
			// Get all active royalty tokens for purchase
			tokens = dataStoreService.getSelectableTokens();
			// Get all assets for filter dropdown
			allAssets = dataStoreService.getAllAssets();
			
			// Check for asset filter in URL parameters
			const assetId = $page.url.searchParams.get('asset');
			if (assetId) {
				selectedAssetId = assetId;
				const asset = dataStoreService.getAssetById(assetId);
				selectedAssetName = asset?.name || null;
				filteredTokens = tokens.filter(token => token.assetId === assetId);
			} else {
				filteredTokens = tokens;
			}
			
			loading = false;
		} catch (err) {
			console.error('Error loading tokens:', err);
			error = 'Failed to load tokens. Please try again.';
			loading = false;
		}
	});

	function clearFilter() {
		selectedAssetId = null;
		selectedAssetName = null;
		filteredTokens = tokens;
		// Update URL without asset parameter
		const url = new URL($page.url);
		url.searchParams.delete('asset');
		goto(url.toString(), { replaceState: true });
	}

	function handleAssetFilterChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		const assetId = target.value;
		
		if (assetId) {
			selectedAssetId = assetId;
			const asset = dataStoreService.getAssetById(assetId);
			selectedAssetName = asset?.name || null;
			filteredTokens = tokens.filter(token => token.assetId === assetId);
			
			// Update URL with asset parameter
			const url = new URL($page.url);
			url.searchParams.set('asset', assetId);
			goto(url.toString(), { replaceState: true });
		} else {
			clearFilter();
		}
	}

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(amount);
	}

	function formatLargeNumber(value: number): string {
		if (value >= 1000000) {
			return `${(value / 1000000).toFixed(1)}M`;
		}
		if (value >= 1000) {
			return `${(value / 1000).toFixed(1)}K`;
		}
		return value.toString();
	}

	function getTokenSupplyInfo(token: Token) {
		const supply = dataStoreService.getTokenSupply(token.contractAddress);
		return supply || {
			maxSupply: 0,
			mintedSupply: 0,
			availableSupply: 0,
			supplyUtilization: 0
		};
	}

	function getAssetName(token: Token) {
		const asset = dataStoreService.getAssetById(token.assetId);
		return asset?.name || 'Unknown Asset';
	}

</script>

<svelte:head>
	<title>Buy Tokens - Albion</title>
	<meta name="description" content="Purchase royalty tokens from available oil and gas assets" />
</svelte:head>

<main class="buy-tokens-page">
	{#if loading}
		<div class="loading-state">
			<p>Loading available tokens...</p>
		</div>
	{:else if error}
		<div class="error-state">
			<h1>Error Loading Tokens</h1>
			<p>{error}</p>
			<a href="/assets" class="btn-primary">View Assets</a>
		</div>
	{:else}
		<!-- Page Header -->
		<div class="page-header">
			<div class="header-content">
				<h1>Buy Tokens</h1>
				<p>Purchase royalty tokens to earn monthly distributions from oil and gas production</p>
				{#if selectedAssetId && selectedAssetName}
					<div class="filter-status">
						<span class="filter-label">Filtered by asset:</span>
						<span class="filter-value">{selectedAssetName}</span>
					</div>
				{/if}
			</div>
			<div class="header-stats">
				<div class="stat">
					<div class="stat-value">{filteredTokens.length}</div>
					<div class="stat-label">{selectedAssetId ? 'Filtered' : 'Available'} Tokens</div>
				</div>
			</div>
		</div>

		<!-- Filter Controls -->
		<div class="filter-section">
			<div class="filter-controls">
				<div class="filter-row">
					<div class="filter-group">
						<label for="asset-filter" class="filter-control-label">Filter by Asset:</label>
						<select 
							id="asset-filter" 
							class="filter-select" 
							value={selectedAssetId || ''}
							on:change={handleAssetFilterChange}
						>
							<option value="">All Assets</option>
							{#each allAssets as asset (asset.id)}
								{@const assetTokens = tokens.filter(token => token.assetId === asset.id)}
								{#if assetTokens.length > 0}
									<option value={asset.id}>{asset.name} ({assetTokens.length} token{assetTokens.length !== 1 ? 's' : ''})</option>
								{/if}
							{/each}
						</select>
					</div>
					{#if selectedAssetId}
						<div class="filter-group">
							<button class="clear-filter-btn" on:click={clearFilter}>
								Clear Filter
							</button>
						</div>
					{/if}
				</div>
			</div>
			{#if selectedAssetId}
				{@const selectedAsset = allAssets.find(asset => asset.id === selectedAssetId)}
				{#if selectedAsset}
					<div class="filter-info">
						<div class="filter-info-content">
							<h3>{selectedAsset.name}</h3>
							<p class="asset-description">{selectedAsset.description}</p>
							<div class="asset-details">
								<span class="asset-location">{selectedAsset.location.state}, {selectedAsset.location.country}</span>
								<span class="asset-operator">Operated by {selectedAsset.operator.name}</span>
							</div>
						</div>
						<div class="filter-actions">
							<a href="/assets/{selectedAsset.id}" class="btn-secondary view-asset-btn">View Asset Details</a>
						</div>
					</div>
				{/if}
			{/if}
		</div>

		<!-- Tokens Grid -->
		<div class="tokens-grid">
			{#each filteredTokens as token (token.contractAddress)}
				{@const supplyInfo = getTokenSupplyInfo(token)}
				{@const assetName = getAssetName(token)}
				
				<div class="token-card">
					<!-- Token Header -->
					<div class="token-header">
						<div class="token-info">
							<h3 class="token-name">{token.name}</h3>
							<p class="asset-name-label">{assetName}</p>
							<div class="token-contract">{token.contractAddress}</div>
						</div>
						<div class="token-status">
							{#if token.isActive}
								<span class="status-badge active">Available</span>
							{:else}
								<span class="status-badge inactive">Sold Out</span>
							{/if}
						</div>
					</div>

					<!-- Supply Information -->
					<div class="supply-section">
						<div class="supply-row">
							<span class="supply-label">Total Supply</span>
							<span class="supply-value">{formatLargeNumber(supplyInfo.maxSupply)} tokens</span>
						</div>
						<div class="supply-row">
							<span class="supply-label">Minted Supply</span>
							<span class="supply-value">{formatLargeNumber(supplyInfo.mintedSupply)} tokens</span>
						</div>
						<div class="supply-row">
							<span class="supply-label">Available</span>
							<span class="supply-value available">{formatLargeNumber(supplyInfo.availableSupply)} tokens</span>
						</div>
						
						<!-- Supply Progress Bar -->
						<div class="supply-progress">
							<div class="progress-bar">
								<div 
									class="progress-fill"
									style="width: {supplyInfo.supplyUtilization}%"
								></div>
							</div>
							<div class="progress-label">{supplyInfo.supplyUtilization.toFixed(1)}% Minted</div>
						</div>
					</div>


					<!-- Action Button -->
					<div class="token-actions">
						{#if token.isActive && supplyInfo.availableSupply > 0}
							<a 
								href="/purchase-token?asset={token.assetId}&token={token.contractAddress}" 
								class="btn-primary buy-btn"
							>
								Buy Tokens
							</a>
						{:else}
							<button class="btn-disabled" disabled>
								{supplyInfo.availableSupply <= 0 ? 'Sold Out' : 'Unavailable'}
							</button>
						{/if}
						<a href="/assets/{token.assetId}" class="btn-secondary">View Asset</a>
					</div>
				</div>
			{/each}
		</div>

		{#if filteredTokens.length === 0}
			<div class="empty-state">
				<h2>{selectedAssetId ? 'No Tokens Available for This Asset' : 'No Tokens Available'}</h2>
				<p>
					{#if selectedAssetId}
						There are currently no tokens available for purchase from this asset. Try viewing all tokens or check back later.
					{:else}
						There are currently no tokens available for purchase. Check back later or view our assets to learn more.
					{/if}
				</p>
				{#if selectedAssetId}
					<div class="empty-actions">
						<button class="btn-primary" on:click={clearFilter}>View All Tokens</button>
						<a href="/assets" class="btn-secondary">View Assets</a>
					</div>
				{:else}
					<a href="/assets" class="btn-primary">View Assets</a>
				{/if}
			</div>
		{/if}
	{/if}
</main>

<style>
	.buy-tokens-page {
		padding: 2rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	.loading-state,
	.error-state,
	.empty-state {
		text-align: center;
		padding: 4rem;
	}

	.error-state h1,
	.empty-state h2 {
		color: var(--color-black);
		margin-bottom: 1rem;
		font-weight: var(--font-weight-extrabold);
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 3rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid var(--color-light-gray);
	}

	.header-content h1 {
		font-size: 2.5rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
	}

	.header-content p {
		color: var(--color-secondary);
		font-size: 1.1rem;
		line-height: 1.6;
	}

	.filter-status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 1rem;
		padding: 0.75rem;
		background: rgba(8, 188, 204, 0.1);
		border: 1px solid var(--color-primary);
	}

	.filter-label {
		font-size: 0.9rem;
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
	}

	.filter-value {
		font-size: 0.9rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-primary);
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

	.header-stats {
		display: flex;
		gap: 3rem;
	}

	.stat {
		text-align: center;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-primary);
		margin-bottom: 0.25rem;
	}

	.stat-label {
		font-size: 0.8rem;
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.tokens-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: 2rem;
	}

	.token-card {
		border: 1px solid var(--color-light-gray);
		padding: 2rem;
		background: var(--color-white);
		transition: border-color 0.2s ease;
	}

	.token-card:hover {
		border-color: var(--color-primary);
	}

	.token-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 2rem;
	}

	.token-name {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
	}

	.asset-name-label {
		font-size: 0.75rem;
		font-weight: var(--font-weight-semibold);
		color: var(--color-white);
		background: var(--color-secondary);
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		display: inline-block;
		margin-bottom: 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.token-contract {
		font-size: 0.75rem;
		font-weight: var(--font-weight-medium);
		color: var(--color-secondary);
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		word-break: break-all;
		line-height: 1.4;
		opacity: 0.8;
	}

	.status-badge {
		font-size: 0.7rem;
		font-weight: var(--font-weight-semibold);
		padding: 0.25rem 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.status-badge.active {
		background: rgba(8, 188, 204, 0.1);
		color: var(--color-primary);
	}

	.status-badge.inactive {
		background: var(--color-light-gray);
		color: var(--color-secondary);
	}

	.supply-section {
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: #fafafa;
	}

	.supply-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.75rem;
		font-size: 0.9rem;
	}

	.supply-label {
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
	}

	.supply-value {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
	}

	.supply-value.available {
		color: var(--color-primary);
	}

	.supply-progress {
		margin-top: 1rem;
	}

	.progress-bar {
		width: 100%;
		height: 8px;
		background: var(--color-light-gray);
		margin-bottom: 0.5rem;
	}

	.progress-fill {
		height: 100%;
		background: var(--color-primary);
		transition: width 0.3s ease;
	}

	.progress-label {
		font-size: 0.8rem;
		color: var(--color-secondary);
		text-align: center;
	}


	.token-actions {
		display: flex;
		gap: 1rem;
	}

	.buy-btn,
	.btn-primary,
	.btn-secondary,
	.btn-disabled {
		flex: 1;
		padding: 0.75rem 1.5rem;
		text-decoration: none;
		font-weight: var(--font-weight-semibold);
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		text-align: center;
		transition: background-color 0.2s ease;
		border: none;
		cursor: pointer;
	}

	.btn-primary,
	.buy-btn {
		background: var(--color-black);
		color: var(--color-white);
	}

	.btn-primary:hover,
	.buy-btn:hover {
		background: var(--color-secondary);
	}

	.btn-secondary {
		background: var(--color-white);
		color: var(--color-black);
		border: 1px solid var(--color-black);
	}

	.btn-secondary:hover {
		background: var(--color-black);
		color: var(--color-white);
	}

	.btn-disabled {
		background: var(--color-light-gray);
		color: var(--color-secondary);
		cursor: not-allowed;
	}

	.empty-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	/* Filter Controls Styles */
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
		max-width: 400px;
	}

	.filter-control-label {
		font-size: 0.9rem;
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
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

	.filter-info {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 1.5rem;
		background: var(--color-white);
		border: 1px solid var(--color-primary);
		gap: 2rem;
	}

	.filter-info-content h3 {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
	}

	.filter-info-content .asset-description {
		color: var(--color-secondary);
		font-size: 0.95rem;
		line-height: 1.5;
		margin-bottom: 1rem;
	}

	.asset-details {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.asset-location,
	.asset-operator {
		font-size: 0.8rem;
		color: var(--color-secondary);
		font-weight: var(--font-weight-medium);
	}

	.filter-actions {
		flex-shrink: 0;
	}

	.view-asset-btn {
		padding: 0.5rem 1rem;
		font-size: 0.8rem;
		text-decoration: none;
		white-space: nowrap;
	}

	@media (max-width: 768px) {
		.tokens-grid {
			grid-template-columns: 1fr;
		}

		.page-header {
			flex-direction: column;
			gap: 2rem;
		}

		.header-stats {
			align-self: stretch;
			justify-content: space-around;
		}

		.token-actions {
			flex-direction: column;
		}

		.filter-section {
			padding: 1rem;
		}

		.filter-row {
			flex-direction: column;
			align-items: stretch;
		}

		.filter-group {
			min-width: auto;
			flex: none;
			max-width: 100%;
		}

		.filter-info {
			flex-direction: column;
			gap: 1rem;
		}

		.filter-actions {
			align-self: stretch;
		}

		.view-asset-btn {
			text-align: center;
			display: block;
		}
	}
</style>