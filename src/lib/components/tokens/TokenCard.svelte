<script lang="ts">
	import { onMount } from 'svelte';
	import dataStoreService from '$lib/services/DataStoreService';
	import type { Token } from '$lib/types/dataStore';

	export let contractAddress: string;
	export let userAddress: string | null = null;

	let tokenInfo: Token | null = null;
	let userBalance = 0;
	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		await loadTokenData();
	});

	async function loadTokenData() {
		try {
			loading = true;
			error = null;

			// Load token info from data store
			tokenInfo = dataStoreService.getTokenByAddress(contractAddress);
			
			if (!tokenInfo) {
				error = 'Token not found';
				return;
			}

			// Mock user balance for demo
			if (userAddress && tokenInfo) {
				userBalance = Math.floor(Math.random() * 10000); // Mock balance
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load token data';
			console.error('Token data loading error:', err);
		} finally {
			loading = false;
		}
	}

	function formatSupply(supply: number, decimals: number): string {
		const formatted = supply / Math.pow(10, decimals);
		return new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(formatted);
	}

	function getTokenTypeColor(type: 'royalty' | 'payment'): string {
		return type === 'royalty' ? '#3182ce' : '#38a169';
	}

	function getTokenTypeLabel(type: 'royalty' | 'payment'): string {
		return type === 'royalty' ? 'Royalty Token' : 'Payment Token';
	}
</script>

<div class="token-card">
	{#if loading}
		<div class="loading">
			<div class="spinner"></div>
			<p>Loading token data...</p>
		</div>
	{:else if error}
		<div class="error">
			<p>Error: {error}</p>
			<button on:click={loadTokenData}>Retry</button>
		</div>
	{:else if tokenInfo}
		<header class="token-header">
			<div class="token-basic-info">
				<h4 class="token-name">{tokenInfo.name}</h4>
				<p class="token-symbol">{tokenInfo.symbol}</p>
			</div>
			<div class="token-type" style="background-color: {getTokenTypeColor(tokenInfo.tokenType)}">
				{getTokenTypeLabel(tokenInfo.tokenType)}
			</div>
		</header>

		<div class="token-details">
			<div class="detail-item">
				<span class="detail-label">Contract</span>
				<span class="detail-value contract-address" title={tokenInfo.contractAddress}>
					{tokenInfo.contractAddress.slice(0, 6)}...{tokenInfo.contractAddress.slice(-4)}
				</span>
			</div>

			<div class="detail-item">
				<span class="detail-label">Total Supply</span>
				<span class="detail-value">
					{parseInt(tokenInfo.supply.maxSupply).toLocaleString()} {tokenInfo.symbol}
				</span>
			</div>

			{#if userBalance > 0}
				<div class="detail-item user-balance">
					<span class="detail-label">Your Balance</span>
					<span class="detail-value">
						{userBalance.toLocaleString()} {tokenInfo.symbol}
					</span>
				</div>
			{/if}
		</div>

		<div class="token-actions">
			{#if tokenInfo.tokenType === 'royalty'}
				<button class="action-button primary">Mint Tokens</button>
			{:else}
				<button class="action-button secondary">View Payouts</button>
			{/if}
		</div>
	{:else}
		<div class="no-data">
			<p>No token data available</p>
		</div>
	{/if}
</div>

<style>
	.token-card {
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		padding: 1.5rem;
		background: white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.loading, .error, .no-data {
		text-align: center;
		padding: 2rem;
		color: #718096;
	}

	.spinner {
		width: 24px;
		height: 24px;
		border: 2px solid #e2e8f0;
		border-top: 2px solid #3182ce;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto 1rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.error button {
		margin-top: 1rem;
		padding: 0.5rem 1rem;
		border: 1px solid #3182ce;
		background: white;
		color: #3182ce;
		border-radius: 4px;
		cursor: pointer;
	}

	.error button:hover {
		background: #3182ce;
		color: white;
	}

	.token-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1.5rem;
	}

	.token-name {
		font-size: 1.125rem;
		font-weight: 600;
		color: #1a202c;
		margin: 0 0 0.25rem 0;
	}

	.token-symbol {
		color: #718096;
		font-size: 0.875rem;
		margin: 0;
	}

	.token-type {
		color: white;
		font-size: 0.75rem;
		font-weight: 500;
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.token-details {
		margin-bottom: 1.5rem;
	}

	.detail-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 0;
		border-bottom: 1px solid #f7fafc;
	}

	.detail-item:last-child {
		border-bottom: none;
	}

	.detail-label {
		font-size: 0.875rem;
		color: #718096;
		font-weight: 500;
	}

	.detail-value {
		font-size: 0.875rem;
		color: #1a202c;
		font-weight: 600;
	}

	.contract-address {
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		font-size: 0.75rem;
	}

	.user-balance {
		background: #f7fafc;
		margin: 0 -0.5rem;
		padding: 0.75rem 0.5rem;
		border-radius: 4px;
		border: none;
	}

	.token-actions {
		display: flex;
		gap: 0.75rem;
	}

	.action-button {
		flex: 1;
		padding: 0.75rem 1rem;
		border-radius: 6px;
		font-weight: 500;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s ease;
		border: 1px solid transparent;
	}

	.action-button.primary {
		background: #3182ce;
		color: white;
	}

	.action-button.primary:hover {
		background: #2c5aa0;
	}

	.action-button.secondary {
		background: white;
		color: #3182ce;
		border-color: #3182ce;
	}

	.action-button.secondary:hover {
		background: #3182ce;
		color: white;
	}
</style>