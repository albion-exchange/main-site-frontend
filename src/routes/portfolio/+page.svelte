<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import dataStoreService from '$lib/services/DataStoreService';
	import type { Asset, Token } from '$lib/types/dataStore';
	import { walletStore, walletActions } from '$lib/stores/wallet';
	import WalletModal from '$lib/components/WalletModal.svelte';
	import { getMockPortfolioHoldings, calculatePortfolioSummary } from '$lib/utils/portfolioCalculations';

	let totalPortfolioValue = 0;
	let totalInvested = 0;
	let unrealizedGains = 0;
	let unclaimedPayout = 0;
	let activeTab = 'overview';
	let timeframe = '1M';
	let portfolioInterval: number;
	let holdings: any[] = [];
	let loading = true;
	let showWalletModal = false;

	// Mock portfolio data based on real assets
	const mockPortfolioBalances = [
		{ assetId: 'europa-wressle-release-1', tokensOwned: 18750, investmentAmount: 18750, totalEarned: 2847.15, lastPayout: '2024-12-15' },
		{ assetId: 'bakken-horizon-field', tokensOwned: 12500, investmentAmount: 12500, totalEarned: 2156.47, lastPayout: '2024-12-10' },
		{ assetId: 'permian-basin-venture', tokensOwned: 8750, investmentAmount: 8750, totalEarned: 1847.21, lastPayout: '2024-12-20' },
		{ assetId: 'gulf-mexico-deep-water', tokensOwned: 2000, investmentAmount: 2000, totalEarned: 621.32, lastPayout: '2024-12-05' }
	];

	const performanceData = [
		{ month: 'Jul 2024', value: 42000, payout: 0 },
		{ month: 'Aug 2024', value: 42450, payout: 450 },
		{ month: 'Sep 2024', value: 43120, payout: 890 },
		{ month: 'Oct 2024', value: 44200, payout: 1340 },
		{ month: 'Nov 2024', value: 45800, payout: 1820 },
		{ month: 'Dec 2024', value: 47250, payout: 2280 }
	];

	// Map asset icons
	const assetIcons: Record<string, string> = {
		'europa-wressle-release-1': '🌊',
		'bakken-horizon-field': '⛰️',
		'permian-basin-venture': '⛽',
		'gulf-mexico-deep-water': '💧'
	};

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
			totalPortfolioValue = summary.totalPortfolioValue;
			totalInvested = summary.totalInvested;
			unrealizedGains = summary.unrealizedGains;
			unclaimedPayout = summary.unclaimedPayout;
			
			// Load real assets and create portfolio holdings
			const allAssets = dataStoreService.getAllAssets();
			
			holdings = portfolioHoldings.map(balance => {
				const asset = allAssets.find(a => a.id === balance.assetId);
				if (!asset) return null;
				
				// Use calculated values from portfolio holdings
				const unrealizedGain = balance.currentValue - balance.investmentAmount;
				const unrealizedGainPercent = (unrealizedGain / balance.investmentAmount) * 100;
				const allocation = (balance.currentValue / totalPortfolioValue) * 100;
				
				return {
					id: asset.id,
					name: asset.name,
					location: `${asset.location.state}, ${asset.location.country}`,
					tokensOwned: balance.tokensOwned,
					investmentAmount: balance.investmentAmount,
					currentValue: balance.currentValue,
					unrealizedGain: unrealizedGain,
					unrealizedGainPercent: unrealizedGainPercent,
					currentPayout: asset.monthlyReports.length > 0 ? asset.monthlyReports[asset.monthlyReports.length - 1].payoutPerToken : 0,
					totalEarned: balance.totalEarned,
					lastPayout: balance.lastPayout,
					status: asset.production.status,
					allocation: allocation,
					icon: assetIcons[asset.id] || '🏭'
				};
			}).filter(Boolean);
			
			loading = false;
			
			// Simulate portfolio value updates
			portfolioInterval = setInterval(() => {
				totalPortfolioValue = totalPortfolioValue + (Math.random() * 10 - 5);
				unrealizedGains = totalPortfolioValue - totalInvested;
			}, 5000);
		} catch (error) {
			console.error('Error loading portfolio data:', error);
			loading = false;
		}
	});

	onDestroy(() => {
		if (portfolioInterval) {
			clearInterval(portfolioInterval);
		}
	});

	// Calculated portfolio metrics
	$: portfolioMetrics = holdings.length > 0 ? {
		totalReturn: ((totalPortfolioValue - totalInvested) / totalInvested) * 100,
		payoutReturn: (holdings.reduce((sum, h) => sum + h.totalEarned, 0) / totalInvested) * 100,
		averagePayout: holdings.reduce((acc, h) => acc + h.currentPayout, 0) / holdings.length,
		bestPerformer: holdings.reduce((best, current) => 
			current.unrealizedGainPercent > best.unrealizedGainPercent ? current : best
		),
		worstPerformer: holdings.reduce((worst, current) => 
			current.unrealizedGainPercent < worst.unrealizedGainPercent ? current : worst
		),
		totalTokens: holdings.reduce((sum, h) => sum + h.tokensOwned, 0),
		totalPayoutEarned: holdings.reduce((sum, h) => sum + h.totalEarned, 0)
	} : {
		totalReturn: 0,
		payoutReturn: 0,
		averagePayout: 0,
		bestPerformer: null,
		worstPerformer: null,
		totalTokens: 0,
		totalPayoutEarned: 0
	};

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
			try {
				const allAssets = dataStoreService.getAllAssets();
				
				holdings = mockPortfolioBalances.map(balance => {
					const asset = allAssets.find(a => a.id === balance.assetId);
					if (!asset) return null;
					
					const pricePerToken = 1.25;
					const currentValue = balance.tokensOwned * pricePerToken;
					const unrealizedGain = currentValue - balance.investmentAmount;
					const unrealizedGainPercent = (unrealizedGain / balance.investmentAmount) * 100;
					const allocation = (currentValue / totalPortfolioValue) * 100;
					
					return {
						id: asset.id,
						name: asset.name,
						location: `${asset.location.state}, ${asset.location.country}`,
						tokensOwned: balance.tokensOwned,
						investmentAmount: balance.investmentAmount,
						currentValue: currentValue,
						unrealizedGain: unrealizedGain,
						unrealizedGainPercent: unrealizedGainPercent,
						currentPayout: asset.monthlyReports.length > 0 ? asset.monthlyReports[asset.monthlyReports.length - 1].payoutPerToken : 0,
						totalEarned: balance.totalEarned,
						lastPayout: balance.lastPayout,
						status: asset.production.status,
						allocation: allocation,
						icon: assetIcons[asset.id] || '🏭'
					};
				}).filter(Boolean);
				
				loading = false;
				
				// Start portfolio updates
				portfolioInterval = setInterval(() => {
					totalPortfolioValue = totalPortfolioValue + (Math.random() * 10 - 5);
					unrealizedGains = totalPortfolioValue - totalInvested;
				}, 5000);
			} catch (error) {
				console.error('Error loading portfolio data:', error);
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
	<title>Portfolio - Albion</title>
	<meta name="description" content="Track your oil & gas investment portfolio performance" />
</svelte:head>

{#if !$walletStore.isConnected && !showWalletModal}
	<main class="portfolio-page">
		<div class="wallet-required">
			<div class="wallet-required-content">
				<h1>Wallet Connection Required</h1>
				<p>Please connect your wallet to view your portfolio.</p>
				<button class="connect-btn" on:click={() => showWalletModal = true}>
					Connect Wallet
				</button>
			</div>
		</div>
	</main>
{:else if $walletStore.isConnected}
<main class="portfolio-page">
	<!-- Portfolio Overview Header -->
	<div class="portfolio-overview">
		<div class="overview-content">
			<div class="overview-main">
				<h1>Portfolio Overview</h1>
				
				<div class="portfolio-metrics">
					<div class="metric">
						<div class="metric-value">{formatCurrency(totalPortfolioValue)}</div>
						<div class="metric-label">Total Value</div>
						<div class="metric-note">Real-time</div>
					</div>
					<div class="metric">
						<div class="metric-value">{formatCurrency(totalInvested)}</div>
						<div class="metric-label">Invested</div>
						<div class="metric-note">Principal</div>
					</div>
					<div class="metric">
						<div class="metric-value" class:positive={unrealizedGains >= 0} class:negative={unrealizedGains < 0}>
							{formatCurrency(unrealizedGains)}
						</div>
						<div class="metric-label">Unrealized P&L</div>
						<div class="metric-note" class:positive={unrealizedGains >= 0} class:negative={unrealizedGains < 0}>
							{formatPercent(portfolioMetrics.totalReturn)}
						</div>
					</div>
					<div class="metric">
						<div class="metric-value payout">{formatCurrency(portfolioMetrics.totalPayoutEarned)}</div>
						<div class="metric-label">Payout Earned</div>
						<div class="metric-note positive">{formatPercent(portfolioMetrics.payoutReturn)}</div>
					</div>
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
			<div class="quick-stats">
				<h3>Quick Stats</h3>
				
				<div class="stats-list">
					<div class="stat-row">
						<span>Average Payout</span>
						<span class="payout">{portfolioMetrics.averagePayout.toFixed(1)}%</span>
					</div>
					<div class="stat-row">
						<span>Total Tokens</span>
						<span>{portfolioMetrics.totalTokens.toLocaleString()}</span>
					</div>
					<div class="stat-row">
						<span>Active Assets</span>
						<span>{holdings.length}</span>
					</div>
					<div class="stat-row">
						<span>Monthly Income</span>
						<span class="payout">{formatCurrency(portfolioMetrics.totalPayoutEarned / 6)}</span>
					</div>
				</div>

				<div class="performance-summary">
					{#if portfolioMetrics.bestPerformer && portfolioMetrics.worstPerformer}
						<div class="performer">
							<div class="performer-header">
								<span>Best Performer</span>
								<span class="positive">{formatPercent(portfolioMetrics.bestPerformer.unrealizedGainPercent)}</span>
							</div>
							<div class="performer-name">{portfolioMetrics.bestPerformer.name}</div>
						</div>
						<div class="performer">
							<div class="performer-header">
								<span>Worst Performer</span>
								<span class="negative">{formatPercent(portfolioMetrics.worstPerformer.unrealizedGainPercent)}</span>
							</div>
							<div class="performer-name">{portfolioMetrics.worstPerformer.name}</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Portfolio Tabs -->
	<div class="tabs-container">
		<div class="tabs-nav">
			<button 
				class="tab-btn"
				class:active={activeTab === 'overview'}
				on:click={() => activeTab = 'overview'}
			>
				Holdings
			</button>
			<button 
				class="tab-btn"
				class:active={activeTab === 'performance'}
				on:click={() => activeTab = 'performance'}
			>
				Performance
			</button>
			<button 
				class="tab-btn"
				class:active={activeTab === 'allocation'}
				on:click={() => activeTab = 'allocation'}
			>
				Allocation
			</button>
			<button 
				class="tab-btn"
				class:active={activeTab === 'analytics'}
				on:click={() => activeTab = 'analytics'}
			>
				Analytics
			</button>
		</div>

		<div class="tab-content">
			{#if activeTab === 'overview'}
				<div class="holdings-content">
					<div class="holdings-header">
						<h3>My Holdings</h3>
						<div class="view-controls">
							<button class="view-btn active">Value</button>
							<button class="view-btn">Payout</button>
							<button class="view-btn">Performance</button>
						</div>
					</div>

					<div class="holdings-list">
						{#if loading}
							<div class="loading-message">Loading portfolio holdings...</div>
						{:else}
							{#each holdings as holding}
								<div class="holding-card">
								<div class="holding-main">
									<div class="holding-info">
										<div class="holding-icon">{holding.icon}</div>
										<div class="holding-details">
											<h4>{holding.name}</h4>
											<div class="holding-location">{holding.location}</div>
											<div class="holding-badges">
												<span class="status-badge" class:producing={holding.status === 'producing'}>{holding.status.toUpperCase()}</span>
											</div>
										</div>
									</div>

									<div class="holding-tokens">
										<div class="tokens-value">{holding.tokensOwned.toLocaleString()}</div>
										<div class="tokens-label">Tokens</div>
										<div class="allocation-info">{holding.allocation}% allocation</div>
									</div>

									<div class="holding-value">
										<div class="value-amount">{formatCurrency(holding.currentValue)}</div>
										<div class="value-label">Current Value</div>
										<div class="cost-basis">Cost: {formatCurrency(holding.investmentAmount)}</div>
									</div>

									<div class="holding-pnl">
										<div class="pnl-amount" class:positive={holding.unrealizedGain >= 0} class:negative={holding.unrealizedGain < 0}>
											{formatCurrency(holding.unrealizedGain)}
										</div>
										<div class="pnl-label">Unrealized P&L</div>
										<div class="pnl-percent" class:positive={holding.unrealizedGain >= 0} class:negative={holding.unrealizedGain < 0}>
											{formatPercent(holding.unrealizedGainPercent)}
										</div>
									</div>

									<div class="holding-payout">
										<div class="payout-value">{holding.currentPayout}%</div>
										<div class="payout-label">Payout</div>
									</div>

									<div class="holding-actions">
										<button class="manage-btn">Manage</button>
									</div>
								</div>

								<div class="holding-footer">
									<div class="footer-item">
										<span>Total Earned:</span>
										<span class="payout">{formatCurrency(holding.totalEarned)}</span>
									</div>
									<div class="footer-item">
										<span>Last Payout:</span>
										<span>{holding.lastPayout}</span>
									</div>
									<div class="footer-item">
										<span>Status:</span>
										<span class="positive">Active</span>
									</div>
								</div>
								</div>
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
								<div class="perf-value positive">{formatPercent(portfolioMetrics.totalReturn)}</div>
								<div class="perf-label">Total Return</div>
								<div class="perf-note">Since inception</div>
							</div>
							<div class="perf-stat">
								<div class="perf-value positive">{formatPercent(portfolioMetrics.payoutReturn)}</div>
								<div class="perf-label">Payout Return</div>
								<div class="perf-note">Income only</div>
							</div>
							<div class="perf-stat">
								<div class="perf-value">16.3%</div>
								<div class="perf-label">Annualized IRR</div>
								<div class="perf-note">12-month projection</div>
							</div>
						</div>
					</div>

					<div class="monthly-performance">
						<h4>Monthly Performance</h4>
						<div class="monthly-grid">
							{#each performanceData as month}
								<div class="monthly-item">
									<div class="month-label">{month.month.split(' ')[0]}</div>
									<div class="month-value">{formatCurrency(month.value)}</div>
									<div class="month-payout">{formatCurrency(month.payout)} payout</div>
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
								{#each holdings as holding}
									<div class="allocation-item">
										<div class="allocation-asset">
											<div class="asset-icon">{holding.icon}</div>
											<div class="asset-info">
												<div class="asset-name">{holding.name}</div>
												<div class="asset-location">{holding.location}</div>
											</div>
										</div>
										<div class="allocation-stats">
											<div class="allocation-percent">{holding.allocation}%</div>
											<div class="allocation-value">{formatCurrency(holding.currentValue)}</div>
										</div>
									</div>
								{/each}
							</div>

							<div class="diversification-tip">
								<div class="tip-icon">⚠️</div>
								<div class="tip-content">
									<div class="tip-title">Diversification Tip</div>
									<div class="tip-text">
										Consider diversifying: 49.6% allocation to single asset (Europa Wressle) may impact portfolio balance.
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			{:else if activeTab === 'analytics'}
				<div class="analytics-content">
					<div class="analytics-grid">
						<div class="performance-metrics">
							<h4>Performance Metrics</h4>
							<div class="metrics-list">
								<div class="metric-row">
									<span>Portfolio Beta</span>
									<span>0.87</span>
								</div>
								<div class="metric-row">
									<span>Volatility (30d)</span>
									<span>3.2%</span>
								</div>
								<div class="metric-row">
									<span>Sharpe Ratio</span>
									<span class="positive">2.14</span>
								</div>
								<div class="metric-row">
									<span>Max Drawdown</span>
									<span class="negative">-2.1%</span>
								</div>
								<div class="metric-row">
									<span>Correlation to Oil</span>
									<span>0.72</span>
								</div>
							</div>
						</div>

						<div class="payout-analytics">
							<h4>Payout Analytics</h4>
							<div class="metrics-list">
								<div class="metric-row">
									<span>Weighted Avg Payout</span>
									<span class="positive">{portfolioMetrics.averagePayout.toFixed(1)}%</span>
								</div>
								<div class="metric-row">
									<span>Monthly Income</span>
									<span class="positive">{formatCurrency(portfolioMetrics.totalPayoutEarned / 6)}</span>
								</div>
								<div class="metric-row">
									<span>Payout Consistency</span>
									<span class="positive">94.2%</span>
								</div>
								<div class="metric-row">
									<span>Payout Frequency</span>
									<span>Monthly</span>
								</div>
								<div class="metric-row">
									<span>Reinvestment Rate</span>
									<span>0%</span>
								</div>
							</div>
						</div>
					</div>

					<div class="scenario-analysis">
						<h4>Scenario Analysis</h4>
						<div class="scenario-table">
							<div class="table-header">
								<div class="table-cell">Oil Price Scenario</div>
								<div class="table-cell">Portfolio Value</div>
								<div class="table-cell">Annual Payout</div>
								<div class="table-cell">Total Return</div>
							</div>
							<div class="table-row">
								<div class="table-cell">Bear Case ($60/bbl)</div>
								<div class="table-cell negative">{formatCurrency(39500)}</div>
								<div class="table-cell negative">9.2%</div>
								<div class="table-cell negative">-6.0%</div>
							</div>
							<div class="table-row current">
								<div class="table-cell">Current ($78/bbl)</div>
								<div class="table-cell">{formatCurrency(totalPortfolioValue)}</div>
								<div class="table-cell positive">{portfolioMetrics.averagePayout.toFixed(1)}%</div>
								<div class="table-cell positive">{formatPercent(portfolioMetrics.totalReturn)}</div>
							</div>
							<div class="table-row">
								<div class="table-cell">Bull Case ($95/bbl)</div>
								<div class="table-cell positive">{formatCurrency(58200)}</div>
								<div class="table-cell positive">17.8%</div>
								<div class="table-cell positive">+38.6%</div>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>

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

	/* Portfolio Overview */
	.portfolio-overview {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		padding: 3rem;
		margin-bottom: 2rem;
	}

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
		grid-template-columns: repeat(4, 1fr);
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.metric {
		text-align: center;
		padding-right: 2rem;
		border-right: 1px solid var(--color-light-gray);
	}

	.metric:last-child {
		border-right: none;
		padding-right: 0;
	}

	.metric-value {
		font-size: 1.75rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
	}

	.metric-value.positive {
		color: var(--color-primary);
	}

	.metric-value.negative {
		color: #dc2626;
	}

	.metric-value.payout {
		color: var(--color-primary);
	}

	.metric-label {
		font-size: 0.7rem;
		font-weight: var(--font-weight-bold);
		color: var(--color-black);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.25rem;
	}

	.metric-note {
		font-size: 0.65rem;
		color: var(--color-secondary);
		font-weight: var(--font-weight-medium);
	}

	.metric-note.positive {
		color: var(--color-primary);
	}

	.metric-note.negative {
		color: #dc2626;
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
	.quick-stats {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		padding: 2rem;
	}

	.quick-stats h3 {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 1.5rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

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

	.performance-summary {
		border-top: 1px solid var(--color-light-gray);
		padding-top: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.performer-header {
		display: flex;
		justify-content: space-between;
		font-size: 0.85rem;
		margin-bottom: 0.25rem;
	}

	.performer-header span:first-child {
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
		opacity: 0.8;
	}

	.performer-header .positive {
		color: var(--color-primary);
		font-weight: var(--font-weight-extrabold);
	}

	.performer-header .negative {
		color: #dc2626;
		font-weight: var(--font-weight-extrabold);
	}

	.performer-name {
		font-size: 0.75rem;
		color: var(--color-black);
		opacity: 0.6;
	}

	/* Tabs */
	.tabs-container {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		margin-bottom: 2rem;
	}

	.tabs-nav {
		display: flex;
		border-bottom: 1px solid var(--color-light-gray);
	}

	.tab-btn {
		padding: 1rem 1.5rem;
		background: none;
		border: none;
		font-family: var(--font-family);
		font-weight: var(--font-weight-extrabold);
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-black);
		cursor: pointer;
		transition: all 0.2s ease;
		opacity: 0.6;
	}

	.tab-btn:hover {
		opacity: 1;
		background: var(--color-light-gray);
	}

	.tab-btn.active {
		background: var(--color-black);
		color: var(--color-white);
		opacity: 1;
	}

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

	.view-controls {
		display: flex;
		gap: 0.5rem;
	}

	.view-btn {
		padding: 0.5rem 1rem;
		border: 1px solid var(--color-black);
		background: var(--color-white);
		color: var(--color-black);
		font-family: var(--font-family);
		font-weight: var(--font-weight-bold);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.view-btn:hover,
	.view-btn.active {
		background: var(--color-black);
		color: var(--color-white);
	}

	.holdings-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.holding-card {
		border: 1px solid var(--color-light-gray);
		padding: 2rem;
		transition: box-shadow 0.2s ease;
	}

	.holding-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.holding-main {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr 1fr 1fr 0.5fr;
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

	.status-badge {
		background: var(--color-light-gray);
		color: var(--color-secondary);
		padding: 0.125rem 0.5rem;
		font-size: 0.65rem;
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-radius: 0.25rem;
	}

	.status-badge.producing {
		background: var(--color-light-gray);
		color: var(--color-primary);
	}

	.holding-tokens,
	.holding-value,
	.holding-pnl,
	.holding-payout {
		text-align: center;
	}

	.tokens-value,
	.value-amount,
	.pnl-amount,
	.payout-value {
		font-size: 1.1rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.25rem;
	}

	.pnl-amount.positive {
		color: var(--color-primary);
	}

	.pnl-amount.negative {
		color: #dc2626;
	}

	.payout-value {
		color: var(--color-primary);
	}

	.tokens-label,
	.value-label,
	.pnl-label,
	.payout-label {
		font-size: 0.65rem;
		font-weight: var(--font-weight-bold);
		color: var(--color-black);
		opacity: 0.7;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.25rem;
	}

	.allocation-info,
	.cost-basis,
	.pnl-percent {
		font-size: 0.65rem;
		color: var(--color-secondary);
		font-weight: var(--font-weight-medium);
	}

	.pnl-percent.positive {
		color: var(--color-primary);
	}

	.pnl-percent.negative {
		color: #dc2626;
	}

	.manage-btn {
		background: var(--color-black);
		color: var(--color-white);
		border: none;
		padding: 0.5rem 1rem;
		font-family: var(--font-family);
		font-weight: var(--font-weight-bold);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		transition: background-color 0.2s ease;
		width: 100%;
	}

	.manage-btn:hover {
		background: var(--color-secondary);
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

	.month-payout {
		font-size: 0.75rem;
		color: var(--color-primary);
		font-weight: var(--font-weight-medium);
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

	/* Analytics Tab */
	.analytics-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.performance-metrics,
	.payout-analytics {
		background: var(--color-light-gray);
		border: 1px solid var(--color-light-gray);
		padding: 2rem;
	}

	.performance-metrics h4,
	.payout-analytics h4 {
		font-size: 1.1rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 1.5rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.metrics-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.metric-row {
		display: flex;
		justify-content: space-between;
		font-size: 0.85rem;
	}

	.metric-row span:first-child {
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
		opacity: 0.8;
	}

	.metric-row span:last-child {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
	}

	.metric-row .positive {
		color: var(--color-primary);
	}

	.metric-row .negative {
		color: #dc2626;
	}

	.scenario-analysis {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		padding: 2rem;
	}

	.scenario-analysis h4 {
		font-size: 1.1rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 1.5rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.scenario-table {
		display: flex;
		flex-direction: column;
	}

	.table-header {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr 1fr;
		gap: 1rem;
		padding: 1rem;
		border-bottom: 1px solid var(--color-light-gray);
	}

	.table-row {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr 1fr;
		gap: 1rem;
		padding: 1rem;
		border-bottom: 1px solid var(--color-light-gray);
	}

	.table-row:last-child {
		border-bottom: none;
	}

	.table-row.current {
		background: var(--color-light-gray);
	}

	.table-cell {
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
		font-size: 0.85rem;
	}

	.table-header .table-cell {
		font-weight: var(--font-weight-extrabold);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-size: 0.75rem;
	}

	.table-cell.positive {
		color: var(--color-primary);
		font-weight: var(--font-weight-extrabold);
	}

	.table-cell.negative {
		color: #dc2626;
		font-weight: var(--font-weight-extrabold);
	}

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

		.metric {
			border-right: none;
			border-bottom: 1px solid var(--color-light-gray);
			padding-right: 0;
			padding-bottom: 1rem;
		}

		.metric:last-child {
			border-bottom: none;
			padding-bottom: 0;
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
		.allocation-grid,
		.analytics-grid {
			grid-template-columns: 1fr;
		}

		.monthly-grid {
			grid-template-columns: repeat(3, 1fr);
		}

		.quick-actions {
			grid-template-columns: 1fr;
		}

		.table-header,
		.table-row {
			grid-template-columns: 1fr;
			gap: 0.5rem;
		}

		.table-cell {
			text-align: center;
			padding: 0.5rem 0;
		}
	}
</style>