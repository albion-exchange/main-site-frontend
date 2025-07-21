<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { useAssetService, useTokenService } from '$lib/services';
	import walletDataService from '$lib/services/WalletDataService';
	import type { Asset, Token } from '$lib/types/uiTypes';
	import { web3Modal, signerAddress, connected, loading } from 'svelte-wagmi';
	import { Card, CardContent, CardActions, PrimaryButton, SecondaryButton, StatusBadge, TabNavigation, StatsCard, SectionTitle, ActionCard, TabButton, Chart, BarChart, PieChart, CollapsibleSection } from '$lib/components/components';
	import { PageLayout, HeroSection, ContentSection, FullWidthSection } from '$lib/components/layout';
	import { formatCurrency, formatPercentage, formatNumber, formatSmartNumber } from '$lib/utils/formatters';
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
	let pageLoading = true;
	
	// Use composables
	const { show: showTooltipWithDelay, hide: hideTooltip, isVisible: isTooltipVisible } = useTooltip();
	const { toggle: toggleCardFlip, flippedCards } = useCardFlip();
	
	// Use services
	const assetService = useAssetService();
	const tokenService = useTokenService();
	
	function getPayoutChartData(holding: any): Array<{date: string; value: number}> {
		// Get payout history for this specific asset
		const assetPayouts = walletDataService.getHoldingsByAsset();
		const assetPayout = assetPayouts.find(p => p.assetId === holding.id);
		
		if (!assetPayout || !assetPayout.monthlyPayouts || assetPayout.monthlyPayouts.length === 0) {
			return [];
		}
		
		// Convert monthly payouts to chart data format
		const chartData = assetPayout.monthlyPayouts
			.filter(p => p.amount > 0)
			.map(p => ({
				date: p.month + '-01', // Convert YYYY-MM to YYYY-MM-DD for date parsing
				value: p.amount
			}))
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
		
		return chartData;
	}

	onMount(async () => {
		// Check if wallet is connected
		if (!$connected || !$signerAddress) {
			$web3Modal.open();
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
			const allAssets = assetService.getAllAssets();
			const allTokens = tokenService.getAllTokens();
			
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
				
				// Calculate asset depletion = production so far / (production so far + expected remaining production)
				let assetDepletion = 0;
				
				// Calculate cumulative production from token data, not asset production history
				let cumulativeProduction = 0;
				
				// Find tokens for this asset and sum their payoutHistory production
				const assetTokens = allTokens.filter(token => token.assetId === asset.id);
				
				if (assetTokens.length > 0) {
					// Use the first token's payout history as they should all have the same production data
					const token = assetTokens[0];
					if (token.payoutHistory && token.payoutHistory.length > 0) {
						cumulativeProduction = token.payoutHistory.reduce((sum, payout) => sum + (payout.productionVolume || 0), 0);
					}
				}
				
				// Fallback to asset monthlyReports if no token data
				if (cumulativeProduction === 0 && asset.monthlyReports && asset.monthlyReports.length > 0) {
					cumulativeProduction = asset.monthlyReports.reduce((sum, report) => sum + (report.production || 0), 0);
				}
				
				// Parse expected remaining production from string format (e.g., "250k BOE" -> 250000)
				let expectedRemainingProduction = 0;
				if (asset.production?.expectedRemainingProduction && asset.production.expectedRemainingProduction !== 'TBD') {
					const match = asset.production.expectedRemainingProduction.match(/^([\d.]+)k\s*boe$/i);
					if (match) {
						expectedRemainingProduction = parseFloat(match[1]) * 1000;
					}
				}
				
				// Calculate depletion percentage
				// Depletion = (production so far) / (production so far + expected remaining production)
				const totalExpectedProduction = cumulativeProduction + expectedRemainingProduction;
				if (totalExpectedProduction > 0 && cumulativeProduction > 0) {
					assetDepletion = (cumulativeProduction / totalExpectedProduction) * 100;
				}
				
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
			
			pageLoading = false;
		} catch (error) {
			console.error('Error loading portfolio data:', error);
			pageLoading = false;
		}
	}

	function getCurrentTime(): string {
		return new Date().toLocaleTimeString();
	}
	
	function formatDate(dateStr: string): string {
		if (!dateStr) return 'Never';
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}
	
	async function handleWalletConnect() {
		pageLoading = true;
		loadPortfolioData();
	}
	
	function handleWalletModalClose() {
		if (!$connected || !$signerAddress) {
			window.location.href = '/';
		}
	}

	onDestroy(() => {
		// Cleanup handled by composables
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
				<PrimaryButton on:click={() => $web3Modal.open()}>
					Connect Wallet
				</PrimaryButton>
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
			{#if loading}
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
				{#if loading}
					<div class="text-center py-8 text-black opacity-70">Loading portfolio holdings...</div>
				{:else}
					{#each holdings as holding}
						<Card hoverable showBorder>
							<CardContent paddingClass="p-4 sm:p-6">
								<div class="flex items-start gap-3 mb-4">
									<div class="w-12 h-12 bg-light-gray rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
										{#if holding.asset?.coverImage}
											<img src={holding.asset.coverImage} alt={holding.name} class="w-full h-full object-cover" />
										{:else}
											<div class="text-xl opacity-50">🛢️</div>
										{/if}
									</div>
									<div class="flex-1">
										<h4 class="font-extrabold text-black text-base mb-1">{holding.tokenSymbol}</h4>
										<div class="text-sm text-black opacity-70 mb-1">{holding.name}</div>
										<StatusBadge
											status={holding.status}
											variant={holding.status === 'producing' ? 'available' : 'default'}
											size="small"
										/>
									</div>
									<div class="text-right">
										<div class="text-lg font-extrabold text-primary">{formatCurrency(holding.totalPayoutsEarned)}</div>
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
										<div class="text-sm font-extrabold text-black">{formatCurrency(holding.totalInvested)}</div>
									</div>
								</div>
								
															<div class="flex gap-2">
								<SecondaryButton size="small" href="/claims" fullWidth>Claims</SecondaryButton>
								<SecondaryButton size="small" href="/assets/{holding.assetId}#returns-chart" fullWidth>History</SecondaryButton>
							</div>
							</CardContent>
						</Card>
					{/each}
				{/if}
			</div>
			
			<!-- Mobile: Collapsible Performance Section -->
			<div class="mt-8">
				<CollapsibleSection title="Performance Analysis" isOpenByDefault={false} alwaysOpenOnDesktop={false}>
					{@const allTransactions = walletDataService.getAllTransactions()}
					{@const recentPerformance = allTransactions.filter(tx => {
						const txDate = new Date(tx.timestamp);
						const monthsAgo = new Date();
						monthsAgo.setMonth(monthsAgo.getMonth() - 3);
						return txDate >= monthsAgo;
					})}
					
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
							{@const allocationPercentage = totalInvested > 0 ? (holding.totalInvested / totalInvested) * 100 : 0}
							<div class="flex justify-between items-center p-3 bg-light-gray rounded">
								<div>
									<div class="font-semibold text-sm">{holding.tokenSymbol}</div>
									<div class="text-xs text-gray-600">{holding.name}</div>
								</div>
								<div class="text-right">
									<div class="font-bold text-sm">{allocationPercentage.toFixed(1)}%</div>
									<div class="text-xs text-gray-600">{formatCurrency(holding.totalInvested, { compact: true })}</div>
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
						{#if loading}
							<div class="text-center py-12 text-black opacity-70">Loading portfolio holdings...</div>
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
															<div class="text-xl font-extrabold text-black mb-3">{formatNumber(holding.tokensOwned)}</div>
			<div class="text-sm text-black opacity-70">{formatCurrency(Math.round(holding.totalInvested), { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
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
												<div class="text-xl font-extrabold text-black mb-3">{formatPercentage(holding.capitalReturned / 100, { decimals: 1 })}</div>
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
										<div class="absolute inset-0 w-full h-full" style="backface-visibility: hidden; transform: rotateY(180deg);">
											<Card hoverable showBorder>
												<CardContent paddingClass="p-8 h-full flex flex-col">
												<div class="flex justify-between items-start mb-2">
													<div>
														<h4 class="font-extrabold text-black text-lg">{holding.name}</h4>
													</div>
													<SecondaryButton size="small" on:click={() => toggleCardFlip(holding.id)}>Back</SecondaryButton>
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
																	value: holding.totalInvested,
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
					{@const allTransactions = walletDataService.getAllTransactions()}
					{@const capitalWalkData = (() => {
						// Group transactions by month and calculate values
						const monthlyData = new Map();
						const monthlyPurchases = new Map();
						const monthlyPayouts = new Map();
						let cumulativePurchases = 0;
						let cumulativePayouts = 0;
						let maxDeficit = 0;
						let houseMoneyCrossDate: string | null = null;
						
						// Sort transactions by date
						const sortedTx = [...allTransactions].sort((a, b) => 
							new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
						);
						
						// Process each transaction
						sortedTx.forEach(tx => {
							const date = new Date(tx.timestamp);
							const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
							
							// Track monthly values
							if (tx.type === 'mint') {
								monthlyPurchases.set(monthKey, (monthlyPurchases.get(monthKey) || 0) + tx.amountUSD);
								cumulativePurchases += tx.amountUSD;
							} else if (tx.type === 'claim') {
								const amount = tx.amountUSD || tx.amount;
								monthlyPayouts.set(monthKey, (monthlyPayouts.get(monthKey) || 0) + amount);
								cumulativePayouts += amount;
							}
							
							// Net position: payouts minus purchases (starts negative, improves with payouts)
							const netPosition = cumulativePayouts - cumulativePurchases;
							maxDeficit = Math.max(maxDeficit, Math.abs(netPosition)); // Track absolute value of deficit
							
							// Check for first zero crossing (when we've recovered all capital)
							if (netPosition >= 0 && !houseMoneyCrossDate && cumulativePurchases > 0) {
								houseMoneyCrossDate = date.toISOString();
							}
							
							// Store cumulative data
							monthlyData.set(monthKey, {
								date: `${monthKey}-01`,
								cumulativePurchases,
								cumulativePayouts,
								netPosition,
								monthlyPurchase: monthlyPurchases.get(monthKey) || 0,
								monthlyPayout: monthlyPayouts.get(monthKey) || 0
							});
						});
						
						// Get the range of months from first to last transaction
						const dates = Array.from(monthlyData.keys()).sort();
						const dataArray = [];
						
						if (dates.length > 0) {
							const startDate = new Date(dates[0] + '-01');
							const endDate = new Date(dates[dates.length - 1] + '-01');
							
							// Fill in all months from start to end
							let currentDate = new Date(startDate);
							let runningPurchases = 0;
							let runningPayouts = 0;
							
							while (currentDate <= endDate) {
								const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
								const monthData = monthlyData.get(monthKey);
								
								if (monthData) {
									runningPurchases = monthData.cumulativePurchases;
									runningPayouts = monthData.cumulativePayouts;
									dataArray.push(monthData);
								} else {
									// Fill in missing month with zero monthly values but correct cumulative
									dataArray.push({
										date: `${monthKey}-01`,
										cumulativePurchases: runningPurchases,
										cumulativePayouts: runningPayouts,
										netPosition: runningPayouts - runningPurchases,
										monthlyPurchase: 0,
										monthlyPayout: 0
									});
								}
								
								// Move to next month
								currentDate.setMonth(currentDate.getMonth() + 1);
							}
						}
						
						return {
							chartData: dataArray,
							totalExternalCapital: maxDeficit,
							houseMoneyCrossDate,
							grossDeployed: totalInvested, // Use the same value as top of page
							grossPayout: totalPayoutsEarned // Use the same value as top of page
						};
					})()}
					
					<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
						<!-- Capital Walk Chart -->
						<div class="lg:col-span-2 bg-white border border-light-gray rounded-lg p-6">
							<h4 class="text-lg font-extrabold text-black mb-4">Cash Flow Analysis</h4>
							<div class="space-y-6">
								<!-- Combined Monthly Cash Flows -->
								<div>
									<h5 class="text-sm font-bold text-black opacity-70 uppercase tracking-wider mb-3">Monthly Cash Flows</h5>
									{#if capitalWalkData.chartData.length > 0}
										<BarChart
											data={capitalWalkData.chartData.map(d => ({
												label: d.date,
												value: -d.monthlyPurchase // Negative for purchases
											}))}
											data2={capitalWalkData.chartData.map(d => ({
												label: d.date,
												value: d.monthlyPayout
											}))}
											width={640}
											height={300}
											barColor="#283c84"
											barColor2="#08bccc"
											valuePrefix="$"
											animate={true}
											showGrid={true}
											series1Name="Purchases"
											series2Name="Payouts"
										/>
									{:else}
										<div class="text-center py-20 text-black opacity-70">
											No transaction data available
										</div>
									{/if}
								</div>
								
								<!-- Net Position Line Chart -->
								<div>
									<h5 class="text-sm font-bold text-black opacity-70 uppercase tracking-wider mb-3">Current Net Position (Cumulative)</h5>
									{#if capitalWalkData.chartData.length > 0}
										<Chart
											data={capitalWalkData.chartData.map(d => ({
												label: d.date,
												value: d.netPosition
											}))}
											width={640}
											height={250}
											barColor="#ff6b6b"
											valuePrefix="$"
											animate={true}
											showGrid={true}
											showAreaFill={false}
										/>
									{:else}
										<div class="text-center py-10 text-black opacity-70">
											No transaction data available
										</div>
									{/if}
								</div>
							</div>
						</div>

						<!-- Metrics Cards -->
						<div class="space-y-4">
							<div class="bg-white border border-light-gray rounded-lg p-4 relative overflow-hidden">
								<div class="text-sm font-bold text-black opacity-70 uppercase tracking-wider mb-2">Total External Capital</div>
								<div class="text-xl font-extrabold text-black mb-1 break-all">{formatCurrency(capitalWalkData.totalExternalCapital)}</div>
								<div class="text-xs text-black opacity-70">Peak cash required</div>
								<!-- Tooltip icon -->
								<div 
									class="absolute top-4 right-4 w-4 h-4 rounded-full bg-light-gray text-black text-xs flex items-center justify-center cursor-help"
									on:mouseenter={() => showTooltipWithDelay('external-capital')}
									on:mouseleave={hideTooltip}
									on:focus={() => showTooltipWithDelay('external-capital')}
									on:blur={hideTooltip}
									role="button"
									tabindex="0"
									aria-label="More information about Total External Capital"
								>
									?
								</div>
								{#if isTooltipVisible('external-capital')}
									<div class="absolute right-0 top-10 bg-black text-white p-4 rounded text-xs z-10 w-56">
										Max cash you ever had to supply from outside, assuming payouts were available for reinvestment
									</div>
								{/if}
							</div>
							
							<div class="bg-white border border-light-gray rounded-lg p-4 relative overflow-hidden">
								<div class="text-sm font-bold text-black opacity-70 uppercase tracking-wider mb-2">Gross Deployed</div>
								<div class="text-xl font-extrabold text-black mb-1 break-all">{formatCurrency(capitalWalkData.grossDeployed)}</div>
								<div class="text-xs text-black opacity-70">Total invested</div>
								<!-- Tooltip icon -->
								<div 
									class="absolute top-4 right-4 w-4 h-4 rounded-full bg-light-gray text-black text-xs flex items-center justify-center cursor-help"
									on:mouseenter={() => showTooltipWithDelay('gross-deployed')}
									on:mouseleave={hideTooltip}
									on:focus={() => showTooltipWithDelay('gross-deployed')}
									on:blur={hideTooltip}
									role="button"
									tabindex="0"
									aria-label="More information about Gross Deployed"
								>
									?
								</div>
								{#if isTooltipVisible('gross-deployed')}
									<div class="absolute right-0 top-10 bg-black text-white p-3 rounded text-xs z-10 w-48">
										Total amount invested across all assets
									</div>
								{/if}
							</div>
							
							<div class="bg-white border border-light-gray rounded-lg p-4 relative overflow-hidden">
								<div class="text-sm font-bold text-black opacity-70 uppercase tracking-wider mb-2">Gross Payout</div>
								<div class="text-xl font-extrabold text-primary mb-1 break-all">{formatCurrency(capitalWalkData.grossPayout)}</div>
								<div class="text-xs text-black opacity-70">Total distributions</div>
								<!-- Tooltip icon -->
								<div 
									class="absolute top-4 right-4 w-4 h-4 rounded-full bg-light-gray text-black text-xs flex items-center justify-center cursor-help"
									on:mouseenter={() => showTooltipWithDelay('gross-payout')}
									on:mouseleave={hideTooltip}
									on:focus={() => showTooltipWithDelay('gross-payout')}
									on:blur={hideTooltip}
									role="button"
									tabindex="0"
									aria-label="More information about Gross Payout"
								>
									?
								</div>
								{#if isTooltipVisible('gross-payout')}
									<div class="absolute right-0 top-10 bg-black text-white p-3 rounded text-xs z-10 w-48">
										Total distributions received from all assets
									</div>
								{/if}
							</div>
							
							<div class="bg-white border border-light-gray rounded-lg p-4 relative overflow-hidden">
								<div class="text-sm font-bold text-black opacity-70 uppercase tracking-wider mb-2">Current Net Position</div>
								<div class="text-xl font-extrabold {capitalWalkData.grossPayout - capitalWalkData.grossDeployed >= 0 ? 'text-green-600' : 'text-red-600'} mb-1 break-all">
									{formatCurrency(capitalWalkData.grossPayout - capitalWalkData.grossDeployed)}
								</div>
								<div class="text-xs text-black opacity-70">Total Payouts - Total Invested</div>
								<!-- Tooltip icon -->
								<div 
									class="absolute top-4 right-4 w-4 h-4 rounded-full bg-light-gray text-black text-xs flex items-center justify-center cursor-help"
									on:mouseenter={() => showTooltipWithDelay('realised-profit')}
									on:mouseleave={hideTooltip}
									on:focus={() => showTooltipWithDelay('realised-profit')}
									on:blur={hideTooltip}
									role="button"
									tabindex="0"
									aria-label="More information about Current Net Position"
								>
									?
								</div>
								{#if isTooltipVisible('realised-profit')}
									<div class="absolute right-0 top-10 bg-black text-white p-3 rounded text-xs z-10 w-48">
										Your current profit/loss position accounting for all investments and payouts received
									</div>
								{/if}
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
									{@const allocationAsset = assetService.getAssetById(allocation.assetId)}
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

<style>
	/* CSS classes removed - styles are now inline for better browser compatibility */
</style>