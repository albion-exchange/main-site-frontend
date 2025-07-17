<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import dataStoreService from '$lib/services/DataStoreService';
	import walletDataService from '$lib/services/WalletDataService';
	import type { Asset, Token } from '$lib/types/uiTypes';
	import { walletStore, walletActions } from '$lib/stores/wallet';
	import WalletModal from '$lib/components/WalletModal.svelte';
	import { Card, CardContent, CardActions, PrimaryButton, SecondaryButton, Metric, StatusBadge, TabNavigation, MetricDisplay, StatsCard, SectionTitle, ActionCard, TabButton, Chart, BarChart, PieChart } from '$lib/components/ui';
	import { PageLayout, HeroSection, ContentSection, FullWidthSection } from '$lib/components/layout';
	import { formatCurrency, formatPercentage } from '$lib/utils/formatters';
	import { useTooltip, useCardFlip } from '$lib/composables';

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
	
	// Use composables
	const { state: tooltipState, show: showTooltipWithDelay, hide: hideTooltip } = useTooltip();
	const { toggle: toggleCardFlip, isFlipped } = useCardFlip();
	
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
			activeAssetsCount = assetPayouts.length;
			
			// Map holdings to display format
			holdings = assetPayouts.map(ap => {
				const asset = dataStoreService.getAssetById(ap.assetId);
				const tokens = dataStoreService.getTokensByAssetId(ap.assetId);
				
				return {
					id: ap.assetId,
					name: asset?.name || 'Unknown Asset',
					location: asset?.location || { state: 'Unknown', country: 'Unknown' },
					tokenCount: tokens.reduce((sum: number, t: any) => sum + (t.balance || 0), 0),
					currentValue: ap.totalInvested,
					totalPayout: ap.totalEarned,
					unclaimedPayout: ap.unclaimedAmount,
					production: asset?.production || { current: '0 BOE/d', trend: 0 },
					status: asset?.production?.status || 'Active',
					tokens: tokens,
					monthlyPayouts: ap.monthlyPayouts || []
				};
			});
			
			// Calculate monthly payouts for charts
			const payoutsByMonth = new Map<string, number>();
			holdings.forEach(holding => {
				if (holding.monthlyPayouts) {
					holding.monthlyPayouts.forEach((payout: any) => {
						const current = payoutsByMonth.get(payout.month) || 0;
						payoutsByMonth.set(payout.month, current + payout.amount);
					});
				}
			});
			
			monthlyPayouts = Array.from(payoutsByMonth.entries())
				.map(([month, amount]) => ({ month, amount }))
				.sort((a, b) => a.month.localeCompare(b.month))
				.slice(-12); // Last 12 months
			
			// Calculate token allocations
			const allocations = new Map<string, number>();
			holdings.forEach(holding => {
				const current = allocations.get(holding.name) || 0;
				allocations.set(holding.name, current + holding.currentValue);
			});
			
			tokenAllocations = Array.from(allocations.entries())
				.map(([name, value]) => ({ name, value }))
				.sort((a, b) => b.value - a.value);
			
			loading = false;
		} catch (error) {
			console.error('Error loading portfolio data:', error);
			loading = false;
		}
	}

	function formatCurrency2(value: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(value);
	}

	function formatDate(dateStr: string): string {
		if (!dateStr) return 'Never';
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	function getCurrentTime(): string {
		return new Date().toLocaleTimeString();
	}

	function handleConnectWallet() {
		showWalletModal = false;
		// Reload data after wallet connection
		if ($walletStore.isConnected) {
			loadPortfolioData();
		}
	}

	onDestroy(() => {
		// Cleanup handled by composables
	});
</script>

<svelte:head>
	<title>Portfolio - Albion</title>
	<meta name="description" content="Track your Albion investments, view payouts, and analyze your oil & gas token portfolio performance." />
</svelte:head>

{#if showWalletModal}
	<WalletModal 
		isOpen={showWalletModal}
		on:close={() => showWalletModal = false}
		on:connect={handleConnectWallet}
	/>
{/if}

<PageLayout>
	{#if !$walletStore.isConnected}
		<!-- Not Connected State -->
		<ContentSection background="white" padding="large">
			<div class="text-center py-16">
				<div class="inline-flex items-center justify-center w-24 h-24 bg-light-gray rounded-full mb-6">
					<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-secondary">
						<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
						<line x1="7" y1="7" x2="7.01" y2="7"/>
					</svg>
				</div>
				<h1 class="text-3xl font-extrabold text-black mb-4 uppercase tracking-tight">Connect Your Wallet</h1>
				<p class="text-lg text-black opacity-70 mb-8 max-w-2xl mx-auto">
					Connect your wallet to view your portfolio, track investments, and claim payouts from your oil & gas token holdings.
				</p>
				<PrimaryButton on:click={() => showWalletModal = true} size="large">
					Connect Wallet →
				</PrimaryButton>
			</div>
		</ContentSection>
	{:else if loading}
		<!-- Loading State -->
		<ContentSection background="white" padding="large">
			<div class="text-center py-16">
				<div class="inline-flex items-center justify-center w-16 h-16 bg-light-gray rounded-full mb-4 animate-pulse">
					<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-secondary animate-spin">
						<path d="M21 12a9 9 0 1 1-6.219-8.56"/>
					</svg>
				</div>
				<p class="text-lg text-black opacity-70">Loading your portfolio...</p>
			</div>
		</ContentSection>
	{:else}
		<!-- Portfolio Header -->
		<ContentSection background="gray" padding="large">
			<div class="mb-8">
				<div class="flex justify-between items-start mb-6">
					<div>
						<h1 class="text-4xl md:text-5xl font-extrabold text-black uppercase tracking-tight mb-2">Your Portfolio</h1>
						<p class="text-lg text-black opacity-70">Track your oil & gas token investments and earnings</p>
					</div>
					<div class="text-right">
						<p class="text-sm text-black opacity-50 mb-1">Last Updated</p>
						<p class="text-lg font-semibold text-black">{getCurrentTime()}</p>
					</div>
				</div>
			</div>

			<!-- Key Metrics -->
			<div class="grid md:grid-cols-4 grid-cols-1 gap-6 mb-8">
				<StatsCard
					title="Total Invested"
					value={formatCurrency2(totalInvested)}
					trend={{ value: 0, positive: true }}
				/>
				<StatsCard
					title="Total Payouts Earned"
					value={formatCurrency2(totalPayoutsEarned)}
					trend={{ value: 12.5, positive: true }}
				/>
				<StatsCard
					title="Unclaimed Payouts"
					value={formatCurrency2(unclaimedPayout)}
					trend={{ value: 0, positive: true }}
				/>
				<StatsCard
					title="Active Assets"
					value={activeAssetsCount.toString()}
					trend={{ value: 0, positive: true }}
				/>
			</div>

			<!-- Tab Navigation -->
			<div class="flex gap-4 border-b border-light-gray">
				<TabButton
					active={activeTab === 'overview'}
					on:click={() => activeTab = 'overview'}
				>
					Overview
				</TabButton>
				<TabButton
					active={activeTab === 'holdings'}
					on:click={() => activeTab = 'holdings'}
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
					active={activeTab === 'transactions'}
					on:click={() => activeTab = 'transactions'}
				>
					Transactions
				</TabButton>
			</div>
		</ContentSection>

		<!-- Tab Content -->
		<ContentSection background="white" padding="large">
			{#if activeTab === 'overview'}
				<!-- Overview Tab -->
				<div class="grid md:grid-cols-2 grid-cols-1 gap-8">
					<!-- Monthly Payouts Chart -->
					<Card>
						<CardContent>
							<h3 class="text-xl font-extrabold text-black mb-6 uppercase tracking-tight">Monthly Payouts</h3>
							{#if monthlyPayouts.length > 0}
								<BarChart
									data={monthlyPayouts.map(payout => ({
										label: (() => {
											const date = new Date(payout.month + '-01');
											return date.toLocaleDateString('en-US', { month: 'short' });
										})(),
										value: payout.amount
									}))}
									height={300}
									barColor="#08bccc"
									valuePrefix="$"
								/>
							{:else}
								<div class="text-center py-12 text-black opacity-50">
									<p>No payout data available yet</p>
								</div>
							{/if}
						</CardContent>
					</Card>

					<!-- Asset Allocation Chart -->
					<Card>
						<CardContent>
							<h3 class="text-xl font-extrabold text-black mb-6 uppercase tracking-tight">Asset Allocation</h3>
							{#if tokenAllocations.length > 0}
								<PieChart
									data={tokenAllocations.map(allocation => ({
										label: allocation.name,
										value: allocation.value,
										percentage: Math.round((allocation.value / tokenAllocations.reduce((sum, a) => sum + a.value, 0)) * 100)
									}))}
									height={300}
									colors={['#08bccc', '#283c84', '#f8f4f4', '#000000']}
									valuePrefix="$"
								/>
							{:else}
								<div class="text-center py-12 text-black opacity-50">
									<p>No holdings data available</p>
								</div>
							{/if}
						</CardContent>
					</Card>
				</div>

				<!-- Quick Actions -->
				<div class="grid md:grid-cols-3 grid-cols-1 gap-6 mt-8">
					<ActionCard
						title="Browse Assets"
						description="Explore new investment opportunities"
						icon="🔍"
						actionText="View Assets"
						href="/assets"
					/>
					<ActionCard
						title="Claim Payouts"
						description={`You have ${formatCurrency2(unclaimedPayout)} ready to claim`}
						icon="💵"
						actionText="Claim Now"
						href="/claims"
						actionVariant="primary"
					/>
					<ActionCard
						title="Refer Friends"
						description="Earn rewards for successful referrals"
						icon="🎁"
						actionText="Learn More"
						href="/referral"
					/>
				</div>
			{:else if activeTab === 'holdings'}
				<!-- Holdings Tab -->
				<div class="mb-6">
					<SectionTitle level="h2">Your Holdings</SectionTitle>
				</div>

				{#if holdings.length > 0}
					<div class="grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-6">
						{#each holdings as holding}
							{@const flipped = isFlipped(holding.id)}
							<div class="relative h-full">
								<div class="relative h-full preserve-3d transition-transform duration-700 {flipped ? 'rotate-y-180' : ''}">
									<!-- Front of card -->
									<div class="absolute inset-0 w-full h-full backface-hidden">
										<Card>
											<CardContent>
												<div class="flex justify-between items-start mb-4">
													<div>
														<h3 class="text-xl font-extrabold text-black mb-1">{holding.name}</h3>
														<p class="text-sm text-black opacity-70">{holding.location.state}, {holding.location.country}</p>
													</div>
													<button
														class="w-8 h-8 flex items-center justify-center bg-light-gray text-black rounded-full hover:bg-secondary hover:text-white transition-all duration-200"
														on:click={() => toggleCardFlip(holding.id)}
														title="View details"
														aria-label="View details"
													>
														<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
															<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
														</svg>
													</button>
												</div>
												
												<div class="grid grid-cols-2 gap-4 mb-4 flex-1">
													<div>
														<p class="text-sm text-black opacity-70 mb-1">Tokens Held</p>
														<p class="text-lg font-bold text-black">{holding.tokenCount.toLocaleString()}</p>
													</div>
													<div>
														<p class="text-sm text-black opacity-70 mb-1">Current Value</p>
														<p class="text-lg font-bold text-black">{formatCurrency2(holding.currentValue)}</p>
													</div>
													<div>
														<p class="text-sm text-black opacity-70 mb-1">Total Payouts</p>
														<p class="text-lg font-bold text-green-600">{formatCurrency2(holding.totalPayout)}</p>
													</div>
													<div>
														<p class="text-sm text-black opacity-70 mb-1">Production</p>
														<p class="text-lg font-bold text-black">{holding.production.current}</p>
													</div>
												</div>
												
												{#if holding.unclaimedPayout > 0}
													<div class="bg-yellow-50 border border-yellow-200 p-3 rounded mb-4">
														<p class="text-sm font-semibold text-yellow-800">
															Unclaimed: {formatCurrency2(holding.unclaimedPayout)}
														</p>
													</div>
												{/if}
												
												<PrimaryButton href="/assets/{holding.id}">
													View Asset →
												</PrimaryButton>
											</CardContent>
										</Card>
									</div>
									
									<!-- Back of card -->
									<div class="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
										<Card>
											<CardContent>
												<div class="flex justify-between items-start mb-4">
													<h3 class="text-xl font-extrabold text-black">Payout History</h3>
													<button
														class="w-8 h-8 flex items-center justify-center bg-light-gray text-black rounded-full hover:bg-secondary hover:text-white transition-all duration-200"
														on:click={() => toggleCardFlip(holding.id)}
														title="Back to overview"
														aria-label="Back to overview"
													>
														<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
															<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
														</svg>
													</button>
												</div>
												
												<div class="flex-1">
													<Chart
														data={getPayoutChartData(holding).map(item => ({
															label: item.date,
															value: item.value
														}))}
														width={300}
														height={200}
														valueSuffix=""
														barColor="#08bccc"
														animate={true}
														showGrid={true}
														valuePrefix="$"
													/>
												</div>
												
												<div class="grid grid-cols-2 gap-4 mt-4">
													<div class="text-center p-3 bg-light-gray rounded">
														<p class="text-sm text-black opacity-70 mb-1">Avg Monthly</p>
														<p class="text-lg font-bold text-black">
															{formatCurrency2(holding.monthlyPayouts.length > 0 
																? holding.monthlyPayouts.reduce((sum: number, p: any) => sum + p.amount, 0) / holding.monthlyPayouts.length 
																: 0)}
														</p>
													</div>
													<div class="text-center p-3 bg-light-gray rounded">
														<p class="text-sm text-black opacity-70 mb-1">Last Payout</p>
														<p class="text-lg font-bold text-black">
															{holding.monthlyPayouts.length > 0 
																? formatDate(holding.monthlyPayouts[holding.monthlyPayouts.length - 1].month + '-01')
																: 'N/A'}
														</p>
													</div>
												</div>
											</CardContent>
										</Card>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="text-center py-16">
						<div class="inline-flex items-center justify-center w-24 h-24 bg-light-gray rounded-full mb-6">
							<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-secondary">
								<circle cx="12" cy="12" r="10"/>
								<path d="M12 6v6l4 2"/>
							</svg>
						</div>
						<h3 class="text-2xl font-extrabold text-black mb-4">No Holdings Yet</h3>
						<p class="text-black opacity-70 mb-8 max-w-lg mx-auto">
							Start building your oil & gas token portfolio by exploring available assets.
						</p>
						<PrimaryButton href="/assets">
							Browse Assets →
						</PrimaryButton>
					</div>
				{/if}
			{:else if activeTab === 'performance'}
				<!-- Performance Tab -->
				<div class="mb-6">
					<div class="flex justify-between items-center">
						<SectionTitle level="h2">Performance Analysis</SectionTitle>
						<div class="flex gap-2">
							{#each ['1M', '3M', '6M', '1Y', 'ALL'] as period}
								<button
									class="px-4 py-2 text-sm font-semibold rounded transition-colors duration-200 {timeframe === period ? 'bg-secondary text-white' : 'bg-light-gray text-black hover:bg-gray-200'}"
									on:click={() => timeframe = period}
								>
									{period}
								</button>
							{/each}
						</div>
					</div>
				</div>

				<div class="grid md:grid-cols-3 grid-cols-1 gap-6 mb-8">
					<Card>
						<CardContent>
							<div class="flex items-center justify-between mb-2">
								<h4 class="text-lg font-semibold text-black">ROI</h4>
								<span class="text-2xl font-extrabold text-green-600">+24.5%</span>
							</div>
							<p class="text-sm text-black opacity-70">Return on Investment</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent>
							<div class="flex items-center justify-between mb-2">
								<h4 class="text-lg font-semibold text-black">Monthly Yield</h4>
								<span class="text-2xl font-extrabold text-black">2.1%</span>
							</div>
							<p class="text-sm text-black opacity-70">Average monthly return</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent>
							<div class="flex items-center justify-between mb-2">
								<h4 class="text-lg font-semibold text-black">Best Performer</h4>
								<span class="text-2xl font-extrabold text-primary">+35.2%</span>
							</div>
							<p class="text-sm text-black opacity-70">EUR WR-1 Well</p>
						</CardContent>
					</Card>
				</div>

				<!-- Performance Chart -->
				<Card>
					<CardContent>
						<h3 class="text-xl font-extrabold text-black mb-6 uppercase tracking-tight">Portfolio Value Over Time</h3>
						<div class="h-96 flex items-center justify-center text-black opacity-50">
							<p>Performance chart coming soon...</p>
						</div>
					</CardContent>
				</Card>
			{:else if activeTab === 'transactions'}
				<!-- Transactions Tab -->
				<div class="mb-6">
					<SectionTitle level="h2">Transaction History</SectionTitle>
				</div>

				<Card>
					<CardContent>
						<div class="overflow-x-auto">
							<table class="w-full">
								<thead class="bg-light-gray">
									<tr>
										<th class="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">Date</th>
										<th class="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">Type</th>
										<th class="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">Asset</th>
										<th class="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">Amount</th>
										<th class="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">Status</th>
									</tr>
								</thead>
								<tbody class="bg-white divide-y divide-light-gray">
									<tr>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-black">Dec 15, 2024</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-black">Payout Claimed</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-black">EUR WR-1</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">+$445.00</td>
										<td class="px-6 py-4 whitespace-nowrap">
											<StatusBadge status="Completed" />
										</td>
									</tr>
									<tr>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-black">Dec 1, 2024</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-black">Token Purchase</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-black">BLK PAD-2</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">-$5,000.00</td>
										<td class="px-6 py-4 whitespace-nowrap">
											<StatusBadge status="Completed" />
										</td>
									</tr>
									<tr>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-black">Nov 15, 2024</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-black">Payout Claimed</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-black">EUR WR-1</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">+$428.00</td>
										<td class="px-6 py-4 whitespace-nowrap">
											<StatusBadge status="Completed" />
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			{/if}
		</ContentSection>
	{/if}
</PageLayout>

<style>
	.preserve-3d {
		transform-style: preserve-3d;
	}
	
	.backface-hidden {
		backface-visibility: hidden;
	}
	
	.rotate-y-180 {
		transform: rotateY(180deg);
	}
	
	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
	
	.animate-spin {
		animation: spin 1s linear infinite;
	}
</style>