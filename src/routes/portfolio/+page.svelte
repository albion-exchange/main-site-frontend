<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import dataStoreService from '$lib/services/DataStoreService';
	import walletDataService from '$lib/services/WalletDataService';
	import type { Asset, Token } from '$lib/types/uiTypes';
	import { walletStore, walletActions } from '$lib/stores/wallet';
	import WalletModal from '$lib/components/WalletModal.svelte';
	import { Card, CardContent, CardActions, PrimaryButton, SecondaryButton, Metric, StatusBadge, TabNavigation, MetricDisplay, StatsCard, SectionTitle, ActionCard, TabButton } from '$lib/components/ui';
	import { PageLayout, HeroSection, ContentSection } from '$lib/components/layout';
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
	>
		<!-- Platform Stats -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-6xl mx-auto mb-12">
			{#if loading}
				<StatsCard
					title="Total Invested"
					value="--"
					subtitle="Loading..."
					size="large"
				/>
				<StatsCard
					title="Payouts Earned"
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
					title="Payouts Earned"
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
	<ContentSection background="white" padding="standard">
		<div class="bg-white border border-light-gray rounded-lg overflow-hidden">
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
					
					<div class="space-y-6">
						{#if loading}
							<div class="text-center py-12 text-black opacity-70">Loading portfolio holdings...</div>
						{:else}
							{#each holdings as holding}
								<Card hoverable showBorder>
									<CardContent paddingClass="p-8">
										<div class="grid grid-cols-1 md:grid-cols-4 gap-6 items-center mb-6">
											<div class="flex items-center gap-4">
												<div class="w-12 h-12 bg-light-gray rounded-lg overflow-hidden flex items-center justify-center">
													<img src={getAssetCoverImage(holding.id)} alt={holding.name} class="w-full h-full object-cover" />
												</div>
												<div>
													<h4 class="font-extrabold text-black text-sm mb-1">{holding.name}</h4>
													<div class="text-xs text-black opacity-70 mb-2">{holding.location}</div>
													<StatusBadge 
														status={holding.status} 
														variant={holding.status === 'producing' ? 'available' : 'default'}
													/>
												</div>
											</div>

											<div class="text-center">
												<div class="text-lg font-extrabold text-black mb-1">{formatCurrency(holding.totalInvested)}</div>
												<div class="text-xs font-bold text-black opacity-70 uppercase tracking-wide">Invested</div>
											</div>

											<div class="text-center">
												<div class="text-lg font-extrabold text-primary mb-1">{formatCurrency(holding.totalPayoutsEarned)}</div>
												<div class="text-xs font-bold text-black opacity-70 uppercase tracking-wide">Earned</div>
											</div>

											<div class="flex gap-2">
												<SecondaryButton size="small" href="/claims">Claims</SecondaryButton>
												<SecondaryButton size="small" on:click={() => alert('Payout history chart coming soon!')}>History</SecondaryButton>
											</div>
										</div>

										<div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-light-gray">
											<div class="flex justify-between items-center">
												<span class="text-sm text-black opacity-70 font-semibold">Unclaimed:</span>
												<span class="text-sm font-extrabold text-primary">{formatCurrency(holding.unclaimedAmount)}</span>
											</div>
											<div class="flex justify-between items-center">
												<span class="text-sm text-black opacity-70 font-semibold">Last Payout:</span>
												<span class="text-sm font-extrabold text-black">{holding.lastPayoutDate ? new Date(holding.lastPayoutDate).toLocaleDateString() : 'N/A'}</span>
											</div>
											<div class="flex justify-between items-center">
												<span class="text-sm text-black opacity-70 font-semibold">Status:</span>
												<span class="text-sm font-extrabold text-primary">Active</span>
											</div>
										</div>
									</CardContent>
								</Card>
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
									<div class="flex justify-between items-center pb-4 border-b border-light-gray last:border-b-0 last:pb-0">
										<div class="flex items-center gap-3">
											<div class="w-8 h-8 bg-light-gray rounded overflow-hidden flex items-center justify-center">
												<img src={getAssetCoverImage(allocation.assetId)} alt={allocation.assetName} class="w-full h-full object-cover" />
											</div>
											<div>
												<div class="font-extrabold text-black text-sm">{allocation.assetName}</div>
												<div class="text-xs text-black opacity-70">{allocation.tokensOwned} tokens</div>
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
	<ContentSection background="gray" padding="standard" centered>
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
	</ContentSection>
</PageLayout>
{/if}

<!-- Wallet Modal -->
<WalletModal
	bind:isOpen={showWalletModal}
	isConnecting={$walletStore.isConnecting}
	on:connect={handleWalletConnect}
	on:close={handleWalletModalClose}
/>

