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
	
	// Tailwind class mappings for portfolio page
	$: walletRequiredClasses = 'p-0 max-w-6xl mx-auto';
	$: walletRequiredContentClasses = 'flex items-center justify-center min-h-[60vh] text-center p-8';
	$: walletRequiredTitleClasses = 'text-3xl font-extrabold text-black mb-4 uppercase tracking-wider';
	$: walletRequiredTextClasses = 'text-lg text-black mb-8 opacity-80';
	$: walletConnectBtnClasses = 'bg-primary text-white border-none px-8 py-4 font-figtree font-extrabold text-sm uppercase tracking-wider cursor-pointer transition-colors duration-200 hover:bg-secondary';
	$: smallMobileMainClasses = 'p-0 max-w-6xl mx-auto';
	$: mobilePortfolioOverviewClasses = 'py-12 px-8 bg-white';
	$: mobileOverviewGridClasses = 'grid md:grid-cols-[2fr_1fr] grid-cols-1 gap-12 mb-12';
	$: overviewMainClasses = '';
	$: portfolioTitleClasses = 'text-4xl font-extrabold mb-8 text-black uppercase tracking-tight';
	$: totalValueClasses = 'bg-light-gray border border-light-gray p-8 mb-8';
	$: totalValueLabelClasses = 'text-xs font-bold text-black uppercase tracking-wider mb-2';
	$: totalValueAmountClasses = 'text-5xl font-extrabold text-black mb-4';
	$: totalValueChangeClasses = 'text-lg font-semibold';
	$: totalValueChangePositiveClasses = 'text-primary';
	$: portfolioMetricsClasses = 'grid grid-cols-3 gap-6';
	$: metricClasses = 'text-center p-6 bg-white border border-light-gray';
	$: metricValueClasses = 'text-2xl font-extrabold text-black mb-2';
	$: metricLabelClasses = 'text-xs font-bold text-black uppercase tracking-wider mb-1';
	$: metricNoteClasses = 'text-xs font-medium';
	$: metricNotePositiveClasses = 'text-primary';
	$: portfolioInfoClasses = 'text-center mt-6';
	$: updateTimeClasses = 'text-xs text-black opacity-70 mb-2';
	$: mobileQuickStatsClasses = 'bg-white border border-light-gray p-8';
	$: quickStatsTitleClasses = 'text-xl font-extrabold text-black mb-6 uppercase tracking-wider';
	$: statsListClasses = 'flex flex-col gap-4 mb-8';
	$: statRowClasses = 'flex justify-between items-center';
	$: performanceSummaryClasses = 'border-t border-light-gray pt-6';
	$: performerClasses = 'mb-4 last:mb-0';
	$: performerHeaderClasses = 'flex justify-between items-center mb-1';
	$: performerNameClasses = 'text-xs text-black opacity-70 uppercase tracking-wider';
	$: portfolioHoldingsClasses = 'py-12 px-8 bg-light-gray';
	$: sectionTitleClasses = 'text-[1.75rem] font-extrabold text-black mb-8 uppercase tracking-wider';
	$: tabsNavClasses = 'flex border-b border-light-gray mb-8';
	$: tabBtnClasses = 'px-8 py-4 bg-transparent border-none font-figtree font-semibold text-sm uppercase tracking-wider cursor-pointer transition-all duration-200 border-b-2 border-transparent hover:border-primary';
	$: tabBtnActiveClasses = 'border-primary text-primary';
	$: holdingsListClasses = 'flex flex-col gap-6';
	$: holdingCardClasses = 'bg-white border border-light-gray p-8 transition-all duration-200 hover:shadow-lg';
	$: holdingMainClasses = 'grid grid-cols-[auto_2fr_3fr] gap-8 items-center mb-6';
	$: holdingIconClasses = 'text-3xl';
	$: holdingInfoH3Classes = 'font-extrabold text-black mb-2 text-lg';
	$: holdingLocationClasses = 'text-black opacity-70 text-sm';
	$: holdingMetricsClasses = 'grid grid-cols-4 gap-6 text-center';
	$: holdingMetricValueClasses = 'text-lg font-extrabold text-black mb-1';
	$: holdingMetricValuePositiveClasses = 'text-primary';
	$: holdingMetricValueNegativeClasses = 'text-red-600';
	$: holdingMetricLabelClasses = 'text-xs font-bold text-black opacity-70 uppercase tracking-wider';
	$: holdingFooterClasses = 'border-t border-light-gray pt-4';
	$: footerInfoClasses = 'text-sm text-black opacity-70';
	
	// Performance tab classes
	$: performanceContentClasses = 'bg-white';
	$: performanceHeaderClasses = 'flex justify-between items-center mb-8 p-8 pb-0';
	$: performanceHeaderH3Classes = 'text-xl font-extrabold text-black uppercase tracking-wider';
	$: timeframeControlsClasses = 'flex gap-2';
	$: timeframeBtnClasses = 'px-4 py-2 bg-white border border-light-gray font-figtree font-semibold text-xs uppercase tracking-wider cursor-pointer transition-all duration-200 hover:bg-light-gray';
	$: timeframeBtnActiveClasses = 'bg-primary text-white border-primary';
	$: performanceGridClasses = 'grid grid-cols-[2fr_1fr] gap-8 p-8';
	$: chartSectionClasses = 'bg-light-gray border border-light-gray p-8';
	$: chartPlaceholderClasses = 'h-80 flex items-center justify-center text-center';
	$: chartContentClasses = 'text-center';
	$: chartIconClasses = 'text-5xl mb-4';
	$: chartLabelClasses = 'text-lg font-extrabold text-black mb-2';
	$: chartNoteClasses = 'text-sm text-black opacity-70';
	$: performanceStatsClasses = 'flex flex-col gap-6';
	$: perfStatClasses = 'bg-white border border-light-gray p-6 text-center';
	$: perfValueClasses = 'text-xl font-extrabold mb-2';
	$: perfValuePositiveClasses = 'text-primary';
	$: perfLabelClasses = 'text-xs font-bold text-black uppercase tracking-wider mb-1';
	$: perfNoteClasses = 'text-xs text-black opacity-70';
	$: monthlyPerformanceClasses = 'p-8 pt-0';
	$: monthlyPerformanceH4Classes = 'text-lg font-extrabold text-black mb-6 uppercase tracking-wider';
	$: monthlyGridClasses = 'grid grid-cols-6 gap-4';
	$: monthlyItemClasses = 'bg-light-gray border border-light-gray p-4 text-center';
	$: monthLabelClasses = 'text-xs font-bold text-black uppercase tracking-wider mb-2';
	$: monthValueClasses = 'text-sm font-extrabold text-black mb-1';
	$: monthPayoutClasses = 'text-xs text-primary font-semibold';
	
	// Allocation tab classes
	$: allocationContentClasses = 'bg-white';
	$: allocationGridClasses = 'grid grid-cols-[1fr_1fr] gap-8 p-8';
	$: allocationChartClasses = 'bg-white border border-light-gray p-8';
	$: allocationChartH3Classes = 'text-xl font-extrabold text-black mb-6 uppercase tracking-wider';
	$: allocationBreakdownClasses = 'bg-white border border-light-gray p-8';
	$: allocationBreakdownH3Classes = 'text-xl font-extrabold text-black mb-6 uppercase tracking-wider';
	$: allocationListClasses = 'flex flex-col gap-4 mb-8';
	$: allocationItemClasses = 'flex justify-between items-center p-4 bg-light-gray border border-light-gray';
	$: allocationAssetClasses = 'flex items-center gap-3';
	$: assetIconClasses = 'text-xl';
	$: assetInfoClasses = 'flex-1';
	$: assetNameClasses = 'font-extrabold text-black text-sm mb-1';
	$: assetLocationClasses = 'text-xs text-black opacity-70';
	$: allocationStatsClasses = 'text-right';
	$: allocationPercentClasses = 'text-lg font-extrabold text-primary mb-1';
	$: allocationValueClasses = 'text-xs text-black opacity-70';
	$: diversificationTipClasses = 'bg-yellow-50 border border-yellow-200 p-4 flex items-start gap-3';
	$: tipIconClasses = 'text-xl';
	$: tipContentClasses = 'flex-1';
	$: tipTitleClasses = 'font-extrabold text-black text-sm mb-1';
	$: tipTextClasses = 'text-xs text-black opacity-80 leading-relaxed';
	
	// Analytics tab classes
	$: analyticsContentClasses = 'bg-white';
	$: analyticsGridClasses = 'grid grid-cols-2 gap-8 p-8';
	$: performanceMetricsClasses = 'bg-white border border-light-gray p-8';
	$: performanceMetricsH4Classes = 'text-lg font-extrabold text-black mb-6 uppercase tracking-wider';
	$: metricsListClasses = 'flex flex-col gap-3';
	$: metricRowClasses = 'flex justify-between items-center text-sm';
	$: metricRowSpanClasses = 'text-black';
	$: metricRowValueClasses = 'font-extrabold';
	$: metricRowValuePositiveClasses = 'text-primary';
	$: metricRowValueNegativeClasses = 'text-red-600';
	$: payoutAnalyticsClasses = 'bg-white border border-light-gray p-8';
	$: payoutAnalyticsH4Classes = 'text-lg font-extrabold text-black mb-6 uppercase tracking-wider';
	
	// Quick stats specific classes
	$: statLabelClasses = 'text-black opacity-70';
	$: statValueClasses = 'font-semibold text-black';
	$: statValuePrimaryClasses = 'text-primary font-semibold';
	$: bestPerformerValueClasses = 'text-primary font-extrabold';
	$: worstPerformerValueClasses = 'text-red-600 font-extrabold';
	
	// Holding footer classes
	$: holdingFooterSpanClasses = 'text-black opacity-70 font-semibold';
	$: holdingFooterValueClasses = 'font-extrabold text-black';
	$: holdingFooterValuePrimaryClasses = 'text-primary font-extrabold';
	
	// Scenario analysis classes
	$: scenarioAnalysisClasses = 'mt-8 p-8 bg-white border border-light-gray';
	$: scenarioAnalysisH4Classes = 'text-lg font-extrabold text-black mb-6 uppercase tracking-wider';
	$: scenarioTableClasses = 'border border-light-gray';
	$: tableHeaderClasses = 'grid grid-cols-4 gap-0 bg-light-gray border-b border-light-gray';
	$: tableCellClasses = 'p-4 text-sm border-r border-light-gray last:border-r-0';
	$: tableCellHeaderClasses = 'font-extrabold text-black text-xs uppercase tracking-wider';
	$: tableRowClasses = 'grid grid-cols-4 gap-0 border-b border-light-gray last:border-b-0';
	$: tableRowCurrentClasses = 'bg-primary/5';
	$: tableCellNegativeClasses = 'text-red-600 font-extrabold';
	$: tableCellPositiveClasses = 'text-primary font-extrabold';
</script>

<svelte:head>
	<title>Portfolio - Albion</title>
	<meta name="description" content="Track your oil & gas investment portfolio performance" />
</svelte:head>

{#if !$walletStore.isConnected && !showWalletModal}
	<main class={walletRequiredClasses}>
		<div class={walletRequiredContentClasses}>
			<h1 class={walletRequiredTitleClasses}>Wallet Connection Required</h1>
			<p class={walletRequiredTextClasses}>Please connect your wallet to view your portfolio.</p>
			<button class={walletConnectBtnClasses} on:click={() => showWalletModal = true}>
				Connect Wallet
			</button>
		</div>
	</main>
{:else if $walletStore.isConnected}
<main class={smallMobileMainClasses}>
	<!-- Portfolio Overview Header -->
	<div class={mobilePortfolioOverviewClasses}>
		<div class={mobileOverviewGridClasses}>
			<div class={overviewMainClasses}>
				<h1 class={portfolioTitleClasses}>Portfolio Overview</h1>
				
				<div class={mobilePortfolioMetricsClasses}>
					<div class={mobileMetricClasses}>
						<div class={metricValueClasses}>{formatCurrency(totalPortfolioValue)}</div>
						<div class={metricLabelClasses}>Total Value</div>
						<div class={metricNoteClasses}>Real-time</div>
					</div>
					<div class={mobileMetricClasses}>
						<div class={metricValueClasses}>{formatCurrency(totalInvested)}</div>
						<div class={metricLabelClasses}>Invested</div>
						<div class={metricNoteClasses}>Principal</div>
					</div>
					<div class={mobileMetricClasses}>
						<div class="{metricValueClasses} {unrealizedGains >= 0 ? metricValuePositiveClasses : metricValueNegativeClasses}">
							{formatCurrency(unrealizedGains)}
						</div>
						<div class={metricLabelClasses}>Unrealized P&L</div>
						<div class="{metricNoteClasses} {unrealizedGains >= 0 ? metricNotePositiveClasses : 'text-red-600'}">
							{formatPercent(portfolioMetrics.totalReturn)}
						</div>
					</div>
					<div class={mobileMetricClasses}>
						<div class="{metricValueClasses} {metricValuePositiveClasses}">{formatCurrency(portfolioMetrics.totalPayoutEarned)}</div>
						<div class={metricLabelClasses}>Payout Earned</div>
						<div class="{metricNoteClasses} {metricNotePositiveClasses}">{formatPercent(portfolioMetrics.payoutReturn)}</div>
					</div>
				</div>

				<div class={portfolioInfoClasses}>
					<div class={updateTimeClasses}>
						Last updated: {getCurrentTime()}
					</div>
					<div class={updateTimeClasses}>
						Portfolio inception: Jul 2024 (6 months)
					</div>
				</div>
			</div>

			<!-- Quick Stats Panel -->
			<div class={mobileQuickStatsClasses}>
				<h3 class={quickStatsTitleClasses}>Quick Stats</h3>
				
				<div class={statsListClasses}>
					<div class={statRowClasses}>
						<span class={statLabelClasses}>Average Payout</span>
						<span class={statValuePrimaryClasses}>{portfolioMetrics.averagePayout.toFixed(1)}%</span>
					</div>
					<div class={statRowClasses}>
						<span class={statLabelClasses}>Total Tokens</span>
						<span class={statValueClasses}>{portfolioMetrics.totalTokens.toLocaleString()}</span>
					</div>
					<div class={statRowClasses}>
						<span class={statLabelClasses}>Active Assets</span>
						<span class={statValueClasses}>{holdings.length}</span>
					</div>
					<div class={statRowClasses}>
						<span class={statLabelClasses}>Monthly Income</span>
						<span class={statValuePrimaryClasses}>{formatCurrency(portfolioMetrics.totalPayoutEarned / 6)}</span>
					</div>
				</div>

				<div class={performanceSummaryClasses}>
					{#if portfolioMetrics.bestPerformer && portfolioMetrics.worstPerformer}
						<div class={performerClasses}>
							<div class={performerHeaderClasses}>
								<span>Best Performer</span>
								<span class={bestPerformerValueClasses}>{formatPercent(portfolioMetrics.bestPerformer.unrealizedGainPercent)}</span>
							</div>
							<div class={performerNameClasses}>{portfolioMetrics.bestPerformer.name}</div>
						</div>
						<div class={performerClasses}>
							<div class={performerHeaderClasses}>
								<span>Worst Performer</span>
								<span class={worstPerformerValueClasses}>{formatPercent(portfolioMetrics.worstPerformer.unrealizedGainPercent)}</span>
							</div>
							<div class={performerNameClasses}>{portfolioMetrics.worstPerformer.name}</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Portfolio Tabs -->
	<div class={mobileTabsContainerClasses}>
		<div class={tabsNavClasses}>
			<button 
				class="{tabBtnClasses} {activeTab === 'overview' ? tabBtnActiveClasses : ''}"
				on:click={() => activeTab = 'overview'}
			>
				Holdings
			</button>
			<button 
				class="{tabBtnClasses} {activeTab === 'performance' ? tabBtnActiveClasses : ''}"
				on:click={() => activeTab = 'performance'}
			>
				Performance
			</button>
			<button 
				class="{tabBtnClasses} {activeTab === 'allocation' ? tabBtnActiveClasses : ''}"
				on:click={() => activeTab = 'allocation'}
			>
				Allocation
			</button>
			<button 
				class="{tabBtnClasses} {activeTab === 'analytics' ? tabBtnActiveClasses : ''}"
				on:click={() => activeTab = 'analytics'}
			>
				Analytics
			</button>
		</div>

		<div class={mobileTabContentClasses}>
			{#if activeTab === 'overview'}
				<div>
					<div class={mobileHoldingsHeaderClasses}>
						<h3 class={holdingsHeaderTitleClasses}>My Holdings</h3>
						<div class={mobileViewControlsClasses}>
							<button class="{viewBtnClasses} {viewBtnActiveClasses}">Value</button>
							<button class={viewBtnClasses}>Payout</button>
							<button class={viewBtnClasses}>Performance</button>
						</div>
					</div>

					<div class={holdingsListClasses}>
						{#if loading}
							<div class={loadingMessageClasses}>Loading portfolio holdings...</div>
						{:else}
							{#each holdings as holding}
								<div class={smallMobileHoldingCardClasses}>
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
				<div class={performanceContentClasses}>
					<div class={performanceHeaderClasses}>
						<h3 class={performanceHeaderH3Classes}>Performance Analytics</h3>
						<div class={timeframeControlsClasses}>
							{#each ['1M', '3M', '6M', 'YTD'] as period}
								<button 
									class="{timeframeBtnClasses} {timeframe === period ? timeframeBtnActiveClasses : ''}"
										on:click={() => timeframe = period}
								>
									{period}
								</button>
							{/each}
						</div>
					</div>

					<div class={performanceGridClasses}>
						<div class={chartSectionClasses}>
							<div class={chartPlaceholderClasses}>
								<div class={chartContentClasses}>
									<div class={chartIconClasses}>📈</div>
									<div class={chartLabelClasses}>Portfolio Value Chart</div>
									<div class={chartNoteClasses}>Total value vs payout earnings over time</div>
								</div>
							</div>
						</div>

						<div class={performanceStatsClasses}>
							<div class={perfStatClasses}>
								<div class="{perfValueClasses} {perfValuePositiveClasses}">{formatPercent(portfolioMetrics.totalReturn)}</div>
								<div class={perfLabelClasses}>Total Return</div>
								<div class={perfNoteClasses}>Since inception</div>
							</div>
							<div class={perfStatClasses}>
								<div class="{perfValueClasses} {perfValuePositiveClasses}">{formatPercent(portfolioMetrics.payoutReturn)}</div>
								<div class={perfLabelClasses}>Payout Return</div>
								<div class={perfNoteClasses}>Income only</div>
							</div>
							<div class={perfStatClasses}>
								<div class={perfValueClasses}>{dataStoreService.getPlatformStats().averagePortfolioIRR?.formatted || '16.3%'}</div>
								<div class={perfLabelClasses}>Annualized IRR</div>
								<div class={perfNoteClasses}>12-month projection</div>
							</div>
						</div>
					</div>

					<div class={monthlyPerformanceClasses}>
						<h4 class={monthlyPerformanceH4Classes}>Monthly Performance</h4>
						<div class={monthlyGridClasses}>
							{#each performanceData as month}
								<div class={monthlyItemClasses}>
									<div class={monthLabelClasses}>{month.month.split(' ')[0]}</div>
									<div class={monthValueClasses}>{formatCurrency(month.value)}</div>
									<div class={monthPayoutClasses}>{formatCurrency(month.payout)} payout</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{:else if activeTab === 'allocation'}
				<div class={allocationContentClasses}>
					<div class={allocationGridClasses}>
						<div class={allocationChartClasses}>
							<h3 class={allocationChartH3Classes}>Asset Allocation</h3>
							<div class={chartPlaceholderClasses}>
								<div class={chartContentClasses}>
									<div class={chartIconClasses}>🥧</div>
									<div class={chartLabelClasses}>Portfolio Pie Chart</div>
									<div class={chartNoteClasses}>Asset allocation by value</div>
								</div>
							</div>
						</div>

						<div class={allocationBreakdownClasses}>
							<h3 class={allocationBreakdownH3Classes}>Allocation Breakdown</h3>
							<div class={allocationListClasses}>
								{#each holdings as holding}
									<div class={allocationItemClasses}>
										<div class={allocationAssetClasses}>
											<div class={assetIconClasses}>{holding.icon}</div>
											<div class={assetInfoClasses}>
												<div class={assetNameClasses}>{holding.name}</div>
												<div class={assetLocationClasses}>{holding.location}</div>
											</div>
										</div>
										<div class={allocationStatsClasses}>
											<div class={allocationPercentClasses}>{holding.allocation}%</div>
											<div class={allocationValueClasses}>{formatCurrency(holding.currentValue)}</div>
										</div>
									</div>
								{/each}
							</div>

							<div class={diversificationTipClasses}>
								<div class={tipIconClasses}>⚠️</div>
								<div class={tipContentClasses}>
									<div class={tipTitleClasses}>Diversification Tip</div>
									<div class={tipTextClasses}>
										Consider diversifying: 49.6% allocation to single asset (Europa Wressle) may impact portfolio balance.
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			{:else if activeTab === 'analytics'}
				<div class={analyticsContentClasses}>
					<div class={analyticsGridClasses}>
						<div class={performanceMetricsClasses}>
							<h4 class={performanceMetricsH4Classes}>Performance Metrics</h4>
							<div class={metricsListClasses}>
								<div class={metricRowClasses}>
									<span class={metricRowSpanClasses}>Portfolio Beta</span>
									<span class={metricRowValueClasses}>0.87</span>
								</div>
								<div class={metricRowClasses}>
									<span class={metricRowSpanClasses}>Volatility (30d)</span>
									<span class={metricRowValueClasses}>3.2%</span>
								</div>
								<div class={metricRowClasses}>
									<span class={metricRowSpanClasses}>Sharpe Ratio</span>
									<span class="{metricRowValueClasses} {metricRowValuePositiveClasses}">2.14</span>
								</div>
								<div class={metricRowClasses}>
									<span class={metricRowSpanClasses}>Max Drawdown</span>
									<span class="{metricRowValueClasses} {metricRowValueNegativeClasses}">-2.1%</span>
								</div>
								<div class={metricRowClasses}>
									<span class={metricRowSpanClasses}>Correlation to Oil</span>
									<span class={metricRowValueClasses}>0.72</span>
								</div>
							</div>
						</div>

						<div class={payoutAnalyticsClasses}>
							<h4 class={payoutAnalyticsH4Classes}>Payout Analytics</h4>
							<div class={metricsListClasses}>
								<div class={metricRowClasses}>
									<span class={metricRowSpanClasses}>Weighted Avg Payout</span>
									<span class="{metricRowValueClasses} {metricRowValuePositiveClasses}">{portfolioMetrics.averagePayout.toFixed(1)}%</span>
								</div>
								<div class={metricRowClasses}>
									<span class={metricRowSpanClasses}>Monthly Income</span>
									<span class="{metricRowValueClasses} {metricRowValuePositiveClasses}">{formatCurrency(portfolioMetrics.totalPayoutEarned / 6)}</span>
								</div>
								<div class={metricRowClasses}>
									<span class={metricRowSpanClasses}>Payout Consistency</span>
									<span class="{metricRowValueClasses} {metricRowValuePositiveClasses}">94.2%</span>
								</div>
								<div class={metricRowClasses}>
									<span class={metricRowSpanClasses}>Payout Frequency</span>
									<span class={metricRowValueClasses}>Monthly</span>
								</div>
								<div class={metricRowClasses}>
									<span class={metricRowSpanClasses}>Reinvestment Rate</span>
									<span class={metricRowValueClasses}>0%</span>
								</div>
							</div>
						</div>
					</div>

					<div class={scenarioAnalysisClasses}>
						<h4 class={scenarioAnalysisH4Classes}>Scenario Analysis</h4>
						<div class={scenarioTableClasses}>
							<div class={tableHeaderClasses}>
								<div class="{tableCellClasses} {tableCellHeaderClasses}">Oil Price Scenario</div>
								<div class="{tableCellClasses} {tableCellHeaderClasses}">Portfolio Value</div>
								<div class="{tableCellClasses} {tableCellHeaderClasses}">Annual Payout</div>
								<div class="{tableCellClasses} {tableCellHeaderClasses}">Total Return</div>
							</div>
							<div class={tableRowClasses}>
								<div class={tableCellClasses}>Bear Case ($60/bbl)</div>
								<div class="{tableCellClasses} {tableCellNegativeClasses}">{formatCurrency(39500)}</div>
								<div class="{tableCellClasses} {tableCellNegativeClasses}">9.2%</div>
								<div class="{tableCellClasses} {tableCellNegativeClasses}">-6.0%</div>
							</div>
							<div class="{tableRowClasses} {tableRowCurrentClasses}">
								<div class={tableCellClasses}>Current ($78/bbl)</div>
								<div class={tableCellClasses}>{formatCurrency(totalPortfolioValue)}</div>
								<div class="{tableCellClasses} {tableCellPositiveClasses}">{portfolioMetrics.averagePayout.toFixed(1)}%</div>
								<div class="{tableCellClasses} {tableCellPositiveClasses}">{formatPercent(portfolioMetrics.totalReturn)}</div>
							</div>
							<div class={tableRowClasses}>
								<div class={tableCellClasses}>Bull Case ($95/bbl)</div>
								<div class="{tableCellClasses} {tableCellPositiveClasses}">{formatCurrency(58200)}</div>
								<div class="{tableCellClasses} {tableCellPositiveClasses}">17.8%</div>
								<div class="{tableCellClasses} {tableCellPositiveClasses}">+38.6%</div>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Quick Actions -->
	<div class={mobileQuickActionsClasses}>
		<div class={mobileActionCardClasses}>
			<div class={actionIconClasses}>➕</div>
			<h4 class={actionCardH4Classes}>Add Investment</h4>
			<p class={actionCardPClasses}>Diversify with new assets</p>
			<a href="/assets" class="{actionBtnClasses} {actionBtnPrimaryClasses}">Browse Assets</a>
		</div>

		<div class={mobileActionCardClasses}>
			<div class={actionIconClasses}>💰</div>
			<h4 class={actionCardH4Classes}>Claim Payouts</h4>
			<p class={actionCardPClasses}>{formatCurrency(unclaimedPayout)} available</p>
			<a href="/claims" class="{actionBtnClasses} {actionBtnClaimClasses}">Claim Now</a>
		</div>


		<div class={mobileActionCardClasses}>
			<div class={actionIconClasses}>📥</div>
			<h4 class={actionCardH4Classes}>Export Data</h4>
			<p class={actionCardPClasses}>Tax & accounting reports</p>
			<button class="{actionBtnClasses} {actionBtnSecondaryClasses}">Download</button>
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

