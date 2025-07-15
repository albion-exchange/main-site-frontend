<script lang="ts">
	import { onMount } from 'svelte';
	import dataStoreService from '$lib/services/DataStoreService';
	import walletDataService from '$lib/services/WalletDataService';
	import type { Asset } from '$lib/types/uiTypes';
	import { walletStore, walletActions } from '$lib/stores/wallet';
	import WalletModal from '$lib/components/WalletModal.svelte';
	import { Card, CardContent, CardActions, PrimaryButton, SecondaryButton, Metric, StatusBadge, StatsCard, MetricDisplay, SectionTitle, DataTable, TableRow, TabNavigation, TabButton, ActionCard } from '$lib/components/ui';
import { PageLayout, HeroSection, ContentSection } from '$lib/components/layout';

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
				
				return {
					id: assetPayout.assetId,
					name: assetPayout.assetName,
					location: asset ? `${asset.location.state}, ${asset.location.country}` : '',
					unclaimedAmount: assetPayout.unclaimedAmount,
					totalEarned: assetPayout.totalEarned,
					lastPayout: lastPayoutMonth ? lastPayoutMonth.month : null,
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
			loadClaimsData();
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
			<div class="flex flex-col items-center justify-center min-h-[60vh] text-center">
				<SectionTitle level="h1" size="page" center>Wallet Connection Required</SectionTitle>
				<p class="text-lg text-black opacity-80 mb-8 max-w-md">Please connect your wallet to view and claim your payouts.</p>
				<PrimaryButton on:click={() => showWalletModal = true}>
					Connect Wallet
				</PrimaryButton>
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
		showButtons={false}
	>
		<!-- Platform Stats -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-6xl mx-auto mb-12">
			{#if loading}
				<StatsCard
					title="Total Earned"
					value="--"
					subtitle="Loading..."
					size="large"
				/>
				<StatsCard
					title="Total Claimed"
					value="--"
					subtitle="Loading..."
					size="large"
				/>
				<StatsCard
					title="Available to Claim"
					value="--"
					subtitle="Loading..."
					size="large"
				/>
			{:else}
				<StatsCard
					title="Total Earned"
					value={formatCurrency(totalEarned)}
					subtitle="All time earnings"
					size="large"
				/>
				<StatsCard
					title="Total Claimed"
					value={formatCurrency(totalClaimed)}
					subtitle="Successfully withdrawn"
					size="large"
				/>
				<StatsCard
					title="Available to Claim"
					value={formatCurrency(unclaimedPayout)}
					subtitle="Ready for withdrawal"
					valueColor="primary"
					size="large"
				/>
			{/if}
		</div>
	</HeroSection>

	{#if !loading}
		<!-- Success Message -->
		{#if claimSuccess}
			<ContentSection background="white" padding="standard" centered>
				<div class="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
					<div class="text-green-600 font-extrabold text-lg mb-2">✅ Claim Successful!</div>
					<p class="text-green-800">Your payouts have been successfully transferred to your wallet.</p>
				</div>
			</ContentSection>
		{/if}

		<!-- Quick Claim Section -->
		<ContentSection background="white" padding="standard" centered>

			<!-- Quick Claim Section -->
			<div class="bg-light-gray border border-light-gray rounded-lg p-8 mb-8">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
					<div>
						<SectionTitle level="h2" size="subsection" className="mb-6">Quick Claim All</SectionTitle>
						<div class="text-3xl font-extrabold text-primary mb-2">{formatCurrency(unclaimedPayout)}</div>
						<div class="text-sm text-black opacity-70 font-semibold mb-6">Total Available</div>
						<div class="space-y-2 text-sm">
							<div class="flex justify-between">
								<span class="text-black opacity-70 font-semibold">Estimated Gas:</span>
								<span class="font-extrabold">{formatCurrency(estimatedGas)}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-black opacity-70 font-semibold">Net Amount:</span>
								<span class="font-extrabold text-primary">{formatCurrency(unclaimedPayout - estimatedGas)}</span>
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
						<SecondaryButton>Claim & Reinvest</SecondaryButton>
					</div>
				</div>
			</div>
		</ContentSection>

		<!-- Asset-by-Asset Claiming -->
		<ContentSection background="white" padding="standard" centered>
			<div class="flex justify-between items-center mb-6">
				<SectionTitle level="h2" size="section">Claim by Asset</SectionTitle>
				<div class="flex gap-4">
					<SecondaryButton
						size="small"
						on:click={handleSelectAll}
					>
						{selectedAssets.length === holdings.length ? 'Deselect All' : 'Select All'}
					</SecondaryButton>
					{#if selectedAssets.length > 0}
						<PrimaryButton
							size="small"
							on:click={handleClaim}
							disabled={claiming}
						>
							{#if claiming}
								Claiming...
							{:else}
								Claim Selected {formatCurrency(getSelectedAmount())}
							{/if}
						</PrimaryButton>
					{/if}
				</div>
			</div>

			<div class="space-y-4">
				{#each holdings as holding}
					<div class="{selectedAssets.includes(holding.id) ? 'ring-2 ring-primary rounded-lg' : ''}">
						<Card hoverable showBorder>
							<CardContent paddingClass="p-6">
							<div class="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
								<div class="flex items-center gap-4">
									<input 
										type="checkbox" 
										class="w-4 h-4"
										checked={selectedAssets.includes(holding.id)}
										on:change={() => handleAssetSelect(holding.id)}
									/>
									<div>
										<div class="font-extrabold text-black text-sm">{holding.name}</div>
										<div class="text-xs text-black opacity-70">{holding.location}</div>
									</div>
								</div>
								<div class="text-center">
									<StatusBadge 
										status={holding.status}
										size="small"
										showIcon={true}
									/>
								</div>
								<div class="text-center">
									<div class="text-lg font-extrabold text-primary mb-1">{formatCurrency(holding.unclaimedAmount)}</div>
									<div class="text-xs font-bold text-black opacity-70 uppercase tracking-wide">Unclaimed</div>
								</div>
								<div class="text-center">
									<div class="text-lg font-extrabold text-black mb-1">{formatCurrency(holding.totalEarned)}</div>
									<div class="text-xs font-bold text-black opacity-70 uppercase tracking-wide">Total Earned</div>
								</div>
								<div class="text-center">
									<SecondaryButton size="small" on:click={() => handleAssetSelect(holding.id)}>Claim</SecondaryButton>
								</div>
							</div>
							<div class="mt-4 pt-4 border-t border-light-gray text-xs text-black opacity-70">
								Last Payout: {holding.lastPayout ? formatDate(holding.lastPayout) : 'No payouts yet'}
							</div>
						</CardContent>
					</Card>
					</div>
				{/each}
			</div>
		</ContentSection>

		<!-- Claim Settings & History -->
		<ContentSection background="gray" padding="standard" centered>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
				<!-- Claim Settings -->
				<Card showBorder>
					<CardContent paddingClass="p-6">
						<SectionTitle level="h3" size="subsection" className="mb-6">Claim Settings</SectionTitle>
						<div class="space-y-4">
							<div class="text-xs font-bold text-black opacity-70 uppercase tracking-wide mb-4">Claim Method</div>
							<div class="space-y-3">
								<label class="flex items-center gap-3 cursor-pointer">
									<input 
										type="radio" 
										name="claimMethod" 
										value="wallet"
										bind:group={claimMethod}
										class="w-4 h-4"
									/>
									<div>
										<div class="font-extrabold text-black text-sm">Direct to Wallet</div>
										<div class="text-xs text-black opacity-70">Instant transfer to connected wallet</div>
									</div>
								</label>
								<label class="flex items-center gap-3 cursor-pointer">
									<input 
										type="radio" 
										name="claimMethod" 
										value="reinvest"
										bind:group={claimMethod}
										class="w-4 h-4"
									/>
									<div>
										<div class="font-extrabold text-black text-sm">Auto-Reinvest</div>
										<div class="text-xs text-black opacity-70">Automatically purchase more tokens</div>
									</div>
								</label>
							</div>
						</div>
					</CardContent>
				</Card>

				<!-- Statistics -->
				<Card showBorder>
					<CardContent paddingClass="p-6">
						<SectionTitle level="h3" size="subsection" className="mb-6">Payout Statistics</SectionTitle>
						<div class="space-y-4">
							<div class="flex justify-between items-center">
								<span class="text-sm text-black opacity-70">Total Payouts This Year:</span>
								<span class="font-extrabold text-black">{walletDataService.getMonthlyPayoutHistory().length}</span>
							</div>
							<div class="flex justify-between items-center">
								<span class="text-sm text-black opacity-70">Days Since Last Claim:</span>
								<span class="font-extrabold text-black">{(() => {
									const claimTxs = walletDataService.getAllTransactions().filter(tx => tx.type === 'claim');
									if (claimTxs.length === 0) return 'N/A';
									const lastClaim = claimTxs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
									const daysSince = Math.floor((Date.now() - new Date(lastClaim.timestamp).getTime()) / (1000 * 60 * 60 * 24));
									return Math.max(0, daysSince); // Ensure we don't show negative days
								})()}</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</ContentSection>

		<!-- Claim History -->
		<ContentSection background="white" padding="standard" centered>
			<div class="flex justify-between items-center mb-6">
				<SectionTitle level="h2" size="section">Claim History</SectionTitle>
				<div class="flex gap-2">
					<TabButton>Export</TabButton>
				</div>
			</div>
			
			<div class="bg-white border border-light-gray rounded-lg overflow-hidden">
				<div class="grid grid-cols-[1fr_2fr_1fr_1.5fr] gap-4 p-4 bg-light-gray border-b border-light-gray">
					<div class="text-xs text-black uppercase tracking-wide">Date</div>
					<div class="text-xs text-black uppercase tracking-wide">Asset</div>
					<div class="text-xs text-black uppercase tracking-wide">Amount</div>
					<div class="text-xs text-black uppercase tracking-wide">Transaction</div>
				</div>
				
				{#each claimHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) as claim}
					<div class="grid grid-cols-[1fr_2fr_1fr_1.5fr] gap-4 p-4 border-b border-light-gray hover:bg-light-gray transition-colors">
						<div class="text-sm text-black">{formatDate(claim.date)}</div>
						<div class="text-sm text-black">{claim.asset}</div>
						<div class="text-sm text-black">{formatCurrency(claim.amount)}</div>
						<div class="text-xs text-black opacity-70 font-mono flex items-center gap-1">
							<a 
								href="https://basescan.org/tx/{claim.txHash}" 
								target="_blank" 
								rel="noopener noreferrer"
								class="text-black hover:text-secondary transition-colors flex items-center gap-1"
							>
								{claim.txHash.slice(0, 8)}...{claim.txHash.slice(-6)}
								<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
									<polyline points="15 3 21 3 21 9"></polyline>
									<line x1="10" y1="14" x2="21" y2="3"></line>
								</svg>
							</a>
						</div>
					</div>
				{/each}
			</div>
			
			<!-- Pagination -->
			{#if claimHistory.length > itemsPerPage}
				<div class="flex justify-center items-center gap-4 mt-6">
					<button 
						class="px-3 py-1 text-sm text-black border border-light-gray rounded hover:bg-light-gray transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={currentPage === 1}
						on:click={() => currentPage -= 1}
					>
						Previous
					</button>
					
					<div class="flex gap-2">
						{#each Array(Math.ceil(claimHistory.length / itemsPerPage)) as _, i}
							<button 
								class="w-8 h-8 text-sm text-black border border-light-gray rounded hover:bg-light-gray transition-colors {currentPage === i + 1 ? 'bg-light-gray' : ''}"
								on:click={() => currentPage = i + 1}
							>
								{i + 1}
							</button>
						{/each}
					</div>
					
					<button 
						class="px-3 py-1 text-sm text-black border border-light-gray rounded hover:bg-light-gray transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={currentPage === Math.ceil(claimHistory.length / itemsPerPage)}
						on:click={() => currentPage += 1}
					>
						Next
					</button>
				</div>
			{:else}
				<div class="flex justify-center items-center gap-2 mt-6">
					<span class="text-sm text-black">Page</span>
					<span class="w-8 h-8 text-sm text-black border border-light-gray rounded bg-light-gray flex items-center justify-center">1</span>
				</div>
			{/if}
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

