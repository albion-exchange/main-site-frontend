<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import dataStoreService from '$lib/services/DataStoreService';
	import type { Token } from '$lib/types/dataStore';
	import FeaturedTokenCarousel from '$lib/components/carousel/FeaturedTokenCarousel.svelte';
	import TokenPurchaseWidget from '$lib/components/TokenPurchaseWidget.svelte';
	import { PrimaryButton, SecondaryButton } from '$lib/components/ui';
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
	
	// Tailwind class mappings
	$: pageClasses = 'pt-0';
	$: heroClasses = 'py-24 text-center bg-white border-b border-light-gray';
	$: heroContentClasses = 'max-w-6xl mx-auto mb-16 px-8';
	$: heroTitleClasses = 'text-6xl font-extrabold mb-8 text-black tracking-tight leading-tight';
	$: heroDescriptionClasses = 'text-xl leading-relaxed text-black max-w-3xl mx-auto';
	$: platformStatsClasses = 'grid grid-cols-3 gap-8 max-w-3xl mx-auto mb-16 p-8 border border-light-gray';
	$: statClasses = 'text-center';
	$: statValueClasses = 'text-3xl font-extrabold text-black mb-2';
	$: statLabelClasses = 'text-xs font-semibold text-black uppercase tracking-wider mb-1';
	$: statNoteClasses = 'text-xs text-primary font-medium';
	$: ctaButtonsClasses = 'flex gap-4 justify-center';
	$: featuredTokensClasses = 'py-16 w-full overflow-hidden';
	$: sectionHeaderClasses = 'max-w-6xl mx-auto mb-12 px-8';
	$: sectionTitleClasses = 'text-3xl font-extrabold text-black';
	$: howItWorksClasses = 'py-16 bg-light-gray text-center';
	$: howItWorksContentClasses = 'max-w-6xl mx-auto px-8';
	$: howItWorksTitleClasses = 'text-3xl font-extrabold text-black mb-12';
	$: stepsClasses = 'grid grid-cols-1 md:grid-cols-3 gap-12';
	$: stepClasses = 'text-center';
	$: stepNumberClasses = 'w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6';
	$: stepTitleClasses = 'text-xl font-extrabold text-black mb-4';
	$: stepTextClasses = 'text-sm leading-relaxed text-black';
	$: trustIndicatorsClasses = 'py-16 text-center max-w-6xl mx-auto';
	$: trustIndicatorsContentClasses = 'px-8';
	$: trustIndicatorsTitleClasses = 'text-3xl font-extrabold text-black mb-12';
	$: indicatorsClasses = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8';
	$: indicatorClasses = 'flex flex-col items-center';
	$: indicatorIconClasses = 'mb-6 text-black flex items-center justify-center w-16 h-16 relative';
	$: indicatorTitleClasses = 'text-base font-extrabold text-black mb-2';
	$: indicatorTextClasses = 'text-xs text-black font-medium';
	$: marketInsightsClasses = 'py-16 bg-secondary text-white';
	$: insightsContentClasses = 'grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto items-center px-8';
	$: insightsTextClasses = 'space-y-6';
	$: insightsTitleClasses = 'text-3xl font-extrabold mb-6 text-white';
	$: marketDataClasses = 'flex flex-col gap-4';
	$: dataRowClasses = 'flex justify-between font-semibold';
	$: priceClasses = 'text-primary font-extrabold';
	$: changeClasses = 'text-xs font-semibold ml-2';
	$: changePositiveClasses = 'text-primary';
	$: changeNegativeClasses = 'text-red-500';
	$: ctaBoxClasses = 'text-center p-12 bg-white/10 border border-white/20';
	$: ctaBoxTitleClasses = 'text-2xl font-extrabold mb-4 text-white';
	$: ctaBoxTextClasses = 'mb-8 opacity-90';
	
	// Mobile responsive classes
	$: mobileHeroClasses = 'md:py-24 py-8 text-center bg-white border-b border-light-gray';
	$: mobileHeroContentClasses = 'max-w-6xl mx-auto md:mb-16 mb-8 md:px-8 px-4';
	$: mobileHeroTitleClasses = 'md:text-6xl text-3xl font-extrabold md:mb-8 mb-4 text-black tracking-tight leading-tight';
	$: mobileHeroDescriptionClasses = 'md:text-xl text-base leading-relaxed text-black max-w-3xl mx-auto';
	$: mobilePlatformStatsClasses = 'grid md:grid-cols-3 grid-cols-1 md:gap-8 gap-6 max-w-3xl mx-auto md:mb-16 mb-8 md:p-8 p-6 border border-light-gray';
	$: mobileStatClasses = 'text-center md:border-b-0 border-b border-light-gray md:pb-0 pb-6 last:border-b-0 last:pb-0';
	$: mobileStatValueClasses = 'md:text-3xl text-2xl font-extrabold text-black mb-2';
	$: mobileCtaButtonsClasses = 'flex md:flex-row flex-col md:gap-4 gap-3 justify-center items-center md:px-0 px-4';
	$: mobileFeaturedTokensClasses = 'md:py-16 py-8 w-full overflow-hidden';
	$: mobileSectionHeaderClasses = 'max-w-6xl mx-auto md:mb-12 mb-6 md:px-8 px-4';
	$: mobileSectionTitleClasses = 'md:text-3xl text-2xl font-extrabold text-black';
	$: mobileHowItWorksClasses = 'md:py-16 py-8 bg-light-gray text-center';
	$: mobileHowItWorksContentClasses = 'max-w-6xl mx-auto md:px-8 px-4';
	$: mobileHowItWorksTitleClasses = 'md:text-3xl text-2xl font-extrabold text-black md:mb-12 mb-8';
	$: mobileStepsClasses = 'grid grid-cols-1 md:grid-cols-3 md:gap-12 gap-8';
	$: mobileStepTitleClasses = 'md:text-xl text-lg font-extrabold text-black mb-4';
	$: mobileStepTextClasses = 'md:text-sm text-sm leading-relaxed text-black';
	$: mobileTrustIndicatorsClasses = 'md:py-16 py-8 text-center max-w-6xl mx-auto';
	$: mobileTrustIndicatorsContentClasses = 'md:px-8 px-4';
	$: mobileTrustIndicatorsTitleClasses = 'md:text-3xl text-2xl font-extrabold text-black md:mb-12 mb-8';
	$: mobileIndicatorsClasses = 'grid grid-cols-2 lg:grid-cols-4 md:gap-8 gap-6';
	$: mobileIndicatorTitleClasses = 'md:text-base text-sm font-extrabold text-black mb-2';
	$: mobileIndicatorTextClasses = 'md:text-xs text-xs text-black font-medium';
	$: mobileMarketInsightsClasses = 'md:py-16 py-8 bg-secondary text-white md:block hidden';
	$: smallMobileIndicatorsClasses = 'grid sm:grid-cols-2 grid-cols-1 lg:grid-cols-4 md:gap-8 gap-6';
	$: smallMobilePlatformStatsClasses = 'grid md:grid-cols-3 grid-cols-1 md:gap-8 gap-6 max-w-3xl mx-auto md:mb-16 mb-8 md:p-8 p-4 border border-light-gray';
</script>

<svelte:head>
	<title>Albion - Institutional Grade Oil & Gas DeFi</title>
	<meta name="description" content="Real-world energy assets. Tokenized ownership. Transparent operations. Access institutional-quality oil & gas investments through blockchain technology." />
</svelte:head>

<main class={pageClasses}>
	<!-- Hero Section -->
	<section class={mobileHeroClasses}>
		<div class={mobileHeroContentClasses}>
			<h1 class={mobileHeroTitleClasses}>Institutional Grade Oil & Gas DeFi</h1>
			<p class={mobileHeroDescriptionClasses}>Real-world energy assets. Tokenized ownership. Transparent operations.<br>
			Access institutional-quality oil & gas investments through blockchain technology.</p>
		</div>
		
		<!-- Platform Stats -->
		<div class={smallMobilePlatformStatsClasses}>
			{#if loading}
				<div class={mobileStatClasses}>
					<div class={mobileStatValueClasses}>--</div>
					<div class={statLabelClasses}>Total Invested</div>
					<div class={statNoteClasses}>Loading...</div>
				</div>
				<div class={mobileStatClasses}>
					<div class={mobileStatValueClasses}>--</div>
					<div class={statLabelClasses}>Assets</div>
					<div class={statNoteClasses}>Loading...</div>
				</div>
				<div class={mobileStatClasses}>
					<div class={mobileStatValueClasses}>--</div>
					<div class={statLabelClasses}>Active Investors</div>
					<div class={statNoteClasses}>Loading...</div>
				</div>
			{:else}
				<div class={mobileStatClasses}>
					<div class={mobileStatValueClasses}>${platformStats.totalInvested.toFixed(1)}M</div>
					<div class={statLabelClasses}>Total Invested</div>
					<div class={statNoteClasses}>{platformStats.monthlyGrowthRate >= 0 ? '+' : ''}{platformStats.monthlyGrowthRate.toFixed(1)}% this month</div>
				</div>
				<div class={mobileStatClasses}>
					<div class={mobileStatValueClasses}>{platformStats.totalAssets}</div>
					<div class={statLabelClasses}>Assets</div>
					<div class={statNoteClasses}>Across {platformStats.totalRegions} regions</div>
				</div>
				<div class={mobileStatClasses}>
					<div class={mobileStatValueClasses}>{platformStats.activeInvestors.toLocaleString()}</div>
					<div class={statLabelClasses}>Active Investors</div>
					<div class={statNoteClasses}>Token holders</div>
				</div>
			{/if}
		</div>

		<!-- CTA Buttons -->
		<div class={mobileCtaButtonsClasses}>
			<PrimaryButton href="/assets">Explore Investments</PrimaryButton>
			<SecondaryButton href="/about">Learn How It Works</SecondaryButton>
		</div>
	</section>

	<!-- Featured Tokens Carousel -->
	<section class={mobileFeaturedTokensClasses}>
		<div class={mobileSectionHeaderClasses}>
			<h2 class={mobileSectionTitleClasses}>Featured Token Releases</h2>
		</div>
		
		<FeaturedTokenCarousel autoPlay={true} autoPlayInterval={6000} on:buyTokens={handleBuyTokensFromCarousel} />
	</section>

	<!-- How It Works -->
	<section class={mobileHowItWorksClasses}>
		<div class={mobileHowItWorksContentClasses}>
			<h2 class={mobileHowItWorksTitleClasses}>How It Works</h2>
			
			<div class={mobileStepsClasses}>
				<div class={stepClasses}>
					<div class={stepNumberClasses}>1</div>
					<h3 class={mobileStepTitleClasses}>Browse Assets</h3>
					<p class={mobileStepTextClasses}>Explore vetted oil & gas assets with transparent production data, geological reports, and comprehensive performance metrics from institutional operators.</p>
				</div>
				
				<div class={stepClasses}>
					<div class={stepNumberClasses}>2</div>
					<h3 class={mobileStepTitleClasses}>Buy Tokens</h3>
					<p class={mobileStepTextClasses}>Purchase royalty tokens using our smart payment system with automatic collateral management and instant settlement.</p>
				</div>
				
				<div class={stepClasses}>
					<div class={stepNumberClasses}>3</div>
					<h3 class={mobileStepTitleClasses}>Earn Payout</h3>
					<p class={mobileStepTextClasses}>Receive proportional revenue from real oil & gas production directly to your wallet. Monthly payouts, transparent accounting.</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Trust Indicators -->
	<section class={mobileTrustIndicatorsClasses}>
		<div class={mobileTrustIndicatorsContentClasses}>
			<h2 class={mobileTrustIndicatorsTitleClasses}>Why Choose Albion</h2>
			<div class={smallMobileIndicatorsClasses}>
			<div class={indicatorClasses}>
				<div class={indicatorIconClasses}>
					<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M24 2L30 14H42L32 22L36 34L24 26L12 34L16 22L6 14H18L24 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
						<circle cx="24" cy="24" r="8" stroke="currentColor" stroke-width="2"/>
					</svg>
				</div>
				<h3 class={mobileIndicatorTitleClasses}>SEC Compliant</h3>
				<p class={mobileIndicatorTextClasses}>Full regulatory compliance</p>
			</div>
			
			<div class={indicatorClasses}>
				<div class={indicatorIconClasses}>
					<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M20 28L28 20M20 28L16 32L20 28ZM28 20L32 16L28 20Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						<circle cx="24" cy="24" r="18" stroke="currentColor" stroke-width="2"/>
						<path d="M15 24C15 24 18 30 24 30C30 30 33 24 33 24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					</svg>
				</div>
				<h3 class={mobileIndicatorTitleClasses}>Audited Assets</h3>
				<p class={mobileIndicatorTextClasses}>Third-party verified</p>
			</div>
			
			<div class={indicatorClasses}>
				<div class={indicatorIconClasses}>
					<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
						<rect x="8" y="12" width="32" height="28" stroke="currentColor" stroke-width="2"/>
						<path d="M8 20H40" stroke="currentColor" stroke-width="2"/>
						<path d="M16 8V12M32 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						<path d="M16 28H24M16 32H32" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					</svg>
				</div>
				<h3 class={mobileIndicatorTitleClasses}>Institutional Grade</h3>
				<p class={mobileIndicatorTextClasses}>Professional operators</p>
			</div>
			
			<div class={indicatorClasses}>
				<div class={indicatorIconClasses}>
					<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
						<circle cx="24" cy="24" r="18" stroke="currentColor" stroke-width="2"/>
						<path d="M24 24L32 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						<circle cx="24" cy="24" r="3" fill="currentColor"/>
						<path d="M12 28L16 24L20 26L28 20L36 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
				<h3 class={mobileIndicatorTitleClasses}>Transparent</h3>
				<p class={mobileIndicatorTextClasses}>Real-time reporting</p>
			</div>
		</div>
		</div>
	</section>

	<!-- Market Insights -->
	<section class={mobileMarketInsightsClasses}>
		<div class={insightsContentClasses}>
			<div class={insightsTextClasses}>
				<h3 class={insightsTitleClasses}>Market Indicators</h3>
				<div class={marketDataClasses}>
					<div class={dataRowClasses}>
						<span>WTI Crude Oil</span>
						<span class={priceClasses}>${marketData.oilPrices.wti.price} <span class="{changeClasses} {marketData.oilPrices.wti.change >= 0 ? changePositiveClasses : changeNegativeClasses}">{marketData.oilPrices.wti.change >= 0 ? '+' : ''}{marketData.oilPrices.wti.change}%</span></span>
					</div>
					<div class={dataRowClasses}>
						<span>Brent Crude</span>
						<span class={priceClasses}>${marketData.oilPrices.brent.price} <span class="{changeClasses} {marketData.oilPrices.brent.change >= 0 ? changePositiveClasses : changeNegativeClasses}">{marketData.oilPrices.brent.change >= 0 ? '+' : ''}{marketData.oilPrices.brent.change}%</span></span>
					</div>
					<div class={dataRowClasses}>
						<span>Natural Gas</span>
						<span class={priceClasses}>${marketData.oilPrices.naturalGas.price} <span class="{changeClasses} {marketData.oilPrices.naturalGas.change >= 0 ? changePositiveClasses : changeNegativeClasses}">{marketData.oilPrices.naturalGas.change >= 0 ? '+' : ''}{marketData.oilPrices.naturalGas.change}%</span></span>
					</div>
				</div>
			</div>
			
			<div class={ctaBoxClasses}>
				<h4 class={ctaBoxTitleClasses}>Start Investing Today</h4>
				<p class={ctaBoxTextClasses}>Join {platformStats.activeInvestors.toLocaleString()} investors earning from energy assets</p>
				<SecondaryButton href="/assets">Get Started Now</SecondaryButton>
			</div>
		</div>
	</section>

</main>


<!-- Token Purchase Widget -->
<TokenPurchaseWidget 
	bind:isOpen={showPurchaseWidget}
	tokenAddress={selectedTokenAddress}
	assetId={selectedAssetId}
	on:purchaseSuccess={handlePurchaseSuccess}
	on:close={handleWidgetClose}
/>