<script lang="ts">
	import type { Asset } from '$lib/types/dataStore';
	import { dataStoreService } from '$lib/services/DataStoreService';

	export let asset: Asset;

	// Use asset data directly from the data store
	$: latestReport = asset.monthlyReports[asset.monthlyReports.length - 1] || null;

	// Get the primary royalty token for this asset (first royalty token found)
	$: royaltyTokens = dataStoreService.getTokensByAssetId(asset.id).filter(token => token.tokenType === 'royalty');
	$: primaryToken = royaltyTokens.length > 0 ? royaltyTokens[0] : null;

	// Extract token data with fallbacks
	$: estimatedBaseReturn = primaryToken?.returns?.baseReturn ? `${primaryToken.returns.baseReturn}%` : 'TBD';
	$: estimatedBonusReturn = primaryToken?.returns?.bonusReturn ? `${primaryToken.returns.bonusReturn}%` : 'TBD';
	$: shareOfAsset = primaryToken?.assetShare?.sharePercentage ? `${primaryToken.assetShare.sharePercentage}%` : 'TBD';

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

	function formatEndDate(dateStr: string): string {
		if (!dateStr) return 'TBD';
		const [year, month] = dateStr.split('-');
		const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
							 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		return `${monthNames[parseInt(month) - 1]} ${year}`;
	}

	function getAssetImage(assetId: string): string {
		// Map each asset to specific oil & gas industry images
		const imageMap: Record<string, string> = {
			'europa-wressle-release-1': '/images/assets/europa-wressle-1.jpg', // Wressle oil field (UK onshore)
			'bakken-horizon-field': '/images/assets/bakken-horizon-1.jpeg', // Bakken shale operations (ND)
			'permian-basin-venture': '/images/assets/permian-basin-1.jpg', // Permian basin operations (TX)
			'gulf-mexico-deep-water': '/images/assets/gom-deepwater-1.avif' // Gulf of Mexico offshore platform
		};
		
		// Fallback to a generic oil industry image
		return imageMap[assetId] || '/images/assets/europa-wressle-1.jpg';
	}

</script>

<article class="asset-card">
	<div class="asset-image">
		<img 
			src={getAssetImage(asset.id)} 
			alt={asset.name}
			loading="lazy"
		/>
	</div>
	
	<div class="asset-content">
		<header>
			<h3 class="asset-name">{asset.name}</h3>
			<p class="asset-location">{asset.location.state}, {asset.location.country}</p>
		</header>
		
		<!-- Highlighted Big Stats -->
		<div class="highlighted-stats">
			<div class="highlight-stat">
				<span class="highlight-value">{asset.production.current}</span>
				<span class="highlight-label">Current Production</span>
			</div>
			<div class="highlight-stat">
				<span class="highlight-value">{asset.production.expectedRemainingProduction}</span>
				<span class="highlight-label">Expected Remaining</span>
			</div>
			<div class="highlight-stat">
				<span class="highlight-value">{formatEndDate(asset.technical.expectedEndDate)}</span>
				<span class="highlight-label">Expected End Date</span>
			</div>
		</div>
		
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
				<span class="stat-label">Estimated Base Return</span>
				<span class="stat-value">{estimatedBaseReturn}</span>
			</div>
			
			<div class="stat">
				<span class="stat-label">Estimated Bonus Return</span>
				<span class="stat-value">{estimatedBonusReturn}</span>
			</div>
			
			<div class="stat">
				<span class="stat-label">Share of Asset</span>
				<span class="stat-value">{shareOfAsset}</span>
			</div>
			
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
		position: relative;
	}

	.asset-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	.asset-card:hover .asset-image img {
		transform: scale(1.05);
	}

	.asset-content {
		padding: 1.5rem;
	}

	.highlighted-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		margin: 1rem 0 1.5rem 0;
		padding: 1rem;
		background: #f8f4f4;
		border-radius: 8px;
	}

	.highlight-stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.highlight-value {
		font-size: 1.25rem;
		font-weight: 700;
		color: #283c84;
		margin-bottom: 0.25rem;
	}

	.highlight-label {
		font-size: 0.75rem;
		color: #718096;
		text-transform: uppercase;
		font-weight: 500;
		letter-spacing: 0.05em;
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
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}
	
	@media (min-width: 400px) {
		.asset-stats {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (max-width: 400px) {
		.highlighted-stats {
			grid-template-columns: 1fr;
			gap: 0.75rem;
		}
		
		.highlight-value {
			font-size: 1.1rem;
		}
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