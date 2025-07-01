<script lang="ts">
	import { onMount } from 'svelte';
	import { AssetService } from '$lib/services/AssetService';
	import type { Asset } from '$lib/types/asset';

	let assets: Asset[] = [];
	let loading = true;

	onMount(async () => {
		try {
			assets = await AssetService.getAllAssets();
		} catch (error) {
			console.error('Failed to load assets:', error);
		} finally {
			loading = false;
		}
	});

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	function getLatestMonthlyIncome(asset: Asset): number {
		if (asset.monthlyReports.length === 0) return 0;
		const latest = asset.monthlyReports[asset.monthlyReports.length - 1];
		return latest.netIncome;
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
	{:else if assets.length === 0}
		<div class="empty-state">
			<p>No assets available at this time.</p>
		</div>
	{:else}
		<div class="assets-grid">
			{#each assets as asset}
				<article class="asset-card">
					<div class="asset-image">
						{#if asset.images && asset.images.length > 0}
							<img src={asset.images[0]} alt={asset.name} />
						{:else}
							<div class="placeholder-image">
								<span>No Image</span>
							</div>
						{/if}
					</div>
					
					<div class="asset-content">
						<h2>{asset.name}</h2>
						<p class="asset-location">{asset.location.county}, {asset.location.state}</p>
						<p class="asset-description">{asset.description}</p>
						
						<div class="asset-stats">
							<div class="stat">
								<span class="stat-label">Type</span>
								<span class="stat-value">{asset.fieldType}</span>
							</div>
							<div class="stat">
								<span class="stat-label">Latest Income</span>
								<span class="stat-value">{formatCurrency(getLatestMonthlyIncome(asset))}</span>
							</div>
						</div>
						
						<div class="asset-actions">
							<a href="/assets/{asset.id}" class="btn-secondary">View Details</a>
							<a href="/buy-token?asset={asset.id}" class="btn-primary">Buy Tokens</a>
						</div>
					</div>
				</article>
			{/each}
		</div>
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

	.loading-state,
	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		color: var(--color-black);
	}

	.assets-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 2rem;
	}

	.asset-card {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		overflow: hidden;
	}

	.asset-image {
		height: 200px;
		position: relative;
		overflow: hidden;
	}

	.asset-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.placeholder-image {
		width: 100%;
		height: 100%;
		background: var(--color-light-gray);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-black);
		font-weight: var(--font-weight-medium);
	}

	.asset-content {
		padding: 2rem;
	}

	.asset-content h2 {
		font-size: 1.5rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 0.5rem;
		color: var(--color-black);
	}

	.asset-location {
		color: var(--color-secondary);
		font-weight: var(--font-weight-medium);
		margin-bottom: 1rem;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.asset-description {
		margin-bottom: 1.5rem;
		line-height: 1.6;
		color: var(--color-black);
	}

	.asset-stats {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-bottom: 2rem;
		padding: 1rem;
		border: 1px solid var(--color-light-gray);
	}

	.stat {
		display: flex;
		flex-direction: column;
	}

	.stat-label {
		font-size: 0.8rem;
		color: var(--color-secondary);
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.25rem;
	}

	.stat-value {
		font-weight: var(--font-weight-bold);
		color: var(--color-black);
	}

	.asset-actions {
		display: flex;
		gap: 1rem;
	}

	.btn-primary,
	.btn-secondary {
		flex: 1;
		padding: 0.75rem 1rem;
		text-align: center;
		text-decoration: none;
		font-weight: var(--font-weight-semibold);
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		transition: background-color 0.2s ease;
	}

	.btn-primary {
		background: var(--color-primary);
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

		.asset-actions {
			flex-direction: column;
		}
	}
</style>