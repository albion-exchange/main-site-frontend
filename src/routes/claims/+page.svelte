<script lang="ts">
	import { onMount } from 'svelte';
	import dataStoreService from '$lib/services/DataStoreService';
	import type { Asset } from '$lib/types/uiTypes';
	import { walletStore, walletActions } from '$lib/stores/wallet';
	import WalletModal from '$lib/components/WalletModal.svelte';
	import marketData from '$lib/data/marketData.json';
	import { getMockPortfolioHoldings, calculatePortfolioSummary } from '$lib/utils/portfolioCalculations';
	import SectionTitle from '$lib/components/ui/SectionTitle.svelte';
	import MetricDisplay from '$lib/components/ui/MetricDisplay.svelte';
	import GridContainer from '$lib/components/ui/GridContainer.svelte';
	import TabButton from '$lib/components/ui/TabButton.svelte';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';
	import SecondaryButton from '$lib/components/ui/SecondaryButton.svelte';
	import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
	import { PageLayout, HeroSection, ContentSection } from '$lib/components/layout';

	let totalEarned = 0;
	let totalClaimed = 0;
	let unclaimedPayout = 0;
	let loading = true;
	let claiming = false;
	let claimSuccess = false;
	let selectedAssets: string[] = [];
	let claimMethod = 'wallet';
	let isAccruing = true;
	let showWalletModal = false;
	let activeHistoryTab = 'recent';

	// Mock portfolio data based on real assets
	const mockPortfolioBalances = [
		{ assetId: 'europa-wressle-release-1', unclaimedAmount: 487.32, totalEarned: 2847.15, lastPayout: '2024-12-15' },
		{ assetId: 'bakken-horizon-field', unclaimedAmount: 342.18, totalEarned: 2156.47, lastPayout: '2024-12-10' },
		{ assetId: 'permian-basin-venture', unclaimedAmount: 286.74, totalEarned: 1847.21, lastPayout: '2024-12-20' },
		{ assetId: 'gulf-mexico-deep-water', unclaimedAmount: 131.58, totalEarned: 1621.32, lastPayout: '2024-12-05' }
	];

	let holdings: any[] = [];

	const claimHistory = [
		{ date: '2024-12-15', amount: 487.32, asset: 'Europa Wressle Release 1', txHash: '0x7d8f...a2b1', status: 'completed' },
		{ date: '2024-12-10', amount: 342.18, asset: 'Bakken Horizon Field', txHash: '0x9c3e...f5d2', status: 'completed' },
		{ date: '2024-11-15', amount: 456.89, asset: 'Europa Wressle Release 1', txHash: '0x2f1a...c7e3', status: 'completed' },
		{ date: '2024-11-10', amount: 298.45, asset: 'Bakken Horizon Field', txHash: '0x8b4d...x9f4', status: 'completed' },
		{ date: '2024-10-20', amount: 312.67, asset: 'Permian Basin Venture', txHash: '0x5e2c...b8a5', status: 'completed' }
	];

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
			totalEarned = summary.totalEarned;
			totalClaimed = summary.totalClaimed;
			unclaimedPayout = summary.unclaimedPayout;
			
			// Load real assets and create portfolio holdings
			const allAssets = dataStoreService.getAllAssets();
			
			holdings = portfolioHoldings.map(balance => {
				const asset = allAssets.find(a => a.id === balance.assetId);
				if (!asset) return null;
				
				return {
					id: asset.id,
					name: asset.name,
					location: `${asset.location.state}, ${asset.location.country}`,
					unclaimedAmount: balance.unclaimedAmount,
					totalEarned: balance.totalEarned,
					lastPayout: balance.lastPayout,
					currentPayout: asset.monthlyReports.length > 0 ? asset.monthlyReports[asset.monthlyReports.length - 1].payoutPerToken : 0,
					status: asset.production.status
				};
			}).filter(Boolean);
			
			loading = false;
			
			// Simulate real-time accrual
			if (isAccruing) {
				setInterval(() => {
					unclaimedPayout += (Math.random() * 0.05 + 0.02);
					totalEarned += (Math.random() * 0.05 + 0.02);
				}, 3000);
			}
		} catch (error) {
			console.error('Error loading claims data:', error);
			loading = false;
		}
	});

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(amount);
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function handleAssetSelect(assetId: string) {
		if (selectedAssets.includes(assetId)) {
			selectedAssets = selectedAssets.filter(id => id !== assetId);
		} else {
			selectedAssets = [...selectedAssets, assetId];
		}
	}

	function handleSelectAll() {
		if (selectedAssets.length === holdings.length) {
			selectedAssets = [];
		} else {
			selectedAssets = holdings.map(holding => holding.id);
		}
	}

	function getSelectedAmount(): number {
		return holdings
			.filter(holding => selectedAssets.includes(holding.id))
			.reduce((sum, holding) => sum + holding.unclaimedAmount, 0);
	}

	async function handleClaim() {
		claiming = true;
		claimSuccess = false;
		
		try {
			// Simulate claim transaction
			await new Promise(resolve => setTimeout(resolve, 2000));
			
			const claimedAmount = getSelectedAmount() || unclaimedPayout;
			totalClaimed += claimedAmount;
			unclaimedPayout = Math.max(0, unclaimedPayout - claimedAmount);
			
			selectedAssets = [];
			claimSuccess = true;
			
			// Reset success message after 3 seconds
			setTimeout(() => {
				claimSuccess = false;
			}, 3000);
			
		} catch (error) {
			console.error('Claim error:', error);
		} finally {
			claiming = false;
		}
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
					
					return {
						id: asset.id,
						name: asset.name,
						location: `${asset.location.state}, ${asset.location.country}`,
						unclaimedAmount: balance.unclaimedAmount,
						totalEarned: balance.totalEarned,
						lastPayout: balance.lastPayout,
						currentPayout: asset.monthlyReports.length > 0 ? asset.monthlyReports[asset.monthlyReports.length - 1].payoutPerToken : 0,
						status: asset.production.status
					};
				}).filter(Boolean);
				
				loading = false;
				
				// Simulate real-time accrual
				if (isAccruing) {
					setInterval(() => {
						unclaimedPayout += (Math.random() * 0.05 + 0.02);
						totalEarned += (Math.random() * 0.05 + 0.02);
					}, 3000);
				}
			} catch (error) {
				console.error('Error loading claims data:', error);
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
	<title>Claim Payouts - Albion</title>
	<meta name="description" content="Claim your oil & gas investment payouts and track earnings history" />
</svelte:head>

{#if !$walletStore.isConnected && !showWalletModal}
	<PageLayout variant="constrained">
		<ContentSection background="white" padding="large" centered>
			<div class="flex items-center justify-center min-h-[60vh]">
			<div>
				<h1 class="text-3xl md:text-2xl font-extrabold text-black uppercase tracking-wider mb-4">Wallet Connection Required</h1>
				<p class="text-base text-black leading-relaxed mb-8">Please connect your wallet to view and claim your payouts.</p>
				<PrimaryButton on:click={() => showWalletModal = true}>
					Connect Wallet
				</PrimaryButton>
			</div>
			</div>
		</ContentSection>
	</PageLayout>
{:else if $walletStore.isConnected}
<PageLayout variant="constrained">
	<!-- Hero Section -->
	<HeroSection 
		title="Claim Payouts"
		subtitle="Claim your earnings from oil & gas investments and track your payout history."
		showBorder={true}
	>
		<div class="inline-flex items-center gap-2 text-sm font-semibold text-black uppercase tracking-wider">
			<div class="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
			<span>Live Tracking: {isAccruing ? 'Active' : 'Paused'}</span>
		</div>
	</HeroSection>

	{#if loading}
		<ContentSection background="white" padding="standard" centered>
			<p class="text-base text-black leading-relaxed">Loading payout information...</p>
		</ContentSection>
	{:else}
		<!-- Success Message -->
		{#if claimSuccess}
			<div class="bg-light-gray border border-primary text-primary p-6 mx-8 my-8 text-center">
				<h3 class="text-xl font-extrabold text-black uppercase tracking-wider mb-2">✅ Claim Successful!</h3>
				<p class="text-base text-black leading-relaxed">Your payouts have been successfully transferred to your wallet.</p>
			</div>
		{/if}

		<!-- Payout Overview -->
		<ContentSection background="white" padding="compact" maxWidth={false}>
			<GridContainer>
				<MetricDisplay 
					value={formatCurrency(totalEarned)}
					label="Total Earned"
					note="All time from investments"
				/>
				<MetricDisplay 
					value={formatCurrency(totalClaimed)}
					label="Total Claimed"
					note="Successfully withdrawn"
				/>
				<MetricDisplay 
					value={formatCurrency(unclaimedPayout)}
					label="Available to Claim"
					note="Ready for withdrawal"
					valueColor="primary"
				/>
			</GridContainer>
		</ContentSection>

		<!-- Quick Claim Section -->
		<ContentSection background="white" padding="compact" maxWidth={false}>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-8 bg-light-gray border border-light-gray p-8 md:p-12">
				<div>
					<h2 class="text-xl font-extrabold text-black uppercase tracking-wider">Quick Claim All</h2>
					<div class="mb-8">
						<div class="text-4xl font-extrabold text-primary mb-2">{formatCurrency(unclaimedPayout)}</div>
						<div class="text-sm text-black font-semibold">Total Available</div>
					</div>
					<div class="flex flex-col gap-2 text-sm">
						<div class="flex justify-between items-center">
							<span class="font-semibold">Estimated Gas:</span>
							<span class="font-extrabold">~${marketData.gasFeesEstimate.medium}</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="font-semibold">Net Amount:</span>
							<span class="text-primary font-extrabold">{formatCurrency(unclaimedPayout - marketData.gasFeesEstimate.medium)}</span>
						</div>
					</div>
				</div>
				
				<div class="flex flex-col gap-4 justify-center">
					<PrimaryButton 
						on:click={handleClaim}
						disabled={claiming || unclaimedPayout <= 0}
					>
						{#if claiming}
							Claiming...
						{:else}
							Claim All {formatCurrency(unclaimedPayout)}
						{/if}
					</PrimaryButton>
					<SecondaryButton>
						Claim & Reinvest
					</SecondaryButton>
				</div>
			</div>
		</ContentSection>

		<!-- Asset-by-Asset Claiming -->
		<ContentSection background="white" padding="standard" maxWidth={false}>
			<div class="flex justify-between items-center">
				<SectionTitle>Claim by Asset</SectionTitle>
				<div class="flex md:flex-row flex-col gap-4">
					<button 
						class="px-6 py-3 font-semibold text-sm uppercase tracking-wider transition-all duration-200 border-2 bg-white text-black border-light-gray hover:bg-light-gray"
						on:click={handleSelectAll}
					>
						{selectedAssets.length === holdings.length ? 'Deselect All' : 'Select All'}
					</button>
					{#if selectedAssets.length > 0}
						<button 
							class="px-6 py-3 font-semibold text-sm uppercase tracking-wider transition-all duration-200 border-2 bg-primary text-white border-primary hover:bg-primary-dark"
							on:click={handleClaim}
							disabled={claiming}
						>
							{#if claiming}
								Claiming...
							{:else}
								Claim Selected {formatCurrency(getSelectedAmount())}
							{/if}
						</button>
					{/if}
				</div>
			</div>

			<div class="flex flex-col gap-4 mt-8">
				{#each holdings as holding}
					<div class="bg-white border border-light-gray p-8 shadow-sm hover:shadow-md transition-shadow duration-200 {selectedAssets.includes(holding.id) ? 'border-primary bg-light-gray' : ''}">
						<div class="grid grid-cols-1 md:grid-cols-[auto_2fr_3fr_auto] gap-4 md:gap-8 items-center mb-4">
							<div>
								<input 
									type="checkbox" 
									class="w-5 h-5"
									checked={selectedAssets.includes(holding.id)}
									on:change={() => handleAssetSelect(holding.id)}
								/>
							</div>
							
							<div>
								<h3 class="text-lg font-extrabold text-black uppercase tracking-wider mb-2">{holding.name}</h3>
								<p class="text-xs text-black opacity-70 mb-2">{holding.location}</p>
								<StatusBadge status={holding.status} />
							</div>
							
							<div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
								<div>
									<div class="text-2xl font-extrabold text-primary">{formatCurrency(holding.unclaimedAmount)}</div>
									<div class="text-xs font-bold text-black uppercase tracking-wider opacity-70">Unclaimed</div>
								</div>
								<div>
									<div class="text-2xl font-extrabold">{formatCurrency(holding.totalEarned)}</div>
									<div class="text-xs font-bold text-black uppercase tracking-wider opacity-70">Total Earned</div>
								</div>
								<div>
									<div class="text-2xl font-extrabold">{holding.currentPayout}%</div>
									<div class="text-xs font-bold text-black uppercase tracking-wider opacity-70">Current Payout</div>
								</div>
							</div>
							
							<div>
								<button 
									class="px-6 py-2 font-semibold text-sm uppercase tracking-wider transition-colors duration-200 bg-primary text-white hover:bg-primary-dark"
									on:click={() => handleAssetSelect(holding.id)}
								>
									Claim
								</button>
							</div>
						</div>
						
						<div class="border-t border-light-gray pt-4">
							<div class="text-xs text-black opacity-70">
								<span>Last Payout: {formatDate(holding.lastPayout)}</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</ContentSection>

		<!-- Claim Settings & History -->
		<ContentSection background="gray" padding="standard" maxWidth={false}>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
				<!-- Claim Settings -->
				<div class="bg-white border border-light-gray p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
					<h3 class="text-xl font-extrabold text-black uppercase tracking-wider">Claim Settings</h3>
					
					<div class="mb-8">
						<div class="text-xs font-bold text-black uppercase tracking-wider mb-4">Claim Method</div>
						<div class="flex flex-col gap-4">
							<label class="flex items-center gap-3 cursor-pointer">
								<input 
									type="radio" 
									name="claimMethod" 
									value="wallet"
									bind:group={claimMethod}
								/>
								<div class="flex-1">
									<div class="font-extrabold text-black text-sm mb-1">Direct to Wallet</div>
									<div class="text-xs text-black opacity-70">Instant transfer to connected wallet</div>
								</div>
							</label>
							<label class="flex items-center gap-3 cursor-pointer">
								<input 
									type="radio" 
									name="claimMethod" 
									value="reinvest"
									bind:group={claimMethod}
								/>
								<div class="flex-1">
									<div class="font-extrabold text-black text-sm mb-1">Auto-Reinvest</div>
									<div class="text-xs text-black opacity-70">Automatically purchase more tokens</div>
								</div>
							</label>
						</div>
					</div>
				</div>

				<!-- Statistics -->
				<div class="bg-white border border-light-gray p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
					<h3 class="text-xl font-extrabold text-black uppercase tracking-wider">Payout Statistics</h3>
					
					<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
						<div class="text-center p-4 bg-white border border-light-gray">
							<div class="text-xl font-extrabold text-primary mb-1">{dataStoreService.getPlatformStats().averagePortfolioIRR?.formatted || '13.2%'}</div>
							<div class="text-xs font-bold text-black uppercase tracking-wider opacity-70">Avg Portfolio IRR</div>
						</div>
						<div class="text-center p-4 bg-white border border-light-gray">
							<div class="text-xl font-extrabold text-primary mb-1">{formatCurrency(totalEarned / 12)}</div>
							<div class="text-xs font-bold text-black uppercase tracking-wider opacity-70">Avg Monthly Income</div>
						</div>
					</div>
					
					<div class="flex flex-col gap-3">
						<div class="flex justify-between items-center text-sm">
							<span class="opacity-70">Total Payouts This Year:</span>
							<span class="font-extrabold">{dataStoreService.getPlatformStats().totalPayoutsThisYear?.formatted || '24'}</span>
						</div>
						<div class="flex justify-between items-center text-sm">
							<span class="opacity-70">Days Since Last Claim:</span>
							<span class="font-extrabold">{dataStoreService.getPlatformStats().daysSinceLastClaim?.formatted || '3'}</span>
						</div>
					</div>
				</div>
			</div>
		</ContentSection>

		<!-- Claim History -->
		<ContentSection background="white" padding="standard" maxWidth={false}>
			<div class="flex justify-between items-center">
				<SectionTitle>Claim History</SectionTitle>
				<div class="flex gap-2">
					<TabButton 
						active={activeHistoryTab === 'recent'}
						on:click={() => activeHistoryTab = 'recent'}
					>
						Recent
					</TabButton>
					<TabButton 
						active={activeHistoryTab === 'all'}
						on:click={() => activeHistoryTab = 'all'}
					>
						All Time
					</TabButton>
					<TabButton 
						active={false}
						on:click={() => {}}
					>
						Export
					</TabButton>
				</div>
			</div>
			
			<div class="border border-light-gray mt-8">
				<div class="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr_1.5fr_1fr] gap-4 p-4 bg-light-gray border-b border-light-gray font-semibold text-xs uppercase tracking-wider">
					<div class="text-xs font-bold text-black uppercase tracking-wider md:text-left text-center">Date</div>
					<div class="text-xs font-bold text-black uppercase tracking-wider md:text-left text-center">Asset</div>
					<div class="text-xs font-bold text-black uppercase tracking-wider md:text-left text-center">Amount</div>
					<div class="text-xs font-bold text-black uppercase tracking-wider md:text-left text-center">Transaction</div>
					<div class="text-xs font-bold text-black uppercase tracking-wider md:text-left text-center">Status</div>
				</div>
				
				{#each claimHistory as claim}
					<div class="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr_1.5fr_1fr] gap-4 p-4 border-b border-light-gray hover:bg-light-gray transition-colors duration-200">
						<div class="text-sm text-black md:text-left text-center">{formatDate(claim.date)}</div>
						<div class="md:text-left text-center">
							<div class="font-extrabold text-sm text-black">{claim.asset}</div>
						</div>
						<div class="text-sm text-black text-primary font-extrabold md:text-left text-center">{formatCurrency(claim.amount)}</div>
						<div class="md:text-left text-center">
							<div class="font-mono text-xs text-black">{claim.txHash}</div>
						</div>
						<div class="md:text-left text-center">
							<span class="text-green-600 font-semibold text-xs">✓ Completed</span>
						</div>
					</div>
				{/each}
			</div>
		</ContentSection>
	{/if}
</PageLayout>
{/if}

<!-- Wallet Modal -->
<WalletModal
	bind:isOpen={showWalletModal}
	isConnecting={$walletStore.isConnecting}
	on:connect={handleWalletConnect}
	on:close={handleWalletModalClose}
/>