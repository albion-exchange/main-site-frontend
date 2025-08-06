<script lang="ts">
	import { page } from '$app/stores';
	import { getAssetById, hasIncompleteReleases } from '$lib/stores/blockchainStore';
	import { PageLayout, ContentSection } from '$lib/components/layout';
	import AssetDetailHeader from '$lib/components/patterns/assets/AssetDetailHeader.svelte';
	import AssetOverviewTab from '$lib/components/patterns/assets/AssetOverviewTab.svelte';
	import { Card, CardContent, SecondaryButton, Chart, CollapsibleSection, TabButton } from '$lib/components/components';
	import { formatCurrency, formatSmartReturn } from '$lib/utils/formatters';
	import { calculateTokenReturns, getTokenPayoutHistory, getTokenSupply } from '$lib/utils/returnCalculations';
	import { formatEther } from 'viem';
	
	// Get asset ID from URL
	$: assetId = $page.params.id;
	
	// Get asset data from the unified store
	$: assetStore = getAssetById(assetId);
	$: assetData = $assetStore?.asset || null;
	$: assetTokens = $assetStore?.tokens || [];
	$: energyField = $assetStore?.energyField || null;
	
	// Check for future releases
	$: hasFutureReleasesStore = hasIncompleteReleases(assetId);
	$: hasFutureReleases = $hasFutureReleasesStore;
	
	// UI state
	let activeTab = 'overview';
	let showPurchaseWidget = false;
	let selectedTokenAddress: string | null = null;
	let showEmailPopup = false;
	let flippedCards = new Set();
	
	function handleBuyTokens(tokenAddress: string) {
		selectedTokenAddress = tokenAddress;
		showPurchaseWidget = true;
	}
	
	function toggleCardFlip(tokenAddress: string) {
		if (flippedCards.has(tokenAddress)) {
			flippedCards.delete(tokenAddress);
		} else {
			flippedCards.add(tokenAddress);
		}
		flippedCards = new Set(flippedCards); // Trigger reactivity
	}
	
	function handleCardClick(tokenAddress: string) {
		if (flippedCards.has(tokenAddress)) {
			toggleCardFlip(tokenAddress);
		} else {
			handleBuyTokens(tokenAddress);
		}
	}
	
	function handleGetNotified() {
		showEmailPopup = true;
	}
	
	function exportProductionData() {
		// Export logic here
		console.log('Exporting production data for', assetData?.name);
	}
	
	function exportPaymentsData() {
		// Export logic here
		console.log('Exporting payment data for', assetData?.name);
	}
</script>

<svelte:head>
	<title>{assetData?.name || 'Asset Details'} - Albion</title>
	<meta name="description" content="Detailed information about {assetData?.name || 'asset'}" />
</svelte:head>

<PageLayout variant="constrained">
	{#if !$assetStore}
		<!-- Loading or Not Found -->
		<div class="text-center py-16 px-8 text-black">
			<p>Loading asset details...</p>
		</div>
	{:else}
		<!-- Asset Header -->
		{#if assetData}
			<AssetDetailHeader 
				asset={assetData} 
				tokenCount={assetTokens.length} 
				onTokenSectionClick={() => document.getElementById('token-section')?.scrollIntoView({ behavior: 'smooth' })}
			/>
		{/if}

		<!-- Asset Details Content -->
		<ContentSection background="white" padding="standard">
			<!-- Desktop: Traditional tabs -->
			<div class="hidden lg:block">
				<div class="bg-white border border-light-gray mb-8">
					<div class="flex flex-wrap border-b border-light-gray">
						<TabButton active={activeTab === 'overview'} on:click={() => activeTab = 'overview'}>
							Overview
						</TabButton>
						<TabButton active={activeTab === 'production'} on:click={() => activeTab = 'production'}>
							Production Data
						</TabButton>
						<TabButton active={activeTab === 'payments'} on:click={() => activeTab = 'payments'}>
							Received Revenue
						</TabButton>
						<TabButton active={activeTab === 'gallery'} on:click={() => activeTab = 'gallery'}>
							Gallery
						</TabButton>
						<TabButton active={activeTab === 'documents'} on:click={() => activeTab = 'documents'}>
							Documents
						</TabButton>
					</div>

					<!-- Tab Content -->
					<div class="p-8 min-h-[500px]">
						{#if activeTab === 'overview' && assetData}
							<AssetOverviewTab asset={assetData} />
						{:else if activeTab === 'production'}
							<!-- Production tab content -->
							<div class="flex justify-between items-center mb-6">
								<h4 class="text-lg font-extrabold text-black">Production History</h4>
								<SecondaryButton on:click={exportProductionData}>
									📊 Export Data
								</SecondaryButton>
							</div>
							{#if assetData?.monthlyReports && assetData.monthlyReports.length > 0}
								<Chart
									data={assetData.monthlyReports.map(report => ({
										label: report.month,
										value: report.production
									}))}
									width={700}
									height={350}
									valueSuffix=" BOE"
									barColor="#08bccc"
									showGrid={true}
								/>
							{:else}
								<p class="text-center py-8 text-black opacity-70">No production data available</p>
							{/if}
						{:else if activeTab === 'payments'}
							<!-- Payments tab content -->
							<div class="flex justify-between items-center mb-6">
								<h4 class="text-lg font-extrabold text-black">Received Revenue</h4>
								<SecondaryButton on:click={exportPaymentsData}>
									📊 Export Data
								</SecondaryButton>
							</div>
							{#if assetData?.monthlyReports && assetData.monthlyReports.some(r => r.netIncome && r.netIncome > 0)}
								<Chart
									data={assetData.monthlyReports.map(report => ({
										label: report.month,
										value: report.netIncome || 0
									}))}
									width={700}
									height={350}
									valuePrefix="$"
									barColor="#08bccc"
									showGrid={true}
								/>
							{:else}
								<p class="text-center py-8 text-black opacity-70">No revenue data available yet</p>
							{/if}
						{:else if activeTab === 'gallery'}
							<!-- Gallery tab content -->
							<div class="grid md:grid-cols-3 gap-6">
								{#if assetData?.galleryImages && assetData.galleryImages.length > 0}
									{#each assetData.galleryImages as image}
										<div class="bg-white border border-light-gray overflow-hidden">
											<img 
												src={image.url} 
												alt={image.caption || 'Asset image'} 
												class="w-full h-64 object-cover"
											/>
											{#if image.caption}
												<div class="p-4">
													<p class="text-sm text-black">{image.caption}</p>
												</div>
											{/if}
										</div>
									{/each}
								{:else}
									<p class="col-span-full text-center py-8 text-black opacity-70">
										No gallery images available
									</p>
								{/if}
							</div>
						{:else if activeTab === 'documents'}
							<!-- Documents tab content -->
							<div class="space-y-4">
								{#if assetTokens[0]?.asset?.documents && assetTokens[0].asset.documents.length > 0}
									{#each assetTokens[0].asset.documents as document}
										<div class="flex items-center justify-between p-4 bg-white border border-light-gray">
											<div class="flex items-center gap-3">
												<span class="text-2xl">📄</span>
												<div>
													<div class="font-semibold text-black">{document.name}</div>
													<div class="text-sm text-black opacity-70">{document.type}</div>
												</div>
											</div>
											<SecondaryButton on:click={() => console.log('Download', document)}>
												Download
											</SecondaryButton>
										</div>
									{/each}
								{:else}
									<p class="text-center py-8 text-black opacity-70">
										No documents available
									</p>
								{/if}
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Mobile: Use collapsible sections -->
			<div class="lg:hidden space-y-4">
				<!-- Similar structure with CollapsibleSection components -->
			</div>
		</ContentSection>

		<!-- Token Cards Section -->
		<ContentSection background="white" padding="compact">
			<div id="token-section">
				<h3 class="text-2xl font-extrabold text-black uppercase mb-8">Token Information</h3>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
					{#each assetTokens as token}
						<!-- Token card implementation -->
						<Card hoverable clickable on:click={() => handleCardClick(token.contractAddress)}>
							<CardContent paddingClass="p-0">
								<div class="relative min-h-[600px]">
									<!-- Card front/back flip logic -->
									<div class="p-8">
										<h4 class="text-xl font-extrabold text-black">{token.releaseName}</h4>
										<p class="text-sm text-secondary opacity-80">{token.contractAddress}</p>
										
										<!-- Token details -->
										<div class="mt-6 space-y-3">
											<div class="flex justify-between">
												<span class="text-black opacity-70">Share Percentage</span>
												<span class="font-semibold">{token.sharePercentage}%</span>
											</div>
											<div class="flex justify-between">
												<span class="text-black opacity-70">Minted Supply</span>
												<span class="font-semibold">
													{Math.floor(Number(formatEther(BigInt(token.supply?.mintedSupply || 0))))}
												</span>
											</div>
											<div class="flex justify-between">
												<span class="text-black opacity-70">Max Supply</span>
												<span class="font-semibold">
													{Math.floor(Number(formatEther(BigInt(token.supply?.maxSupply || 0))))}
												</span>
											</div>
										</div>
										
										<!-- Buy button -->
										<div class="mt-8">
											<SecondaryButton 
												fullWidth 
												on:click={(e) => { e.stopPropagation(); handleBuyTokens(token.contractAddress); }}
											>
												Buy Tokens
											</SecondaryButton>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					{/each}
					
					<!-- Future Releases Card -->
					{#if $hasFutureReleases}
						<Card hoverable>
							<CardContent paddingClass="p-0">
								<div class="flex flex-col justify-center text-center p-12 min-h-[600px]">
									<div class="text-5xl mb-6">🚀</div>
									<h4 class="text-xl font-extrabold mb-4 text-black uppercase">
										Future Releases Available
									</h4>
									<p class="text-base mb-8 text-black opacity-70">
										Additional token releases planned
									</p>
									<SecondaryButton on:click={handleGetNotified}>
										Get Notified
									</SecondaryButton>
								</div>
							</CardContent>
						</Card>
					{/if}
				</div>
			</div>
		</ContentSection>
	{/if}
</PageLayout>