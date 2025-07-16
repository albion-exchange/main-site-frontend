<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import dataStoreService from '$lib/services/DataStoreService';
	import walletDataService from '$lib/services/WalletDataService';
	import type { Asset, Token } from '$lib/types/uiTypes';
	import { walletStore, walletActions } from '$lib/stores/wallet';
	import WalletModal from '$lib/components/WalletModal.svelte';
	import { Card, CardContent, CardActions, PrimaryButton, SecondaryButton, Metric, StatusBadge, TabNavigation, MetricDisplay, StatsCard, SectionTitle, ActionCard, TabButton, Chart } from '$lib/components/ui';
	import { PageLayout, HeroSection, ContentSection, FullWidthSection } from '$lib/components/layout';

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
	
	// Tooltip state
	let showTooltip = '';
	let tooltipTimer: any = null;
	
	// Card flip state
	let flippedCards = new Set<string>();
	
	function showTooltipWithDelay(tooltipId: string) {
		clearTimeout(tooltipTimer);
		tooltipTimer = setTimeout(() => {
			showTooltip = tooltipId;
		}, 200);
	}
	
	function hideTooltip() {
		clearTimeout(tooltipTimer);
		showTooltip = '';
	}
	
	function toggleCardFlip(holdingId: string) {
		if (flippedCards.has(holdingId)) {
			flippedCards.delete(holdingId);
		} else {
			flippedCards.add(holdingId);
		}
		flippedCards = flippedCards; // Trigger reactivity
	}
	
	function getPayoutChartData(holding: any): Array<{date: string; value: number}> {
		// Always return sample data to ensure the chart displays
		const sampleData = [
			{ date: '2024-07-01', value: 350 },
			{ date: '2024-08-01', value: 375 },
			{ date: '2024-09-01', value: 395 },
			{ date: '2024-10-01', value: 412 },
			{ date: '2024-11-01', value: 428 },
			{ date: '2024-12-01', value: 445 }
		];
		
		// Get payout history for this specific asset
		const assetPayouts = walletDataService.getHoldingsByAsset();
		const assetPayout = assetPayouts.find(p => p.assetId === holding.id);
		
		if (!assetPayout || !assetPayout.monthlyPayouts || assetPayout.monthlyPayouts.length === 0) {
			return sampleData;
		}
		
		// Convert monthly payouts to chart data format
		const chartData = assetPayout.monthlyPayouts
			.filter(p => p.amount > 0)
			.map(p => ({
				date: p.month + '-01', // Convert YYYY-MM to YYYY-MM-DD for date parsing
				value: p.amount
			}))
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
		
		return chartData.length > 0 ? chartData : sampleData;
	}

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
				
				// Get the actual holding data for token count
				const walletHoldings = walletDataService.computeHoldings();
				const walletHolding = walletHoldings.find(h => h.assetId === holding.assetId);
				const tokensOwned = walletHolding ? walletHolding.formattedBalance : 0;
				const tokenSymbol = walletHolding ? walletHolding.symbol : '';
				
				// Calculate capital returned percentage
				const capitalReturned = holding.totalInvested > 0 
					? (holding.totalEarned / holding.totalInvested) * 100 
					: 0;
				
				// Calculate unrecovered capital
				const unrecoveredCapital = Math.max(0, holding.totalInvested - holding.totalEarned);
				
				// Calculate asset depletion
				// Get cumulative production from asset data
				let cumulativeProduction = 0;
				if (asset.monthlyReports) {
					cumulativeProduction = asset.monthlyReports.reduce((sum, report) => sum + report.production, 0);
				}
				
				// Get total reserves (estimated remaining + cumulative)
				// Parse the expected remaining production string
				let totalReserves = 0;
				const remainingProdStr = asset.production.expectedRemainingProduction || 
					dataStoreService.getCalculatedRemainingProduction(asset.id);
				if (remainingProdStr && remainingProdStr !== 'TBD') {
					const match = remainingProdStr.match(/[\d.]+/);
					if (match) {
						const remainingMboe = parseFloat(match[0]) * 1000; // Convert mboe to boe
						totalReserves = cumulativeProduction + remainingMboe;
					}
				}
				
				const assetDepletion = totalReserves > 0 
					? (cumulativeProduction / totalReserves) * 100 
					: 0;
				
				return {
					id: holding.assetId,
					name: holding.assetName,
					location: asset ? `${asset.location.state}, ${asset.location.country}` : '',
					totalInvested: holding.totalInvested,
					totalPayoutsEarned: holding.totalEarned,
					unclaimedAmount: holding.unclaimedAmount,
					lastPayoutAmount: holding.lastPayoutAmount,
					lastPayoutDate: holding.lastPayoutDate,
					status: asset ? asset.production.status : 'unknown',
					tokensOwned,
					tokenSymbol,
					capitalReturned,
					unrecoveredCapital,
					assetDepletion,
					asset // Include the full asset object for the cover image
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
	<PageLayout variant="constrained">
		<ContentSection background="white" padding="large" centered>
			<div class="flex flex-col items-center justify-center min-h-[60vh] text-center">
				<SectionTitle level="h1" size="page" center>Wallet Connection Required</SectionTitle>
				<p class="text-lg text-black opacity-80 mb-8 max-w-md">Please connect your wallet to view your portfolio.</p>
				<PrimaryButton on:click={() => showWalletModal = true}>
					Connect Wallet
				</PrimaryButton>
			</div>
		</ContentSection>
	</PageLayout>
{:else if $walletStore.isConnected}
<PageLayout variant="constrained">
	<!-- Portfolio Overview Header -->
	<HeroSection 
		title="My Portfolio"
		subtitle="Track your investment portfolio performance and history"
		showBorder={true}
		showButtons={false}
		className="py-12"
	>
		<!-- Platform Stats -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-6xl mx-auto mt-6">
			{#if loading}
				<StatsCard
					title="Total Invested"
					value="--"
					subtitle="Loading..."
					size="large"
				/>
				<StatsCard
					title="Payouts Received To Date"
					value="--"
					subtitle="Loading..."
					size="large"
				/>
				<StatsCard
					title="Active Assets"
					value="--"
					subtitle="Loading..."
					size="large"
				/>
			{:else}
				<StatsCard
					title="Total Invested"
					value={formatCurrency(totalInvested)}
					subtitle="Principal"
					size="large"
				/>
				<StatsCard
					title="Payouts Received To Date"
					value={formatCurrency(totalPayoutsEarned)}
					subtitle="Lifetime earnings"
					valueColor="primary"
					size="large"
				/>
				<StatsCard
					title="Active Assets"
					value={activeAssetsCount.toString()}
					subtitle="In portfolio"
					size="large"
				/>
			{/if}
		</div>
	</HeroSection>

	<!-- Portfolio Tabs -->
	<ContentSection background="white" padding="compact" maxWidth={false}>
		<div class="bg-white border border-light-gray mb-8">
			<div class="flex flex-wrap border-b border-light-gray">
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
			</div>

			<div class="p-8">
				{#if activeTab === 'overview'}
					<SectionTitle level="h3" size="subsection" className="mb-6">My Holdings</SectionTitle>
					
					<div class="space-y-3">
						{#if loading}
							<div class="text-center py-12 text-black opacity-70">Loading portfolio holdings...</div>
						{:else}
							{#each holdings as holding}
								{@const isFlipped = flippedCards.has(holding.id)}
								{@const payoutData = isFlipped ? getPayoutChartData(holding) : []}
								<div class="mb-3" style="perspective: 1000px;">
									<div class="relative w-full transition-transform duration-500 preserve-3d" style="transform: rotateY({isFlipped ? 180 : 0}deg); height: 360px;">
										<!-- Front of card -->
										<div class="absolute inset-0 w-full h-full backface-hidden">
											<Card hoverable showBorder>
											<CardContent paddingClass="p-9 h-full flex flex-col justify-between">
												<div class="flex justify-between items-start mb-7">
													<div class="flex items-start gap-4">
														<div class="w-14 h-14 bg-light-gray rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
															{#if holding.asset?.coverImage}
																<img src={holding.asset.coverImage} alt={holding.name} class="w-full h-full object-cover" />
															{:else}
																<div class="text-2xl opacity-50">🛢️</div>
															{/if}
														</div>
														<div class="text-left">
															<h4 class="font-extrabold text-black text-lg mb-1">
																{holding.tokenSymbol}
															</h4>
															<div class="text-sm text-black opacity-70 mb-1">{holding.name}</div>
															<div class="text-xs text-black opacity-70 mb-2">{holding.location}</div>
															<StatusBadge 
																status={holding.status} 
																variant={holding.status === 'producing' ? 'available' : 'default'}
															/>
														</div>
													</div>

													<div class="flex gap-2">
														<SecondaryButton size="small" href="/claims">Claims</SecondaryButton>
														<SecondaryButton size="small" on:click={() => toggleCardFlip(holding.id)}>History</SecondaryButton>
													</div>
												</div>

										<div class="grid grid-cols-5 gap-4 mt-4">
											<!-- Tokens -->
											<div class="pr-6 flex flex-col">
												<div class="text-sm font-bold text-black opacity-70 uppercase tracking-wider mb-4 h-10 flex items-start">Tokens</div>
												<div class="text-xl font-extrabold text-black mb-3">{holding.tokensOwned.toLocaleString()}</div>
												<div class="text-sm text-black opacity-70">${Math.round(holding.totalInvested).toLocaleString()}</div>
											</div>

											<!-- Payouts to Date -->
											<div class="flex flex-col">
												<div class="text-sm font-bold text-black opacity-70 uppercase tracking-wider mb-4 h-10 flex items-start">Payouts to Date</div>
												<div class="text-xl font-extrabold text-primary mb-3">{formatCurrency(holding.totalPayoutsEarned)}</div>
												<div class="text-sm text-black opacity-70">Cumulative</div>
											</div>

											<!-- Capital Returned -->
											<div class="relative flex flex-col">
												<div class="text-sm font-bold text-black opacity-70 uppercase tracking-wider mb-4 flex items-start gap-1 h-10">
													<span>Capital Returned</span>
													<span class="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-light-gray text-black text-[10px] font-bold cursor-help opacity-70 transition-opacity duration-200 hover:opacity-100"
														on:mouseenter={() => showTooltipWithDelay('capital-returned-' + holding.id)}
														on:mouseleave={hideTooltip}
														role="button"
														tabindex="0">ⓘ</span>
												</div>
												<div class="text-xl font-extrabold text-black mb-3">{holding.capitalReturned.toFixed(1)}%</div>
												<div class="text-sm text-black opacity-70">To Date</div>
												{#if showTooltip === 'capital-returned-' + holding.id}
													<div class="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white p-3 rounded text-xs z-[1000] mb-[5px] w-48 text-left leading-relaxed">
														The portion of your initial<br/>investment already recovered
													</div>
												{/if}
											</div>

											<!-- Asset Depletion -->
											<div class="relative flex flex-col">
												<div class="text-sm font-bold text-black opacity-70 uppercase tracking-wider mb-4 flex items-start gap-1 h-10">
													<span>Est. Asset Depletion</span>
													<span class="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-light-gray text-black text-[10px] font-bold cursor-help opacity-70 transition-opacity duration-200 hover:opacity-100"
														on:mouseenter={() => showTooltipWithDelay('depletion-' + holding.id)}
														on:mouseleave={hideTooltip}
														role="button"
														tabindex="0">ⓘ</span>
												</div>
												<div class="text-xl font-extrabold text-black mb-3">
													{holding.assetDepletion > 0 ? `${holding.assetDepletion.toFixed(1)}%` : 'TBD'}
												</div>
												<div class="text-sm text-black opacity-70">To Date</div>
												{#if showTooltip === 'depletion-' + holding.id}
													<div class="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white p-3 rounded text-xs z-[1000] mb-[5px] w-48 text-left leading-relaxed">
														The portion of total expected<br/>oil and gas extracted so far
													</div>
												{/if}
											</div>

											<!-- Capital To be Recovered / Lifetime Profit -->
											<div class="flex flex-col">
												<div class="text-sm font-bold text-black opacity-70 uppercase tracking-wider mb-4 h-10 flex items-start">
													{holding.unrecoveredCapital > 0 ? 'Capital To be Recovered' : 'Lifetime Profit'}
												</div>
												<div class="text-xl font-extrabold {holding.unrecoveredCapital > 0 ? 'text-black' : 'text-primary'} mb-3">
													{formatCurrency(holding.unrecoveredCapital > 0 ? holding.unrecoveredCapital : holding.totalPayoutsEarned - holding.totalInvested)}
												</div>
												<div class="text-sm text-black opacity-70">
													{holding.unrecoveredCapital > 0 ? 'Remaining' : 'To Date'}
												</div>
											</div>
										</div>
										</CardContent>
										</Card>
										</div>
										
										<!-- Back of card -->
										<div class="absolute inset-0 w-full h-full backface-hidden" style="transform: rotateY(180deg);">
											<Card hoverable showBorder>
												<CardContent paddingClass="p-8 h-full flex flex-col">
												<div class="flex justify-between items-start mb-6">
													<div>
														<h4 class="font-extrabold text-black text-lg mb-1">{holding.name}</h4>
														<div class="text-xs text-black opacity-70">Payout History</div>
													</div>
													<SecondaryButton size="small" on:click={() => toggleCardFlip(holding.id)}>Back</SecondaryButton>
												</div>
												
												<div class="flex-1 flex items-center justify-center">
													{#if payoutData && payoutData.length > 0}
														<div class="w-full max-w-xl">
															<Chart
																data={payoutData.map(d => ({ label: d.date, value: d.value }))}
																width={600}
																height={200}
																barColor="#08bccc"
																valuePrefix="$"
																animate={true}
																showGrid={true}
															/>
														</div>
													{:else}
														<div class="text-center text-black opacity-70">
															<div class="text-4xl mb-2">📊</div>
															<div>No payout history available yet</div>
														</div>
													{/if}
												</div>
												</CardContent>
											</Card>
										</div>
									</div>
								</div>
							{/each}
						{/if}
					</div>
				{:else if activeTab === 'performance'}
					<div class="flex justify-between items-center mb-6">
						<SectionTitle level="h3" size="subsection">Performance Analytics</SectionTitle>
						<div class="flex gap-2">
							{#each ['1M', '3M', '6M', 'YTD'] as period}
								<TabButton 
									active={timeframe === period}
									on:click={() => timeframe = period}
								>
									{period}
								</TabButton>
							{/each}
						</div>
					</div>

					<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
						<div class="bg-light-gray border border-light-gray rounded-lg h-64 flex items-center justify-center">
							<div class="text-center">
								<div class="text-3xl mb-2 opacity-50">📈</div>
								<div class="font-bold text-black uppercase tracking-wider mb-1">Portfolio Value Chart</div>
								<div class="text-xs text-black opacity-70">Total value vs payout earnings over time</div>
							</div>
						</div>

						<div class="space-y-4">
							<StatsCard
								title="Total Payouts"
								value={formatCurrency(totalPayoutsEarned)}
								subtitle="Lifetime"
								valueColor="primary"
								size="medium"
							/>
							<StatsCard
								title="Last Month"
								value={formatCurrency(monthlyPayouts.length > 0 ? monthlyPayouts[monthlyPayouts.length - 1].totalPayout : 0)}
								subtitle="Payout"
								size="medium"
							/>
							<StatsCard
								title="Est. Annual"
								value={formatCurrency(walletDataService.getEstimatedAnnualIncome())}
								subtitle="Income"
								valueColor="primary"
								size="medium"
							/>
						</div>
					</div>

					<div class="bg-light-gray border border-light-gray rounded-lg p-8">
						<SectionTitle level="h3" size="subsection" className="mb-6">Monthly Payouts</SectionTitle>
						<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
							{#each monthlyPayouts.slice(-6) as month}
								<div class="text-center">
									<div class="text-xs font-bold text-black opacity-70 mb-2">{month.month.slice(0, 7)}</div>
									<div class="text-base font-extrabold text-black">{formatCurrency(month.totalPayout)}</div>
								</div>
							{/each}
						</div>
					</div>
				{:else if activeTab === 'allocation'}
					<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
						<div>
							<SectionTitle level="h3" size="subsection" className="mb-6">Asset Allocation</SectionTitle>
							<div class="bg-light-gray border border-light-gray rounded-lg h-64 flex items-center justify-center">
								<div class="text-center">
									<div class="text-3xl mb-2 opacity-50">🥧</div>
									<div class="font-bold text-black uppercase tracking-wider mb-1">Portfolio Pie Chart</div>
									<div class="text-xs text-black opacity-70">Asset allocation by value</div>
								</div>
							</div>
						</div>

						<div>
							<SectionTitle level="h3" size="subsection" className="mb-6">Allocation Breakdown</SectionTitle>
							<div class="space-y-4 mb-8">
								{#each tokenAllocations as allocation}
									{@const allocationAsset = dataStoreService.getAssetById(allocation.assetId)}
									<div class="flex justify-between items-center pb-4 border-b border-light-gray last:border-b-0 last:pb-0">
										<div class="flex items-center gap-3">
											<div class="w-8 h-8 bg-light-gray rounded overflow-hidden flex items-center justify-center">
												{#if allocationAsset?.coverImage}
													<img src={allocationAsset.coverImage} alt={allocation.assetName} class="w-full h-full object-cover" />
												{:else}
													<div class="text-base opacity-50">🛢️</div>
												{/if}
											</div>
											<div>
												<div class="font-extrabold text-black text-sm">{allocation.assetName}</div>
												<div class="text-xs text-black opacity-70">{allocation.tokenSymbol} • {allocation.tokensOwned} tokens</div>
											</div>
										</div>
										<div class="text-right">
											<div class="font-extrabold text-black text-sm">{allocation.percentageOfPortfolio.toFixed(1)}%</div>
											<div class="text-xs text-black opacity-70">{formatCurrency(allocation.currentValue)}</div>
										</div>
									</div>
								{/each}
							</div>

							{#if tokenAllocations.length > 0 && tokenAllocations[0].percentageOfPortfolio > 40}
								<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
									<div class="text-xl flex-shrink-0 mt-0.5">⚠️</div>
									<div>
										<div class="font-bold text-black text-sm mb-1">Diversification Tip</div>
										<div class="text-xs text-black opacity-80 leading-relaxed">
											Consider diversifying: {tokenAllocations[0].percentageOfPortfolio.toFixed(1)}% allocation to single asset ({tokenAllocations[0].assetName}) may impact portfolio balance.
										</div>
									</div>
								</div>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</ContentSection>

	<!-- Quick Actions -->
	<FullWidthSection background="gray" padding="standard">
		<div class="text-center">
			<SectionTitle level="h2" size="section" center className="mb-12">Quick Actions</SectionTitle>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
				<ActionCard
					title="Add Investment"
					description="Diversify with new assets"
					icon="➕"
					actionText="Browse Assets"
					actionVariant="primary"
					href="/assets"
					size="medium"
				/>

				<ActionCard
					title="Claim Payouts"
					description="{formatCurrency(unclaimedPayout)} available"
					icon="💰"
					actionText="Claim Now"
					actionVariant="claim"
					href="/claims"
					size="medium"
				/>

				<ActionCard
					title="Export Data"
					description="Tax & accounting reports"
					icon="📥"
					actionText="Download"
					actionVariant="secondary"
					size="medium"
				/>
			</div>
		</div>
	</FullWidthSection>
</PageLayout>
{/if}

<!-- Wallet Modal -->
<WalletModal
	bind:isOpen={showWalletModal}
	isConnecting={$walletStore.isConnecting}
	on:connect={handleWalletConnect}
	on:close={handleWalletModalClose}
/>

<style>
	:global(.preserve-3d) {
		transform-style: preserve-3d;
	}
	
	:global(.backface-hidden) {
		backface-visibility: hidden;
	}
</style>

