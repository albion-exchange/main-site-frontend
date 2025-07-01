<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { AssetService } from '$lib/services/AssetService';
	import type { Asset } from '$lib/types/asset';

	let asset: Asset | null = null;
	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		const assetId = $page.params.id;
		try {
			asset = await AssetService.getAssetById(assetId);
			if (!asset) {
				error = 'Asset not found';
			}
		} catch (err) {
			error = 'Failed to load asset details';
			console.error('Error loading asset:', err);
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

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function formatMonthYear(monthString: string): string {
		const [year, month] = monthString.split('-');
		return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long'
		});
	}

	function calculateTotalRevenue(asset: Asset): number {
		return asset.monthlyReports.reduce((total, report) => total + report.revenue, 0);
	}

	function calculateTotalNetIncome(asset: Asset): number {
		return asset.monthlyReports.reduce((total, report) => total + report.netIncome, 0);
	}
</script>

<svelte:head>
	<title>{asset ? asset.name : 'Asset Details'} - Albion</title>
	<meta name="description" content={asset ? asset.description : 'Asset details'} />
</svelte:head>

<main class="asset-details">
	{#if loading}
		<div class="loading-state">
			<p>Loading asset details...</p>
		</div>
	{:else if error}
		<div class="error-state">
			<h1>Error</h1>
			<p>{error}</p>
			<a href="/assets" class="btn-primary">Back to Assets</a>
		</div>
	{:else if asset}
		<div class="asset-header">
			<div class="asset-images">
				{#if asset.images && asset.images.length > 0}
					<img src={asset.images[0]} alt={asset.name} class="main-image" />
				{:else}
					<div class="placeholder-image">
						<span>No Image Available</span>
					</div>
				{/if}
			</div>
			
			<div class="asset-info">
				<h1>{asset.name}</h1>
				<p class="location">{asset.location.county}, {asset.location.state}</p>
				<p class="description">{asset.description}</p>
				
				<div class="quick-stats">
					<div class="stat">
						<span class="stat-value">{asset.fieldType}</span>
						<span class="stat-label">Field Type</span>
					</div>
					<div class="stat">
						<span class="stat-value">{formatCurrency(calculateTotalRevenue(asset))}</span>
						<span class="stat-label">Total Revenue</span>
					</div>
					<div class="stat">
						<span class="stat-value">{formatCurrency(calculateTotalNetIncome(asset))}</span>
						<span class="stat-label">Total Net Income</span>
					</div>
				</div>
				
				<div class="action-buttons">
					<a href="/buy-token?asset={asset.id}" class="btn-primary">Buy Tokens</a>
					<a href="/assets" class="btn-secondary">Back to Assets</a>
				</div>
			</div>
		</div>

		<div class="asset-sections">
			<section class="asset-details-section">
				<h2>Asset Details</h2>
				<div class="details-grid">
					<div class="detail-item">
						<span class="detail-label">Estimated Reserves</span>
						<span class="detail-value">{asset.estimatedReserves.toLocaleString()} barrels</span>
					</div>
					<div class="detail-item">
						<span class="detail-label">Drilling Date</span>
						<span class="detail-value">{formatDate(asset.drillingDate)}</span>
					</div>
					<div class="detail-item">
						<span class="detail-label">Operator</span>
						<span class="detail-value">{asset.operator.name}</span>
					</div>
					<div class="detail-item">
						<span class="detail-label">Experience</span>
						<span class="detail-value">{asset.operator.experience}</span>
					</div>
				</div>
			</section>

			<section class="performance-section">
				<h2>Performance History</h2>
				{#if asset.monthlyReports.length > 0}
					<div class="reports-table">
						<div class="table-header">
							<span>Month</span>
							<span>Production</span>
							<span>Revenue</span>
							<span>Net Income</span>
						</div>
						{#each asset.monthlyReports.slice().reverse() as report}
							<div class="table-row">
								<span>{formatMonthYear(report.month)}</span>
								<span>{report.production.toLocaleString()} bbl</span>
								<span>{formatCurrency(report.revenue)}</span>
								<span>{formatCurrency(report.netIncome)}</span>
							</div>
						{/each}
					</div>
				{:else}
					<p>No performance data available yet.</p>
				{/if}
			</section>
		</div>
	{/if}
</main>

<style>
	.asset-details {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.loading-state,
	.error-state {
		text-align: center;
		padding: 4rem 2rem;
	}

	.asset-header {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 3rem;
		margin-bottom: 4rem;
	}

	.asset-images {
		position: relative;
	}

	.main-image {
		width: 100%;
		height: 400px;
		object-fit: cover;
		border: 1px solid var(--color-light-gray);
	}

	.placeholder-image {
		width: 100%;
		height: 400px;
		background: var(--color-light-gray);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-black);
		font-weight: var(--font-weight-medium);
		border: 1px solid var(--color-light-gray);
	}

	.asset-info h1 {
		font-size: 2.5rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 0.5rem;
		color: var(--color-black);
	}

	.location {
		color: var(--color-secondary);
		font-weight: var(--font-weight-medium);
		margin-bottom: 1.5rem;
		font-size: 1rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.description {
		margin-bottom: 2rem;
		line-height: 1.6;
		color: var(--color-black);
		font-size: 1.1rem;
	}

	.quick-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
		padding: 1.5rem;
		border: 1px solid var(--color-light-gray);
	}

	.stat {
		text-align: center;
	}

	.stat-value {
		display: block;
		font-size: 1.25rem;
		font-weight: var(--font-weight-bold);
		color: var(--color-black);
		margin-bottom: 0.25rem;
	}

	.stat-label {
		font-size: 0.8rem;
		color: var(--color-secondary);
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.action-buttons {
		display: flex;
		gap: 1rem;
	}

	.btn-primary,
	.btn-secondary {
		flex: 1;
		padding: 1rem 2rem;
		text-align: center;
		text-decoration: none;
		font-weight: var(--font-weight-semibold);
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

	.asset-sections {
		display: grid;
		gap: 3rem;
	}

	.asset-sections h2 {
		font-size: 1.5rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 1.5rem;
		color: var(--color-black);
	}

	.details-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
		padding: 1.5rem;
		border: 1px solid var(--color-light-gray);
	}

	.detail-item {
		display: flex;
		flex-direction: column;
	}

	.detail-label {
		font-size: 0.8rem;
		color: var(--color-secondary);
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.25rem;
	}

	.detail-value {
		font-weight: var(--font-weight-bold);
		color: var(--color-black);
	}

	.reports-table {
		border: 1px solid var(--color-light-gray);
	}

	.table-header,
	.table-row {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		padding: 1rem;
		border-bottom: 1px solid var(--color-light-gray);
	}

	.table-header {
		background: var(--color-light-gray);
		font-weight: var(--font-weight-bold);
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.table-row:last-child {
		border-bottom: none;
	}

	@media (max-width: 768px) {
		.asset-header {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.asset-info h1 {
			font-size: 2rem;
		}

		.quick-stats {
			grid-template-columns: 1fr;
		}

		.action-buttons {
			flex-direction: column;
		}

		.details-grid {
			grid-template-columns: 1fr;
		}

		.table-header,
		.table-row {
			grid-template-columns: 1fr;
			gap: 0.5rem;
		}

		.table-header span,
		.table-row span {
			padding: 0.25rem 0;
		}
	}
</style>