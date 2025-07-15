<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import dataStoreService from '$lib/services/DataStoreService';
	import type { Asset, Token } from '$lib/types/uiTypes';
	import { Card, CardContent, PrimaryButton, SecondaryButton } from '$lib/components/ui';
	import SectionTitle from '$lib/components/ui/SectionTitle.svelte';
	import MetricDisplay from '$lib/components/ui/MetricDisplay.svelte';
	import TabButton from '$lib/components/ui/TabButton.svelte';
	import { PageLayout, ContentSection } from '$lib/components/layout';

	let loading = true;
	let error: string | null = null;
	let activeTab = 'overview';
	let unclaimedPayout = 0; // Will be calculated from actual token holdings
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
				(report.revenue ?? 0).toString(),
				(report.expenses ?? 0).toString(),
				(report.netIncome ?? 0).toString(),
				(report.payoutPerToken ?? 0).toString()
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
		if (assetTokens.length === 0) return;
		
		const paymentData = dataStoreService.getTokenPayoutHistory(assetTokens[0].contractAddress);
		if (!paymentData?.recentPayouts) return;
		
		const csvContent = [
			['Month', 'Date', 'Total Payout (USD)', 'Payout Per Token (USD)', 'Oil Price (USD/bbl)', 'Gas Price (USD/MMBtu)', 'Production Volume (bbl)'],
			...paymentData.recentPayouts.map(payout => [
				payout.month,
				payout.date,
				payout.totalPayout.toString(),
				payout.payoutPerToken.toString(),
				payout.oilPrice.toString(),
				payout.gasPrice.toString(),
				payout.productionVolume.toString()
			])
		].map(row => row.join(',')).join('\n');
		
		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${assetData?.id || 'asset'}-payments-data.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function getAssetImage(assetData: Asset | null): string {
		// Use the coverImage from the asset data
		return assetData?.coverImage || '/src/lib/data/images/eur-wr-cover.jpg';
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
		<!-- Breadcrumb -->
		<nav class="mb-8 text-sm font-medium">
			<a href="/assets" class="text-secondary no-underline hover:text-black">← Back to Assets</a>
			<span class="mx-2 text-light-gray">/</span>
			<span class="text-black font-semibold">{assetData?.name || 'Asset Details'}</span>
		</nav>

		<!-- Asset Header -->
		<div class="bg-white border border-light-gray md:p-12 p-6 mb-8">
			<div class="mb-12">
				<div class="flex md:items-start items-center md:flex-row flex-col md:gap-8 gap-4 mb-8">
					<div class="w-16 h-16 rounded-lg overflow-hidden border border-light-gray">
						<img 
							src={getAssetImage(assetData)} 
							alt={assetData?.name || 'Asset'}
							loading="lazy"
							class="w-full h-full object-cover"
						/>
					</div>
					<div class="flex-1">
						<div class="flex justify-between items-start gap-4 mb-4">
							<h1 class="text-4xl md:text-5xl font-extrabold text-black uppercase tracking-tight m-0">{assetData?.name}</h1>
							<div class="flex flex-col items-end gap-2 flex-shrink-0">
								<div class="text-xs font-medium text-black uppercase tracking-wider">Share this investment:</div>
								<div class="flex gap-2">
									<button class="flex items-center justify-center w-8 h-8 bg-white border border-light-gray text-black cursor-pointer transition-all duration-200 rounded hover:bg-light-gray hover:border-secondary hover:text-secondary" title="Share asset on Twitter" aria-label="Share asset on Twitter" on:click={() => window.open(`https://twitter.com/intent/tweet?text=Check out this energy investment opportunity: ${assetData?.name} on @Albion&url=${encodeURIComponent(window.location.href)}`, '_blank')}>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
											<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
										</svg>
									</button>
									<button class="flex items-center justify-center w-8 h-8 bg-white border border-light-gray text-black cursor-pointer transition-all duration-200 rounded hover:bg-light-gray hover:border-secondary hover:text-secondary" title="Share asset on LinkedIn" aria-label="Share asset on LinkedIn" on:click={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
											<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
										</svg>
									</button>
									<button class="flex items-center justify-center w-8 h-8 bg-white border border-light-gray text-black cursor-pointer transition-all duration-200 rounded hover:bg-light-gray hover:border-secondary hover:text-secondary" title="Share asset on Telegram" aria-label="Share asset on Telegram" on:click={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=Check out this energy investment opportunity: ${assetData?.name}`, '_blank')}>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
											<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
										</svg>
									</button>
									<button class="flex items-center justify-center w-8 h-8 bg-white border border-light-gray text-black cursor-pointer transition-all duration-200 rounded hover:bg-light-gray hover:border-secondary hover:text-secondary" title="Share asset via email" aria-label="Share asset via email" on:click={() => window.open(`mailto:?subject=Investment Opportunity: ${assetData?.name}&body=I thought you might be interested in this energy investment opportunity:%0D%0A%0D%0A${assetData?.name}%0D%0A${window.location.href}%0D%0A%0D%0ACheck it out on Albion!`, '_blank')}>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
											<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
										</svg>
									</button>
									<button class="flex items-center justify-center w-8 h-8 bg-white border border-light-gray text-black cursor-pointer transition-all duration-200 rounded hover:bg-light-gray hover:border-secondary hover:text-secondary" title="Copy asset link" aria-label="Copy asset link" on:click={() => { navigator.clipboard.writeText(window.location.href); /* You could add a toast notification here */ }}>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
											<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
											<path d="m14 11-7.54.54-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
										</svg>
									</button>
								</div>
							</div>
						</div>
						<div class="flex items-center gap-4 mb-2">
							<span class="text-secondary font-medium text-sm">📍 {assetData?.location.state}, {assetData?.location.country}</span>
						</div>
						<div class="text-black opacity-70 text-sm">
							<span>Operated by {assetData?.operator.name}</span>
							<span>•</span>
							<span>License {assetData?.technical.license}</span>
						</div>
					</div>
				</div>
			</div>

			<div class="grid md:grid-cols-3 grid-cols-1 gap-8 mb-8">
				<div class="text-center md:pr-8 pr-0 md:border-r border-r-0 md:border-b-0 border-b border-light-gray md:last:border-r-0 last:border-b-0 md:last:pr-0 last:pb-0 md:pb-0 pb-4">
					<MetricDisplay
						value={assetData?.production.current || '0'}
						label="Current Production"
						size="large"
					/>
				</div>
				<div class="text-center md:pr-8 pr-0 md:border-r border-r-0 md:border-b-0 border-b border-light-gray md:last:border-r-0 last:border-b-0 md:last:pr-0 last:pb-0 md:pb-0 pb-4">
					<MetricDisplay
						value={assetData?.monthlyReports?.[0]?.netIncome 
							? formatCurrency(assetData.monthlyReports[0].netIncome)
							: '$20,000'}
						label="Last Received Income"
						note={assetData?.monthlyReports?.[0]?.month 
							? formatEndDate(assetData.monthlyReports[0].month + '-01')
							: 'May 2025'}
						size="large"
					/>
				</div>
				<div class="text-center md:pr-8 pr-0 md:border-r border-r-0 md:border-b-0 border-b border-light-gray md:last:border-r-0 last:border-b-0 md:last:pr-0 last:pb-0 md:pb-0 pb-4 cursor-pointer transition-all duration-200 rounded p-4 -m-4 border-2 border-light-gray bg-white shadow-sm hover:bg-light-gray hover:-translate-y-1 hover:border-primary hover:shadow-card-hover focus:outline-none focus:border-primary focus:bg-light-gray focus:shadow-card-hover" on:click={() => document.getElementById('token-section')?.scrollIntoView({ behavior: 'smooth' })} on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById('token-section')?.scrollIntoView({ behavior: 'smooth' }); } }} role="button" tabindex="0">
					<MetricDisplay
						value={assetTokens.length.toString()}
						label="Available Tokens"
						note="👆 Click to view tokens"
						size="large"
					/>
				</div>
			</div>

		</div>

		<!-- Tabs Navigation and Content -->
		<ContentSection background="white" padding="compact" maxWidth={false}>
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
					<div class="flex-1 flex flex-col">
						<div class="grid md:grid-cols-2 grid-cols-1 gap-12 mb-12">
							<div>
								<SectionTitle level="h3" size="subsection" className="mb-6 uppercase tracking-wider">Asset Fundamentals</SectionTitle>
								<div class="flex flex-col gap-4">
									<div class="flex justify-between pb-3 border-b border-light-gray text-base last:border-b-0 last:pb-0">
										<span class="font-semibold text-black">Field Type</span>
										<span class="text-black">{assetData?.technical.fieldType}</span>
									</div>
									<div class="flex justify-between pb-3 border-b border-light-gray text-base last:border-b-0 last:pb-0">
										<span class="font-semibold text-black">Crude Benchmark</span>
										<span class="text-black">{assetData?.technical.crudeBenchmark}</span>
									</div>
									<div class="flex justify-between pb-3 border-b border-light-gray text-base last:border-b-0 last:pb-0">
										<span class="font-semibold text-black">Pricing</span>
										<span class="text-black">{formatPricing(assetData?.technical.pricing?.benchmarkPremium || '')}, {assetData?.technical.pricing?.transportCosts}</span>
									</div>
									<div class="flex justify-between pb-3 border-b border-light-gray text-base last:border-b-0 last:pb-0">
										<span class="font-semibold text-black">First Oil</span>
										<span class="text-black">{assetData?.technical.firstOil}</span>
									</div>
									<div class="flex justify-between pb-3 border-b border-light-gray text-base last:border-b-0 last:pb-0">
										<span class="font-semibold text-black">Estimated End Date</span>
										<span class="text-black">{formatEndDate(assetData?.technical.expectedEndDate || '')}</span>
									</div>
									<div class="flex justify-between pb-3 border-b border-light-gray text-base last:border-b-0 last:pb-0">
										<span class="font-semibold text-black">Coordinates</span>
										<span class="text-black">{assetData?.location.coordinates.lat}°, {assetData?.location.coordinates.lng}°</span>
									</div>
								</div>
							</div>

							<div>
								<SectionTitle level="h3" size="subsection" className="mb-6 uppercase tracking-wider">Asset Terms</SectionTitle>
								<div class="flex flex-col gap-4">
									<div class="flex justify-between pb-3 border-b border-light-gray text-base last:border-b-0 last:pb-0">
										<span class="font-semibold text-black">Interest Type</span>
										<span class="text-black">{assetData?.assetTerms?.interestType}</span>
									</div>
									<div class="flex justify-between pb-3 border-b border-light-gray text-base last:border-b-0 last:pb-0">
										<span class="font-semibold text-black relative">
											Amount
											{#if assetData?.assetTerms?.amountTooltip}
												<span class="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-light-gray text-black text-[10px] font-bold ml-1 cursor-help opacity-70 transition-opacity duration-200 hover:opacity-100"
													on:mouseenter={() => showTooltipWithDelay('amount')}
													on:mouseleave={hideTooltip}
													role="button"
													tabindex="0">ⓘ</span>
												{#if showTooltip === 'amount'}
													<div class="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white p-2 rounded text-xs whitespace-nowrap z-[1000] mb-[5px] max-w-[200px] whitespace-normal text-left">
														{assetData.assetTerms.amountTooltip}
													</div>
												{/if}
											{/if}
										</span>
										<span class="text-black">{assetData?.assetTerms?.amount}</span>
									</div>
									<div class="flex justify-between pb-3 border-b border-light-gray text-base last:border-b-0 last:pb-0">
										<span class="font-semibold text-black">Payment Frequency</span>
										<span class="text-black">{assetData?.assetTerms?.paymentFrequency}</span>
									</div>
									<div class="flex justify-between pb-3 border-b border-light-gray text-base last:border-b-0 last:pb-0">
										<span class="font-semibold text-black">Infrastructure</span>
										<span class="text-black">{assetData?.technical.infrastructure}</span>
									</div>
								</div>
							</div>
						</div>

					</div>
				{:else if activeTab === 'production'}
					{@const productionReports = assetData?.productionHistory || assetData?.monthlyReports || []}
					{@const maxProduction = productionReports.length > 0 ? Math.max(...productionReports.map((r: any) => r.production)) : 100}
					{@const defaults = dataStoreService.getDefaultValues()}
					<div class="flex-1 flex flex-col">
						<div class="grid md:grid-cols-4 grid-cols-1 gap-6">
							<div class="bg-white border border-light-gray p-6 md:col-span-3">
								<div class="flex justify-between items-center mb-6">
									<h4 class="text-lg font-extrabold text-black mb-0">Production History</h4>
									<SecondaryButton on:click={exportProductionData}>
										📊 Export Data
									</SecondaryButton>
								</div>
								<div class="w-full overflow-x-auto">
									<svg class="w-full h-auto min-w-[750px]" viewBox="0 0 950 400" xmlns="http://www.w3.org/2000/svg">
										<!-- Chart background -->
										<rect width="950" height="400" fill="#ffffff" stroke="#f8f4f4" stroke-width="1"/>
										
										<!-- Grid lines -->
										{#each Array(7) as _, i}
											<line x1="90" y1={70 + i * 50} x2="870" y2={70 + i * 50} stroke="#f8f4f4" stroke-width="0.5" opacity="0.5"/>
										{/each}
										{#each productionReports as _, i}
											<line x1={90 + (i + 1) * (780 / Math.max(productionReports.length, 1))} y1="70" x2={90 + (i + 1) * (780 / Math.max(productionReports.length, 1))} y2="320" stroke="#f8f4f4" stroke-width="0.5" opacity="0.3"/>
										{/each}
										
										<!-- Y-axis labels (Production in BOE) -->
										<text x="80" y="75" text-anchor="end" font-size="13" fill="#000000" font-family="Figtree" font-weight="semibold">{Math.round(maxProduction)}</text>
										<text x="80" y="125" text-anchor="end" font-size="13" fill="#000000" font-family="Figtree" font-weight="semibold">{Math.round(maxProduction * 0.8)}</text>
										<text x="80" y="175" text-anchor="end" font-size="13" fill="#000000" font-family="Figtree" font-weight="semibold">{Math.round(maxProduction * 0.6)}</text>
										<text x="80" y="225" text-anchor="end" font-size="13" fill="#000000" font-family="Figtree" font-weight="semibold">{Math.round(maxProduction * 0.4)}</text>
										<text x="80" y="275" text-anchor="end" font-size="13" fill="#000000" font-family="Figtree" font-weight="semibold">{Math.round(maxProduction * 0.2)}</text>
										<text x="80" y="325" text-anchor="end" font-size="13" fill="#000000" font-family="Figtree" font-weight="semibold">0</text>
										
										<!-- X-axis labels (Months and years from real data) -->
										{#each productionReports as report, i}
											{@const date = new Date(report.month + '-01')}
											{@const monthLabel = date.toLocaleDateString('en-US', { month: 'short' })}
											{@const year = date.getFullYear()}
											{@const showYear = i === 0 || date.getMonth() === 0 || (i > 0 && new Date(productionReports[i-1].month + '-01').getFullYear() !== year)}
											<text x={90 + (i + 1) * (780 / Math.max(productionReports.length, 1))} y="345" text-anchor="middle" font-size="14" fill="#000000" font-family="Figtree" font-weight="medium">{monthLabel}</text>
											{#if showYear}
												<text x={90 + (i + 1) * (780 / Math.max(productionReports.length, 1))} y="365" text-anchor="middle" font-size="12" fill="#666666" font-weight="bold" font-family="Figtree">{year}</text>
											{/if}
										{/each}
										
										<!-- Production line chart (from real data) -->
										{#if productionReports.length > 1}
											{@const points = productionReports.map((report: any, i: number) => {
												const x = 90 + (i + 1) * (780 / Math.max(productionReports.length, 1));
												const y = 320 - (report.production / maxProduction) * 250;
												return `${x},${y}`;
											}).join(' ')}
											<polyline 
												points={points}
												fill="none" 
												stroke="#08bccc" 
												stroke-width="3"
											/>
										{/if}
										
										<!-- Data points (from real data) -->
										{#each productionReports as report, i}
											{@const x = 90 + (i + 1) * (780 / Math.max(productionReports.length, 1))}
											{@const y = 320 - (report.production / maxProduction) * 250}
											<circle 
												cx={x} 
												cy={y} 
												r="4" 
												fill="#283c84"
												stroke="#ffffff"
												stroke-width="2"
											/>
											<!-- Value label near point -->
											<text x={x} y={y - 10} text-anchor="middle" font-size="12" fill="#000000" font-weight="semibold" font-family="Figtree">
												{Math.round(report.production)}
											</text>
										{/each}
										
										<!-- Chart title -->
										<text x="475" y="35" text-anchor="middle" font-size="18" font-weight="bold" fill="#000000" font-family="Figtree">Production History</text>
										
										<!-- Legend -->
										<rect x="680" y="80" width="160" height="45" fill="#ffffff" stroke="#f8f4f4" stroke-width="1"/>
										<line x1="690" y1="95" x2="715" y2="95" stroke="#08bccc" stroke-width="3"/>
										<text x="720" y="100" font-size="13" fill="#000000" font-family="Figtree" font-weight="medium">Production Rate</text>
										<circle cx="702" cy="110" r="3" fill="#283c84"/>
										<text x="720" y="115" font-size="13" fill="#000000" font-family="Figtree" font-weight="medium">Monthly Data</text>
									</svg>
								</div>
							</div>

							<div class="bg-white border border-light-gray p-6">
								<h4 class="text-lg font-extrabold text-black mb-6">Production Metrics</h4>
								<div class="text-center mb-6 p-4 bg-white">
									<div class="text-4xl font-extrabold text-black mb-2">{assetData?.operationalMetrics?.uptime?.percentage?.toFixed(1) || defaults.operationalMetrics.uptime.percentage.toFixed(1)}%</div>
									<div class="text-base font-medium text-black opacity-70">Uptime {assetData?.operationalMetrics?.uptime?.period?.replace('_', ' ') || defaults.operationalMetrics.uptime.period}</div>
								</div>
								<div class="grid grid-cols-1 gap-4 mb-6">
									<div class="text-center p-3 bg-white">
										<div class="text-3xl font-extrabold text-black mb-1">{assetData?.operationalMetrics?.dailyProduction?.current?.toFixed(1) || defaults.operationalMetrics.dailyProduction.current.toFixed(1)}</div>
										<div class="text-sm font-medium text-black opacity-70">Current Daily Production ({assetData?.operationalMetrics?.dailyProduction?.unit || defaults.operationalMetrics.dailyProduction.unit})</div>
									</div>
								</div>
								<div class="text-center p-4 bg-white">
									<div class="text-4xl font-extrabold text-black mb-2">{assetData?.operationalMetrics?.hseMetrics?.incidentFreeDays || defaults.operationalMetrics.hseMetrics.incidentFreeDays}</div>
									<div class="text-base font-medium text-black opacity-70">Days Since Last HSE Incident</div>
								</div>
							</div>
						</div>
					</div>
				{:else if activeTab === 'payments'}
					{@const monthlyReports = assetData?.monthlyReports || []}
					{@const maxRevenue = monthlyReports.length > 0 ? Math.max(...monthlyReports.map(r => r.revenue ?? 0)) : 1500}
					{@const latestReport = monthlyReports[monthlyReports.length - 1]}
					{@const nextMonth = latestReport ? new Date(new Date(latestReport.month + '-01').getTime() + 32 * 24 * 60 * 60 * 1000) : new Date()}
					{@const avgRevenue = monthlyReports.length > 0 ? monthlyReports.reduce((sum, r) => sum + (r.revenue ?? 0), 0) / monthlyReports.length : dataStoreService.getDefaultValues().revenue.averageMonthly}
					<div class="flex-1 flex flex-col">
						<div class="grid md:grid-cols-4 grid-cols-1 gap-6">
							<div class="bg-white border border-light-gray p-6 md:col-span-3">
								<div class="flex justify-between items-center mb-6">
									<h4 class="text-lg font-extrabold text-black mb-0">Past Payments</h4>
									<SecondaryButton on:click={exportPaymentsData}>
										📊 Export Data
									</SecondaryButton>
								</div>
								<div class="w-full overflow-x-auto">
									<svg class="w-full h-auto min-w-[750px]" viewBox="0 0 950 400" xmlns="http://www.w3.org/2000/svg">
										<!-- Chart background -->
										<rect width="950" height="400" fill="#ffffff" stroke="#f8f4f4" stroke-width="1"/>
										
										<!-- Grid lines -->
										{#each Array(7) as _, i}
											<line x1="90" y1={70 + i * 50} x2="870" y2={70 + i * 50} stroke="#f8f4f4" stroke-width="0.5" opacity="0.5"/>
										{/each}
										{#each monthlyReports as _, i}
											<line x1={90 + (i + 1) * (780 / Math.max(monthlyReports.length, 1))} y1="70" x2={90 + (i + 1) * (780 / Math.max(monthlyReports.length, 1))} y2="320" stroke="#f8f4f4" stroke-width="0.5" opacity="0.3"/>
										{/each}
										
										<!-- Y-axis labels (Revenue amounts) -->
										<text x="80" y="75" text-anchor="end" font-size="13" fill="#000000" font-family="Figtree" font-weight="semibold">${Math.round(maxRevenue)}</text>
										<text x="80" y="125" text-anchor="end" font-size="13" fill="#000000" font-family="Figtree" font-weight="semibold">${Math.round(maxRevenue * 0.8)}</text>
										<text x="80" y="175" text-anchor="end" font-size="13" fill="#000000" font-family="Figtree" font-weight="semibold">${Math.round(maxRevenue * 0.6)}</text>
										<text x="80" y="225" text-anchor="end" font-size="13" fill="#000000" font-family="Figtree" font-weight="semibold">${Math.round(maxRevenue * 0.4)}</text>
										<text x="80" y="275" text-anchor="end" font-size="13" fill="#000000" font-family="Figtree" font-weight="semibold">${Math.round(maxRevenue * 0.2)}</text>
										<text x="80" y="325" text-anchor="end" font-size="13" fill="#000000" font-family="Figtree" font-weight="semibold">$0</text>
										
										<!-- X-axis labels (Months and years from monthly reports) -->
										{#each monthlyReports as report, i}
											{@const date = new Date(report.month + '-01')}
											{@const monthLabel = date.toLocaleDateString('en-US', { month: 'short' })}
											{@const year = date.getFullYear()}
											{@const showYear = i === 0 || date.getMonth() === 0 || (i > 0 && new Date(monthlyReports[i-1].month + '-01').getFullYear() !== year)}
											<text x={90 + (i + 1) * (780 / Math.max(monthlyReports.length, 1))} y="345" text-anchor="middle" font-size="14" fill="#000000" font-family="Figtree" font-weight="medium">{monthLabel}</text>
											{#if showYear}
												<text x={90 + (i + 1) * (780 / Math.max(monthlyReports.length, 1))} y="365" text-anchor="middle" font-size="12" fill="#666666" font-weight="bold" font-family="Figtree">{year}</text>
											{/if}
										{/each}
										
										<!-- Column chart bars (from monthly reports) -->
										{#each monthlyReports as report, i}
											{@const barWidth = 35}
											{@const x = 90 + (i + 1) * (780 / Math.max(monthlyReports.length, 1)) - barWidth / 2}
											{@const barHeight = ((report.revenue ?? 0) / maxRevenue) * 250}
											{@const y = 320 - barHeight}
											<rect 
												x={x} 
												y={y} 
												width={barWidth} 
												height={barHeight}
												fill="#08bccc"
												stroke="#ffffff"
												stroke-width="1"
												rx="2"
											/>
											<!-- Value label on top of bar -->
											<text x={x + barWidth / 2} y={y - 5} text-anchor="middle" font-size="12" fill="#000000" font-weight="semibold" font-family="Figtree">
												${Math.round(report.revenue ?? 0)}
											</text>
										{/each}
										
										<!-- Chart title -->
										<text x="475" y="35" text-anchor="middle" font-size="18" font-weight="bold" fill="#000000" font-family="Figtree">Past Payments</text>
									</svg>
								</div>
							</div>

							<div class="bg-white border border-light-gray p-6">
								<h4 class="text-lg font-extrabold text-black mb-6">Revenue Metrics</h4>
								<div class="space-y-6">
									<div class="text-center p-4 bg-white">
										<div class="text-4xl font-extrabold text-black mb-2">{nextMonth.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</div>
										<div class="text-base font-medium text-black opacity-70">Next Report Due</div>
									</div>
									<div class="text-center p-3 bg-white">
										<div class="text-3xl font-extrabold text-black mb-1">${latestReport?.revenue?.toFixed(0) || dataStoreService.getDefaultValues().revenue.latestMonthly.toLocaleString()}</div>
										<div class="text-sm font-medium text-black opacity-70">Latest Monthly Revenue</div>
									</div>
									<div class="text-center p-3 bg-white">
										<div class="text-3xl font-extrabold text-black mb-1">${avgRevenue.toFixed(0)}</div>
										<div class="text-sm font-medium text-black opacity-70">Avg Monthly Revenue</div>
									</div>
								</div>
							</div>
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
												<div class="text-sm text-black opacity-70">PDF • 2.1 MB</div>
											</div>
										</div>
										<SecondaryButton>Download</SecondaryButton>
									</div>
									<div class="flex items-center justify-between p-4 bg-white border border-light-gray hover:bg-white transition-colors duration-200">
										<div class="flex items-center gap-3">
											<div class="text-2xl">🗜️</div>
											<div class="">
												<div class="font-semibold text-black">Monthly Production Reports</div>
												<div class="text-sm text-black opacity-70">ZIP • 8.9 MB</div>
											</div>
										</div>
										<SecondaryButton>Download</SecondaryButton>
									</div>
								</div>
							</div>
						</div>
					</div>
				{:else if activeTab === 'gallery'}
					{@const galleryImages = assetData?.images || []}
					<div class="flex-1 flex flex-col">
						<div class="grid grid-cols-1 gap-8">
							<div class="bg-white border border-light-gray p-8">
								<h4>Asset Gallery</h4>
								{#if galleryImages.length > 0}
									<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
										{#each galleryImages as image}
											<div class="border border-light-gray rounded overflow-hidden">
												<div class="aspect-video overflow-hidden">
													<img src={image.url} alt={image.title} class="w-full h-full object-cover" />
												</div>
												<div class="p-4 bg-white">
													<h5 class="font-bold text-black mb-1">{image.title}</h5>
													{#if image.caption}
														<p class="text-sm text-gray-600">{image.caption}</p>
													{/if}
												</div>
											</div>
										{/each}
									</div>
								{:else}
									<div class="text-center py-16 px-8">
										<div class="text-6xl mb-4 opacity-50">📸</div>
										<div class="text-black opacity-70">
											<h5>No additional images available</h5>
											<p>Additional photos and visual documentation will be displayed here when available.</p>
										</div>
									</div>
								{/if}
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
		</ContentSection>

		<!-- Token Information Section -->
		<ContentSection background="white" padding="standard" maxWidth={false}>
			<div class="bg-white border border-light-gray md:p-12 p-6" id="token-section">
			<h3 class="text-3xl md:text-2xl font-extrabold text-black uppercase tracking-wider mb-8">Token Information</h3>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
				{#each assetTokens as token}
					{@const supply = dataStoreService.getTokenSupply(token.contractAddress)}
					{@const hasAvailableSupply = supply && supply.availableSupply > 0}
					{@const tokenPayoutData = dataStoreService.getTokenPayoutHistory(token.contractAddress)}
					{@const latestPayout = tokenPayoutData?.recentPayouts?.[0]}
					{@const calculatedReturns = dataStoreService.getCalculatedTokenReturns(token.contractAddress)}
					{@const isFlipped = flippedCards.has(token.contractAddress)}
					<div id="token-{token.contractAddress}">
						<Card hoverable clickable paddingClass="p-0" on:click={() => handleCardClick(token.contractAddress)}>
							<CardContent paddingClass="p-0">
								<div class="relative preserve-3d transform-gpu transition-transform duration-500 {isFlipped ? 'rotate-y-180' : ''}" style="min-height: 600px;">
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
							
									<div class="p-8 pt-6 space-y-4">
										<div class="flex justify-between items-start">
											<span class="text-base font-medium text-black opacity-70 relative font-figtree">Minted Supply</span>
											<span class="text-base font-extrabold text-black text-right font-figtree">{supply?.mintedSupply.toLocaleString() || '0'}</span>
										</div>
										<div class="flex justify-between items-start">
											<span class="text-base font-medium text-black opacity-70 relative font-figtree">Max Supply</span>
											<span class="text-base font-extrabold text-black text-right font-figtree">{supply?.maxSupply.toLocaleString() || '0'}</span>
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
											<span class="text-sm font-extrabold text-black text-right">{calculatedReturns?.impliedBarrelsPerToken?.toFixed(6) || '0.000000'}</span>
											{#if showTooltip === 'barrels'}
												<div class="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white p-2 rounded text-xs whitespace-nowrap z-[1000] mb-[5px] max-w-[200px] whitespace-normal text-left">
													Estimated barrels of oil equivalent per token based on reserves and token supply
												</div>
											{/if}
										</div>
										<div class="flex justify-between items-start relative">
											<span class="text-sm font-medium text-black opacity-70 relative">
												Breakeven Oil Price
												<span class="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-light-gray text-black text-[10px] font-bold ml-1 cursor-help opacity-70 transition-opacity duration-200 hover:opacity-100"
													on:mouseenter={() => showTooltipWithDelay('breakeven')}
													on:mouseleave={hideTooltip}
													role="button"
													tabindex="0">ⓘ</span>
											</span>
											<span class="text-sm font-extrabold text-black text-right">${calculatedReturns?.breakEvenOilPrice?.toFixed(2) || '0.00'}</span>
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
										{@const nextRelease = dataStoreService.getFutureReleaseByAsset(assetData?.id || '')}
										<div class="text-center py-8 text-black opacity-70">
											<p class="text-sm">No distributions available yet.</p>
											<p class="text-sm">First payout expected in {nextRelease?.whenRelease || 'Q1 2025'}.</p>
										</div>
									{/if}
									</div>
								</div>
								</div>
							</CardContent>
						</Card>
					</div>
				{/each}
				<!-- Future Releases Cards -->
				{#if assetData?.id}
					{@const futureReleases = dataStoreService.getFutureReleasesByAsset(assetData.id)}
					{#each futureReleases as release, index}
				<Card hoverable>
					<CardContent>
						<div class="text-center p-12">
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
						<CardContent>
							<div class="text-center p-12">
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
		</ContentSection>
	{/if}
</PageLayout>

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

