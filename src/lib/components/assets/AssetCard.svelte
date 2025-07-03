<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Asset } from '$lib/types/dataStore';
	import { dataStoreService } from '$lib/services/DataStoreService';
	import { Card, CardImage, CardContent, CardActions, PrimaryButton, SecondaryButton } from '$lib/components/ui';

	export let asset: Asset;
	
	const dispatch = createEventDispatcher();

	// Use asset data directly from the data store
	$: latestReport = asset.monthlyReports[asset.monthlyReports.length - 1] || null;

	// Get the primary royalty token for this asset (first royalty token found)
	$: royaltyTokens = dataStoreService.getTokensByAssetId(asset.id).filter(token => token.tokenType === 'royalty');
	$: primaryToken = royaltyTokens.length > 0 ? royaltyTokens[0] : null;

	// Extract token data with fallbacks
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
	
	function handleBuyTokens() {
		dispatch('buyTokens', { assetId: asset.id });
	}

</script>

<Card hoverable clickable on:click={() => window.location.href = `/assets/${asset.id}`}>
	<CardImage src={getAssetImage(asset.id)} alt={asset.name} zoomOnHover />
	
	<CardContent>
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
				<span class="stat-label">Share of Asset</span>
				<span class="stat-value">{shareOfAsset}</span>
			</div>
			
			<div class="stat">
				<span class="stat-label">Operator</span>
				<span class="stat-value">{asset.operator.name}</span>
			</div>
		</div>
		
		<CardActions>
			<SecondaryButton href="/assets/{asset.id}" on:click={(e) => e.stopPropagation()}>
				View Details
			</SecondaryButton>
			{#if royaltyTokens.length > 0}
				<PrimaryButton on:click={(e) => { e.stopPropagation(); handleBuyTokens(); }}>
					Buy Tokens
				</PrimaryButton>
			{:else}
				<SecondaryButton disabled>
					No Tokens Available
				</SecondaryButton>
			{/if}
		</CardActions>
	</CardContent>
</Card>

<style>
	/* Card-specific styles are now handled by Card components */

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

	/* Asset actions spacing */
	:global(.card-actions) {
		margin-top: 1.5rem;
	}

</style>