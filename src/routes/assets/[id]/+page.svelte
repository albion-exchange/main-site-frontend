<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import dataStoreService from '$lib/services/DataStoreService';
	import type { Asset, Token } from '$lib/types/dataStore';

	let loading = true;
	let error: string | null = null;
	let activeTab = 'overview';
	let unclaimedPayout = 1247.82;
	let assetData: Asset | null = null;
	let assetTokens: Token[] = [];


	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(amount);
	}


	onMount(() => {
		const assetId = $page.params.id;
		
		try {
			// Load asset data from store
			const asset = dataStoreService.getAssetById(assetId);
			
			if (!asset) {
				error = 'Asset not found';
				loading = false;
				return;
			}
			
			assetData = asset;
			
			// Load associated tokens
			const tokens = dataStoreService.getTokensByAssetId(assetId);
			assetTokens = tokens;
			
			loading = false;
		} catch (err) {
			console.error('Error loading asset:', err);
			error = 'Error loading asset data';
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>{assetData?.name || 'Asset Details'} - Albion</title>
	<meta name="description" content="Detailed information about {assetData?.name || 'asset'}" />
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
	{:else}
		<!-- Breadcrumb -->
		<nav class="breadcrumb">
			<a href="/assets" class="breadcrumb-link">← Back to Assets</a>
			<span class="breadcrumb-separator">/</span>
			<span class="breadcrumb-current">{assetData?.name || 'Asset Details'}</span>
		</nav>

		<!-- Asset Header -->
		<div class="asset-header">
			<div class="asset-main-info">
				<div class="asset-title-section">
					<div class="asset-icon">
						<span class="icon-placeholder">🌊</span>
					</div>
					<div class="title-info">
						<h1>{assetData?.name}</h1>
						<div class="asset-meta">
							<span class="location">📍 {assetData?.location.state}, {assetData?.location.country}</span>
						</div>
						<div class="operator-info">
							<span>Operated by {assetData?.operator.name}</span>
							<span>•</span>
							<span>License {assetData?.technical.license}</span>
						</div>
					</div>
				</div>
			</div>

			<div class="asset-metrics">
				<div class="metric">
					<div class="metric-value">{assetData?.production.current}</div>
					<div class="metric-label">Current Production</div>
				</div>
				<div class="metric">
					<div class="metric-value">{assetData?.monthlyReports?.[0]?.netIncome 
						? (assetData.monthlyReports[0].netIncome >= 1000000 
							? '$' + (assetData.monthlyReports[0].netIncome / 1000000).toFixed(2) + 'M'
							: '$' + (assetData.monthlyReports[0].netIncome / 1000).toFixed(0) + 'K')
						: '$127K'}</div>
					<div class="metric-label">Last Monthly Distribution</div>
				</div>
				<div class="metric">
					<div class="metric-value">{assetData?.investment.investorCount}</div>
					<div class="metric-label">Investors</div>
				</div>
			</div>
		</div>

		<!-- Tabs Navigation -->
		<div class="tabs-container">
			<div class="tabs-nav">
				<button 
					class="tab-btn"
					class:active={activeTab === 'overview'}
					on:click={() => activeTab = 'overview'}
				>
					Overview
				</button>
				<button 
					class="tab-btn"
					class:active={activeTab === 'production'}
					on:click={() => activeTab = 'production'}
				>
					Production Data
				</button>
				<button 
					class="tab-btn"
					class:active={activeTab === 'documents'}
					on:click={() => activeTab = 'documents'}
				>
					Documents
				</button>
			</div>

			<!-- Tab Content -->
			<div class="tab-content">
				{#if activeTab === 'overview'}
					<div class="overview-content">
						<div class="fundamentals-grid">
							<div class="fundamentals-section">
								<h4>Asset Fundamentals</h4>
								<div class="detail-rows">
									<div class="detail-row">
										<span>Field Type</span>
										<span>{assetData?.technical.fieldType}</span>
									</div>
									<div class="detail-row">
										<span>Water Depth</span>
										<span>{assetData?.location.waterDepth || 'N/A'}</span>
									</div>
									<div class="detail-row">
										<span>Well Depth</span>
										<span>{assetData?.technical.depth}</span>
									</div>
									<div class="detail-row">
										<span>First Oil</span>
										<span>{assetData?.technical.firstOil}</span>
									</div>
									<div class="detail-row">
										<span>Estimated Life</span>
										<span>{assetData?.technical.estimatedLife}</span>
									</div>
									<div class="detail-row">
										<span>Coordinates</span>
										<span>{assetData?.location.coordinates.lat}°, {assetData?.location.coordinates.lng}°</span>
									</div>
								</div>
							</div>

							<div class="operational-section">
								<h4>Operational Data</h4>
								<div class="detail-rows">
									<div class="detail-row">
										<span>Current Production</span>
										<span>{assetData?.production.current}</span>
									</div>
									<div class="detail-row">
										<span>Peak Production</span>
										<span>{assetData?.production.peak}</span>
									</div>
									<div class="detail-row">
										<span>Expected Remaining Production</span>
										<span>{assetData?.production.expectedRemainingProduction}</span>
									</div>
									<div class="detail-row">
										<span>Operating Costs</span>
										<span>${assetData?.financial.operatingCosts}/bbl</span>
									</div>
									<div class="detail-row">
										<span>Breakeven Price</span>
										<span>${assetData?.financial.breakeven}/bbl</span>
									</div>
									<div class="detail-row">
										<span>Infrastructure</span>
										<span>{assetData?.technical.infrastructure}</span>
									</div>
								</div>
							</div>
						</div>

						<div class="investment-highlights">
							<h4>Investment Highlights</h4>
							<div class="highlights-grid">
								<div class="highlight">
									<div class="highlight-icon">⚡</div>
									<h5>Proven Production</h5>
									<p>5+ years of consistent production with established infrastructure</p>
								</div>
								<div class="highlight">
									<div class="highlight-icon">🛡️</div>
									<h5>Stable Operations</h5>
									<p>Professional operators with proven track record and minimal downtime</p>
								</div>
								<div class="highlight">
									<div class="highlight-icon">📈</div>
									<h5>Premium Payouts</h5>
									<p>14.8% current payout with potential upside from oil price recovery</p>
								</div>
							</div>
						</div>
					</div>
				{:else if activeTab === 'production'}
					<div class="production-content">
						<div class="production-grid">
							<div class="production-history">
								<h4>Recent Production History</h4>
								<div class="history-list">
									{#each (assetData?.monthlyReports || []).slice(0, 6) as report}
										<div class="history-item">
											<div class="month-info">
												<div class="month">{report.month}</div>
												<div class="production">{(report.production / 30).toFixed(0)} bbl/day avg</div>
											</div>
											<div class="revenue-info">
												<div class="revenue">{formatCurrency(report.revenue)}</div>
												<div class="price">${(report.revenue / report.production).toFixed(2)}/bbl</div>
											</div>
										</div>
									{/each}
								</div>
							</div>

							<div class="production-metrics">
								<h4>Production Metrics</h4>
								<div class="uptime-metric">
									<div class="uptime-value">98.2%</div>
									<div class="uptime-label">Uptime Last 12 Months</div>
								</div>
								<div class="metrics-grid">
									<div class="metric-item">
										<div class="metric-value">2,387</div>
										<div class="metric-label">Avg Daily (bbl)</div>
									</div>
									<div class="metric-item">
										<div class="metric-value">15.2</div>
										<div class="metric-label">Days Downtime</div>
									</div>
								</div>
								<div class="detail-rows">
									<div class="detail-row">
										<span>Well Count</span>
										<span>4 active</span>
									</div>
									<div class="detail-row">
										<span>Water Cut</span>
										<span>12.5%</span>
									</div>
									<div class="detail-row">
										<span>Gas-Oil Ratio</span>
										<span>450 scf/bbl</span>
									</div>
									<div class="detail-row">
										<span>Oil Gravity</span>
										<span>38° API</span>
									</div>
								</div>
							</div>
						</div>

						<div class="chart-placeholder">
							<div class="chart-content">
								<div class="chart-icon">📊</div>
								<div class="chart-label">Production Trend Chart</div>
								<div class="chart-note">Monthly production and revenue data (Interactive)</div>
							</div>
						</div>
					</div>
				{:else if activeTab === 'documents'}
					<div class="documents-content">
						<div class="documents-grid">
							<div class="documents-section">
								<h4>Legal Documents</h4>
								<div class="documents-list">
									<div class="document-item">
										<div class="doc-info">
											<div class="doc-icon">📄</div>
											<div class="doc-details">
												<div class="doc-name">Asset Purchase Agreement</div>
												<div class="doc-meta">PDF • 2.4 MB</div>
											</div>
										</div>
										<button class="download-btn">Download</button>
									</div>
									<div class="document-item">
										<div class="doc-info">
											<div class="doc-icon">📄</div>
											<div class="doc-details">
												<div class="doc-name">Operating License PEDL 183</div>
												<div class="doc-meta">PDF • 1.8 MB</div>
											</div>
										</div>
										<button class="download-btn">Download</button>
									</div>
									<div class="document-item">
										<div class="doc-info">
											<div class="doc-icon">📄</div>
											<div class="doc-details">
												<div class="doc-name">Environmental Impact Assessment</div>
												<div class="doc-meta">PDF • 5.2 MB</div>
											</div>
										</div>
										<button class="download-btn">Download</button>
									</div>
									<div class="document-item">
										<div class="doc-info">
											<div class="doc-icon">📄</div>
											<div class="doc-details">
												<div class="doc-name">Token Terms & Conditions</div>
												<div class="doc-meta">PDF • 950 KB</div>
											</div>
										</div>
										<button class="download-btn">Download</button>
									</div>
								</div>
							</div>

							<div class="documents-section">
								<h4>Technical Reports</h4>
								<div class="documents-list">
									<div class="document-item">
										<div class="doc-info">
											<div class="doc-icon">📊</div>
											<div class="doc-details">
												<div class="doc-name">Geological Survey Report 2024</div>
												<div class="doc-meta">PDF • 12.1 MB</div>
											</div>
										</div>
										<button class="download-btn">Download</button>
									</div>
									<div class="document-item">
										<div class="doc-info">
											<div class="doc-icon">📊</div>
											<div class="doc-details">
												<div class="doc-name">Reserve Audit by Ryder Scott</div>
												<div class="doc-meta">PDF • 3.7 MB</div>
											</div>
										</div>
										<button class="download-btn">Download</button>
									</div>
									<div class="document-item">
										<div class="doc-info">
											<div class="doc-icon">📊</div>
											<div class="doc-details">
												<div class="doc-name">Production Forecast Model</div>
												<div class="doc-meta">PDF • 2.1 MB</div>
											</div>
										</div>
										<button class="download-btn">Download</button>
									</div>
									<div class="document-item">
										<div class="doc-info">
											<div class="doc-icon">🗜️</div>
											<div class="doc-details">
												<div class="doc-name">Monthly Production Reports</div>
												<div class="doc-meta">ZIP • 8.9 MB</div>
											</div>
										</div>
										<button class="download-btn">Download</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>
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
		color: var(--color-black);
	}

	/* Breadcrumb */
	.breadcrumb {
		margin-bottom: 2rem;
		font-size: 0.9rem;
		font-weight: var(--font-weight-medium);
	}

	.breadcrumb-link {
		color: var(--color-secondary);
		text-decoration: none;
	}

	.breadcrumb-link:hover {
		color: var(--color-black);
	}

	.breadcrumb-separator {
		margin: 0 0.5rem;
		color: var(--color-light-gray);
	}

	.breadcrumb-current {
		color: var(--color-black);
		font-weight: var(--font-weight-semibold);
	}

	/* Asset Header */
	.asset-header {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		padding: 3rem;
		margin-bottom: 2rem;
	}

	.asset-main-info {
		margin-bottom: 3rem;
	}

	.asset-title-section {
		display: flex;
		align-items: flex-start;
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.asset-icon {
		width: 4rem;
		height: 4rem;
		background: var(--color-light-gray);
		border-radius: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
	}

	.title-info {
		flex: 1;
	}

	.title-info h1 {
		font-size: 2.5rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 1rem;
		line-height: 1.1;
	}

	.asset-meta {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.5rem;
	}

	.location {
		color: var(--color-secondary);
		font-weight: var(--font-weight-medium);
		font-size: 0.9rem;
	}

	.risk-badge {
		background: var(--color-black);
		color: var(--color-white);
		padding: 0.25rem 0.75rem;
		font-size: 0.75rem;
		font-weight: var(--font-weight-bold);
	}

	.operator-info {
		color: var(--color-black);
		font-size: 0.85rem;
		font-weight: var(--font-weight-medium);
	}

	.oil-price {
		text-align: right;
	}

	.price {
		font-size: 1.5rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
	}

	.price-change {
		color: var(--color-primary);
		font-weight: var(--font-weight-bold);
		font-size: 0.9rem;
	}

	.asset-metrics {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2rem;
	}

	.metric {
		text-align: center;
		padding-right: 2rem;
		border-right: 1px solid var(--color-light-gray);
	}

	.metric:last-child {
		border-right: none;
		padding-right: 0;
	}

	.metric-value {
		font-size: 1.5rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
	}

	.metric-label {
		font-size: 0.7rem;
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}


	/* Tabs */
	.tabs-container {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		margin-bottom: 2rem;
	}

	.tabs-nav {
		display: flex;
		border-bottom: 1px solid var(--color-light-gray);
	}

	.tab-btn {
		padding: 1rem 1.5rem;
		background: none;
		border: none;
		font-family: var(--font-family);
		font-weight: var(--font-weight-extrabold);
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-black);
		cursor: pointer;
		transition: all 0.2s ease;
		opacity: 0.6;
	}

	.tab-btn:hover {
		opacity: 1;
		background: var(--color-light-gray);
	}

	.tab-btn.active {
		background: var(--color-black);
		color: var(--color-white);
		opacity: 1;
	}

	.tab-content {
		padding: 2rem;
	}

	/* Tab Content Styles */
	.fundamentals-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 3rem;
		margin-bottom: 3rem;
	}

	.fundamentals-section h4,
	.operational-section h4 {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 1.5rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.detail-rows {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--color-light-gray);
		font-size: 0.9rem;
	}

	.detail-row:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.detail-row span:first-child {
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
	}

	.detail-row span:last-child {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
	}

	.investment-highlights {
		background: var(--color-light-gray);
		border: 1px solid var(--color-light-gray);
		padding: 2rem;
	}

	.investment-highlights h4 {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 1.5rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.highlights-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2rem;
	}

	.highlight {
		text-align: center;
	}

	.highlight-icon {
		width: 3rem;
		height: 3rem;
		background: var(--color-primary);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		margin: 0 auto 1rem;
	}

	.highlight h5 {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.75rem;
		text-transform: uppercase;
		font-size: 0.9rem;
		letter-spacing: 0.05em;
	}

	.highlight p {
		font-size: 0.85rem;
		color: var(--color-black);
		font-weight: var(--font-weight-medium);
		line-height: 1.5;
	}

	/* Production Content */
	.production-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 3rem;
		margin-bottom: 3rem;
	}

	.production-history h4,
	.production-metrics h4 {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 1.5rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.history-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.history-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--color-light-gray);
	}

	.history-item:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.month {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		font-size: 0.9rem;
	}

	.production {
		font-size: 0.8rem;
		color: var(--color-black);
		font-weight: var(--font-weight-medium);
	}

	.revenue {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		font-size: 0.9rem;
	}

	.price {
		font-size: 0.8rem;
		color: var(--color-primary);
		font-weight: var(--font-weight-medium);
	}

	.uptime-metric {
		background: var(--color-light-gray);
		border: 1px solid var(--color-light-gray);
		padding: 1.5rem;
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.uptime-value {
		font-size: 2rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
	}

	.uptime-label {
		font-size: 0.7rem;
		font-weight: var(--font-weight-bold);
		color: var(--color-black);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.metrics-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		margin-bottom: 1.5rem;
	}

	.metric-item {
		text-align: center;
	}

	.metric-item .metric-value {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-primary);
		margin-bottom: 0.25rem;
	}

	.metric-item .metric-label {
		font-size: 0.7rem;
		font-weight: var(--font-weight-bold);
		color: var(--color-black);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.chart-placeholder {
		height: 16rem;
		background: linear-gradient(135deg, var(--color-light-gray), var(--color-white));
		border: 1px solid var(--color-light-gray);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.chart-content {
		text-align: center;
	}

	.chart-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
		opacity: 0.5;
	}

	.chart-label {
		font-weight: var(--font-weight-bold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
	}

	.chart-note {
		font-size: 0.75rem;
		color: var(--color-black);
		opacity: 0.7;
	}

	/* Risk Content */
	.risk-metrics-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 2rem;
	}

	.risk-metric {
		border: 1px solid var(--color-light-gray);
		padding: 1.5rem;
	}

	.risk-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.risk-label {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		font-size: 0.9rem;
	}

	.risk-value-container {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.risk-value {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		font-size: 0.9rem;
	}

	.risk-status {
		width: 0.75rem;
		height: 0.75rem;
		border-radius: 50%;
	}

	.risk-status.excellent {
		background: var(--color-primary);
	}

	.risk-status.good {
		background: var(--color-secondary);
	}

	.risk-status.low {
		background: #fbbf24;
	}

	.risk-status.minimal {
		background: var(--color-primary);
	}

	.risk-description {
		font-size: 0.85rem;
		color: var(--color-black);
		font-weight: var(--font-weight-medium);
		line-height: 1.5;
	}

	/* Documents Content */
	.documents-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 3rem;
	}

	.documents-section h4 {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 1.5rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.documents-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.document-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border: 1px solid var(--color-light-gray);
		padding: 1rem;
	}

	.doc-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.doc-icon {
		font-size: 1.25rem;
		opacity: 0.7;
	}

	.doc-name {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		font-size: 0.85rem;
	}

	.doc-meta {
		font-size: 0.75rem;
		color: var(--color-black);
		font-weight: var(--font-weight-medium);
		opacity: 0.7;
	}

	.download-btn {
		padding: 0.5rem 1rem;
		border: 1px solid var(--color-black);
		background: var(--color-white);
		color: var(--color-black);
		font-family: var(--font-family);
		font-weight: var(--font-weight-bold);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.download-btn:hover {
		background: var(--color-black);
		color: var(--color-white);
	}

	.btn-primary {
		padding: 1rem 2rem;
		background: var(--color-black);
		color: var(--color-white);
		text-decoration: none;
		font-weight: var(--font-weight-semibold);
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		display: inline-block;
		transition: background-color 0.2s ease;
	}

	.btn-primary:hover {
		background: var(--color-secondary);
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.asset-details {
			padding: 1rem;
		}

		.asset-header {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.asset-title-section {
			flex-direction: column;
			gap: 1rem;
		}

		.asset-metrics {
			grid-template-columns: 1fr;
		}

		.metric {
			border-right: none;
			border-bottom: 1px solid var(--color-light-gray);
			padding-right: 0;
			padding-bottom: 1rem;
		}

		.metric:last-child {
			border-bottom: none;
			padding-bottom: 0;
		}

		.tabs-nav {
			flex-wrap: wrap;
		}

		.tab-btn {
			flex: 1;
			min-width: 0;
		}

		.fundamentals-grid,
		.production-grid,
		.risk-metrics-grid,
		.documents-grid {
			grid-template-columns: 1fr;
		}

		.highlights-grid {
			grid-template-columns: 1fr;
		}
	}
</style>