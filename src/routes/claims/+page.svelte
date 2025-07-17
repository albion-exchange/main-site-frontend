<script lang="ts">
	import { onMount } from 'svelte';
	import dataStoreService from '$lib/services/DataStoreService';
	import walletDataService from '$lib/services/WalletDataService';
	import type { Asset } from '$lib/types/uiTypes';
	import { walletStore, walletActions } from '$lib/stores/wallet';
	import WalletModal from '$lib/components/WalletModal.svelte';
	import { Card, CardContent, CardActions, PrimaryButton, SecondaryButton, Metric, StatusBadge, StatsCard, MetricDisplay, SectionTitle, DataTable, TableRow, TabNavigation, TabButton, ActionCard } from '$lib/components/ui';
	import { PageLayout, HeroSection, ContentSection, FullWidthSection } from '$lib/components/layout';
	import { formatCurrency } from '$lib/utils/formatters';

	let totalEarned = 0;
	let totalClaimed = 0;
	let unclaimedPayout = 0;
	let loading = true;
	let claiming = false;
	let claimSuccess = false;
	let selectedAssets: string[] = [];
	let claimMethod = 'wallet';
	let showWalletModal = false;
	let estimatedGas = 0;

	let holdings: any[] = [];
	let claimHistory: any[] = [];
	let currentPage = 1;
	const itemsPerPage = 20;
	let showClaimModal = false;
	let claimModalMode: 'claim' | 'reinvest' = 'claim';

	function loadClaimsData() {
		try {
			// Set a fixed gas fee
			estimatedGas = 1.25;
			
			// Load data from wallet service
			totalEarned = walletDataService.getTotalPayoutsEarned();
			unclaimedPayout = walletDataService.getUnclaimedPayouts();
			
			// Calculate total claimed from claim transactions
			const allTransactions = walletDataService.getAllTransactions();
			const claimTransactions = allTransactions.filter(tx => tx.type === 'claim');
			totalClaimed = claimTransactions.reduce((sum, tx) => sum + tx.amount, 0);
			
			// Get holdings by asset
			const assetPayouts = walletDataService.getHoldingsByAsset();
			holdings = assetPayouts.map(assetPayout => {
				const asset = dataStoreService.getAssetById(assetPayout.assetId);
				if (!asset) return null;
				
				// Find last payout date from monthly payouts
				const lastPayoutMonth = assetPayout.monthlyPayouts
					.filter(p => p.amount > 0)
					.sort((a, b) => b.month.localeCompare(a.month))[0];
				
				// Get the contract address for this asset
				const tokens = dataStoreService.getTokensByAssetId(assetPayout.assetId);
				const contractAddress = tokens.length > 0 ? tokens[0].contractAddress : null;
				
				// Find last claim for this asset
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
			
			// Get claim history from transactions
			claimHistory = claimTransactions.map(tx => {
				// Find the asset name for this transaction
				const token = dataStoreService.getTokenByAddress(tx.address);
				const asset = token ? dataStoreService.getAssetById(token.assetId) : null;
				
				return {
					date: tx.timestamp,
					amount: tx.amount,
					asset: asset ? asset.name : 'Unknown Asset',
					txHash: tx.txHash,
					status: 'completed'
				};
			});
			
			loading = false;
		} catch (error) {
			console.error('Error loading claims data:', error);
			loading = false;
		}
	}

	onMount(async () => {
		// Check if wallet is connected
		if (!$walletStore.isConnected) {
			showWalletModal = true;
			return;
		}
		
		loadClaimsData();
	});

	function formatDate(dateString: string): string {
		// Handle YYYY-MM format
		if (dateString && dateString.match(/^\d{4}-\d{2}$/)) {
			const [year, month] = dateString.split('-');
			const date = new Date(parseInt(year), parseInt(month) - 1, 1);
			return date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short'
			});
		}
		
		// Handle full date format
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

	function handleConnectWallet() {
		showWalletModal = false;
		// Reload data after wallet connection
		if ($walletStore.isConnected) {
			loadClaimsData();
		}
	}

	function openClaimModal(mode: 'claim' | 'reinvest') {
		claimModalMode = mode;
		showClaimModal = true;
	}

	async function handleClaimPayouts() {
		if (selectedAssets.length === 0) return;
		
		claiming = true;
		
		// Simulate claim process
		setTimeout(() => {
			claiming = false;
			claimSuccess = true;
			showClaimModal = false;
			
			// Reset after showing success
			setTimeout(() => {
				claimSuccess = false;
				selectedAssets = [];
				loadClaimsData(); // Reload data
			}, 3000);
		}, 2000);
	}

	// Calculate selected amount
	$: selectedAmount = holdings
		.filter(h => selectedAssets.includes(h.id))
		.reduce((sum, h) => sum + h.unclaimedAmount, 0);

	// Calculate total pages for pagination
	$: totalPages = Math.ceil(claimHistory.length / itemsPerPage);

	// Get current page of claim history
	$: paginatedClaimHistory = claimHistory.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	function handlePageChange(page: number) {
		currentPage = page;
	}
</script>

<svelte:head>
	<title>Claims - Albion</title>
	<meta name="description" content="Claim your oil & gas token payouts and track your earnings history on Albion." />
</svelte:head>

{#if showWalletModal}
	<WalletModal 
		onClose={() => showWalletModal = false}
		onConnect={handleConnectWallet}
	/>
{/if}

<PageLayout variant="fullWidth">
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
					Connect your wallet to view and claim your oil & gas token payouts.
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
				<p class="text-lg text-black opacity-70">Loading your payouts...</p>
			</div>
		</ContentSection>
	{:else}
		<!-- Claims Header -->
		<ContentSection background="gray" padding="large">
			<div class="mb-8">
				<h1 class="text-4xl md:text-5xl font-extrabold text-black uppercase tracking-tight mb-2">Claim Payouts</h1>
				<p class="text-lg text-black opacity-70">Claim your earnings from oil & gas token investments</p>
			</div>

			<!-- Key Metrics -->
			<div class="grid md:grid-cols-4 grid-cols-1 gap-6 mb-8">
				<StatsCard
					title="Total Earned"
					value={formatCurrency(totalEarned)}
					icon="💰"
					trend={0}
					variant="default"
				/>
				<StatsCard
					title="Total Claimed"
					value={formatCurrency(totalClaimed)}
					icon="✅"
					trend={0}
					variant="success"
				/>
				<StatsCard
					title="Unclaimed Payouts"
					value={formatCurrency(unclaimedPayout)}
					icon="🎯"
					trend={0}
					variant="warning"
				/>
				<StatsCard
					title="Available Now"
					value={formatCurrency(unclaimedPayout - estimatedGas)}
					icon="💵"
					trend={0}
					variant="primary"
					note="After gas fees"
				/>
			</div>
		</ContentSection>

		<!-- Claims Content -->
		<ContentSection background="white" padding="large">
			{#if claimSuccess}
				<!-- Success Message -->
				<div class="bg-green-50 border border-green-200 p-6 rounded-lg mb-8">
					<div class="flex items-center">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-600 mr-3">
							<path d="M20 6L9 17l-5-5"/>
						</svg>
						<div>
							<h3 class="text-lg font-semibold text-green-800">Claim Successful!</h3>
							<p class="text-green-700">Your payouts have been claimed and will be available in your wallet shortly.</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Pending Payouts Table -->
			<div class="mb-8">
				<div class="flex justify-between items-center mb-6">
					<SectionTitle level="h2" className="mb-0">Pending Payouts</SectionTitle>
					{#if holdings.length > 0}
						<button
							class="text-primary font-semibold hover:text-secondary transition-colors duration-200"
							on:click={handleSelectAll}
						>
							{selectedAssets.length === holdings.length ? 'Deselect All' : 'Select All'}
						</button>
					{/if}
				</div>

				{#if holdings.length > 0}
					<Card>
						<CardContent className="p-0">
							<div class="overflow-x-auto">
								<table class="w-full">
									<thead class="bg-light-gray">
										<tr>
											<th class="w-12 px-6 py-4">
												<input
													type="checkbox"
													checked={selectedAssets.length === holdings.length}
													on:change={handleSelectAll}
													class="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary"
													aria-label="Select all assets"
												/>
											</th>
											<th class="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">Asset</th>
											<th class="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">Location</th>
											<th class="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">Unclaimed</th>
											<th class="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">Total Earned</th>
											<th class="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">Last Payout</th>
											<th class="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">Status</th>
										</tr>
									</thead>
									<tbody class="bg-white divide-y divide-light-gray">
										{#each holdings as holding}
											<tr class="hover:bg-light-gray transition-colors duration-200">
												<td class="px-6 py-4">
													<input
														type="checkbox"
														checked={selectedAssets.includes(holding.id)}
														on:change={() => handleAssetSelect(holding.id)}
														class="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary"
														aria-label="Select {holding.name}"
													/>
												</td>
												<td class="px-6 py-4 whitespace-nowrap">
													<div>
														<div class="text-sm font-semibold text-black">{holding.name}</div>
													</div>
												</td>
												<td class="px-6 py-4 whitespace-nowrap text-sm text-black opacity-70">
													{holding.location}
												</td>
												<td class="px-6 py-4 whitespace-nowrap">
													<span class="text-sm font-bold text-primary">
														{formatCurrency(holding.unclaimedAmount)}
													</span>
												</td>
												<td class="px-6 py-4 whitespace-nowrap text-sm text-black">
													{formatCurrency(holding.totalEarned)}
												</td>
												<td class="px-6 py-4 whitespace-nowrap text-sm text-black opacity-70">
													{holding.lastPayout ? formatDate(holding.lastPayout) : 'N/A'}
												</td>
												<td class="px-6 py-4 whitespace-nowrap">
													<StatusBadge status={holding.status === 'producing' ? 'success' : 'warning'}>
														{holding.status}
													</StatusBadge>
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>

					<!-- Claim Actions -->
					{#if selectedAssets.length > 0}
						<div class="mt-6 bg-light-gray p-6 rounded-lg">
							<div class="flex justify-between items-center mb-4">
								<div>
									<p class="text-sm text-black opacity-70 mb-1">Selected Payouts</p>
									<p class="text-2xl font-extrabold text-black">{formatCurrency(selectedAmount)}</p>
								</div>
								<div class="text-right">
									<p class="text-sm text-black opacity-70 mb-1">Estimated Gas</p>
									<p class="text-lg font-semibold text-black">{formatCurrency(estimatedGas)}</p>
								</div>
							</div>
							<div class="flex gap-4">
								<PrimaryButton on:click={() => openClaimModal('claim')} className="flex-1">
									Claim to Wallet ({formatCurrency(selectedAmount - estimatedGas)})
								</PrimaryButton>
								<SecondaryButton on:click={() => openClaimModal('reinvest')} className="flex-1">
									Reinvest Payouts
								</SecondaryButton>
							</div>
						</div>
					{/if}
				{:else}
					<div class="text-center py-16">
						<div class="inline-flex items-center justify-center w-24 h-24 bg-light-gray rounded-full mb-6">
							<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-secondary">
								<circle cx="12" cy="12" r="10"/>
								<path d="M8 12h8"/>
							</svg>
						</div>
						<h3 class="text-2xl font-extrabold text-black mb-4">No Pending Payouts</h3>
						<p class="text-black opacity-70 mb-8 max-w-lg mx-auto">
							You don't have any unclaimed payouts at the moment. Check back after the next distribution period.
						</p>
						<PrimaryButton href="/portfolio">
							View Portfolio →
						</PrimaryButton>
					</div>
				{/if}
			</div>

			<!-- Claim History -->
			<div>
				<SectionTitle level="h2" className="mb-6">Claim History</SectionTitle>

				{#if claimHistory.length > 0}
					<Card>
						<CardContent className="p-0">
							<div class="overflow-x-auto">
								<table class="w-full">
									<thead class="bg-light-gray">
										<tr>
											<th class="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">Date</th>
											<th class="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">Asset</th>
											<th class="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">Amount</th>
											<th class="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">Transaction</th>
											<th class="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">Status</th>
										</tr>
									</thead>
									<tbody class="bg-white divide-y divide-light-gray">
										{#each paginatedClaimHistory as claim}
											<tr>
												<td class="px-6 py-4 whitespace-nowrap text-sm text-black">
													{formatDate(claim.date)}
												</td>
												<td class="px-6 py-4 whitespace-nowrap text-sm text-black">
													{claim.asset}
												</td>
												<td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
													+{formatCurrency(claim.amount)}
												</td>
												<td class="px-6 py-4 whitespace-nowrap text-sm">
													<a 
														href={`https://etherscan.io/tx/${claim.txHash}`}
														target="_blank"
														rel="noopener noreferrer"
														class="text-primary hover:text-secondary font-mono text-xs"
													>
														{claim.txHash.slice(0, 8)}...{claim.txHash.slice(-6)}
													</a>
												</td>
												<td class="px-6 py-4 whitespace-nowrap">
													<StatusBadge status="success">Completed</StatusBadge>
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>

					<!-- Pagination -->
					{#if totalPages > 1}
						<div class="mt-6 flex justify-center">
							<nav class="flex gap-2">
								<button
									class="px-3 py-2 text-sm font-semibold bg-white border border-light-gray rounded hover:bg-light-gray disabled:opacity-50 disabled:cursor-not-allowed"
									disabled={currentPage === 1}
									on:click={() => handlePageChange(currentPage - 1)}
								>
									Previous
								</button>
								{#each Array(totalPages) as _, i}
									<button
										class="px-3 py-2 text-sm font-semibold rounded {currentPage === i + 1 ? 'bg-secondary text-white' : 'bg-white border border-light-gray hover:bg-light-gray'}"
										on:click={() => handlePageChange(i + 1)}
									>
										{i + 1}
									</button>
								{/each}
								<button
									class="px-3 py-2 text-sm font-semibold bg-white border border-light-gray rounded hover:bg-light-gray disabled:opacity-50 disabled:cursor-not-allowed"
									disabled={currentPage === totalPages}
									on:click={() => handlePageChange(currentPage + 1)}
								>
									Next
								</button>
							</nav>
						</div>
					{/if}
				{:else}
					<Card>
						<CardContent className="text-center py-12">
							<p class="text-black opacity-70">No claim history yet. Your claimed payouts will appear here.</p>
						</CardContent>
					</Card>
				{/if}
			</div>
		</ContentSection>
	{/if}
</PageLayout>

<!-- Claim Modal -->
{#if showClaimModal}
	<div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
		<div class="bg-white max-w-md w-full p-8 relative rounded-lg">
			<button 
				class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-light-gray text-black rounded-full hover:bg-secondary hover:text-white transition-all duration-200"
				on:click={() => showClaimModal = false}
				aria-label="Close modal"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
					<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
				</svg>
			</button>
			
			<h2 class="text-2xl font-extrabold text-black mb-6 uppercase tracking-tight">
				{claimModalMode === 'claim' ? 'Confirm Claim' : 'Reinvest Payouts'}
			</h2>
			
			<div class="mb-6">
				<div class="bg-light-gray p-4 rounded mb-4">
					<div class="flex justify-between mb-2">
						<span class="text-black opacity-70">Selected Payouts:</span>
						<span class="font-semibold text-black">{formatCurrency(selectedAmount)}</span>
					</div>
					<div class="flex justify-between mb-2">
						<span class="text-black opacity-70">Gas Fees:</span>
						<span class="font-semibold text-black">-{formatCurrency(estimatedGas)}</span>
					</div>
					<div class="border-t border-gray-300 pt-2 mt-2">
						<div class="flex justify-between">
							<span class="font-semibold text-black">
								{claimModalMode === 'claim' ? 'You Will Receive:' : 'Available to Reinvest:'}
							</span>
							<span class="text-xl font-extrabold text-primary">
								{formatCurrency(selectedAmount - estimatedGas)}
							</span>
						</div>
					</div>
				</div>
				
				{#if claimModalMode === 'claim'}
					<p class="text-sm text-black opacity-70">
						Funds will be sent to your connected wallet address. Transaction may take a few minutes to complete.
					</p>
				{:else}
					<p class="text-sm text-black opacity-70 mb-4">
						Choose assets to reinvest your payouts into:
					</p>
					<div class="space-y-2 max-h-48 overflow-y-auto">
						<label class="flex items-center p-3 bg-light-gray rounded hover:bg-gray-200 cursor-pointer">
							<input type="radio" name="reinvest" class="mr-3" />
							<div>
								<div class="font-semibold text-black">EUR WR-1 Well</div>
								<div class="text-sm text-black opacity-70">Current yield: 2.8%</div>
							</div>
						</label>
						<label class="flex items-center p-3 bg-light-gray rounded hover:bg-gray-200 cursor-pointer">
							<input type="radio" name="reinvest" class="mr-3" />
							<div>
								<div class="font-semibold text-black">BLK PAD-2 Well</div>
								<div class="text-sm text-black opacity-70">Current yield: 3.1%</div>
							</div>
						</label>
					</div>
				{/if}
			</div>
			
			<div class="flex gap-4">
				<PrimaryButton 
					on:click={handleClaimPayouts} 
					disabled={claiming}
					className="flex-1"
				>
					{claiming ? 'Processing...' : claimModalMode === 'claim' ? 'Confirm Claim' : 'Confirm Reinvestment'}
				</PrimaryButton>
				<SecondaryButton 
					on:click={() => showClaimModal = false}
					disabled={claiming}
					className="flex-1"
				>
					Cancel
				</SecondaryButton>
			</div>
		</div>
	</div>
{/if}

<style>
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