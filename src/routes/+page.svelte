<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import dataStoreService from '$lib/services/DataStoreService';
	import type { Token } from '$lib/types/dataStore';
	import FeaturedTokenCarousel from '$lib/components/carousel/FeaturedTokenCarousel.svelte';
	import TokenPurchaseWidget from '$lib/components/TokenPurchaseWidget.svelte';
	import { PrimaryButton, SecondaryButton, StatsCard, ButtonGroup } from '$lib/components/ui';
	import SectionTitle from '$lib/components/ui/SectionTitle.svelte';
	import GridContainer from '$lib/components/ui/GridContainer.svelte';
	import { PageLayout, HeroSection, ContentSection } from '$lib/components/layout';
	import marketData from '$lib/data/marketData.json';

	let platformStats = {
		totalAssets: 0,
		totalInvested: 0,
		activeInvestors: 0,
		totalRegions: 0,
		monthlyGrowthRate: 0
	};
	let loading = true;
	
	// Token purchase widget state
	let showPurchaseWidget = false;
	let selectedTokenAddress: string | null = null;
	let selectedAssetId: string | null = null;

	onMount(async () => {
		try {
			// Get platform statistics from real data
			const stats = dataStoreService.getPlatformStatistics();
			const allAssets = dataStoreService.getAllAssets();
			const allTokens = dataStoreService.getAllTokens();
			
			// Calculate total invested from all tokens' minted supply
			// Use different estimated values per token based on asset type and performance
			const totalInvested = allTokens.reduce((sum, token) => {
				const mintedTokens = parseFloat(token.supply.mintedSupply) / Math.pow(10, token.decimals);
				
				// Estimate token value based on asset region
				const estimatedTokenValue = dataStoreService.getEstimatedTokenValue(token.assetId);
				
				return sum + (mintedTokens * estimatedTokenValue);
			}, 0);
			
			// Count unique holders across all tokens
			const uniqueHolders = new Set();
			allTokens.forEach(token => {
				token.holders.forEach(holder => {
					uniqueHolders.add(holder.address.toLowerCase());
				});
			});
			
			// Count unique regions from asset locations
			const uniqueRegions = new Set(allAssets.map(asset => `${asset.location.state}, ${asset.location.country}`));
			
			// Calculate monthly growth rate from recent asset reports
			let monthlyGrowthRate = 0;
			const assetsWithReports = allAssets.filter(asset => asset.monthlyReports.length >= 2);
			if (assetsWithReports.length > 0) {
				const growthRates = assetsWithReports.map(asset => {
					const reports = asset.monthlyReports;
					const latest = reports[reports.length - 1];
					const previous = reports[reports.length - 2];
					if (previous.netIncome > 0) {
						return ((latest.netIncome - previous.netIncome) / previous.netIncome) * 100;
					}
					return 0;
				});
				const validGrowthRates = growthRates.filter(rate => !isNaN(rate) && isFinite(rate));
				if (validGrowthRates.length > 0) {
					monthlyGrowthRate = validGrowthRates.reduce((sum, rate) => sum + rate, 0) / validGrowthRates.length;
				}
			}
			
			// If no valid growth rate data, use a reasonable default
			if (monthlyGrowthRate === 0 || isNaN(monthlyGrowthRate)) {
				monthlyGrowthRate = dataStoreService.getMarketData().defaultGrowthRate;
			}
			
			platformStats = {
				totalAssets: stats.totalAssets,
				totalInvested: totalInvested / 1000000, // Convert to millions
				activeInvestors: uniqueHolders.size,
				totalRegions: uniqueRegions.size,
				monthlyGrowthRate: Number(monthlyGrowthRate.toFixed(1))
			};
			
			loading = false;
		} catch (error) {
			console.error('Error loading homepage data:', error);
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
		console.log('Purchase successful:', event.detail);
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
		showButtons={true}
	>
		
		<!-- Platform Stats -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto mb-8">
			{#if loading}
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
					value={`$${platformStats.totalInvested.toFixed(1)}M`}
					subtitle="this month"
					trend={{ value: platformStats.monthlyGrowthRate, positive: platformStats.monthlyGrowthRate >= 0 }}
					size="large"
					valueColor="primary"
				/>
				<StatsCard
					title="Assets"
					value={platformStats.totalAssets.toString()}
					subtitle={`Across ${platformStats.totalRegions} regions`}
					size="large"
				/>
				<StatsCard
					title="Active Investors"
					value={platformStats.activeInvestors.toLocaleString()}
					subtitle="Token holders"
					size="large"
				/>
			{/if}
		</div>

		<ButtonGroup centered direction="horizontal" slot="buttons">
			<PrimaryButton href="/assets">Explore Investments</PrimaryButton>
			<SecondaryButton href="/about">Learn How It Works</SecondaryButton>
		</ButtonGroup>
	</HeroSection>

	<!-- Featured Tokens Carousel -->
	<ContentSection background="white" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-12">Featured Token Releases</SectionTitle>
		<FeaturedTokenCarousel autoPlay={true} autoPlayInterval={6000} on:buyTokens={handleBuyTokensFromCarousel} />
	</ContentSection>

	<!-- How It Works -->
	<ContentSection background="gray" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-8 md:mb-12">How It Works</SectionTitle>
		
		<GridContainer columns={3} gap="large">
				<div class="text-center">
					<div class="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6">1</div>
					<h3 class="text-lg font-extrabold text-black uppercase tracking-wider mb-4">Browse Assets</h3>
					<p class="text-sm text-black">Explore vetted oil & gas assets with transparent production data, geological reports, and comprehensive performance metrics from institutional operators.</p>
				</div>
				
				<div class="text-center">
					<div class="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6">2</div>
					<h3 class="text-lg font-extrabold text-black uppercase tracking-wider mb-4">Buy Tokens</h3>
					<p class="text-sm text-black">Purchase royalty tokens using our smart payment system with automatic collateral management and instant settlement.</p>
				</div>
				
				<div class="text-center">
					<div class="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6">3</div>
					<h3 class="text-lg font-extrabold text-black uppercase tracking-wider mb-4">Earn Payout</h3>
					<p class="text-sm text-black">Receive proportional revenue from real oil & gas production directly to your wallet. Monthly payouts, transparent accounting.</p>
				</div>
		</GridContainer>
	</ContentSection>

	<!-- Trust Indicators -->
	<ContentSection background="white" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-8 md:mb-12">Why Choose Albion</SectionTitle>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
			<div class="flex flex-col items-center text-center">
				<div class="mb-6 text-black flex items-center justify-center w-16 h-16 relative">
					<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M24 2L30 14H42L32 22L36 34L24 26L12 34L16 22L6 14H18L24 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
						<circle cx="24" cy="24" r="8" stroke="currentColor" stroke-width="2"/>
					</svg>
				</div>
				<h3 class="text-lg font-extrabold text-black uppercase tracking-wider mb-2 text-sm md:text-base">SEC Compliant</h3>
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
				<h3 class="text-lg font-extrabold text-black uppercase tracking-wider mb-2 text-sm md:text-base">Audited Assets</h3>
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
				<h3 class="text-lg font-extrabold text-black uppercase tracking-wider mb-2 text-sm md:text-base">Institutional Grade</h3>
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
				<h3 class="text-lg font-extrabold text-black uppercase tracking-wider mb-2 text-sm md:text-base">Transparent</h3>
				<p class="text-xs text-black opacity-70">Real-time reporting</p>
			</div>
		</div>
	</ContentSection>

	<!-- Market Insights -->
	<ContentSection background="secondary" padding="standard" className="hidden md:block">
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
				<p class="mb-8 opacity-90">Join {platformStats.activeInvestors.toLocaleString()} investors earning from energy assets</p>
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