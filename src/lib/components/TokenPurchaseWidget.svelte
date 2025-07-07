<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import dataStoreService from '$lib/services/DataStoreService';
	import type { Asset, Token } from '$lib/types/dataStore';
	import { PrimaryButton, SecondaryButton } from '$lib/components/ui';

	export let isOpen = false;
	export let tokenAddress: string | null = null;
	export let assetId: string | null = null;

	const dispatch = createEventDispatcher();

	// Purchase form state
	let investmentAmount = 5000;
	let agreedToTerms = false;
	let purchasing = false;
	let purchaseSuccess = false;
	let purchaseError: string | null = null;

	// Data
	let assetData: Asset | null = null;
	let tokenData: Token | null = null;
	let supply: any = null;

	// Reactive calculations
	$: if (isOpen && (tokenAddress || assetId)) {
		loadTokenData();
	}

	$: order = {
		investment: investmentAmount,
		platformFee: 0, // Free for now
		totalCost: investmentAmount,
		tokens: investmentAmount // 1:1 ratio for simplicity
	};

	$: canProceed = () => {
		return agreedToTerms && 
			   investmentAmount > 0 && 
			   investmentAmount <= (supply?.availableSupply || 0) && 
			   !purchasing &&
			   !isSoldOut();
	};

	function loadTokenData() {
		try {
			if (tokenAddress) {
				tokenData = dataStoreService.getTokenByAddress(tokenAddress);
				if (tokenData) {
					const assetWithTokens = dataStoreService.getAssetWithTokens(tokenData.assetId);
					assetData = assetWithTokens?.asset || null;
					supply = dataStoreService.getTokenSupply(tokenAddress);
				}
			} else if (assetId) {
				const assetWithTokens = dataStoreService.getAssetWithTokens(assetId);
				if (assetWithTokens) {
					assetData = assetWithTokens.asset;
					// Get first available royalty token
					const availableTokens = assetWithTokens.tokens.filter(
						token => token.tokenType === 'royalty' && token.isActive
					);
					if (availableTokens.length > 0) {
						tokenData = availableTokens[0];
						supply = dataStoreService.getTokenSupply(availableTokens[0].contractAddress);
					}
				}
			}
		} catch (error) {
			console.error('Error loading token data:', error);
			purchaseError = 'Failed to load token data';
		}
	}

	function isSoldOut(): boolean {
		return supply ? supply.availableSupply <= 0 : false;
	}

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0
		}).format(amount);
	}

	async function handlePurchase() {
		if (!canProceed()) return;

		purchasing = true;
		purchaseError = null;

		try {
			// Simulate purchase process
			await new Promise(resolve => setTimeout(resolve, 2000));
			
			// Mock success
			purchaseSuccess = true;
			
			// Dispatch success event
			dispatch('purchaseSuccess', {
				tokenAddress,
				assetId,
				amount: investmentAmount,
				tokens: order.tokens
			});
			
			// Reset form after success
			setTimeout(() => {
				resetForm();
				closeWidget();
			}, 2000);
			
		} catch (error) {
			purchaseError = error instanceof Error ? error.message : 'Purchase failed';
		} finally {
			purchasing = false;
		}
	}

	function resetForm() {
		investmentAmount = 5000;
		agreedToTerms = false;
		purchasing = false;
		purchaseSuccess = false;
		purchaseError = null;
		assetData = null;
		tokenData = null;
		supply = null;
	}

	function closeWidget() {
		isOpen = false;
		dispatch('close');
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			closeWidget();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeWidget();
		}
	}
</script>

<!-- Widget Overlay -->
{#if isOpen}
	<div class="widget-overlay" on:click={handleBackdropClick} on:keydown={handleKeydown} role="dialog" aria-modal="true" tabindex="-1">
		<div class="widget-container">
			<!-- Header -->
			<div class="widget-header">
				<div class="widget-title">
					<div class="title-row">
						<h2>
							{#if tokenData}
								{tokenData.name}
							{:else}
								Purchase Tokens
							{/if}
						</h2>
						{#if tokenData && assetData}
							<a href="/assets/{assetData.id}#token-{tokenData.contractAddress}" class="view-details-link">
								View Details →
							</a>
						{/if}
					</div>
					{#if assetData}
						<p class="asset-name">{assetData.name}</p>
					{/if}
				</div>
				<button class="close-btn" on:click={closeWidget}>×</button>
			</div>

			<!-- Content -->
			<div class="widget-content">
				{#if purchaseSuccess}
					<!-- Success State -->
					<div class="success-state">
						<div class="success-icon">✓</div>
						<h3>Purchase Successful!</h3>
						<p>You have successfully purchased {order.tokens.toLocaleString()} tokens.</p>
					</div>
				{:else if purchaseError}
					<!-- Error State -->
					<div class="error-state">
						<h3>Purchase Failed</h3>
						<p>{purchaseError}</p>
						<SecondaryButton on:click={() => purchaseError = null}>
							Try Again
						</SecondaryButton>
					</div>
				{:else}
					<!-- Purchase Form -->
					<div class="purchase-form">
						<!-- Token Details -->
						{#if tokenData}
							<div class="token-details">
								<h4>Token Details</h4>
								<div class="details-grid">
									<div class="detail-item">
										<span class="detail-label">Share of Asset</span>
										<span class="detail-value">{tokenData.assetShare?.sharePercentage || 0}%</span>
									</div>
									<div class="detail-item">
										<span class="detail-label">Maximum Supply</span>
										<span class="detail-value">{(supply?.maxSupply || 0).toLocaleString()}</span>
									</div>
									<div class="detail-item">
										<span class="detail-label">Current Supply</span>
										<span class="detail-value">{(supply?.mintedSupply || 0).toLocaleString()}</span>
									</div>
								</div>
							</div>
						{/if}

						<!-- Investment Amount -->
						<div class="form-section">
							<label class="form-label" for="amount">Investment Amount</label>
							<input 
								id="amount"
								type="number" 
								bind:value={investmentAmount}
								min={1}
								max={supply?.availableSupply || 999999}
								class="amount-input"
								disabled={isSoldOut()}
							/>
							<div class="available-tokens">
								{#if isSoldOut()}
									<span class="sold-out">Sold Out</span>
								{:else}
									<span>Available: {(supply?.availableSupply || 0).toLocaleString()} tokens</span>
								{/if}
							</div>
							{#if !isSoldOut() && supply?.availableSupply && investmentAmount > supply.availableSupply}
								<div class="input-note warning-note">
									Investment amount exceeds available supply.
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
						<div class="form-section">
							<label class="terms-checkbox">
								<input type="checkbox" bind:checked={agreedToTerms} />
								<span>I agree to the terms and conditions and understand the risks involved in this investment.</span>
							</label>
						</div>

						<!-- Action Buttons -->
						<div class="form-actions">
							<SecondaryButton on:click={closeWidget}>
								Cancel
							</SecondaryButton>
							<PrimaryButton 
								on:click={handlePurchase}
							>
								{#if isSoldOut()}
									Sold Out
								{:else if purchasing}
									Processing...
								{:else}
									Buy Now
								{/if}
							</PrimaryButton>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.widget-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: flex-end;
		z-index: 1000;
		padding: 2rem;
	}

	.widget-container {
		background: white;
		width: 100%;
		max-width: 500px;
		height: auto;
		max-height: 90vh;
		border-radius: 0;
		display: flex;
		flex-direction: column;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
		transform: translateX(100%);
		animation: slideIn 0.3s ease-out forwards;
	}

	@keyframes slideIn {
		to {
			transform: translateX(0);
		}
	}

	.widget-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 2rem;
		border-bottom: 1px solid var(--color-light-gray);
	}

	.title-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.widget-title h2 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: var(--font-weight-bold);
		color: var(--color-black);
	}

	.view-details-link {
		color: var(--color-primary-blue);
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: var(--font-weight-medium);
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--color-primary-blue);
		border-radius: 4px;
		transition: all 0.2s ease;
		white-space: nowrap;
	}

	.view-details-link:hover {
		font-weight: var(--font-weight-bold);
		border-color: #283c84;
		color: #283c84;
	}

	.asset-name {
		margin: 0.5rem 0 0;
		color: var(--color-secondary-blue);
		font-size: 0.9rem;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 2rem;
		cursor: pointer;
		color: var(--color-black);
		padding: 0;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0;
		transition: background-color 0.2s;
	}

	.close-btn:hover {
		background-color: var(--color-light-gray);
	}

	.widget-content {
		flex: 1;
		padding: 2rem;
		overflow-y: auto;
		min-height: 0;
	}

	.purchase-form {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.form-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-label {
		font-weight: var(--font-weight-medium);
		color: var(--color-black);
		font-size: 0.9rem;
	}

	.amount-input {
		padding: 1rem;
		border: 2px solid var(--color-light-gray);
		border-radius: 0;
		font-size: 1.1rem;
		transition: border-color 0.2s;
	}

	.amount-input:focus {
		outline: none;
		border-color: var(--color-primary-blue);
	}

	.token-details {
		background: var(--color-light-gray);
		padding: 1.5rem;
		border-radius: 0;
	}

	.token-details h4 {
		margin: 0 0 1rem 0;
		font-size: 1rem;
		font-weight: var(--font-weight-medium);
		color: var(--color-black);
	}

	.details-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}

	.detail-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.detail-label {
		font-size: 0.75rem;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.detail-value {
		font-size: 1.1rem;
		font-weight: var(--font-weight-bold);
		color: var(--color-secondary-blue);
	}

	.available-tokens {
		margin-top: 0.5rem;
		font-size: 0.875rem;
		color: var(--color-secondary-blue);
		font-weight: var(--font-weight-medium);
	}

	.available-tokens .sold-out {
		color: #dc2626;
	}

	.input-note {
		font-size: 0.8rem;
		padding: 0.5rem;
		border-radius: 0;
		margin-top: 0.5rem;
	}

	.warning-note {
		color: #d97706;
		background: #fef3c7;
	}

	.order-summary {
		border: 1px solid var(--color-light-gray);
		border-radius: 0;
		padding: 1.5rem;
	}

	.order-summary h4 {
		margin: 0 0 1rem;
		font-weight: var(--font-weight-medium);
		color: var(--color-black);
	}

	.summary-details {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.summary-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.summary-row.total {
		padding-top: 0.75rem;
		border-top: 1px solid var(--color-light-gray);
		font-weight: var(--font-weight-medium);
	}

	.strikethrough {
		text-decoration: line-through;
		color: #6b7280;
	}

	.free-text {
		color: var(--color-primary-blue);
		font-weight: var(--font-weight-medium);
	}

	.terms-checkbox {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		font-size: 0.9rem;
		line-height: 1.4;
		cursor: pointer;
	}

	.terms-checkbox input[type="checkbox"] {
		margin-top: 0.125rem;
	}

	.form-actions {
		display: flex;
		gap: 1rem;
		margin-top: 1rem;
	}


	.success-state, .error-state {
		text-align: center;
		padding: 2rem;
	}

	.success-icon {
		width: 4rem;
		height: 4rem;
		background: #10b981;
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
		margin: 0 auto 1rem;
	}

	.success-state h3, .error-state h3 {
		margin: 0 0 1rem;
		color: var(--color-black);
	}

	.success-state p, .error-state p {
		margin: 0;
		color: #6b7280;
	}

	@media (max-width: 768px) {
		.widget-overlay {
			padding: 0;
		}

		.widget-container {
			width: 100%;
			height: 100%;
			max-height: none;
			border-radius: 0;
			transform: translateY(100%);
			animation: slideUp 0.3s ease-out forwards;
		}

		@keyframes slideUp {
			to {
				transform: translateY(0);
			}
		}

		.details-grid {
			grid-template-columns: 1fr;
		}

		.title-row {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.view-details-link {
			font-size: 0.75rem;
			padding: 0.375rem 0.5rem;
		}
	}
</style>