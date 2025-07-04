<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import dataStoreService from '$lib/services/DataStoreService';
	import type { Asset, Token } from '$lib/types/dataStore';
	import { Card, CardContent, PrimaryButton, SecondaryButton } from '$lib/components/ui';

	let loading = true;
	let error: string | null = null;
	let activeTab = 'overview';
	let unclaimedPayout = 1247.82;
	let assetData: Asset | null = null;
	let assetTokens: Token[] = [];
	
	// Tooltip state
	let showTooltip = '';
	let tooltipTimer: any = null;
	
	// Purchase widget state
	let showPurchaseWidget = false;
	let selectedTokenAddress: string | null = null;
	
	// Email notification popup state
	let showEmailPopup = false;
	let emailAddress = '';
	let isSubmittingEmail = false;
	let emailSubmitted = false;


	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(amount);
	}

	function formatEndDate(dateStr: string): string {
		if (!dateStr) return 'TBD';
		const [year, month] = dateStr.split('-');
		const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
						 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		return `${monthNames[parseInt(month) - 1]} ${year}`;
	}

	function exportProductionData() {
		if (!assetData?.monthlyReports) return;
		
		const csvContent = [
			['Month', 'Production (bbl)', 'Revenue (USD)', 'Expenses (USD)', 'Net Income (USD)', 'Payout Per Token (USD)'],
			...assetData.monthlyReports.map(report => [
				report.month,
				report.production.toString(),
				report.revenue.toString(),
				report.expenses.toString(),
				report.netIncome.toString(),
				report.payoutPerToken.toString()
			])
		].map(row => row.join(',')).join('\n');
		
		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${assetData.id}-production-data.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function exportPaymentsData() {
		if (!assetData?.monthlyReports) return;
		
		const csvContent = [
			['Month', 'Total Payout (USD)', 'Payout Per Token (USD)', 'Total Tokens', 'Oil Price (USD/bbl)'],
			...assetData.monthlyReports.map(report => [
				report.month,
				report.netIncome.toString(),
				report.payoutPerToken.toString(),
				'50000', // Placeholder for total tokens
				'72.45' // Placeholder for oil price
			])
		].map(row => row.join(',')).join('\n');
		
		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${assetData.id}-payments-data.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function getAssetImage(assetId: string): string {
		// Map each asset to specific oil & gas industry images
		const imageMap: Record<string, string> = {
			'europa-wressle-release-1': '/images/assets/europa-wressle-1.jpg', // Wressle oil field (UK onshore)
			'bakken-horizon-field': '/images/assets/bakken-horizon-1.jpeg', // Bakken shale operations (ND)
			'permian-basin-venture': '/images/assets/permian-basin-1.jpg', // Permian basin operations (TX)
			'gulf-mexico-deep-water': '/images/assets/gom-deepwater-1.avif' // Gulf of Mexico offshore platform
		};
		
		// Fallback to a generic oil industry image
		return imageMap[assetId] || '/images/assets/europa-wressle-1.jpg';
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

	// Track flipped state for each token card
	let flippedCards = new Set();
	
	function toggleCardFlip(tokenAddress: string) {
		if (flippedCards.has(tokenAddress)) {
			flippedCards.delete(tokenAddress);
		} else {
			flippedCards.add(tokenAddress);
		}
		flippedCards = new Set(flippedCards); // Trigger reactivity
	}


	onMount(() => {
		const assetId = $page.params.id;
		
		try {
			// Load asset data from store
			const asset = dataStoreService.getAssetById(assetId);
			
			if (!asset) {
				error = 'Asset not found';
				loading = false;
				return;
			}
			
			assetData = asset;
			
			// Load associated tokens
			const tokens = dataStoreService.getTokensByAssetId(assetId);
			assetTokens = tokens;
			
			loading = false;
		} catch (err) {
			console.error('Error loading asset:', err);
			error = 'Error loading asset data';
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>{assetData?.name || 'Asset Details'} - Albion</title>
	<meta name="description" content="Detailed information about {assetData?.name || 'asset'}" />
</svelte:head>

<main class="asset-details">
	{#if loading}
		<div class="loading-state">
			<p>Loading asset details...</p>
		</div>
	{:else if error}
		<div class="error-state">
			<h1>Error</h1>
			<p>{error}</p>
			<a href="/assets" class="btn-primary">Back to Assets</a>
		</div>
	{:else}
		<!-- Breadcrumb -->
		<nav class="breadcrumb">
			<a href="/assets" class="breadcrumb-link">← Back to Assets</a>
			<span class="breadcrumb-separator">/</span>
			<span class="breadcrumb-current">{assetData?.name || 'Asset Details'}</span>
		</nav>

		<!-- Asset Header -->
		<div class="asset-header">
			<div class="asset-main-info">
				<div class="asset-title-section">
					<div class="asset-icon">
						<img 
							src={getAssetImage(assetData?.id || '')} 
							alt={assetData?.name || 'Asset'}
							loading="lazy"
						/>
					</div>
					<div class="title-info">
						<h1>{assetData?.name}</h1>
						<div class="asset-meta">
							<span class="location">📍 {assetData?.location.state}, {assetData?.location.country}</span>
						</div>
						<div class="operator-info">
							<span>Operated by {assetData?.operator.name}</span>
							<span>•</span>
							<span>License {assetData?.technical.license}</span>
						</div>
					</div>
				</div>
			</div>

			<div class="asset-metrics">
				<div class="metric">
					<div class="metric-value">{assetData?.production.current}</div>
					<div class="metric-label">Current Production</div>
				</div>
				<div class="metric">
					<div class="metric-value">{assetData?.monthlyReports?.[0]?.netIncome 
						? formatCurrency(assetData.monthlyReports[0].netIncome)
						: '$20,000'}</div>
					<div class="metric-label">Last Received Income</div>
					<div class="metric-subtitle">{assetData?.monthlyReports?.[0]?.month 
						? formatEndDate(assetData.monthlyReports[0].month + '-01')
						: 'May 2025'}</div>
				</div>
				<div class="metric clickable-metric" on:click={() => document.getElementById('token-section')?.scrollIntoView({ behavior: 'smooth' })}>
					<div class="metric-value">{assetTokens.length}</div>
					<div class="metric-label">Available Tokens</div>
					<div class="metric-subtitle">👆 Click to view tokens</div>
				</div>
			</div>

		</div>

		<!-- Tabs Navigation -->
		<div class="tabs-container" id="asset-details-tabs">
			<div class="tabs-nav">
				<button 
					class="tab-btn"
					class:active={activeTab === 'overview'}
					on:click={() => activeTab = 'overview'}
				>
					Overview
				</button>
				<button 
					class="tab-btn"
					class:active={activeTab === 'production'}
					on:click={() => activeTab = 'production'}
				>
					Production Data
				</button>
				<button 
					class="tab-btn"
					class:active={activeTab === 'payments'}
					on:click={() => activeTab = 'payments'}
				>
					Past Payments
				</button>
				<button 
					class="tab-btn"
					class:active={activeTab === 'documents'}
					on:click={() => activeTab = 'documents'}
				>
					Documents
				</button>
			</div>

			<!-- Tab Content -->
			<div class="tab-content">
				{#if activeTab === 'overview'}
					<div class="overview-content">
						<div class="fundamentals-grid">
							<div class="fundamentals-section">
								<h4>Asset Fundamentals</h4>
								<div class="detail-rows">
									<div class="detail-row">
										<span>Field Type</span>
										<span>{assetData?.technical.fieldType}</span>
									</div>
									<div class="detail-row">
										<span>Crude Benchmark</span>
										<span>{assetData?.technical.crudeBenchmark}</span>
									</div>
									<div class="detail-row">
										<span>Pricing</span>
										<span>{formatPricing(assetData?.technical.pricing?.benchmarkPremium || '')}, {assetData?.technical.pricing?.transportCosts}</span>
									</div>
									<div class="detail-row">
										<span>First Oil</span>
										<span>{assetData?.technical.firstOil}</span>
									</div>
									<div class="detail-row">
										<span>Estimated End Date</span>
										<span>{formatEndDate(assetData?.technical.expectedEndDate || '')}</span>
									</div>
									<div class="detail-row">
										<span>Coordinates</span>
										<span>{assetData?.location.coordinates.lat}°, {assetData?.location.coordinates.lng}°</span>
									</div>
								</div>
							</div>

							<div class="operational-section">
								<h4>Asset Terms</h4>
								<div class="detail-rows">
									<div class="detail-row">
										<span>Interest Type</span>
										<span>{assetData?.assetTerms?.interestType}</span>
									</div>
									<div class="detail-row">
										<span>Amount</span>
										<span>{assetData?.assetTerms?.amount}</span>
									</div>
									<div class="detail-row">
										<span>Payment Frequency</span>
										<span>{assetData?.assetTerms?.paymentFrequency}</span>
									</div>
									<div class="detail-row">
										<span>Infrastructure</span>
										<span>{assetData?.technical.infrastructure}</span>
									</div>
								</div>
							</div>
						</div>

					</div>
				{:else if activeTab === 'production'}
					<div class="production-content">
						<div class="production-grid">
							<div class="chart-section chart-large">
								<div class="chart-header">
									<h4>Production History</h4>
									<SecondaryButton on:click={exportProductionData}>
										📊 Export Data
									</SecondaryButton>
								</div>
								<div class="chart-container">
									<svg class="production-chart" viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg">
										<!-- Chart background -->
										<rect width="800" height="300" fill="var(--color-white)" stroke="var(--color-light-gray)" stroke-width="1"/>
										
										<!-- Grid lines -->
										{#each Array(6) as _, i}
											<line x1="80" y1={50 + i * 40} x2="750" y2={50 + i * 40} stroke="var(--color-light-gray)" stroke-width="0.5" opacity="0.5"/>
										{/each}
										{#each Array(12) as _, i}
											<line x1={80 + i * 55.8} y1="50" x2={80 + i * 55.8} y2="250" stroke="var(--color-light-gray)" stroke-width="0.5" opacity="0.5"/>
										{/each}
										
										<!-- Y-axis labels (Production in bbl/day) -->
										<text x="70" y="55" text-anchor="end" font-size="10" fill="var(--color-black)">3000</text>
										<text x="70" y="95" text-anchor="end" font-size="10" fill="var(--color-black)">2500</text>
										<text x="70" y="135" text-anchor="end" font-size="10" fill="var(--color-black)">2000</text>
										<text x="70" y="175" text-anchor="end" font-size="10" fill="var(--color-black)">1500</text>
										<text x="70" y="215" text-anchor="end" font-size="10" fill="var(--color-black)">1000</text>
										<text x="70" y="255" text-anchor="end" font-size="10" fill="var(--color-black)">500</text>
										
										<!-- X-axis labels (Months) -->
										<text x="108" y="270" text-anchor="middle" font-size="9" fill="var(--color-black)">Jan</text>
										<text x="164" y="270" text-anchor="middle" font-size="9" fill="var(--color-black)">Feb</text>
										<text x="220" y="270" text-anchor="middle" font-size="9" fill="var(--color-black)">Mar</text>
										<text x="276" y="270" text-anchor="middle" font-size="9" fill="var(--color-black)">Apr</text>
										<text x="332" y="270" text-anchor="middle" font-size="9" fill="var(--color-black)">May</text>
										<text x="388" y="270" text-anchor="middle" font-size="9" fill="var(--color-black)">Jun</text>
										<text x="444" y="270" text-anchor="middle" font-size="9" fill="var(--color-black)">Jul</text>
										<text x="500" y="270" text-anchor="middle" font-size="9" fill="var(--color-black)">Aug</text>
										<text x="556" y="270" text-anchor="middle" font-size="9" fill="var(--color-black)">Sep</text>
										<text x="612" y="270" text-anchor="middle" font-size="9" fill="var(--color-black)">Oct</text>
										<text x="668" y="270" text-anchor="middle" font-size="9" fill="var(--color-black)">Nov</text>
										<text x="724" y="270" text-anchor="middle" font-size="9" fill="var(--color-black)">Dec</text>
										
										<!-- Production decline curve (simulated data) -->
										<polyline 
											points="108,80 164,85 220,92 276,100 332,110 388,122 444,136 500,152 556,170 612,190 668,212 724,236"
											fill="none" 
											stroke="var(--color-primary)" 
											stroke-width="3"
										/>
										
										<!-- Data points -->
										{#each Array(12) as _, i}
											<circle 
												cx={108 + i * 55.8} 
												cy={80 + i * 13 + Math.random() * 8} 
												r="4" 
												fill="var(--color-secondary)"
												stroke="var(--color-white)"
												stroke-width="2"
											/>
										{/each}
										
										<!-- Chart title -->
										<text x="400" y="25" text-anchor="middle" font-size="12" font-weight="bold" fill="var(--color-black)">Production Decline Curve (bbl/day)</text>
										
										<!-- Legend -->
										<rect x="580" y="60" width="150" height="40" fill="var(--color-white)" stroke="var(--color-light-gray)" stroke-width="1"/>
										<line x1="590" y1="70" x2="610" y2="70" stroke="var(--color-primary)" stroke-width="3"/>
										<text x="615" y="75" font-size="9" fill="var(--color-black)">Production Rate</text>
										<circle cx="600" cy="85" r="3" fill="var(--color-secondary)"/>
										<text x="615" y="90" font-size="9" fill="var(--color-black)">Monthly Data</text>
									</svg>
								</div>
							</div>

							<div class="production-metrics">
								<h4>Production Metrics</h4>
								<div class="uptime-metric">
									<div class="uptime-value">98.2%</div>
									<div class="uptime-label">Uptime Last 12 Months</div>
								</div>
								<div class="metrics-grid">
									<div class="metric-item">
										<div class="metric-value">2,387</div>
										<div class="metric-label">Avg Daily Production (bbl)</div>
									</div>
									<div class="metric-item">
										<div class="metric-value">15.2</div>
										<div class="metric-label">Days Downtime</div>
									</div>
								</div>
								<div class="hse-metric">
									<div class="hse-value">365</div>
									<div class="hse-label">Days Since Last HSE Incident</div>
								</div>
							</div>
						</div>
					</div>
				{:else if activeTab === 'payments'}
					<div class="payments-content" id="payments-section">
						<div class="payments-grid">
							<div class="payments-chart">
								<div class="chart-header">
									<h4>Payment History</h4>
									<SecondaryButton on:click={exportPaymentsData}>
										📊 Export Data
									</SecondaryButton>
								</div>
								<svg class="bar-chart" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
									<!-- Chart background -->
									<rect width="800" height="400" fill="var(--color-white)" stroke="var(--color-light-gray)" stroke-width="1"/>
									
									<!-- Grid lines -->
									{#each Array(6) as _, i}
										<line x1="80" y1={50 + i * 50} x2="750" y2={50 + i * 50} stroke="var(--color-light-gray)" stroke-width="0.5" opacity="0.5"/>
									{/each}
									
									<!-- Y-axis labels (Payment amounts) -->
									<text x="70" y="55" text-anchor="end" font-size="10" fill="var(--color-black)">$50k</text>
									<text x="70" y="105" text-anchor="end" font-size="10" fill="var(--color-black)">$40k</text>
									<text x="70" y="155" text-anchor="end" font-size="10" fill="var(--color-black)">$30k</text>
									<text x="70" y="205" text-anchor="end" font-size="10" fill="var(--color-black)">$20k</text>
									<text x="70" y="255" text-anchor="end" font-size="10" fill="var(--color-black)">$10k</text>
									<text x="70" y="305" text-anchor="end" font-size="10" fill="var(--color-black)">$0</text>
									
									<!-- Bars for each month -->
									{#each (assetData?.monthlyReports || []).slice(-12).reverse() as report, i}
										{@const barHeight = (report.netIncome / 50000) * 250}
										{@const x = 100 + i * 55}
										{@const [year, month] = report.month.split('-')}
										{@const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}
										{@const monthLabel = `${monthNames[parseInt(month) - 1]}-${year}`}
										<rect 
											x={x} 
											y={300 - barHeight} 
											width="40" 
											height={barHeight}
											fill="var(--color-primary)"
											opacity="0.8"
										/>
										<text 
											x={x + 20} 
											y="320" 
											text-anchor="middle" 
											font-size="8" 
											fill="var(--color-black)"
											transform="rotate(-45 {x + 20} 320)"
										>
											{monthLabel}
										</text>
										<text 
											x={x + 20} 
											y={295 - barHeight} 
											text-anchor="middle" 
											font-size="8" 
											fill="var(--color-black)"
											font-weight="bold"
										>
											${(report.netIncome / 1000).toFixed(1)}k
										</text>
									{/each}
									
									<!-- Chart title -->
									<text x="400" y="25" text-anchor="middle" font-size="14" font-weight="bold" fill="var(--color-black)">Monthly Payments to Token Holders</text>
								</svg>
							</div>
							<div class="payment-metrics">
								<h4>Payment Metrics</h4>
								<div class="payment-metric-item">
									<div class="metric-label">Next Payment Due</div>
									<div class="metric-value">15 Jan 2025</div>
								</div>
								<div class="payment-metric-item">
									<div class="metric-label">Realised Avg Oil Price</div>
									<div class="metric-value">$72.45/bbl</div>
								</div>
								<div class="payment-metric-item">
									<div class="metric-label">Realised Diff to Benchmark</div>
									<div class="metric-value">-$2.50/bbl</div>
								</div>
							</div>
						</div>
					</div>
				{:else if activeTab === 'documents'}
					<div class="documents-content">
						<div class="documents-grid">
							<div class="documents-section">
								<h4>Legal Documents</h4>
								<div class="documents-list">
									<div class="document-item">
										<div class="doc-info">
											<div class="doc-icon">📄</div>
											<div class="doc-details">
												<div class="doc-name">Asset Purchase Agreement</div>
												<div class="doc-meta">PDF • 2.4 MB</div>
											</div>
										</div>
										<SecondaryButton>Download</SecondaryButton>
									</div>
									<div class="document-item">
										<div class="doc-info">
											<div class="doc-icon">📄</div>
											<div class="doc-details">
												<div class="doc-name">Operating License PEDL 183</div>
												<div class="doc-meta">PDF • 1.8 MB</div>
											</div>
										</div>
										<SecondaryButton>Download</SecondaryButton>
									</div>
									<div class="document-item">
										<div class="doc-info">
											<div class="doc-icon">📄</div>
											<div class="doc-details">
												<div class="doc-name">Environmental Impact Assessment</div>
												<div class="doc-meta">PDF • 5.2 MB</div>
											</div>
										</div>
										<SecondaryButton>Download</SecondaryButton>
									</div>
									<div class="document-item">
										<div class="doc-info">
											<div class="doc-icon">📄</div>
											<div class="doc-details">
												<div class="doc-name">Token Terms & Conditions</div>
												<div class="doc-meta">PDF • 950 KB</div>
											</div>
										</div>
										<SecondaryButton>Download</SecondaryButton>
									</div>
								</div>
							</div>

							<div class="documents-section">
								<h4>Technical Reports</h4>
								<div class="documents-list">
									<div class="document-item">
										<div class="doc-info">
											<div class="doc-icon">📊</div>
											<div class="doc-details">
												<div class="doc-name">Geological Survey Report 2024</div>
												<div class="doc-meta">PDF • 12.1 MB</div>
											</div>
										</div>
										<SecondaryButton>Download</SecondaryButton>
									</div>
									<div class="document-item">
										<div class="doc-info">
											<div class="doc-icon">📊</div>
											<div class="doc-details">
												<div class="doc-name">Reserve Audit by Ryder Scott</div>
												<div class="doc-meta">PDF • 3.7 MB</div>
											</div>
										</div>
										<SecondaryButton>Download</SecondaryButton>
									</div>
									<div class="document-item">
										<div class="doc-info">
											<div class="doc-icon">📊</div>
											<div class="doc-details">
												<div class="doc-name">Production Forecast Model</div>
												<div class="doc-meta">PDF • 2.1 MB</div>
											</div>
										</div>
										<SecondaryButton>Download</SecondaryButton>
									</div>
									<div class="document-item">
										<div class="doc-info">
											<div class="doc-icon">🗜️</div>
											<div class="doc-details">
												<div class="doc-name">Monthly Production Reports</div>
												<div class="doc-meta">ZIP • 8.9 MB</div>
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

		<!-- Token Information Section -->
		<div class="token-info-section" id="token-section">
			<h3>Token Information</h3>
			<div class="tokens-grid">
				{#each assetTokens as token}
					{@const supply = dataStoreService.getTokenSupply(token.contractAddress)}
					{@const hasAvailableSupply = supply && supply.availableSupply > 0}
					{@const payoutHistory = (supply as any)?.payoutHistory || []}
					{@const latestPayout = payoutHistory[payoutHistory.length - 1]}
					{@const isFlipped = flippedCards.has(token.contractAddress)}
					<div class="token-card-container" class:flipped={isFlipped}>
						<Card hoverable clickable on:click={() => handleBuyTokens(token.contractAddress)}>
							<CardContent>
								<div class="token-card-front">
									<div class="token-header">
										<div class="token-title">
											<h4>{token.name}</h4>
											<p class="token-symbol">{token.contractAddress}</p>
										</div>
										<div class="token-share-badge">
											{token.assetShare?.sharePercentage || 25}% of Asset
										</div>
									</div>
									<div class="token-badge" class:sold-out={!hasAvailableSupply}>
										{hasAvailableSupply ? 'Available' : 'Sold Out'}
									</div>
							
									<div class="token-metrics">
										<div class="token-metric">
											<span class="metric-label">Minted Supply</span>
											<span class="metric-value">{supply?.mintedSupply.toLocaleString() || '0'}</span>
										</div>
										<div class="token-metric">
											<span class="metric-label">Max Supply</span>
											<span class="metric-value">{supply?.maxSupply.toLocaleString() || '0'}</span>
										</div>
										<div class="token-metric tooltip-container">
											<span class="metric-label">
												Implied Barrels/Token
												<span class="tooltip-trigger" 
													on:mouseenter={() => showTooltipWithDelay('barrels')}
													on:mouseleave={hideTooltip}>ⓘ</span>
											</span>
											<span class="metric-value">0.008</span>
											{#if showTooltip === 'barrels'}
												<div class="tooltip">
													Estimated barrels of oil equivalent per token based on reserves and token supply
												</div>
											{/if}
										</div>
										<div class="token-metric tooltip-container">
											<span class="metric-label">
												Breakeven Oil Price
												<span class="tooltip-trigger"
													on:mouseenter={() => showTooltipWithDelay('breakeven')}
													on:mouseleave={hideTooltip}>ⓘ</span>
											</span>
											<span class="metric-value">$45</span>
											{#if showTooltip === 'breakeven'}
												<div class="tooltip">
													Oil price required to cover operational costs and maintain profitability
												</div>
											{/if}
										</div>
									</div>

									<div class="token-returns">
										<h5>Estimated Returns</h5>
										<div class="returns-grid">
											<div class="return-item tooltip-container">
												<span class="return-label">
													Base
													<span class="tooltip-trigger"
														on:mouseenter={() => showTooltipWithDelay('base')}
														on:mouseleave={hideTooltip}>ⓘ</span>
												</span>
												<span class="return-value">6-8%</span>
												{#if showTooltip === 'base'}
													<div class="tooltip">
														Conservative return estimate based on current production and oil prices
													</div>
												{/if}
											</div>
											<div class="return-item tooltip-container">
												<span class="return-label">
													Bonus
													<span class="tooltip-trigger"
														on:mouseenter={() => showTooltipWithDelay('bonus')}
														on:mouseleave={hideTooltip}>ⓘ</span>
												</span>
												<span class="return-value">+2-4%</span>
												{#if showTooltip === 'bonus'}
													<div class="tooltip">
														Additional potential return from improved oil prices or production efficiency
													</div>
												{/if}
											</div>
											<div class="return-item total">
												<span class="return-label">Total Expected</span>
												<span class="return-value">8-12%</span>
											</div>
										</div>
									</div>

									{#if latestPayout}
										<div class="recent-distribution">
											<h5>Most Recent Distribution</h5>
											<div class="distribution-info">
												<div class="distribution-amounts">
													<div class="total-amount">
														<span class="amount-label">Total</span>
														<span class="amount-value">${latestPayout.totalPayout.toFixed(2)}</span>
													</div>
													<div class="per-token-amount">
														<span class="amount-label">Per Token</span>
														<span class="amount-value">${latestPayout.payoutPerToken.toFixed(4)}</span>
													</div>
												</div>
												<div class="distribution-date">{latestPayout.month}</div>
											</div>
										</div>
									{/if}

									<div class="token-actions">
										<div class="action-buttons">
											{#if hasAvailableSupply}
												<PrimaryButton fullWidth on:click={(e) => { e.stopPropagation(); handleBuyTokens(token.contractAddress); }}>
													Buy Tokens
												</PrimaryButton>
											{:else}
												<PrimaryButton fullWidth disabled>
													Sold Out
												</PrimaryButton>
											{/if}
											<SecondaryButton fullWidth on:click={(e) => { e.stopPropagation(); toggleCardFlip(token.contractAddress); }}>
												View History
											</SecondaryButton>
										</div>
									</div>
								</div>
								
								<div class="token-card-back">
									<div class="back-header">
										<h4>Payment History</h4>
										<SecondaryButton on:click={(e) => { e.stopPropagation(); toggleCardFlip(token.contractAddress); }}>
											← Back
										</SecondaryButton>
									</div>
									
									{#if payoutHistory.length > 0}
										<div class="history-list">
											{#each payoutHistory.slice(-6) as payout}
												<div class="history-item">
													<div class="history-date">{payout.month}</div>
													<div class="history-amount">${payout.payoutPerToken.toFixed(4)}</div>
												</div>
											{/each}
										</div>
										<div class="history-summary">
											<div class="summary-item">
												<span class="summary-label">Total Received</span>
												<span class="summary-value">${payoutHistory.reduce((sum, p) => sum + p.payoutPerToken, 0).toFixed(2)}</span>
											</div>
											<div class="summary-item">
												<span class="summary-label">Avg Per Month</span>
												<span class="summary-value">${(payoutHistory.reduce((sum, p) => sum + p.payoutPerToken, 0) / payoutHistory.length).toFixed(4)}</span>
											</div>
										</div>
									{:else}
										<div class="no-history">
											<p>No payment history available yet.</p>
											<p>First payout expected in Q1 2025.</p>
										</div>
									{/if}
								</div>
							</CardContent>
						</Card>
					</div>
				{/each}
				<!-- Coming Soon Card -->
				<Card hoverable>
					<CardContent>
						<div class="coming-soon-card">
							<div class="coming-soon-icon">🚀</div>
							<h4>New Release Coming Soon</h4>
							<p>Next token release planned for Q1 2025</p>
							<SecondaryButton on:click={handleGetNotified}>
								Get Notified
							</SecondaryButton>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	{/if}
</main>

<!-- Token Purchase Widget -->
{#if showPurchaseWidget}
	{#await import('$lib/components/TokenPurchaseWidget.svelte') then { default: TokenPurchaseWidget }}
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
	<div class="email-popup-overlay" on:click={handleCloseEmailPopup}>
		<div class="email-popup" on:click|stopPropagation>
			<div class="email-popup-header">
				<h3 class="email-popup-title">Get Notified</h3>
				<button class="email-popup-close" on:click={handleCloseEmailPopup}>×</button>
			</div>
			<div class="email-popup-content">
				{#if emailSubmitted}
					<div class="success-message">
						Thank you! We'll notify you when the new token release is available.
					</div>
				{:else}
					<p>Enter your email address to be notified when the next token release becomes available.</p>
					<form class="email-form" on:submit|preventDefault={handleEmailSubmit}>
						<input
							type="email"
							class="email-input"
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

<style>
	.asset-details {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.loading-state,
	.error-state {
		text-align: center;
		padding: 4rem 2rem;
		color: var(--color-black);
	}

	/* Breadcrumb */
	.breadcrumb {
		margin-bottom: 2rem;
		font-size: 0.9rem;
		font-weight: var(--font-weight-medium);
	}

	.breadcrumb-link {
		color: var(--color-secondary);
		text-decoration: none;
	}

	.breadcrumb-link:hover {
		color: var(--color-black);
	}

	.breadcrumb-separator {
		margin: 0 0.5rem;
		color: var(--color-light-gray);
	}

	.breadcrumb-current {
		color: var(--color-black);
		font-weight: var(--font-weight-semibold);
	}

	/* Asset Header */
	.asset-header {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		padding: 3rem;
		margin-bottom: 2rem;
	}

	.asset-main-info {
		margin-bottom: 3rem;
	}

	.asset-title-section {
		display: flex;
		align-items: flex-start;
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.asset-icon {
		width: 4rem;
		height: 4rem;
		border-radius: 0.5rem;
		overflow: hidden;
		border: 1px solid var(--color-light-gray);
	}

	.asset-icon img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.title-info {
		flex: 1;
	}

	.title-info h1 {
		font-size: 2.5rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 1rem;
		line-height: 1.1;
	}

	.asset-meta {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.5rem;
	}

	.location {
		color: var(--color-secondary);
		font-weight: var(--font-weight-medium);
		font-size: 0.9rem;
	}

	.risk-badge {
		background: var(--color-black);
		color: var(--color-white);
		padding: 0.25rem 0.75rem;
		font-size: 0.75rem;
		font-weight: var(--font-weight-bold);
	}

	.operator-info {
		color: var(--color-black);
		font-size: 0.85rem;
		font-weight: var(--font-weight-medium);
	}

	.oil-price {
		text-align: right;
	}

	.price {
		font-size: 1.5rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
	}

	.price-change {
		color: var(--color-primary);
		font-weight: var(--font-weight-bold);
		font-size: 0.9rem;
	}

	.asset-metrics {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.metric {
		text-align: center;
		padding-right: 2rem;
		border-right: 1px solid var(--color-light-gray);
	}

	.metric:last-child {
		border-right: none;
		padding-right: 0;
	}

	.metric-value {
		font-size: 1.5rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
	}

	.metric-label {
		font-size: 0.7rem;
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.metric-subtitle {
		font-size: 0.6rem;
		font-weight: var(--font-weight-medium);
		color: var(--color-primary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: 0.25rem;
	}

	.clickable-metric {
		cursor: pointer;
		transition: all 0.2s ease;
		border-radius: 4px;
		padding: 1rem;
		margin: -1rem;
	}

	.clickable-metric:hover {
		background: var(--color-light-gray);
		transform: translateY(-2px);
	}

	.clickable-metric .metric-subtitle {
		color: var(--color-secondary);
		font-weight: var(--font-weight-semibold);
	}



	/* Tabs */
	.tabs-container {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		margin-bottom: 2rem;
	}

	.tabs-nav {
		display: flex;
		border-bottom: 1px solid var(--color-light-gray);
	}

	.tab-btn {
		padding: 1rem 1.5rem;
		background: none;
		border: none;
		font-family: var(--font-family);
		font-weight: var(--font-weight-extrabold);
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-black);
		cursor: pointer;
		transition: all 0.2s ease;
		opacity: 0.6;
	}

	.tab-btn:hover:not(.active) {
		opacity: 1;
		background: var(--color-primary);
		color: var(--color-white);
	}

	.tab-btn.active {
		background: var(--color-secondary);
		color: var(--color-white);
		opacity: 1;
	}

	.tab-content {
		padding: 2rem;
		min-height: 500px;
		display: flex;
		flex-direction: column;
	}

	.overview-content,
	.production-content,
	.payments-content,
	.documents-content {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	/* Tab Content Styles */
	.fundamentals-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 3rem;
		margin-bottom: 3rem;
	}

	.fundamentals-section h4,
	.operational-section h4 {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 1.5rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.detail-rows {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--color-light-gray);
		font-size: 0.9rem;
	}

	.detail-row:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.detail-row span:first-child {
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
	}

	.detail-row span:last-child {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
	}

	.investment-highlights {
		background: var(--color-light-gray);
		border: 1px solid var(--color-light-gray);
		padding: 2rem;
	}

	.investment-highlights h4 {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 1.5rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.highlights-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2rem;
	}

	.highlight {
		text-align: center;
	}

	.highlight-icon {
		width: 3rem;
		height: 3rem;
		background: var(--color-primary);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		margin: 0 auto 1rem;
	}

	.highlight h5 {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.75rem;
		text-transform: uppercase;
		font-size: 0.9rem;
		letter-spacing: 0.05em;
	}

	.highlight p {
		font-size: 0.85rem;
		color: var(--color-black);
		font-weight: var(--font-weight-medium);
		line-height: 1.5;
	}

	/* Production Content */
	.chart-section {
		margin-bottom: 3rem;
	}

	.chart-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.chart-header h4 {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0;
	}

	.export-btn {
		padding: 0.5rem 1rem;
		border: 1px solid var(--color-black);
		background: var(--color-white);
		color: var(--color-black);
		font-family: var(--font-family);
		font-weight: var(--font-weight-bold);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.export-btn:hover {
		background: var(--color-black);
		color: var(--color-white);
	}

	.production-grid {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 3rem;
		margin-bottom: 3rem;
	}

	.payments-grid {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 3rem;
		margin-bottom: 3rem;
	}

	.production-history h4,
	.production-metrics h4 {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 1.5rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.history-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.history-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--color-light-gray);
	}

	.history-item:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.month {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		font-size: 0.9rem;
	}

	.production {
		font-size: 0.8rem;
		color: var(--color-black);
		font-weight: var(--font-weight-medium);
	}

	.revenue {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		font-size: 0.9rem;
	}

	.price {
		font-size: 0.8rem;
		color: var(--color-primary);
		font-weight: var(--font-weight-medium);
	}

	.uptime-metric {
		background: var(--color-light-gray);
		border: 1px solid var(--color-light-gray);
		padding: 1.5rem;
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.uptime-value {
		font-size: 2rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
	}

	.uptime-label {
		font-size: 0.7rem;
		font-weight: var(--font-weight-bold);
		color: var(--color-black);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.metrics-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		margin-bottom: 1.5rem;
	}

	.metric-item {
		text-align: center;
	}

	.metric-item .metric-value {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-primary);
		margin-bottom: 0.25rem;
	}

	.metric-item .metric-label {
		font-size: 0.7rem;
		font-weight: var(--font-weight-bold);
		color: var(--color-black);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.hse-metric {
		background: var(--color-light-gray);
		border: 1px solid var(--color-light-gray);
		padding: 1.5rem;
		text-align: center;
		margin-top: 1.5rem;
	}

	.hse-value {
		font-size: 2rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-primary);
		margin-bottom: 0.5rem;
	}

	.hse-label {
		font-size: 0.7rem;
		font-weight: var(--font-weight-bold);
		color: var(--color-black);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Payments Content */
	.payments-content {
		width: 100%;
	}

	.payments-grid {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 3rem;
		align-items: start;
	}

	.payments-chart {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		padding: 1.5rem;
	}

	.chart-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.chart-header h4 {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.bar-chart {
		width: 100%;
		height: auto;
		max-width: 100%;
		display: block;
	}

	/* Responsive layout for payments */
	@media (max-width: 768px) {
		.payments-grid {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.chart-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.chart-header h4 {
			font-size: 1.1rem;
		}
	}

	.payment-metrics {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.payment-metrics h4 {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 1.5rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.payment-metric-item {
		background: var(--color-light-gray);
		border: 1px solid var(--color-light-gray);
		padding: 1rem;
		text-align: center;
	}

	.payment-metric-item .metric-label {
		font-size: 0.8rem;
		font-weight: var(--font-weight-medium);
		color: var(--color-black);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.5rem;
		display: block;
	}

	.payment-metric-item .metric-value {
		font-size: 1.1rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-primary);
		display: block;
	}

	.chart-container {
		height: 18rem;
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.production-chart {
		width: 100%;
		height: 100%;
		max-width: 800px;
		max-height: 300px;
	}

	.production-chart text {
		font-family: var(--font-family);
	}

	/* Risk Content */
	.risk-metrics-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 2rem;
	}

	.risk-metric {
		border: 1px solid var(--color-light-gray);
		padding: 1.5rem;
	}

	.risk-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.risk-label {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		font-size: 0.9rem;
	}

	.risk-value-container {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.risk-value {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		font-size: 0.9rem;
	}

	.risk-status {
		width: 0.75rem;
		height: 0.75rem;
		border-radius: 50%;
	}

	.risk-status.excellent {
		background: var(--color-primary);
	}

	.risk-status.good {
		background: var(--color-secondary);
	}

	.risk-status.low {
		background: #fbbf24;
	}

	.risk-status.minimal {
		background: var(--color-primary);
	}

	.risk-description {
		font-size: 0.85rem;
		color: var(--color-black);
		font-weight: var(--font-weight-medium);
		line-height: 1.5;
	}

	/* Documents Content */
	.documents-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 3rem;
	}

	.documents-section h4 {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 1.5rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.documents-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.document-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border: 1px solid var(--color-light-gray);
		padding: 1rem;
	}

	.doc-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.doc-icon {
		font-size: 1.25rem;
		opacity: 0.7;
	}

	.doc-name {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		font-size: 0.85rem;
	}

	.doc-meta {
		font-size: 0.75rem;
		color: var(--color-black);
		font-weight: var(--font-weight-medium);
		opacity: 0.7;
	}


	.btn-primary {
		padding: 1rem 2rem;
		background: var(--color-black);
		color: var(--color-white);
		text-decoration: none;
		font-weight: var(--font-weight-semibold);
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		display: inline-block;
		transition: background-color 0.2s ease;
	}

	.btn-primary:hover {
		background: var(--color-secondary);
	}

	/* Payments Content */
	.payments-content {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.payments-chart {
		height: 400px;
		width: 100%;
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.bar-chart {
		width: 100%;
		height: 100%;
		max-width: 800px;
		max-height: 400px;
	}

	.bar-chart text {
		font-family: var(--font-family);
	}

	/* Token Information Section */
	.token-info-section {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		padding: 2rem;
		margin-bottom: 2rem;
	}

	.token-info-section h3 {
		font-size: 1.5rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 2rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.tokens-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 3rem;
	}

	.token-card-container {
		perspective: 1000px;
		height: 650px;
		position: relative;
		z-index: 1;
	}

	.token-card-container:hover {
		z-index: 5;
	}

	.token-card-container.flipped {
		z-index: 10;
	}

	.token-card-container :global(.card) {
		position: relative;
		width: 100%;
		height: 100%;
		cursor: pointer;
	}

	.token-card-container :global(.card-content) {
		position: relative;
		width: 100%;
		height: 100%;
		transition: transform 0.6s;
		transform-style: preserve-3d;
	}

	.token-card-container.flipped :global(.card-content) {
		transform: rotateY(180deg);
	}

	.token-card-front,
	.token-card-back {
		position: absolute;
		width: 100%;
		height: 100%;
		backface-visibility: hidden;
		display: flex;
		flex-direction: column;
		padding: 1.5rem;
		box-sizing: border-box;
		overflow: hidden;
	}

	.token-card-back {
		transform: rotateY(180deg);
	}

	.token-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
		gap: 1rem;
	}

	.token-title {
		flex: 1;
		min-width: 0;
	}

	.token-title h4 {
		font-size: 1.1rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin: 0 0 0.5rem 0;
		word-wrap: break-word;
		overflow-wrap: break-word;
	}

	.token-symbol {
		font-size: 0.9rem;
		color: var(--color-secondary);
		font-weight: var(--font-weight-medium);
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		word-wrap: break-word;
		overflow-wrap: break-word;
	}

	.token-badge {
		padding: 0.5rem 1rem;
		background: var(--color-primary);
		color: var(--color-white);
		font-size: 0.75rem;
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 1.5rem;
		text-align: center;
		width: 100%;
		display: block;
	}

	.token-badge.sold-out {
		background: var(--color-light-gray);
		color: var(--color-black);
	}

	.token-metrics {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
		margin-bottom: 1.5rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--color-light-gray);
	}

	.token-share-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.4rem 0.8rem;
		background: var(--color-secondary);
		color: var(--color-white);
		font-size: 0.75rem;
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-radius: 4px;
		white-space: nowrap;
		flex-shrink: 0;
	}

	/* Back card styles */
	.back-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--color-light-gray);
	}

	.back-header h4 {
		font-size: 1.1rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin: 0;
	}

	.back-btn {
		background: var(--color-light-gray);
		color: var(--color-black);
		border: none;
		padding: 0.5rem 1rem;
		font-size: 0.8rem;
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		border-radius: 4px;
		transition: background 0.2s ease;
	}

	.back-btn:hover {
		background: var(--color-secondary);
		color: var(--color-white);
	}

	.history-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.history-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		background: var(--color-light-gray);
		border-radius: 4px;
	}

	.history-date {
		font-size: 0.9rem;
		font-weight: var(--font-weight-medium);
		color: var(--color-black);
	}

	.history-amount {
		font-size: 0.9rem;
		font-weight: var(--font-weight-bold);
		color: var(--color-secondary);
	}

	.history-summary {
		padding: 1rem;
		background: var(--color-light-gray);
		border-radius: 4px;
		margin-top: auto;
	}

	.summary-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.summary-item:last-child {
		margin-bottom: 0;
	}

	.summary-label {
		font-size: 0.8rem;
		font-weight: var(--font-weight-medium);
		color: var(--color-black);
	}

	.summary-value {
		font-size: 0.9rem;
		font-weight: var(--font-weight-bold);
		color: var(--color-secondary);
	}

	.no-history {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		height: 100%;
		color: var(--color-black);
	}

	.no-history p {
		margin: 0.5rem 0;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		line-height: 1;
	}

	/* Token Actions Styles */
	.token-actions {
		margin-top: auto;
		padding-top: 1.5rem;
		padding-bottom: 2rem;
	}

	.action-buttons {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.share-text {
		font-size: 0.8rem;
		font-weight: var(--font-weight-bold);
		color: var(--color-white);
		line-height: 1;
	}

	.token-metric {
		text-align: center;
	}

	.token-metric .metric-label {
		font-size: 0.75rem;
		color: var(--color-black);
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		display: block;
		margin-bottom: 0.5rem;
	}

	.token-metric .metric-value {
		font-size: 1rem;
		color: var(--color-black);
		font-weight: var(--font-weight-extrabold);
		display: block;
	}

	.token-returns h5 {
		font-size: 1rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin: 0 0 1rem 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.returns-grid {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.return-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.9rem;
	}

	.return-item.total {
		padding-top: 0.75rem;
		border-top: 1px solid var(--color-light-gray);
		font-weight: var(--font-weight-extrabold);
	}

	.return-label {
		color: var(--color-black);
		font-weight: var(--font-weight-medium);
	}

	.return-value {
		color: var(--color-primary);
		font-weight: var(--font-weight-extrabold);
	}

	.token-actions {
		margin-top: auto;
	}

	.action-buttons {
		display: flex;
		flex-direction: row;
		gap: 0.75rem;
	}

	.buy-token-btn {
		width: 100%;
		padding: 0.75rem 1.5rem;
		background: var(--color-black);
		color: var(--color-white);
		border: 2px solid var(--color-black);
		font-family: var(--font-family);
		font-weight: var(--font-weight-semibold);
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		transition: all 0.2s ease;
		border-radius: 0;
	}

	.buy-token-btn:hover:not(:disabled) {
		background: var(--color-primary);
		border-color: var(--color-primary);
	}

	.buy-token-btn:disabled {
		background: var(--color-light-gray);
		color: var(--color-black);
		border-color: var(--color-light-gray);
		cursor: not-allowed;
		opacity: 0.6;
	}


	/* Recent Distribution Styles */
	.recent-distribution {
		margin-top: 1rem;
		padding: 1rem;
		background: var(--color-light-gray);
		border-radius: 4px;
	}

	.recent-distribution h5 {
		font-size: 0.9rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.distribution-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.distribution-amounts {
		display: flex;
		gap: 1rem;
	}

	.total-amount,
	.per-token-amount {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.amount-label {
		font-size: 0.7rem;
		color: var(--color-black);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.amount-value {
		font-size: 0.9rem;
		color: var(--color-primary);
		font-weight: var(--font-weight-extrabold);
	}

	.distribution-date {
		font-size: 0.75rem;
		color: var(--color-black);
		font-weight: var(--font-weight-medium);
		opacity: 0.7;
	}

	/* Coming Soon Card Styles */
	.coming-soon-card {
		text-align: center;
		padding: 2rem 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.coming-soon-icon {
		font-size: 3rem;
		margin-bottom: 0.5rem;
	}

	.coming-soon-card h4 {
		font-size: 1.1rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin: 0;
	}

	.coming-soon-card p {
		font-size: 0.9rem;
		color: var(--color-black);
		margin: 0;
		opacity: 0.8;
	}

	.notify-btn {
		padding: 0.75rem 1.5rem;
		background: var(--color-primary);
		color: var(--color-white);
		border: 1px solid var(--color-primary);
		font-family: var(--font-family);
		font-weight: var(--font-weight-semibold);
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		width: 100%;
		transition: all 0.2s ease;
		border-radius: 0;
	}

	.notify-btn:hover {
		background: var(--color-secondary);
		border-color: var(--color-secondary);
	}

	/* Email Popup Modal Styles */
	.email-popup-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.email-popup {
		background: var(--color-white);
		border: 2px solid var(--color-black);
		padding: 2rem;
		max-width: 400px;
		width: 90%;
		max-height: 90vh;
		overflow-y: auto;
		position: relative;
	}

	.email-popup-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.email-popup-title {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.email-popup-close {
		background: none;
		border: none;
		font-size: 1.5rem;
		color: var(--color-black);
		cursor: pointer;
		padding: 0;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: opacity 0.2s ease;
	}

	.email-popup-close:hover {
		opacity: 0.7;
	}

	.email-popup-content {
		text-align: center;
	}

	.email-popup-content p {
		color: var(--color-black);
		margin-bottom: 1.5rem;
		line-height: 1.5;
	}

	.email-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.email-input {
		padding: 0.75rem;
		border: 1px solid var(--color-light-gray);
		background: var(--color-white);
		font-family: var(--font-family);
		font-size: 0.9rem;
		color: var(--color-black);
		width: 100%;
		box-sizing: border-box;
		border-radius: 0;
	}

	.email-input:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.email-submit-btn {
		padding: 0.75rem 1.5rem;
		background: var(--color-primary);
		color: var(--color-white);
		border: 1px solid var(--color-primary);
		font-family: var(--font-family);
		font-weight: var(--font-weight-semibold);
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		transition: all 0.2s ease;
		border-radius: 0;
	}

	.email-submit-btn:hover:not(:disabled) {
		background: var(--color-secondary);
		border-color: var(--color-secondary);
	}

	.email-submit-btn:disabled {
		background: var(--color-light-gray);
		color: var(--color-black);
		border-color: var(--color-light-gray);
		cursor: not-allowed;
		opacity: 0.6;
	}

	.success-message {
		color: var(--color-primary);
		font-weight: var(--font-weight-semibold);
		text-align: center;
		padding: 1rem;
		background: var(--color-light-gray);
		margin-bottom: 1rem;
	}

	.flip-btn {
		width: 100%;
		padding: 0.5rem 1.5rem;
		background: var(--color-white);
		color: var(--color-black);
		border: 1px solid var(--color-light-gray);
		font-family: var(--font-family);
		font-weight: var(--font-weight-medium);
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		transition: all 0.2s ease;
		border-radius: 0;
	}

	.flip-btn:hover {
		background: var(--color-light-gray);
		border-color: var(--color-black);
	}

	.close-flip-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		color: var(--color-black);
		cursor: pointer;
		padding: 0;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: opacity 0.2s ease;
	}

	.close-flip-btn:hover {
		opacity: 0.7;
	}

	/* Distribution History Styles */
	.distribution-history {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.history-header h5 {
		font-size: 1rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin: 0 0 1rem 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.history-list {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
		max-height: 200px;
		overflow-y: auto;
	}

	.history-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		background: var(--color-light-gray);
		border-radius: 4px;
	}

	.history-date .month {
		font-size: 0.85rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
	}

	.history-amount {
		text-align: right;
	}

	.history-amount .amount {
		font-size: 0.9rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-primary);
		display: block;
	}

	.history-amount .per-token {
		font-size: 0.75rem;
		color: var(--color-black);
		opacity: 0.7;
	}

	.history-summary {
		border-top: 1px solid var(--color-light-gray);
		padding-top: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.summary-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.85rem;
	}

	.summary-label {
		color: var(--color-black);
		font-weight: var(--font-weight-medium);
	}

	.summary-value {
		color: var(--color-primary);
		font-weight: var(--font-weight-extrabold);
	}

	/* Tooltip Styles */
	.tooltip-container {
		position: relative;
	}

	.tooltip-trigger {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: var(--color-light-gray);
		color: var(--color-black);
		font-size: 10px;
		font-weight: bold;
		margin-left: 4px;
		cursor: help;
		opacity: 0.7;
		transition: opacity 0.2s ease;
	}

	.tooltip-trigger:hover {
		opacity: 1;
	}

	.tooltip {
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		background: var(--color-black);
		color: var(--color-white);
		padding: 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		white-space: nowrap;
		z-index: 1000;
		margin-bottom: 5px;
		max-width: 200px;
		white-space: normal;
		text-align: left;
	}

	.tooltip::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 5px solid transparent;
		border-top-color: var(--color-black);
	}

	/* Distribution History Table Styles */
	.history-table {
		margin-bottom: 1.5rem;
	}

	.table-header {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 0.5rem;
		padding: 0.5rem 0;
		border-bottom: 2px solid var(--color-black);
		font-weight: var(--font-weight-extrabold);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.history-list {
		max-height: 200px;
		overflow-y: auto;
	}

	.history-row {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 0.5rem;
		padding: 0.4rem 0;
		border-bottom: 1px solid var(--color-light-gray);
		font-size: 0.8rem;
	}

	.history-row:last-child {
		border-bottom: none;
	}

	.table-cell {
		padding: 0.25rem;
	}

	.month-cell {
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
	}

	.total-cell {
		text-align: center;
		font-weight: var(--font-weight-semibold);
		color: var(--color-primary);
	}

	.per-token-cell {
		text-align: right;
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.asset-details {
			padding: 1rem;
		}

		.asset-header {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.asset-title-section {
			flex-direction: column;
			gap: 1rem;
		}

		.asset-metrics {
			grid-template-columns: 1fr;
		}

		.metric {
			border-right: none;
			border-bottom: 1px solid var(--color-light-gray);
			padding-right: 0;
			padding-bottom: 1rem;
		}

		.metric:last-child {
			border-bottom: none;
			padding-bottom: 0;
		}

		.tabs-nav {
			flex-wrap: wrap;
		}

		.tab-btn {
			flex: 1;
			min-width: 0;
		}

		.fundamentals-grid,
		.production-grid,
		.risk-metrics-grid,
		.documents-grid {
			grid-template-columns: 1fr;
		}

		.highlights-grid {
			grid-template-columns: 1fr;
		}

		.tokens-grid {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.token-card-container {
			height: 600px;
		}
	}
</style>