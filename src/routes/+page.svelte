<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let paymentTokenBalance = 15420.75;
	let unclaimedYield = 1247.82;
	let platformStats = {
		totalAssets: 47,
		totalInvested: 127.4,
		averageYield: 11.3,
		activeInvestors: 8924
	};

	onMount(() => {
		// Animate platform stats on load
		const interval = setInterval(() => {
			platformStats = {
				...platformStats,
				totalInvested: platformStats.totalInvested + (Math.random() * 0.1),
				activeInvestors: platformStats.activeInvestors + Math.floor(Math.random() * 2)
			};
		}, 5000);
		return () => clearInterval(interval);
	});

	const featuredAssets = [
		{
			id: 1,
			name: 'Europa Wressle Release 1',
			location: 'North Sea Sector 7B',
			currentYield: 14.8,
			totalValue: 2400000,
			minInvestment: 1000,
			riskLevel: 'AA-',
			daysToFunding: 15,
			productionCapacity: '2,400 bbl/day',
			status: 'funding'
		},
		{
			id: 2,
			name: 'Bakken Horizon Field',
			location: 'North Dakota, USA',
			currentYield: 12.4,
			totalValue: 5200000,
			minInvestment: 2500,
			riskLevel: 'A+',
			daysToFunding: 23,
			productionCapacity: '4,100 bbl/day',
			status: 'producing'
		},
		{
			id: 3,
			name: 'Permian Basin Venture',
			location: 'Texas, USA',
			currentYield: 13.9,
			totalValue: 3800000,
			minInvestment: 5000,
			riskLevel: 'A',
			daysToFunding: 8,
			productionCapacity: '3,200 bbl/day',
			status: 'funding'
		}
	];

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(amount);
	}
</script>

<svelte:head>
	<title>Albion - Institutional Grade Oil & Gas DeFi</title>
	<meta name="description" content="Real-world energy assets. Tokenized yield. Transparent returns. Access institutional-quality oil & gas investments through blockchain technology." />
</svelte:head>

<main class="homepage">
	<!-- Hero Section -->
	<section class="hero">
		<div class="hero-content">
			<h1>Institutional Grade Oil & Gas DeFi</h1>
			<p>Real-world energy assets. Tokenized yield. Transparent returns.<br>
			Access institutional-quality oil & gas investments through blockchain technology.</p>
		</div>
		
		<!-- Platform Stats -->
		<div class="platform-stats">
			<div class="stat">
				<div class="stat-value">{platformStats.totalAssets}</div>
				<div class="stat-label">Total Assets</div>
				<div class="stat-note">Across 12 regions</div>
			</div>
			<div class="stat">
				<div class="stat-value">${platformStats.totalInvested.toFixed(1)}M</div>
				<div class="stat-label">Total Invested</div>
				<div class="stat-note">+8.2% this month</div>
			</div>
			<div class="stat">
				<div class="stat-value">{platformStats.averageYield}%</div>
				<div class="stat-label">Average Yield</div>
				<div class="stat-note">Annual APY</div>
			</div>
			<div class="stat">
				<div class="stat-value">{platformStats.activeInvestors.toLocaleString()}</div>
				<div class="stat-label">Active Investors</div>
				<div class="stat-note">Growing daily</div>
			</div>
		</div>

		<!-- CTA Buttons -->
		<div class="cta-buttons">
			<a href="/assets" class="btn-primary">Explore Investments</a>
			<a href="/about" class="btn-secondary">Learn How It Works</a>
		</div>
	</section>

	<!-- Featured Assets -->
	<section class="featured-assets">
		<div class="section-header">
			<h2>Top Performing Assets</h2>
			<div class="live-indicator">
				<div class="pulse-dot"></div>
				<span>Live Yields</span>
			</div>
		</div>
		
		<div class="assets-grid">
			{#each featuredAssets as asset}
				<article class="asset-card">
					<div class="asset-header">
						<div class="asset-info">
							<h3>{asset.name}</h3>
							<p class="location">{asset.location}</p>
						</div>
						<div class="asset-badges">
							<span class="risk-badge">{asset.riskLevel}</span>
							<span class="status-badge" class:producing={asset.status === 'producing'} class:funding={asset.status === 'funding'}>
								{asset.status.toUpperCase()}
							</span>
						</div>
					</div>
					
					<div class="asset-metrics">
						<div class="metric">
							<div class="metric-value">{asset.currentYield}%</div>
							<div class="metric-label">Current Yield</div>
						</div>
						<div class="metric">
							<div class="metric-value">${(asset.totalValue / 1000000).toFixed(1)}M</div>
							<div class="metric-label">Total Value</div>
						</div>
					</div>

					<div class="asset-details">
						<div class="detail-row">
							<span>Production</span>
							<span>{asset.productionCapacity}</span>
						</div>
						<div class="detail-row">
							<span>Min Investment</span>
							<span>{formatCurrency(asset.minInvestment)}</span>
						</div>
					</div>
					
					<a href="/assets/{asset.id}" class="btn-primary">Invest Now</a>
				</article>
			{/each}
		</div>
	</section>

	<!-- How It Works -->
	<section class="how-it-works">
		<h2>How It Works</h2>
		
		<div class="steps">
			<div class="step">
				<div class="step-number">1</div>
				<h3>Browse Assets</h3>
				<p>Explore vetted oil & gas assets with transparent production data, geological reports, and comprehensive risk metrics from institutional operators.</p>
			</div>
			
			<div class="step">
				<div class="step-number">2</div>
				<h3>Invest Tokens</h3>
				<p>Purchase royalty tokens using our smart payment system with automatic collateral management and instant settlement.</p>
			</div>
			
			<div class="step">
				<div class="step-number">3</div>
				<h3>Earn Yield</h3>
				<p>Receive proportional revenue from real oil & gas production directly to your wallet. Monthly distributions, transparent accounting.</p>
			</div>
		</div>
	</section>

	<!-- Trust Indicators -->
	<section class="trust-indicators">
		<h2>Why Choose Albion</h2>
		<div class="indicators">
			<div class="indicator">
				<h3>SEC Compliant</h3>
				<p>Full regulatory compliance</p>
			</div>
			
			<div class="indicator">
				<h3>Audited Assets</h3>
				<p>Third-party verified</p>
			</div>
			
			<div class="indicator">
				<h3>Institutional Grade</h3>
				<p>Professional operators</p>
			</div>
			
			<div class="indicator">
				<h3>Transparent</h3>
				<p>Real-time reporting</p>
			</div>
		</div>
	</section>

	<!-- Market Insights -->
	<section class="market-insights">
		<div class="insights-content">
			<div class="insights-text">
				<h3>Market Insights</h3>
				<p>Oil prices trending upward with global demand recovery. New drilling technologies increasing production efficiency.</p>
				<div class="market-data">
					<div class="data-row">
						<span>WTI Crude Oil</span>
						<span class="price">$78.45 +2.3%</span>
					</div>
					<div class="data-row">
						<span>Brent Crude</span>
						<span class="price">$82.17 +1.8%</span>
					</div>
					<div class="data-row">
						<span>Natural Gas</span>
						<span class="price">$3.24 +4.2%</span>
					</div>
				</div>
			</div>
			
			<div class="cta-box">
				<h4>Start Investing Today</h4>
				<p>Join thousands of investors earning from energy assets</p>
				<a href="/assets" class="btn-primary">Get Started Now</a>
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
		max-width: 900px;
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
		grid-template-columns: repeat(4, 1fr);
		gap: 3rem;
		max-width: 800px;
		margin: 0 auto 4rem;
		padding: 3rem;
		border: 1px solid var(--color-light-gray);
	}

	.stat {
		text-align: center;
		padding-right: 3rem;
		border-right: 1px solid var(--color-light-gray);
	}

	.stat:last-child {
		border-right: none;
		padding-right: 0;
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

	.featured-assets {
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

	.live-indicator {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8rem;
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.pulse-dot {
		width: 8px;
		height: 8px;
		background: var(--color-primary);
		border-radius: 50%;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	.assets-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 2rem;
	}

	.asset-card {
		border: 1px solid var(--color-light-gray);
		padding: 2rem;
		transition: border-color 0.2s ease;
	}

	.asset-card:hover {
		border-color: var(--color-primary);
	}

	.asset-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 2rem;
	}

	.asset-info h3 {
		font-size: 1.1rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
	}

	.location {
		font-size: 0.8rem;
		color: var(--color-secondary);
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.asset-badges {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: flex-end;
	}

	.risk-badge {
		background: var(--color-black);
		color: var(--color-white);
		padding: 0.25rem 0.5rem;
		font-size: 0.7rem;
		font-weight: var(--font-weight-bold);
	}

	.status-badge {
		padding: 0.25rem 0.5rem;
		font-size: 0.7rem;
		font-weight: var(--font-weight-bold);
	}

	.status-badge.producing {
		background: var(--color-light-gray);
		color: var(--color-primary);
	}

	.status-badge.funding {
		background: var(--color-light-gray);
		color: var(--color-secondary);
	}

	.asset-metrics {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.metric {
		text-align: center;
	}

	.metric-value {
		font-size: 1.5rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-primary);
		margin-bottom: 0.25rem;
	}

	.metric-label {
		font-size: 0.7rem;
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.asset-details {
		margin-bottom: 2rem;
		padding-top: 2rem;
		border-top: 1px solid var(--color-light-gray);
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 1rem;
		font-size: 0.9rem;
	}

	.detail-row span:first-child {
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
	}

	.detail-row span:last-child {
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
		max-width: 1000px;
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
		max-width: 1000px;
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
	}

	.insights-text p {
		font-size: 1.1rem;
		line-height: 1.6;
		margin-bottom: 2rem;
		opacity: 0.9;
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
			border-right: none;
			padding-right: 0;
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

		.assets-grid {
			grid-template-columns: 1fr;
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