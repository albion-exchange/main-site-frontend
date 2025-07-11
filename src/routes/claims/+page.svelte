<script lang="ts">
	import { onMount } from 'svelte';
	import dataStoreService from '$lib/services/DataStoreService';
	import type { Asset } from '$lib/types/dataStore';
	import { walletStore, walletActions } from '$lib/stores/wallet';
	import WalletModal from '$lib/components/WalletModal.svelte';
	import marketData from '$lib/data/marketData.json';
	import { getMockPortfolioHoldings, calculatePortfolioSummary } from '$lib/utils/portfolioCalculations';

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
	
	// Tailwind class mappings
	$: claimsPageClasses = 'p-0 max-w-6xl mx-auto';
	$: walletRequiredClasses = 'flex items-center justify-center min-h-[60vh] text-center p-8';
	$: walletRequiredTitleClasses = 'text-3xl font-extrabold text-black mb-4 uppercase tracking-wider';
	$: walletRequiredTextClasses = 'text-lg text-black mb-8 opacity-80';
	$: connectBtnClasses = 'bg-primary text-white border-none px-8 py-4 font-figtree font-extrabold text-sm uppercase tracking-wider cursor-pointer transition-colors duration-200 hover:bg-secondary';
	$: heroClasses = 'py-16 px-8 text-center bg-white border-b border-light-gray';
	$: heroContentClasses = 'max-w-3xl mx-auto';
	$: heroTitleClasses = 'text-4xl font-extrabold mb-4 text-black uppercase tracking-tight';
	$: heroPClasses = 'text-lg text-black mb-8';
	$: liveIndicatorClasses = 'inline-flex items-center gap-2 text-sm font-semibold text-black uppercase tracking-wider';
	$: pulseDotClasses = 'w-2 h-2 bg-primary rounded-full animate-pulse';
	$: loadingStateClasses = 'text-center py-16 px-8 text-black';
	$: successMessageClasses = 'bg-light-gray border border-primary text-primary p-6 mx-8 my-8 text-center';
	$: successTitleClasses = 'font-extrabold mb-2';
	$: payoutOverviewClasses = 'py-12 px-8';
	$: overviewGridClasses = 'grid grid-cols-3 gap-8';
	$: overviewCardClasses = 'bg-white border border-light-gray p-8 text-center';
	$: metricValueClasses = 'text-3xl font-extrabold text-black mb-2';
	$: metricValueAvailableClasses = 'text-primary';
	$: metricLabelClasses = 'text-xs font-bold text-black uppercase tracking-wider mb-1';
	$: metricNoteClasses = 'text-xs text-secondary font-medium';
	$: quickClaimClasses = 'px-8 pb-12';
	$: claimGridClasses = 'grid grid-cols-2 gap-12 bg-light-gray border border-light-gray p-12';
	$: claimInfoTitleClasses = 'text-xl font-extrabold text-black mb-8 uppercase tracking-wider';
	$: amountDisplayClasses = 'text-4xl font-extrabold text-primary mb-2';
	$: amountLabelClasses = 'text-sm text-black font-semibold mb-8';
	$: gasInfoClasses = 'flex flex-col gap-2 text-sm';
	$: gasRowClasses = 'flex justify-between';
	$: gasLabelClasses = 'text-black font-semibold';
	$: gasValueClasses = 'text-black font-extrabold';
	$: netAmountClasses = 'text-primary font-extrabold';
	$: claimActionsClasses = 'flex flex-col gap-4 justify-center';
	$: claimBtnClasses = 'px-8 py-4 border-none font-figtree font-extrabold text-sm uppercase tracking-wider cursor-pointer transition-all duration-200';
	$: claimBtnPrimaryClasses = 'bg-black text-white hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed';
	$: claimBtnSecondaryClasses = 'bg-white text-black border border-black hover:bg-black hover:text-white';
	$: assetClaimsClasses = 'py-12 px-8 bg-white';
	$: sectionHeaderClasses = 'flex justify-between items-center mb-8';
	$: sectionTitleClasses = 'text-[1.75rem] font-extrabold text-black uppercase tracking-wider';
	$: controlsClasses = 'flex gap-4';
	$: controlBtnClasses = 'px-6 py-3 bg-white border border-black text-black font-figtree font-semibold text-xs uppercase tracking-wider cursor-pointer transition-all duration-200 hover:bg-black hover:text-white';
	$: controlBtnActiveClasses = 'bg-black text-white';
	$: controlBtnPrimaryClasses = 'bg-primary border-primary text-white hover:opacity-90';
	$: assetsListClasses = 'flex flex-col gap-4';
	$: assetCardClasses = 'bg-white border border-light-gray p-8 transition-all duration-200';
	$: assetCardSelectedClasses = 'border-primary bg-light-gray';
	$: assetMainClasses = 'grid grid-cols-[auto_2fr_3fr_auto] gap-8 items-center mb-4';
	$: assetSelectClasses = 'w-5 h-5';
	$: assetInfoH3Classes = 'font-extrabold text-black mb-2 text-base';
	$: assetLocationClasses = 'text-black opacity-70 text-sm mb-2';
	$: statusBadgeClasses = 'bg-light-gray text-secondary px-2 py-1 text-xs font-bold uppercase tracking-wider';
	$: statusBadgeProducingClasses = 'text-primary';
	$: assetMetricsClasses = 'grid grid-cols-3 gap-4 text-center';
	$: metricClasses = 'text-center';
	$: assetMetricValueClasses = 'text-lg font-extrabold text-black mb-1';
	$: assetMetricValueUnclaimedClasses = 'text-primary';
	$: assetMetricLabelClasses = 'text-xs font-bold text-black opacity-70 uppercase tracking-wider';
	$: assetClaimBtnClasses = 'bg-black text-white border-none px-6 py-3 font-figtree font-semibold text-xs uppercase tracking-wider cursor-pointer transition-colors duration-200 hover:bg-secondary';
	$: assetFooterClasses = 'border-t border-light-gray pt-4';
	$: footerInfoClasses = 'text-sm text-black opacity-70';
	$: bottomSectionClasses = 'py-12 px-8 bg-light-gray';
	$: bottomGridClasses = 'grid grid-cols-2 gap-12';
	$: settingsCardClasses = 'bg-white border border-light-gray p-8';
	$: cardTitleClasses = 'text-xl font-extrabold text-black mb-6 uppercase tracking-wider';
	$: settingGroupClasses = 'mb-8';
	$: settingLabelClasses = 'text-xs font-bold text-black uppercase tracking-wider mb-4';
	$: radioGroupClasses = 'flex flex-col gap-4';
	$: radioOptionClasses = 'flex items-center gap-3 cursor-pointer';
	$: radioContentClasses = 'flex-1';
	$: radioTitleClasses = 'font-extrabold text-black text-sm mb-1';
	$: radioDescClasses = 'text-xs text-black opacity-70';
	$: statsGridClasses = 'grid grid-cols-2 gap-4 mb-6';
	$: statItemClasses = 'text-center p-4 bg-light-gray border border-light-gray';
	$: statValueClasses = 'text-xl font-extrabold text-primary mb-1';
	$: statLabelClasses = 'text-xs font-bold text-black opacity-70 uppercase tracking-wider';
	$: statsListClasses = 'flex flex-col gap-3';
	$: statsRowClasses = 'flex justify-between text-sm';
	$: claimHistoryClasses = 'py-12 px-8 bg-white';
	$: historyHeaderClasses = 'flex justify-between items-center mb-8';
	$: historyControlsClasses = 'flex gap-2';
	$: historyTableClasses = 'border border-light-gray';
	$: tableHeaderClasses = 'grid grid-cols-[1fr_2fr_1fr_1.5fr_1fr] gap-4 p-4 bg-light-gray border-b border-light-gray';
	$: headerCellClasses = 'font-extrabold text-black text-xs uppercase tracking-wider';
	$: tableRowClasses = 'grid grid-cols-[1fr_2fr_1fr_1.5fr_1fr] gap-4 p-4 border-b border-light-gray items-center hover:bg-light-gray';
	$: tableCellClasses = 'text-sm text-black';
	$: assetNameClasses = 'font-extrabold';
	$: tableCellAmountClasses = 'font-extrabold text-primary';
	$: txHashClasses = 'font-mono text-xs text-black opacity-70';
	$: statusCompletedClasses = 'text-primary font-semibold text-xs';
	$: statsListLabelClasses = 'text-black opacity-70';
	$: statsListValueClasses = 'font-extrabold text-black';
	
	// Mobile responsive classes
	$: mobileHeroTitleClasses = 'md:text-4xl text-3xl font-extrabold mb-4 text-black uppercase tracking-tight';
	$: mobileOverviewGridClasses = 'grid grid-cols-1 md:grid-cols-3 gap-8';
	$: mobileClaimGridClasses = 'grid grid-cols-1 md:grid-cols-2 md:gap-12 gap-8 bg-light-gray border border-light-gray md:p-12 p-8';
	$: mobileAssetMainClasses = 'grid grid-cols-1 md:grid-cols-[auto_2fr_3fr_auto] md:gap-8 gap-4 items-center mb-4';
	$: mobileAssetMetricsClasses = 'grid grid-cols-1 md:grid-cols-3 gap-4 text-center';
	$: mobileControlsClasses = 'flex md:flex-row flex-col gap-4';
	$: mobileBottomGridClasses = 'grid grid-cols-1 md:grid-cols-2 md:gap-12 gap-8';
	$: mobileStatsGridClasses = 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-6';
	$: mobileTableHeaderClasses = 'grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr_1.5fr_1fr] md:gap-4 gap-2 p-4 bg-light-gray border-b border-light-gray';
	$: mobileTableRowClasses = 'grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr_1.5fr_1fr] md:gap-4 gap-2 p-4 border-b border-light-gray items-center hover:bg-light-gray';
	$: mobileHeaderCellClasses = 'font-extrabold text-black text-xs uppercase tracking-wider md:text-left text-center md:py-0 py-2';
	$: mobileTableCellClasses = 'text-sm text-black md:text-left text-center md:py-0 py-2';
</script>

<svelte:head>
	<title>Claim Payouts - Albion</title>
	<meta name="description" content="Claim your oil & gas investment payouts and track earnings history" />
</svelte:head>

{#if !$walletStore.isConnected && !showWalletModal}
	<main class={claimsPageClasses}>
		<div class={walletRequiredClasses}>
			<div>
				<h1 class={walletRequiredTitleClasses}>Wallet Connection Required</h1>
				<p class={walletRequiredTextClasses}>Please connect your wallet to view and claim your payouts.</p>
				<button class={connectBtnClasses} on:click={() => showWalletModal = true}>
					Connect Wallet
				</button>
			</div>
		</div>
	</main>
{:else if $walletStore.isConnected}
<main class={claimsPageClasses}>
	<!-- Hero Section -->
	<section class={heroClasses}>
		<div class={heroContentClasses}>
			<h1 class={mobileHeroTitleClasses}>Claim Payouts</h1>
			<p class={heroPClasses}>Claim your earnings from oil & gas investments and track your payout history.</p>
			<div class={liveIndicatorClasses}>
				<div class={pulseDotClasses}></div>
				<span>Live Tracking: {isAccruing ? 'Active' : 'Paused'}</span>
			</div>
		</div>
	</section>

	{#if loading}
		<div class={loadingStateClasses}>
			<p>Loading payout information...</p>
		</div>
	{:else}
		<!-- Success Message -->
		{#if claimSuccess}
			<div class={successMessageClasses}>
				<h3 class={successTitleClasses}>✅ Claim Successful!</h3>
				<p>Your payouts have been successfully transferred to your wallet.</p>
			</div>
		{/if}

		<!-- Payout Overview -->
		<section class={payoutOverviewClasses}>
			<div class={mobileOverviewGridClasses}>
				<div class={overviewCardClasses}>
					<div class={metricValueClasses}>{formatCurrency(totalEarned)}</div>
					<div class={metricLabelClasses}>Total Earned</div>
					<div class={metricNoteClasses}>All time from investments</div>
				</div>
				
				<div class={overviewCardClasses}>
					<div class={metricValueClasses}>{formatCurrency(totalClaimed)}</div>
					<div class={metricLabelClasses}>Total Claimed</div>
					<div class={metricNoteClasses}>Successfully withdrawn</div>
				</div>
				
				<div class={overviewCardClasses}>
					<div class="{metricValueClasses} {metricValueAvailableClasses}">{formatCurrency(unclaimedPayout)}</div>
					<div class={metricLabelClasses}>Available to Claim</div>
					<div class={metricNoteClasses}>Ready for withdrawal</div>
				</div>
			</div>
		</section>

		<!-- Quick Claim Section -->
		<section class={quickClaimClasses}>
			<div class={mobileClaimGridClasses}>
				<div>
					<h2 class={claimInfoTitleClasses}>Quick Claim All</h2>
					<div>
						<div class={amountDisplayClasses}>{formatCurrency(unclaimedPayout)}</div>
						<div class={amountLabelClasses}>Total Available</div>
					</div>
					<div class={gasInfoClasses}>
						<div class={gasRowClasses}>
							<span class={gasLabelClasses}>Estimated Gas:</span>
							<span class={gasValueClasses}>~${marketData.gasFeesEstimate.medium}</span>
						</div>
						<div class={gasRowClasses}>
							<span class={gasLabelClasses}>Net Amount:</span>
							<span class={netAmountClasses}>{formatCurrency(unclaimedPayout - marketData.gasFeesEstimate.medium)}</span>
						</div>
					</div>
				</div>
				
				<div class={claimActionsClasses}>
					<button 
						class="{claimBtnClasses} {claimBtnPrimaryClasses}"
						on:click={handleClaim}
						disabled={claiming || unclaimedPayout <= 0}
					>
						{#if claiming}
							Claiming...
						{:else}
							Claim All {formatCurrency(unclaimedPayout)}
						{/if}
					</button>
					<button class="{claimBtnClasses} {claimBtnSecondaryClasses}">
						Claim & Reinvest
					</button>
				</div>
			</div>
		</section>

		<!-- Asset-by-Asset Claiming -->
		<section class={assetClaimsClasses}>
			<div class={sectionHeaderClasses}>
				<h2 class={sectionTitleClasses}>Claim by Asset</h2>
				<div class={mobileControlsClasses}>
					<button 
						class={controlBtnClasses}
						on:click={handleSelectAll}
					>
						{selectedAssets.length === holdings.length ? 'Deselect All' : 'Select All'}
					</button>
					{#if selectedAssets.length > 0}
						<button 
							class="{controlBtnClasses} {controlBtnPrimaryClasses}"
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

			<div class={assetsListClasses}>
				{#each holdings as holding}
					<div class="{assetCardClasses} {selectedAssets.includes(holding.id) ? assetCardSelectedClasses : ''}">
						<div class={mobileAssetMainClasses}>
							<div>
								<input 
									type="checkbox" 
									class={assetSelectClasses}
									checked={selectedAssets.includes(holding.id)}
									on:change={() => handleAssetSelect(holding.id)}
								/>
							</div>
							
							<div>
								<h3 class={assetInfoH3Classes}>{holding.name}</h3>
								<p class={assetLocationClasses}>{holding.location}</p>
								<span class="{statusBadgeClasses} {holding.status === 'producing' ? statusBadgeProducingClasses : ''}">
									{holding.status.toUpperCase()}
								</span>
							</div>
							
							<div class={mobileAssetMetricsClasses}>
								<div class={metricClasses}>
									<div class="{assetMetricValueClasses} {assetMetricValueUnclaimedClasses}">{formatCurrency(holding.unclaimedAmount)}</div>
									<div class={assetMetricLabelClasses}>Unclaimed</div>
								</div>
								<div class={metricClasses}>
									<div class={assetMetricValueClasses}>{formatCurrency(holding.totalEarned)}</div>
									<div class={assetMetricLabelClasses}>Total Earned</div>
								</div>
								<div class={metricClasses}>
									<div class={assetMetricValueClasses}>{holding.currentPayout}%</div>
									<div class={assetMetricLabelClasses}>Current Payout</div>
								</div>
							</div>
							
							<div>
								<button 
									class={assetClaimBtnClasses}
									on:click={() => handleAssetSelect(holding.id)}
								>
									Claim
								</button>
							</div>
						</div>
						
						<div class={assetFooterClasses}>
							<div class={footerInfoClasses}>
								<span>Last Payout: {formatDate(holding.lastPayout)}</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Claim Settings & History -->
		<section class={bottomSectionClasses}>
			<div class={mobileBottomGridClasses}>
				<!-- Claim Settings -->
				<div class={settingsCardClasses}>
					<h3 class={cardTitleClasses}>Claim Settings</h3>
					
					<div class={settingGroupClasses}>
						<div class={settingLabelClasses}>Claim Method</div>
						<div class={radioGroupClasses}>
							<label class={radioOptionClasses}>
								<input 
									type="radio" 
									name="claimMethod" 
									value="wallet"
									bind:group={claimMethod}
								/>
								<div class={radioContentClasses}>
									<div class={radioTitleClasses}>Direct to Wallet</div>
									<div class={radioDescClasses}>Instant transfer to connected wallet</div>
								</div>
							</label>
							<label class={radioOptionClasses}>
								<input 
									type="radio" 
									name="claimMethod" 
									value="reinvest"
									bind:group={claimMethod}
								/>
								<div class={radioContentClasses}>
									<div class={radioTitleClasses}>Auto-Reinvest</div>
									<div class={radioDescClasses}>Automatically purchase more tokens</div>
								</div>
							</label>
						</div>
					</div>
				</div>

				<!-- Statistics -->
				<div class={settingsCardClasses}>
					<h3 class={cardTitleClasses}>Payout Statistics</h3>
					
					<div class={mobileStatsGridClasses}>
						<div class={statItemClasses}>
							<div class={statValueClasses}>{dataStoreService.getPlatformStats().averagePortfolioIRR?.formatted || '13.2%'}</div>
							<div class={statLabelClasses}>Avg Portfolio IRR</div>
						</div>
						<div class={statItemClasses}>
							<div class={statValueClasses}>{formatCurrency(totalEarned / 12)}</div>
							<div class={statLabelClasses}>Avg Monthly Income</div>
						</div>
					</div>
					
					<div class={statsListClasses}>
						<div class={statsRowClasses}>
							<span class={statsListLabelClasses}>Total Payouts This Year:</span>
							<span class={statsListValueClasses}>{dataStoreService.getPlatformStats().totalPayoutsThisYear?.formatted || '24'}</span>
						</div>
						<div class={statsRowClasses}>
							<span class={statsListLabelClasses}>Days Since Last Claim:</span>
							<span class={statsListValueClasses}>{dataStoreService.getPlatformStats().daysSinceLastClaim?.formatted || '3'}</span>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Claim History -->
		<section class={claimHistoryClasses}>
			<div class={historyHeaderClasses}>
				<h2 class={sectionTitleClasses}>Claim History</h2>
				<div class={historyControlsClasses}>
					<button class="{controlBtnClasses} {controlBtnActiveClasses}">Recent</button>
					<button class={controlBtnClasses}>All Time</button>
					<button class={controlBtnClasses}>Export</button>
				</div>
			</div>
			
			<div class={historyTableClasses}>
				<div class={mobileTableHeaderClasses}>
					<div class={mobileHeaderCellClasses}>Date</div>
					<div class={mobileHeaderCellClasses}>Asset</div>
					<div class={mobileHeaderCellClasses}>Amount</div>
					<div class={mobileHeaderCellClasses}>Transaction</div>
					<div class={mobileHeaderCellClasses}>Status</div>
				</div>
				
				{#each claimHistory as claim}
					<div class={mobileTableRowClasses}>
						<div class={mobileTableCellClasses}>{formatDate(claim.date)}</div>
						<div class={mobileTableCellClasses}>
							<div class={assetNameClasses}>{claim.asset}</div>
						</div>
						<div class="{mobileTableCellClasses} {tableCellAmountClasses}">{formatCurrency(claim.amount)}</div>
						<div class={mobileTableCellClasses}>
							<div class={txHashClasses}>{claim.txHash}</div>
						</div>
						<div class={mobileTableCellClasses}>
							<span class={statusCompletedClasses}>✓ Completed</span>
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

