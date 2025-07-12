<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import dataStoreService from '$lib/services/DataStoreService';
	import type { Asset, Token } from '$lib/types/dataStore';
	import { Card, CardContent, PrimaryButton, SecondaryButton } from '$lib/components/ui';
	import { getAssetCoverImage, getAssetGalleryImages } from '$lib/utils/assetImages';

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
				report.revenue.toString(),
				report.expenses.toString(),
				report.netIncome.toString(),
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
		if (!assetData?.id) return getAssetCoverImage('europa-wressle-release-1');
		return getAssetCoverImage(assetData.id);
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
	
	// Tailwind class mappings
	$: assetDetailsClasses = 'p-8 max-w-6xl mx-auto';
	$: loadingStateClasses = 'text-center py-16 px-8 text-black';
	$: errorStateClasses = 'text-center py-16 px-8 text-black';
	$: breadcrumbClasses = 'mb-8 text-sm font-medium';
	$: breadcrumbLinkClasses = 'text-secondary no-underline hover:text-black';
	$: breadcrumbSeparatorClasses = 'mx-2 text-light-gray';
	$: breadcrumbCurrentClasses = 'text-black font-semibold';
	$: assetImageFullClasses = 'w-full h-full object-cover';
	$: assetHeaderClasses = 'bg-white border border-light-gray p-12 mb-8';
	$: assetMainInfoClasses = 'mb-12';
	$: assetTitleSectionClasses = 'flex items-start gap-8 mb-8';
	$: assetIconClasses = 'w-16 h-16 rounded-lg overflow-hidden border border-light-gray';
	$: titleInfoClasses = 'flex-1';
	$: titleRowClasses = 'flex justify-between items-start gap-4 mb-4';
	$: socialSharingClasses = 'flex flex-col items-end gap-2 flex-shrink-0';
	$: sharingLabelClasses = 'text-xs font-medium text-black uppercase tracking-wider';
	$: shareButtonsClasses = 'flex gap-2';
	$: shareBtnClasses = 'flex items-center justify-center w-8 h-8 bg-white border border-light-gray text-black cursor-pointer transition-all duration-200 rounded hover:bg-light-gray hover:border-secondary hover:text-secondary';
	$: titleH1Classes = 'text-4xl font-extrabold text-black m-0 leading-tight';
	$: assetMetaClasses = 'flex items-center gap-4 mb-2';
	$: locationClasses = 'text-secondary font-medium text-sm';
	$: operatorInfoClasses = 'text-black opacity-70 text-sm';
	$: assetMetricsClasses = 'grid grid-cols-3 gap-8 mb-8';
	$: metricClasses = 'text-center pr-8 border-r border-light-gray last:border-r-0 last:pr-0';
	$: metricValueClasses = 'text-2xl font-extrabold text-black mb-2';
	$: metricLabelClasses = 'text-xs font-semibold text-black uppercase tracking-wider';
	$: metricSubtitleClasses = 'text-xs font-medium text-primary uppercase tracking-wider mt-1';
	$: clickableMetricClasses = 'cursor-pointer transition-all duration-200 rounded p-4 -m-4 border-2 border-light-gray bg-white shadow-sm hover:bg-light-gray hover:-translate-y-1 hover:border-primary hover:shadow-card-hover focus:outline-none focus:border-primary focus:bg-light-gray focus:shadow-card-hover';
	$: clickableMetricSubtitleClasses = 'text-secondary font-semibold';
	$: tabsContainerClasses = 'bg-white border border-light-gray mb-8';
	$: tabsNavClasses = 'flex border-b border-light-gray';
	$: tabBtnClasses = 'px-6 py-4 bg-transparent border-none font-figtree font-extrabold text-xs uppercase tracking-wider text-black cursor-pointer transition-all duration-200 opacity-60 hover:opacity-100 hover:bg-primary hover:text-white';
	$: tabBtnActiveClasses = 'bg-secondary text-white opacity-100';
	$: tabContentClasses = 'p-8 min-h-[500px] flex flex-col';
	$: overviewContentClasses = 'flex-1 flex flex-col';
	$: fundamentalsGridClasses = 'grid grid-cols-2 gap-12 mb-12';
	$: fundamentalsSectionH4Classes = 'text-xl font-extrabold text-black mb-6 uppercase tracking-wider';
	$: detailRowsClasses = 'flex flex-col gap-4';
	$: detailRowClasses = 'flex justify-between pb-3 border-b border-light-gray text-sm last:border-b-0 last:pb-0';
	$: detailRowLabelClasses = 'font-semibold text-black';
	$: detailRowValueClasses = 'font-extrabold text-black';
	$: productionContentClasses = 'flex-1 flex flex-col';
	$: productionGridClasses = 'grid grid-cols-[2fr_1fr] gap-12 mb-12';
	$: chartSectionClasses = 'flex flex-col';
	$: chartHeaderClasses = 'flex justify-between items-center mb-6';
	$: chartHeaderH4Classes = 'text-xl font-extrabold text-black m-0 uppercase tracking-wider';
	$: chartContainerClasses = 'h-72 bg-white border border-light-gray flex items-center justify-center p-2';
	$: productionChartClasses = 'w-full h-full max-w-[800px] max-h-[300px]';
	$: productionMetricsClasses = 'flex flex-col items-center justify-center p-8 bg-white border border-light-gray h-full box-border';
	$: productionMetricsH4Classes = 'text-2xl font-extrabold text-black mb-8 uppercase tracking-wider text-center w-full';
	$: uptimeMetricClasses = 'bg-light-gray border border-light-gray p-8 text-center mb-8 w-full rounded';
	$: uptimeValueClasses = 'text-4xl font-extrabold text-black mb-3 leading-none';
	$: uptimeLabelClasses = 'text-xs font-bold text-black uppercase tracking-wider leading-tight';
	$: metricsGridClasses = 'grid grid-cols-1 gap-6 mb-8 w-full';
	$: metricItemClasses = 'text-center p-6 bg-white border border-light-gray rounded';
	$: metricItemValueClasses = 'text-3xl font-extrabold text-primary mb-2 leading-none';
	$: metricItemLabelClasses = 'text-xs font-bold text-black uppercase tracking-wider leading-tight';
	$: hseMetricClasses = 'bg-light-gray border border-light-gray p-8 text-center w-full rounded';
	$: hseValueClasses = 'text-4xl font-extrabold text-primary mb-3 leading-none';
	$: hseLabelClasses = 'text-xs font-bold text-black uppercase tracking-wider leading-tight';
	$: documentsContentClasses = 'flex-1 flex flex-col';
	$: documentsGridClasses = 'grid grid-cols-2 gap-12';
	$: documentsSectionH4Classes = 'text-xl font-extrabold text-black mb-6 uppercase tracking-wider';
	$: documentsListClasses = 'flex flex-col gap-4';
	$: documentItemClasses = 'flex justify-between items-center border border-light-gray p-4';
	$: docInfoClasses = 'flex items-center gap-3';
	$: docIconClasses = 'text-xl opacity-70';
	$: docNameClasses = 'font-extrabold text-black text-sm';
	$: docMetaClasses = 'text-xs text-black font-medium opacity-70';
	$: btnPrimaryClasses = 'px-8 py-4 bg-black text-white no-underline font-semibold text-sm uppercase tracking-wider inline-block transition-colors duration-200 hover:bg-secondary';
	$: tokenInfoSectionClasses = 'bg-white border border-light-gray p-8 mb-8';
	$: tokenInfoH3Classes = 'text-2xl font-extrabold text-black mb-8 uppercase tracking-wider';
	$: tokensGridClasses = 'grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-8';
	$: tokenCardContainerClasses = 'perspective-1000 h-[650px] relative z-[1] hover:z-[5]';
	$: tokenCardContainerFlippedClasses = 'z-[10]';
	$: tokenCardFrontClasses = 'absolute w-full h-full backface-hidden flex flex-col p-6 box-border overflow-hidden';
	$: tokenCardBackClasses = 'absolute w-full h-full backface-hidden flex flex-col p-6 box-border overflow-hidden transform rotate-y-180';
	$: tokenHeaderClasses = 'flex justify-between items-start mb-4 gap-4';
	$: tokenTitleClasses = 'flex-1 min-w-0';
	$: tokenTitleH4Classes = 'text-lg font-extrabold text-black m-0 mb-2 break-words';
	$: tokenSymbolClasses = 'text-xs text-secondary font-medium m-0 uppercase tracking-wider break-words leading-tight';
	$: tokenBadgeClasses = 'px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider mb-6 text-center w-full block';
	$: tokenBadgeSoldOutClasses = 'bg-light-gray text-black';
	$: tokenMetricsClasses = 'grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-light-gray';
	$: tokenShareBadgeClasses = 'inline-flex items-center justify-center px-3 py-2 bg-secondary text-white text-xs font-bold uppercase tracking-wider rounded whitespace-nowrap flex-shrink-0';
	$: backHeaderClasses = 'flex justify-between items-center mb-6 pb-4 border-b border-light-gray';
	$: backHeaderH4Classes = 'text-lg font-extrabold text-black m-0';
	$: noHistoryClasses = 'flex flex-col items-center justify-center text-center h-full text-black';
	$: noHistoryPClasses = 'my-2 text-sm uppercase tracking-wider leading-none';
	$: distributionsContentClasses = 'flex flex-col h-full flex-1';
	$: distributionsHeaderClasses = 'grid grid-cols-3 gap-2 mb-4 pb-3 border-b border-light-gray';
	$: headerCellClasses = 'text-xs font-bold text-black uppercase tracking-wider text-center';
	$: distributionsListClasses = 'flex flex-col flex-1 gap-2';
	$: distributionRowClasses = 'grid grid-cols-3 gap-2 py-3 border-b border-black/5 last:border-b-0';
	$: distCellClasses = 'text-sm text-black text-center';
	$: distMonthClasses = 'font-medium';
	$: distValueClasses = 'font-bold text-secondary';
	$: distributionsDividerClasses = 'h-px bg-black my-4';
	$: distributionsSummaryClasses = 'mt-auto';
	$: summaryRowClasses = 'grid grid-cols-3 gap-2 py-3';
	$: summaryCellClasses = 'text-sm font-bold text-black text-center';
	$: summaryValueClasses = 'text-secondary';
	$: tokenActionsClasses = 'mt-auto pt-6 pb-8';
	$: actionButtonsClasses = 'flex flex-col gap-4';
	$: tokenActionWrapperClasses = 'w-full';
	$: tokenMetricClasses = 'text-center';
	$: tokenMetricLabelClasses = 'text-xs text-black font-medium uppercase tracking-wider block mb-2';
	$: tokenMetricValueClasses = 'text-base text-black font-extrabold block';
	$: tokenReturnsH5Classes = 'text-base font-extrabold text-black m-0 mb-4 uppercase tracking-wider';
	$: returnsGridClasses = 'flex flex-col gap-3 mb-6';
	$: returnItemClasses = 'flex justify-between items-center text-sm';
	$: returnItemTotalClasses = 'pt-3 border-t border-light-gray font-extrabold';
	$: returnLabelClasses = 'text-black font-medium';
	$: returnValueClasses = 'text-primary font-extrabold';
	$: actionButtonsRowClasses = 'flex flex-row gap-3';
	$: comingSoonCardClasses = 'text-center py-8 px-4 flex flex-col items-center gap-4';
	$: comingSoonIconClasses = 'text-5xl mb-2';
	$: comingSoonH4Classes = 'text-lg font-extrabold text-black m-0';
	$: comingSoonPClasses = 'text-sm text-black m-0 opacity-80';
	$: emailPopupOverlayClasses = 'fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-[1000]';
	$: emailPopupClasses = 'bg-white border-2 border-black p-8 max-w-md w-[90%] max-h-[90vh] overflow-y-auto relative';
	$: emailPopupHeaderClasses = 'flex justify-between items-center mb-6';
	$: emailPopupTitleClasses = 'text-xl font-extrabold text-black m-0 uppercase tracking-wider';
	$: emailPopupCloseClasses = 'bg-transparent border-none text-2xl text-black cursor-pointer p-0 w-8 h-8 flex items-center justify-center transition-opacity duration-200 hover:opacity-70';
	$: emailPopupContentClasses = 'text-center';
	$: emailPopupPClasses = 'text-black mb-6 leading-relaxed';
	$: emailFormClasses = 'flex flex-col gap-4';
	$: emailInputClasses = 'px-3 py-3 border border-light-gray bg-white font-figtree text-sm text-black w-full box-border rounded-none focus:outline-none focus:border-primary';
	$: successMessageClasses = 'text-primary font-semibold text-center p-4 bg-light-gray mb-4';
	$: tooltipContainerClasses = 'relative';
	$: tooltipTriggerClasses = 'inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-light-gray text-black text-[10px] font-bold ml-1 cursor-help opacity-70 transition-opacity duration-200 hover:opacity-100';
	$: tooltipClasses = 'absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white p-2 rounded text-xs whitespace-nowrap z-[1000] mb-[5px] max-w-[200px] whitespace-normal text-left';
	$: galleryContentClasses = 'flex-1 flex flex-col';
	$: galleryGridClasses = 'grid grid-cols-1 gap-8';
	$: gallerySectionH4Classes = 'text-xl font-extrabold text-black mb-6 uppercase tracking-wider';
	$: galleryEmptyClasses = 'flex flex-col items-center justify-center text-center py-16 px-8 border-2 border-dashed border-light-gray rounded-lg text-black opacity-70';
	$: emptyIconClasses = 'text-5xl mb-4';
	$: emptyTextH5Classes = 'text-lg font-bold m-0 mb-2 text-black';
	$: emptyTextPClasses = 'text-sm m-0 text-black opacity-80 leading-relaxed';
	$: galleryImagesClasses = 'grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6';
	$: galleryImageClasses = 'relative overflow-hidden rounded-lg bg-light-gray aspect-[4/3]';
	$: galleryImageImgClasses = 'w-full h-full object-cover transition-transform duration-300 hover:scale-105';
	
	// Mobile responsive classes
	$: mobileAssetDetailsClasses = 'md:p-8 p-4 max-w-6xl mx-auto';
	$: mobileAssetHeaderClasses = 'bg-white border border-light-gray md:p-12 p-6 mb-8';
	$: mobileAssetTitleSectionClasses = 'flex md:items-start items-center md:flex-row flex-col md:gap-8 gap-4 mb-8';
	$: mobileAssetMetricsClasses = 'grid md:grid-cols-3 grid-cols-1 gap-8 mb-8';
	$: mobileMetricClasses = 'text-center md:pr-8 pr-0 md:border-r border-r-0 md:border-b-0 border-b border-light-gray md:last:border-r-0 last:border-b-0 md:last:pr-0 last:pb-0 md:pb-0 pb-4';
	$: mobileTabsNavClasses = 'flex flex-wrap border-b border-light-gray';
	$: mobileTabBtnClasses = 'flex-1 min-w-0';
	$: mobileFundamentalsGridClasses = 'grid md:grid-cols-2 grid-cols-1 gap-12 mb-12';
	$: mobileProductionGridClasses = 'grid md:grid-cols-[2fr_1fr] grid-cols-1 gap-12 mb-12';
	$: mobileDocumentsGridClasses = 'grid md:grid-cols-2 grid-cols-1 gap-12';
	$: mobileTokensGridClasses = 'grid grid-cols-1 gap-8';
	$: mobileTokenCardContainerClasses = 'h-[600px]';
	$: mobileChartHeaderClasses = 'flex md:flex-row flex-col md:items-center items-start gap-4';
	$: mobileChartHeaderH4Classes = 'md:text-xl text-lg';
	
	// Additional Tailwind class mappings for remaining hardcoded CSS
	$: paymentsContentClasses = 'flex-1 flex flex-col';
	$: productionGridClasses = 'grid grid-cols-[2fr_1fr] gap-12 mb-12';
	$: chartSectionClasses = 'bg-white border border-light-gray p-8';
	$: chartSectionLargeClasses = 'col-span-1';
	$: chartHeaderClasses = 'flex justify-between items-center mb-6';
	$: chartHeaderH4Classes = 'text-xl font-extrabold text-black m-0 uppercase tracking-wider';
	$: chartContainerClasses = 'w-full h-80 overflow-hidden';
	$: productionChartClasses = 'w-full h-full';
	$: productionMetricsClasses = 'bg-white border border-light-gray p-8';
	$: productionMetricsH4Classes = 'text-xl font-extrabold text-black mb-6 uppercase tracking-wider';
	$: uptimeMetricClasses = 'text-center mb-8 p-6 bg-light-gray border border-light-gray';
	$: uptimeValueClasses = 'text-2xl font-extrabold text-primary mb-2';
	$: uptimeLabelClasses = 'text-xs font-bold text-black uppercase tracking-wider';
	$: metricsGridClasses = 'grid grid-cols-1 gap-6';
	$: metricItemClasses = 'text-center p-4 bg-light-gray border border-light-gray';
	$: metricValueClasses = 'text-lg font-extrabold text-black mb-2';
	$: metricLabelClasses = 'text-xs font-bold text-black uppercase tracking-wider';
	
	// Document classes
	$: documentItemClasses = 'flex justify-between items-center p-6 bg-white border border-light-gray hover:bg-light-gray transition-colors duration-200';
	$: docInfoClasses = 'flex items-center gap-4';
	$: docIconClasses = 'text-2xl';
	$: docDetailsClasses = 'flex-1';
	$: docNameClasses = 'font-extrabold text-black text-sm mb-1';
	$: docMetaClasses = 'text-xs text-black opacity-70';
	
	// Gallery classes
	$: galleryContentClasses = 'flex-1 flex flex-col';
	$: galleryGridClasses = 'grid grid-cols-1 gap-8';
	$: gallerySectionClasses = 'bg-white border border-light-gray p-8';
	$: galleryImagesClasses = 'grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6';
	$: galleryImageClasses = 'relative overflow-hidden rounded-lg bg-light-gray aspect-[4/3]';
	$: galleryEmptyClasses = 'flex flex-col items-center justify-center text-center py-16 px-8 border-2 border-dashed border-light-gray rounded-lg text-black opacity-70';
	$: emptyIconClasses = 'text-5xl mb-4';
	$: emptyTextClasses = 'text-center';
	$: emptyTextH5Classes = 'text-lg font-bold m-0 mb-2 text-black';
	$: emptyTextPClasses = 'text-sm m-0 text-black opacity-80 leading-relaxed';
	
	// Token card classes
	$: tokenHeaderClasses = 'flex justify-between items-start mb-6';
	$: tokenTitleClasses = 'flex-1';
	$: tokenTitleH4Classes = 'text-lg font-extrabold text-black m-0 mb-2 break-words';
	$: tokenSymbolClasses = 'text-xs text-secondary font-medium m-0 uppercase tracking-wider break-words leading-tight';
	$: tokenShareBadgeClasses = 'inline-flex items-center justify-center px-3 py-2 bg-secondary text-white text-xs font-bold uppercase tracking-wider rounded whitespace-nowrap flex-shrink-0';
	$: tokenBadgeClasses = 'px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider mb-6 text-center w-full block';
	$: tokenBadgeSoldOutClasses = 'bg-light-gray text-black';
	$: tokenMetricsClasses = 'grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-light-gray';
	$: tokenMetricClasses = 'text-center relative';
	$: tokenMetricLabelClasses = 'text-xs text-black font-medium uppercase tracking-wider block mb-2';
	$: tokenMetricValueClasses = 'text-base text-black font-extrabold block';
	$: tokenReturnsClasses = 'mb-6';
	$: tokenReturnsH5Classes = 'text-base font-extrabold text-black m-0 mb-4 uppercase tracking-wider';
	$: returnsGridClasses = 'flex flex-col gap-3 mb-6';
	$: returnItemClasses = 'flex justify-between items-center text-sm relative';
	$: returnItemTotalClasses = 'pt-3 border-t border-light-gray font-extrabold';
	$: returnLabelClasses = 'text-black font-medium';
	$: returnValueClasses = 'text-primary font-extrabold';
	$: tokenActionsClasses = 'mt-auto pt-6 pb-8';
	$: actionButtonsClasses = 'flex flex-col gap-4';
	
	// Token card back classes
	$: tokenCardBackClasses = 'h-full flex flex-col p-8';
	$: backHeaderClasses = 'flex justify-between items-center mb-6 pb-4 border-b border-light-gray';
	$: backHeaderH4Classes = 'text-lg font-extrabold text-black m-0';
	$: distributionsContentClasses = 'flex flex-col h-full flex-1';
	$: distributionsHeaderClasses = 'grid grid-cols-3 gap-2 mb-4 pb-3 border-b border-light-gray';
	$: headerMonthClasses = 'text-xs font-bold text-black uppercase tracking-wider text-center';
	$: headerTotalClasses = 'text-xs font-bold text-black uppercase tracking-wider text-center';
	$: headerPerTokenClasses = 'text-xs font-bold text-black uppercase tracking-wider text-center';
	$: distributionsListClasses = 'flex flex-col flex-1 gap-2';
	$: distributionRowClasses = 'grid grid-cols-3 gap-2 py-3 border-b border-black/5 last:border-b-0';
	$: distMonthClasses = 'text-sm text-black text-center font-medium';
	$: distTotalClasses = 'text-sm text-black text-center font-bold text-secondary';
	$: distPerTokenClasses = 'text-sm text-black text-center font-bold text-secondary';
	$: distributionsDividerClasses = 'h-px bg-black my-4';
	$: distributionsSummaryClasses = 'mt-auto';
	$: summaryRowClasses = 'grid grid-cols-3 gap-2 py-3';
	$: summaryMonthClasses = 'text-sm font-bold text-black text-center';
	$: summaryTotalClasses = 'text-sm font-bold text-black text-center text-secondary';
	$: summaryPerTokenClasses = 'text-sm font-bold text-black text-center text-secondary';
	$: comingSoonCardClasses = 'text-center py-8 px-4 flex flex-col items-center gap-4';
	$: comingSoonIconClasses = 'text-5xl mb-2';
	$: comingSoonH4Classes = 'text-lg font-extrabold text-black m-0';
	$: comingSoonPClasses = 'text-sm text-black m-0 opacity-80';
	$: noHistoryClasses = 'flex flex-col items-center justify-center text-center h-full text-black';
	$: noHistoryPClasses = 'my-2 text-sm uppercase tracking-wider leading-none';
	
	// Email popup classes
	$: emailPopupOverlayClasses = 'fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-[1000]';
	$: emailPopupClasses = 'bg-white border-2 border-black p-8 max-w-md w-[90%] max-h-[90vh] overflow-y-auto relative';
	$: emailPopupHeaderClasses = 'flex justify-between items-center mb-6';
	$: emailPopupTitleClasses = 'text-xl font-extrabold text-black m-0 uppercase tracking-wider';
	$: emailPopupCloseClasses = 'bg-transparent border-none text-2xl text-black cursor-pointer p-0 w-8 h-8 flex items-center justify-center transition-opacity duration-200 hover:opacity-70';
	$: emailPopupContentClasses = 'text-center';
	$: emailPopupPClasses = 'text-black mb-6 leading-relaxed';
	$: emailFormClasses = 'flex flex-col gap-4';
	$: emailInputClasses = 'px-3 py-3 border border-light-gray bg-white font-figtree text-sm text-black w-full box-border rounded-none focus:outline-none focus:border-primary';
	$: successMessageClasses = 'text-primary font-semibold text-center p-4 bg-light-gray mb-4';
</script>

<svelte:head>
	<title>{assetData?.name || 'Asset Details'} - Albion</title>
	<meta name="description" content="Detailed information about {assetData?.name || 'asset'}" />
</svelte:head>

<main class={mobileAssetDetailsClasses}>
	{#if loading}
		<div class={loadingStateClasses}>
			<p>Loading asset details...</p>
		</div>
	{:else if error}
		<div class={errorStateClasses}>
			<h1>Error</h1>
			<p>{error}</p>
			<a href="/assets" class={btnPrimaryClasses}>Back to Assets</a>
		</div>
	{:else}
		<!-- Breadcrumb -->
		<nav class={breadcrumbClasses}>
			<a href="/assets" class={breadcrumbLinkClasses}>← Back to Assets</a>
			<span class={breadcrumbSeparatorClasses}>/</span>
			<span class={breadcrumbCurrentClasses}>{assetData?.name || 'Asset Details'}</span>
		</nav>

		<!-- Asset Header -->
		<div class={mobileAssetHeaderClasses}>
			<div class={assetMainInfoClasses}>
				<div class={mobileAssetTitleSectionClasses}>
					<div class={assetIconClasses}>
						<img 
							src={getAssetImage(assetData)} 
							alt={assetData?.name || 'Asset'}
							loading="lazy"
							class={assetImageFullClasses}
						/>
					</div>
					<div class={titleInfoClasses}>
						<div class={titleRowClasses}>
							<h1 class={titleH1Classes}>{assetData?.name}</h1>
							<div class={socialSharingClasses}>
								<div class={sharingLabelClasses}>Share this investment:</div>
								<div class={shareButtonsClasses}>
									<button class={shareBtnClasses} title="Share asset on Twitter" aria-label="Share asset on Twitter" on:click={() => window.open(`https://twitter.com/intent/tweet?text=Check out this energy investment opportunity: ${assetData?.name} on @Albion&url=${encodeURIComponent(window.location.href)}`, '_blank')}>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
											<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
										</svg>
									</button>
									<button class={shareBtnClasses} title="Share asset on LinkedIn" aria-label="Share asset on LinkedIn" on:click={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
											<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
										</svg>
									</button>
									<button class={shareBtnClasses} title="Share asset on Telegram" aria-label="Share asset on Telegram" on:click={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=Check out this energy investment opportunity: ${assetData?.name}`, '_blank')}>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
											<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
										</svg>
									</button>
									<button class={shareBtnClasses} title="Share asset via email" aria-label="Share asset via email" on:click={() => window.open(`mailto:?subject=Investment Opportunity: ${assetData?.name}&body=I thought you might be interested in this energy investment opportunity:%0D%0A%0D%0A${assetData?.name}%0D%0A${window.location.href}%0D%0A%0D%0ACheck it out on Albion!`, '_blank')}>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
											<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
										</svg>
									</button>
									<button class={shareBtnClasses} title="Copy asset link" aria-label="Copy asset link" on:click={() => { navigator.clipboard.writeText(window.location.href); /* You could add a toast notification here */ }}>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
											<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
											<path d="m14 11-7.54.54-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
										</svg>
									</button>
								</div>
							</div>
						</div>
						<div class={assetMetaClasses}>
							<span class={locationClasses}>📍 {assetData?.location.state}, {assetData?.location.country}</span>
						</div>
						<div class={operatorInfoClasses}>
							<span>Operated by {assetData?.operator.name}</span>
							<span>•</span>
							<span>License {assetData?.technical.license}</span>
						</div>
					</div>
				</div>
			</div>

			<div class={mobileAssetMetricsClasses}>
				<div class={mobileMetricClasses}>
					<div class={metricValueClasses}>{assetData?.production.current}</div>
					<div class={metricLabelClasses}>Current Production</div>
				</div>
				<div class={mobileMetricClasses}>
					<div class={metricValueClasses}>{assetData?.monthlyReports?.[0]?.netIncome 
						? formatCurrency(assetData.monthlyReports[0].netIncome)
						: '$20,000'}</div>
					<div class={metricLabelClasses}>Last Received Income</div>
					<div class={metricSubtitleClasses}>{assetData?.monthlyReports?.[0]?.month 
						? formatEndDate(assetData.monthlyReports[0].month + '-01')
						: 'May 2025'}</div>
				</div>
				<div class="{mobileMetricClasses} {clickableMetricClasses}" on:click={() => document.getElementById('token-section')?.scrollIntoView({ behavior: 'smooth' })} on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById('token-section')?.scrollIntoView({ behavior: 'smooth' }); } }} role="button" tabindex="0">
					<div class={metricValueClasses}>{assetTokens.length}</div>
					<div class={metricLabelClasses}>Available Tokens</div>
					<div class="{metricSubtitleClasses} {clickableMetricSubtitleClasses}">👆 Click to view tokens</div>
				</div>
			</div>

		</div>

		<!-- Tabs Navigation -->
		<div class={tabsContainerClasses} id="asset-details-tabs">
			<div class={mobileTabsNavClasses}>
				<button 
					class="{tabBtnClasses} {mobileTabBtnClasses} {activeTab === 'overview' ? tabBtnActiveClasses : ''}"
					on:click={() => activeTab = 'overview'}
				>
					Overview
				</button>
				<button 
					class="{tabBtnClasses} {mobileTabBtnClasses} {activeTab === 'production' ? tabBtnActiveClasses : ''}"
					on:click={() => activeTab = 'production'}
				>
					Production Data
				</button>
				<button 
					class="{tabBtnClasses} {mobileTabBtnClasses} {activeTab === 'payments' ? tabBtnActiveClasses : ''}"
					on:click={() => activeTab = 'payments'}
				>
					Past Payments
				</button>
				<button 
					class="{tabBtnClasses} {mobileTabBtnClasses} {activeTab === 'gallery' ? tabBtnActiveClasses : ''}"
					on:click={() => activeTab = 'gallery'}
				>
					Gallery
				</button>
				<button 
					class="{tabBtnClasses} {mobileTabBtnClasses} {activeTab === 'documents' ? tabBtnActiveClasses : ''}"
					on:click={() => activeTab = 'documents'}
				>
					Documents
				</button>
			</div>

			<!-- Tab Content -->
			<div class={tabContentClasses}>
				{#if activeTab === 'overview'}
					<div class={overviewContentClasses}>
						<div class={mobileFundamentalsGridClasses}>
							<div>
								<h4 class={fundamentalsSectionH4Classes}>Asset Fundamentals</h4>
								<div class={detailRowsClasses}>
									<div class={detailRowClasses}>
										<span class={detailRowLabelClasses}>Field Type</span>
										<span class={detailRowValueClasses}>{assetData?.technical.fieldType}</span>
									</div>
									<div class={detailRowClasses}>
										<span class={detailRowLabelClasses}>Crude Benchmark</span>
										<span class={detailRowValueClasses}>{assetData?.technical.crudeBenchmark}</span>
									</div>
									<div class={detailRowClasses}>
										<span class={detailRowLabelClasses}>Pricing</span>
										<span class={detailRowValueClasses}>{formatPricing(assetData?.technical.pricing?.benchmarkPremium || '')}, {assetData?.technical.pricing?.transportCosts}</span>
									</div>
									<div class={detailRowClasses}>
										<span class={detailRowLabelClasses}>First Oil</span>
										<span class={detailRowValueClasses}>{assetData?.technical.firstOil}</span>
									</div>
									<div class={detailRowClasses}>
										<span class={detailRowLabelClasses}>Estimated End Date</span>
										<span class={detailRowValueClasses}>{formatEndDate(assetData?.technical.expectedEndDate || '')}</span>
									</div>
									<div class={detailRowClasses}>
										<span class={detailRowLabelClasses}>Coordinates</span>
										<span class={detailRowValueClasses}>{assetData?.location.coordinates.lat}°, {assetData?.location.coordinates.lng}°</span>
									</div>
								</div>
							</div>

							<div>
								<h4 class={fundamentalsSectionH4Classes}>Asset Terms</h4>
								<div class={detailRowsClasses}>
									<div class={detailRowClasses}>
										<span class={detailRowLabelClasses}>Interest Type</span>
										<span class={detailRowValueClasses}>{assetData?.assetTerms?.interestType}</span>
									</div>
									<div class={detailRowClasses}>
										<span class="{detailRowLabelClasses} {tooltipContainerClasses}">
											Amount
											{#if assetData?.assetTerms?.amountTooltip}
												<span class={tooltipTriggerClasses}
													on:mouseenter={() => showTooltipWithDelay('amount')}
													on:mouseleave={hideTooltip}
													role="button"
													tabindex="0">ⓘ</span>
												{#if showTooltip === 'amount'}
													<div class={tooltipClasses}>
														{assetData.assetTerms.amountTooltip}
													</div>
												{/if}
											{/if}
										</span>
										<span class={detailRowValueClasses}>{assetData?.assetTerms?.amount}</span>
									</div>
									<div class={detailRowClasses}>
										<span class={detailRowLabelClasses}>Payment Frequency</span>
										<span class={detailRowValueClasses}>{assetData?.assetTerms?.paymentFrequency}</span>
									</div>
									<div class={detailRowClasses}>
										<span class={detailRowLabelClasses}>Infrastructure</span>
										<span class={detailRowValueClasses}>{assetData?.technical.infrastructure}</span>
									</div>
								</div>
							</div>
						</div>

					</div>
				{:else if activeTab === 'production'}
					{@const productionReports = assetData?.productionHistory || assetData?.monthlyReports || []}
					{@const maxProduction = productionReports.length > 0 ? Math.max(...productionReports.map((r: any) => r.production)) : 100}
					{@const defaults = dataStoreService.getDefaultValues()}
					<div class={productionContentClasses}>
						<div class={mobileProductionGridClasses}>
							<div class={chartSectionClasses}>
								<div class={mobileChartHeaderClasses}>
									<h4 class={mobileChartHeaderH4Classes}>Production History</h4>
									<SecondaryButton on:click={exportProductionData}>
										📊 Export Data
									</SecondaryButton>
								</div>
								<div class={chartContainerClasses}>
									<svg class={productionChartClasses} viewBox="0 0 800 320" xmlns="http://www.w3.org/2000/svg">
										<!-- Chart background -->
										<rect width="800" height="320" fill="#ffffff" stroke="#f8f4f4" stroke-width="1"/>
										
										<!-- Grid lines -->
										{#each Array(6) as _, i}
											<line x1="80" y1={50 + i * 40} x2="750" y2={50 + i * 40} stroke="#f8f4f4" stroke-width="0.5" opacity="0.5"/>
										{/each}
										{#each productionReports as _, i}
											<line x1={80 + (i + 1) * (670 / Math.max(productionReports.length, 1))} y1="50" x2={80 + (i + 1) * (670 / Math.max(productionReports.length, 1))} y2="250" stroke="#f8f4f4" stroke-width="0.5" opacity="0.3"/>
										{/each}
										
										<!-- Y-axis labels (Production in BOE) -->
										<text x="70" y="55" text-anchor="end" font-size="10" fill="#000000">{Math.round(maxProduction)}</text>
										<text x="70" y="95" text-anchor="end" font-size="10" fill="#000000">{Math.round(maxProduction * 0.8)}</text>
										<text x="70" y="135" text-anchor="end" font-size="10" fill="#000000">{Math.round(maxProduction * 0.6)}</text>
										<text x="70" y="175" text-anchor="end" font-size="10" fill="#000000">{Math.round(maxProduction * 0.4)}</text>
										<text x="70" y="215" text-anchor="end" font-size="10" fill="#000000">{Math.round(maxProduction * 0.2)}</text>
										<text x="70" y="255" text-anchor="end" font-size="10" fill="#000000">0</text>
										
										<!-- X-axis labels (Months and years from real data) -->
										{#each productionReports as report, i}
											{@const date = new Date(report.month + '-01')}
											{@const monthLabel = date.toLocaleDateString('en-US', { month: 'short' })}
											{@const year = date.getFullYear()}
											{@const showYear = i === 0 || date.getMonth() === 0 || (i > 0 && new Date(productionReports[i-1].month + '-01').getFullYear() !== year)}
											<text x={80 + (i + 1) * (670 / Math.max(productionReports.length, 1))} y="270" text-anchor="middle" font-size="9" fill="#000000">{monthLabel}</text>
											{#if showYear}
												<text x={80 + (i + 1) * (670 / Math.max(productionReports.length, 1))} y="285" text-anchor="middle" font-size="8" fill="#666666" font-weight="bold">{year}</text>
											{/if}
										{/each}
										
										<!-- Production line chart (from real data) -->
										{#if productionReports.length > 1}
											{@const points = productionReports.map((report: any, i: number) => {
												const x = 80 + (i + 1) * (670 / Math.max(productionReports.length, 1));
												const y = 250 - (report.production / maxProduction) * 200;
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
											{@const x = 80 + (i + 1) * (670 / Math.max(productionReports.length, 1))}
											{@const y = 250 - (report.production / maxProduction) * 200}
											<circle 
												cx={x} 
												cy={y} 
												r="4" 
												fill="#283c84"
												stroke="#ffffff"
												stroke-width="2"
											/>
											<!-- Value label near point -->
											<text x={x} y={y - 10} text-anchor="middle" font-size="8" fill="#000000" font-weight="semibold">
												{Math.round(report.production)}
											</text>
										{/each}
										
										<!-- Chart title -->
										<text x="400" y="25" text-anchor="middle" font-size="12" font-weight="bold" fill="#000000">Full Asset Production History ({assetData?.production?.units?.production || 'BOE'})</text>
										
										<!-- Legend -->
										<rect x="580" y="60" width="150" height="40" fill="#ffffff" stroke="#f8f4f4" stroke-width="1"/>
										<line x1="590" y1="70" x2="610" y2="70" stroke="#08bccc" stroke-width="3"/>
										<text x="615" y="75" font-size="9" fill="#000000">Production Rate</text>
										<circle cx="600" cy="85" r="3" fill="#283c84"/>
										<text x="615" y="90" font-size="9" fill="#000000">Monthly Data</text>
									</svg>
								</div>
							</div>

							<div class={productionMetricsClasses}>
								<h4 class={productionMetricsH4Classes}>Production Metrics</h4>
								<div class={uptimeMetricClasses}>
									<div class={uptimeValueClasses}>{assetData?.operationalMetrics?.uptime?.percentage?.toFixed(1) || defaults.operationalMetrics.uptime.percentage.toFixed(1)}%</div>
									<div class={uptimeLabelClasses}>Uptime {assetData?.operationalMetrics?.uptime?.period?.replace('_', ' ') || defaults.operationalMetrics.uptime.period}</div>
								</div>
								<div class={metricsGridClasses}>
									<div class={metricItemClasses}>
										<div class={metricItemValueClasses}>{assetData?.operationalMetrics?.dailyProduction?.current?.toFixed(1) || defaults.operationalMetrics.dailyProduction.current.toFixed(1)}</div>
										<div class={metricItemLabelClasses}>Current Daily Production ({assetData?.operationalMetrics?.dailyProduction?.unit || defaults.operationalMetrics.dailyProduction.unit})</div>
									</div>
								</div>
								<div class={hseMetricClasses}>
									<div class={hseValueClasses}>{assetData?.operationalMetrics?.hseMetrics?.incidentFreeDays || defaults.operationalMetrics.hseMetrics.incidentFreeDays}</div>
									<div class={hseLabelClasses}>Days Since Last HSE Incident</div>
								</div>
							</div>
						</div>
					</div>
				{:else if activeTab === 'payments'}
					{@const monthlyReports = assetData?.monthlyReports || []}
					{@const maxRevenue = monthlyReports.length > 0 ? Math.max(...monthlyReports.map(r => r.revenue)) : 1500}
					{@const latestReport = monthlyReports[monthlyReports.length - 1]}
					{@const nextMonth = latestReport ? new Date(new Date(latestReport.month + '-01').getTime() + 32 * 24 * 60 * 60 * 1000) : new Date()}
					{@const avgRevenue = monthlyReports.length > 0 ? monthlyReports.reduce((sum, r) => sum + r.revenue, 0) / monthlyReports.length : dataStoreService.getDefaultValues().revenue.averageMonthly}
					<div class={paymentsContentClasses}>
						<div class={mobileProductionGridClasses}>
							<div class="{chartSectionClasses} {chartSectionLargeClasses}">
								<div class={mobileChartHeaderClasses}>
									<h4 class={mobileChartHeaderH4Classes}>Revenue History</h4>
									<SecondaryButton on:click={exportPaymentsData}>
										📊 Export Data
									</SecondaryButton>
								</div>
								<div class={chartContainerClasses}>
									<svg class={productionChartClasses} viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg">
										<!-- Chart background -->
										<rect width="800" height="300" fill="#ffffff" stroke="#f8f4f4" stroke-width="1"/>
										
										<!-- Grid lines -->
										{#each Array(6) as _, i}
											<line x1="80" y1={50 + i * 40} x2="750" y2={50 + i * 40} stroke="#f8f4f4" stroke-width="0.5" opacity="0.5"/>
										{/each}
										{#each monthlyReports as _, i}
											<line x1={80 + (i + 1) * (670 / Math.max(monthlyReports.length, 1))} y1="50" x2={80 + (i + 1) * (670 / Math.max(monthlyReports.length, 1))} y2="250" stroke="#f8f4f4" stroke-width="0.5" opacity="0.3"/>
										{/each}
										
										<!-- Y-axis labels (Revenue amounts) -->
										<text x="70" y="55" text-anchor="end" font-size="10" fill="#000000">${Math.round(maxRevenue)}</text>
										<text x="70" y="95" text-anchor="end" font-size="10" fill="#000000">${Math.round(maxRevenue * 0.8)}</text>
										<text x="70" y="135" text-anchor="end" font-size="10" fill="#000000">${Math.round(maxRevenue * 0.6)}</text>
										<text x="70" y="175" text-anchor="end" font-size="10" fill="#000000">${Math.round(maxRevenue * 0.4)}</text>
										<text x="70" y="215" text-anchor="end" font-size="10" fill="#000000">${Math.round(maxRevenue * 0.2)}</text>
										<text x="70" y="255" text-anchor="end" font-size="10" fill="#000000">$0</text>
										
										<!-- X-axis labels (Months and years from monthly reports) -->
										{#each monthlyReports as report, i}
											{@const date = new Date(report.month + '-01')}
											{@const monthLabel = date.toLocaleDateString('en-US', { month: 'short' })}
											{@const year = date.getFullYear()}
											{@const showYear = i === 0 || date.getMonth() === 0 || (i > 0 && new Date(monthlyReports[i-1].month + '-01').getFullYear() !== year)}
											<text x={80 + (i + 1) * (670 / Math.max(monthlyReports.length, 1))} y="270" text-anchor="middle" font-size="9" fill="#000000">{monthLabel}</text>
											{#if showYear}
												<text x={80 + (i + 1) * (670 / Math.max(monthlyReports.length, 1))} y="285" text-anchor="middle" font-size="8" fill="#666666" font-weight="bold">{year}</text>
											{/if}
										{/each}
										
										<!-- Column chart bars (from monthly reports) -->
										{#each monthlyReports as report, i}
											{@const barWidth = 30}
											{@const x = 80 + (i + 1) * (670 / Math.max(monthlyReports.length, 1)) - barWidth / 2}
											{@const barHeight = (report.revenue / maxRevenue) * 200}
											{@const y = 250 - barHeight}
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
											<text x={x + barWidth / 2} y={y - 5} text-anchor="middle" font-size="8" fill="#000000" font-weight="semibold">
												${Math.round(report.revenue)}
											</text>
										{/each}
										
										<!-- Chart title -->
										<text x="400" y="25" text-anchor="middle" font-size="12" font-weight="bold" fill="#000000">Monthly Revenue History</text>
									</svg>
								</div>
							</div>

							<div class={productionMetricsClasses}>
								<h4 class={productionMetricsH4Classes}>Revenue Metrics</h4>
								<div class={uptimeMetricClasses}>
									<div class={uptimeValueClasses}>{nextMonth.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</div>
									<div class={uptimeLabelClasses}>Next Report Due</div>
								</div>
								<div class={metricsGridClasses}>
									<div class={metricItemClasses}>
										<div class={metricValueClasses}>${latestReport?.revenue?.toFixed(0) || dataStoreService.getDefaultValues().revenue.latestMonthly.toLocaleString()}</div>
										<div class={metricLabelClasses}>Latest Monthly Revenue</div>
									</div>
									<div class={metricItemClasses}>
										<div class={metricValueClasses}>${avgRevenue.toFixed(0)}</div>
										<div class={metricLabelClasses}>Avg Monthly Revenue</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				{:else if activeTab === 'documents'}
					<div class={documentsContentClasses}>
						<div class={mobileDocumentsGridClasses}>
							<div>
								<h4 class={documentsSectionH4Classes}>Legal Documents</h4>
								<div class={documentsListClasses}>
									<div class={documentItemClasses}>
										<div class={docInfoClasses}>
											<div class={docIconClasses}>📄</div>
											<div>
												<div class={docNameClasses}>Asset Purchase Agreement</div>
												<div class={docMetaClasses}>PDF • 2.4 MB</div>
											</div>
										</div>
										<SecondaryButton>Download</SecondaryButton>
									</div>
									<div class={documentItemClasses}>
										<div class={docInfoClasses}>
											<div class={docIconClasses}>📄</div>
											<div class={docDetailsClasses}>
												<div class={docNameClasses}>Operating License PEDL 183</div>
												<div class={docMetaClasses}>PDF • 1.8 MB</div>
											</div>
										</div>
										<SecondaryButton>Download</SecondaryButton>
									</div>
									<div class={documentItemClasses}>
										<div class={docInfoClasses}>
											<div class={docIconClasses}>📄</div>
											<div class={docDetailsClasses}>
												<div class={docNameClasses}>Environmental Impact Assessment</div>
												<div class={docMetaClasses}>PDF • 5.2 MB</div>
											</div>
										</div>
										<SecondaryButton>Download</SecondaryButton>
									</div>
									<div class={documentItemClasses}>
										<div class={docInfoClasses}>
											<div class={docIconClasses}>📄</div>
											<div class={docDetailsClasses}>
												<div class={docNameClasses}>Token Terms & Conditions</div>
												<div class={docMetaClasses}>PDF • 950 KB</div>
											</div>
										</div>
										<SecondaryButton>Download</SecondaryButton>
									</div>
								</div>
							</div>

							<div>
								<h4 class={documentsSectionH4Classes}>Technical Reports</h4>
								<div class={documentsListClasses}>
									<div class={documentItemClasses}>
										<div class={docInfoClasses}>
											<div class={docIconClasses}>📊</div>
											<div class={docDetailsClasses}>
												<div class={docNameClasses}>Geological Survey Report 2024</div>
												<div class={docMetaClasses}>PDF • 12.1 MB</div>
											</div>
										</div>
										<SecondaryButton>Download</SecondaryButton>
									</div>
									<div class={documentItemClasses}>
										<div class={docInfoClasses}>
											<div class={docIconClasses}>📊</div>
											<div class={docDetailsClasses}>
												<div class={docNameClasses}>Reserve Audit by Ryder Scott</div>
												<div class={docMetaClasses}>PDF • 3.7 MB</div>
											</div>
										</div>
										<SecondaryButton>Download</SecondaryButton>
									</div>
									<div class={documentItemClasses}>
										<div class={docInfoClasses}>
											<div class={docIconClasses}>📊</div>
											<div class={docDetailsClasses}>
												<div class={docNameClasses}>Production Forecast Model</div>
												<div class={docMetaClasses}>PDF • 2.1 MB</div>
											</div>
										</div>
										<SecondaryButton>Download</SecondaryButton>
									</div>
									<div class={documentItemClasses}>
										<div class={docInfoClasses}>
											<div class={docIconClasses}>🗜️</div>
											<div class={docDetailsClasses}>
												<div class={docNameClasses}>Monthly Production Reports</div>
												<div class={docMetaClasses}>ZIP • 8.9 MB</div>
											</div>
										</div>
										<SecondaryButton>Download</SecondaryButton>
									</div>
								</div>
							</div>
						</div>
					</div>
				{:else if activeTab === 'gallery'}
					{@const galleryImages = getAssetGalleryImages(assetData?.id || '')}
					<div class={galleryContentClasses}>
						<div class={galleryGridClasses}>
							<div class={gallerySectionClasses}>
								<h4>Asset Gallery</h4>
								{#if galleryImages.length > 0}
									<div class={galleryImagesClasses}>
										{#each galleryImages as image, index}
											<div class={galleryImageClasses}>
												<img src={image} alt={`${assetData?.name} - Image ${index + 1}`} />
											</div>
										{/each}
									</div>
								{:else}
									<div class={galleryEmptyClasses}>
										<div class={emptyIconClasses}>📸</div>
										<div class={emptyTextClasses}>
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

		<!-- Token Information Section -->
		<div class={tokenInfoSectionClasses} id="token-section">
			<h3 class={tokenInfoH3Classes}>Token Information</h3>
			<div class={mobileTokensGridClasses}>
				{#each assetTokens as token}
					{@const supply = dataStoreService.getTokenSupply(token.contractAddress)}
					{@const hasAvailableSupply = supply && supply.availableSupply > 0}
					{@const tokenPayoutData = dataStoreService.getTokenPayoutHistory(token.contractAddress)}
					{@const latestPayout = tokenPayoutData?.recentPayouts?.[0]}
					{@const calculatedReturns = dataStoreService.getCalculatedTokenReturns(token.contractAddress)}
					{@const isFlipped = flippedCards.has(token.contractAddress)}
					<div class="{mobileTokenCardContainerClasses} {tokenCardContainerClasses} {isFlipped ? tokenCardContainerFlippedClasses : ''}" id="token-{token.contractAddress}">
						<Card hoverable clickable paddingClass="p-0" on:click={() => handleCardClick(token.contractAddress)}>
							<CardContent paddingClass="p-0">
								<div class={tokenCardFrontClasses}>
									<div class={tokenHeaderClasses}>
										<div class={tokenTitleClasses}>
											<h4>{token.name}</h4>
											<p class={tokenSymbolClasses}>{token.contractAddress}</p>
										</div>
										<div class={tokenShareBadgeClasses}>
											{token.sharePercentage || 25}% of Asset
										</div>
									</div>
									<div class="{tokenBadgeClasses} {!hasAvailableSupply ? tokenBadgeSoldOutClasses : ''}">
										{hasAvailableSupply ? 'Available' : 'Sold Out'}
									</div>
							
									<div class={tokenMetricsClasses}>
										<div class={tokenMetricClasses}>
											<span class={tokenMetricLabelClasses}>Minted Supply</span>
											<span class={tokenMetricValueClasses}>{supply?.mintedSupply.toLocaleString() || '0'}</span>
										</div>
										<div class={tokenMetricClasses}>
											<span class={tokenMetricLabelClasses}>Max Supply</span>
											<span class={tokenMetricValueClasses}>{supply?.maxSupply.toLocaleString() || '0'}</span>
										</div>
										<div class="{tokenMetricClasses} {tooltipContainerClasses}">
											<span class={tokenMetricLabelClasses}>
												Implied Barrels/Token
												<span class={tooltipTriggerClasses} 
													on:mouseenter={() => showTooltipWithDelay('barrels')}
													on:mouseleave={hideTooltip}
													role="button"
													tabindex="0">ⓘ</span>
											</span>
											<span class={tokenMetricValueClasses}>{calculatedReturns?.impliedBarrelsPerToken?.toFixed(6) || '0.000000'}</span>
											{#if showTooltip === 'barrels'}
												<div class={tooltipClasses}>
													Estimated barrels of oil equivalent per token based on reserves and token supply
												</div>
											{/if}
										</div>
										<div class="{tokenMetricClasses} {tooltipContainerClasses}">
											<span class={tokenMetricLabelClasses}>
												Breakeven Oil Price
												<span class={tooltipTriggerClasses}
													on:mouseenter={() => showTooltipWithDelay('breakeven')}
													on:mouseleave={hideTooltip}
													role="button"
													tabindex="0">ⓘ</span>
											</span>
											<span class={tokenMetricValueClasses}>${calculatedReturns?.breakEvenOilPrice?.toFixed(2) || '0.00'}</span>
											{#if showTooltip === 'breakeven'}
												<div class={tooltipClasses}>
													Oil price required to cover operational costs and maintain profitability
												</div>
											{/if}
										</div>
									</div>

									<div class={tokenReturnsClasses}>
										<h5 class={tokenReturnsH5Classes}>Estimated Returns</h5>
										<div class={returnsGridClasses}>
											<div class="{returnItemClasses} {tooltipContainerClasses}">
												<span class={returnLabelClasses}>
													Base
													<span class={tooltipTriggerClasses}
														on:mouseenter={() => showTooltipWithDelay('base')}
														on:mouseleave={hideTooltip}
														role="button"
														tabindex="0">ⓘ</span>
												</span>
												<span class={returnValueClasses}>{calculatedReturns?.baseReturn !== undefined ? Math.round(calculatedReturns.baseReturn) + '%' : 'TBD'}</span>
												{#if showTooltip === 'base'}
													<div class={tooltipClasses}>
														Conservative return estimate based on current production and oil prices
													</div>
												{/if}
											</div>
											<div class="{returnItemClasses} {tooltipContainerClasses}">
												<span class={returnLabelClasses}>
													Bonus
													<span class={tooltipTriggerClasses}
														on:mouseenter={() => showTooltipWithDelay('bonus')}
														on:mouseleave={hideTooltip}
														role="button"
														tabindex="0">ⓘ</span>
												</span>
												<span class={returnValueClasses}>+{calculatedReturns?.bonusReturn !== undefined ? Math.round(calculatedReturns.bonusReturn) + '%' : 'TBD'}</span>
												{#if showTooltip === 'bonus'}
													<div class={tooltipClasses}>
														Additional potential return from improved oil prices or production efficiency
													</div>
												{/if}
											</div>
											<div class="{returnItemClasses} {returnItemTotalClasses}">
												<span class={returnLabelClasses}>Total Expected</span>
												<span class={returnValueClasses}>{calculatedReturns ? Math.round(calculatedReturns.baseReturn + calculatedReturns.bonusReturn) + '%' : 'TBD'}</span>
											</div>
										</div>
									</div>


									<div class={tokenActionsClasses}>
										<div class={actionButtonsClasses}>
											{#if hasAvailableSupply}
												<PrimaryButton fullWidth on:click={(e) => { e.stopPropagation(); handleBuyTokens(token.contractAddress); }}>
													Buy Tokens
												</PrimaryButton>
											{:else}
												<PrimaryButton fullWidth disabled>
													Sold Out
												</PrimaryButton>
											{/if}
											<div on:click|stopPropagation={() => toggleCardFlip(token.contractAddress)} on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleCardFlip(token.contractAddress); }} role="button" tabindex="0" class={tokenActionWrapperClasses}>
												<SecondaryButton fullWidth>
													Distributions History
												</SecondaryButton>
											</div>
										</div>
									</div>
								</div>
								
								<div class={tokenCardBackClasses}>
									<div class={backHeaderClasses}>
										<h4 class={backHeaderH4Classes}>Distributions History</h4>
										<div on:click|stopPropagation={() => toggleCardFlip(token.contractAddress)} on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleCardFlip(token.contractAddress); }} role="button" tabindex="0">
											<SecondaryButton>
												← Back
											</SecondaryButton>
										</div>
									</div>
									
									{#if tokenPayoutData?.recentPayouts && tokenPayoutData.recentPayouts.length > 0}
										<div class={distributionsContentClasses}>
											<div class={distributionsHeaderClasses}>
												<div class={headerMonthClasses}>Month</div>
												<div class={headerTotalClasses}>Total Payments</div>
												<div class={headerPerTokenClasses}>Per Token</div>
											</div>
											<div class={distributionsListClasses}>
												{#each tokenPayoutData.recentPayouts.slice(-6) as payout}
													<div class={distributionRowClasses}>
														<div class={distMonthClasses}>{payout.month}</div>
														<div class={distTotalClasses}>${payout.totalPayout.toLocaleString()}</div>
														<div class={distPerTokenClasses}>${payout.payoutPerToken.toFixed(5)}</div>
													</div>
												{/each}
											</div>
											<div class={distributionsDividerClasses}></div>
											<div class={distributionsSummaryClasses}>
												<div class={summaryRowClasses}>
													<div class={summaryMonthClasses}>Total</div>
													<div class={summaryTotalClasses}>${tokenPayoutData.recentPayouts.reduce((sum, p) => sum + p.totalPayout, 0).toLocaleString()}</div>
													<div class={summaryPerTokenClasses}>${(tokenPayoutData.recentPayouts.reduce((sum, p) => sum + p.payoutPerToken, 0)).toFixed(5)}</div>
												</div>
											</div>
										</div>
									{:else}
										{@const nextRelease = dataStoreService.getFutureReleaseByAsset(assetData?.id || '')}
										<div class={noHistoryClasses}>
											<p>No distributions available yet.</p>
											<p>First payout expected in {nextRelease?.whenRelease || 'Q1 2025'}.</p>
										</div>
									{/if}
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
						<div class={comingSoonCardClasses}>
							<div class={comingSoonIconClasses}>{release.emoji || '📅'}</div>
							<h4>{index === 0 ? 'Next Release' : 'Future Release'} - {release.whenRelease}</h4>
							<p>{release.description || 'Token release planned'}</p>
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
							<div class={comingSoonCardClasses}>
								<div class={comingSoonIconClasses}>🚀</div>
								<h4>New Release Coming Soon</h4>
								<p>Next token release planned for Q1 2025</p>
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
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class={emailPopupOverlayClasses} on:click={handleCloseEmailPopup}>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class={emailPopupClasses} on:click|stopPropagation role="dialog" aria-modal="true" tabindex="0">
			<div class={emailPopupHeaderClasses}>
				<h3 class={emailPopupTitleClasses}>Get Notified</h3>
				<button class={emailPopupCloseClasses} on:click={handleCloseEmailPopup}>×</button>
			</div>
			<div class={emailPopupContentClasses}>
				{#if emailSubmitted}
					<div class={successMessageClasses}>
						Thank you! We'll notify you when the new token release is available.
					</div>
				{:else}
					<p>Enter your email address to be notified when the next token release becomes available.</p>
					<form class={emailFormClasses} on:submit|preventDefault={handleEmailSubmit}>
						<input
							type="email"
							class={emailInputClasses}
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

