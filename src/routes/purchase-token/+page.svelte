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
	let currentStep = 1;
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
							payout: 13.5, // Mock payout rate
							minInvestment: 1000, // Mock minimum investment
							available: supply?.availableSupply || 0,
							sold: supply?.mintedSupply || 0,
							terms: `13.5% estimated annual IRR`,
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
									payout: 13.5,
									minInvestment: 1000,
									available: supply?.availableSupply || 0,
									sold: supply?.mintedSupply || 0,
									terms: `13.5% estimated annual IRR`,
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
		
		const tokens = Math.floor(investmentAmount / 10); // $10 per token
		const annualPayout = (investmentAmount * tranche.payout) / 100;
		const monthlyPayout = annualPayout / 12;
		const platformFee = investmentAmount * 0.005; // 0.5% platform fee
		const gasFee = 25.00; // Estimated gas fee
		const totalCost = investmentAmount + platformFee + gasFee;
		
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
		if (currentStep < 3) {
			currentStep = currentStep + 1;
		} else {
			// Execute purchase
			purchasing = true;
			purchaseError = null;
			purchaseSuccess = false;

			setTimeout(() => {
				purchasing = false;
				purchaseSuccess = true;
			}, 3000);
		}
	}

	function canProceed(): boolean {
		if (currentStep === 1) {
			return order.tranche && investmentAmount >= order.tranche.minInvestment;
		} else if (currentStep === 2) {
			return userBalance >= order.totalCost;
		} else if (currentStep === 3) {
			return agreedToTerms;
		}
		return false;
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
			<span class="breadcrumb-current">Purchase Tokens</span>
		</nav>

		<!-- Header -->
		<div class="page-header">
			<div class="asset-info">
				<h1>{assetData?.name || 'Asset Purchase'}</h1>
				<p class="asset-location">📍 {assetData?.location.state}, {assetData?.location.country}</p>
			</div>
			<div class="step-indicator">
				<span class="step" class:active={currentStep >= 1}>1. Select</span>
				<span class="step" class:active={currentStep >= 2}>2. Payment</span>
				<span class="step" class:active={currentStep >= 3}>3. Confirm</span>
			</div>
		</div>

		<div class="purchase-container">
			<!-- Left Column: Configuration -->
			<div class="configuration-panel">
				{#if currentStep === 1}
					<h3>Select Token & Amount</h3>
					
					<!-- Token Selection -->
					<div class="section">
						<div class="section-label">Token Type</div>
						{#if tranches && tranches.length > 0}
							<div class="token-options">
								{#each tranches as tranche}
									<label class="token-option">
										<input 
											type="radio" 
											name="tranche" 
											value={tranche.id}
											bind:group={selectedTranche}
										/>
										<div class="token-info">
											<div class="token-name">{tranche.name}</div>
											<div class="token-details">{tranche.payout}% IRR • Min {formatCurrency(tranche.minInvestment)}</div>
										</div>
									</label>
								{/each}
							</div>
						{:else}
							<div class="no-tokens">
								<p>No tokens available for this asset.</p>
							</div>
						{/if}
					</div>

					<!-- Investment Amount -->
					{#if order.tranche}
						<div class="section">
							<label class="section-label" for="amount">Investment Amount</label>
							<input 
								id="amount"
								type="number" 
								bind:value={investmentAmount}
								min={order.tranche.minInvestment}
								class="amount-input"
							/>
							<p class="input-note">Minimum: {formatCurrency(order.tranche.minInvestment)}</p>
						</div>
					{/if}

				{:else if currentStep === 2}
					<h3>Payment Method</h3>
					
					<div class="section">
						<div class="section-label">Select Payment Currency</div>
						<div class="payment-methods">
							<label class="payment-option">
								<input type="radio" name="payment" value="usdt" bind:group={paymentMethod} />
								<div class="payment-info">
									<div class="payment-name">USDT</div>
									<div class="payment-balance">Balance: {formatCurrency(userBalance)}</div>
								</div>
							</label>
							<label class="payment-option">
								<input type="radio" name="payment" value="usdc" bind:group={paymentMethod} />
								<div class="payment-info">
									<div class="payment-name">USDC</div>
									<div class="payment-balance">Balance: {formatCurrency(userBalance * 0.8)}</div>
								</div>
							</label>
						</div>
					</div>

				{:else if currentStep === 3}
					<h3>Confirm Purchase</h3>
					
					<div class="section">
						<div class="confirmation-details">
							<div class="detail-row">
								<span>Asset:</span>
								<span>{assetData?.name}</span>
							</div>
							<div class="detail-row">
								<span>Token Type:</span>
								<span>{order.tranche?.name || 'N/A'}</span>
							</div>
							<div class="detail-row">
								<span>Investment:</span>
								<span>{formatCurrency(investmentAmount)}</span>
							</div>
							<div class="detail-row">
								<span>Tokens:</span>
								<span>{order.tokens.toLocaleString()}</span>
							</div>
						</div>

						<label class="terms-checkbox">
							<input type="checkbox" bind:checked={agreedToTerms} />
							<span>I agree to the terms and conditions and understand the risks involved in this investment.</span>
						</label>
					</div>
				{/if}

				<!-- Action Button -->
				<button 
					class="action-btn"
					class:disabled={!canProceed()}
					disabled={!canProceed() || purchasing}
					on:click={handlePurchase}
				>
					{#if purchasing}
						Processing...
					{:else if currentStep < 3}
						Continue
					{:else}
						Complete Purchase
					{/if}
				</button>
			</div>

			<!-- Right Column: Order Summary -->
			<div class="summary-panel">
				<h3>Order Summary</h3>
				
				<div class="summary-details">
					<div class="summary-row">
						<span>Investment Amount</span>
						<span>{formatCurrency(investmentAmount)}</span>
					</div>
					<div class="summary-row">
						<span>Platform Fee (0.5%)</span>
						<span>{formatCurrency(order.platformFee)}</span>
					</div>
					<div class="summary-row">
						<span>Gas Fee</span>
						<span>{formatCurrency(order.gasFee)}</span>
					</div>
					<div class="summary-row total">
						<span>Total Cost</span>
						<span>{formatCurrency(order.totalCost)}</span>
					</div>
				</div>

				<div class="projected-returns">
					<h4>Projected Returns</h4>
					<div class="return-metric">
						<div class="return-label">Tokens Received</div>
						<div class="return-value">{order.tokens.toLocaleString()}</div>
					</div>
					<div class="return-metric">
						<div class="return-label">Estimated Monthly</div>
						<div class="return-value">{formatCurrency(order.monthlyPayout)}</div>
					</div>
					<div class="return-metric">
						<div class="return-label">Estimated Annual</div>
						<div class="return-value">{formatCurrency(order.annualPayout)}</div>
					</div>
				</div>
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

	.step-indicator {
		display: flex;
		gap: 2rem;
	}

	.step {
		font-size: 0.8rem;
		font-weight: var(--font-weight-semibold);
		color: var(--color-light-gray);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.step.active {
		color: var(--color-black);
	}

	.purchase-container {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 3rem;
	}

	.configuration-panel,
	.summary-panel {
		border: 1px solid var(--color-light-gray);
		padding: 2rem;
	}

	.configuration-panel h3,
	.summary-panel h3 {
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

	.projected-returns {
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 1px solid var(--color-light-gray);
	}

	.projected-returns h4 {
		font-size: 1rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 1rem;
	}

	.return-metric {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.75rem;
	}

	.return-label {
		font-size: 0.8rem;
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
	}

	.return-value {
		font-size: 0.8rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-primary);
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

	@media (max-width: 768px) {
		.purchase-container {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.page-header {
			flex-direction: column;
			gap: 1rem;
		}

		.success-actions {
			flex-direction: column;
		}
	}
</style>