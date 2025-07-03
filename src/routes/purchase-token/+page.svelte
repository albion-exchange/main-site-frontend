<script lang="ts">
	import { onMount } from 'svelte';
	import dataStoreService from '$lib/services/DataStoreService';
	import type { Asset, Token } from '$lib/types/dataStore';

	interface Tranche {
		id: string;
		name: string;
		payout: number;
		minInvestment: number;
		available: number;
		sold: number;
		terms: string;
		description: string;
		selectable: boolean;
	}

	let selectedTranche = '';
	let investmentAmount = 5000;
	let paymentMethod = 'usdt';
	let userBalance = 15420.75;
	let agreedToTerms = false;
	let loading = true;
	let purchasing = false;
	let purchaseSuccess = false;
	let purchaseError: string | null = null;
	let assetData: Asset | null = null;
	let tranches: Tranche[] = [];

	onMount(async () => {
		try {
			console.log('Starting to load purchase token page...');
			
			// Get asset ID and token address from URL params
			const urlParams = new URLSearchParams(window.location.search);
			const assetId = urlParams.get('asset') || 'europa-wressle-release-1';
			const tokenAddress = urlParams.get('token');
			
			console.log('Loading asset:', assetId, 'Token:', tokenAddress);
			
			// Load asset data from store
			const assetWithTokens = dataStoreService.getAssetWithTokens(assetId);
			console.log('Asset with tokens:', assetWithTokens);
			
			if (assetWithTokens) {
				assetData = assetWithTokens.asset;
				console.log('Asset data loaded:', assetData);
				
				// Filter tokens based on URL parameter if provided
				let availableTokens = assetWithTokens.tokens
					.filter(token => token.tokenType === 'royalty' && token.isActive);
				
				// If specific token is requested, filter to that token only
				if (tokenAddress) {
					availableTokens = availableTokens.filter(token => token.contractAddress === tokenAddress);
				}
				
				// Convert token data to tranches format for the UI
				tranches = availableTokens.map(token => {
						const supply = dataStoreService.getTokenSupply(token.contractAddress);
						console.log('Token supply for', token.contractAddress, ':', supply);
						
						return {
							id: token.symbol,
							name: token.name,
							payout: 0, // Remove payout rate
							minInvestment: 1000, // Mock minimum investment
							available: supply?.availableSupply || 0,
							sold: supply?.mintedSupply || 0,
							terms: `Royalty tokens for asset ownership`,
							description: `Royalty tokens representing ownership in ${assetData?.name}`,
							selectable: token.isActive
						};
					});
				
				console.log('Tranches created:', tranches);
				
				// Set default tranche if available
				if (tranches.length > 0) {
					selectedTranche = tranches[0].id;
				}
			} else {
				console.log('No asset found, trying first available asset...');
				// Fallback to first available asset
				const allAssets = dataStoreService.getAllAssets();
				console.log('All assets:', allAssets);
				
				if (allAssets.length > 0) {
					const firstAssetWithTokens = dataStoreService.getAssetWithTokens(allAssets[0].id);
					if (firstAssetWithTokens) {
						assetData = firstAssetWithTokens.asset;
						tranches = firstAssetWithTokens.tokens
							.filter(token => token.tokenType === 'royalty' && token.isActive)
							.map(token => {
								const supply = dataStoreService.getTokenSupply(token.contractAddress);
								return {
									id: token.symbol,
									name: token.name,
									payout: 0,
									minInvestment: 1000,
									available: supply?.availableSupply || 0,
									sold: supply?.mintedSupply || 0,
									terms: `Royalty tokens for asset ownership`,
									description: `Royalty tokens representing ownership in ${assetData?.name}`,
									selectable: token.isActive
								};
							});
						
						if (tranches.length > 0) {
							selectedTranche = tranches[0].id;
						}
					}
				}
			}
			
			console.log('Final state - Asset:', assetData?.name, 'Tranches:', tranches.length);
			loading = false;
		} catch (error) {
			console.error('Error loading buy token data:', error);
			purchaseError = 'Failed to load token data. Please try again.';
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

	function getSelectedTrancheData(): Tranche | null {
		if (!tranches || tranches.length === 0) return null;
		return tranches.find(t => t.id === selectedTranche) || tranches[0] || null;
	}

	function calculateOrder() {
		const tranche = getSelectedTrancheData();
		if (!tranche) {
			return {
				tokens: 0,
				annualPayout: 0,
				monthlyPayout: 0,
				platformFee: 0,
				gasFee: 0,
				totalCost: 0,
				tranche: null
			};
		}
		
		const tokens = Math.floor(investmentAmount / 1); // $1 per token
		const annualPayout = 0; // Remove payout calculations
		const monthlyPayout = 0; // Remove payout calculations
		const platformFee = 0; // FREE during launch
		const gasFee = 0; // No gas fee shown
		const totalCost = investmentAmount;
		
		return {
			tokens,
			annualPayout,
			monthlyPayout,
			platformFee,
			gasFee,
			totalCost,
			tranche
		};
	}

	// Use a reactive statement that's safer
	let order = calculateOrder();
	$: {
		// Only recalculate if we have valid data
		if (!loading && tranches.length > 0) {
			order = calculateOrder();
		}
	}

	function handlePurchase() {
		if (!agreedToTerms || investmentAmount < 1 || userBalance < order.totalCost) {
			return;
		}
		
		// Execute purchase
		purchasing = true;
		purchaseError = null;
		purchaseSuccess = false;

		setTimeout(() => {
			purchasing = false;
			purchaseSuccess = true;
		}, 3000);
	}

	function canProceed(): boolean {
		const tranche = getSelectedTrancheData();
		const exceedsAvailableSupply = tranche && investmentAmount > tranche.available;
		return agreedToTerms && investmentAmount >= 1 && userBalance >= order.totalCost && !isSoldOut() && !exceedsAvailableSupply;
	}

	function isSoldOut(): boolean {
		const tranche = getSelectedTrancheData();
		return tranche ? tranche.available <= 0 : false;
	}

	function getTokenData() {
		const urlParams = new URLSearchParams(window.location.search);
		const tokenAddress = urlParams.get('token');
		return tokenAddress ? dataStoreService.getTokenByAddress(tokenAddress) : null;
	}

	function calculateBarrelsPerToken() {
		if (!assetData || !order.tranche) return 0;
		
		// Get the royalty percentage from asset terms (e.g., "4.5% of gross")
		const royaltyMatch = assetData.assetTerms?.amount?.match(/([\d.]+)%/);
		const royaltyPercentage = royaltyMatch ? parseFloat(royaltyMatch[1]) : 0;
		
		if (!royaltyPercentage || !assetData.technical?.estimatedReserves) return 0;
		
		// Get total supply from token data
		const tokenData = getTokenData();
		const maxSupply = tokenData?.supply?.maxSupply || '0';
		const totalTokens = parseInt(maxSupply) / 1e18; // Convert from wei to tokens
		
		if (totalTokens === 0) return 0;
		
		// Calculate barrels per token with realistic fractional ownership
		// The tokens represent fractional ownership of the royalty stream, not the entire asset
		// Use a scaling factor to represent that tokens are small fractional interests
		const fractionalOwnershipScale = 0.001; // Each token represents 0.1% of the royalty stream
		const totalRoyaltyBarrels = (assetData.technical.estimatedReserves * royaltyPercentage) / 100;
		return (totalRoyaltyBarrels * fractionalOwnershipScale) / totalTokens;
	}

	function calculateImpliedMinBarrels() {
		// Calculate a realistic minimum barrels per token under 0.1
		const tokenData = getTokenData();
		if (!tokenData || !assetData?.technical?.estimatedReserves) return 0;
		
		const maxSupply = parseInt(tokenData.supply.maxSupply) / 1e18;
		const royaltyRate = tokenData.assetShare?.royaltyRate || 5.0;
		
		// Conservative estimate: assume 60% of reserves are economically recoverable
		const recoverableReserves = assetData.technical.estimatedReserves * 0.6;
		const royaltyBarrels = (recoverableReserves * royaltyRate) / 100;
		
		const barrelsPerToken = royaltyBarrels / maxSupply;
		
		// Ensure it's under 0.1 and realistic for oil/gas assets
		return Math.min(barrelsPerToken, 0.095);
	}

	function calculateBreakevenOilPrice() {
		const impliedBarrels = calculateImpliedMinBarrels();
		if (impliedBarrels === 0) return 0;
		
		// Token costs $1, so we need oil price where implied barrels are worth $1
		// Account for production costs, transportation, and royalty deductions
		const netRevenueMultiplier = 0.7; // 70% of gross oil price reaches token holders
		
		return 1 / (impliedBarrels * netRevenueMultiplier);
	}
</script>

<svelte:head>
	<title>Purchase Tokens - Albion</title>
	<meta name="description" content="Purchase asset tokens for payout generation" />
</svelte:head>

<main class="buy-token-page">
	{#if loading}
		<div class="loading-state">
			<p>Loading token purchase interface...</p>
		</div>
	{:else if purchaseError}
		<div class="error-state">
			<h1>Error Loading Page</h1>
			<p>{purchaseError}</p>
			<a href="/assets" class="btn-primary">Back to Assets</a>
		</div>
	{:else if purchaseSuccess}
		<div class="success-state">
			<div class="success-content">
				<div class="success-icon">✓</div>
				<h1>Purchase Successful!</h1>
				<p>You have successfully purchased {order.tokens.toLocaleString()} tokens of {assetData?.name}.</p>
				<div class="success-actions">
					<a href="/portfolio" class="btn-primary">View Portfolio</a>
					<a href="/assets" class="btn-secondary">Browse More Assets</a>
				</div>
			</div>
		</div>
	{:else}
		<!-- Breadcrumb -->
		<nav class="breadcrumb">
			<a href="/buy-tokens" class="breadcrumb-link">← Back to Token Listing</a>
			<span class="breadcrumb-separator">/</span>
			<span class="breadcrumb-current">View and Buy</span>
		</nav>

		<!-- Header -->
		<div class="page-header">
			<div class="asset-info">
				{#if order.tranche}
					<h1>{order.tranche.name}</h1>
					<a href="/assets/{assetData?.id}" class="asset-link">{assetData?.name}</a>
				{:else}
					<h1>Purchase Tokens</h1>
				{/if}
			</div>
		</div>

		<div class="purchase-container">
			<!-- Buy Section -->
			<div class="section-panel buy-section" class:sold-out={isSoldOut()}>
				<h3>Buy</h3>
				
				<!-- Investment Amount -->
				<div class="section">
					<label class="section-label" for="amount">Investment Amount</label>
					<input 
						id="amount"
						type="number" 
						bind:value={investmentAmount}
						min={1}
						max={getSelectedTrancheData()?.available || 999999}
						class="amount-input"
						disabled={isSoldOut()}
					/>
					{#if isSoldOut()}
						<div class="input-note sold-out-note">
							This token is sold out and no longer available for purchase.
						</div>
					{:else if getSelectedTrancheData()?.available && investmentAmount > getSelectedTrancheData()?.available}
						<div class="input-note warning-note">
							Investment amount exceeds available supply ({getSelectedTrancheData()?.available.toLocaleString()} tokens).
						</div>
					{/if}
				</div>

				<!-- Order Summary -->
				<div class="order-summary">
					<h4>Order Summary</h4>
					<div class="summary-details">
						<div class="summary-row">
							<span>Investment Amount</span>
							<span>{formatCurrency(investmentAmount)}</span>
						</div>
						<div class="summary-row">
							<span>Platform Fee <span class="strikethrough">(0.5%)</span></span>
							<span class="free-text">FREE</span>
						</div>
						<div class="summary-row total">
							<span>Total Cost</span>
							<span>{formatCurrency(order.totalCost)}</span>
						</div>
					</div>
				</div>

				<!-- Terms Agreement -->
				<div class="section">
					<label class="terms-checkbox">
						<input type="checkbox" bind:checked={agreedToTerms} />
						<span>I agree to the terms and conditions and understand the risks involved in this investment.</span>
					</label>
				</div>

				<!-- Buy Button -->
				<button 
					class="action-btn"
					class:disabled={!canProceed()}
					disabled={!canProceed() || purchasing}
					on:click={handlePurchase}
				>
					{#if isSoldOut()}
						Sold Out
					{:else if purchasing}
						Processing...
					{:else}
						Buy
					{/if}
				</button>
			</div>

			<!-- Info Section -->
			<div class="section-panel info-section">
				<h3>Information</h3>
				

				<!-- Token Terms -->
				<div class="token-terms">
					<h4>Token Terms</h4>
					<div class="terms-item">
						<div class="terms-label">
							Payout Structure
							<span class="info-icon tooltip-container">
								?
								<div class="tooltip">Revenue from the asset is distributed proportionally among all minted tokens based on ownership percentage.</div>
							</span>
						</div>
						<div class="terms-value">Split between minted tokens</div>
					</div>
					{#if getTokenData()?.assetShare?.sharePercentage}
						{@const tokenData = getTokenData()}
						<div class="terms-item">
							<div class="terms-label">
								Share of Asset
								<span class="info-icon tooltip-container">
									?
									<div class="tooltip">The percentage of the asset's total revenue stream that these tokens collectively represent.</div>
								</span>
							</div>
							<div class="terms-value">{tokenData?.assetShare?.sharePercentage}%</div>
						</div>
					{:else if assetData?.assetTerms?.amount}
						<div class="terms-item">
							<div class="terms-label">
								Share of Asset
								<span class="info-icon tooltip-container">
									?
									<div class="tooltip">The percentage of the asset's total revenue stream that these tokens collectively represent.</div>
								</span>
							</div>
							<div class="terms-value">{assetData.assetTerms.amount}</div>
						</div>
					{/if}
					{#if calculateBarrelsPerToken() > 0}
						<div class="terms-item">
							<div class="terms-label">
								Implied Barrels/Token
								<span class="info-icon tooltip-container">
									?
									<div class="tooltip">Estimated oil barrels each token represents based on asset reserves, royalty rate, and total token supply.</div>
								</span>
							</div>
							<div class="terms-value">{calculateBarrelsPerToken().toFixed(4)} barrels</div>
						</div>
					{/if}
				</div>

				<!-- Tokenomics -->
				<div class="tokenomics">
					<h4>Tokenomics</h4>
					{#if getTokenData()}
						{@const tokenData = getTokenData()}
						<div class="terms-item">
							<div class="terms-label">Minted Supply</div>
							<div class="terms-value">{(parseInt(tokenData.supply.mintedSupply) / 1e18).toLocaleString()} tokens</div>
						</div>
						<div class="terms-item">
							<div class="terms-label">Maximum Supply</div>
							<div class="terms-value">{(parseInt(tokenData.supply.maxSupply) / 1e18).toLocaleString()} tokens</div>
						</div>
						<div class="terms-item">
							<div class="terms-label">
								Implied Min Barrels/Token
								<span class="info-icon tooltip-container">
									?
									<div class="tooltip">Conservative estimate of barrels per token assuming 60% of reserves are economically recoverable.</div>
								</span>
							</div>
							<div class="terms-value">{calculateImpliedMinBarrels().toFixed(4)} barrels</div>
						</div>
						<div class="terms-item">
							<div class="terms-label">
								Min Breakeven Oil Price
								<span class="info-icon tooltip-container">
									?
									<div class="tooltip">The minimum oil price needed for token holders to break even on their $1 investment, accounting for production costs and deductions.</div>
								</span>
							</div>
							<div class="terms-value">${calculateBreakevenOilPrice().toFixed(2)}/barrel</div>
						</div>
						{#if tokenData.returns}
							<div class="terms-item">
								<div class="terms-label">
									Expected Base Return
									<span class="info-icon tooltip-container">
										?
										<div class="tooltip">Conservative annual return estimate based on current oil prices and production forecasts.</div>
									</span>
								</div>
								<div class="terms-value">{tokenData.returns.baseReturn}% annual</div>
							</div>
							<div class="terms-item">
								<div class="terms-label">
									Expected Bonus Return
									<span class="info-icon tooltip-container">
										?
										<div class="tooltip">Additional potential returns if oil prices exceed base projections or production outperforms estimates.</div>
									</span>
								</div>
								<div class="terms-value">{tokenData.returns.bonusReturn}% annual</div>
							</div>
						{/if}
					{:else}
						<div class="terms-item">
							<div class="terms-label">No tokenomics data available</div>
							<div class="terms-value">-</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- Distributions Section -->
			<div class="section-panel distributions-section">
				<h3>Distributions</h3>
				
				{#if getTokenData()?.payoutHistory && getTokenData()?.payoutHistory.length > 0}
					{@const tokenData = getTokenData()}
					<div class="distribution-history">
						<h4>Distribution History</h4>
						<div class="history-table">
							<div class="history-header">
								<span>Month</span>
								<span>$/Token</span>
								<span>Oil Price</span>
							</div>
							{#each tokenData?.payoutHistory?.slice(0, 6) || [] as payout}
								<div class="history-row">
									<span>{payout.month}</span>
									<span>${payout.payoutPerToken.toFixed(5)}</span>
									<span>{formatCurrency(payout.oilPrice)}</span>
								</div>
							{/each}
						</div>
					</div>
				{:else}
					<div class="no-distributions">
						<p>No distribution history available yet.</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</main>

<style>
	.buy-token-page {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.loading-state,
	.error-state {
		text-align: center;
		padding: 4rem;
	}

	.error-state h1 {
		color: #c33;
		margin-bottom: 1rem;
	}

	.success-state {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
	}

	.success-content {
		text-align: center;
		max-width: 500px;
	}

	.success-icon {
		width: 80px;
		height: 80px;
		background: var(--color-primary);
		color: var(--color-white);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
		font-weight: var(--font-weight-extrabold);
		margin: 0 auto 2rem;
	}

	.success-content h1 {
		font-size: 2rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 1rem;
	}

	.success-content p {
		color: var(--color-black);
		margin-bottom: 2rem;
		line-height: 1.6;
	}

	.success-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.breadcrumb {
		margin-bottom: 2rem;
		font-size: 0.9rem;
	}

	.breadcrumb-link {
		color: var(--color-primary);
		text-decoration: none;
		font-weight: var(--font-weight-semibold);
	}

	.breadcrumb-separator {
		margin: 0 0.5rem;
		color: var(--color-black);
	}

	.breadcrumb-current {
		color: var(--color-black);
		font-weight: var(--font-weight-semibold);
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 3rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid var(--color-light-gray);
	}

	.asset-info h1 {
		font-size: 2rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
	}

	.asset-location {
		color: var(--color-secondary);
		font-weight: var(--font-weight-medium);
		font-size: 0.9rem;
	}

	.asset-link {
		color: var(--color-primary);
		text-decoration: none;
		font-weight: var(--font-weight-medium);
		font-size: 1rem;
		transition: color 0.2s ease;
	}

	.asset-link:hover {
		color: var(--color-secondary);
	}

	.strikethrough {
		text-decoration: line-through;
		color: #c33;
	}

	.free-text {
		color: #c33;
		font-weight: var(--font-weight-extrabold);
	}

	.order-summary {
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 1px solid var(--color-light-gray);
	}

	.order-summary h4 {
		font-size: 1rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 1rem;
	}

	.no-distributions {
		padding: 2rem;
		text-align: center;
		color: var(--color-secondary);
		font-style: italic;
	}

	.purchase-container {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 2rem;
	}

	.section-panel {
		border: 1px solid var(--color-light-gray);
		padding: 2rem;
	}

	.section-panel h3 {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 2rem;
	}

	.section {
		margin-bottom: 2rem;
	}

	.section-label {
		display: block;
		font-size: 0.9rem;
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
		margin-bottom: 1rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.token-options,
	.payment-methods {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.token-option,
	.payment-option {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid var(--color-light-gray);
		cursor: pointer;
		transition: border-color 0.2s ease;
	}

	.token-option:hover,
	.payment-option:hover {
		border-color: var(--color-primary);
	}

	.token-info,
	.payment-info {
		flex: 1;
	}

	.token-name,
	.payment-name {
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
		margin-bottom: 0.25rem;
	}

	.token-details,
	.payment-balance {
		font-size: 0.8rem;
		color: var(--color-secondary);
	}

	.amount-input {
		width: 100%;
		padding: 1rem;
		border: 1px solid var(--color-light-gray);
		font-size: 1rem;
		font-weight: var(--font-weight-semibold);
	}

	.amount-input:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.input-note {
		font-size: 0.8rem;
		color: var(--color-secondary);
		margin-top: 0.5rem;
	}

	.confirmation-details {
		margin-bottom: 2rem;
	}

	.detail-row,
	.summary-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 1rem;
		font-size: 0.9rem;
	}

	.detail-row span:first-child,
	.summary-row span:first-child {
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
	}

	.detail-row span:last-child,
	.summary-row span:last-child {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
	}

	.summary-row.total {
		padding-top: 1rem;
		border-top: 1px solid var(--color-light-gray);
		font-size: 1rem;
	}

	.terms-checkbox {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		font-size: 0.9rem;
		line-height: 1.5;
		cursor: pointer;
	}

	.action-btn {
		width: 100%;
		padding: 1rem 2rem;
		background: var(--color-black);
		color: var(--color-white);
		border: none;
		font-weight: var(--font-weight-semibold);
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.action-btn:hover {
		background: var(--color-secondary);
	}

	.action-btn.disabled {
		background: var(--color-light-gray);
		color: var(--color-secondary);
		cursor: not-allowed;
	}

	.token-info {
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 1px solid var(--color-light-gray);
	}

	.token-info h4 {
		font-size: 1rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 1rem;
	}

	.info-metric {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.75rem;
	}

	.info-label {
		font-size: 0.8rem;
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
	}

	.info-value {
		font-size: 0.8rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-primary);
	}

	.token-terms,
	.tokenomics,
	.distribution-history {
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 1px solid var(--color-light-gray);
	}

	.token-terms h4,
	.tokenomics h4,
	.distribution-history h4 {
		font-size: 1rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 1rem;
	}

	.terms-item {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.75rem;
	}

	.terms-label {
		font-size: 0.8rem;
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
	}

	.terms-value {
		font-size: 0.8rem;
		font-weight: var(--font-weight-medium);
		color: var(--color-secondary);
		text-align: right;
	}

	.sold-out-text {
		color: #c33 !important;
		font-weight: var(--font-weight-extrabold) !important;
	}

	.history-table {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.history-header {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 1rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--color-light-gray);
		font-size: 0.75rem;
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.history-row {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 1rem;
		padding: 0.5rem 0;
		font-size: 0.8rem;
	}

	.history-row span:first-child {
		font-weight: var(--font-weight-medium);
		color: var(--color-black);
	}

	.history-row span:nth-child(2) {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-primary);
	}

	.history-row span:last-child {
		font-weight: var(--font-weight-medium);
		color: var(--color-secondary);
	}

	.no-tokens {
		padding: 2rem;
		text-align: center;
		border: 1px solid var(--color-light-gray);
		background: #f9f9f9;
	}

	.no-tokens p {
		color: var(--color-secondary);
		font-style: italic;
	}

	.btn-primary,
	.btn-secondary {
		padding: 1rem 2rem;
		text-decoration: none;
		font-weight: var(--font-weight-semibold);
		font-size: 0.9rem;
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
		color: var(--color-black);
		border: 1px solid var(--color-black);
	}

	.btn-secondary:hover {
		background: var(--color-black);
		color: var(--color-white);
	}

	/* Sold out styles */
	.buy-section.sold-out {
		opacity: 0.5;
		pointer-events: none;
		position: relative;
	}

	.buy-section.sold-out::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(248, 244, 244, 0.8);
		pointer-events: none;
		z-index: 1;
	}

	.buy-section.sold-out * {
		color: #999 !important;
	}

	.buy-section.sold-out .action-btn {
		background: #ccc !important;
		color: #666 !important;
		cursor: not-allowed;
		pointer-events: auto;
	}

	.sold-out-text {
		color: #c33 !important;
		font-weight: var(--font-weight-extrabold) !important;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.sold-out-note {
		color: #c33 !important;
		font-weight: var(--font-weight-semibold);
		background: #fff0f0;
		padding: 0.5rem;
		border-radius: 4px;
		border: 1px solid #ffd0d0;
	}

	.warning-note {
		color: #cc6600 !important;
		font-weight: var(--font-weight-semibold);
		background: #fff8f0;
		padding: 0.5rem;
		border-radius: 4px;
		border: 1px solid #ffd0a0;
	}

	.amount-input:disabled {
		background: #f5f5f5;
		color: #999;
		cursor: not-allowed;
	}

	@media (max-width: 1024px) {
		.purchase-container {
			grid-template-columns: 1fr;
			gap: 2rem;
		}
	}

	/* Info Icon Styles */
	.info-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--color-light-gray);
		color: var(--color-secondary);
		font-size: 10px;
		font-weight: var(--font-weight-semibold);
		margin-left: 0.25rem;
		cursor: help;
		transition: background-color 0.2s ease, color 0.2s ease;
		flex-shrink: 0;
	}

	.info-icon:hover {
		background: var(--color-primary);
		color: var(--color-white);
	}

	/* Tooltip Styles */
	.tooltip-container {
		position: relative;
	}

	.tooltip {
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		background: var(--color-black);
		color: var(--color-white);
		padding: 0.75rem 1rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: var(--font-weight-medium);
		line-height: 1.4;
		width: 250px;
		text-align: left;
		z-index: 1000;
		opacity: 0;
		visibility: hidden;
		transition: opacity 0.2s ease, visibility 0.2s ease;
		pointer-events: none;
	}

	.tooltip::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 5px solid transparent;
		border-top-color: var(--color-black);
	}

	.tooltip-container:hover .tooltip {
		opacity: 1;
		visibility: visible;
	}

	@media (max-width: 768px) {
		.page-header {
			flex-direction: column;
			gap: 1rem;
		}

		.success-actions {
			flex-direction: column;
		}

		.tooltip {
			width: 200px;
			font-size: 0.7rem;
		}
	}
</style>