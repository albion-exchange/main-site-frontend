<script lang="ts">
	import type { Asset } from '$lib/types/dataStore';

	export let asset: Asset;

	// Use asset data directly from the data store
	$: latestReport = asset.monthlyReports[asset.monthlyReports.length - 1] || null;

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
</script>

<article class="asset-card">
	<div class="asset-image">
		<div class="placeholder-image">{asset.name}</div>
	</div>
	
	<div class="asset-content">
		<header>
			<h3 class="asset-name">{asset.name}</h3>
			<p class="asset-location">{asset.location.state}, {asset.location.country}</p>
		</header>
		
		<p class="asset-description">{asset.description}</p>
		
		<div class="asset-stats">
			<div class="stat">
				<span class="stat-label">Status</span>
				<span class="stat-value">{asset.production.status}</span>
			</div>
			
			{#if latestReport}
				<div class="stat">
					<span class="stat-label">Latest Month</span>
					<span class="stat-value">{formatCurrency(latestReport.netIncome)}</span>
				</div>
			{/if}
			
			<div class="stat">
				<span class="stat-label">Operator</span>
				<span class="stat-value">{asset.operator.name}</span>
			</div>
		</div>
		
		<div class="asset-actions">
			<a href="/assets/{asset.id}" class="btn-secondary">View Details</a>
			<a href="/buy-tokens?asset={asset.id}" class="btn-primary">Buy Tokens</a>
		</div>
	</div>
</article>

<style>
	.asset-card {
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		overflow: hidden;
		background: white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s ease, box-shadow 0.2s ease;
		cursor: pointer;
	}

	.asset-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.asset-image {
		height: 200px;
		overflow: hidden;
	}


	.placeholder-image {
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: 500;
	}

	.asset-content {
		padding: 1.5rem;
	}

	header {
		margin-bottom: 1rem;
	}

	.asset-name {
		font-size: 1.25rem;
		font-weight: 600;
		color: #1a202c;
		margin: 0 0 0.5rem 0;
	}

	.asset-location {
		color: #718096;
		font-size: 0.875rem;
		margin: 0;
	}

	.asset-description {
		color: #2d3748;
		font-size: 0.875rem;
		line-height: 1.5;
		margin: 0 0 1.5rem 0;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.asset-stats {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.stat {
		display: flex;
		flex-direction: column;
	}

	.stat-label {
		font-size: 0.75rem;
		color: #718096;
		text-transform: uppercase;
		font-weight: 500;
		letter-spacing: 0.05em;
	}

	.stat-value {
		font-size: 0.875rem;
		color: #1a202c;
		font-weight: 600;
		margin-top: 0.25rem;
	}

	.asset-actions {
		margin-top: 1.5rem;
		display: flex;
		gap: 0.75rem;
	}

	.btn-primary,
	.btn-secondary {
		flex: 1;
		padding: 0.75rem 1rem;
		text-decoration: none;
		font-weight: 600;
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		text-align: center;
		transition: all 0.2s ease;
		border: 1px solid;
	}

	.btn-primary {
		background: #000;
		color: #fff;
		border-color: #000;
	}

	.btn-primary:hover {
		background: #283c84;
		border-color: #283c84;
	}

	.btn-secondary {
		background: #fff;
		color: #000;
		border-color: #000;
	}

	.btn-secondary:hover {
		background: #000;
		color: #fff;
	}
</style>