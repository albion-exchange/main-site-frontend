<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Asset } from '$lib/types/dataStore';
	import dataStoreService from '$lib/services/DataStoreService';
	import { Card, CardImage, CardContent, CardActions, PrimaryButton, SecondaryButton } from '$lib/components/ui';
	import { getAssetCoverImage } from '$lib/utils/assetImages';

	export let asset: Asset;
	
	const dispatch = createEventDispatcher();

	// Use asset data directly from the data store
	$: latestReport = asset.monthlyReports[asset.monthlyReports.length - 1] || null;

	// Get the primary royalty token for this asset (first royalty token found)
	$: royaltyTokens = dataStoreService.getTokensByAssetId(asset.id).filter(token => token.tokenType === 'royalty');
	$: primaryToken = royaltyTokens.length > 0 ? royaltyTokens[0] : null;
	
	// Check if any tokens are available
	$: hasAvailableTokens = royaltyTokens.some(token => {
		const supply = dataStoreService.getTokenSupply(token.contractAddress);
		return supply && supply.availableSupply > 0;
	});

	// Extract token data with fallbacks
	$: shareOfAsset = primaryToken?.sharePercentage ? `${primaryToken.sharePercentage}%` : 'TBD';

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

	function getAssetImage(asset: Asset): string {
		return getAssetCoverImage(asset.id);
	}
	
	function handleBuyTokens() {
		dispatch('buyTokens', { assetId: asset.id });
	}

</script>

<Card hoverable clickable on:click={() => window.location.href = `/assets/${asset.id}`}>
	<CardImage src={getAssetImage(asset)} alt={asset.name} zoomOnHover />
	
	<CardContent>
		<header>
			<div class="header-main">
				<div class="name-location">
					<h3 class="asset-name">{asset.name}</h3>
					<p class="asset-location">{asset.location.state}, {asset.location.country}</p>
				</div>
				<div class="operator">
					<span class="operator-label">Operator</span>
					<span class="operator-name">{asset.operator.name}</span>
				</div>
			</div>
		</header>
		
		<!-- Highlighted Big Stats -->
		<div class="highlighted-stats">
			<div class="highlight-stat">
				<span class="highlight-value">{dataStoreService.getCalculatedRemainingProduction(asset.id)}</span>
				<span class="highlight-label">Expected Remaining</span>
			</div>
			<div class="highlight-stat">
				<span class="highlight-value">{formatEndDate(asset.technical.expectedEndDate)}</span>
				<span class="highlight-label">Expected End Date</span>
			</div>
			{#if latestReport}
				<div class="highlight-stat">
					<span class="highlight-value">{formatCurrency(latestReport.netIncome)}</span>
					<span class="highlight-label">Latest Payment</span>
				</div>
			{/if}
		</div>
		
		<p class="asset-description">{asset.description}</p>
		
		<!-- View Details Button -->
		<div class="view-details-section">
			<PrimaryButton href="/assets/{asset.id}" fullWidth on:click={(e) => e.stopPropagation()}>
				{hasAvailableTokens ? 'View details and buy tokens' : 'View details'}
			</PrimaryButton>
		</div>

		<!-- Available Tokens Section -->
		{#if hasAvailableTokens}
			{@const availableTokens = royaltyTokens.filter(token => {
				const supply = dataStoreService.getTokenSupply(token.contractAddress);
				return supply && supply.availableSupply > 0;
			})}
			<div class="tokens-section">
				<h4 class="tokens-title">Available Token Releases</h4>
				<div class="tokens-list" class:scrollable={availableTokens.length > 2}>
					{#each availableTokens as token}
						{@const calculatedReturns = dataStoreService.getCalculatedTokenReturns(token.contractAddress)}
						{@const baseReturn = calculatedReturns?.baseReturn ? Math.round(calculatedReturns.baseReturn) : 0}
						{@const bonusReturn = calculatedReturns?.bonusReturn ? Math.round(calculatedReturns.bonusReturn) : 0}
						{@const firstPaymentMonth = token.firstPaymentDate || 'TBD'}
						<button 
							class="token-button" 
							on:click|stopPropagation={() => handleBuyTokens()}
						>
							<div class="token-button-left">
								<span class="token-symbol">{token.symbol}</span>
								<span class="token-name">{token.name}</span>
								<span class="token-payment-date">First payment: {firstPaymentMonth}</span>
							</div>
							<div class="token-button-right">
								<div class="returns-display">
									<div class="return-item">
										<span class="return-label">Est. Base</span>
										<span class="return-value">{baseReturn}%</span>
									</div>
									<div class="return-divider">+</div>
									<div class="return-item">
										<span class="return-label">Est. Bonus</span>
										<span class="return-value bonus">{bonusReturn}%</span>
									</div>
								</div>
								<span class="buy-cta">Buy Now →</span>
							</div>
						</button>
					{/each}
				</div>
			</div>
		{/if}
		
	</CardContent>
</Card>

<style>
	/* Card-specific styles are now handled by Card components */

	.highlighted-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
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

	.header-main {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
	}

	.name-location {
		flex: 1;
	}

	.operator {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		text-align: right;
	}

	.operator-label {
		font-size: 0.75rem;
		color: #718096;
		text-transform: uppercase;
		font-weight: 500;
		letter-spacing: 0.05em;
		margin-bottom: 0.25rem;
	}

	.operator-name {
		font-size: 0.875rem;
		color: #1a202c;
		font-weight: 600;
	}

	.asset-name {
		font-size: 1.25rem;
		font-weight: 600;
		color: #1a202c;
		margin: 0 0 0.5rem 0;
		min-height: 3.125rem; /* Reserve space for exactly 2 lines (1.25rem * 2 + extra space) */
		line-height: 1.25;
		display: flex;
		align-items: flex-start;
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
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.view-details-section {
		margin: 1.5rem 0;
	}

	.tokens-section {
		margin: 1.5rem 0;
	}

	.tokens-title {
		font-size: 1rem;
		font-weight: 600;
		color: #1a202c;
		margin: 0 0 1rem 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.tokens-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.tokens-list.scrollable {
		max-height: calc(2 * (5rem + 0.75rem) + 1rem); /* Height for 2 items with padding + gaps + extra space */
		overflow-y: auto;
		padding-right: 0.5rem;
		padding-bottom: 0.5rem; /* Extra padding to prevent cut-off */
	}

	.tokens-list.scrollable::-webkit-scrollbar {
		width: 4px;
	}

	.tokens-list.scrollable::-webkit-scrollbar-track {
		background: #f1f1f1;
		border-radius: 2px;
	}

	.tokens-list.scrollable::-webkit-scrollbar-thumb {
		background: #c1c1c1;
		border-radius: 2px;
	}

	.tokens-list.scrollable::-webkit-scrollbar-thumb:hover {
		background: #a8a8a8;
	}

	.token-button {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: 1rem;
		background: var(--color-white);
		border: 2px solid var(--color-primary-blue);
		border-radius: 0;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
		position: relative;
	}


	.token-button:hover:not(.unavailable) {
		background: rgba(8, 188, 204, 0.05);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(8, 188, 204, 0.15);
		border-color: var(--color-primary-blue);
	}


	.token-button-left {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.token-button-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.5rem;
	}

	.token-symbol {
		font-weight: 700;
		font-size: 0.875rem;
		color: var(--color-black);
		text-transform: uppercase;
	}

	.token-name {
		font-size: 0.75rem;
		color: #718096;
		line-height: 1.2;
	}

	.token-payment-date {
		font-size: 0.7rem;
		color: var(--color-secondary-blue);
		font-weight: 500;
		margin-top: 0.25rem;
	}

	.returns-display {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.return-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.return-label {
		font-size: 0.625rem;
		color: #718096;
		text-transform: uppercase;
		font-weight: 500;
		letter-spacing: 0.05em;
	}

	.return-value {
		font-size: 1rem;
		color: var(--color-secondary-blue);
		font-weight: 700;
	}

	.return-value.bonus {
		color: var(--color-primary-blue);
	}

	.return-divider {
		font-size: 0.875rem;
		color: #718096;
		font-weight: 500;
		margin: 0 0.25rem;
	}

	.buy-cta {
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--color-primary-blue);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	@media (max-width: 400px) {
		.highlighted-stats {
			grid-template-columns: repeat(2, 1fr);
			gap: 0.75rem;
		}
		
		.highlight-value {
			font-size: 1.1rem;
		}

		.header-main {
			flex-direction: column;
			align-items: flex-start;
		}

		.operator {
			align-items: flex-start;
			text-align: left;
		}

		.token-button {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.75rem;
		}

		.token-button-right {
			width: 100%;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
		}

		.returns-display {
			font-size: 0.875rem;
		}

		.return-value {
			font-size: 0.875rem;
		}
	}


</style>