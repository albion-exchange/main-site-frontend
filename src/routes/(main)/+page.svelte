<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { usePlatformStats } from '$lib/composables/usePlatformStats';
	import FeaturedTokenCarousel from '$lib/components/patterns/carousel/FeaturedTokenCarousel.svelte';
	import TokenPurchaseWidget from '$lib/components/patterns/TokenPurchaseWidget.svelte';
	import { PrimaryButton, SecondaryButton, StatsCard, ButtonGroup } from '$lib/components/components';
	import SectionTitle from '$lib/components/components/SectionTitle.svelte';
	import GridContainer from '$lib/components/components/GridContainer.svelte';
	import { PageLayout, HeroSection, ContentSection, StatsSection } from '$lib/components/layout';
	import { marketDataStore, formattedMarketData } from '$lib/stores/marketDataStore';

	// Composables
	const { platformStats, formattedStats: sftsFormattedStats } = usePlatformStats();
	
	// Token purchase widget state
	let showPurchaseWidget = false;
	let selectedTokenAddress: string | null = null;
	let selectedAssetId: string | null = null;
	
	// Lifecycle management
	onMount(() => {
		marketDataStore.startAutoRefresh();
	});
	
	onDestroy(() => {
		marketDataStore.stopAutoRefresh();
	});
	
	function handleBuyTokensFromCarousel(event: CustomEvent) {
		selectedTokenAddress = event.detail.tokenAddress;
		selectedAssetId = null;
		showPurchaseWidget = true;
	}
	
	function handleBuyTokens(event: CustomEvent) {
		selectedAssetId = event.detail.assetId;
		selectedTokenAddress = null;
		showPurchaseWidget = true;
	}
	
	function handlePurchaseSuccess(event: CustomEvent) {
		// Purchase successful - could add user notification here
		showPurchaseWidget = false;
	}
	
	function handleWidgetClose() {
		showPurchaseWidget = false;
		selectedTokenAddress = null;
		selectedAssetId = null;
	}
</script>

<svelte:head>
	<title>Albion - Institutional Grade Oil & Gas DeFi</title>
	<meta name="description" content="Real-world energy assets. Tokenized ownership. Transparent operations. Access institutional-quality oil & gas investments through blockchain technology." />
</svelte:head>

<PageLayout>
	<!-- Hero Section -->
	<HeroSection 
		title="Institutional Grade Oil & Gas DeFi"
		subtitle="Real-world energy assets. Tokenized ownership. Transparent operations. Access institutional-quality oil & gas investments through blockchain technology."
		showBorder={true}
		showButtons={false}
	>
		<!-- Buttons Below Hero -->
		<div class="flex flex-col sm:flex-row gap-4 justify-center mt-6 sm:mt-8">
			<PrimaryButton href="/assets">Explore Investments</PrimaryButton>
			<SecondaryButton href="/about" className="hidden sm:inline-flex">Learn How It Works</SecondaryButton>
		</div>
	</HeroSection>

	<!-- Platform Stats - 3 columns on all viewports -->
	<ContentSection background="white" padding="compact">
		<div class="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-8 text-center">
		{#if $platformStats.loading}
			<StatsCard
				title="Total Invested"
				value="--"
				subtitle="Loading..."
				size="large"
			/>
			<StatsCard
				title="Assets"
				value="--"
				subtitle="Loading..."
				size="large"
			/>
			<StatsCard
				title="Active Investors"
				value="--"
				subtitle="Loading..."
				size="small"
			/>
		{:else}
			<StatsCard
				title="Total Invested"
				value={$sftsFormattedStats.totalInvested}
				subtitle="this month"
				trend={$sftsFormattedStats.growthTrend}
				size="small"
				valueColor="primary"
			/>
			<StatsCard
				title="Assets"
				value={$sftsFormattedStats.totalAssets}
				subtitle={$sftsFormattedStats.regionsText}
				size="small"
			/>
			<StatsCard
				title="Active Investors"
				value={$sftsFormattedStats.activeInvestors}
				subtitle="Token holders"
				size="small"
			/>
		{/if}
		</div>
	</ContentSection>

	<!-- Featured Tokens Carousel -->
	<ContentSection background="white" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-6">Featured Token Releases</SectionTitle>
		<FeaturedTokenCarousel autoPlay={true} autoPlayInterval={6000} on:buyTokens={handleBuyTokensFromCarousel} />
	</ContentSection>

	<!-- Mobile CTA Section -->
	<ContentSection background="gray" padding="compact" centered className="block sm:hidden">
		<div class="text-center">
			<SectionTitle level="h2" size="section" className="mb-4">Ready to Start?</SectionTitle>
			<p class="text-sm text-black mb-6">Browse available oil & gas investments and start earning from energy assets.</p>
			<PrimaryButton href="/assets" className="w-full">View All Investments</PrimaryButton>
		</div>
	</ContentSection>

	<!-- How It Works - Simplified for mobile -->
	<ContentSection background="gray" padding="standard" centered className="hidden sm:block">
		<SectionTitle level="h2" size="section" center className="mb-6 lg:mb-8">How It Works</SectionTitle>
			
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
			<div class="text-center">
				<div class="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6">1</div>
				<SectionTitle level="h3" size="small" className="mb-4">Browse Assets</SectionTitle>
				<p class="text-sm sm:text-base text-black">Explore vetted oil & gas assets with transparent production data, geological reports, and comprehensive performance metrics from institutional operators.</p>
			</div>
			
			<div class="text-center">
				<div class="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6">2</div>
				<SectionTitle level="h3" size="small" className="mb-4">Buy Tokens</SectionTitle>
				<p class="text-sm sm:text-base text-black">Purchase royalty tokens using our smart payment system with automatic collateral management and instant settlement.</p>
			</div>
			
			<div class="text-center sm:col-span-2 lg:col-span-1">
				<div class="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6">3</div>
				<SectionTitle level="h3" size="small" className="mb-4">Earn Payout</SectionTitle>
				<p class="text-sm sm:text-base text-black">Receive proportional revenue from real oil & gas production directly to your wallet. Monthly payouts, transparent accounting.</p>
			</div>
		</div>
	</ContentSection>

	<!-- Trust Indicators - Hidden on mobile -->
	<ContentSection background="white" padding="standard" centered className="hidden lg:block">
		<SectionTitle level="h2" size="section" center className="mb-6 lg:mb-8">Why Choose Albion</SectionTitle>
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
			<div class="flex flex-col items-center text-center">
				<div class="mb-4 lg:mb-6 text-black flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 relative">
					<svg width="32" height="32" class="lg:w-12 lg:h-12" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M24 2L30 14H42L32 22L36 34L24 26L12 34L16 22L6 14H18L24 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
						<circle cx="24" cy="24" r="8" stroke="currentColor" stroke-width="2"/>
					</svg>
				</div>
				<SectionTitle level="h3" size="small" className="mb-2 text-xs sm:text-sm lg:text-base">SEC Compliant</SectionTitle>
				<p class="text-xs text-black opacity-70">Full regulatory compliance</p>
			</div>
			
			<div class="flex flex-col items-center text-center">
				<div class="mb-4 lg:mb-6 text-black flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 relative">
					<svg width="32" height="32" class="lg:w-12 lg:h-12" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M20 28L28 20M20 28L16 32L20 28ZM28 20L32 16L28 20Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						<circle cx="24" cy="24" r="18" stroke="currentColor" stroke-width="2"/>
						<path d="M15 24C15 24 18 30 24 30C30 30 33 24 33 24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					</svg>
				</div>
				<SectionTitle level="h3" size="small" className="mb-2 text-xs sm:text-sm lg:text-base">Audited Assets</SectionTitle>
				<p class="text-xs text-black opacity-70">Third-party verified</p>
			</div>
			
			<div class="flex flex-col items-center text-center">
				<div class="mb-4 lg:mb-6 text-black flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 relative">
					<svg width="32" height="32" class="lg:w-12 lg:h-12" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
						<rect x="8" y="12" width="32" height="28" stroke="currentColor" stroke-width="2"/>
						<path d="M8 20H40" stroke="currentColor" stroke-width="2"/>
						<path d="M16 8V12M32 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						<path d="M16 28H24M16 32H32" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					</svg>
				</div>
				<SectionTitle level="h3" size="small" className="mb-2 text-xs sm:text-sm lg:text-base">Institutional Grade</SectionTitle>
				<p class="text-xs text-black opacity-70">Professional operators</p>
			</div>
			
			<div class="flex flex-col items-center text-center">
				<div class="mb-4 lg:mb-6 text-black flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 relative">
					<svg width="32" height="32" class="lg:w-12 lg:h-12" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
						<circle cx="24" cy="24" r="18" stroke="currentColor" stroke-width="2"/>
						<path d="M24 24L32 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						<circle cx="24" cy="24" r="3" fill="currentColor"/>
						<path d="M12 28L16 24L20 26L28 20L36 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
				<SectionTitle level="h3" size="small" className="mb-2 text-xs sm:text-sm lg:text-base">Transparent</SectionTitle>
				<p class="text-xs text-black opacity-70">Real-time reporting</p>
			</div>
		</div>
	</ContentSection>

	<!-- Market Insights - Hidden on mobile -->
	<ContentSection background="secondary" padding="standard" centered className="hidden lg:block">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
			<div class="space-y-4 lg:space-y-6">
				<h3 class="text-2xl lg:text-3xl font-extrabold mb-4 lg:mb-6 text-white">Market Indicators</h3>
				{#if $marketDataStore.loading}
					<div class="flex flex-col gap-3 lg:gap-4">
						<div class="flex justify-between items-center font-semibold text-sm lg:text-base">
							<span>Loading market data...</span>
							<span class="text-primary font-extrabold">--</span>
						</div>
					</div>
				{:else if $formattedMarketData}
					<div class="flex flex-col gap-3 lg:gap-4">
						<div class="flex justify-between items-center font-semibold text-sm lg:text-base">
							<span>{$formattedMarketData.wti.name}</span>
							<span class="text-primary font-extrabold">{$formattedMarketData.wti.price} <span class="text-xs font-semibold ml-2 {$formattedMarketData.wti.isPositive ? 'text-primary' : 'text-red-500'}">{$formattedMarketData.wti.changeText}</span></span>
						</div>
						<div class="flex justify-between items-center font-semibold text-sm lg:text-base">
							<span>{$formattedMarketData.brent.name}</span>
							<span class="text-primary font-extrabold">{$formattedMarketData.brent.price} <span class="text-xs font-semibold ml-2 {$formattedMarketData.brent.isPositive ? 'text-primary' : 'text-red-500'}">{$formattedMarketData.brent.changeText}</span></span>
						</div>
						<div class="flex justify-between items-center font-semibold text-sm lg:text-base">
							<span>{$formattedMarketData.henryHub.name}</span>
							<span class="text-primary font-extrabold">{$formattedMarketData.henryHub.price} <span class="text-xs font-semibold ml-2 {$formattedMarketData.henryHub.isPositive ? 'text-primary' : 'text-red-500'}">{$formattedMarketData.henryHub.changeText}</span></span>
						</div>
						<div class="flex justify-between items-center font-semibold text-sm lg:text-base">
							<span>{$formattedMarketData.ttf.name}</span>
							<span class="text-primary font-extrabold">{$formattedMarketData.ttf.price} <span class="text-xs font-semibold ml-2 {$formattedMarketData.ttf.isPositive ? 'text-primary' : 'text-red-500'}">{$formattedMarketData.ttf.changeText}</span></span>
						</div>
					</div>
				{:else}
					<div class="flex flex-col gap-3 lg:gap-4">
						<div class="flex justify-between items-center font-semibold text-sm lg:text-base">
							<span>Market data unavailable</span>
							<span class="text-primary font-extrabold">--</span>
						</div>
					</div>
				{/if}
			</div>
			
			<div class="text-center p-8 lg:p-12 bg-white/10 border border-white/20">
				<h4 class="text-xl lg:text-2xl font-extrabold mb-3 lg:mb-4 text-white">Start Investing Today</h4>
				<p class="mb-6 lg:mb-8 opacity-90 text-sm lg:text-base">Join {$sftsFormattedStats.activeInvestors} investors earning from energy assets</p>
				<SecondaryButton href="/assets">Get Started Now</SecondaryButton>
			</div>
		</div>
	</ContentSection>
</PageLayout>

<!-- Token Purchase Widget -->
<TokenPurchaseWidget 
	bind:isOpen={showPurchaseWidget}
	tokenAddress={selectedTokenAddress}
	assetId={selectedAssetId}
	on:purchaseSuccess={handlePurchaseSuccess}
	on:close={handleWidgetClose}
/>