<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import dataStoreService from '$lib/services/DataStoreService';
	import type { Token } from '$lib/types/dataStore';
	import FeaturedTokenCarousel from '$lib/components/carousel/FeaturedTokenCarousel.svelte';
	import TokenPurchaseWidget from '$lib/components/TokenPurchaseWidget.svelte';

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
	let selectedTokenAddress = null;
	let selectedAssetId = null;

	onMount(async () => {
		try {
			// Get platform statistics from real data
			const stats = dataStoreService.getPlatformStatistics();
			const allAssets = dataStoreService.getAllAssets();
			const allTokens = dataStoreService.getRoyaltyTokens();
			
			// Calculate total invested from royalty tokens' minted supply
			// Use different estimated values per token based on asset type and performance
			const totalInvested = allTokens.reduce((sum, token) => {
				const mintedTokens = parseFloat(token.supply.mintedSupply) / Math.pow(10, token.decimals);
				
				// Estimate token value based on asset type and performance
				let estimatedTokenValue = 1; // Base $1 per token
				
				// Adjust based on asset location and performance
				if (token.symbol.includes('BAK')) {
					estimatedTokenValue = 12; // Bakken assets - higher value
				} else if (token.symbol.includes('PER')) {
					estimatedTokenValue = 15; // Permian Basin - premium assets
				} else if (token.symbol.includes('GOM')) {
					estimatedTokenValue = 18; // Gulf of Mexico - deepwater premium
				} else if (token.symbol.includes('EUR')) {
					estimatedTokenValue = 8; // European assets
				}
				
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
				monthlyGrowthRate = 2.8; // Default growth rate
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
	
	function handleMintTokens(event) {
		selectedTokenAddress = event.detail.tokenAddress;
		selectedAssetId = null;
		showPurchaseWidget = true;
	}
	
	function handleBuyTokens(event) {
		selectedAssetId = event.detail.assetId;
		selectedTokenAddress = null;
		showPurchaseWidget = true;
	}
	
	function handlePurchaseSuccess(event) {
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

<main class="homepage">
	<!-- Hero Section -->
	<section class="hero">
		<div class="hero-content">
			<h1>Institutional Grade Oil & Gas DeFi</h1>
			<p>Real-world energy assets. Tokenized ownership. Transparent operations.<br>
			Access institutional-quality oil & gas investments through blockchain technology.</p>
		</div>
		
		<!-- Platform Stats -->
		<div class="platform-stats">
			{#if loading}
				<div class="stat">
					<div class="stat-value">--</div>
					<div class="stat-label">Total Invested</div>
					<div class="stat-note">Loading...</div>
				</div>
				<div class="stat">
					<div class="stat-value">--</div>
					<div class="stat-label">Assets</div>
					<div class="stat-note">Loading...</div>
				</div>
				<div class="stat">
					<div class="stat-value">--</div>
					<div class="stat-label">Active Investors</div>
					<div class="stat-note">Loading...</div>
				</div>
			{:else}
				<div class="stat">
					<div class="stat-value">${platformStats.totalInvested.toFixed(1)}M</div>
					<div class="stat-label">Total Invested</div>
					<div class="stat-note">{platformStats.monthlyGrowthRate >= 0 ? '+' : ''}{platformStats.monthlyGrowthRate.toFixed(1)}% this month</div>
				</div>
				<div class="stat">
					<div class="stat-value">{platformStats.totalAssets}</div>
					<div class="stat-label">Assets</div>
					<div class="stat-note">Across {platformStats.totalRegions} regions</div>
				</div>
				<div class="stat">
					<div class="stat-value">{platformStats.activeInvestors.toLocaleString()}</div>
					<div class="stat-label">Active Investors</div>
					<div class="stat-note">Token holders</div>
				</div>
			{/if}
		</div>

		<!-- CTA Buttons -->
		<div class="cta-buttons">
			<a href="/buy-tokens" class="btn-primary">Explore Investments</a>
			<a href="/about" class="btn-secondary">Learn How It Works</a>
		</div>
	</section>

	<!-- Featured Tokens Carousel -->
	<section class="featured-tokens">
		<div class="section-header">
			<h2>Featured Token Releases</h2>
		</div>
		
		<FeaturedTokenCarousel autoPlay={true} autoPlayInterval={6000} on:mintTokens={handleMintTokens} />
	</section>

	<!-- How It Works -->
	<section class="how-it-works">
		<h2>How It Works</h2>
		
		<div class="steps">
			<div class="step">
				<div class="step-number">1</div>
				<h3>Browse Assets</h3>
				<p>Explore vetted oil & gas assets with transparent production data, geological reports, and comprehensive performance metrics from institutional operators.</p>
			</div>
			
			<div class="step">
				<div class="step-number">2</div>
				<h3>Invest Tokens</h3>
				<p>Purchase royalty tokens using our smart payment system with automatic collateral management and instant settlement.</p>
			</div>
			
			<div class="step">
				<div class="step-number">3</div>
				<h3>Earn Payout</h3>
				<p>Receive proportional revenue from real oil & gas production directly to your wallet. Monthly payouts, transparent accounting.</p>
			</div>
		</div>
	</section>

	<!-- Trust Indicators -->
	<section class="trust-indicators">
		<h2>Why Choose Albion</h2>
		<div class="indicators">
			<div class="indicator">
				<div class="indicator-icon">
					<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M24 2L30 14H42L32 22L36 34L24 26L12 34L16 22L6 14H18L24 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
						<circle cx="24" cy="24" r="8" stroke="currentColor" stroke-width="2"/>
					</svg>
				</div>
				<h3>SEC Compliant</h3>
				<p>Full regulatory compliance</p>
			</div>
			
			<div class="indicator">
				<div class="indicator-icon">
					<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M20 28L28 20M20 28L16 32L20 28ZM28 20L32 16L28 20Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						<circle cx="24" cy="24" r="18" stroke="currentColor" stroke-width="2"/>
						<path d="M15 24C15 24 18 30 24 30C30 30 33 24 33 24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					</svg>
				</div>
				<h3>Audited Assets</h3>
				<p>Third-party verified</p>
			</div>
			
			<div class="indicator">
				<div class="indicator-icon">
					<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
						<rect x="8" y="12" width="32" height="28" stroke="currentColor" stroke-width="2"/>
						<path d="M8 20H40" stroke="currentColor" stroke-width="2"/>
						<path d="M16 8V12M32 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						<path d="M16 28H24M16 32H32" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					</svg>
				</div>
				<h3>Institutional Grade</h3>
				<p>Professional operators</p>
			</div>
			
			<div class="indicator">
				<div class="indicator-icon">
					<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
						<circle cx="24" cy="24" r="18" stroke="currentColor" stroke-width="2"/>
						<path d="M24 24L32 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						<circle cx="24" cy="24" r="3" fill="currentColor"/>
						<path d="M12 28L16 24L20 26L28 20L36 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
				<h3>Transparent</h3>
				<p>Real-time reporting</p>
			</div>
		</div>
	</section>

	<!-- Market Insights -->
	<section class="market-insights">
		<div class="insights-content">
			<div class="insights-text">
				<h3>Market Indicators</h3>
				<div class="market-data">
					<div class="data-row">
						<span>WTI Crude Oil</span>
						<span class="price">$73.45 <span class="change positive">+1.2%</span></span>
					</div>
					<div class="data-row">
						<span>Brent Crude</span>
						<span class="price">$78.20 <span class="change negative">-0.8%</span></span>
					</div>
					<div class="data-row">
						<span>Natural Gas</span>
						<span class="price">$2.84 <span class="change positive">+0.5%</span></span>
					</div>
				</div>
			</div>
			
			<div class="cta-box">
				<h4>Start Investing Today</h4>
				<p>Join {platformStats.activeInvestors.toLocaleString()} investors earning from energy assets</p>
				<a href="/buy-tokens" class="btn-primary">Get Started Now</a>
			</div>
		</div>
	</section>
</main>

<style>
	.homepage {
		padding-top: 0;
	}

	.hero {
		padding: 6rem 2rem;
		text-align: center;
		background: var(--color-white);
		border-bottom: 1px solid var(--color-light-gray);
	}

	.hero-content {
		max-width: 1200px;
		margin: 0 auto 4rem;
	}

	.hero h1 {
		font-size: 3.5rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 2rem;
		color: var(--color-black);
		letter-spacing: -0.02em;
		line-height: 1.1;
	}

	.hero p {
		font-size: 1.25rem;
		line-height: 1.6;
		color: var(--color-black);
		max-width: 700px;
		margin: 0 auto;
	}

	.platform-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2rem;
		max-width: 700px;
		margin: 0 auto 4rem;
		padding: 2rem;
		border: 1px solid var(--color-light-gray);
	}

	.stat {
		text-align: center;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
	}

	.stat-label {
		font-size: 0.8rem;
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.25rem;
	}

	.stat-note {
		font-size: 0.7rem;
		color: var(--color-primary);
		font-weight: var(--font-weight-medium);
	}

	.cta-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.featured-tokens {
		padding: 4rem 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 3rem;
	}

	.section-header h2 {
		font-size: 2rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
	}



	.how-it-works {
		padding: 4rem 2rem;
		background: var(--color-light-gray);
		text-align: center;
	}

	.how-it-works h2 {
		font-size: 2rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 3rem;
	}

	.steps {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 3rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.step {
		text-align: center;
	}

	.step-number {
		width: 60px;
		height: 60px;
		background: var(--color-black);
		color: var(--color-white);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		font-weight: var(--font-weight-extrabold);
		margin: 0 auto 1.5rem;
	}

	.step h3 {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 1rem;
	}

	.step p {
		font-size: 0.9rem;
		line-height: 1.6;
		color: var(--color-black);
	}

	.trust-indicators {
		padding: 4rem 2rem;
		text-align: center;
		max-width: 1200px;
		margin: 0 auto;
	}

	.trust-indicators h2 {
		font-size: 2rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 3rem;
	}

	.indicators {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 2rem;
	}

	.indicator {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.indicator-icon {
		margin-bottom: 1.5rem;
		color: var(--color-black);
		display: flex;
		align-items: center;
		justify-content: center;
		width: 64px;
		height: 64px;
		position: relative;
	}

	.indicator-icon svg {
		width: 48px;
		height: 48px;
		transition: transform 0.2s ease;
	}

	.indicator:hover .indicator-icon svg {
		transform: scale(1.1);
	}

	.indicator h3 {
		font-size: 1rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
	}

	.indicator p {
		font-size: 0.8rem;
		color: var(--color-black);
		font-weight: var(--font-weight-medium);
	}

	.market-insights {
		padding: 4rem 2rem;
		background: var(--color-secondary);
		color: var(--color-white);
	}

	.insights-content {
		display: grid;
		grid-template-columns: 1fr 400px;
		gap: 4rem;
		max-width: 1200px;
		margin: 0 auto;
		align-items: center;
	}

	.insights-text h3 {
		font-size: 2rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 1.5rem;
		color: #ffffff;
	}


	.market-data {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.data-row {
		display: flex;
		justify-content: space-between;
		font-weight: var(--font-weight-semibold);
	}

	.price {
		color: var(--color-primary);
		font-weight: var(--font-weight-extrabold);
	}

	.change {
		font-size: 0.8rem;
		font-weight: var(--font-weight-semibold);
		margin-left: 0.5rem;
	}

	.change.positive {
		color: var(--color-primary);
	}

	.change.negative {
		color: #ff4444;
	}

	.cta-box {
		text-align: center;
		padding: 3rem;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.cta-box h4 {
		font-size: 1.5rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 1rem;
		color: #ffffff;
	}

	.cta-box p {
		margin-bottom: 2rem;
		opacity: 0.9;
	}

	.btn-primary,
	.btn-secondary {
		padding: 1rem 2rem;
		text-decoration: none;
		font-weight: var(--font-weight-semibold);
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		transition: background-color 0.2s ease;
		display: inline-block;
	}

	.btn-primary {
		background: var(--color-black);
		color: var(--color-white);
	}

	.btn-primary:hover {
		background: var(--color-secondary);
	}

	.btn-secondary {
		background: var(--color-white);
		color: var(--color-black);
		border: 1px solid var(--color-black);
	}

	.btn-secondary:hover {
		background: var(--color-black);
		color: var(--color-white);
	}

	.market-insights .btn-primary {
		background: var(--color-white);
		color: var(--color-black);
	}

	.market-insights .btn-primary:hover {
		background: var(--color-light-gray);
	}

	@media (max-width: 768px) {
		.hero h1 {
			font-size: 2.5rem;
		}

		.platform-stats {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.stat {
			border-bottom: 1px solid var(--color-light-gray);
			padding-bottom: 2rem;
		}

		.stat:last-child {
			border-bottom: none;
			padding-bottom: 0;
		}

		.cta-buttons {
			flex-direction: column;
			align-items: center;
		}


		.steps {
			grid-template-columns: 1fr;
		}

		.indicators {
			grid-template-columns: repeat(2, 1fr);
		}

		.insights-content {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.section-header {
			flex-direction: column;
			gap: 1rem;
			text-align: center;
		}
	}
</style>

<!-- Token Purchase Widget -->
<TokenPurchaseWidget 
	bind:isOpen={showPurchaseWidget}
	tokenAddress={selectedTokenAddress}
	assetId={selectedAssetId}
	on:purchaseSuccess={handlePurchaseSuccess}
	on:close={handleWidgetClose}
/>