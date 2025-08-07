<script lang="ts">
	import { web3Modal, signerAddress, connected } from 'svelte-wagmi';
	import { 
		portfolioStore,
		isLoadingPortfolio as isLoading,
		portfolioError as syncError,
		syncPortfolioData as syncUserData,
		portfolioChartData,
		recentTransactions
	} from '$lib/stores/portfolioStore';
	import {
		claimsStore,
		syncClaimsData
	} from '$lib/stores/claimsStore';
	import { 
		Card, CardContent, CardActions, Button, 
		StatusBadge, TabNavigation, StatsCard, SectionTitle, ActionCard, 
		TabButton, Chart, PieChart, CollapsibleSection, FormattedNumber 
	} from '$lib/components/components';
	import { PageLayout, HeroSection, ContentSection, FullWidthSection } from '$lib/components/layout';
	import { formatCurrency, formatPercentage, formatNumber } from '$lib/utils/formatters';
	import { useTooltip, useCardFlip } from '$lib/composables';
	import { PINATA_GATEWAY } from '$lib/network';
	import { formatEther } from 'viem';
	import { onMount } from 'svelte';

	let activeTab = 'overview';
	let pageLoading = true;
	
	// Use composables
	const { show: showTooltipWithDelay, hide: hideTooltip, isVisible: isTooltipVisible } = useTooltip();
	const { toggle: toggleCardFlip, flippedCards, unflipAll } = useCardFlip();

	async function connectWallet() {
		if ($web3Modal) {
			$web3Modal.open();
		}
	}

	function getPayoutChartData(holding: any): Array<{date: string; value: number}> {
		if (!holding.payoutHistory || holding.payoutHistory.length === 0) {
			return [];
		}
		
		return holding.payoutHistory
			.filter((payout: any) => payout.date && payout.amount)
			.map((payout: any) => ({
				date: new Date(payout.date).toISOString().split('T')[0],
				value: Number(payout.amount)
			}))
			.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
	}

	// Sync user data when wallet connects/changes
	$: if ($signerAddress) {
		syncUserData($signerAddress);
		syncClaimsData($signerAddress);
	}

	// Update loading state
	$: pageLoading = $isLoading;

	// Portfolio metrics from store
	$: totalInvested = $portfolioStore?.stats?.totalValue || 0;
	$: totalPayoutsEarned = $claimsStore?.totalEarned || 0;
	$: unclaimedPayout = $claimsStore?.unclaimedPayout || 0;
	$: holdings = $portfolioStore?.holdings || [];
	$: activeAssetsCount = holdings.length;
	$: tokenAllocations = holdings.map(holding => ({
		assetId: holding.token.address,
		assetName: holding.token.name,
		tokenSymbol: holding.token.symbol || holding.token.name,
		tokensOwned: Number(formatEther(holding.balance)),
		currentValue: holding.value,
		percentageOfPortfolio: holding.percentage
	}));

	onMount(() => {
		unflipAll();
	});
</script>

<svelte:head>
	<title>Portfolio - Albion</title>
	<meta name="description" content="Track your oil & gas investment portfolio performance" />
</svelte:head>

{#if (!$connected || !$signerAddress)}
	<PageLayout variant="constrained">
		<ContentSection background="white" padding="large" centered>
			<div class="flex flex-col items-center justify-center min-h-[60vh] text-center">
				<SectionTitle level="h1" size="page" center>Wallet Connection Required</SectionTitle>
				<p class="text-lg text-black opacity-80 mb-8 max-w-md">Please connect your wallet to view your portfolio.</p>
				<Button variant="primary" on:click={connectWallet}>
					Connect Wallet
				</Button>
			</div>
		</ContentSection>
	</PageLayout>
{:else if $connected && $signerAddress}
<PageLayout variant="constrained">
	<!-- Portfolio Overview Header -->
	<HeroSection 
		title="My Portfolio"
		subtitle="Track your investment portfolio performance and history"
		showBorder={true}
		showButtons={false}
		className="py-12"
	>
		<!-- Platform Stats - 3 columns on all viewports -->
		<div class="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-8 text-center max-w-6xl mx-auto mt-6">
			{#if pageLoading}
				<StatsCard
					title="Portfolio Value"
					value="--"
					subtitle="Loading..."
					size="large"
				/>
				<StatsCard
					title="Total Earned"
					value="--"
					subtitle="Loading..."
					size="large"
				/>
				<StatsCard
					title="Active Assets"
					value="--"
					subtitle="Loading..."
					size="small"
				/>
			{:else}
				<StatsCard
					title="Portfolio Value"
					value={formatCurrency(totalInvested, { compact: true })}
					subtitle="Total invested"
					size="small"
				/>
				<StatsCard
					title="Total Earned"
					value={formatCurrency(totalPayoutsEarned, { compact: true })}
					subtitle="All payouts"
					valueColor="primary"
					size="small"
				/>
				<StatsCard
					title="Active Assets"
					value={activeAssetsCount.toString()}
					subtitle="In portfolio"
					size="small"
				/>
			{/if}
		</div>
	</HeroSection>

	<!-- Portfolio Content -->
	<ContentSection background="white" padding="standard">
		<!-- Mobile: Always show overview, other tabs in expandable sections -->
		<!-- Desktop: Traditional tabs -->
		<div class="hidden lg:block">
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
			</div>
		</div>

		<!-- Mobile: Always show overview -->
		<div class="lg:hidden">
			<SectionTitle level="h3" size="subsection" className="mb-6">My Holdings</SectionTitle>
			
			<div class="space-y-4">
				{#if pageLoading}
					<div class="text-center py-8 text-black opacity-70">Loading portfolio holdings...</div>
				{:else if holdings.length === 0}
					<div class="text-center py-8 text-black opacity-70">
						<p class="mb-4">No holdings yet</p>
						<Button variant="primary" href="/assets">Browse Assets</Button>
					</div>
				{:else}
					{#each holdings as holding}
						{@const flipped = $flippedCards.has(holding.id)}
						{@const payoutData = flipped ? getPayoutChartData(holding) : []}
						<div class="mb-4" style="perspective: 1000px;">
							<div class="relative w-full transition-transform duration-500" style="transform-style: preserve-3d; transform: rotateY({flipped ? 180 : 0}deg); height: 320px;">
								<!-- Front of card -->
								<div class="absolute inset-0 w-full h-full" style="backface-visibility: hidden;">
									<Card hoverable showBorder>
										<CardContent paddingClass="p-4 sm:p-6 h-full flex flex-col justify-between">
											<div class="flex items-start gap-3 mb-4">
												<div class="w-12 h-12 bg-light-gray rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
													{#if holding.asset?.coverImage}
														<img src={`${PINATA_GATEWAY}/${holding.asset.coverImage}`} alt={holding.asset.name} class="w-full h-full object-cover" />
													{:else}
														<div class="text-xl opacity-50">🛢️</div>
													{/if}
												</div>
												<div class="flex-1">
													<h4 class="font-extrabold text-black text-base mb-1">{holding.tokenSymbol}</h4>
													<div class="text-sm text-black opacity-70 mb-1">{holding.asset.name}</div>
													<StatusBadge
														status={holding.status}
														variant={holding.status === 'producing' ? 'available' : 'default'}
														size="small"
													/>
												</div>
												<div class="text-right">
													<div class="text-lg font-extrabold text-primary">{formatCurrency(holding.earned)}</div>
													<div class="text-xs text-black opacity-70">Total Earned</div>
												</div>
											</div>
											
											<div class="grid grid-cols-2 gap-4 mb-4">
												<div>
													<div class="text-xs font-bold text-black opacity-70 uppercase tracking-wide mb-1">Tokens</div>
													<div class="text-sm font-extrabold text-black">{formatNumber(holding.tokensOwned)}</div>
												</div>
												<div>
													<div class="text-xs font-bold text-black opacity-70 uppercase tracking-wide mb-1">Invested</div>
													<div class="text-sm font-extrabold text-black">
														<FormattedNumber value={holding.invested} type="currency" compact={holding.invested >= 10000} />
													</div>
												</div>
											</div>
											
											<div class="flex gap-2">
												<Button variant="secondary" size="small" href="/claims" fullWidth>Claims</Button>
												<Button variant="secondary" size="small" on:click={() => toggleCardFlip(holding.id)} fullWidth>History</Button>
											</div>
										</CardContent>
									</Card>
								</div>
								
								<!-- Back of card -->
								<div class="absolute inset-0 w-full h-full" style="backface-visibility: hidden; transform: rotateY(180deg);">
									<Card hoverable showBorder>
										<CardContent paddingClass="p-4 sm:p-6 h-full flex flex-col">
											<div class="flex justify-between items-start mb-4">
												<div>
													<h4 class="font-extrabold text-black text-base">{holding.asset.name}</h4>
												</div>
												<Button variant="secondary" size="small" on:click={() => toggleCardFlip(holding.id)}>Back</Button>
											</div>
											
											{#if payoutData && payoutData.length > 0}
												{@const cumulativeData = payoutData.reduce((acc: Array<{label: string; value: number}>, d, i) => {
													const prevTotal = i > 0 ? acc[i-1].value : 0;
													acc.push({ label: d.date, value: prevTotal + d.value });
													return acc;
												}, [] as Array<{label: string; value: number}>)}
												
												<div class="flex-1 space-y-4">
													<!-- Monthly Payouts Chart -->
													<div>
														<h5 class="text-xs font-bold text-black opacity-70 uppercase tracking-wider mb-2">Monthly Payouts</h5>
														<Chart
															data={payoutData.map(d => ({ label: d.date, value: d.value }))}
															width={300}
															height={120}
															barColor="#08bccc"
															valuePrefix="$"
															animate={true}
															showGrid={true}
														/>
													</div>
													
													<!-- Cumulative Payouts Chart -->
													<div>
														<h5 class="text-xs font-bold text-black opacity-70 uppercase tracking-wider mb-2">Cumulative Returns</h5>
														<Chart
															data={cumulativeData}
															width={300}
															height={120}
															barColor="#08bccc"
															valuePrefix="$"
															animate={true}
															showGrid={true}
															horizontalLine={{
																value: holding.invested,
																label: 'Breakeven',
																color: '#283c84'
															}}
														/>
													</div>
												</div>
											{:else}
												<div class="flex-1 flex items-center justify-center text-center text-black opacity-70">
													<div>
														<div class="text-3xl mb-2">📊</div>
														<div class="text-sm">No payout history available yet</div>
													</div>
												</div>
											{/if}
										</CardContent>
									</Card>
								</div>
							</div>
						</div>
					{/each}
				{/if}
			</div>
			
			<!-- Mobile: Collapsible Performance Section -->
			<div class="mt-8">
				<CollapsibleSection title="Performance Analysis" isOpenByDefault={false} alwaysOpenOnDesktop={false}>
					<div class="grid grid-cols-2 gap-4 mb-6">
						<StatsCard
							title="Portfolio Value"
							value={formatCurrency(totalInvested)}
							subtitle="Total invested"
							size="medium"
						/>
						<StatsCard
							title="Total Earned"
							value={formatCurrency(totalPayoutsEarned)}
							subtitle="All payouts"
							size="medium"
							valueColor="primary"
						/>
						<StatsCard
							title="Active Assets"
							value={activeAssetsCount.toString()}
							subtitle="In portfolio"
							size="medium"
						/>
						<StatsCard
							title="Unclaimed"
							value={formatCurrency(unclaimedPayout)}
							subtitle="Available to claim"
							size="medium"
							valueColor="primary"
						/>
					</div>
					
					<p class="text-sm text-gray-600">Detailed performance charts and analysis available on desktop.</p>
				</CollapsibleSection>
			</div>
			
			<!-- Mobile: Collapsible Allocation Section -->
			<div class="mt-4">
				<CollapsibleSection title="Portfolio Allocation" isOpenByDefault={false} alwaysOpenOnDesktop={false}>
					<div class="space-y-3">
						{#each holdings as holding}
							{@const allocationPercentage = totalInvested > 0 ? (holding.invested / totalInvested) * 100 : 0}
							<div class="flex justify-between items-center p-3 bg-light-gray rounded">
								<div>
									<div class="font-semibold text-sm">{holding.tokenSymbol}</div>
									<div class="text-xs text-gray-600">{holding.asset.name}</div>
								</div>
								<div class="text-right">
									<div class="font-bold text-sm">{allocationPercentage.toFixed(1)}%</div>
									<div class="text-xs text-gray-600">{formatCurrency(holding.invested, { compact: true })}</div>
								</div>
							</div>
						{/each}
					</div>
				</CollapsibleSection>
			</div>
		</div>
		
		<!-- Desktop: Tab content -->
		<div class="hidden lg:block p-8">
			{#if activeTab === 'overview'}
				<SectionTitle level="h3" size="subsection" className="mb-6">My Holdings</SectionTitle>
				
				<div class="space-y-3">
					{#if pageLoading}
						<div class="text-center py-12 text-black opacity-70">Loading portfolio holdings...</div>
					{:else if holdings.length === 0}
						<div class="text-center py-12 text-black opacity-70">
							<p class="mb-4">No holdings yet</p>
							<Button variant="primary" href="/assets">Browse Assets</Button>
						</div>
					{:else}
						{#each holdings as holding}
							{@const flipped = $flippedCards.has(holding.id)}
							{@const payoutData = flipped ? getPayoutChartData(holding) : []}
							<div class="mb-3" style="perspective: 1000px;">
								<div class="relative w-full transition-transform duration-500" style="transform-style: preserve-3d; transform: rotateY({flipped ? 180 : 0}deg); height: 360px;">
									<!-- Front of card -->
									<div class="absolute inset-0 w-full h-full" style="backface-visibility: hidden;">
										<Card hoverable showBorder>
											<CardContent paddingClass="p-9 h-full flex flex-col justify-between">
												<div class="flex justify-between items-start mb-7">
													<div class="flex items-start gap-4">
														<div class="w-14 h-14 bg-light-gray rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
															{#if holding.asset?.coverImage}
																<img src={`${PINATA_GATEWAY}/${holding.asset.coverImage}`} alt={holding.asset.name} class="w-full h-full object-cover" />
															{:else}
																<div class="text-2xl opacity-50">🛢️</div>
															{/if}
														</div>
														<div class="text-left">
															<h4 class="font-extrabold text-black text-lg mb-1">
																{holding.tokenSymbol}
															</h4>
															<div class="text-sm text-black opacity-70 mb-1">{holding.asset.name}</div>
															<div class="text-xs text-black opacity-70 mb-2">{holding.asset.location?.state || ''}, {holding.asset.location?.country || ''}</div>
															<StatusBadge 
																status={holding.status} 
																variant={holding.status === 'producing' ? 'available' : 'default'}
															/>
														</div>
													</div>

													<div class="flex gap-2">
														<Button variant="secondary" size="small" href="/claims">Claims</Button>
														<Button variant="secondary" size="small" on:click={() => toggleCardFlip(holding.id)}>History</Button>
													</div>
												</div>

												<div class="grid grid-cols-5 gap-4 mt-4">
													<!-- Tokens -->
													<div class="pr-6 flex flex-col">
														<div class="text-sm font-bold text-black opacity-70 uppercase tracking-wider mb-4 h-10 flex items-start">Tokens</div>
														<div class="text-xl font-extrabold text-black mb-3">{formatNumber(holding.tokensOwned)}</div>
														<div class="text-sm text-black opacity-70">
															<FormattedNumber value={holding.invested} type="currency" compact={holding.invested >= 10000} />
														</div>
													</div>

													<!-- Payouts to Date -->
													<div class="flex flex-col">
														<div class="text-sm font-bold text-black opacity-70 uppercase tracking-wider mb-4 h-10 flex items-start">Payouts to Date</div>
														<div class="text-xl font-extrabold text-primary mb-3">{formatCurrency(holding.earned)}</div>
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
														<div class="text-xl font-extrabold text-black mb-3">{formatPercentage(holding.capitalReturned / 100, { decimals: 3 })}</div>
														<div class="text-sm text-black opacity-70">To Date</div>
														{#if isTooltipVisible('capital-returned-' + holding.id)}
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
														{#if isTooltipVisible('depletion-' + holding.id)}
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
															{formatCurrency(holding.unrecoveredCapital > 0 ? holding.unrecoveredCapital : holding.earned - holding.invested)}
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
									<div class="absolute inset-0 w-full h-full" style="backface-visibility: hidden; transform: rotateY(180deg);">
										<Card hoverable showBorder>
											<CardContent paddingClass="p-8 h-full flex flex-col">
												<div class="flex justify-between items-start mb-2">
													<div>
														<h4 class="font-extrabold text-black text-lg">{holding.asset.name}</h4>
													</div>
													<Button variant="secondary" size="small" on:click={() => toggleCardFlip(holding.id)}>Back</Button>
												</div>
												
												<div class="flex-1 flex gap-6">
													{#if payoutData && payoutData.length > 0}
														{@const cumulativeData = payoutData.reduce((acc: Array<{label: string; value: number}>, d, i) => {
															const prevTotal = i > 0 ? acc[i-1].value : 0;
															acc.push({ label: d.date, value: prevTotal + d.value });
															return acc;
														}, [] as Array<{label: string; value: number}>)}
														<!-- Monthly Payouts Chart -->
														<div class="flex-1">
															<h5 class="text-sm font-bold text-black opacity-70 uppercase tracking-wider mb-1">Monthly Payouts</h5>
															<Chart
																data={payoutData.map(d => ({ label: d.date, value: d.value }))}
																width={400}
																height={220}
																barColor="#08bccc"
																valuePrefix="$"
																animate={true}
																showGrid={true}
															/>
														</div>
														
														<!-- Cumulative Payouts Chart -->
														<div class="flex-1">
															<h5 class="text-sm font-bold text-black opacity-70 uppercase tracking-wider mb-1">Cumulative Returns</h5>
															<Chart
																data={cumulativeData}
																width={400}
																height={220}
																barColor="#08bccc"
																valuePrefix="$"
																animate={true}
																showGrid={true}
																horizontalLine={{
																	value: holding.invested,
																	label: 'Breakeven',
																	color: '#283c84'
																}}
															/>
														</div>
													{:else}
														<div class="flex-1 flex items-center justify-center text-center text-black opacity-70">
															<div>
																<div class="text-4xl mb-2">📊</div>
																<div>No payout history available yet</div>
															</div>
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
				<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<!-- Performance Charts -->
					<div class="lg:col-span-2 bg-white border border-light-gray rounded-lg p-6">
						<h4 class="text-lg font-extrabold text-black mb-4">Cash Flow Analysis</h4>
						<div class="text-center py-20 text-black opacity-70">
							No transaction data available
						</div>
					</div>

					<!-- Metrics Cards -->
					<div class="space-y-4">
						<div class="bg-white border border-light-gray rounded-lg p-4">
							<div class="text-sm font-bold text-black opacity-70 uppercase tracking-wider mb-2">Total Invested</div>
							<div class="text-xl font-extrabold text-black mb-1">{formatCurrency(totalInvested)}</div>
							<div class="text-xs text-black opacity-70">Across all assets</div>
						</div>
						
						<div class="bg-white border border-light-gray rounded-lg p-4">
							<div class="text-sm font-bold text-black opacity-70 uppercase tracking-wider mb-2">Total Earned</div>
							<div class="text-xl font-extrabold text-primary mb-1">{formatCurrency(totalPayoutsEarned)}</div>
							<div class="text-xs text-black opacity-70">All payouts</div>
						</div>
						
						<div class="bg-white border border-light-gray rounded-lg p-4">
							<div class="text-sm font-bold text-black opacity-70 uppercase tracking-wider mb-2">Net Position</div>
							<div class="text-xl font-extrabold {totalPayoutsEarned - totalInvested >= 0 ? 'text-green-600' : 'text-red-600'} mb-1">
								{formatCurrency(totalPayoutsEarned - totalInvested)}
							</div>
							<div class="text-xs text-black opacity-70">Total Payouts - Total Invested</div>
						</div>
					</div>
				</div>
			{:else if activeTab === 'allocation'}
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<div>
						<SectionTitle level="h3" size="subsection" className="mb-6">Asset Allocation</SectionTitle>
						<div class="bg-white border border-light-gray rounded-lg p-6 flex items-center justify-center">
							{#if tokenAllocations.length > 0}
								<PieChart
									data={tokenAllocations.map(allocation => ({
										label: allocation.assetName,
										value: allocation.currentValue,
										percentage: allocation.percentageOfPortfolio
									}))}
									width={280}
									height={280}
									showLabels={true}
									showLegend={false}
									animate={false}
								/>
							{:else}
								<div class="text-center py-12 text-black opacity-70">
									No portfolio data available
								</div>
							{/if}
						</div>
					</div>

					<div>
						<SectionTitle level="h3" size="subsection" className="mb-6">Allocation Breakdown</SectionTitle>
						<div class="space-y-4 mb-8">
							{#each tokenAllocations as allocation}
								<div class="flex justify-between items-center pb-4 border-b border-light-gray last:border-b-0 last:pb-0">
									<div class="flex items-center gap-3">
										<div class="w-8 h-8 bg-light-gray rounded overflow-hidden flex items-center justify-center">
											<div class="text-base opacity-50">🛢️</div>
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
					</div>
				</div>
			{/if}
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