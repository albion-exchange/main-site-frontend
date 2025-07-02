<script lang="ts">
	import { onMount } from 'svelte';
	import dataStoreService from '$lib/services/DataStoreService';
	import type { Asset } from '$lib/types/dataStore';

	let viewMode = 'grid'; // grid or list
	let sortBy = 'payout';
	let loading = true;
	let allAssets: Asset[] = [];

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

	// Sort assets
	$: filteredAssets = allAssets.sort((a, b) => {
		switch(sortBy) {
			case 'name': return a.name.localeCompare(b.name);
			case 'reserves': return parseFloat(a.production.expectedRemainingProduction.replace(/[^\d.]/g, '')) - parseFloat(b.production.expectedRemainingProduction.replace(/[^\d.]/g, ''));
			case 'status': return a.production.status.localeCompare(b.production.status);
			default: return 0;
		}
	});
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

		<!-- Sort and View Controls -->
		<div class="controls-section">
			<div class="sort-controls">
				<span class="control-label">Sort By:</span>
				<select bind:value={sortBy} class="sort-select">
					<option value="payout">Highest Payout</option>
					<option value="value">Highest Value</option>
					<option value="name">Name A-Z</option>
					<option value="funding">Funding Soon</option>
				</select>
				<span class="asset-count">
					{allAssets.length} assets
				</span>
			</div>
			<div class="view-controls">
				<span class="control-label">View:</span>
				<button 
					class="view-btn"
					class:active={viewMode === 'grid'}
					on:click={() => viewMode = 'grid'}
				>
					Grid
				</button>
				<button 
					class="view-btn"
					class:active={viewMode === 'list'}
					on:click={() => viewMode = 'list'}
				>
					List
				</button>
			</div>
		</div>

		<!-- Assets Display -->
		{#if filteredAssets.length === 0}
			<div class="empty-state">
				<h3>No Assets Found</h3>
				<p>Try adjusting your search criteria or filters to find assets.</p>
				<button class="btn-primary" on:click={clearAllFilters}>
					Clear All Filters
				</button>
			</div>
		{:else if viewMode === 'grid'}
			<div class="assets-grid">
				{#each filteredAssets as asset}
					<article class="asset-card">
						<div class="asset-header">
							<div class="asset-info">
								<h3>{asset.name}</h3>
								<p class="asset-location">{asset.location.state}, {asset.location.country}</p>
								<p class="asset-operator">{asset.operator.name}</p>
							</div>
							<div class="asset-badges">
								<span class="status-badge" class:producing={asset.production.status === 'producing'} class:funding={asset.production.status === 'funding'}>
									{asset.production.status.toUpperCase()}
								</span>
							</div>
						</div>
						
						<div class="asset-metrics">
							<div class="metric">
								<div class="metric-value">{asset.production.capacity}</div>
								<div class="metric-label">Production</div>
							</div>
							<div class="metric">
								<div class="metric-value">{asset.production.reserves}</div>
								<div class="metric-label">Reserves</div>
							</div>
							<div class="metric">
								<div class="metric-value">{asset.production.status}</div>
								<div class="metric-label">Status</div>
							</div>
						</div>

						<div class="asset-details">
							<div class="detail-row">
								<span>Production:</span>
								<span>{asset.production.capacity}</span>
							</div>
							<div class="detail-row">
								<span>Reserves:</span>
								<span>{asset.production.reserves}</span>
							</div>
							<div class="detail-row">
								<span>Field Type:</span>
								<span>{asset.technical.fieldType}</span>
							</div>
							<div class="detail-row">
								<span>Operator:</span>
								<span>{asset.operator.name}</span>
							</div>
						</div>
						
						<!-- Token Information -->
						<div class="token-info">
							<div class="info-header">
								<span>Associated Tokens</span>
								<span>{asset.tokenContracts.length} token{asset.tokenContracts.length !== 1 ? 's' : ''}</span>
							</div>
						</div>
						
						<div class="asset-actions">
							<a href="/buy-tokens?asset={asset.id}" class="btn-primary">View Tokens</a>
							<a href="/assets/{asset.id}" class="btn-secondary">View Details</a>
						</div>
					</article>
				{/each}
			</div>
		{:else}
			<div class="assets-list">
				{#each filteredAssets as asset}
					<article class="asset-list-item">
						<div class="list-asset-info">
							<h4>{asset.name}</h4>
							<p>{asset.location.state}, {asset.location.country}</p>
						</div>
						<div class="list-payout">
							<div class="metric-value">{asset.production.capacity}</div>
							<div class="metric-label">Production</div>
						</div>
						<div class="list-value">
							<div class="metric-value">{asset.production.reserves}</div>
							<div class="metric-label">Reserves</div>
						</div>
						<div class="list-status">
							<span class="status-badge" class:producing={asset.production.status === 'producing'} class:funding={asset.production.status === 'funding'}>
								{asset.production.status.toUpperCase()}
							</span>
						</div>
						<div class="list-actions">
							<a href="/buy-tokens?asset={asset.id}" class="btn-primary-small">Tokens</a>
							<a href="/assets/{asset.id}" class="btn-secondary-small">View</a>
						</div>
					</article>
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

	.sort-controls,
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

	.sort-select {
		padding: 0.5rem;
		border: 1px solid var(--color-light-gray);
		background: var(--color-white);
		color: var(--color-black);
		font-family: var(--font-family);
		font-weight: var(--font-weight-medium);
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

		.sort-controls,
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