<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { usePlatformStats } from '$lib/composables/usePlatformStats';
	import FeaturedTokenCarousel from '$lib/components/organisms/carousel/FeaturedTokenCarousel.svelte';
	import TokenPurchaseWidget from '$lib/components/organisms/TokenPurchaseWidget.svelte';
	import { PrimaryButton, SecondaryButton, StatsCard, ButtonGroup } from '$lib/components/ui';
	import SectionTitle from '$lib/components/atoms/SectionTitle.svelte';
	import GridContainer from '$lib/components/atoms/GridContainer.svelte';
	import { PageLayout, HeroSection, ContentSection } from '$lib/components/layout';
	import marketData from '$lib/data/marketData.json';

	// Composables
	const { state, formattedStats, loadStats } = usePlatformStats();
	
	// Token purchase widget state
	let showPurchaseWidget = false;
	let selectedTokenAddress: string | null = null;
	let selectedAssetId: string | null = null;
	
	// Reactive data
	$: stats = $state;
	$: formatted = $formattedStats;
	
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
		<!-- Platform Stats -->
		<div class="max-w-6xl mx-auto px-8 mb-12">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
			{#if stats.loading}
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
					size="large"
				/>
			{:else}
				<StatsCard
					title="Total Invested"
					value={formatted.totalInvested}
					subtitle="this month"
					trend={formatted.growthTrend}
					size="large"
					valueColor="primary"
				/>
				<StatsCard
					title="Assets"
					value={formatted.totalAssets}
					subtitle={formatted.regionsText}
					size="large"
				/>
				<StatsCard
					title="Active Investors"
					value={formatted.activeInvestors}
					subtitle="Token holders"
					size="large"
				/>
			{/if}
			</div>
		</div>

		<!-- Buttons Below Stats -->
		<ButtonGroup centered direction="horizontal">
			<PrimaryButton href="/assets">Explore Investments</PrimaryButton>
			<SecondaryButton href="/about">Learn How It Works</SecondaryButton>
		</ButtonGroup>
	</HeroSection>

	<!-- Featured Tokens Carousel -->
	<ContentSection background="white" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-6">Featured Token Releases</SectionTitle>
		<FeaturedTokenCarousel autoPlay={true} autoPlayInterval={6000} on:buyTokens={handleBuyTokensFromCarousel} />
	</ContentSection>

	<!-- How It Works -->
	<ContentSection background="gray" padding="none" centered>
		<div class="max-w-6xl mx-auto px-8 py-16">
			<SectionTitle level="h2" size="section" center className="mb-4 md:mb-6">How It Works</SectionTitle>
			
			<GridContainer columns={3} gap="large">
			<div class="text-center">
				<div class="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6">1</div>
				<h3 class="text-lg font-extrabold text-black mb-4">Browse Assets</h3>
				<p class="text-sm text-black">Explore vetted oil & gas assets with transparent production data, geological reports, and comprehensive performance metrics from institutional operators.</p>
			</div>
			
			<div class="text-center">
				<div class="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6">2</div>
				<h3 class="text-lg font-extrabold text-black mb-4">Buy Tokens</h3>
				<p class="text-sm text-black">Purchase royalty tokens using our smart payment system with automatic collateral management and instant settlement.</p>
			</div>
			
			<div class="text-center">
				<div class="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6">3</div>
				<h3 class="text-lg font-extrabold text-black mb-4">Earn Payout</h3>
				<p class="text-sm text-black">Receive proportional revenue from real oil & gas production directly to your wallet. Monthly payouts, transparent accounting.</p>
			</div>
			</GridContainer>
		</div>
	</ContentSection>

	<!-- Trust Indicators -->
	<ContentSection background="white" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-4 md:mb-6">Why Choose Albion</SectionTitle>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
			<div class="flex flex-col items-center text-center">
				<div class="mb-6 text-black flex items-center justify-center w-16 h-16 relative">
					<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M24 2L30 14H42L32 22L36 34L24 26L12 34L16 22L6 14H18L24 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
						<circle cx="24" cy="24" r="8" stroke="currentColor" stroke-width="2"/>
					</svg>
				</div>
				<h3 class="text-lg font-extrabold text-black mb-2 text-sm md:text-base">SEC Compliant</h3>
				<p class="text-xs text-black opacity-70">Full regulatory compliance</p>
			</div>
			
			<div class="flex flex-col items-center text-center">
				<div class="mb-6 text-black flex items-center justify-center w-16 h-16 relative">
					<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M20 28L28 20M20 28L16 32L20 28ZM28 20L32 16L28 20Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						<circle cx="24" cy="24" r="18" stroke="currentColor" stroke-width="2"/>
						<path d="M15 24C15 24 18 30 24 30C30 30 33 24 33 24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					</svg>
				</div>
				<h3 class="text-lg font-extrabold text-black mb-2 text-sm md:text-base">Audited Assets</h3>
				<p class="text-xs text-black opacity-70">Third-party verified</p>
			</div>
			
			<div class="flex flex-col items-center text-center">
				<div class="mb-6 text-black flex items-center justify-center w-16 h-16 relative">
					<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
						<rect x="8" y="12" width="32" height="28" stroke="currentColor" stroke-width="2"/>
						<path d="M8 20H40" stroke="currentColor" stroke-width="2"/>
						<path d="M16 8V12M32 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						<path d="M16 28H24M16 32H32" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					</svg>
				</div>
				<h3 class="text-lg font-extrabold text-black mb-2 text-sm md:text-base">Institutional Grade</h3>
				<p class="text-xs text-black opacity-70">Professional operators</p>
			</div>
			
			<div class="flex flex-col items-center text-center">
				<div class="mb-6 text-black flex items-center justify-center w-16 h-16 relative">
					<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
						<circle cx="24" cy="24" r="18" stroke="currentColor" stroke-width="2"/>
						<path d="M24 24L32 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						<circle cx="24" cy="24" r="3" fill="currentColor"/>
						<path d="M12 28L16 24L20 26L28 20L36 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
				<h3 class="text-lg font-extrabold text-black mb-2 text-sm md:text-base">Transparent</h3>
				<p class="text-xs text-black opacity-70">Real-time reporting</p>
			</div>
		</div>
	</ContentSection>

	<!-- Market Insights -->
	<ContentSection background="secondary" padding="none" centered className="hidden md:block">
		<div class="max-w-6xl mx-auto px-8 py-16">
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
			<div class="space-y-6">
				<h3 class="text-3xl font-extrabold mb-6 text-white">Market Indicators</h3>
				<div class="flex flex-col gap-4">
					<div class="flex justify-between items-center font-semibold">
						<span>WTI Crude Oil</span>
						<span class="text-primary font-extrabold">${marketData.oilPrices.wti.price} <span class="text-xs font-semibold ml-2 {marketData.oilPrices.wti.change >= 0 ? 'text-primary' : 'text-red-500'}">{marketData.oilPrices.wti.change >= 0 ? '+' : ''}{marketData.oilPrices.wti.change}%</span></span>
					</div>
					<div class="flex justify-between items-center font-semibold">
						<span>Brent Crude</span>
						<span class="text-primary font-extrabold">${marketData.oilPrices.brent.price} <span class="text-xs font-semibold ml-2 {marketData.oilPrices.brent.change >= 0 ? 'text-primary' : 'text-red-500'}">{marketData.oilPrices.brent.change >= 0 ? '+' : ''}{marketData.oilPrices.brent.change}%</span></span>
					</div>
					<div class="flex justify-between items-center font-semibold">
						<span>Natural Gas</span>
						<span class="text-primary font-extrabold">${marketData.oilPrices.naturalGas.price} <span class="text-xs font-semibold ml-2 {marketData.oilPrices.naturalGas.change >= 0 ? 'text-primary' : 'text-red-500'}">{marketData.oilPrices.naturalGas.change >= 0 ? '+' : ''}{marketData.oilPrices.naturalGas.change}%</span></span>
					</div>
				</div>
			</div>
			
			<div class="text-center p-12 bg-white/10 border border-white/20">
				<h4 class="text-2xl font-extrabold mb-4 text-white">Start Investing Today</h4>
				<p class="mb-8 opacity-90">Join {formatted.activeInvestors} investors earning from energy assets</p>
				<SecondaryButton href="/assets">Get Started Now</SecondaryButton>
			</div>
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