<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import dataStoreService from '$lib/services/DataStoreService';
	import type { Token, Asset } from '$lib/types/dataStore';
	import { PrimaryButton, SecondaryButton } from '$lib/components/ui';

	export let autoPlay = true;
	export let autoPlayInterval = 5000;
	
	const dispatch = createEventDispatcher();

	let currentIndex = 0;
	let featuredTokensWithAssets: Array<{ token: Token; asset: Asset }> = [];
	let loading = true;
	let error: string | null = null;
	let autoPlayTimer: ReturnType<typeof setTimeout> | null = null;
	let carouselContainer: HTMLElement;
	let isTransitioning = false;
	let touchStartX = 0;
	let touchEndX = 0;

	onMount(async () => {
		await loadFeaturedTokens();
		if (autoPlay && featuredTokensWithAssets.length > 1) {
			startAutoPlay();
		}
	});

	onDestroy(() => {
		if (autoPlayTimer) {
			clearInterval(autoPlayTimer);
		}
	});

	async function loadFeaturedTokens() {
		try {
			loading = true;
			error = null;

			// Get active tokens with sufficient available supply (>= 1000)
			const activeTokens = dataStoreService.getActiveTokens()
				.filter(token => {
					const availableSupply = BigInt(token.supply.maxSupply) - BigInt(token.supply.mintedSupply);
					const availableSupplyFormatted = Number(availableSupply) / Math.pow(10, token.decimals);
					return availableSupplyFormatted >= 1000;
				})
				.slice(0, 3);

			featuredTokensWithAssets = activeTokens
				.map(token => {
					const asset = dataStoreService.getAssetById(token.assetId);
					return asset ? { token, asset } : null;
				})
				.filter(Boolean) as Array<{ token: Token; asset: Asset }>;

			loading = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load featured tokens';
			console.error('Featured tokens loading error:', err);
			loading = false;
		}
	}

	function nextSlide() {
		if (featuredTokensWithAssets.length === 0 || isTransitioning) return;
		isTransitioning = true;
		currentIndex = (currentIndex + 1) % featuredTokensWithAssets.length;
		setTimeout(() => {
			isTransitioning = false;
		}, 600);
	}

	function prevSlide() {
		if (featuredTokensWithAssets.length === 0 || isTransitioning) return;
		isTransitioning = true;
		currentIndex = currentIndex === 0 ? featuredTokensWithAssets.length - 1 : currentIndex - 1;
		setTimeout(() => {
			isTransitioning = false;
		}, 600);
	}

	function goToSlide(index: number) {
		if (index >= 0 && index < featuredTokensWithAssets.length && !isTransitioning) {
			isTransitioning = true;
			currentIndex = index;
			setTimeout(() => {
				isTransitioning = false;
			}, 600);
		}
	}

	function startAutoPlay() {
		if (autoPlayTimer) clearInterval(autoPlayTimer);
		autoPlayTimer = setInterval(nextSlide, autoPlayInterval);
	}

	function stopAutoPlay() {
		if (autoPlayTimer) {
			clearInterval(autoPlayTimer);
			autoPlayTimer = null;
		}
	}

	function handleMouseEnter() {
		if (autoPlay) stopAutoPlay();
	}

	function handleMouseLeave() {
		if (autoPlay && featuredTokensWithAssets.length > 1) startAutoPlay();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (featuredTokensWithAssets.length <= 1) return;
		
		switch (event.key) {
			case 'ArrowLeft':
				event.preventDefault();
				prevSlide();
				break;
			case 'ArrowRight':
				event.preventDefault();
				nextSlide();
				break;
			case 'Home':
				event.preventDefault();
				goToSlide(0);
				break;
			case 'End':
				event.preventDefault();
				goToSlide(featuredTokensWithAssets.length - 1);
				break;
		}
	}

	function handleTouchStart(event: TouchEvent) {
		touchStartX = event.touches[0].clientX;
	}

	function handleTouchEnd(event: TouchEvent) {
		touchEndX = event.changedTouches[0].clientX;
		handleSwipe();
	}

	function handleSwipe() {
		const swipeThreshold = 50;
		const difference = touchStartX - touchEndX;
		
		if (Math.abs(difference) > swipeThreshold) {
			if (difference > 0) {
				nextSlide();
			} else {
				prevSlide();
			}
		}
	}
	
	function handleBuyTokens(tokenAddress: string) {
		dispatch('buyTokens', { tokenAddress });
	}

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 1,
			maximumFractionDigits: 1
		}).format(amount);
	}

	function formatLargeNumber(value: number): string {
		if (value >= 1000000) {
			return `${(value / 1000000).toFixed(1)}M`;
		}
		if (value >= 1000) {
			return `${(value / 1000).toFixed(1)}K`;
		}
		return value.toString();
	}

	function formatSupply(supply: string, decimals: number): string {
		const formatted = parseInt(supply) / Math.pow(10, decimals);
		return new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(formatted);
	}

	$: currentItem = featuredTokensWithAssets[currentIndex];
	
	// Tailwind class mappings
	$: containerClasses = 'relative w-full max-w-6xl mx-auto px-8';
	$: loadingStateClasses = 'max-w-6xl mx-auto px-8 flex items-center justify-center p-16 text-black bg-white border border-light-gray';
	$: errorStateClasses = 'max-w-6xl mx-auto px-8 flex items-center justify-center p-16 text-black bg-white border border-light-gray';
	$: emptyStateClasses = 'max-w-6xl mx-auto px-8 flex items-center justify-center p-16 text-black bg-white border border-light-gray';
	$: spinnerClasses = 'w-8 h-8 border-4 border-light-gray border-t-primary animate-spin mb-4';
	$: retryButtonClasses = 'mt-4 px-6 py-3 bg-primary text-white border-none cursor-pointer font-semibold transition-colors duration-200 hover:bg-secondary';
	$: carouselWrapperClasses = 'relative overflow-hidden shadow-carousel outline-none focus:shadow-carousel focus:ring-4 focus:ring-primary/50 touch-pan-y';
	$: carouselTrackClasses = 'flex w-full transition-transform duration-700 ease-in-out will-change-transform';
	$: carouselSlideClasses = 'flex-shrink-0 w-full relative transition-all duration-700 ease-in-out';
	$: activeSlideClasses = 'opacity-100 scale-100';
	$: inactiveSlideClasses = 'opacity-70 scale-95';
	$: bannerCardClasses = 'grid grid-cols-1 md:grid-cols-2 min-h-96 bg-white border border-light-gray transition-all duration-300 ease-in-out hover:transform hover:-translate-y-1 hover:shadow-action-hover animate-fade-in';
	$: tokenSectionClasses = 'p-12 bg-white border-b md:border-b-0 md:border-r border-light-gray flex flex-col justify-between';
	$: assetSectionClasses = 'p-12 bg-light-gray flex flex-col justify-between';
	$: tokenHeaderClasses = 'mb-6';
	$: tokenNameClasses = 'text-2xl font-extrabold text-black tracking-wider mb-3 leading-tight font-figtree text-left';
	$: tokenContractClasses = 'text-base font-medium text-secondary break-all leading-relaxed py-1 opacity-80 tracking-tight font-figtree text-left';
	$: assetHeaderClasses = 'mb-6';
	$: assetStatusClasses = 'flex items-center gap-2 mb-4';
	$: statusIndicatorClasses = 'w-2 h-2 bg-secondary';
	$: statusIndicatorProducingClasses = 'w-2 h-2 bg-green-500 animate-pulse-status';
	$: statusIndicatorFundingClasses = 'w-2 h-2 bg-yellow-500';
	$: statusIndicatorCompletedClasses = 'w-2 h-2 bg-secondary';
	$: statusTextClasses = 'text-sm font-medium text-black font-figtree';
	$: assetNameClasses = 'text-2xl font-extrabold text-black mb-2 leading-tight font-figtree';
	$: assetLocationClasses = 'text-lg text-black leading-relaxed font-figtree';
	$: assetDescriptionClasses = 'text-lg text-black leading-relaxed mb-8 font-figtree';
	$: tokenStatsClasses = 'grid grid-cols-2 gap-4 mb-8';
	$: assetStatsClasses = 'grid grid-cols-1 gap-4 mb-8';
	$: statItemClasses = 'text-left';
	$: statLabelClasses = 'text-sm font-medium text-gray-500 mb-1 font-figtree';
	$: statValueClasses = 'text-xl md:text-2xl font-extrabold text-black font-figtree';
	$: tokenActionsClasses = 'flex gap-4';
	$: assetMetaClasses = 'flex flex-col gap-2';
	$: assetMetaItemClasses = 'flex gap-2';
	$: assetMetaLabelClasses = 'text-sm font-medium text-gray-500 font-figtree';
	$: assetMetaValueClasses = 'text-sm text-black opacity-70 font-figtree';
	$: navButtonClasses = 'absolute top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/70 text-white border-none text-xl cursor-pointer transition-all duration-200 z-10 hover:bg-black hover:scale-110 hover:shadow-lg';
	$: prevButtonClasses = 'absolute top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/70 text-white border-none text-xl cursor-pointer transition-all duration-200 z-10 hover:bg-black hover:scale-110 hover:shadow-lg left-[-4rem]';
	$: nextButtonClasses = 'absolute top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/70 text-white border-none text-xl cursor-pointer transition-all duration-200 z-10 hover:bg-black hover:scale-110 hover:shadow-lg right-[-4rem]';
	$: indicatorsClasses = 'absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-10';
	$: indicatorClasses = 'w-3 h-3 border-none bg-white/50 cursor-pointer transition-all duration-200 hover:bg-white/80';
	$: indicatorActiveClasses = 'w-3 h-3 border-none bg-white cursor-pointer transition-all duration-200 scale-125 shadow-lg';
	
	// Responsive classes using Tailwind
	$: mobileTokenSectionClasses = 'p-6 lg:p-12 bg-white border-b md:border-b-0 md:border-r border-light-gray flex flex-col justify-between';
	$: mobileAssetSectionClasses = 'p-6 lg:p-12 bg-light-gray flex flex-col justify-between';
	$: mobileTokenStatsClasses = 'grid grid-cols-2 gap-4 mb-8';
	$: mobileNavButtonClasses = 'md:w-12 md:h-12 w-10 h-10 bg-black/70 text-white border-none md:text-xl text-lg cursor-pointer transition-all duration-200 z-10 hover:bg-black hover:scale-110 hover:shadow-lg';
	$: mobilePrevButtonClasses = 'absolute top-1/2 transform -translate-y-1/2 md:w-12 md:h-12 w-10 h-10 bg-black/70 text-white border-none md:text-xl text-lg cursor-pointer transition-all duration-200 z-10 hover:bg-black hover:scale-110 hover:shadow-lg md:left-[-4rem] left-[-3rem]';
	$: mobileNextButtonClasses = 'absolute top-1/2 transform -translate-y-1/2 md:w-12 md:h-12 w-10 h-10 bg-black/70 text-white border-none md:text-xl text-lg cursor-pointer transition-all duration-200 z-10 hover:bg-black hover:scale-110 hover:shadow-lg md:right-[-4rem] right-[-3rem]';
	$: mobileIndicatorsClasses = 'absolute md:bottom-6 bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10';
	$: mobileContainerClasses = 'relative w-full max-w-6xl mx-auto px-8';
	$: mobileBannerCardClasses = 'grid grid-cols-1 md:grid-cols-2 min-h-96 bg-white border border-light-gray transition-all duration-300 ease-in-out md:hover:transform md:hover:-translate-y-1 md:hover:shadow-action-hover animate-fade-in';
	$: mobileCarouselSlideClasses = 'flex-shrink-0 w-full relative transition-all duration-700 ease-in-out sm:opacity-100 sm:scale-100';
	$: mobileCarouselTrackClasses = 'flex w-full sm:transition-transform sm:duration-500 transition-transform duration-700 ease-in-out will-change-transform';
	
	// Get status-specific classes
	function getStatusIndicatorClasses(status: string) {
		switch (status) {
			case 'producing':
				return statusIndicatorProducingClasses;
			case 'funding':
				return statusIndicatorFundingClasses;
			case 'completed':
				return statusIndicatorCompletedClasses;
			default:
				return statusIndicatorClasses;
		}
	}
</script>

<div class={mobileContainerClasses} bind:this={carouselContainer}>
	{#if loading}
		<div class={loadingStateClasses}>
			<div class={spinnerClasses}></div>
			<p>Loading featured tokens...</p>
		</div>
	{:else if error}
		<div class={errorStateClasses}>
			<p>Error: {error}</p>
			<button on:click={loadFeaturedTokens} class={retryButtonClasses}>Retry</button>
		</div>
	{:else if featuredTokensWithAssets.length === 0}
		<div class={emptyStateClasses}>
			<p>No featured tokens available</p>
		</div>
	{:else}
		<!-- Navigation Controls (outside carousel wrapper) -->
		{#if featuredTokensWithAssets.length > 1}
			<button 
				class={mobilePrevButtonClasses} 
				on:click={prevSlide}
				aria-label="Previous token"
			>
				‹
			</button>
			
			<button 
				class={mobileNextButtonClasses} 
				on:click={nextSlide}
				aria-label="Next token"
			>
				›
			</button>
		{/if}

		<div 
			class={carouselWrapperClasses}
			on:mouseenter={handleMouseEnter}
			on:mouseleave={handleMouseLeave}
			on:keydown={handleKeydown}
			on:touchstart={handleTouchStart}
			on:touchend={handleTouchEnd}
			role="button"
			aria-label="Featured tokens carousel - use arrow keys to navigate"
			tabindex="0"
		>
			<!-- Carousel track -->
			<div 
				class={mobileCarouselTrackClasses}
				style="transform: translateX(-{currentIndex * 100}%)"
			>
				{#each featuredTokensWithAssets as item, index}
					{@const calculatedReturns = dataStoreService.getCalculatedTokenReturns(item.token.contractAddress)}
					<div class="{mobileCarouselSlideClasses} {index === currentIndex ? activeSlideClasses : inactiveSlideClasses}">
						<div class={mobileBannerCardClasses}>
							<!-- Token Section -->
							<div class={mobileTokenSectionClasses}>
								<div class={tokenHeaderClasses}>
									<div class="mb-3">
										<h3 class={tokenNameClasses}>{item.token.name}</h3>
									</div>
									<div class={tokenContractClasses}>{item.token.contractAddress}</div>
								</div>

								<div class={mobileTokenStatsClasses}>
									<div class={statItemClasses}>
										<div class={statLabelClasses}>Total Supply</div>
										<div class={statValueClasses}>
											{formatSupply(item.token.supply.maxSupply, item.token.decimals)}
										</div>
									</div>
									
									<div class={statItemClasses}>
										<div class={statLabelClasses}>Available Supply</div>
										<div class={statValueClasses}>
											{formatSupply((BigInt(item.token.supply.maxSupply) - BigInt(item.token.supply.mintedSupply)).toString(), item.token.decimals)}
										</div>
									</div>
									<div class={statItemClasses}>
										<div class={statLabelClasses}>Estimated Base Payout</div>
										<div class="text-xl font-extrabold text-primary">{calculatedReturns?.baseReturn !== undefined ? Math.round(calculatedReturns.baseReturn) + '%' : 'TBD'}</div>
									</div>
									
									<div class={statItemClasses}>
										<div class={statLabelClasses}>Estimated Bonus Payout</div>
										<div class="text-xl font-extrabold text-primary">+{calculatedReturns?.bonusReturn !== undefined ? Math.round(calculatedReturns.bonusReturn) + '%' : 'TBD'}</div>
									</div>
								</div>

								<div class={tokenActionsClasses}>
									<PrimaryButton on:click={() => handleBuyTokens(item.token.contractAddress)}>
										Buy Tokens
									</PrimaryButton>
									<SecondaryButton href="/assets/{item.asset.id}">
										View Asset
									</SecondaryButton>
								</div>
							</div>

							<!-- Asset Section -->
							<div class={mobileAssetSectionClasses}>
								<div class={assetHeaderClasses}>
									<div class={assetStatusClasses}>
										<div class={getStatusIndicatorClasses(item.asset.production.status)}></div>
										<span class={statusTextClasses}>{item.asset.production.status.toUpperCase()}</span>
									</div>
									<h3 class={assetNameClasses}>{item.asset.name}</h3>
									<div class={assetLocationClasses}>
										{item.asset.location.state}, {item.asset.location.country}
									</div>
								</div>

								<div class={assetDescriptionClasses}>
									{item.asset.description}
								</div>

								<div class={assetStatsClasses}>
									<div class={statItemClasses}>
										<div class={statLabelClasses}>Expected Remaining Production</div>
										<div class={statValueClasses}>{dataStoreService.getCalculatedRemainingProduction(item.asset.id)}</div>
									</div>
								</div>

								<div class={assetMetaClasses}>
									<div class={assetMetaItemClasses}>
										<span class={assetMetaLabelClasses}>Operator:</span>
										<span class={assetMetaValueClasses}>{item.asset.operator.name}</span>
									</div>
									<div class={assetMetaItemClasses}>
										<span class={assetMetaLabelClasses}>Type:</span>
										<span class={assetMetaValueClasses}>{item.asset.technical.fieldType}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Indicators (remain inside carousel wrapper) -->
			{#if featuredTokensWithAssets.length > 1}
				<div class={mobileIndicatorsClasses}>
					{#each featuredTokensWithAssets as _, index}
						<button 
							class="{index === currentIndex ? indicatorActiveClasses : indicatorClasses}"
							on:click={() => goToSlide(index)}
							aria-label="Go to slide {index + 1}"
						></button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

