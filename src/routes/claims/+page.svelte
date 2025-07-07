<script lang="ts">
	import { onMount } from 'svelte';
	import dataStoreService from '$lib/services/DataStoreService';
	import type { Asset } from '$lib/types/dataStore';
	import { walletStore, walletActions } from '$lib/stores/wallet';
	import WalletModal from '$lib/components/WalletModal.svelte';
	import marketData from '$lib/data/marketData.json';
	import { getMockPortfolioHoldings, calculatePortfolioSummary } from '$lib/utils/portfolioCalculations';

	let totalEarned = 0;
	let totalClaimed = 0;
	let unclaimedPayout = 0;
	let loading = true;
	let claiming = false;
	let claimSuccess = false;
	let selectedAssets: string[] = [];
	let claimMethod = 'wallet';
	let isAccruing = true;
	let showWalletModal = false;

	// Mock portfolio data based on real assets
	const mockPortfolioBalances = [
		{ assetId: 'europa-wressle-release-1', unclaimedAmount: 487.32, totalEarned: 2847.15, lastPayout: '2024-12-15' },
		{ assetId: 'bakken-horizon-field', unclaimedAmount: 342.18, totalEarned: 2156.47, lastPayout: '2024-12-10' },
		{ assetId: 'permian-basin-venture', unclaimedAmount: 286.74, totalEarned: 1847.21, lastPayout: '2024-12-20' },
		{ assetId: 'gulf-mexico-deep-water', unclaimedAmount: 131.58, totalEarned: 1621.32, lastPayout: '2024-12-05' }
	];

	let holdings: any[] = [];

	const claimHistory = [
		{ date: '2024-12-15', amount: 487.32, asset: 'Europa Wressle Release 1', txHash: '0x7d8f...a2b1', status: 'completed' },
		{ date: '2024-12-10', amount: 342.18, asset: 'Bakken Horizon Field', txHash: '0x9c3e...f5d2', status: 'completed' },
		{ date: '2024-11-15', amount: 456.89, asset: 'Europa Wressle Release 1', txHash: '0x2f1a...c7e3', status: 'completed' },
		{ date: '2024-11-10', amount: 298.45, asset: 'Bakken Horizon Field', txHash: '0x8b4d...x9f4', status: 'completed' },
		{ date: '2024-10-20', amount: 312.67, asset: 'Permian Basin Venture', txHash: '0x5e2c...b8a5', status: 'completed' }
	];

	onMount(async () => {
		// Check if wallet is connected
		if (!$walletStore.isConnected) {
			showWalletModal = true;
			return;
		}
		
		try {
			// Load portfolio holdings and calculate summary
			const portfolioHoldings = getMockPortfolioHoldings();
			const summary = calculatePortfolioSummary(portfolioHoldings);
			
			// Update summary values
			totalEarned = summary.totalEarned;
			totalClaimed = summary.totalClaimed;
			unclaimedPayout = summary.unclaimedPayout;
			
			// Load real assets and create portfolio holdings
			const allAssets = dataStoreService.getAllAssets();
			
			holdings = portfolioHoldings.map(balance => {
				const asset = allAssets.find(a => a.id === balance.assetId);
				if (!asset) return null;
				
				return {
					id: asset.id,
					name: asset.name,
					location: `${asset.location.state}, ${asset.location.country}`,
					unclaimedAmount: balance.unclaimedAmount,
					totalEarned: balance.totalEarned,
					lastPayout: balance.lastPayout,
					currentPayout: asset.monthlyReports.length > 0 ? asset.monthlyReports[asset.monthlyReports.length - 1].payoutPerToken : 0,
					status: asset.production.status
				};
			}).filter(Boolean);
			
			loading = false;
			
			// Simulate real-time accrual
			if (isAccruing) {
				setInterval(() => {
					unclaimedPayout += (Math.random() * 0.05 + 0.02);
					totalEarned += (Math.random() * 0.05 + 0.02);
				}, 3000);
			}
		} catch (error) {
			console.error('Error loading claims data:', error);
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

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function handleAssetSelect(assetId: string) {
		if (selectedAssets.includes(assetId)) {
			selectedAssets = selectedAssets.filter(id => id !== assetId);
		} else {
			selectedAssets = [...selectedAssets, assetId];
		}
	}

	function handleSelectAll() {
		if (selectedAssets.length === holdings.length) {
			selectedAssets = [];
		} else {
			selectedAssets = holdings.map(holding => holding.id);
		}
	}

	function getSelectedAmount(): number {
		return holdings
			.filter(holding => selectedAssets.includes(holding.id))
			.reduce((sum, holding) => sum + holding.unclaimedAmount, 0);
	}

	async function handleClaim() {
		claiming = true;
		claimSuccess = false;
		
		try {
			// Simulate claim transaction
			await new Promise(resolve => setTimeout(resolve, 2000));
			
			const claimedAmount = getSelectedAmount() || unclaimedPayout;
			totalClaimed += claimedAmount;
			unclaimedPayout = Math.max(0, unclaimedPayout - claimedAmount);
			
			selectedAssets = [];
			claimSuccess = true;
			
			// Reset success message after 3 seconds
			setTimeout(() => {
				claimSuccess = false;
			}, 3000);
			
		} catch (error) {
			console.error('Claim error:', error);
		} finally {
			claiming = false;
		}
	}

	async function handleWalletConnect() {
		await walletActions.connect();
		showWalletModal = false;
		
		// Reload the page content now that wallet is connected
		if ($walletStore.isConnected) {
			loading = true;
			try {
				const allAssets = dataStoreService.getAllAssets();
				
				holdings = mockPortfolioBalances.map(balance => {
					const asset = allAssets.find(a => a.id === balance.assetId);
					if (!asset) return null;
					
					return {
						id: asset.id,
						name: asset.name,
						location: `${asset.location.state}, ${asset.location.country}`,
						unclaimedAmount: balance.unclaimedAmount,
						totalEarned: balance.totalEarned,
						lastPayout: balance.lastPayout,
						currentPayout: asset.monthlyReports.length > 0 ? asset.monthlyReports[asset.monthlyReports.length - 1].payoutPerToken : 0,
						status: asset.production.status
					};
				}).filter(Boolean);
				
				loading = false;
				
				// Simulate real-time accrual
				if (isAccruing) {
					setInterval(() => {
						unclaimedPayout += (Math.random() * 0.05 + 0.02);
						totalEarned += (Math.random() * 0.05 + 0.02);
					}, 3000);
				}
			} catch (error) {
				console.error('Error loading claims data:', error);
				loading = false;
			}
		}
	}

	function handleWalletModalClose() {
		showWalletModal = false;
		// Redirect to home if wallet not connected
		if (!$walletStore.isConnected) {
			window.location.href = '/';
		}
	}
</script>

<svelte:head>
	<title>Claim Payouts - Albion</title>
	<meta name="description" content="Claim your oil & gas investment payouts and track earnings history" />
</svelte:head>

{#if !$walletStore.isConnected && !showWalletModal}
	<main class="claims-page">
		<div class="wallet-required">
			<div class="wallet-required-content">
				<h1>Wallet Connection Required</h1>
				<p>Please connect your wallet to view and claim your payouts.</p>
				<button class="connect-btn" on:click={() => showWalletModal = true}>
					Connect Wallet
				</button>
			</div>
		</div>
	</main>
{:else if $walletStore.isConnected}
<main class="claims-page">
	<!-- Hero Section -->
	<section class="hero">
		<div class="hero-content">
			<h1>Claim Payouts</h1>
			<p>Claim your earnings from oil & gas investments and track your payout history.</p>
			<div class="live-indicator">
				<div class="pulse-dot"></div>
				<span>Live Tracking: {isAccruing ? 'Active' : 'Paused'}</span>
			</div>
		</div>
	</section>

	{#if loading}
		<div class="loading-state">
			<p>Loading payout information...</p>
		</div>
	{:else}
		<!-- Success Message -->
		{#if claimSuccess}
			<div class="success-message">
				<h3>✅ Claim Successful!</h3>
				<p>Your payouts have been successfully transferred to your wallet.</p>
			</div>
		{/if}

		<!-- Payout Overview -->
		<section class="payout-overview">
			<div class="overview-grid">
				<div class="overview-card total">
					<div class="card-content">
						<div class="metric-value">{formatCurrency(totalEarned)}</div>
						<div class="metric-label">Total Earned</div>
						<div class="metric-note">All time from investments</div>
					</div>
				</div>
				
				<div class="overview-card claimed">
					<div class="card-content">
						<div class="metric-value">{formatCurrency(totalClaimed)}</div>
						<div class="metric-label">Total Claimed</div>
						<div class="metric-note">Successfully withdrawn</div>
					</div>
				</div>
				
				<div class="overview-card unclaimed">
					<div class="card-content">
						<div class="metric-value available">{formatCurrency(unclaimedPayout)}</div>
						<div class="metric-label">Available to Claim</div>
						<div class="metric-note">Ready for withdrawal</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Quick Claim Section -->
		<section class="quick-claim">
			<div class="claim-grid">
				<div class="claim-info">
					<h2>Quick Claim All</h2>
					<div class="claim-amount">
						<div class="amount-display">{formatCurrency(unclaimedPayout)}</div>
						<div class="amount-label">Total Available</div>
					</div>
					<div class="gas-info">
						<div class="gas-row">
							<span>Estimated Gas:</span>
							<span>~${marketData.gasFeesEstimate.medium}</span>
						</div>
						<div class="gas-row">
							<span>Net Amount:</span>
							<span class="net-amount">{formatCurrency(unclaimedPayout - marketData.gasFeesEstimate.medium)}</span>
						</div>
					</div>
				</div>
				
				<div class="claim-actions">
					<button 
						class="claim-btn primary"
						on:click={handleClaim}
						disabled={claiming || unclaimedPayout <= 0}
					>
						{#if claiming}
							Claiming...
						{:else}
							Claim All {formatCurrency(unclaimedPayout)}
						{/if}
					</button>
					<button class="claim-btn secondary">
						Claim & Reinvest
					</button>
				</div>
			</div>
		</section>

		<!-- Asset-by-Asset Claiming -->
		<section class="asset-claims">
			<div class="section-header">
				<h2>Claim by Asset</h2>
				<div class="controls">
					<button 
						class="control-btn"
						on:click={handleSelectAll}
					>
						{selectedAssets.length === holdings.length ? 'Deselect All' : 'Select All'}
					</button>
					{#if selectedAssets.length > 0}
						<button 
							class="control-btn primary"
							on:click={handleClaim}
							disabled={claiming}
						>
							{#if claiming}
								Claiming...
							{:else}
								Claim Selected {formatCurrency(getSelectedAmount())}
							{/if}
						</button>
					{/if}
				</div>
			</div>

			<div class="assets-list">
				{#each holdings as holding}
					<div class="asset-card" class:selected={selectedAssets.includes(holding.id)}>
						<div class="asset-main">
							<div class="asset-select">
								<input 
									type="checkbox" 
									checked={selectedAssets.includes(holding.id)}
									on:change={() => handleAssetSelect(holding.id)}
								/>
							</div>
							
							<div class="asset-info">
								<h3>{holding.name}</h3>
								<p class="asset-location">{holding.location}</p>
								<span class="status-badge" class:producing={holding.status === 'producing'}>
									{holding.status.toUpperCase()}
								</span>
							</div>
							
							<div class="asset-metrics">
								<div class="metric">
									<div class="metric-value unclaimed">{formatCurrency(holding.unclaimedAmount)}</div>
									<div class="metric-label">Unclaimed</div>
								</div>
								<div class="metric">
									<div class="metric-value">{formatCurrency(holding.totalEarned)}</div>
									<div class="metric-label">Total Earned</div>
								</div>
								<div class="metric">
									<div class="metric-value">{holding.currentPayout}%</div>
									<div class="metric-label">Current Payout</div>
								</div>
							</div>
							
							<div class="asset-actions">
								<button 
									class="asset-claim-btn"
									on:click={() => handleAssetSelect(holding.id)}
								>
									Claim
								</button>
							</div>
						</div>
						
						<div class="asset-footer">
							<div class="footer-info">
								<span>Last Payout: {formatDate(holding.lastPayout)}</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Claim Settings & History -->
		<section class="bottom-section">
			<div class="bottom-grid">
				<!-- Claim Settings -->
				<div class="settings-card">
					<h3>Claim Settings</h3>
					
					<div class="setting-group">
						<div class="setting-label">Claim Method</div>
						<div class="radio-group">
							<label class="radio-option">
								<input 
									type="radio" 
									name="claimMethod" 
									value="wallet"
									bind:group={claimMethod}
								/>
								<div class="radio-content">
									<div class="radio-title">Direct to Wallet</div>
									<div class="radio-desc">Instant transfer to connected wallet</div>
								</div>
							</label>
							<label class="radio-option">
								<input 
									type="radio" 
									name="claimMethod" 
									value="reinvest"
									bind:group={claimMethod}
								/>
								<div class="radio-content">
									<div class="radio-title">Auto-Reinvest</div>
									<div class="radio-desc">Automatically purchase more tokens</div>
								</div>
							</label>
						</div>
					</div>
				</div>

				<!-- Statistics -->
				<div class="stats-card">
					<h3>Payout Statistics</h3>
					
					<div class="stats-grid">
						<div class="stat-item">
							<div class="stat-value">13.2%</div>
							<div class="stat-label">Avg Portfolio IRR</div>
						</div>
						<div class="stat-item">
							<div class="stat-value">{formatCurrency(totalEarned / 12)}</div>
							<div class="stat-label">Avg Monthly Income</div>
						</div>
					</div>
					
					<div class="stats-list">
						<div class="stats-row">
							<span>Total Payouts This Year:</span>
							<span>24</span>
						</div>
						<div class="stats-row">
							<span>Days Since Last Claim:</span>
							<span>3</span>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Claim History -->
		<section class="claim-history">
			<div class="history-header">
				<h2>Claim History</h2>
				<div class="history-controls">
					<button class="control-btn active">Recent</button>
					<button class="control-btn">All Time</button>
					<button class="control-btn">Export</button>
				</div>
			</div>
			
			<div class="history-table">
				<div class="table-header">
					<div class="header-cell">Date</div>
					<div class="header-cell">Asset</div>
					<div class="header-cell">Amount</div>
					<div class="header-cell">Transaction</div>
					<div class="header-cell">Status</div>
				</div>
				
				{#each claimHistory as claim}
					<div class="table-row">
						<div class="table-cell">{formatDate(claim.date)}</div>
						<div class="table-cell">
							<div class="asset-name">{claim.asset}</div>
						</div>
						<div class="table-cell amount">{formatCurrency(claim.amount)}</div>
						<div class="table-cell">
							<div class="tx-hash">{claim.txHash}</div>
						</div>
						<div class="table-cell">
							<span class="status-completed">✓ Completed</span>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}
</main>
{/if}

<!-- Wallet Modal -->
<WalletModal
	bind:isOpen={showWalletModal}
	isConnecting={$walletStore.isConnecting}
	on:connect={handleWalletConnect}
	on:close={handleWalletModalClose}
/>

<style>
	.claims-page {
		padding: 0;
		max-width: 1200px;
		margin: 0 auto;
	}

	/* Wallet Required Screen */
	.wallet-required {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		text-align: center;
		padding: 2rem;
	}

	.wallet-required-content h1 {
		font-size: 2rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 1rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.wallet-required-content p {
		font-size: 1.1rem;
		color: var(--color-black);
		margin-bottom: 2rem;
		opacity: 0.8;
	}

	.wallet-required .connect-btn {
		background: var(--color-primary);
		color: var(--color-white);
		border: none;
		padding: 1rem 2rem;
		font-family: var(--font-family);
		font-weight: var(--font-weight-extrabold);
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.wallet-required .connect-btn:hover {
		background: var(--color-secondary);
	}

	/* Hero Section */
	.hero {
		padding: 4rem 2rem;
		text-align: center;
		background: var(--color-white);
		border-bottom: 1px solid var(--color-light-gray);
	}

	.hero-content {
		max-width: 800px;
		margin: 0 auto;
	}

	.hero h1 {
		font-size: 2.5rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 1rem;
		color: var(--color-black);
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}

	.hero p {
		font-size: 1.1rem;
		color: var(--color-black);
		margin-bottom: 2rem;
	}

	.live-indicator {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.pulse-dot {
		width: 8px;
		height: 8px;
		background: var(--color-primary);
		border-radius: 50%;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	.loading-state {
		text-align: center;
		padding: 4rem 2rem;
		color: var(--color-black);
	}

	.success-message {
		background: var(--color-light-gray);
		border: 1px solid var(--color-primary);
		color: var(--color-primary);
		padding: 1.5rem;
		margin: 2rem;
		text-align: center;
	}

	.success-message h3 {
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 0.5rem;
	}

	/* Payout Overview */
	.payout-overview {
		padding: 3rem 2rem;
	}

	.overview-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2rem;
	}

	.overview-card {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		padding: 2rem;
		text-align: center;
	}

	.metric-value {
		font-size: 2rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
	}

	.metric-value.available {
		color: var(--color-primary);
	}

	.metric-label {
		font-size: 0.8rem;
		font-weight: var(--font-weight-bold);
		color: var(--color-black);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.25rem;
	}

	.metric-note {
		font-size: 0.75rem;
		color: var(--color-secondary);
		font-weight: var(--font-weight-medium);
	}

	/* Quick Claim */
	.quick-claim {
		padding: 0 2rem 3rem;
	}

	.claim-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 3rem;
		background: var(--color-light-gray);
		border: 1px solid var(--color-light-gray);
		padding: 3rem;
	}

	.claim-info h2 {
		font-size: 1.5rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 2rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.amount-display {
		font-size: 2.5rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-primary);
		margin-bottom: 0.5rem;
	}

	.amount-label {
		font-size: 0.9rem;
		color: var(--color-black);
		font-weight: var(--font-weight-semibold);
		margin-bottom: 2rem;
	}

	.gas-info {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-size: 0.9rem;
	}

	.gas-row {
		display: flex;
		justify-content: space-between;
	}

	.gas-row span:first-child {
		color: var(--color-black);
		font-weight: var(--font-weight-semibold);
	}

	.gas-row span:last-child {
		color: var(--color-black);
		font-weight: var(--font-weight-extrabold);
	}

	.net-amount {
		color: var(--color-primary) !important;
	}

	.claim-actions {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		justify-content: center;
	}

	.claim-btn {
		padding: 1rem 2rem;
		border: none;
		font-family: var(--font-family);
		font-weight: var(--font-weight-extrabold);
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.claim-btn.primary {
		background: var(--color-black);
		color: var(--color-white);
	}

	.claim-btn.primary:hover:not(:disabled) {
		background: var(--color-secondary);
	}

	.claim-btn.secondary {
		background: var(--color-white);
		color: var(--color-black);
		border: 1px solid var(--color-black);
	}

	.claim-btn.secondary:hover {
		background: var(--color-black);
		color: var(--color-white);
	}

	.claim-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Asset Claims */
	.asset-claims {
		padding: 3rem 2rem;
		background: var(--color-white);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.section-header h2 {
		font-size: 1.75rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.controls {
		display: flex;
		gap: 1rem;
	}

	.control-btn {
		padding: 0.75rem 1.5rem;
		background: var(--color-white);
		border: 1px solid var(--color-black);
		color: var(--color-black);
		font-family: var(--font-family);
		font-weight: var(--font-weight-semibold);
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.control-btn:hover,
	.control-btn.active {
		background: var(--color-black);
		color: var(--color-white);
	}

	.control-btn.primary {
		background: var(--color-primary);
		border-color: var(--color-primary);
		color: var(--color-white);
	}

	.control-btn.primary:hover {
		opacity: 0.9;
	}

	.assets-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.asset-card {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		padding: 2rem;
		transition: all 0.2s ease;
	}

	.asset-card.selected {
		border-color: var(--color-primary);
		background: var(--color-light-gray);
	}

	.asset-main {
		display: grid;
		grid-template-columns: auto 2fr 3fr auto;
		gap: 2rem;
		align-items: center;
		margin-bottom: 1rem;
	}

	.asset-select input {
		width: 1.25rem;
		height: 1.25rem;
	}

	.asset-info h3 {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
		font-size: 1rem;
	}

	.asset-location {
		color: var(--color-black);
		opacity: 0.7;
		font-size: 0.85rem;
		margin-bottom: 0.5rem;
	}

	.status-badge {
		background: var(--color-light-gray);
		color: var(--color-secondary);
		padding: 0.25rem 0.5rem;
		font-size: 0.7rem;
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.status-badge.producing {
		color: var(--color-primary);
	}

	.asset-metrics {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		text-align: center;
	}

	.metric .metric-value {
		font-size: 1.1rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.25rem;
	}

	.metric .metric-value.unclaimed {
		color: var(--color-primary);
	}

	.metric .metric-label {
		font-size: 0.7rem;
		font-weight: var(--font-weight-bold);
		color: var(--color-black);
		opacity: 0.7;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.asset-claim-btn {
		background: var(--color-black);
		color: var(--color-white);
		border: none;
		padding: 0.75rem 1.5rem;
		font-family: var(--font-family);
		font-weight: var(--font-weight-semibold);
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.asset-claim-btn:hover {
		background: var(--color-secondary);
	}

	.asset-footer {
		border-top: 1px solid var(--color-light-gray);
		padding-top: 1rem;
	}

	.footer-info {
		font-size: 0.85rem;
		color: var(--color-black);
		opacity: 0.7;
	}

	/* Bottom Section */
	.bottom-section {
		padding: 3rem 2rem;
		background: var(--color-light-gray);
	}

	.bottom-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 3rem;
	}

	.settings-card,
	.stats-card {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		padding: 2rem;
	}

	.settings-card h3,
	.stats-card h3 {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 1.5rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.setting-group {
		margin-bottom: 2rem;
	}

	.setting-label {
		font-size: 0.8rem;
		font-weight: var(--font-weight-bold);
		color: var(--color-black);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 1rem;
	}

	.radio-group {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.radio-option {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		cursor: pointer;
	}

	.radio-content {
		flex: 1;
	}

	.radio-title {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		font-size: 0.9rem;
		margin-bottom: 0.25rem;
	}

	.radio-desc {
		font-size: 0.8rem;
		color: var(--color-black);
		opacity: 0.7;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.stat-item {
		text-align: center;
		padding: 1rem;
		background: var(--color-light-gray);
		border: 1px solid var(--color-light-gray);
	}

	.stat-value {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-primary);
		margin-bottom: 0.25rem;
	}

	.stat-label {
		font-size: 0.7rem;
		font-weight: var(--font-weight-bold);
		color: var(--color-black);
		opacity: 0.7;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.stats-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.stats-row {
		display: flex;
		justify-content: space-between;
		font-size: 0.85rem;
	}

	.stats-row span:first-child {
		color: var(--color-black);
		opacity: 0.7;
	}

	.stats-row span:last-child {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
	}

	/* Claim History */
	.claim-history {
		padding: 3rem 2rem;
		background: var(--color-white);
	}

	.history-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.history-header h2 {
		font-size: 1.75rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.history-controls {
		display: flex;
		gap: 0.5rem;
	}

	.history-table {
		border: 1px solid var(--color-light-gray);
	}

	.table-header {
		display: grid;
		grid-template-columns: 1fr 2fr 1fr 1.5fr 1fr;
		gap: 1rem;
		padding: 1rem;
		background: var(--color-light-gray);
		border-bottom: 1px solid var(--color-light-gray);
	}

	.header-cell {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.table-row {
		display: grid;
		grid-template-columns: 1fr 2fr 1fr 1.5fr 1fr;
		gap: 1rem;
		padding: 1rem;
		border-bottom: 1px solid var(--color-light-gray);
		align-items: center;
	}

	.table-row:hover {
		background: var(--color-light-gray);
	}

	.table-cell {
		font-size: 0.85rem;
		color: var(--color-black);
	}

	.asset-name {
		font-weight: var(--font-weight-extrabold);
	}

	.table-cell.amount {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-primary);
	}

	.tx-hash {
		font-family: monospace;
		font-size: 0.8rem;
		color: var(--color-black);
		opacity: 0.7;
	}

	.status-completed {
		color: var(--color-primary);
		font-weight: var(--font-weight-semibold);
		font-size: 0.8rem;
	}

	@media (max-width: 768px) {
		.hero h1 {
			font-size: 2rem;
		}

		.overview-grid {
			grid-template-columns: 1fr;
		}

		.claim-grid {
			grid-template-columns: 1fr;
		}

		.asset-main {
			grid-template-columns: 1fr;
			gap: 1rem;
			text-align: center;
		}

		.asset-metrics {
			grid-template-columns: 1fr;
		}

		.controls {
			flex-direction: column;
		}

		.bottom-grid {
			grid-template-columns: 1fr;
		}

		.stats-grid {
			grid-template-columns: 1fr;
		}

		.table-header,
		.table-row {
			grid-template-columns: 1fr;
			gap: 0.5rem;
			text-align: center;
		}

		.header-cell,
		.table-cell {
			padding: 0.5rem 0;
		}
	}
</style>