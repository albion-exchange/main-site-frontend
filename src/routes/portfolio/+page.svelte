<script lang="ts">
	import { onMount } from 'svelte';
	import type { Asset } from '$lib/types/asset';

	// Mock user portfolio data - in real app this would come from wallet/blockchain
	interface UserAssetHolding {
		asset: Asset;
		tokensOwned: number;
		totalTokens: number;
		purchasePrice: number;
		currentValue: number;
		totalEarnings: number;
		monthlyEarnings: number;
	}

	let holdings: UserAssetHolding[] = [];
	let loading = true;
	let isConnected = false; // Mock wallet connection state

	onMount(async () => {
		// Mock loading user portfolio
		setTimeout(() => {
			// Mock data - in real app this would be fetched from blockchain
			holdings = [
				// This would be populated with real user data
			];
			loading = false;
		}, 1000);
	});

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(amount);
	}

	function formatPercentage(value: number, total: number): string {
		return ((value / total) * 100).toFixed(2) + '%';
	}

	function calculateTotalPortfolioValue(): number {
		return holdings.reduce((total, holding) => total + holding.currentValue, 0);
	}

	function calculateTotalEarnings(): number {
		return holdings.reduce((total, holding) => total + holding.totalEarnings, 0);
	}

	function calculateMonthlyEarnings(): number {
		return holdings.reduce((total, holding) => total + holding.monthlyEarnings, 0);
	}

	function connectWallet() {
		// Mock wallet connection
		isConnected = true;
		// In real app, this would trigger Web3 wallet connection
	}
</script>

<svelte:head>
	<title>Portfolio - Albion</title>
	<meta name="description" content="View your asset holdings and performance" />
</svelte:head>

<main class="portfolio-page">
	<header class="page-header">
		<h1>My Portfolio</h1>
		<p>Track your asset performance and earnings</p>
	</header>

	{#if !isConnected}
		<div class="wallet-connection">
			<div class="connection-prompt">
				<h2>Connect Your Wallet</h2>
				<p>Connect your wallet to view your portfolio and track your asset performance.</p>
				<button class="btn-primary" on:click={connectWallet}>
					Connect Wallet
				</button>
			</div>
		</div>
	{:else if loading}
		<div class="loading-state">
			<p>Loading your portfolio...</p>
		</div>
	{:else}
		<div class="portfolio-content">
			<div class="portfolio-summary">
				<div class="summary-card">
					<h3>Total Portfolio Value</h3>
					<span class="value">{formatCurrency(calculateTotalPortfolioValue())}</span>
				</div>
				<div class="summary-card">
					<h3>Total Earnings</h3>
					<span class="value earnings">{formatCurrency(calculateTotalEarnings())}</span>
				</div>
				<div class="summary-card">
					<h3>Monthly Earnings</h3>
					<span class="value monthly">{formatCurrency(calculateMonthlyEarnings())}</span>
				</div>
				<div class="summary-card">
					<h3>Assets Owned</h3>
					<span class="value">{holdings.length}</span>
				</div>
			</div>

			{#if holdings.length === 0}
				<div class="empty-portfolio">
					<h2>No Assets Yet</h2>
					<p>You haven't purchased any asset tokens yet. Browse available assets to get started.</p>
					<a href="/assets" class="btn-primary">Browse Assets</a>
				</div>
			{:else}
				<div class="holdings-section">
					<h2>Your Holdings</h2>
					<div class="holdings-list">
						{#each holdings as holding}
							<article class="holding-card">
								<div class="holding-header">
									<h3>
										<a href="/assets/{holding.asset.id}">{holding.asset.name}</a>
									</h3>
									<span class="location">{holding.asset.location.county}, {holding.asset.location.state}</span>
								</div>
								
								<div class="holding-stats">
									<div class="stat-group">
										<div class="stat">
											<span class="stat-label">Tokens Owned</span>
											<span class="stat-value">{holding.tokensOwned.toLocaleString()}</span>
										</div>
										<div class="stat">
											<span class="stat-label">Ownership</span>
											<span class="stat-value">{formatPercentage(holding.tokensOwned, holding.totalTokens)}</span>
										</div>
									</div>
									
									<div class="stat-group">
										<div class="stat">
											<span class="stat-label">Purchase Price</span>
											<span class="stat-value">{formatCurrency(holding.purchasePrice)}</span>
										</div>
										<div class="stat">
											<span class="stat-label">Current Value</span>
											<span class="stat-value">{formatCurrency(holding.currentValue)}</span>
										</div>
									</div>
									
									<div class="stat-group">
										<div class="stat">
											<span class="stat-label">Total Earnings</span>
											<span class="stat-value earnings">{formatCurrency(holding.totalEarnings)}</span>
										</div>
										<div class="stat">
											<span class="stat-label">Monthly Earnings</span>
											<span class="stat-value monthly">{formatCurrency(holding.monthlyEarnings)}</span>
										</div>
									</div>
								</div>
								
								<div class="holding-actions">
									<a href="/assets/{holding.asset.id}" class="btn-secondary">View Details</a>
									<a href="/buy-token?asset={holding.asset.id}" class="btn-secondary">Buy More</a>
								</div>
							</article>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</main>

<style>
	.portfolio-page {
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

	.connection-prompt p {
		margin-bottom: 2rem;
		line-height: 1.6;
		color: var(--color-black);
	}

	.loading-state {
		text-align: center;
		padding: 4rem 2rem;
		color: var(--color-black);
	}

	.portfolio-summary {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-bottom: 4rem;
	}

	.summary-card {
		padding: 2rem;
		border: 1px solid var(--color-light-gray);
		text-align: center;
	}

	.summary-card h3 {
		font-size: 0.9rem;
		color: var(--color-secondary);
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 1rem;
	}

	.summary-card .value {
		font-size: 2rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
	}

	.summary-card .value.earnings {
		color: var(--color-primary);
	}

	.summary-card .value.monthly {
		color: var(--color-secondary);
	}

	.empty-portfolio {
		text-align: center;
		padding: 4rem 2rem;
		border: 1px solid var(--color-light-gray);
	}

	.empty-portfolio h2 {
		font-size: 1.5rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 1rem;
		color: var(--color-black);
	}

	.empty-portfolio p {
		margin-bottom: 2rem;
		line-height: 1.6;
		color: var(--color-black);
	}

	.holdings-section h2 {
		font-size: 1.5rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 2rem;
		color: var(--color-black);
	}

	.holdings-list {
		display: grid;
		gap: 2rem;
	}

	.holding-card {
		padding: 2rem;
		border: 1px solid var(--color-light-gray);
	}

	.holding-header {
		margin-bottom: 2rem;
	}

	.holding-header h3 {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 0.5rem;
	}

	.holding-header h3 a {
		color: var(--color-black);
		text-decoration: none;
	}

	.holding-header h3 a:hover {
		color: var(--color-primary);
	}

	.location {
		color: var(--color-secondary);
		font-weight: var(--font-weight-medium);
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.holding-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.stat-group {
		display: grid;
		gap: 1rem;
	}

	.stat {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 0;
		border-bottom: 1px solid var(--color-light-gray);
	}

	.stat:last-child {
		border-bottom: none;
	}

	.stat-label {
		font-size: 0.8rem;
		color: var(--color-secondary);
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.stat-value {
		font-weight: var(--font-weight-bold);
		color: var(--color-black);
	}

	.stat-value.earnings {
		color: var(--color-primary);
	}

	.stat-value.monthly {
		color: var(--color-secondary);
	}

	.holding-actions {
		display: flex;
		gap: 1rem;
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

	.btn-primary:hover {
		background: var(--color-secondary);
	}

	.btn-secondary {
		background: var(--color-white);
		color: var(--color-secondary);
		border: 1px solid var(--color-secondary);
	}

	.btn-secondary:hover {
		background: var(--color-secondary);
		color: var(--color-white);
	}

	@media (max-width: 768px) {
		.portfolio-page {
			padding: 2rem 1rem;
		}

		.page-header h1 {
			font-size: 2rem;
		}

		.portfolio-summary {
			grid-template-columns: 1fr;
		}

		.holding-stats {
			grid-template-columns: 1fr;
		}

		.holding-actions {
			flex-direction: column;
		}
	}
</style>