<script lang="ts">
	import { page } from '$app/stores';
	import { useTokenService, useConfigService } from '$lib/services';
	import type { Asset, Token } from '$lib/types/uiTypes';
	import { Card, CardContent, PrimaryButton, SecondaryButton, Chart, CollapsibleSection } from '$lib/components/components';
	import SectionTitle from '$lib/components/components/SectionTitle.svelte';

	import TabButton from '$lib/components/components/TabButton.svelte';
	import { PageLayout, ContentSection } from '$lib/components/layout';
	import { getImageUrl } from '$lib/utils/imagePath';
	import { formatCurrency, formatEndDate } from '$lib/utils/formatters';
	import { 
		useAssetDetailData,
		useDataExport, 
		useTooltip, 
		useEmailNotification
	} from '$lib/composables';
	import AssetDetailHeader from '$lib/components/patterns/assets/AssetDetailHeader.svelte';
	import AssetOverviewTab from '$lib/components/patterns/assets/AssetOverviewTab.svelte';

	let activeTab = 'overview';
	let unclaimedPayout = 0; // Will be calculated from actual token holdings
	
	// Purchase widget state
	let showPurchaseWidget = false;
	let selectedTokenAddress: string | null = null;
	
	// Use services
	const tokenService = useTokenService();
	const configService = useConfigService();
	
	// Get asset ID from URL params
	$: assetId = $page.params.id;
	
	// Use composables - initialize immediately with current assetId
	const assetDetailComposable = useAssetDetailData(assetId);
	const assetDetailState = assetDetailComposable.state;
	const loadAssetData = assetDetailComposable.loadAssetData;
	
	// Load data when asset ID changes
	$: if (assetId) {
		loadAssetData(assetId);
	}
	const { exportProductionData: exportDataFunc, exportPaymentHistory } = useDataExport();
	const { state: emailState, setEmail, submitEmail } = useEmailNotification();
	
	// Reactive data from composable
	$: ({ asset: assetData, tokens: assetTokens, loading, error } = $assetDetailState);
	
	
	function showTooltipWithDelay(tooltipId: string) {
		clearTimeout(tooltipTimer);
		tooltipTimer = setTimeout(() => {
			showTooltip = tooltipId;
		}, 500);
	}
	
	function hideTooltip() {
		clearTimeout(tooltipTimer);
		showTooltip = '';
	}
	
	// Email popup state
	let showEmailPopup = false;
	let emailAddress = '';
	let isSubmittingEmail = false;
	let emailSubmitted = false;
	
	// Track flipped state for each token card
	let flippedCards = new Set();
	
	// Tooltip state
	let showTooltip = '';
	let tooltipTimer: any = null;
	
	function toggleCardFlip(tokenAddress: string) {
		if (flippedCards.has(tokenAddress)) {
			flippedCards.delete(tokenAddress);
		} else {
			flippedCards.add(tokenAddress);
		}
		flippedCards = new Set(flippedCards); // Trigger reactivity
	}



	function exportProductionData() {
		if (assetData) {
			exportDataFunc(assetData);
		}
	}

	function exportPaymentsData() {
		if (assetTokens.length > 0) {
			exportPaymentHistory(assetTokens);
		}
	}

	function getAssetImage(assetData: Asset | null): string {
		// Use the coverImage from the asset data
		return assetData?.coverImage || '/images/eur-wr-cover.jpg';
	}

	function formatPricing(benchmarkPremium: string): string {
		if (benchmarkPremium.startsWith('-')) {
			return `${benchmarkPremium.substring(1)} discount`;
		} else if (benchmarkPremium.startsWith('+')) {
			return `${benchmarkPremium.substring(1)} premium`;
		} else {
			return `${benchmarkPremium} premium`;
		}
	}

	function handleBuyTokens(tokenAddress: string) {
		selectedTokenAddress = tokenAddress;
		showPurchaseWidget = true;
	}
	
	function handlePurchaseSuccess() {
		showPurchaseWidget = false;
		selectedTokenAddress = null;
		// Could refresh token data here
	}
	
	function handleWidgetClose() {
		showPurchaseWidget = false;
		selectedTokenAddress = null;
	}
	
	function handleGetNotified() {
		showEmailPopup = true;
	}
	
	function handleCloseEmailPopup() {
		showEmailPopup = false;
		emailAddress = '';
		emailSubmitted = false;
	}
	
	async function handleEmailSubmit() {
		if (!emailAddress || isSubmittingEmail) return;
		
		isSubmittingEmail = true;
		
		// Simulate API call
		setTimeout(() => {
			isSubmittingEmail = false;
			emailSubmitted = true;
			
			// Auto-close after 2 seconds
			setTimeout(() => {
				handleCloseEmailPopup();
			}, 2000);
		}, 1000);
	}

	// Decide what to do when the card itself is clicked
	function handleCardClick(tokenAddress: string) {
		if (flippedCards.has(tokenAddress)) {
			// If the card is showing the back, flip it back to the front
			toggleCardFlip(tokenAddress);
		} else {
			// Otherwise open the purchase panel
			handleBuyTokens(tokenAddress);
		}
	}

</script>

<svelte:head>
	<title>{assetData?.name || 'Asset Details'} - Albion</title>
	<meta name="description" content="Detailed information about {assetData?.name || 'asset'}" />
</svelte:head>

<PageLayout variant="constrained">
	{#if loading}
		<div class="text-center py-16 px-8 text-black">
			<p>Loading asset details...</p>
		</div>
	{:else if error}
		<div class="text-center py-16 px-8 text-black">
			<h1>Error</h1>
			<p>{error}</p>
			<a href="/assets" class="px-8 py-4 no-underline font-semibold text-sm uppercase tracking-wider transition-colors duration-200 inline-block bg-black text-white hover:bg-secondary inline-block">Back to Assets</a>
		</div>
	{:else}
		<AssetDetailHeader 
			asset={assetData} 
			tokenCount={assetTokens.length} 
			onTokenSectionClick={() => document.getElementById('token-section')?.scrollIntoView({ behavior: 'smooth' })}
		/>

		<!-- Asset Details Content -->
        <ContentSection background="white" padding="standard">
        	<!-- Mobile: Collapsible sections -->
        	<div class="lg:hidden space-y-4">
        		<!-- Overview is always shown first on mobile -->
        		<div>
        			<h3 class="text-lg font-bold text-black mb-4">Overview</h3>
        			<AssetOverviewTab asset={assetData} />
        		</div>
        		
        		<!-- Other sections in collapsible format -->
        		<CollapsibleSection title="Production Data" isOpenByDefault={false} alwaysOpenOnDesktop={false}>
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
								{#if productionReports.length > 0}
									<Chart
										data={productionReports.map(report => ({
											label: report.month,
											value: report.production
										}))}
										width={800}
										height={300}
										barColor="#08bccc"
										valuePrefix=""
										valueSuffix=" BOE"
										animate={true}
										showGrid={true}
									/>
								{:else}
									<div class="flex flex-col items-center justify-center h-32 text-black opacity-70">
										<div class="text-4xl mb-2">📊</div>
										<p>No production data available</p>
									</div>
								{/if}
							</div>
							<div class="bg-white border border-light-gray p-6">
								<div class="text-center">
									<div class="text-2xl font-extrabold text-black mb-2">{assetData?.hseMetrics?.daysWithoutIncident || 0}</div>
									<div class="text-base font-medium text-black opacity-70">Days Since Last HSE Incident</div>
								</div>
							</div>
						</div>
					</div>
        		</CollapsibleSection>
        		
        		<CollapsibleSection title="Past Payments" isOpenByDefault={false} alwaysOpenOnDesktop={false}>
        			{@const monthlyReports = assetData?.monthlyReports || []}
					{@const maxRevenue = monthlyReports.length > 0 ? Math.max(...monthlyReports.map(r => r.netIncome ?? 0)) : 1500}
					<div class="space-y-4">
						{#if monthlyReports.length > 0}
							<div class="bg-white border border-light-gray p-4">
								<h4 class="text-base font-bold text-black mb-4">Revenue History</h4>
								<div class="space-y-2">
									{#each monthlyReports.slice(-6) as report}
										<div class="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
											<div class="text-sm text-black">{report.month}</div>
											<div class="text-sm font-semibold text-primary">{formatCurrency(report.netIncome || 0)}</div>
										</div>
									{/each}
								</div>
							</div>
						{:else}
							<div class="text-center py-8 text-black opacity-70">
								<div class="text-4xl mb-2">💰</div>
								<p>No payment history available</p>
							</div>
						{/if}
					</div>
        		</CollapsibleSection>
        		
        		<CollapsibleSection title="Gallery" isOpenByDefault={false} alwaysOpenOnDesktop={false}>
        			<div class="grid grid-cols-2 gap-4">
						{#if assetData?.galleryImages && assetData.galleryImages.length > 0}
							{#each assetData.galleryImages.slice(0, 4) as image}
								<div
								   class="bg-white border border-light-gray overflow-hidden group cursor-pointer"
								   on:click={() => window.open(getImageUrl(image.url), '_blank')}
								   on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.open(getImageUrl(image.url), '_blank'); } }}
								   role="button"
								   tabindex="0"
								>
									<img 
										src={getImageUrl(image.url)} 
										alt={image.caption || 'Asset gallery image'} 
										class="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
									/>
								</div>
							{/each}
						{:else}
							<div class="col-span-2 text-center py-8 text-black opacity-70">
								<div class="text-4xl mb-2">🖼️</div>
								<p>No gallery images available</p>
							</div>
						{/if}
					</div>
        		</CollapsibleSection>
        		
        		<CollapsibleSection title="Documents" isOpenByDefault={false} alwaysOpenOnDesktop={false}>
        			<div class="space-y-3">
						<div class="bg-white border border-light-gray p-4">
							<div class="flex items-center gap-3">
								<div class="text-xl">📄</div>
								<div class="flex-1">
									<div class="font-semibold text-black text-sm">Asset Purchase Agreement</div>
									<div class="text-xs text-black opacity-70">Legal documentation</div>
								</div>
								<SecondaryButton size="small">View</SecondaryButton>
							</div>
						</div>
						<div class="bg-white border border-light-gray p-4">
							<div class="flex items-center gap-3">
								<div class="text-xl">📊</div>
								<div class="flex-1">
									<div class="font-semibold text-black text-sm">Financial Reports</div>
									<div class="text-xs text-black opacity-70">Performance data</div>
								</div>
								<SecondaryButton size="small">View</SecondaryButton>
							</div>
						</div>
					</div>
        		</CollapsibleSection>
        	</div>
        	
        	<!-- Desktop: Traditional tabs -->
        	<div class="hidden lg:block">
                <div class="bg-white border border-light-gray mb-8" id="asset-details-tabs">
                <div class="flex flex-wrap border-b border-light-gray">
                        <TabButton
                                active={activeTab === 'overview'}
                                on:click={() => activeTab = 'overview'}
                        >
                                Overview
                        </TabButton>
                        <TabButton
                                active={activeTab === 'production'}
                                on:click={() => activeTab = 'production'}
                        >
                                Production Data
                        </TabButton>
                        <TabButton
                                active={activeTab === 'payments'}
                                on:click={() => activeTab = 'payments'}
                        >
                                Past Payments
                        </TabButton>
                        <TabButton
                                active={activeTab === 'gallery'}
                                on:click={() => activeTab = 'gallery'}
                        >
                                Gallery
                        </TabButton>
                        <TabButton
                                active={activeTab === 'documents'}
                                on:click={() => activeTab = 'documents'}
                        >
                                Documents
                        </TabButton>
                </div>

			<!-- Tab Content -->
			<div class="p-8 min-h-[500px] flex flex-col">
				{#if activeTab === 'overview'}
					<AssetOverviewTab asset={assetData} />
				{:else if activeTab === 'production'}
					{@const productionReports = assetData?.historicalProduction || assetData?.monthlyReports || []}
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
										data={productionReports.map(report => {
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
					{@const nextMonth = latestReport ? (() => {
						const lastDate = new Date(latestReport.month + '-01');
						return new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, 1);
					})() : new Date()}
					{@const avgRevenue = monthlyReports.length > 0 ? monthlyReports.reduce((sum, r) => sum + (r.netIncome ?? 0), 0) / monthlyReports.length : 0}
					<div class="flex-1 flex flex-col">
						<div class="grid md:grid-cols-4 grid-cols-1 gap-6">
							<div class="bg-white border border-light-gray p-6 md:col-span-3">
								<div class="flex justify-between items-center mb-6">
									<h4 class="text-lg font-extrabold text-black mb-0">Past Payments</h4>
									<SecondaryButton on:click={exportPaymentsData}>
										📊 Export Data
									</SecondaryButton>
								</div>
								<div class="w-full">
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
												${latestReport.netIncome.toFixed(0)}
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
											${avgRevenue.toFixed(0)}
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
										<img 
											src={getImageUrl(image.url)} 
											alt={image.caption || image.title || 'Asset image'}
											loading="lazy"
											class="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
										/>
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
					<div class="flex-1 flex flex-col">
						<div class="grid md:grid-cols-2 grid-cols-1 gap-8">
							<div>
								<h4 class="text-lg font-extrabold text-black mb-6">Legal Documents</h4>
								<div class="space-y-4">
									<div class="flex items-center justify-between p-4 bg-white border border-light-gray hover:bg-white transition-colors duration-200">
										<div class="flex items-center gap-3">
											<div class="text-2xl">📄</div>
											<div>
												<div class="font-semibold text-black">Asset Purchase Agreement</div>
												<div class="text-sm text-black opacity-70">PDF • 2.4 MB</div>
											</div>
										</div>
										<SecondaryButton>Download</SecondaryButton>
									</div>
									<div class="flex items-center justify-between p-4 bg-white border border-light-gray hover:bg-white transition-colors duration-200">
										<div class="flex items-center gap-3">
											<div class="text-2xl">📄</div>
											<div class="">
												<div class="font-semibold text-black">Operating License PEDL 183</div>
												<div class="text-sm text-black opacity-70">PDF • 1.8 MB</div>
											</div>
										</div>
										<SecondaryButton>Download</SecondaryButton>
									</div>
									<div class="flex items-center justify-between p-4 bg-white border border-light-gray hover:bg-white transition-colors duration-200">
										<div class="flex items-center gap-3">
											<div class="text-2xl">📄</div>
											<div class="">
												<div class="font-semibold text-black">Environmental Impact Assessment</div>
												<div class="text-sm text-black opacity-70">PDF • 5.2 MB</div>
											</div>
										</div>
										<SecondaryButton>Download</SecondaryButton>
									</div>
									<div class="flex items-center justify-between p-4 bg-white border border-light-gray hover:bg-white transition-colors duration-200">
										<div class="flex items-center gap-3">
											<div class="text-2xl">📄</div>
											<div class="">
												<div class="font-semibold text-black">Token Terms & Conditions</div>
												<div class="text-sm text-black opacity-70">PDF • 950 KB</div>
											</div>
										</div>
										<SecondaryButton>Download</SecondaryButton>
									</div>
								</div>
							</div>

							<div>
								<h4 class="text-lg font-extrabold text-black mb-6">Technical Reports</h4>
								<div class="space-y-4">
									<div class="flex items-center justify-between p-4 bg-white border border-light-gray hover:bg-white transition-colors duration-200">
										<div class="flex items-center gap-3">
											<div class="text-2xl">📊</div>
											<div class="">
												<div class="font-semibold text-black">Geological Survey Report 2024</div>
												<div class="text-sm text-black opacity-70">PDF • 12.1 MB</div>
											</div>
										</div>
										<SecondaryButton>Download</SecondaryButton>
									</div>
									<div class="flex items-center justify-between p-4 bg-white border border-light-gray hover:bg-white transition-colors duration-200">
										<div class="flex items-center gap-3">
											<div class="text-2xl">📊</div>
											<div class="">
												<div class="font-semibold text-black">Reserve Audit by Ryder Scott</div>
												<div class="text-sm text-black opacity-70">PDF • 3.7 MB</div>
											</div>
										</div>
										<SecondaryButton>Download</SecondaryButton>
									</div>
									<div class="flex items-center justify-between p-4 bg-white border border-light-gray hover:bg-white transition-colors duration-200">
										<div class="flex items-center gap-3">
											<div class="text-2xl">📊</div>
											<div class="">
												<div class="font-semibold text-black">Production Forecast Model</div>
												<div class="text-sm text-black opacity-70">PDF • 8.3 MB</div>
											</div>
										</div>
										<SecondaryButton>Download</SecondaryButton>
									</div>
									<div class="flex items-center justify-between p-4 bg-white border border-light-gray hover:bg-white transition-colors duration-200">
										<div class="flex items-center gap-3">
											<div class="text-2xl">📊</div>
											<div class="">
												<div class="font-semibold text-black">HSE Safety Report 2024</div>
												<div class="text-sm text-black opacity-70">PDF • 2.1 MB</div>
											</div>
										</div>
										<SecondaryButton>Download</SecondaryButton>
									</div>
								</div>
							</div>
						</div>
					</div>
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
						{@const supply = tokenService.getTokenSupply(token.contractAddress)}
						{@const hasAvailableSupply = supply && supply.available > 0}
						{@const tokenPayoutData = tokenService.getTokenPayoutHistory(token.contractAddress)}
						{@const latestPayout = tokenPayoutData?.recentPayouts?.[0]}
						{@const calculatedReturns = tokenService.getTokenReturns(token.contractAddress)}
						{@const isFlipped = flippedCards.has(token.contractAddress)}
						<div id="token-{token.contractAddress}">
							<Card hoverable clickable paddingClass="p-0" on:click={() => handleCardClick(token.contractAddress)}>
								<CardContent paddingClass="p-0">
									<div class="relative preserve-3d transform-gpu transition-transform duration-500 {isFlipped ? 'rotate-y-180' : ''}" style="min-height: 650px;">
										<!-- Front of card -->
										<div class="absolute inset-0 backface-hidden">
											<!-- Full width availability banner -->
											<div class="{!hasAvailableSupply ? 'text-base font-extrabold text-white bg-black text-center py-3 uppercase tracking-wider' : 'text-base font-extrabold text-black bg-primary text-center py-3 uppercase tracking-wider'} w-full">
												{hasAvailableSupply ? 'Available for Purchase' : 'Currently Sold Out'}
											</div>
											
											<div class="p-8 pb-0 relative">
												<div class="flex-1 mt-6">
													<div class="flex justify-between items-start mb-3 gap-4">
														<h4 class="text-2xl font-extrabold text-black font-figtree flex-1">{token.name}</h4>
														<div class="text-sm font-extrabold text-white bg-secondary px-3 py-1 tracking-wider rounded whitespace-nowrap">
															{token.sharePercentage || 25}% of Asset
														</div>
													</div>
													<p class="text-sm text-secondary font-medium break-all tracking-tight opacity-80 font-figtree">{token.contractAddress}</p>
												</div>
											</div>
								
																	<!-- Desktop: Always show stats -->
							<div class="hidden sm:block p-8 pt-6 space-y-4">
								<div class="flex justify-between items-start">
									<span class="text-base font-medium text-black opacity-70 relative font-figtree">Minted Supply</span>
									<span class="text-base font-extrabold text-black text-right font-figtree">{token.supplyNumbers?.mintedSupply?.toLocaleString() || supply?.sold?.toLocaleString() || '0'}</span>
								</div>
								<div class="flex justify-between items-start">
									<span class="text-base font-medium text-black opacity-70 relative font-figtree">Max Supply</span>
									<span class="text-base font-extrabold text-black text-right font-figtree">{token.supplyNumbers?.maxSupply?.toLocaleString() || supply?.total?.toLocaleString() || '0'}</span>
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
									<span class="text-base font-extrabold text-black text-right">{calculatedReturns?.impliedBarrelsPerToken?.toFixed(6) || '0.000000'}</span>
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
									<span class="text-base font-extrabold text-black text-right">${calculatedReturns?.breakEvenOilPrice?.toFixed(2) || '0.00'}</span>
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
													<span class="text-xl font-extrabold text-primary">{calculatedReturns?.baseReturn !== undefined ? Math.round(calculatedReturns.baseReturn) + '%' : 'TBD'}</span>
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
													<span class="text-xl font-extrabold text-primary">+{calculatedReturns?.bonusReturn !== undefined ? Math.round(calculatedReturns.bonusReturn) + '%' : 'TBD'}</span>
													{#if showTooltip === 'bonus'}
														<div class="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white p-2 rounded text-xs whitespace-nowrap z-[1000] mb-[5px] max-w-[200px] whitespace-normal text-left">
															Additional potential return from improved oil prices or production efficiency
														</div>
													{/if}
												</div>
												<div class="text-center p-3 bg-white">
													<span class="text-xs font-medium text-black opacity-70 block mb-1 relative">Total Expected</span>
													<span class="text-xl font-extrabold text-primary">{calculatedReturns ? Math.round(calculatedReturns.baseReturn + calculatedReturns.bonusReturn) + '%' : 'TBD'}</span>
												</div>
											</div>
																					</div>
							</div>
							
													<div class="p-8 pt-0">
								<div class="grid grid-cols-2 gap-3">
												{#if hasAvailableSupply}
													<PrimaryButton fullWidth on:click={(e) => { e.stopPropagation(); handleBuyTokens(token.contractAddress); }}>
														Buy Tokens
													</PrimaryButton>
												{:else}
													<PrimaryButton fullWidth disabled>
														Sold Out
													</PrimaryButton>
												{/if}
												<div on:click|stopPropagation={() => toggleCardFlip(token.contractAddress)} on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleCardFlip(token.contractAddress); }} role="button" tabindex="0" class="cursor-pointer">
													<SecondaryButton fullWidth>
														Distributions History
													</SecondaryButton>
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
															<div class="text-center font-semibold text-black">${payout.totalPayout.toLocaleString()}</div>
															<div class="text-right font-semibold text-black">${payout.payoutPerToken.toFixed(5)}</div>
														</div>
													{/each}
												</div>
												<div class="border-t border-light-gray my-4"></div>
												<div class="mt-auto">
													<div class="grid grid-cols-3 gap-2 text-sm font-extrabold">
														<div class="text-left text-black">Total</div>
														<div class="text-center text-black">${tokenPayoutData.recentPayouts.reduce((sum, p) => sum + p.totalPayout, 0).toLocaleString()}</div>
														<div class="text-right text-black">${(tokenPayoutData.recentPayouts.reduce((sum, p) => sum + p.payoutPerToken, 0)).toFixed(5)}</div>
													</div>
												</div>
											</div>
										{:else}
											{@const nextRelease = configService.getFutureReleasesByAsset(assetData?.id || '')?.[0]}
											<div class="text-center py-8 text-black opacity-70">
												<p class="text-sm">No distributions available yet.</p>
												<p class="text-sm">First payout expected in {nextRelease?.whenRelease || 'Q1 2025'}.</p>
																		</div>
							{/if}
						</div>
					</CardContent>
							</Card>
						</div>
					{/each}
					<!-- Future Releases Cards -->
					{#if assetData?.id}
						{@const futureReleases = configService.getFutureReleasesByAsset(assetData.id)}
						{#each futureReleases as release, index}
					<Card hoverable>
						<CardContent paddingClass="p-0">
							<div class="flex flex-col justify-center text-center p-12" style="min-height: 650px;">
								<div class="text-5xl mb-6">{release.emoji || '📅'}</div>
								<h4 class="text-xl font-extrabold mb-4 text-black uppercase tracking-wider">{index === 0 ? 'Next Release' : 'Future Release'} - {release.whenRelease}</h4>
								<p class="text-base mb-8 text-black opacity-70">{release.description || 'Token release planned'}</p>
								<SecondaryButton on:click={handleGetNotified}>
									Get Notified
								</SecondaryButton>
							</div>
						</CardContent>
					</Card>
						{/each}
						
						{#if futureReleases.length === 0}
						<!-- Fallback Coming Soon Card -->
						<Card hoverable>
							<CardContent paddingClass="p-0">
								<div class="flex flex-col justify-center text-center p-12" style="min-height: 650px;">
									<div class="text-5xl mb-6">🚀</div>
									<h4 class="text-xl font-extrabold mb-4 text-black uppercase tracking-wider">New Release Coming Soon</h4>
									<p class="text-base mb-8 text-black opacity-70">Next token release planned for Q1 2025</p>
									<SecondaryButton on:click={handleGetNotified}>
										Get Notified
									</SecondaryButton>
								</div>
							</CardContent>
						</Card>
						{/if}
					{/if}
				</div>
				</div>
			</div>
		</ContentSection>

		<!-- Token Purchase Widget -->
		{#if showPurchaseWidget}
			{#await import('$lib/components/patterns/TokenPurchaseWidget.svelte') then { default: TokenPurchaseWidget }}
				<TokenPurchaseWidget 
					bind:isOpen={showPurchaseWidget}
					tokenAddress={selectedTokenAddress}
					on:purchaseSuccess={handlePurchaseSuccess}
					on:close={handleWidgetClose}
				/>
			{/await}
		{/if}

		<!-- Email Notification Popup -->
		{#if showEmailPopup}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4" on:click={handleCloseEmailPopup}>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div class="bg-white border border-light-gray max-w-md w-full max-h-[90vh] overflow-y-auto" on:click|stopPropagation role="dialog" aria-modal="true" tabindex="0">
					<div class="flex justify-between items-center p-6 border-b border-light-gray">
						<h3 class="text-xl font-extrabold text-black">Get Notified</h3>
						<button class="text-2xl font-bold text-black bg-transparent border-none cursor-pointer p-0 leading-none hover:opacity-70" on:click={handleCloseEmailPopup}>×</button>
					</div>
					<div class="p-6">
						{#if emailSubmitted}
							<div class="text-center text-black font-medium">
								Thank you! We'll notify you when the new token release is available.
							</div>
						{:else}
							<p>Enter your email address to be notified when the next token release becomes available.</p>
							<form class="mt-4 space-y-4" on:submit|preventDefault={handleEmailSubmit}>
								<input
									type="email"
									class="w-full px-4 py-3 border border-light-gray bg-white text-black placeholder-black placeholder-opacity-50 focus:outline-none focus:border-primary disabled:opacity-50"
									placeholder="Enter your email address"
									bind:value={emailAddress}
									required
									disabled={isSubmittingEmail}
								/>
								<PrimaryButton 
									type="submit" 
									disabled={isSubmittingEmail || !emailAddress}
								>
									{isSubmittingEmail ? 'Submitting...' : 'Notify Me'}
								</PrimaryButton>
							</form>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	{/if}
</PageLayout>

<style>
	.preserve-3d {
		transform-style: preserve-3d;
	}
	
	.backface-hidden {
		backface-visibility: hidden;
	}
	
	.rotate-y-180 {
		transform: rotateY(180deg);
	}
</style>