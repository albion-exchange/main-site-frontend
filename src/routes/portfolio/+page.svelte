<script lang="ts">
	import { onMount } from 'svelte';
	import { walletStore } from '$lib/stores/wallet';
	import { usePortfolioData, getHoldingPayoutChartData } from '$lib/composables/usePortfolioData';
	import { useTooltip } from '$lib/composables/useTooltip';
	import { useCardFlip } from '$lib/composables/useCardFlip';
	import WalletModal from '$lib/components/WalletModal.svelte';
	import { Card, CardContent, PrimaryButton, SecondaryButton, StatusBadge, StatsCard, SectionTitle, TabButton, Chart, BarChart, PieChart } from '$lib/components/ui';
	import { PageLayout, HeroSection, ContentSection, FullWidthSection } from '$lib/components/layout';
	import { formatCurrency, formatPercentage } from '$lib/utils/formatters';

	// Composables
	const { state, portfolioMetrics, chartData, loadPortfolioData } = usePortfolioData();
	const { state: tooltipState, show: showTooltip, hide: hideTooltip } = useTooltip();
	const { flippedCards, toggle: toggleCard } = useCardFlip();
	
	// Component state
	let activeTab = 'overview';
	let timeframe = '1M';
	let showWalletModal = false;
	
	// Reactive data
	$: portfolio = $state;
	$: metrics = $portfolioMetrics;
	$: chartDataValue = $chartData;
	
	onMount(async () => {
		// Check if wallet is connected
		if (!$walletStore.isConnected) {
			showWalletModal = true;
		}
	});
	
	function formatDate(dateStr: string): string {
		if (!dateStr) return 'Never';
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}
	
	function getCurrentTime(): string {
		return new Date().toLocaleTimeString();
	}
</script>

<svelte:head>
	<title>Portfolio - Albion</title>
	<meta name="description" content="Track your Albion investments, view payouts, and analyze your oil & gas token portfolio performance." />
</svelte:head>

{#if showWalletModal}
	<WalletModal 
		isOpen={true} 
		on:close={() => showWalletModal = false}
		on:connect={() => {
			showWalletModal = false;
			loadPortfolioData();
		}}
	/>
{/if}

<PageLayout>
	<!-- Hero Section with Stats -->
	<HeroSection 
		title="My Portfolio"
		subtitle="Track your investments and monitor performance"
		showBorder={true}
		showButtons={false}
	>
		<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
			{#if portfolio.loading}
				<StatsCard title="Total Invested" value="--" subtitle="Loading..." size="large" />
				<StatsCard title="Total Payouts" value="--" subtitle="Loading..." size="large" />
				<StatsCard title="Unclaimed" value="--" subtitle="Loading..." size="large" />
				<StatsCard title="Active Assets" value="--" subtitle="Loading..." size="large" />
			{:else}
				<StatsCard
					title="Total Invested"
					value={formatCurrency(portfolio.totalInvested)}
					subtitle="Initial capital"
					size="large"
				/>
				<StatsCard
					title="Total Payouts"
					value={formatCurrency(portfolio.totalPayoutsEarned)}
					subtitle="All time earnings"
					valueColor="primary"
					size="large"
				/>
				<StatsCard
					title="Unclaimed"
					value={formatCurrency(portfolio.unclaimedPayout)}
					subtitle="Ready to claim"
					size="large"
				/>
				<StatsCard
					title="Active Assets"
					value={portfolio.activeAssetsCount.toString()}
					subtitle="In portfolio"
					size="large"
				/>
			{/if}
		</div>
	</HeroSection>

	<!-- Tab Navigation -->
	<ContentSection background="white" padding="standard">
		<div class="flex gap-4 mb-8 border-b">
			<TabButton 
				active={activeTab === 'overview'} 
				on:click={() => activeTab = 'overview'}
			>
				Overview
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
					{#if portfolio.loading}
						<div class="text-center py-12 text-black opacity-70">Loading portfolio holdings...</div>
					{:else if portfolio.holdings.length === 0}
						<div class="text-center py-12">
							<p class="text-black opacity-70 mb-4">No holdings found</p>
							<PrimaryButton href="/assets">Explore Assets</PrimaryButton>
						</div>
					{:else}
						{#each portfolio.holdings as holding}
							{@const isFlipped = $flippedCards.has(holding.id)}
							{@const payoutData = isFlipped ? getHoldingPayoutChartData(holding) : []}
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
													<SecondaryButton size="small" on:click={() => toggleCard(holding.id)}>History</SecondaryButton>
												</div>
											</div>

									<div class="grid grid-cols-5 gap-4 mt-4">
										<!-- Tokens -->
										<div class="pr-6 flex flex-col">
											<div class="text-sm font-bold text-black opacity-70 uppercase tracking-wider mb-4 h-10 flex items-start">Tokens</div>
											<div class="text-xl font-extrabold text-black mb-3">{holding.tokensOwned.toLocaleString()}</div>
											<div class="text-sm text-black opacity-70">{formatCurrency(holding.totalInvested, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
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
													on:mouseenter={() => showTooltip('capital-returned-' + holding.id)}
													on:mouseleave={() => hideTooltip()}
													role="button"
													tabindex="0">ⓘ</span>
											</div>
											<div class="text-xl font-extrabold text-black mb-3">{formatPercentage(holding.capitalReturned / 100, { decimals: 1 })}</div>
											<div class="text-sm text-black opacity-70">To Date</div>
											{#if $tooltipState.visible === 'capital-returned-' + holding.id}
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
													on:mouseenter={() => showTooltip('depletion-' + holding.id)}
													on:mouseleave={() => hideTooltip()}
													role="button"
													tabindex="0">ⓘ</span>
											</div>
											<div class="text-xl font-extrabold text-black mb-3">
												{holding.assetDepletion > 0 ? formatPercentage(holding.assetDepletion / 100, { decimals: 1 }) : 'TBD'}
											</div>
											<div class="text-sm text-black opacity-70">To Date</div>
											{#if $tooltipState.visible === 'depletion-' + holding.id}
												<div class="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white p-3 rounded text-xs z-[1000] mb-[5px] w-48 text-left leading-relaxed">
													Estimated percentage of<br/>recoverable reserves<br/>already produced
												</div>
											{/if}
										</div>

										<!-- Unclaimed -->
										<div class="flex flex-col">
											<div class="text-sm font-bold text-black opacity-70 uppercase tracking-wider mb-4 h-10 flex items-start">Unclaimed</div>
											<div class="text-xl font-extrabold text-primary mb-3">{formatCurrency(holding.unclaimedAmount)}</div>
											<div class="text-sm text-black opacity-70">Ready to claim</div>
										</div>
									</div>

									<!-- Additional Details Row -->
									<div class="mt-6 pt-4 border-t border-gray-100">
										<div class="flex justify-between items-center">
											<div class="text-sm">
												<span class="text-black opacity-70">Last Payout:</span>
												<span class="font-semibold ml-2">{holding.lastPayoutAmount > 0 ? formatCurrency(holding.lastPayoutAmount) : 'N/A'}</span>
												<span class="text-black opacity-50 ml-2">on {formatDate(holding.lastPayoutDate)}</span>
											</div>
											<div class="text-sm">
												<span class="text-black opacity-70">Unrecovered Capital:</span>
												<span class="font-semibold ml-2">{formatCurrency(holding.unrecoveredCapital)}</span>
											</div>
										</div>
									</div>
										</CardContent>
										</Card>
									</div>

									<!-- Back of card (Chart view) -->
									<div class="absolute inset-0 w-full h-full backface-hidden" style="transform: rotateY(180deg);">
										<Card hoverable showBorder>
											<CardContent paddingClass="p-6 h-full">
												<div class="flex justify-between items-center mb-4">
													<h4 class="font-extrabold text-black text-lg">{holding.name} - Payout History</h4>
													<SecondaryButton size="small" on:click={() => toggleCard(holding.id)}>Back</SecondaryButton>
												</div>
												<div class="h-[280px]">
													<BarChart 
														data={payoutData}
														barColor="#08bccc"
														showGrid={true}
														height={280}
														valuePrefix="$"
													/>
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
				<div class="space-y-6">
					<SectionTitle level="h3" size="subsection">Portfolio Performance</SectionTitle>
					
					<!-- Performance Metrics -->
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
						<StatsCard
							title="Total Portfolio Value"
							value={formatCurrency(metrics.totalValue)}
							subtitle="Invested + Earned"
							size="medium"
						/>
						<StatsCard
							title="Return on Investment"
							value={formatPercentage(metrics.roi / 100, { decimals: 1 })}
							subtitle="All time"
							valueColor="primary"
							size="medium"
						/>
						<StatsCard
							title="Avg Monthly Payout"
							value={formatCurrency(metrics.avgMonthlyPayout)}
							subtitle="Based on history"
							size="medium"
						/>
					</div>
					
					<!-- Payout Trend Chart -->
					{#if chartDataValue.payoutTrend.length > 0}
						<Card>
							<CardContent>
								<h4 class="font-semibold mb-4">Monthly Payout Trend</h4>
								<div class="h-[300px]">
									<Chart
										data={chartDataValue.payoutTrend}
										height={300}
										valuePrefix="$"
										showAreaFill={true}
									/>
								</div>
							</CardContent>
						</Card>
					{/if}
				</div>
			{:else if activeTab === 'allocation'}
				<div class="space-y-6">
					<SectionTitle level="h3" size="subsection">Asset Allocation</SectionTitle>
					
					{#if portfolio.tokenAllocations.length > 0}
						<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
							<!-- Pie Chart -->
							<Card>
								<CardContent>
									<h4 class="font-semibold mb-4">Portfolio Distribution</h4>
									<div class="h-[300px]">
										<PieChart
											data={chartDataValue.allocationPie}
											showLegend={true}
											height={300}
										/>
									</div>
								</CardContent>
							</Card>
							
							<!-- Allocation Details -->
							<Card>
								<CardContent>
									<h4 class="font-semibold mb-4">Allocation Details</h4>
									<div class="space-y-3">
										{#each portfolio.tokenAllocations as allocation}
											<div class="flex justify-between items-center p-3 bg-light-gray rounded">
												<div class="flex items-center gap-3">
													<div class="w-3 h-3 rounded-full" style="background-color: {allocation.color}"></div>
													<div>
														<div class="font-extrabold text-black text-sm">{allocation.assetName}</div>
														<div class="text-xs text-black opacity-70">{allocation.tokenSymbol} • {allocation.tokensOwned} tokens</div>
													</div>
												</div>
												<div class="text-right">
													<div class="font-extrabold text-black">{formatPercentage(allocation.percentage / 100, { decimals: 1 })}</div>
													<div class="text-xs text-black opacity-70">{formatCurrency(allocation.value)}</div>
												</div>
											</div>
										{/each}
									</div>
								</CardContent>
							</Card>
						</div>
					{:else}
						<Card>
							<CardContent paddingClass="py-12 text-center">
								<p class="text-black opacity-70">No allocation data available</p>
							</CardContent>
						</Card>
					{/if}
				</div>
			{/if}
		</div>
	</ContentSection>
</PageLayout>

<style>
	.preserve-3d {
		transform-style: preserve-3d;
	}
	
	.backface-hidden {
		backface-visibility: hidden;
	}
</style>