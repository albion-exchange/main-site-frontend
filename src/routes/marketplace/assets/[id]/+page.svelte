<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import dataStoreService from '$lib/services/DataStoreService';
	import TokenCard from '$lib/components/tokens/TokenCard.svelte';
	import type { Asset } from '$lib/types/dataStore';

	let asset: Asset | null = null;
	let loading = true;
	let error: string | null = null;

	$: assetId = $page.params.id;

	onMount(() => {
		loadAsset();
	});

	function loadAsset() {
		loading = true;
		error = null;
		
		asset = dataStoreService.getAssetById(assetId);
		
		if (!asset) {
			error = 'Asset not found';
		}
		
		loading = false;
	}

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	function formatNumber(num: number): string {
		return new Intl.NumberFormat('en-US').format(Math.round(num));
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	$: performanceMetrics = asset ? AssetService.getPerformanceMetrics(asset.id) : null;
</script>

<svelte:head>
	<title>{asset?.name || 'Asset'} - Albion Marketplace</title>
	<meta name="description" content={asset?.description || 'Asset details'} />
</svelte:head>

<div class="asset-detail-container">
	{#if loading}
		<div class="loading-state">
			<div class="spinner"></div>
			<p>Loading asset details...</p>
		</div>
	{:else if error}
		<div class="error-state">
			<h2>Asset Not Found</h2>
			<p>{error}</p>
			<a href="/marketplace" class="back-link">← Back to Marketplace</a>
		</div>
	{:else if asset}
		<header class="asset-header">
			<div class="breadcrumb">
				<a href="/marketplace">Marketplace</a>
				<span>→</span>
				<span>{asset.name}</span>
			</div>
			
			<div class="asset-title">
				<h1>{asset.name}</h1>
				<p class="location">{asset.location.county}, {asset.location.state}</p>
			</div>
		</header>

		<div class="asset-content">
			<div class="asset-images">
				{#each asset.images as image, index}
					<img src={image} alt="{asset.name} - Image {index + 1}" />
				{/each}
			</div>

			<div class="asset-info">
				<section class="basic-info">
					<h2>Asset Information</h2>
					<div class="info-grid">
						<div class="info-item">
							<span class="label">Field Type</span>
							<span class="value">{asset.fieldType}</span>
						</div>
						<div class="info-item">
							<span class="label">Estimated Reserves</span>
							<span class="value">{formatNumber(asset.estimatedReserves)} barrels</span>
						</div>
						<div class="info-item">
							<span class="label">Drilling Date</span>
							<span class="value">{formatDate(asset.drillingDate)}</span>
						</div>
						<div class="info-item">
							<span class="label">Operator</span>
							<span class="value">
								{#if asset.operator.website}
									<a href={asset.operator.website} target="_blank" rel="noopener noreferrer">
										{asset.operator.name}
									</a>
								{:else}
									{asset.operator.name}
								{/if}
							</span>
						</div>
						<div class="info-item">
							<span class="label">Experience</span>
							<span class="value">{asset.operator.experience}</span>
						</div>
					</div>
				</section>

				<section class="description">
					<h2>Description</h2>
					<p>{asset.description}</p>
				</section>

				{#if performanceMetrics}
					<section class="performance">
						<h2>Performance Summary</h2>
						<div class="metrics-grid">
							<div class="metric">
								<span class="metric-value">{formatCurrency(performanceMetrics.totalIncome)}</span>
								<span class="metric-label">Total Income</span>
							</div>
							<div class="metric">
								<span class="metric-value">{formatNumber(performanceMetrics.averageProduction)} bbls</span>
								<span class="metric-label">Avg Monthly Production</span>
							</div>
							<div class="metric">
								<span class="metric-value">{performanceMetrics.monthlyReportsCount}</span>
								<span class="metric-label">Months Reported</span>
							</div>
							{#if performanceMetrics.latestReport}
								<div class="metric">
									<span class="metric-value">${performanceMetrics.latestReport.payoutPerToken?.toFixed(2) || '0.00'}</span>
									<span class="metric-label">Latest Payout/Token</span>
								</div>
							{/if}
						</div>
					</section>
				{/if}

				<section class="monthly-reports">
					<h2>Monthly Performance</h2>
					<div class="reports-table">
						<div class="table-header">
							<div>Month</div>
							<div>Production</div>
							<div>Revenue</div>
							<div>Net Income</div>
							<div>Per Token</div>
						</div>
						{#each asset.monthlyReports.slice().reverse() as report}
							<div class="table-row">
								<div>{report.month}</div>
								<div>{formatNumber(report.production)} bbls</div>
								<div>{formatCurrency(report.revenue)}</div>
								<div>{formatCurrency(report.netIncome)}</div>
								<div>${report.payoutPerToken?.toFixed(2) || '0.00'}</div>
							</div>
						{/each}
					</div>
				</section>

				<section class="tokens">
					<h2>Associated Tokens</h2>
					<div class="token-grid">
						{#each asset.tokenContracts as contractAddress}
							<TokenCard {contractAddress} />
						{/each}
					</div>
				</section>
			</div>
		</div>
	{/if}
</div>

<style>
	.asset-detail-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.loading-state, .error-state {
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

	.error-state h2 {
		color: #e53e3e;
		margin-bottom: 1rem;
	}

	.back-link {
		color: #3182ce;
		text-decoration: none;
		font-weight: 500;
	}

	.back-link:hover {
		text-decoration: underline;
	}

	.asset-header {
		margin-bottom: 2rem;
	}

	.breadcrumb {
		font-size: 0.875rem;
		color: #718096;
		margin-bottom: 1rem;
	}

	.breadcrumb a {
		color: #3182ce;
		text-decoration: none;
	}

	.breadcrumb a:hover {
		text-decoration: underline;
	}

	.asset-title h1 {
		font-size: 2.5rem;
		font-weight: 700;
		color: #1a202c;
		margin: 0 0 0.5rem 0;
	}

	.location {
		font-size: 1.125rem;
		color: #718096;
		margin: 0;
	}

	.asset-content {
		display: grid;
		gap: 2rem;
	}

	.asset-images {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.asset-images img {
		width: 100%;
		height: 250px;
		object-fit: cover;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
	}

	.asset-info section {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 2rem;
		margin-bottom: 2rem;
	}

	.asset-info h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: #1a202c;
		margin: 0 0 1.5rem 0;
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
	}

	.info-item {
		display: flex;
		flex-direction: column;
	}

	.label {
		font-size: 0.875rem;
		color: #718096;
		text-transform: uppercase;
		font-weight: 500;
		letter-spacing: 0.05em;
		margin-bottom: 0.5rem;
	}

	.value {
		font-size: 1rem;
		color: #1a202c;
		font-weight: 600;
	}

	.value a {
		color: #3182ce;
		text-decoration: none;
	}

	.value a:hover {
		text-decoration: underline;
	}

	.description p {
		font-size: 1rem;
		line-height: 1.6;
		color: #2d3748;
		margin: 0;
	}

	.metrics-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 2rem;
	}

	.metric {
		text-align: center;
	}

	.metric-value {
		display: block;
		font-size: 1.75rem;
		font-weight: 700;
		color: #1a202c;
		margin-bottom: 0.5rem;
	}

	.metric-label {
		font-size: 0.875rem;
		color: #718096;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 500;
	}

	.reports-table {
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		overflow: hidden;
	}

	.table-header, .table-row {
		display: grid;
		grid-template-columns: 100px 120px 120px 120px 100px;
		align-items: center;
	}

	.table-header {
		background: #f7fafc;
		font-weight: 600;
		color: #2d3748;
		padding: 1rem;
		font-size: 0.875rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.table-row {
		padding: 1rem;
		border-bottom: 1px solid #f7fafc;
		font-size: 0.875rem;
	}

	.table-row:last-child {
		border-bottom: none;
	}

	.table-row:hover {
		background: #f7fafc;
	}

	.token-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	@media (max-width: 768px) {
		.asset-detail-container {
			padding: 1rem;
		}

		.asset-title h1 {
			font-size: 2rem;
		}

		.asset-images {
			grid-template-columns: 1fr;
		}

		.info-grid, .metrics-grid {
			grid-template-columns: 1fr;
		}

		.table-header, .table-row {
			grid-template-columns: 1fr;
			gap: 0.5rem;
		}

		.table-header {
			display: none;
		}

		.table-row {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			padding: 1rem;
		}

		.token-grid {
			grid-template-columns: 1fr;
		}
	}
</style>