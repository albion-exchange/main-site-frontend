<script lang="ts">
	import { onMount } from 'svelte';
	import { useAssetService, useTokenService } from '$lib/services';
	import walletDataService from '$lib/services/WalletDataService';
	import type { Asset } from '$lib/types/uiTypes';
	import { web3Modal, signerAddress, connected, loading } from 'svelte-wagmi';
	import { Card, CardContent, CardActions, PrimaryButton, SecondaryButton, StatusBadge, StatsCard, SectionTitle, DataTable, TableRow, TabNavigation, TabButton, ActionCard, CollapsibleSection } from '$lib/components/components';
	import { PageLayout, HeroSection, ContentSection, FullWidthSection, StatsSection } from '$lib/components/layout';
	import { formatCurrency } from '$lib/utils/formatters';
	import { dateUtils } from '$lib/utils/dateHelpers';
	import { arrayUtils } from '$lib/utils/arrayHelpers';
	
	const assetService = useAssetService();
	const tokenService = useTokenService();

	let totalEarned = 0;
	let totalClaimed = 0;
	let unclaimedPayout = 0;
	let pageLoading = true;
	let claiming = false;
	let claimSuccess = false;

	let claimMethod = 'wallet';
	let estimatedGas = 0;

	let holdings: any[] = [];
	let claimHistory: any[] = [];
	let currentPage = 1;
	const itemsPerPage = 20;
	let showClaimModal = false;
	let claimModalMode: 'claim' | 'reinvest' = 'claim';
	let claimAssets: string[] = [];

	function loadClaimsData() {
		try {
			estimatedGas = 1.25;
			totalEarned = walletDataService.getTotalPayoutsEarned();
			unclaimedPayout = walletDataService.getUnclaimedPayouts();
			const allTransactions = walletDataService.getAllTransactions();
			const claimTransactions = allTransactions.filter(tx => tx.type === 'claim');
			totalClaimed = claimTransactions.reduce((sum, tx) => sum + tx.amount, 0);
			const assetPayouts = walletDataService.getHoldingsByAsset();
			holdings = assetPayouts.map(assetPayout => {
				const asset = assetService.getAssetById(assetPayout.assetId);
				if (!asset) return null;
				const lastPayoutMonth = assetPayout.monthlyPayouts
					.filter(p => p.amount > 0)
					.sort((a, b) => b.month.localeCompare(a.month))[0];
				const tokens = tokenService.getTokensByAssetId(assetPayout.assetId);
				const contractAddress = tokens.length > 0 ? tokens[0].contractAddress : null;
				const lastClaim = contractAddress ? claimTransactions
					.filter(tx => tx.address === contractAddress)
					.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0] : null;
				return {
					id: assetPayout.assetId,
					name: assetPayout.assetName,
					location: asset ? `${asset.location.state}, ${asset.location.country}` : '',
					unclaimedAmount: assetPayout.unclaimedAmount,
					totalEarned: assetPayout.totalEarned,
					lastPayout: lastPayoutMonth ? lastPayoutMonth.month : null,
					lastClaimDate: lastClaim ? lastClaim.timestamp : null,
					status: asset ? asset.production.status : 'unknown'
				};
			}).filter(Boolean);
			claimHistory = claimTransactions.map(tx => {
				const token = tokenService.getTokenByAddress(tx.address);
				const asset = token ? assetService.getAssetById(token.assetId) : null;
				return {
					date: tx.timestamp,
					amount: tx.amount,
					asset: asset ? asset.name : 'Unknown Asset',
					txHash: tx.txHash,
					status: 'completed'
				};
			});
			pageLoading = false;
		} catch (error) {
			console.error('Error loading claims data:', error);
			pageLoading = false;
		}
	}

	onMount(async () => {
		if (!$connected || !$signerAddress) {
			$web3Modal.open();
			return;
		}
		loadClaimsData();
	});
	
	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	async function connectWallet() {
		$web3Modal.open();
	}

	async function handleWalletConnect() {
		loadClaimsData();
	}

	async function claimAllPayouts() {
		claiming = true;
		try {
			await new Promise(resolve => setTimeout(resolve, 2000));
			holdings.forEach(holding => {
				if (holding.unclaimedAmount > 0) {
					walletDataService.addTransaction({
						type: 'claim',
						address: holding.id,
						amount: holding.unclaimedAmount,
						txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
						timestamp: new Date().toISOString()
					});
				}
			});
			claimSuccess = true;
			loadClaimsData();
			setTimeout(() => {
				claimSuccess = false;
			}, 3000);
		} catch (error) {
			console.error('Claim failed:', error);
		} finally {
			claiming = false;
		}
	}

	async function handleClaimSingle(assetId: string) {
		claiming = true;
		try {
			const holding = holdings.find(h => h.id === assetId);
			if (!holding || holding.unclaimedAmount <= 0) return;
			await new Promise(resolve => setTimeout(resolve, 1500));
			walletDataService.addTransaction({
				type: 'claim',
				address: assetId,
				amount: holding.unclaimedAmount,
				txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
				timestamp: new Date().toISOString()
			});
			claimSuccess = true;
			loadClaimsData();
			setTimeout(() => {
				claimSuccess = false;
			}, 3000);
		} catch (error) {
			console.error('Individual claim failed:', error);
		} finally {
			claiming = false;
		}
	}

	function exportClaimHistory() {
		const headers = ['Date', 'Asset', 'Amount', 'Transaction Hash'];
		const csvContent = [
			headers.join(','),
			...claimHistory.map(claim => [
				formatDate(claim.date),
				`"${claim.asset}"`,
				claim.amount,
				claim.txHash
			].join(','))
		].join('\n');
		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'albion-claim-history.csv';
		link.click();
		window.URL.revokeObjectURL(url);
	}
</script>

<svelte:head>
	<title>Claims - Albion</title>
	<meta name="description" content="Claim your energy asset payouts and view your payout history." />
</svelte:head>

<PageLayout>
	{#if !$connected || !$signerAddress}
		<HeroSection 
			title="Connect Your Wallet"
			subtitle="Connect your wallet to view and claim your energy asset payouts"
			showBorder={false}
		>
			<div class="text-center mt-8">
				<PrimaryButton on:click={connectWallet}>Connect Wallet</PrimaryButton>
			</div>
		</HeroSection>
	{:else if pageLoading}
		<ContentSection background="white" padding="standard" centered>
			<div class="text-center">
				<div class="w-8 h-8 border-4 border-light-gray border-t-primary animate-spin mx-auto mb-4"></div>
				<p>Loading your claims data...</p>
			</div>
		</ContentSection>
	{:else}
		<!-- Header -->
		<HeroSection 
			title="Claims & Payouts"
			subtitle="Claim your energy asset payouts and track your earnings"
			showBorder={false}
		>
			<!-- Main Stats - Simplified for mobile -->
			<div class="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 mt-8 max-w-4xl mx-auto">
				<StatsCard
					title="Available to Claim"
					value={formatCurrency(unclaimedPayout)}
					subtitle="Ready now"
					size="large"
					valueColor="primary"
				/>
				<StatsCard
					title="Total Earned"
					value={formatCurrency(totalEarned)}
					subtitle="All time"
					size="large"
				/>
				<!-- Third stat only on larger screens -->
				<div class="hidden lg:block">
					<StatsCard
						title="Total Claimed"
						value={formatCurrency(totalClaimed)}
						subtitle="Withdrawn"
						size="large"
					/>
				</div>
			</div>

			<!-- Claim Action -->
			{#if unclaimedPayout > 0}
				<div class="text-center mt-6 lg:mt-8">
					<PrimaryButton 
						on:click={claimAllPayouts} 
						disabled={claiming}
					>
						{claiming ? 'Processing...' : `Claim ${formatCurrency(unclaimedPayout)}`}
					</PrimaryButton>
					<p class="text-sm text-gray-600 mt-2">Estimated gas fee: ${estimatedGas.toFixed(2)}</p>
				</div>
			{/if}

			{#if claimSuccess}
				<div class="text-center mt-4 p-4 bg-green-100 text-green-800 rounded-lg max-w-md mx-auto">
					✅ Claim successful! Tokens have been sent to your wallet.
				</div>
			{/if}
		</HeroSection>

		<!-- Available Claims by Asset -->
		{#if holdings.length > 0}
			<ContentSection background="white" padding="standard">
				<SectionTitle level="h2" size="section" className="mb-6">Claims by Asset</SectionTitle>
				
				<div class="grid grid-cols-1 gap-4 lg:gap-6">
					{#each holdings as holding}
						<Card>
							<CardContent paddingClass="p-4 lg:p-6">
								<div class="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-5 gap-4 items-center">
									<div class="sm:col-span-2">
										<div class="font-extrabold text-black text-sm lg:text-base">{holding.name}</div>
										<div class="text-xs lg:text-sm text-black opacity-70">{holding.location}</div>
									</div>
									<div class="text-center sm:text-left lg:text-center">
										<StatusBadge 
											status={holding.status}
											size="small"
											showIcon={true}
										/>
									</div>
									<div class="text-center">
										<div class="text-lg lg:text-xl font-extrabold text-primary mb-1">{formatCurrency(holding.unclaimedAmount)}</div>
										<div class="text-xs font-bold text-black opacity-70 uppercase tracking-wide">Available</div>
									</div>
									<div class="text-center">
										<SecondaryButton 
											size="small" 
											on:click={() => handleClaimSingle(holding.id)}
											disabled={claiming || holding.unclaimedAmount <= 0}
											fullWidth
										>
											{holding.unclaimedAmount > 0 ? 'Claim' : 'No Claims'}
										</SecondaryButton>
									</div>
								</div>
							</CardContent>
						</Card>
					{/each}
				</div>
			</ContentSection>
		{/if}

		<!-- Expandable Statistics Section - Hidden on mobile by default -->
		<ContentSection background="gray" padding="standard">
			<CollapsibleSection title="Detailed Statistics" isOpenByDefault={false} alwaysOpenOnDesktop={true}>
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
					<StatsCard
						title="Total Payouts"
						value={walletDataService.getMonthlyPayoutHistory().length.toString()}
						subtitle="This year"
						size="medium"
					/>
					<StatsCard
						title="Days Since Last Claim"
						value={(() => {
							const claimTxs = walletDataService.getAllTransactions().filter(tx => tx.type === 'claim');
							if (claimTxs.length === 0) return 'N/A';
							const lastClaim = arrayUtils.latest(claimTxs, tx => tx.timestamp);
							if (!lastClaim) return 'N/A';
							const daysSince = dateUtils.daysBetween(lastClaim.timestamp, new Date());
							return Math.max(0, daysSince).toString();
						})()}
						subtitle="Since last withdrawal"
						size="medium"
					/>
					<StatsCard
						title="Number of Claims"
						value={claimHistory.length.toString()}
						subtitle="Lifetime total"
						size="medium"
					/>
					<StatsCard
						title="Average Claim Size"
						value={claimHistory.length > 0 ? formatCurrency(totalClaimed / claimHistory.length) : '$0'}
						subtitle="Per transaction"
						valueColor="primary"
						size="medium"
					/>
				</div>
			</CollapsibleSection>
		</ContentSection>

		<!-- Expandable Claim History Section -->
		<ContentSection background="white" padding="standard">
			<CollapsibleSection title="Claim History" isOpenByDefault={false} alwaysOpenOnDesktop={true}>
				<div class="flex justify-between items-center mb-6">
					<div class="text-sm text-gray-600">{claimHistory.length} total claims</div>
					<SecondaryButton size="small" on:click={() => exportClaimHistory()}>📊 Export</SecondaryButton>
				</div>
				
				{#if claimHistory.length > 0}
					<div class="bg-white border border-light-gray overflow-hidden rounded-lg">
						<div class="overflow-x-auto">
							<table class="w-full">
								<thead>
									<tr class="bg-light-gray border-b border-light-gray">
										<th class="text-left p-3 lg:p-4 text-xs text-black uppercase tracking-wide font-bold">Date</th>
										<th class="text-left p-3 lg:p-4 text-xs text-black uppercase tracking-wide font-bold">Asset</th>
										<th class="text-left p-3 lg:p-4 text-xs text-black uppercase tracking-wide font-bold">Amount</th>
										<th class="text-center p-3 lg:p-4 text-xs text-black uppercase tracking-wide font-bold hidden sm:table-cell">Transaction</th>
									</tr>
								</thead>
								<tbody>
									{#each claimHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) as claim}
										<tr class="border-b border-light-gray hover:bg-light-gray transition-colors">
											<td class="p-3 lg:p-4 text-sm text-black">{formatDate(claim.date)}</td>
											<td class="p-3 lg:p-4 text-sm text-black">{claim.asset}</td>
											<td class="p-3 lg:p-4 text-sm text-black font-semibold">{formatCurrency(claim.amount)}</td>
											<td class="p-3 lg:p-4 text-center hidden sm:table-cell">
												<a 
													href="https://basescan.org/tx/{claim.txHash}" 
													target="_blank" 
													rel="noopener noreferrer"
													class="text-xs text-secondary hover:text-black transition-colors inline-flex items-center gap-1 font-mono"
												>
													{claim.txHash.slice(0, 10)}...
													<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
														<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
														<polyline points="15,3 21,3 21,9"/>
														<line x1="10" y1="14" x2="21" y2="3"/>
													</svg>
												</a>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
						
						<!-- Pagination Controls -->
						{#if claimHistory.length > itemsPerPage}
							{@const totalPages = Math.ceil(claimHistory.length / itemsPerPage)}
							<div class="flex justify-center items-center gap-2 mt-4">
								<button 
									class="px-3 py-1 text-sm border border-light-gray rounded disabled:opacity-50"
									disabled={currentPage === 1}
									on:click={() => currentPage = Math.max(1, currentPage - 1)}
								>
									Previous
								</button>
								
								<span class="text-sm text-gray-600">
									{currentPage} of {totalPages}
								</span>
								
								<button 
									class="px-3 py-1 text-sm border border-light-gray rounded disabled:opacity-50"
									disabled={currentPage === totalPages}
									on:click={() => currentPage = Math.min(totalPages, currentPage + 1)}
								>
									Next
								</button>
							</div>
						{/if}
					</div>
				{:else}
					<div class="text-center py-8 text-gray-500">
						<p>No claim history yet. Your first claims will appear here.</p>
					</div>
				{/if}
			</CollapsibleSection>
		</ContentSection>
	{/if}
</PageLayout>