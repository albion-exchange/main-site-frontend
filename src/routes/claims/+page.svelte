<script lang="ts">
	import { onMount } from 'svelte';
	import dataStoreService from '$lib/services/DataStoreService';
	import type { Asset } from '$lib/types/dataStore';
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
	import { layouts, layoutPatterns } from '$lib/styles/layouts';
	import { typography } from '$lib/styles/typography';
	import { buttons } from '$lib/styles/buttons';

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
	<main class={layouts.pageContainer}>
		<div class="{layouts.flexCenter} min-h-[60vh] text-center p-8">
			<div>
				<h1 class="{typography.sectionTitle} mb-4">Wallet Connection Required</h1>
				<p class="{typography.bodyText} mb-8">Please connect your wallet to view and claim your payouts.</p>
				<PrimaryButton on:click={() => showWalletModal = true}>
					Connect Wallet
				</PrimaryButton>
			</div>
		</div>
	</main>
{:else if $walletStore.isConnected}
<main class={layouts.pageContainer}>
	<!-- Hero Section -->
	<section class={layoutPatterns.heroSection}>
		<div class="max-w-3xl mx-auto">
			<h1 class={typography.pageTitle}>Claim Payouts</h1>
			<p class="{typography.bodyText} text-lg mb-8">Claim your earnings from oil & gas investments and track your payout history.</p>
			<div class="inline-flex items-center gap-2 text-sm font-semibold text-black uppercase tracking-wider">
				<div class="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
				<span>Live Tracking: {isAccruing ? 'Active' : 'Paused'}</span>
			</div>
		</div>
	</section>

	{#if loading}
		<div class="text-center {layouts.pageSection}">
			<p class={typography.bodyText}>Loading payout information...</p>
		</div>
	{:else}
		<!-- Success Message -->
		{#if claimSuccess}
			<div class="bg-light-gray border border-primary text-primary p-6 mx-8 my-8 text-center">
				<h3 class="{typography.cardTitle} mb-2">✅ Claim Successful!</h3>
				<p class={typography.bodyText}>Your payouts have been successfully transferred to your wallet.</p>
			</div>
		{/if}

		<!-- Payout Overview -->
		<section class="py-12 px-8">
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
		</section>

		<!-- Quick Claim Section -->
		<section class="px-8 pb-12">
			<div class="{layouts.gridTwo} bg-light-gray border border-light-gray p-8 md:p-12">
				<div>
					<h2 class={typography.cardTitle}>Quick Claim All</h2>
					<div class="mb-8">
						<div class="text-4xl font-extrabold text-primary mb-2">{formatCurrency(unclaimedPayout)}</div>
						<div class="{typography.bodyTextSmall} font-semibold">Total Available</div>
					</div>
					<div class="{layouts.flexColumn} gap-2 text-sm">
						<div class={layouts.flexBetween}>
							<span class="font-semibold">Estimated Gas:</span>
							<span class="font-extrabold">~${marketData.gasFeesEstimate.medium}</span>
						</div>
						<div class={layouts.flexBetween}>
							<span class="font-semibold">Net Amount:</span>
							<span class={typography.metricValuePrimary}>{formatCurrency(unclaimedPayout - marketData.gasFeesEstimate.medium)}</span>
						</div>
					</div>
				</div>
				
				<div class="{layouts.flexColumn} gap-4 justify-center">
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
		</section>

		<!-- Asset-by-Asset Claiming -->
		<section class="{layouts.pageSection} bg-white">
			<div class={layouts.flexBetween}>
				<SectionTitle>Claim by Asset</SectionTitle>
				<div class="flex md:flex-row flex-col gap-4">
					<button 
						class="{buttons.base} {buttons.control}"
						on:click={handleSelectAll}
					>
						{selectedAssets.length === holdings.length ? 'Deselect All' : 'Select All'}
					</button>
					{#if selectedAssets.length > 0}
						<button 
							class="{buttons.base} {buttons.controlPrimary}"
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

			<div class="{layouts.flexColumn} gap-4 mt-8">
				{#each holdings as holding}
					<div class="{layouts.card} {selectedAssets.includes(holding.id) ? 'border-primary bg-light-gray' : ''}">
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
								<h3 class="{typography.subsectionTitle} mb-2">{holding.name}</h3>
								<p class="{typography.meta} mb-2">{holding.location}</p>
								<StatusBadge status={holding.status} />
							</div>
							
							<div class="{layouts.gridThree} text-center">
								<div>
									<div class="{typography.metricValueSmall} text-primary">{formatCurrency(holding.unclaimedAmount)}</div>
									<div class={typography.labelMuted}>Unclaimed</div>
								</div>
								<div>
									<div class={typography.metricValueSmall}>{formatCurrency(holding.totalEarned)}</div>
									<div class={typography.labelMuted}>Total Earned</div>
								</div>
								<div>
									<div class={typography.metricValueSmall}>{holding.currentPayout}%</div>
									<div class={typography.labelMuted}>Current Payout</div>
								</div>
							</div>
							
							<div>
								<button 
									class="{buttons.base} {buttons.claim}"
									on:click={() => handleAssetSelect(holding.id)}
								>
									Claim
								</button>
							</div>
						</div>
						
						<div class="border-t border-light-gray pt-4">
							<div class={typography.meta}>
								<span>Last Payout: {formatDate(holding.lastPayout)}</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Claim Settings & History -->
		<section class={layouts.pageSectionAlt}>
			<div class={layouts.gridTwo}>
				<!-- Claim Settings -->
				<div class={layouts.card}>
					<h3 class={typography.cardTitle}>Claim Settings</h3>
					
					<div class="mb-8">
						<div class="{typography.label} mb-4">Claim Method</div>
						<div class="{layouts.flexColumn} gap-4">
							<label class="flex items-center gap-3 cursor-pointer">
								<input 
									type="radio" 
									name="claimMethod" 
									value="wallet"
									bind:group={claimMethod}
								/>
								<div class="flex-1">
									<div class="font-extrabold text-black text-sm mb-1">Direct to Wallet</div>
									<div class={typography.meta}>Instant transfer to connected wallet</div>
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
									<div class={typography.meta}>Automatically purchase more tokens</div>
								</div>
							</label>
						</div>
					</div>
				</div>

				<!-- Statistics -->
				<div class={layouts.card}>
					<h3 class={typography.cardTitle}>Payout Statistics</h3>
					
					<div class="{layouts.gridTwo} mb-6">
						<div class={layouts.metricCompact}>
							<div class="text-xl font-extrabold text-primary mb-1">{dataStoreService.getPlatformStats().averagePortfolioIRR?.formatted || '13.2%'}</div>
							<div class={typography.labelMuted}>Avg Portfolio IRR</div>
						</div>
						<div class={layouts.metricCompact}>
							<div class="text-xl font-extrabold text-primary mb-1">{formatCurrency(totalEarned / 12)}</div>
							<div class={typography.labelMuted}>Avg Monthly Income</div>
						</div>
					</div>
					
					<div class="{layouts.flexColumn} gap-3">
						<div class="{layouts.flexBetween} text-sm">
							<span class="opacity-70">Total Payouts This Year:</span>
							<span class="font-extrabold">{dataStoreService.getPlatformStats().totalPayoutsThisYear?.formatted || '24'}</span>
						</div>
						<div class="{layouts.flexBetween} text-sm">
							<span class="opacity-70">Days Since Last Claim:</span>
							<span class="font-extrabold">{dataStoreService.getPlatformStats().daysSinceLastClaim?.formatted || '3'}</span>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Claim History -->
		<section class="{layouts.pageSection} bg-white">
			<div class={layouts.flexBetween}>
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
				<div class="{layouts.tableHeader} grid-cols-1 md:grid-cols-[1fr_2fr_1fr_1.5fr_1fr]">
					<div class="{typography.label} md:text-left text-center">Date</div>
					<div class="{typography.label} md:text-left text-center">Asset</div>
					<div class="{typography.label} md:text-left text-center">Amount</div>
					<div class="{typography.label} md:text-left text-center">Transaction</div>
					<div class="{typography.label} md:text-left text-center">Status</div>
				</div>
				
				{#each claimHistory as claim}
					<div class="{layouts.tableRow} grid-cols-1 md:grid-cols-[1fr_2fr_1fr_1.5fr_1fr]">
						<div class="{typography.bodyTextSmall} md:text-left text-center">{formatDate(claim.date)}</div>
						<div class="md:text-left text-center">
							<div class="font-extrabold {typography.bodyTextSmall}">{claim.asset}</div>
						</div>
						<div class="{typography.bodyTextSmall} {typography.metricValuePrimary} md:text-left text-center">{formatCurrency(claim.amount)}</div>
						<div class="md:text-left text-center">
							<div class="font-mono {typography.meta}">{claim.txHash}</div>
						</div>
						<div class="md:text-left text-center">
							<span class="{typography.success} text-xs">✓ Completed</span>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}
</main>
{/if}

<!-- Wallet Modal -->
<WalletModal
	bind:isOpen={showWalletModal}
	isConnecting={$walletStore.isConnecting}
	on:connect={handleWalletConnect}
	on:close={handleWalletModalClose}
/>