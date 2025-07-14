<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import dataStoreService from '$lib/services/DataStoreService';
	import type { Asset, Token } from '$lib/types/dataStore';
	import { walletStore, walletActions } from '$lib/stores/wallet';
	import WalletModal from '$lib/components/WalletModal.svelte';
	import { typography } from '$lib/styles/typography';
	import { layouts } from '$lib/styles/layouts';
	import { buttons } from '$lib/styles/buttons';
	import { 
		SectionTitle, 
		MetricDisplay, 
		GridContainer, 
		TabButton,
		PrimaryButton,
		SecondaryButton
	} from '$lib/components/ui';
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
	
	// Mobile specific classes that aren't in utilities
	const mobileMetricClasses = 'text-center p-6 bg-white border border-light-gray';
	const mobileHoldingsHeaderClasses = 'flex justify-between items-center mb-8';
	const holdingsHeaderTitleClasses = typography.cardTitle;
	const mobileViewControlsClasses = 'flex gap-2';
	const viewBtnClasses = `${buttons.base} px-4 py-2 bg-white border border-light-gray text-xs hover:bg-light-gray`;
	const viewBtnActiveClasses = 'bg-primary text-white border-primary';
	const smallMobileHoldingCardClasses = layouts.cardHover;
	const mobileHoldingMainClasses = 'grid grid-cols-1 md:grid-cols-6 gap-4 mb-6';
	const holdingInfoClasses = 'flex items-start gap-4 md:col-span-2';
	const holdingIconClasses = 'text-3xl';
	const holdingDetailsH4Classes = typography.metricValueSmall;
	const holdingLocationClasses = 'text-black opacity-70 text-sm';
	const holdingBadgesClasses = 'flex gap-2 mt-2';
	const statusBadgeClasses = 'text-xs font-bold uppercase tracking-wider px-2 py-1 bg-white border border-light-gray';
	const statusBadgeProducingClasses = 'bg-primary/10 text-primary';
	const holdingTokensClasses = 'text-center';
	const tokensValueClasses = typography.metricValue;
	const tokensLabelClasses = typography.labelMuted;
	const allocationInfoClasses = typography.meta;
	const holdingValueClasses = 'text-center';
	const valueAmountClasses = typography.metricValue;
	const valueLabelClasses = typography.labelMuted;
	const costBasisClasses = typography.meta;
	const holdingPnlClasses = 'text-center';
	const pnlAmountClasses = typography.metricValue;
	const pnlAmountPositiveClasses = 'text-primary';
	const pnlAmountNegativeClasses = 'text-red-600';
	const pnlLabelClasses = typography.labelMuted;
	const pnlPercentClasses = typography.meta;
	const pnlPercentPositiveClasses = 'text-primary';
	const pnlPercentNegativeClasses = 'text-red-600';
	const holdingPayoutClasses = 'text-center';
	const payoutValueClasses = `${typography.metricValue} text-primary`;
	const payoutLabelClasses = typography.labelMuted;
	const holdingActionsClasses = 'flex items-center justify-center';
	const manageBtnClasses = `${buttons.base} ${buttons.secondarySmall}`;
	const mobileHoldingFooterClasses = 'border-t border-light-gray pt-4 flex justify-around text-sm';
	const footerItemClasses = 'text-center';
	const holdingFooterSpanClasses = 'text-black opacity-70 font-semibold';
	const holdingFooterValueClasses = 'font-extrabold text-black';
	const holdingFooterValuePrimaryClasses = 'text-primary font-extrabold';
	const mobilePortfolioMetricsClasses = layouts.gridMetrics;
	const mobileTabsContainerClasses = layouts.pageSectionAlt;
	const mobileTabContentClasses = '';
	const loadingMessageClasses = 'text-center py-8 text-black opacity-70';
	const mobileQuickActionsClasses = `${layouts.pageSection} ${layouts.gridThree}`;
	const mobileActionCardClasses = layouts.card + ' text-center';
	const actionIconClasses = 'text-4xl mb-4';
	const actionCardH4Classes = typography.cardTitle;
	const actionCardPClasses = `${typography.bodyTextSmall} mb-6 opacity-70`;
	const actionBtnClasses = `${buttons.base} inline-block`;
	const actionBtnPrimaryClasses = buttons.primary;
	const actionBtnClaimClasses = buttons.claim;
	const actionBtnSecondaryClasses = buttons.secondary;
</script>

<svelte:head>
	<title>Portfolio - Albion</title>
	<meta name="description" content="Track your oil & gas investment portfolio performance" />
</svelte:head>

{#if !$walletStore.isConnected}
	<main class={layouts.pageContainer}>
		<div class="{layouts.flexCenter} min-h-[60vh] text-center p-8">
			<div>
				<SectionTitle level="h1" size="section" center>Wallet Connection Required</SectionTitle>
				<p class="text-lg text-black mb-8 opacity-80">Please connect your wallet to view your portfolio.</p>
				<PrimaryButton on:click={() => showWalletModal = true}>
					Connect Wallet
				</PrimaryButton>
			</div>
		</div>
	</main>
{:else}
<main class={layouts.pageContainer}>
	<!-- Portfolio Overview Header -->
	<div class={layouts.pageSection}>
		<GridContainer columns={2} gap="large" className="md:grid-cols-[2fr_1fr] mb-12">
			<div>
				<SectionTitle level="h1" size="page">Portfolio Overview</SectionTitle>
				
				<GridContainer columns={3} className="md:grid-cols-4">
					<div class={mobileMetricClasses}>
						<MetricDisplay 
							value={formatCurrency(totalPortfolioValue)} 
							label="Total Value" 
							note="Real-time" 
						/>
					</div>
					<div class={mobileMetricClasses}>
						<MetricDisplay 
							value={formatCurrency(totalInvested)} 
							label="Invested" 
							note="Principal" 
						/>
					</div>
					<div class={mobileMetricClasses}>
						<MetricDisplay 
							value={formatCurrency(unrealizedGains)} 
							label="Unrealized P&L" 
							note={formatPercent(portfolioMetrics.totalReturn)}
							valueColor={unrealizedGains >= 0 ? 'positive' : 'negative'}
						/>
					</div>
					<div class={mobileMetricClasses}>
						<MetricDisplay 
							value={formatCurrency(portfolioMetrics.totalPayoutEarned)} 
							label="Payout Earned" 
							note={formatPercent(portfolioMetrics.payoutReturn)}
							valueColor="primary"
						/>
					</div>
				</GridContainer>

				<div class="text-center mt-6">
					<div class={typography.meta}>
						Last updated: {getCurrentTime()}
					</div>
					<div class={typography.meta}>
						Portfolio inception: Jul 2024 (6 months)
					</div>
				</div>
			</div>

			<!-- Quick Stats Panel -->
			<div class={layouts.card}>
				<SectionTitle level="h3" size="card">Quick Stats</SectionTitle>
				
				<div class="flex flex-col gap-4 mb-8">
					<div class={layouts.flexBetween}>
						<span class="text-black opacity-70">Average Payout</span>
						<span class={typography.success}>{portfolioMetrics.averagePayout.toFixed(1)}%</span>
					</div>
					<div class={layouts.flexBetween}>
						<span class="text-black opacity-70">Total Tokens</span>
						<span class="font-semibold text-black">{portfolioMetrics.totalTokens.toLocaleString()}</span>
					</div>
					<div class={layouts.flexBetween}>
						<span class="text-black opacity-70">Active Assets</span>
						<span class="font-semibold text-black">{holdings.length}</span>
					</div>
					<div class={layouts.flexBetween}>
						<span class="text-black opacity-70">Monthly Income</span>
						<span class={typography.success}>{formatCurrency(portfolioMetrics.totalPayoutEarned / 6)}</span>
					</div>
				</div>

				<div class="border-t border-light-gray pt-6">
					{#if portfolioMetrics.bestPerformer && portfolioMetrics.worstPerformer}
						<div class="mb-4 last:mb-0">
							<div class={layouts.flexBetween + ' mb-1'}>
								<span>Best Performer</span>
								<span class={typography.metricValuePrimary}>{formatPercent(portfolioMetrics.bestPerformer.unrealizedGainPercent)}</span>
							</div>
							<div class={typography.labelMuted}>{portfolioMetrics.bestPerformer.name}</div>
						</div>
						<div class="mb-4 last:mb-0">
							<div class={layouts.flexBetween + ' mb-1'}>
								<span>Worst Performer</span>
								<span class={typography.error}>{formatPercent(portfolioMetrics.worstPerformer.unrealizedGainPercent)}</span>
							</div>
							<div class={typography.labelMuted}>{portfolioMetrics.worstPerformer.name}</div>
						</div>
					{/if}
				</div>
			</div>
		</GridContainer>
	</div>

	<!-- Portfolio Tabs -->
	<div class={layouts.pageSectionAlt}>
		<div class="flex border-b border-light-gray mb-8">
			<TabButton 
				active={activeTab === 'overview'}
				on:click={() => activeTab = 'overview'}
			>
				Holdings
			</TabButton>
			<TabButton 
				active={activeTab === 'performance'}
				on:click={() => activeTab = 'performance'}
			>
				Performance
			</TabButton>
			<TabButton 
				active={activeTab === 'allocation'}
				on:click={() => activeTab = 'allocation'}
			>
				Allocation
			</TabButton>
			<TabButton 
				active={activeTab === 'analytics'}
				on:click={() => activeTab = 'analytics'}
			>
				Analytics
			</TabButton>
		</div>

		<div>
			{#if activeTab === 'overview'}
				<div>
					<div class={mobileHoldingsHeaderClasses}>
						<SectionTitle level="h3" size="card">My Holdings</SectionTitle>
						<div class={mobileViewControlsClasses}>
							<button class="{viewBtnClasses} {viewBtnActiveClasses}">Value</button>
							<button class={viewBtnClasses}>Payout</button>
							<button class={viewBtnClasses}>Performance</button>
						</div>
					</div>

					<div class="flex flex-col gap-6">
						{#if loading}
							<div class={loadingMessageClasses}>Loading portfolio holdings...</div>
						{:else}
							{#each holdings as holding}
								<div class={layouts.cardHover}>
								<div class={mobileHoldingMainClasses}>
									<div class={holdingInfoClasses}>
										<div class={holdingIconClasses}>{holding.icon}</div>
										<div>
											<h4 class={holdingDetailsH4Classes}>{holding.name}</h4>
											<div class={holdingLocationClasses}>{holding.location}</div>
											<div class={holdingBadgesClasses}>
												<span class="{statusBadgeClasses} {holding.status === 'producing' ? statusBadgeProducingClasses : ''}">{holding.status.toUpperCase()}</span>
											</div>
										</div>
									</div>

									<div class={holdingTokensClasses}>
										<div class={tokensValueClasses}>{holding.tokensOwned.toLocaleString()}</div>
										<div class={tokensLabelClasses}>Tokens</div>
										<div class={allocationInfoClasses}>{holding.allocation}% allocation</div>
									</div>

									<div class={holdingValueClasses}>
										<div class={valueAmountClasses}>{formatCurrency(holding.currentValue)}</div>
										<div class={valueLabelClasses}>Current Value</div>
										<div class={costBasisClasses}>Cost: {formatCurrency(holding.investmentAmount)}</div>
									</div>

									<div class={holdingPnlClasses}>
										<div class="{pnlAmountClasses} {holding.unrealizedGain >= 0 ? pnlAmountPositiveClasses : pnlAmountNegativeClasses}">
											{formatCurrency(holding.unrealizedGain)}
										</div>
										<div class={pnlLabelClasses}>Unrealized P&L</div>
										<div class="{pnlPercentClasses} {holding.unrealizedGain >= 0 ? pnlPercentPositiveClasses : pnlPercentNegativeClasses}">
											{formatPercent(holding.unrealizedGainPercent)}
										</div>
									</div>

									<div class={holdingPayoutClasses}>
										<div class={payoutValueClasses}>{holding.currentPayout}%</div>
										<div class={payoutLabelClasses}>Payout</div>
									</div>

									<div class={holdingActionsClasses}>
										<button class={manageBtnClasses}>Manage</button>
									</div>
								</div>

								<div class={mobileHoldingFooterClasses}>
									<div class={footerItemClasses}>
										<span class={holdingFooterSpanClasses}>Total Earned:</span>
										<span class={holdingFooterValuePrimaryClasses}>{formatCurrency(holding.totalEarned)}</span>
									</div>
									<div class={footerItemClasses}>
										<span class={holdingFooterSpanClasses}>Last Payout:</span>
										<span class={holdingFooterValueClasses}>{holding.lastPayout}</span>
									</div>
									<div class={footerItemClasses}>
										<span class={holdingFooterSpanClasses}>Status:</span>
										<span class={holdingFooterValuePrimaryClasses}>Active</span>
									</div>
								</div>
								</div>
							{/each}
						{/if}
					</div>
				</div>
			{:else if activeTab === 'performance'}
				<div class="bg-white">
					<div class="{layouts.flexBetween} mb-8 p-8 pb-0">
						<SectionTitle level="h3" size="card">Performance Analytics</SectionTitle>
						<div class="flex gap-2">
							{#each ['1M', '3M', '6M', 'YTD'] as period}
								<button 
									class="{buttons.base} {buttons.control} text-xs {timeframe === period ? buttons.controlActive : ''}"
										on:click={() => timeframe = period}
								>
									{period}
								</button>
							{/each}
						</div>
					</div>

					<div class="grid grid-cols-[2fr_1fr] gap-8 p-8">
						<div class="{layouts.card} bg-white border border-light-gray">
							<div class="h-80 {layouts.flexCenter} text-center">
								<div class="text-center">
									<div class="text-5xl mb-4">📈</div>
									<div class={typography.subsectionTitle}>Portfolio Value Chart</div>
									<div class={typography.meta}>Total value vs payout earnings over time</div>
								</div>
							</div>
						</div>

						<div class="flex flex-col gap-6">
							<div class={layouts.metricCard}>
								<MetricDisplay 
									value={formatPercent(portfolioMetrics.totalReturn)} 
									label="Total Return" 
									note="Since inception"
									valueColor="positive"
									size="small"
								/>
							</div>
							<div class={layouts.metricCard}>
								<MetricDisplay 
									value={formatPercent(portfolioMetrics.payoutReturn)} 
									label="Payout Return" 
									note="Income only"
									valueColor="positive"
									size="small"
								/>
							</div>
							<div class={layouts.metricCard}>
								<MetricDisplay 
									value={dataStoreService.getPlatformStats().averagePortfolioIRR?.formatted || '16.3%'} 
									label="Annualized IRR" 
									note="12-month projection"
									size="small"
								/>
							</div>
						</div>
					</div>

					<div class="p-8 pt-0">
						<SectionTitle level="h3" size="subsection">Monthly Performance</SectionTitle>
						<div class="grid grid-cols-6 gap-4">
							{#each performanceData as month}
								<div class={layouts.metricCompact}>
									<div class={typography.label}>{month.month.split(' ')[0]}</div>
									<div class="text-sm font-extrabold text-black mb-1">{formatCurrency(month.value)}</div>
									<div class="text-xs text-primary font-semibold">{formatCurrency(month.payout)} payout</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{:else if activeTab === 'allocation'}
				<div class="bg-white">
					<GridContainer columns={2} className="gap-8 p-8">
						<div class={layouts.card}>
							<SectionTitle level="h3" size="card">Asset Allocation</SectionTitle>
							<div class="h-80 {layouts.flexCenter} text-center">
								<div class="text-center">
									<div class="text-5xl mb-4">🥧</div>
									<div class={typography.subsectionTitle}>Portfolio Pie Chart</div>
									<div class={typography.meta}>Asset allocation by value</div>
								</div>
							</div>
						</div>

						<div class={layouts.card}>
							<SectionTitle level="h3" size="card">Allocation Breakdown</SectionTitle>
							<div class="flex flex-col gap-4 mb-8">
								{#each holdings as holding}
									<div class="{layouts.flexBetween} p-4 bg-white border border-light-gray">
										<div class="flex items-center gap-3">
											<div class="text-xl">{holding.icon}</div>
											<div class="flex-1">
												<div class="font-extrabold text-black text-sm mb-1">{holding.name}</div>
												<div class={typography.meta}>{holding.location}</div>
											</div>
										</div>
										<div class="text-right">
											<div class="{typography.metricValueSmall} text-primary mb-1">{holding.allocation}%</div>
											<div class={typography.meta}>{formatCurrency(holding.currentValue)}</div>
										</div>
									</div>
								{/each}
							</div>

							<div class="bg-yellow-50 border border-yellow-200 p-4 flex items-start gap-3">
								<div class="text-xl">⚠️</div>
								<div class="flex-1">
									<div class="font-extrabold text-black text-sm mb-1">Diversification Tip</div>
									<div class="text-xs text-black opacity-80 leading-relaxed">
										Consider diversifying: 49.6% allocation to single asset (Europa Wressle) may impact portfolio balance.
									</div>
								</div>
							</div>
						</div>
					</GridContainer>
				</div>
			{:else if activeTab === 'analytics'}
				<div class="bg-white">
					<GridContainer columns={2} className="gap-8 p-8">
						<div class={layouts.card}>
							<SectionTitle level="h3" size="subsection">Performance Metrics</SectionTitle>
							<div class="flex flex-col gap-3">
								<div class="{layouts.flexBetween} text-sm">
									<span class="text-black">Portfolio Beta</span>
									<span class="font-extrabold">0.87</span>
								</div>
								<div class="{layouts.flexBetween} text-sm">
									<span class="text-black">Volatility (30d)</span>
									<span class="font-extrabold">3.2%</span>
								</div>
								<div class="{layouts.flexBetween} text-sm">
									<span class="text-black">Sharpe Ratio</span>
									<span class="font-extrabold text-primary">2.14</span>
								</div>
								<div class="{layouts.flexBetween} text-sm">
									<span class="text-black">Max Drawdown</span>
									<span class="font-extrabold text-red-600">-2.1%</span>
								</div>
								<div class="{layouts.flexBetween} text-sm">
									<span class="text-black">Correlation to Oil</span>
									<span class="font-extrabold">0.72</span>
								</div>
							</div>
						</div>

						<div class={layouts.card}>
							<SectionTitle level="h3" size="subsection">Payout Analytics</SectionTitle>
							<div class="flex flex-col gap-3">
								<div class="{layouts.flexBetween} text-sm">
									<span class="text-black">Weighted Avg Payout</span>
									<span class="font-extrabold text-primary">{portfolioMetrics.averagePayout.toFixed(1)}%</span>
								</div>
								<div class="{layouts.flexBetween} text-sm">
									<span class="text-black">Monthly Income</span>
									<span class="font-extrabold text-primary">{formatCurrency(portfolioMetrics.totalPayoutEarned / 6)}</span>
								</div>
								<div class="{layouts.flexBetween} text-sm">
									<span class="text-black">Payout Consistency</span>
									<span class="font-extrabold text-primary">94.2%</span>
								</div>
								<div class="{layouts.flexBetween} text-sm">
									<span class="text-black">Payout Frequency</span>
									<span class="font-extrabold">Monthly</span>
								</div>
								<div class="{layouts.flexBetween} text-sm">
									<span class="text-black">Reinvestment Rate</span>
									<span class="font-extrabold">0%</span>
								</div>
							</div>
						</div>
					</GridContainer>

					<div class="mt-8 p-8 {layouts.card}">
						<SectionTitle level="h3" size="subsection">Scenario Analysis</SectionTitle>
						<div class="border border-light-gray">
							<div class="grid grid-cols-4 gap-0 bg-white border-b border-light-gray">
								<div class="p-4 text-sm border-r border-light-gray last:border-r-0 {typography.label}">Oil Price Scenario</div>
								<div class="p-4 text-sm border-r border-light-gray last:border-r-0 {typography.label}">Portfolio Value</div>
								<div class="p-4 text-sm border-r border-light-gray last:border-r-0 {typography.label}">Annual Payout</div>
								<div class="p-4 text-sm border-r border-light-gray last:border-r-0 {typography.label}">Total Return</div>
							</div>
							<div class="grid grid-cols-4 gap-0 border-b border-light-gray last:border-b-0">
								<div class="p-4 text-sm border-r border-light-gray last:border-r-0">Bear Case ($60/bbl)</div>
								<div class="p-4 text-sm border-r border-light-gray last:border-r-0 text-red-600 font-extrabold">{formatCurrency(39500)}</div>
								<div class="p-4 text-sm border-r border-light-gray last:border-r-0 text-red-600 font-extrabold">9.2%</div>
								<div class="p-4 text-sm border-r border-light-gray last:border-r-0 text-red-600 font-extrabold">-6.0%</div>
							</div>
							<div class="grid grid-cols-4 gap-0 border-b border-light-gray last:border-b-0 bg-primary/5">
								<div class="p-4 text-sm border-r border-light-gray last:border-r-0">Current ($78/bbl)</div>
								<div class="p-4 text-sm border-r border-light-gray last:border-r-0">{formatCurrency(totalPortfolioValue)}</div>
								<div class="p-4 text-sm border-r border-light-gray last:border-r-0 text-primary font-extrabold">{portfolioMetrics.averagePayout.toFixed(1)}%</div>
								<div class="p-4 text-sm border-r border-light-gray last:border-r-0 text-primary font-extrabold">{formatPercent(portfolioMetrics.totalReturn)}</div>
							</div>
							<div class="grid grid-cols-4 gap-0 border-b border-light-gray last:border-b-0">
								<div class="p-4 text-sm border-r border-light-gray last:border-r-0">Bull Case ($95/bbl)</div>
								<div class="p-4 text-sm border-r border-light-gray last:border-r-0 text-primary font-extrabold">{formatCurrency(58200)}</div>
								<div class="p-4 text-sm border-r border-light-gray last:border-r-0 text-primary font-extrabold">17.8%</div>
								<div class="p-4 text-sm border-r border-light-gray last:border-r-0 text-primary font-extrabold">+38.6%</div>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Quick Actions -->
	<div class={layouts.pageSection}>
		<GridContainer columns={3}>
			<div class="{layouts.card} text-center">
				<div class="text-4xl mb-4">➕</div>
				<SectionTitle level="h3" size="card" center>Add Investment</SectionTitle>
				<p class="{typography.bodyTextSmall} mb-6 opacity-70">Diversify with new assets</p>
				<a href="/assets" class="{buttons.base} {buttons.primary} inline-block">Browse Assets</a>
			</div>

			<div class="{layouts.card} text-center">
				<div class="text-4xl mb-4">💰</div>
				<SectionTitle level="h3" size="card" center>Claim Payouts</SectionTitle>
				<p class="{typography.bodyTextSmall} mb-6 opacity-70">{formatCurrency(unclaimedPayout)} available</p>
				<a href="/claims" class="{buttons.base} {buttons.claim} inline-block">Claim Now</a>
			</div>


			<div class="{layouts.card} text-center">
				<div class="text-4xl mb-4">📥</div>
				<SectionTitle level="h3" size="card" center>Export Data</SectionTitle>
				<p class="{typography.bodyTextSmall} mb-6 opacity-70">Tax & accounting reports</p>
				<button class="{buttons.base} {buttons.secondary}">Download</button>
			</div>
		</GridContainer>
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

