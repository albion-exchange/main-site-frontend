<script lang="ts">
	import { onMount } from 'svelte';
	import { walletStore } from '$lib/stores/wallet';
	import { useClaimsData } from '$lib/composables/useClaimsData';
	import WalletModal from '$lib/components/WalletModal.svelte';
	import { Card, CardContent, PrimaryButton, SecondaryButton, StatusBadge, StatsCard, SectionTitle, TabButton, Checkbox, RadioGroup, Radio } from '$lib/components/ui';
	import { PageLayout, HeroSection, ContentSection, FullWidthSection } from '$lib/components/layout';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { formatCurrency } from '$lib/utils/formatters';

	// Composables
	const claimsData = useClaimsData();
	
	// Component state
	let showWalletModal = false;
	let activeTab = 'pending';
	let currentPage = 1;
	const itemsPerPage = 20;
	
	// Reactive data
	$: claims = $claimsData.state;
	$: selectedAmount = $claimsData.selectedAmount;
	$: claimStats = $claimsData.claimStats;
	$: claimModal = $claimsData.claimModal;
	
	// Pagination
	$: totalPages = Math.ceil(claims.claimHistory.length / itemsPerPage);
	$: paginatedHistory = claims.claimHistory.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);
	
	onMount(() => {
		if (!$walletStore.isConnected) {
			showWalletModal = true;
		}
	});
	
	function formatDate(dateStr: string): string {
		if (!dateStr) return 'Never';
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', { 
			month: 'short', 
			day: 'numeric', 
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
	
	function handleClaimAll() {
		claimsData.selectAllAssets();
		claimsData.showClaimModal('claim');
	}
	
	function handleClaimWithModal(mode: 'claim' | 'reinvest') {
		claimsData.showClaimModal(mode);
	}
	
	function handleAssetSelect(assetId: string) {
		claimsData.toggleAssetSelection(assetId);
		claimsData.showClaimModal('claim');
	}
	
	async function handleConfirmClaim() {
		await claimsData.claimPayouts();
		claimsData.hideClaimModal();
	}
</script>

<svelte:head>
	<title>Claims - Albion</title>
	<meta name="description" content="Claim your oil & gas royalty payouts and track your payment history on Albion." />
</svelte:head>

{#if showWalletModal}
	<WalletModal 
		isOpen={true} 
		on:close={() => showWalletModal = false}
		on:connect={() => {
			showWalletModal = false;
			claimsData.loadClaimsData();
		}}
	/>
{/if}

<PageLayout>
	<!-- Hero Section with Stats -->
	<HeroSection 
		title="Claim Payouts"
		subtitle="Withdraw your earnings from oil & gas production"
		showBorder={true}
		showButtons={false}
	>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			{#if claims.loading}
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
					value={formatCurrency(claims.totalEarned)}
					subtitle="All time earnings"
					size="large"
				/>
				<StatsCard
					title="Total Claimed"
					value={formatCurrency(claims.totalClaimed)}
					subtitle="Successfully withdrawn"
					size="large"
				/>
				<StatsCard
					title="Available to Claim"
					value={formatCurrency(claims.unclaimedPayout)}
					subtitle="Ready for withdrawal"
					valueColor="primary"
					size="large"
				/>
			{/if}
		</div>
	</HeroSection>

	<!-- Quick Claim Section -->
	<FullWidthSection background="gray" padding="standard">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
			<div>
				<SectionTitle level="h2" size="subsection" className="mb-6">Quick Claim All</SectionTitle>
				<div class="text-3xl font-extrabold text-primary mb-2">{formatCurrency(claims.unclaimedPayout)}</div>
				<div class="text-sm text-black opacity-70 font-semibold mb-6">Total Available</div>
				<div class="space-y-2 text-sm">
					<div class="flex justify-between">
						<span class="text-black opacity-70 font-semibold">Estimated Gas:</span>
						<span class="font-extrabold">{formatCurrency(claims.estimatedGas)}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-black opacity-70 font-semibold">Net Amount:</span>
						<span class="font-extrabold text-primary">{formatCurrency(claims.unclaimedPayout - claims.estimatedGas)}</span>
					</div>
				</div>
			</div>
			<div class="flex flex-col gap-4 justify-center">
				<PrimaryButton
					on:click={handleClaimAll}
					disabled={claims.claiming || claims.unclaimedPayout <= 0}
				>
					{#if claims.claiming}
						Claiming...
					{:else}
						Claim All {formatCurrency(claims.unclaimedPayout)}
					{/if}
				</PrimaryButton>
				<SecondaryButton 
					on:click={() => handleClaimWithModal('reinvest')} 
					disabled={claims.claiming || claims.unclaimedPayout <= 0}
				>
					Claim & Reinvest
				</SecondaryButton>
			</div>
		</div>
	</FullWidthSection>

	<!-- Claims Tab Section -->
	<ContentSection>
		<div class="flex justify-between items-center mb-6">
			<div class="flex gap-4 border-b">
				<TabButton 
					active={activeTab === 'pending'} 
					on:click={() => activeTab = 'pending'}
				>
					Pending Claims ({claims.holdings.length})
				</TabButton>
				<TabButton 
					active={activeTab === 'history'} 
					on:click={() => activeTab = 'history'}
				>
					Claim History
				</TabButton>
			</div>
			{#if activeTab === 'pending' && claims.selectedAssets.length > 0}
				<PrimaryButton
					on:click={() => handleClaimWithModal('claim')}
					disabled={claims.claiming}
					size="small"
				>
					{#if claims.claiming}
						Claiming...
					{:else}
						Claim Selected {formatCurrency(selectedAmount)}
					{/if}
				</PrimaryButton>
			{/if}
		</div>

		{#if activeTab === 'pending'}
			<div class="space-y-4">
				{#if claims.holdings.length === 0}
					<Card>
						<CardContent className="text-center py-12">
							<p class="text-black opacity-70 mb-4">No pending claims</p>
							<p class="text-sm text-black opacity-50">Your payouts will appear here when available</p>
						</CardContent>
					</Card>
				{:else}
					{#each claims.holdings as holding}
						<Card hoverable showBorder>
							<CardContent paddingClass="p-6">
								<div class="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
									<div class="md:col-span-2">
										<h4 class="font-extrabold text-black text-lg mb-1">{holding.name}</h4>
										<p class="text-sm text-black opacity-70">{holding.location}</p>
										<StatusBadge 
											status={holding.status} 
											variant={holding.status === 'producing' ? 'available' : 'default'}
											size="small"
											showIcon={true}
										/>
									</div>
									<div class="text-center">
										<div class="text-lg font-extrabold text-primary mb-1">{formatCurrency(holding.unclaimedAmount)}</div>
										<div class="text-xs font-bold text-black opacity-70 uppercase tracking-wide">Unclaimed</div>
										<div class="text-xs text-black opacity-60 mt-1">Last claimed: {formatDate(holding.lastClaimDate)}</div>
									</div>
									<div class="text-center">
										<div class="text-lg font-extrabold text-black mb-1">{formatCurrency(holding.totalEarned)}</div>
										<div class="text-xs font-bold text-black opacity-70 uppercase tracking-wide">Total Earned</div>
										<div class="text-xs text-black opacity-60 mt-1">Last payout: {formatDate(holding.lastPayout)}</div>
									</div>
									<div class="text-center">
										<SecondaryButton size="small" on:click={() => handleAssetSelect(holding.id)}>Claim</SecondaryButton>
									</div>
								</div>
							</CardContent>
						</Card>
					{/each}
				{/if}
			</div>
		{:else if activeTab === 'history'}
			<div class="space-y-6">
				<!-- History Stats -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
					<StatsCard
						title="Total Claims"
						value={claimStats.totalClaims.toString()}
						subtitle="Lifetime total"
						size="medium"
					/>
					<StatsCard
						title="Average Claim Size"
						value={formatCurrency(claimStats.avgClaimSize)}
						subtitle="Per transaction"
						valueColor="primary"
						size="medium"
					/>
					<StatsCard
						title="Last Claim"
						value={claimStats.lastClaimDate ? formatDate(claimStats.lastClaimDate) : 'Never'}
						subtitle="Most recent"
						size="medium"
					/>
				</div>

				<!-- Claim History Table -->
				{#if claims.claimHistory.length === 0}
					<Card>
						<CardContent className="text-center py-12">
							<p class="text-black opacity-70">No claim history yet</p>
						</CardContent>
					</Card>
				{:else}
					<Card>
						<CardContent paddingClass="p-0">
							<div class="overflow-x-auto">
								<table class="w-full">
									<thead>
										<tr class="border-b border-light-gray">
											<th class="text-left p-4 font-semibold text-black opacity-70 uppercase text-xs tracking-wider">Date</th>
											<th class="text-left p-4 font-semibold text-black opacity-70 uppercase text-xs tracking-wider">Asset</th>
											<th class="text-left p-4 font-semibold text-black opacity-70 uppercase text-xs tracking-wider">Amount</th>
											<th class="text-center p-4 font-semibold text-black opacity-70 uppercase text-xs tracking-wider">Transaction</th>
										</tr>
									</thead>
									<tbody>
										{#each paginatedHistory as claim}
											<tr class="border-b border-light-gray hover:bg-light-gray transition-colors">
												<td class="p-4 text-sm text-black">{formatDate(claim.date)}</td>
												<td class="p-4 text-sm text-black">{claim.asset}</td>
												<td class="p-4 text-sm text-black">{formatCurrency(claim.amount)}</td>
												<td class="p-4 text-center">
													<a 
														href="https://basescan.org/tx/{claim.txHash}" 
														target="_blank" 
														rel="noopener noreferrer"
														class="text-primary hover:underline text-sm font-semibold"
													>
														View TX
													</a>
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
							
							{#if totalPages > 1}
								<div class="p-4 border-t border-light-gray flex justify-center gap-2">
									<SecondaryButton 
										size="small" 
										on:click={() => currentPage = Math.max(1, currentPage - 1)}
										disabled={currentPage === 1}
									>
										Previous
									</SecondaryButton>
									<span class="px-4 py-2 text-sm">Page {currentPage} of {totalPages}</span>
									<SecondaryButton 
										size="small" 
										on:click={() => currentPage = Math.min(totalPages, currentPage + 1)}
										disabled={currentPage === totalPages}
									>
										Next
									</SecondaryButton>
								</div>
							{/if}
						</CardContent>
					</Card>
				{/if}
			</div>
		{/if}
	</ContentSection>
</PageLayout>

<!-- Claim Modal -->
{#if claimModal.show}
	<Modal 
		title={claimModal.mode === 'reinvest' ? 'Claim & Reinvest' : 'Confirm Claim'}
		isOpen={true}
		on:close={() => claimsData.hideClaimModal()}
	>
		<div slot="content">
			<div class="space-y-4 mb-6">
				<div class="bg-light-gray rounded-lg p-4">
					<div class="flex justify-between items-center mb-2">
						<span class="text-sm font-semibold text-black opacity-70">Claim Amount:</span>
						<span class="font-extrabold text-black">{formatCurrency(selectedAmount || claims.unclaimedPayout)}</span>
					</div>
					<div class="flex justify-between items-center mb-2">
						<span class="text-sm font-semibold text-black opacity-70">Gas Fee:</span>
						<span class="font-extrabold text-black">-{formatCurrency(claims.estimatedGas)}</span>
					</div>
					<div class="border-t border-gray-300 pt-2 mt-2">
						<div class="flex justify-between items-center">
							<span class="text-sm font-semibold text-black">You will receive:</span>
							<span class="font-extrabold text-primary text-lg">{formatCurrency((selectedAmount || claims.unclaimedPayout) - claims.estimatedGas)}</span>
						</div>
					</div>
				</div>
				
				{#if claimModal.mode === 'reinvest'}
					<div class="space-y-3">
						<p class="text-sm font-semibold text-black">Select reinvestment option:</p>
						<RadioGroup name="reinvestOption" value={claims.claimMethod}>
							<Radio value="auto" label="Auto-reinvest in highest yielding assets" />
							<Radio value="manual" label="Choose specific assets to invest in" />
							<Radio value="hold" label="Hold in wallet for manual investment later" />
						</RadioGroup>
					</div>
				{:else}
					<div class="space-y-3">
						<p class="text-sm font-semibold text-black">Claim to:</p>
						<RadioGroup name="claimMethod" bind:value={claims.claimMethod}>
							<Radio value="wallet" label="Connected wallet" />
							<Radio value="exchange" label="Exchange address" />
						</RadioGroup>
					</div>
				{/if}
			</div>
			
			{#if claims.claimSuccess}
				<div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
					<p class="text-green-800 font-semibold">Claim successful! Your funds are on the way.</p>
				</div>
			{/if}
		</div>
		
		<div slot="actions" class="flex gap-4">
			<PrimaryButton 
				on:click={handleConfirmClaim}
				disabled={claims.claiming}
			>
				{#if claims.claiming}
					Processing...
				{:else}
					Confirm {claimModal.mode === 'reinvest' ? 'Claim & Reinvest' : 'Claim'}
				{/if}
			</PrimaryButton>
			<SecondaryButton on:click={() => claimsData.hideClaimModal()}>
				Cancel
			</SecondaryButton>
		</div>
	</Modal>
{/if}