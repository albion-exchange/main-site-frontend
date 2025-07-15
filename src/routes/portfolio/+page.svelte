<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import dataStoreService from '$lib/services/DataStoreService';
	import walletDataService from '$lib/services/WalletDataService';
	import type { Asset, Token } from '$lib/types/uiTypes';
	import { walletStore, walletActions } from '$lib/stores/wallet';
	import WalletModal from '$lib/components/WalletModal.svelte';
	import { Card, CardContent, CardActions, PrimaryButton, SecondaryButton, Metric, StatusBadge, TabNavigation } from '$lib/components/ui';
	import { getAssetCoverImage } from '$lib/utils/assetImages';

	let totalInvested = 0;
	let totalPayoutsEarned = 0;
	let unclaimedPayout = 0;
	let activeAssetsCount = 0;
	let activeTab = 'overview';
	let timeframe = '1M';
	let holdings: any[] = [];
	let monthlyPayouts: any[] = [];
	let tokenAllocations: any[] = [];
	let loading = true;
	let showWalletModal = false;

	onMount(async () => {
		// Check if wallet is connected
		if (!$walletStore.isConnected) {
			showWalletModal = true;
			return;
		}
		
		loadPortfolioData();
	});

	function loadPortfolioData() {
		try {
			// Load data from walletDataService
			totalInvested = walletDataService.getTotalInvested();
			totalPayoutsEarned = walletDataService.getTotalPayoutsEarned();
			unclaimedPayout = walletDataService.getUnclaimedPayouts();
			
			// Get holdings with asset info
			const assetPayouts = walletDataService.getHoldingsByAsset();
			const allAssets = dataStoreService.getAllAssets();
			
			// Count active assets
			activeAssetsCount = assetPayouts.length;
			
			// Transform holdings data
			holdings = assetPayouts.map(holding => {
				const asset = allAssets.find(a => a.id === holding.assetId);
				if (!asset) return null;
				
				return {
					id: holding.assetId,
					name: holding.assetName,
					location: asset ? `${asset.location.state}, ${asset.location.country}` : '',
					totalInvested: holding.totalInvested,
					totalPayoutsEarned: holding.totalEarned,
					unclaimedAmount: holding.unclaimedAmount,
					lastPayoutAmount: holding.lastPayoutAmount,
					lastPayoutDate: holding.lastPayoutDate,
					status: asset ? asset.production.status : 'unknown'
				};
			}).filter(Boolean);
			
			// Get monthly payout history
			monthlyPayouts = walletDataService.getMonthlyPayoutHistory();
			
			// Get token allocations
			tokenAllocations = walletDataService.getTokenAllocation();
			
			loading = false;
		} catch (error) {
			console.error('Error loading portfolio data:', error);
			loading = false;
		}
	}



	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(amount);
	}

	function formatPercent(percent: number): string {
		const sign = percent >= 0 ? '+' : '';
		return `${sign}${percent.toFixed(1)}%`;
	}

	function getCurrentTime(): string {
		return new Date().toLocaleTimeString();
	}
	
	async function handleWalletConnect() {
		await walletActions.connect();
		showWalletModal = false;
		
		// Reload the page content now that wallet is connected
		if ($walletStore.isConnected) {
			loading = true;
			loadPortfolioData();
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
	<title>Portfolio - Albion</title>
	<meta name="description" content="Track your oil & gas investment portfolio performance" />
</svelte:head>

{#if !$walletStore.isConnected && !showWalletModal}
	<main class="portfolio-page">
		<div class="wallet-required">
			<div class="wallet-required-content">
				<h1>Wallet Connection Required</h1>
				<p>Please connect your wallet to view your portfolio.</p>
				<PrimaryButton on:click={() => showWalletModal = true}>
					Connect Wallet
				</PrimaryButton>
			</div>
		</div>
	</main>
{:else if $walletStore.isConnected}
<main class="portfolio-page">
	<!-- Portfolio Overview Header -->
	<Card padding="3rem">
		<div class="overview-content">
			<div class="overview-main">
				<h1>Portfolio Overview</h1>
				
				<div class="portfolio-metrics">
					<Metric 
						value={formatCurrency(totalInvested)} 
						label="Invested" 
						note="Principal" 
					/>
					<Metric 
						value={formatCurrency(totalPayoutsEarned)} 
						label="Payout Earned (Lifetime)" 
						variant="positive"
					/>
				</div>

				<div class="portfolio-info">
					<div class="update-time">
						Last updated: {getCurrentTime()}
					</div>
					<div class="inception-info">
						Portfolio inception: Jul 2024 (6 months)
					</div>
				</div>
			</div>

			<!-- Quick Stats Panel -->
			<Card padding="2rem">
				<h3>Quick Stats</h3>
				
				<div class="stats-list">
					<div class="stat-row">
						<span>Return Calc TBD</span>
						<span class="payout">--</span>
					</div>
					<div class="stat-row">
						<span>Unclaimed Payouts</span>
						<span class="payout">{formatCurrency(unclaimedPayout)}</span>
					</div>
					<div class="stat-row">
						<span>Active Assets</span>
						<span>{activeAssetsCount}</span>
					</div>
					<div class="stat-row">
						<span>Monthly Income</span>
						<span class="payout">{formatCurrency(monthlyPayouts.length > 0 ? monthlyPayouts[monthlyPayouts.length - 1].totalPayout : 0)}</span>
					</div>
				</div>

			</Card>
		</div>
	</Card>

	<!-- Portfolio Tabs -->
	<Card>
		<TabNavigation 
			tabs={[
				{ id: 'overview', label: 'Holdings' },
				{ id: 'performance', label: 'Performance' },
				{ id: 'allocation', label: 'Allocation' }
			]}
			bind:activeTab
			on:tabChange={(e) => activeTab = e.detail.tabId}
		/>

		<div class="tab-content">
			{#if activeTab === 'overview'}
				<div class="holdings-content">
					<div class="holdings-header">
						<h3>My Holdings</h3>
					</div>

					<div class="holdings-list">
						{#if loading}
							<div class="loading-message">Loading portfolio holdings...</div>
						{:else}
							{#each holdings as holding}
								<Card padding="2rem" hoverable>
									<div class="holding-main">
										<div class="holding-info">
											<div class="holding-icon">
												<img src={getAssetCoverImage(holding.id)} alt={holding.name} />
											</div>
											<div class="holding-details">
												<h4>{holding.name}</h4>
												<div class="holding-location">{holding.location}</div>
												<div class="holding-badges">
													<StatusBadge 
														status={holding.status} 
														variant={holding.status === 'producing' ? 'available' : 'default'}
													>
														{holding.status.toUpperCase()}
													</StatusBadge>
												</div>
											</div>
										</div>

										<div class="holding-tokens">
											<div class="tokens-value">{formatCurrency(holding.totalInvested)}</div>
											<div class="tokens-label">Invested</div>
										</div>


										<div class="holding-payout">
											<div class="payout-value">{formatCurrency(holding.totalPayoutsEarned)}</div>
											<div class="payout-label">Earned</div>
										</div>

										<div class="holding-actions">
											<SecondaryButton size="small">Manage</SecondaryButton>
										</div>
									</div>

									<div class="holding-footer">
										<div class="footer-item">
											<span>Unclaimed:</span>
											<span class="payout">{formatCurrency(holding.unclaimedAmount)}</span>
										</div>
										<div class="footer-item">
											<span>Last Payout:</span>
											<span>{holding.lastPayoutDate ? new Date(holding.lastPayoutDate).toLocaleDateString() : 'N/A'}</span>
										</div>
										<div class="footer-item">
											<span>Status:</span>
											<span class="positive">Active</span>
										</div>
									</div>
								</Card>
							{/each}
						{/if}
					</div>
				</div>
			{:else if activeTab === 'performance'}
				<div class="performance-content">
					<div class="performance-header">
						<h3>Performance Analytics</h3>
						<div class="timeframe-controls">
							{#each ['1M', '3M', '6M', 'YTD'] as period}
								<button 
									class="timeframe-btn"
									class:active={timeframe === period}
									on:click={() => timeframe = period}
								>
									{period}
								</button>
							{/each}
						</div>
					</div>

					<div class="performance-grid">
						<div class="chart-section">
							<div class="chart-placeholder">
								<div class="chart-content">
									<div class="chart-icon">📈</div>
									<div class="chart-label">Portfolio Value Chart</div>
									<div class="chart-note">Total value vs payout earnings over time</div>
								</div>
							</div>
						</div>

						<div class="performance-stats">
							<div class="perf-stat">
								<div class="perf-value positive">{formatCurrency(totalPayoutsEarned)}</div>
								<div class="perf-label">Total Payouts</div>
								<div class="perf-note">Lifetime</div>
							</div>
							<div class="perf-stat">
								<div class="perf-value">{formatCurrency(monthlyPayouts.length > 0 ? monthlyPayouts[monthlyPayouts.length - 1].totalPayout : 0)}</div>
								<div class="perf-label">Last Month</div>
								<div class="perf-note">Payout</div>
							</div>
							<div class="perf-stat">
								<div class="perf-value positive">{formatCurrency(walletDataService.getEstimatedAnnualIncome())}</div>
								<div class="perf-label">Est. Annual</div>
								<div class="perf-note">Income</div>
							</div>
						</div>
					</div>

					<div class="monthly-performance">
						<h4>Monthly Payouts</h4>
						<div class="monthly-grid">
							{#each monthlyPayouts.slice(-6) as month}
								<div class="monthly-item">
									<div class="month-label">{month.month.slice(0, 7)}</div>
									<div class="month-value">{formatCurrency(month.totalPayout)}</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{:else if activeTab === 'allocation'}
				<div class="allocation-content">
					<div class="allocation-grid">
						<div class="allocation-chart">
							<h3>Asset Allocation</h3>
							<div class="chart-placeholder">
								<div class="chart-content">
									<div class="chart-icon">🥧</div>
									<div class="chart-label">Portfolio Pie Chart</div>
									<div class="chart-note">Asset allocation by value</div>
								</div>
							</div>
						</div>

						<div class="allocation-breakdown">
							<h3>Allocation Breakdown</h3>
							<div class="allocation-list">
								{#each tokenAllocations as allocation}
									<div class="allocation-item">
										<div class="allocation-asset">
											<div class="asset-icon">
												<img src={getAssetCoverImage(allocation.tokenSymbol.toLowerCase().replace(/_/g, '-').replace(/\d+$/, ''))} alt={allocation.assetName} />
											</div>
											<div class="asset-info">
												<div class="asset-name">{allocation.assetName}</div>
												<div class="asset-location">{allocation.tokensOwned} tokens</div>
											</div>
										</div>
										<div class="allocation-stats">
											<div class="allocation-percent">{allocation.percentageOfPortfolio.toFixed(1)}%</div>
											<div class="allocation-value">{formatCurrency(allocation.currentValue)}</div>
										</div>
									</div>
								{/each}
							</div>

							{#if tokenAllocations.length > 0 && tokenAllocations[0].percentageOfPortfolio > 40}
							<div class="diversification-tip">
								<div class="tip-icon">⚠️</div>
								<div class="tip-content">
									<div class="tip-title">Diversification Tip</div>
									<div class="tip-text">
										Consider diversifying: {tokenAllocations[0].percentageOfPortfolio.toFixed(1)}% allocation to single asset ({tokenAllocations[0].assetName}) may impact portfolio balance.
									</div>
								</div>
							</div>
							{/if}
						</div>
					</div>
				</div>
			{/if}
		</div>
	</Card>

	<!-- Quick Actions -->
	<div class="quick-actions">
		<div class="action-card">
			<div class="action-icon">➕</div>
			<h4>Add Investment</h4>
			<p>Diversify with new assets</p>
			<a href="/assets" class="action-btn primary">Browse Assets</a>
		</div>

		<div class="action-card">
			<div class="action-icon">💰</div>
			<h4>Claim Payouts</h4>
			<p>{formatCurrency(unclaimedPayout)} available</p>
			<a href="/claims" class="action-btn claim">Claim Now</a>
		</div>


		<div class="action-card">
			<div class="action-icon">📥</div>
			<h4>Export Data</h4>
			<p>Tax & accounting reports</p>
			<button class="action-btn secondary">Download</button>
		</div>
	</div>
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
	.portfolio-page {
		padding: 2rem;
		max-width: 1024px;
		margin: 0 auto;
	}

	/* Wallet Required Screen */
	.wallet-required {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		text-align: center;
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


	/* Portfolio Overview */

	.overview-content {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 3rem;
	}

	.overview-main h1 {
		font-size: 2.5rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 2rem;
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}

	.portfolio-metrics {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 2rem;
		margin-bottom: 2rem;
	}


	.portfolio-info {
		display: flex;
		align-items: center;
		gap: 2rem;
		font-size: 0.85rem;
		font-weight: var(--font-weight-semibold);
	}

	.update-time,
	.inception-info {
		color: var(--color-black);
		opacity: 0.7;
	}

	/* Quick Stats */

	.stats-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.stat-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.9rem;
	}

	.stat-row span:first-child {
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
		opacity: 0.8;
	}

	.stat-row span:last-child {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
	}

	.stat-row .payout {
		color: var(--color-primary);
	}


	/* Tabs */

	.tab-content {
		padding: 2rem;
	}

	/* Holdings Tab */
	.holdings-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.holdings-header h3 {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}


	.holdings-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}


	.holding-main {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr 0.5fr;
		gap: 2rem;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.holding-info {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.holding-icon {
		width: 2.5rem;
		height: 2.5rem;
		background: var(--color-light-gray);
		border-radius: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem;
		overflow: hidden;
	}

	.holding-icon img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.holding-details h4 {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.25rem;
		font-size: 0.9rem;
	}

	.holding-location {
		font-size: 0.8rem;
		color: var(--color-black);
		opacity: 0.7;
		margin-bottom: 0.5rem;
	}

	.holding-badges {
		display: flex;
		gap: 0.5rem;
	}


	.holding-tokens,
	.holding-payout {
		text-align: center;
	}

	.tokens-value,
	.payout-value {
		font-size: 1.1rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.25rem;
	}

	.payout-value {
		color: var(--color-primary);
	}

	.tokens-label,
	.payout-label {
		font-size: 0.65rem;
		font-weight: var(--font-weight-bold);
		color: var(--color-black);
		opacity: 0.7;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.25rem;
	}



	.holding-footer {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--color-light-gray);
	}

	.footer-item {
		display: flex;
		justify-content: space-between;
		font-size: 0.85rem;
	}

	.footer-item span:first-child {
		color: var(--color-black);
		opacity: 0.7;
		font-weight: var(--font-weight-semibold);
	}

	.footer-item span:last-child {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
	}

	.footer-item .payout {
		color: var(--color-primary);
	}

	.footer-item .positive {
		color: var(--color-primary);
	}

	/* Performance Tab */
	.performance-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.performance-header h3 {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.timeframe-controls {
		display: flex;
		gap: 0.5rem;
	}

	.timeframe-btn {
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--color-light-gray);
		background: var(--color-white);
		color: var(--color-black);
		font-family: var(--font-family);
		font-weight: var(--font-weight-bold);
		font-size: 0.75rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.timeframe-btn:hover,
	.timeframe-btn.active {
		background: var(--color-black);
		color: var(--color-white);
		border-color: var(--color-black);
	}

	.performance-grid {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.chart-placeholder {
		height: 16rem;
		background: linear-gradient(135deg, var(--color-light-gray), var(--color-white));
		border: 1px solid var(--color-light-gray);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.chart-content {
		text-align: center;
	}

	.chart-icon {
		font-size: 3rem;
		margin-bottom: 0.5rem;
		opacity: 0.5;
	}

	.chart-label {
		font-weight: var(--font-weight-bold);
		color: var(--color-black);
		margin-bottom: 0.25rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.chart-note {
		font-size: 0.75rem;
		color: var(--color-black);
		opacity: 0.7;
	}

	.performance-stats {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.perf-stat {
		border: 1px solid var(--color-light-gray);
		padding: 1.5rem;
		text-align: center;
	}

	.perf-value {
		font-size: 1.5rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
	}

	.perf-value.positive {
		color: var(--color-primary);
	}

	.perf-label {
		font-size: 0.7rem;
		font-weight: var(--font-weight-bold);
		color: var(--color-black);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.25rem;
	}

	.perf-note {
		font-size: 0.65rem;
		color: var(--color-black);
		opacity: 0.6;
	}

	.monthly-performance {
		background: var(--color-light-gray);
		border: 1px solid var(--color-light-gray);
		padding: 2rem;
	}

	.monthly-performance h4 {
		font-size: 1.1rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 1.5rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.monthly-grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 1.5rem;
	}

	.monthly-item {
		text-align: center;
	}

	.month-label {
		font-size: 0.8rem;
		font-weight: var(--font-weight-bold);
		color: var(--color-black);
		opacity: 0.7;
		margin-bottom: 0.5rem;
	}

	.month-value {
		font-size: 1rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.25rem;
	}


	/* Allocation Tab */
	.allocation-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 3rem;
	}

	.allocation-chart h3,
	.allocation-breakdown h3 {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 1.5rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.allocation-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.allocation-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--color-light-gray);
	}

	.allocation-item:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.allocation-asset {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.asset-icon {
		width: 2rem;
		height: 2rem;
		background: var(--color-light-gray);
		border-radius: 0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1rem;
		overflow: hidden;
	}

	.asset-icon img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.asset-name {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		font-size: 0.85rem;
	}

	.asset-location {
		font-size: 0.75rem;
		color: var(--color-black);
		opacity: 0.7;
	}

	.allocation-stats {
		text-align: right;
	}

	.allocation-percent {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		font-size: 0.9rem;
	}

	.allocation-value {
		font-size: 0.75rem;
		color: var(--color-black);
		opacity: 0.7;
	}

	.diversification-tip {
		background: #fef3c7;
		border: 1px solid #fbbf24;
		padding: 1rem;
		display: flex;
		gap: 0.75rem;
	}

	.tip-icon {
		font-size: 1.25rem;
		flex-shrink: 0;
		margin-top: 0.125rem;
	}

	.tip-title {
		font-weight: var(--font-weight-bold);
		color: var(--color-black);
		font-size: 0.85rem;
		margin-bottom: 0.25rem;
	}

	.tip-text {
		font-size: 0.75rem;
		color: var(--color-black);
		opacity: 0.8;
		line-height: 1.4;
	}

	/* Analytics Tab - unused styles removed */

	/* Quick Actions */
	.quick-actions {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2rem;
	}

	.action-card {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		padding: 2rem;
		text-align: center;
	}

	.action-icon {
		font-size: 2rem;
		margin: 0 auto 1rem;
	}

	.action-card h4 {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
		text-transform: uppercase;
		font-size: 0.9rem;
		letter-spacing: 0.05em;
	}

	.action-card p {
		font-size: 0.85rem;
		color: var(--color-black);
		opacity: 0.7;
		margin-bottom: 1.5rem;
	}

	.action-btn {
		padding: 0.75rem 1.5rem;
		border: none;
		font-family: var(--font-family);
		font-weight: var(--font-weight-bold);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		transition: all 0.2s ease;
		width: 100%;
		text-decoration: none;
		display: inline-block;
		text-align: center;
	}

	.action-btn.primary {
		background: var(--color-black);
		color: var(--color-white);
	}

	.action-btn.primary:hover {
		background: var(--color-secondary);
	}

	.action-btn.claim {
		background: var(--color-primary);
		color: var(--color-white);
	}

	.action-btn.claim:hover {
		opacity: 0.9;
	}

	.action-btn.secondary {
		background: var(--color-white);
		color: var(--color-black);
		border: 1px solid var(--color-black);
	}

	.action-btn.secondary:hover {
		background: var(--color-black);
		color: var(--color-white);
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.portfolio-page {
			padding: 1rem;
		}

		.overview-content {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.portfolio-metrics {
			grid-template-columns: 1fr;
		}


		.portfolio-info {
			flex-direction: column;
			gap: 0.5rem;
			align-items: flex-start;
		}

		.holdings-header {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}

		.holding-main {
			grid-template-columns: 1fr;
			gap: 1rem;
			text-align: center;
		}

		.holding-info {
			justify-content: center;
		}

		.holding-footer {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.performance-grid,
		.allocation-grid {
			grid-template-columns: 1fr;
		}

		.monthly-grid {
			grid-template-columns: repeat(3, 1fr);
		}

		.quick-actions {
			grid-template-columns: 1fr;
		}

	}
</style>