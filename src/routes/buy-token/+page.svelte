<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { AssetService } from '$lib/services/AssetService';
	import type { Asset } from '$lib/types/asset';

	let selectedAsset: Asset | null = null;
	let assets: Asset[] = [];
	let loading = true;
	let isConnected = false;
	let purchasing = false;
	let purchaseSuccess = false;
	let purchaseError: string | null = null;

	// Purchase form data
	let tokenAmount = 1;
	let maxTokenAmount = 1000;
	let tokenPrice = 100; // USD per token
	let estimatedFees = 25; // USD gas fees

	onMount(async () => {
		try {
			assets = await AssetService.getAllAssets();
			const assetId = $page.url.searchParams.get('asset');
			
			if (assetId) {
				selectedAsset = assets.find(a => a.id === assetId) || null;
			}
		} catch (error) {
			console.error('Failed to load assets:', error);
		} finally {
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

	function calculateTotal(): number {
		return (tokenAmount * tokenPrice) + estimatedFees;
	}

	async function purchaseTokens() {
		if (!selectedAsset || !isConnected) return;

		purchasing = true;
		purchaseError = null;
		purchaseSuccess = false;

		try {
			// Mock smart contract interaction
			// In real app, this would call the token purchase contract
			await new Promise(resolve => setTimeout(resolve, 3000));
			
			// Mock success
			purchaseSuccess = true;
			
		} catch (error) {
			purchaseError = 'Transaction failed. Please try again.';
			console.error('Purchase error:', error);
		} finally {
			purchasing = false;
		}
	}

	function connectWallet() {
		isConnected = true;
	}

	function selectAsset(asset: Asset) {
		selectedAsset = asset;
	}

	function getLatestMonthlyIncome(asset: Asset): number {
		if (asset.monthlyReports.length === 0) return 0;
		const latest = asset.monthlyReports[asset.monthlyReports.length - 1];
		return latest.netIncome;
	}
</script>

<svelte:head>
	<title>Buy Tokens - Albion</title>
	<meta name="description" content="Purchase asset tokens" />
</svelte:head>

<main class="buy-token-page">
	<header class="page-header">
		<h1>Buy Asset Tokens</h1>
		<p>Purchase fractional ownership in oil field assets</p>
	</header>

	{#if !isConnected}
		<div class="wallet-connection">
			<div class="connection-prompt">
				<h2>Connect Your Wallet</h2>
				<p>Connect your wallet to purchase asset tokens.</p>
				<button class="btn-primary" on:click={connectWallet}>
					Connect Wallet
				</button>
			</div>
		</div>
	{:else if loading}
		<div class="loading-state">
			<p>Loading assets...</p>
		</div>
	{:else}
		<div class="purchase-content">
			<!-- Success/Error Messages -->
			{#if purchaseSuccess}
				<div class="success-message">
					<h3>Purchase Successful!</h3>
					<p>You have successfully purchased {tokenAmount} tokens of {selectedAsset?.name}.</p>
					<p>Your tokens will appear in your portfolio shortly.</p>
					<div class="success-actions">
						<a href="/portfolio" class="btn-primary">View Portfolio</a>
						<button class="btn-secondary" on:click={() => { purchaseSuccess = false; tokenAmount = 1; }}>
							Buy More Tokens
						</button>
					</div>
				</div>
			{:else}
				<!-- Asset Selection -->
				{#if !selectedAsset}
					<section class="asset-selection">
						<h2>Select an Asset</h2>
						<div class="assets-grid">
							{#each assets as asset}
								<article class="asset-option" on:click={() => selectAsset(asset)}>
									<div class="asset-image">
										{#if asset.images && asset.images.length > 0}
											<img src={asset.images[0]} alt={asset.name} />
										{:else}
											<div class="placeholder-image">
												<span>No Image</span>
											</div>
										{/if}
									</div>
									<div class="asset-info">
										<h3>{asset.name}</h3>
										<p class="location">{asset.location.county}, {asset.location.state}</p>
										<p class="latest-income">Latest: {formatCurrency(getLatestMonthlyIncome(asset))}</p>
									</div>
								</article>
							{/each}
						</div>
					</section>
				{:else}
					<!-- Purchase Form -->
					<div class="purchase-form-container">
						<div class="selected-asset">
							<div class="asset-header">
								<div class="asset-image-small">
									{#if selectedAsset.images && selectedAsset.images.length > 0}
										<img src={selectedAsset.images[0]} alt={selectedAsset.name} />
									{:else}
										<div class="placeholder-image">No Image</div>
									{/if}
								</div>
								<div class="asset-details">
									<h2>{selectedAsset.name}</h2>
									<p class="location">{selectedAsset.location.county}, {selectedAsset.location.state}</p>
									<p class="description">{selectedAsset.description}</p>
								</div>
								<button class="btn-secondary change-asset" on:click={() => selectedAsset = null}>
									Change Asset
								</button>
							</div>
						</div>

						{#if purchaseError}
							<div class="error-message">
								<h3>Purchase Failed</h3>
								<p>{purchaseError}</p>
							</div>
						{/if}

						<div class="purchase-form">
							<div class="form-section">
								<h3>Purchase Details</h3>
								
								<div class="form-group">
									<label for="token-amount">Number of Tokens</label>
									<div class="input-group">
										<input 
											id="token-amount"
											type="number" 
											bind:value={tokenAmount}
											min="1" 
											max={maxTokenAmount}
										/>
										<span class="input-suffix">tokens</span>
									</div>
									<p class="help-text">Maximum: {maxTokenAmount.toLocaleString()} tokens available</p>
								</div>

								<div class="form-group">
									<label>Token Price</label>
									<div class="readonly-field">
										{formatCurrency(tokenPrice)} per token
									</div>
								</div>
							</div>

							<div class="purchase-summary">
								<h3>Purchase Summary</h3>
								<div class="summary-row">
									<span>Tokens:</span>
									<span>{tokenAmount.toLocaleString()}</span>
								</div>
								<div class="summary-row">
									<span>Price per token:</span>
									<span>{formatCurrency(tokenPrice)}</span>
								</div>
								<div class="summary-row">
									<span>Subtotal:</span>
									<span>{formatCurrency(tokenAmount * tokenPrice)}</span>
								</div>
								<div class="summary-row">
									<span>Estimated gas fees:</span>
									<span>{formatCurrency(estimatedFees)}</span>
								</div>
								<div class="summary-row total">
									<span>Total:</span>
									<span>{formatCurrency(calculateTotal())}</span>
								</div>

								<button 
									class="btn-primary purchase-btn" 
									on:click={purchaseTokens}
									disabled={purchasing || tokenAmount < 1}
								>
									{#if purchasing}
										Processing Purchase...
									{:else}
										Purchase Tokens
									{/if}
								</button>
							</div>
						</div>
					</div>
				{/if}
			{/if}
		</div>
	{/if}
</main>

<style>
	.buy-token-page {
		padding: 4rem 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.page-header {
		text-align: center;
		margin-bottom: 4rem;
	}

	.page-header h1 {
		font-size: 3rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 1rem;
		color: var(--color-black);
	}

	.page-header p {
		font-size: 1.25rem;
		color: var(--color-black);
	}

	.wallet-connection {
		display: flex;
		justify-content: center;
		margin: 4rem 0;
	}

	.connection-prompt {
		text-align: center;
		padding: 3rem;
		border: 1px solid var(--color-light-gray);
		max-width: 500px;
	}

	.connection-prompt h2 {
		font-size: 1.5rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 1rem;
		color: var(--color-black);
	}

	.loading-state {
		text-align: center;
		padding: 4rem 2rem;
		color: var(--color-black);
	}

	.success-message {
		padding: 2rem;
		text-align: center;
		border: 1px solid var(--color-primary);
		background: #e8f5e8;
		margin-bottom: 2rem;
	}

	.success-message h3 {
		color: var(--color-secondary);
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 1rem;
	}

	.success-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 2rem;
	}

	.error-message {
		padding: 1.5rem;
		margin-bottom: 2rem;
		background: #ffe8e8;
		border: 1px solid #ff6b6b;
		color: #d63447;
		text-align: center;
	}

	.asset-selection h2 {
		font-size: 1.5rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 2rem;
		color: var(--color-black);
		text-align: center;
	}

	.assets-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.asset-option {
		border: 1px solid var(--color-light-gray);
		cursor: pointer;
		transition: border-color 0.2s ease;
		overflow: hidden;
	}

	.asset-option:hover {
		border-color: var(--color-primary);
	}

	.asset-image {
		height: 150px;
		overflow: hidden;
	}

	.asset-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.placeholder-image {
		width: 100%;
		height: 100%;
		background: var(--color-light-gray);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-black);
		font-weight: var(--font-weight-medium);
	}

	.asset-info {
		padding: 1.5rem;
	}

	.asset-info h3 {
		font-size: 1.1rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 0.5rem;
		color: var(--color-black);
	}

	.location {
		color: var(--color-secondary);
		font-weight: var(--font-weight-medium);
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.5rem;
	}

	.latest-income {
		color: var(--color-primary);
		font-weight: var(--font-weight-bold);
		font-size: 0.9rem;
	}

	.selected-asset {
		margin-bottom: 3rem;
		border: 1px solid var(--color-light-gray);
		padding: 2rem;
	}

	.asset-header {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: 2rem;
		align-items: center;
	}

	.asset-image-small {
		width: 80px;
		height: 80px;
		overflow: hidden;
	}

	.asset-image-small img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.asset-details h2 {
		font-size: 1.5rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 0.5rem;
		color: var(--color-black);
	}

	.asset-details .description {
		line-height: 1.4;
		color: var(--color-black);
	}

	.change-asset {
		padding: 0.5rem 1rem;
		font-size: 0.8rem;
	}

	.purchase-form {
		display: grid;
		grid-template-columns: 1fr 400px;
		gap: 3rem;
	}

	.form-section h3,
	.purchase-summary h3 {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 1.5rem;
		color: var(--color-black);
	}

	.form-group {
		margin-bottom: 2rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
	}

	.input-group {
		display: flex;
		align-items: center;
		border: 1px solid var(--color-light-gray);
	}

	.input-group input {
		flex: 1;
		padding: 0.75rem;
		border: none;
		font-size: 1rem;
		font-family: var(--font-family);
	}

	.input-group input:focus {
		outline: none;
	}

	.input-suffix {
		padding: 0.75rem;
		background: var(--color-light-gray);
		color: var(--color-secondary);
		font-weight: var(--font-weight-medium);
		font-size: 0.9rem;
	}

	.readonly-field {
		padding: 0.75rem;
		border: 1px solid var(--color-light-gray);
		background: var(--color-light-gray);
		font-weight: var(--font-weight-bold);
		color: var(--color-black);
	}

	.help-text {
		margin-top: 0.5rem;
		font-size: 0.8rem;
		color: var(--color-secondary);
	}

	.purchase-summary {
		padding: 2rem;
		border: 1px solid var(--color-light-gray);
		height: fit-content;
	}

	.summary-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.75rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--color-light-gray);
	}

	.summary-row.total {
		font-weight: var(--font-weight-bold);
		font-size: 1.1rem;
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 2px solid var(--color-black);
		border-bottom: none;
	}

	.purchase-btn {
		width: 100%;
		padding: 1rem;
		margin-top: 2rem;
		font-size: 1rem;
	}

	.btn-primary,
	.btn-secondary {
		padding: 0.75rem 1.5rem;
		text-align: center;
		text-decoration: none;
		font-weight: var(--font-weight-semibold);
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		transition: background-color 0.2s ease;
		border: none;
		cursor: pointer;
	}

	.btn-primary {
		background: var(--color-primary);
		color: var(--color-white);
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--color-secondary);
	}

	.btn-secondary {
		background: var(--color-white);
		color: var(--color-secondary);
		border: 1px solid var(--color-secondary);
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--color-secondary);
		color: var(--color-white);
	}

	.btn-primary:disabled,
	.btn-secondary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (max-width: 768px) {
		.buy-token-page {
			padding: 2rem 1rem;
		}

		.page-header h1 {
			font-size: 2rem;
		}

		.assets-grid {
			grid-template-columns: 1fr;
		}

		.asset-header {
			grid-template-columns: 1fr;
			gap: 1rem;
			text-align: center;
		}

		.purchase-form {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.success-actions {
			flex-direction: column;
		}
	}
</style>