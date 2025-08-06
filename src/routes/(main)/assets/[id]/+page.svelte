<script lang="ts">
	import { page } from '$app/stores';
	import { getAssetById, hasIncompleteReleases } from '$lib/stores/blockchainStore';
	import { PageLayout, ContentSection } from '$lib/components/layout';
	import AssetDetailHeader from '$lib/components/patterns/assets/AssetDetailHeader.svelte';
	import AssetOverviewTab from '$lib/components/patterns/assets/AssetOverviewTab.svelte';
	import { Card, CardContent, Button, Chart, CollapsibleSection, TabButton } from '$lib/components/components';
	import { formatCurrency, formatSmartReturn } from '$lib/utils/formatters';
	import { calculateTokenReturns, getTokenPayoutHistory } from '$lib/utils/returnCalculations';
	import { calculateTokenSupply } from '$lib/utils/tokenSupplyUtils';
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
					{@const productionReports = assetData?.productionHistory || assetData?.monthlyReports || []}
					{@const maxProduction = productionReports.length > 0 ? Math.max(...productionReports.map((r: any) => r.production)) : 100}
					<div class="flex-1 flex flex-col">
						<div class="grid md:grid-cols-4 grid-cols-1 gap-6">
							<div class="bg-white border border-light-gray p-6 md:col-span-3">
								<div class="flex justify-between items-center mb-6">
									<h4 class="text-lg font-extrabold text-black mb-0">Production History</h4>
									<SecondaryButton on:click={exportProductionData}>
										📊 Export Data
									</SecondaryButton>
								</div>
								<div class="w-full">
									<Chart
										data={productionReports.map((report: any) => {
											// Handle different date formats
											let dateStr = report.month || '';
											if (dateStr && !dateStr.includes('-01')) {
												dateStr = dateStr + '-01';
											}
											return {
												label: dateStr,
												value: report.production
											};
										})}
										width={700}
										height={350}
										valueSuffix=" BOE"
										barColor="#08bccc"
										animate={true}
										showGrid={true}
									/>
								</div>
							</div>

							<div class="bg-white border border-light-gray p-6">
								<h4 class="text-lg font-extrabold text-black mb-6">Production Metrics</h4>
								<div class="text-center mb-6 p-4 bg-white">
									<div class="text-4xl font-extrabold text-black mb-2">
										{#if assetData?.operationalMetrics?.uptime?.percentage !== undefined}
											{assetData.operationalMetrics.uptime.percentage.toFixed(1)}%
										{:else}
											<span class="text-gray-400">N/A</span>
										{/if}
									</div>
									<div class="text-base font-medium text-black opacity-70">
										Uptime {assetData?.operationalMetrics?.uptime?.period?.replace('_', ' ') || 'N/A'}
									</div>
								</div>
								<div class="grid grid-cols-1 gap-4 mb-6">
									<div class="text-center p-3 bg-white">
										<div class="text-3xl font-extrabold text-black mb-1">
											{#if assetData?.operationalMetrics?.dailyProduction?.current !== undefined}
												{assetData.operationalMetrics.dailyProduction.current.toFixed(1)}
											{:else}
												<span class="text-gray-400">N/A</span>
											{/if}
										</div>
										<div class="text-sm font-medium text-black opacity-70">
											Current Daily Production ({assetData?.operationalMetrics?.dailyProduction?.unit || 'units'})
										</div>
									</div>
								</div>
								<div class="text-center p-4 bg-white">
									<div class="text-4xl font-extrabold text-black mb-2">
										{#if assetData?.operationalMetrics?.hseMetrics?.incidentFreeDays !== undefined}
											{assetData.operationalMetrics.hseMetrics.incidentFreeDays}
										{:else}
											<span class="text-gray-400">N/A</span>
										{/if}
									</div>
									<div class="text-base font-medium text-black opacity-70">Days Since Last HSE Incident</div>
								</div>
							</div>
						</div>
					</div>
				{:else if activeTab === 'payments'}
					{@const monthlyReports = assetData?.monthlyReports || []}
					{@const maxRevenue = monthlyReports.length > 0 ? Math.max(...monthlyReports.map(r => r.netIncome ?? 0)) : 1500}
					{@const latestReport = monthlyReports[monthlyReports.length - 1]}
					{@const nextMonth = (() => {
						// Use first payment date from primary token if no revenue yet
						if (!latestReport || !latestReport.netIncome || latestReport.netIncome === 0) {
							const primaryToken = assetTokens && assetTokens.length > 0 ? assetTokens[0] : null;
							if (primaryToken?.firstPaymentDate) {
								// Parse YYYY-MM format and set to end of month
								const [year, month] = primaryToken.firstPaymentDate.split('-').map(Number);
								const date = new Date(year, month - 1, 1);
								// Get last day of the month
								return new Date(date.getFullYear(), date.getMonth() + 1, 0);
							}
						}
						// If we have revenue, use month after last report
						if (latestReport) {
							const lastDate = new Date(latestReport.month + '-01');
							return new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, 1);
						}
						// Fallback to current date
						return new Date();
					})()}
					{@const avgRevenue = monthlyReports.length > 0 ? monthlyReports.reduce((sum, r) => sum + (r.netIncome ?? 0), 0) / monthlyReports.length : 0}
					{@const hasRevenue = monthlyReports.some(r => r.netIncome && r.netIncome > 0)}
					<div class="flex-1 flex flex-col">
						<div class="grid md:grid-cols-4 grid-cols-1 gap-6">
							<div class="bg-white border border-light-gray p-6 md:col-span-3">
								<div class="flex justify-between items-center mb-6">
									<h4 class="text-lg font-extrabold text-black mb-0">Received Revenue</h4>
									<SecondaryButton on:click={exportPaymentsData}>
										📊 Export Data
									</SecondaryButton>
								</div>
								<div class="w-full relative">
									<Chart
										data={monthlyReports.map(report => {
											// Handle different date formats
											let dateStr = report.month || '';
											if (dateStr && !dateStr.includes('-01')) {
												dateStr = dateStr + '-01';
											}
											return {
												label: dateStr,
												value: report.netIncome ?? 0
											};
										})}
										width={700}
										height={350}
										valuePrefix="$"
										barColor="#08bccc"
										animate={true}
										showGrid={true}
									/>
									{#if !hasRevenue}
										<div class="absolute inset-0 bg-gray-100 bg-opacity-90 flex items-center justify-center rounded">
											<div class="text-center">
												<div class="text-6xl font-bold text-gray-400 mb-2">N/A</div>
												<p class="text-gray-500">No revenue data available yet</p>
											</div>
										</div>
									{/if}
								</div>
							</div>

							<div class="bg-white border border-light-gray p-6">
								<h4 class="text-lg font-extrabold text-black mb-6">Revenue Metrics</h4>
								<div class="text-center mb-6 p-4 bg-white">
									<div class="text-4xl font-extrabold text-black mb-2">{nextMonth.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</div>
									<div class="text-base font-medium text-black opacity-70">Next Report Due</div>
								</div>
								<div class="grid grid-cols-1 gap-4 mb-6">
									<div class="text-center p-3 bg-white">
										<div class="text-3xl font-extrabold text-black mb-1">
											{#if latestReport?.netIncome !== undefined}
												US${latestReport.netIncome.toFixed(0)}
											{:else}
												<span class="text-gray-400">N/A</span>
											{/if}
										</div>
										<div class="text-sm font-medium text-black opacity-70">Latest Monthly Revenue</div>
									</div>
								</div>
								<div class="text-center p-4 bg-white">
									<div class="text-4xl font-extrabold text-black mb-2">
										{#if avgRevenue > 0}
											US${avgRevenue.toFixed(0)}
										{:else}
											<span class="text-gray-400">N/A</span>
										{/if}
									</div>
									<div class="text-base font-medium text-black opacity-70">Avg Monthly Revenue</div>
								</div>
							</div>
						</div>
					</div>
				{:else if activeTab === 'gallery'}
					<div class="flex-1 flex flex-col">
						<div class="grid md:grid-cols-3 grid-cols-1 gap-6">
							{#if assetData?.galleryImages && assetData.galleryImages.length > 0}
								{#each assetData.galleryImages as image}
									<div 
										class="bg-white border border-light-gray overflow-hidden group cursor-pointer" 
										on:click={() => window.open(getImageUrl(image.url), '_blank')}
										on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.open(getImageUrl(image.url), '_blank'); } }}
										role="button"
										tabindex="0"
										aria-label={`View ${image.caption || image.title || 'Asset image'} in new tab`}
									>
										{#if !failedImages.has(image.url)}
											<img 
												src={getImageUrl(image.url)} 
												alt={image.caption || image.title || 'Asset image'}
												loading="lazy"
												class="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
												on:error={() => handleImageError(image.url)}
											/>
										{:else}
											<div class="w-full h-64 bg-light-gray flex items-center justify-center">
												<div class="text-center">
													<div class="text-4xl mb-2">🖼️</div>
													<p class="text-sm text-black opacity-50">Failed to load image</p>
												</div>
											</div>
										{/if}
										{#if image.caption || image.title}
											<div class="p-4">
												<p class="text-sm text-black">{image.caption || image.title}</p>
											</div>
										{/if}
									</div>
								{/each}
							{:else}
								<!-- No gallery images available -->
								<div class="col-span-full text-center py-16">
									<p class="text-lg text-black opacity-70">No gallery images available for this asset.</p>
								</div>
							{/if}
						</div>
					</div>
				{:else if activeTab === 'documents'}
					{#if assetTokens[0]?.asset?.documents && assetTokens[0].asset.documents.length > 0}
						{#each assetTokens[0].asset.documents as document}
							<div class="grid md:grid-cols-2 grid-cols-1 gap-8">
								<div class="space-y-4">
									<div class="flex items-center justify-between p-4 bg-white border border-light-gray hover:bg-white transition-colors duration-200">
										<div class="flex items-center gap-3">
												<div class="text-2xl">📄</div>
											<div>
												<div class="font-semibold text-black">{document.name}</div>
												<div class="text-sm text-black opacity-70">{document.type.toUpperCase()}</div>
											</div>
										</div>
										<SecondaryButton
										on:click={() => downloadDocument(document)}
										>Download</SecondaryButton>
									</div>

								</div>
							</div>
						{/each}
					{:else}
						<div class="col-span-full text-center py-16">
							<p class="text-lg text-black opacity-70">No documents available for this asset.</p>
						</div>
					{/if}
				{/if}
			</div>
			</div>
		</div>
	</ContentSection>

		<!-- Available Tokens Section -->
		<ContentSection background="white" padding="compact">
			<div class="bg-white border border-light-gray section-no-border" id="token-section">
				<div class="py-6">
					<h3 class="text-3xl md:text-2xl font-extrabold text-black uppercase tracking-wider mb-8">Token Information</h3>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
					{#each assetTokens as token}
						{@const supply = getTokenSupply(token)}
						{@const hasAvailableSupply = supply && supply.availableSupply > 0}
						{@const tokenPayoutData = getTokenPayoutHistory(token)}
						{@const latestPayout = tokenPayoutData?.recentPayouts?.[0]}
						{@const sft = $sfts?.find(s => s.id.toLowerCase() === token.contractAddress.toLowerCase())}
						{@const calculatedReturns = calculateTokenReturns(assetData!, token, sft?.totalShares)}
						{@const isFlipped = flippedCards.has(token.contractAddress)}
						<div id="token-{token.contractAddress}">
							<Card hoverable clickable paddingClass="p-0" on:click={() => handleCardClick(token.contractAddress)}>
								<CardContent paddingClass="p-0">
									<div class="relative preserve-3d transform-gpu transition-transform duration-500 {isFlipped ? 'rotate-y-180' : ''} min-h-[700px] sm:min-h-[600px]">
										<!-- Front of card -->
										<div class="absolute inset-0 backface-hidden">
											<!-- Full width availability banner -->
											<div class="{!hasAvailableSupply ? 'text-base font-extrabold text-white bg-black text-center py-3 uppercase tracking-wider' : 'text-base font-extrabold text-black bg-primary text-center py-3 uppercase tracking-wider'} w-full">
												{hasAvailableSupply ? 'Available for Purchase' : 'Currently Sold Out'}
											</div>
											
											<div class="p-8 pb-0 relative">
												<div class="flex-1 mt-6">
													<div class="flex justify-between items-start mb-3 gap-4">
														<h4 class="text-2xl font-extrabold text-black font-figtree flex-1">{token.releaseName}</h4>
														<div class="text-sm font-extrabold text-white bg-secondary px-3 py-1 tracking-wider rounded whitespace-nowrap">
															{token.sharePercentage || 25}% of Asset
														</div>
													</div>
													<p class="text-sm text-secondary font-medium break-all tracking-tight opacity-80 font-figtree">{token.contractAddress}</p>
												</div>
											</div>
								
											<div class="p-8 pt-6 space-y-4">
												<div class="flex justify-between items-start">
													<span class="text-base font-medium text-black opacity-70 relative font-figtree">Minted Supply </span>
													<span class="text-base font-extrabold text-black text-right font-figtree">{Math.floor(Number(formatEther(BigInt(token.supply?.mintedSupply || 0))))}</span>
												</div>
												<div class="flex justify-between items-start">
													<span class="text-base font-medium text-black opacity-70 relative font-figtree">Max Supply</span>
													<span class="text-base font-extrabold text-black text-right font-figtree">{Math.floor(Number(formatEther(BigInt(token.supply?.maxSupply || 0))))}</span>
												</div>
												<div class="flex justify-between items-start relative">
													<span class="text-base font-medium text-black opacity-70 relative font-figtree">
														Implied Barrels/Token
														<span class="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-light-gray text-black text-[10px] font-bold ml-1 cursor-help opacity-70 transition-opacity duration-200 hover:opacity-100"
															on:mouseenter={() => showTooltipWithDelay('barrels')}
															on:mouseleave={hideTooltip}
															role="button"
															tabindex="0">ⓘ</span>
													</span>
													<span class="text-base font-extrabold text-black text-right">{calculatedReturns?.impliedBarrelsPerToken === Infinity ? '∞' : calculatedReturns?.impliedBarrelsPerToken?.toFixed(6) || '0.000000'}</span>
													{#if showTooltip === 'barrels'}
														<div class="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white p-2 rounded text-xs whitespace-nowrap z-[1000] mb-[5px] max-w-[200px] whitespace-normal text-left">
															Estimated barrels of oil equivalent per token based on reserves and token supply
														</div>
													{/if}
												</div>
												<div class="flex justify-between items-start relative">
													<span class="text-base font-medium text-black opacity-70 relative font-figtree">
														Breakeven Oil Price
														<span class="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-light-gray text-black text-[10px] font-bold ml-1 cursor-help opacity-70 transition-opacity duration-200 hover:opacity-100"
															on:mouseenter={() => showTooltipWithDelay('breakeven')}
															on:mouseleave={hideTooltip}
															role="button"
															tabindex="0">ⓘ</span>
													</span>
													<span class="text-base font-extrabold text-black text-right">US${calculatedReturns?.breakEvenOilPrice?.toFixed(2) || '0.00'}</span>
													{#if showTooltip === 'breakeven'}
														<div class="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white p-2 rounded text-xs whitespace-nowrap z-[1000] mb-[5px] max-w-[200px] whitespace-normal text-left">
															Oil price required to cover operational costs and maintain profitability
														</div>
													{/if}
												</div>
											</div>

											<div class="p-8 pt-0 border-t border-light-gray">
												<h5 class="text-sm font-extrabold text-black uppercase tracking-wider mb-4 pt-6">Estimated Returns</h5>
												<div class="grid grid-cols-3 gap-3">
													<div class="text-center p-3 bg-white">
														<span class="text-xs font-medium text-black opacity-70 block mb-1 relative">
															Base
															<span class="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-light-gray text-black text-[10px] font-bold ml-1 cursor-help opacity-70 transition-opacity duration-200 hover:opacity-100"
																on:mouseenter={() => showTooltipWithDelay('base')}
																on:mouseleave={hideTooltip}
																role="button"
																tabindex="0">ⓘ</span>
														</span>
														<span class="text-xl font-extrabold text-primary">{formatSmartReturn(calculatedReturns?.baseReturn)}</span>
														{#if showTooltip === 'base'}
															<div class="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white p-2 rounded text-xs whitespace-nowrap z-[1000] mb-[5px] max-w-[200px] whitespace-normal text-left">
																Conservative return estimate based on current production and oil prices
															</div>
														{/if}
													</div>
													<div class="text-center p-3 bg-white">
														<span class="text-xs font-medium text-black opacity-70 block mb-1 relative">
															Bonus
															<span class="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-light-gray text-black text-[10px] font-bold ml-1 cursor-help opacity-70 transition-opacity duration-200 hover:opacity-100"
																on:mouseenter={() => showTooltipWithDelay('bonus')}
																on:mouseleave={hideTooltip}
																role="button"
																tabindex="0">ⓘ</span>
														</span>
														<span class="text-xl font-extrabold text-primary">{calculatedReturns?.bonusReturn !== undefined ? (formatSmartReturn(calculatedReturns.bonusReturn).startsWith('>') ? formatSmartReturn(calculatedReturns.bonusReturn) : '+' + formatSmartReturn(calculatedReturns.bonusReturn)) : 'TBD'}</span>
														{#if showTooltip === 'bonus'}
															<div class="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white p-2 rounded text-xs whitespace-nowrap z-[1000] mb-[5px] max-w-[200px] whitespace-normal text-left">
																Additional potential return from improved oil prices or production efficiency
															</div>
														{/if}
													</div>
													<div class="text-center p-3 bg-white hidden sm:block">
														<span class="text-xs font-medium text-black opacity-70 block mb-1 relative">Total Expected</span>
														<span class="text-xl font-extrabold text-primary">{calculatedReturns ? formatSmartReturn(calculatedReturns.baseReturn + calculatedReturns.bonusReturn) : 'TBD'}</span>
													</div>
												</div>
											</div>

											<div class="px-4 sm:px-8 pb-6 sm:pb-8">
												<div class="grid grid-cols-2 gap-2 sm:gap-3">
													{#if hasAvailableSupply}
														<PrimaryButton fullWidth size="small" on:click={(e) => { e.stopPropagation(); handleBuyTokens(token.contractAddress); }}>
															<span class="hidden sm:inline">Buy Tokens</span>
															<span class="sm:hidden">Buy</span>
														</PrimaryButton>
													{:else}
														<PrimaryButton fullWidth size="small" disabled>
															<span class="hidden sm:inline">Sold Out</span>
															<span class="sm:hidden">Sold Out</span>
														</PrimaryButton>
													{/if}
													<div on:click|stopPropagation={() => toggleCardFlip(token.contractAddress)} on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleCardFlip(token.contractAddress); }} role="button" tabindex="0" class="cursor-pointer">
														<SecondaryButton fullWidth size="small">
															<span class="hidden sm:inline">Distributions History</span>
															<span class="sm:hidden">History</span>
														</SecondaryButton>
													</div>
												</div>
											</div>
										</div>
									</div>
									
									<!-- Back of card -->
									<div class="absolute inset-0 backface-hidden rotate-y-180 bg-white">
										<div class="p-8 flex flex-col h-full">
											<div class="flex justify-between items-center mb-6">
												<h4 class="text-xl font-extrabold text-black uppercase tracking-wider">Distributions History</h4>
												<div on:click|stopPropagation={() => toggleCardFlip(token.contractAddress)} on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleCardFlip(token.contractAddress); }} role="button" tabindex="0">
													<SecondaryButton>
														← Back
													</SecondaryButton>
												</div>
											</div>
											
											{#if tokenPayoutData?.recentPayouts && tokenPayoutData.recentPayouts.length > 0}
												<div class="flex-1 flex flex-col">
													<div class="grid grid-cols-3 gap-2 text-xs font-bold text-black uppercase tracking-wider border-b border-light-gray pb-2 mb-4">
														<div class="text-left">Month</div>
														<div class="text-center">Total Payments</div>
														<div class="text-right">Per Token</div>
													</div>
													<div class="space-y-2 flex-1">
														{#each tokenPayoutData.recentPayouts.slice(-6) as payout}
															<div class="grid grid-cols-3 gap-2 text-sm">
																<div class="text-left font-medium text-black">{payout.month}</div>
																<div class="text-center font-semibold text-black">US${payout.totalPayout.toLocaleString()}</div>
																<div class="text-right font-semibold text-black">US${payout.payoutPerToken.toFixed(5)}</div>
															</div>
														{/each}
													</div>
													<div class="border-t border-light-gray my-4"></div>
													<div class="mt-auto">
														<div class="grid grid-cols-3 gap-2 text-sm font-extrabold">
															<div class="text-left text-black">Total</div>
															<div class="text-center text-black">US${tokenPayoutData.recentPayouts.reduce((sum, p) => sum + p.totalPayout, 0).toLocaleString()}</div>
															<div class="text-right text-black">US${(tokenPayoutData.recentPayouts.reduce((sum, p) => sum + p.payoutPerToken, 0)).toFixed(5)}</div>
														</div>
													</div>
												</div>
											{:else}
												<div class="text-center py-8 text-black opacity-70 flex-1 flex flex-col justify-center">
													<p class="text-sm font-semibold mb-2">No distributions yet</p>
													<p class="text-xs">No distributions have been made yet.</p>
													<p class="text-xs">Distributions will appear here once payouts begin.</p>
												</div>
											{/if}
										</div>
									</div>
						</CardContent>
					</Card>
				</div>
					{/each}
					<!-- Future Releases Card -->
					{#if hasFutureReleases}
					<Card hoverable>
						<CardContent paddingClass="p-0">
							<div class="flex flex-col justify-center text-center p-12" style="min-height: 650px;">
								<div class="text-5xl mb-6">🚀</div>
								<h4 class="text-xl font-extrabold mb-4 text-black uppercase tracking-wider">Future Releases</h4>
								<p class="text-base mb-8 text-black opacity-70">Additional token releases planned</p>
								<SecondaryButton on:click={handleGetNotified}>
									Get Notified
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
								<Button variant="secondary" on:click={exportPaymentsData}>
									📊 Export Data
								</Button>
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
											<Button variant="secondary" on:click={() => console.log('Download', document)}>
												Download
											</Button>
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
											<Button variant="secondary" 
												fullWidth 
												on:click={(e) => { e.stopPropagation(); handleBuyTokens(token.contractAddress); }}
											>
												Buy Tokens
											</Button>
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
									<Button variant="secondary" on:click={handleGetNotified}>
										Get Notified
									</Button>
								</div>
							</CardContent>
						</Card>
					{/if}
				</div>
			</div>
		</ContentSection>
	{/if}
</PageLayout>