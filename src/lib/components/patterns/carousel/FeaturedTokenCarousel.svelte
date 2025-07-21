<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { useAssetService, useTokenService } from '$lib/services';
	import type { Token, Asset } from '$lib/types/uiTypes';
	import { PrimaryButton, SecondaryButton } from '$lib/components/components';
	import { formatCurrency } from '$lib/utils/formatters';
	import { meetsSupplyThreshold, formatSupplyAmount, getAvailableSupplyBigInt } from '$lib/utils/tokenSupplyUtils';

	export let autoPlay = true;
	export let autoPlayInterval = 5000;
	
	const dispatch = createEventDispatcher();
	const assetService = useAssetService();
	const tokenService = useTokenService();

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
			const activeTokens = tokenService.getAvailableTokens()
				.filter(token => meetsSupplyThreshold(token, 1000))
				.slice(0, 3);

			featuredTokensWithAssets = activeTokens
				.map(token => {
					const asset = assetService.getAssetById(token.assetId);
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
		const formatted = formatSupplyAmount(supply, decimals);
		return new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(formatted);
	}

	$: currentItem = featuredTokensWithAssets[currentIndex];
	
	// Enhanced Tailwind class mappings with better mobile responsiveness - FIXED
	$: containerClasses = 'relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8';
	$: loadingStateClasses = 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center p-8 lg:p-16 text-black bg-white border border-light-gray rounded-lg';
	$: errorStateClasses = 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center p-8 lg:p-16 text-black bg-white border border-light-gray rounded-lg';
	$: emptyStateClasses = 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center p-8 lg:p-16 text-black bg-white border border-light-gray rounded-lg';
	$: spinnerClasses = 'w-8 h-8 border-4 border-light-gray border-t-primary animate-spin mb-4';
	$: retryButtonClasses = 'mt-4 px-6 py-3 bg-primary text-white border-none cursor-pointer font-semibold transition-colors duration-200 hover:bg-secondary touch-target rounded';
	$: carouselWrapperClasses = 'relative overflow-hidden rounded-lg outline-none focus:ring-4 focus:ring-primary/50 touch-pan-y';
	$: carouselTrackClasses = 'flex w-full transition-transform duration-500 ease-in-out will-change-transform';
	$: carouselSlideClasses = 'flex-shrink-0 w-full relative';
	$: activeSlideClasses = 'opacity-100';
	$: inactiveSlideClasses = 'opacity-100';
	$: bannerCardClasses = 'grid grid-cols-1 lg:grid-cols-2 bg-white border border-light-gray overflow-hidden';
	$: mobileBannerCardClasses = 'flex flex-col bg-white border border-light-gray overflow-hidden';
	$: tokenSectionClasses = 'p-4 sm:p-6 lg:p-8 bg-white border-b lg:border-b-0 lg:border-r border-light-gray flex flex-col justify-between min-h-[300px] sm:min-h-[350px] lg:min-h-[400px]';
	$: assetSectionClasses = 'p-4 sm:p-6 lg:p-8 bg-light-gray flex flex-col justify-between min-h-[300px] sm:min-h-[350px] lg:min-h-[400px]';
	$: tokenHeaderClasses = 'mb-3 sm:mb-4 lg:mb-6';
	$: tokenNameClasses = 'text-lg sm:text-xl lg:text-2xl font-bold text-black tracking-wider mb-2 leading-tight text-left';
	$: tokenContractClasses = 'text-xs sm:text-sm font-medium text-secondary break-all leading-relaxed py-1 opacity-80 tracking-tight font-figtree text-left';
	$: assetHeaderClasses = 'mb-3 sm:mb-4 lg:mb-6';
	$: assetStatusClasses = 'flex items-center gap-2 mb-2';
	$: statusIndicatorClasses = 'w-2 h-2 bg-secondary rounded-full';
	$: statusIndicatorProducingClasses = 'w-2 h-2 bg-green-500 rounded-full animate-pulse';
	$: statusIndicatorFundingClasses = 'w-2 h-2 bg-yellow-500 rounded-full';
	$: statusIndicatorCompletedClasses = 'w-2 h-2 bg-secondary rounded-full';
	$: statusTextClasses = 'text-xs sm:text-sm font-medium text-black font-figtree uppercase tracking-wide';
	$: assetNameClasses = 'text-lg sm:text-xl lg:text-2xl font-bold text-black mb-2 leading-tight text-left';
	$: assetLocationClasses = 'text-sm sm:text-base text-black leading-relaxed font-figtree text-left opacity-80';
	$: assetDescriptionClasses = 'text-sm text-black leading-relaxed mb-4 sm:mb-6 font-figtree hidden lg:block';
	$: tokenStatsClasses = 'grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8';
	$: tokenStatsDesktopClasses = 'grid grid-cols-4 gap-4 mb-8 items-start';
	$: assetStatsClasses = 'grid grid-cols-1 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8';
	$: statItemClasses = 'text-left flex flex-col';
	$: statLabelClasses = 'text-xs font-medium text-gray-500 mb-1 font-figtree uppercase tracking-wide';
	$: statValueClasses = 'text-sm sm:text-base lg:text-lg font-bold text-black';
	$: tokenActionsClasses = 'flex flex-col gap-2 sm:gap-3 mt-auto';
	$: tokenActionsMobileClasses = 'flex flex-row gap-2 mt-auto';
	$: mobileAssetSectionClasses = 'p-3 bg-light-gray flex flex-col min-h-[180px]';
	$: mobileTokenSectionClasses = 'p-3 bg-white border-t border-light-gray flex flex-col justify-between min-h-[200px]';
	$: assetMetaClasses = 'flex flex-col gap-2 mt-auto';
	$: assetMetaItemClasses = 'flex gap-2';
	$: assetMetaLabelClasses = 'text-xs font-medium text-gray-500 font-figtree';
	$: assetMetaValueClasses = 'text-xs text-black opacity-70 font-figtree';
	
	// Navigation controls - hidden on mobile, shown on desktop
	$: navButtonClasses = 'hidden lg:flex absolute top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/70 text-white border-none text-xl cursor-pointer transition-all duration-200 z-10 hover:bg-black hover:scale-110 hover:shadow-lg touch-target items-center justify-center rounded-full';
	$: prevButtonClasses = 'hidden lg:flex absolute top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/70 text-white border-none text-xl cursor-pointer transition-all duration-200 z-10 hover:bg-black hover:scale-110 hover:shadow-lg touch-target left-[-4rem] items-center justify-center rounded-full';
	$: nextButtonClasses = 'hidden lg:flex absolute top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/70 text-white border-none text-xl cursor-pointer transition-all duration-200 z-10 hover:bg-black hover:scale-110 hover:shadow-lg touch-target right-[-4rem] items-center justify-center rounded-full';
	$: indicatorsClasses = 'absolute bottom-4 left-1/2 transform -translate-x-1/2 gap-2 z-10 hidden';
	$: indicatorClasses = 'w-3 h-3 border-none bg-white/50 cursor-pointer transition-all duration-200 hover:bg-white/80 touch-target rounded-full';
	$: indicatorActiveClasses = 'w-3 h-3 border-none bg-white cursor-pointer transition-all duration-200 scale-125 shadow-lg touch-target rounded-full';

	
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

<div class={containerClasses} bind:this={carouselContainer}>
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
				class={prevButtonClasses} 
				on:click={prevSlide}
				aria-label="Previous token"
			>
				‹
			</button>
			
			<button 
				class={nextButtonClasses} 
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
				class={carouselTrackClasses}
				style="transform: translateX(-{currentIndex * 100}%)"
			>
				{#each featuredTokensWithAssets as item, index}
					{@const calculatedReturns = tokenService.getTokenReturns(item.token.contractAddress)}
					<div class="{carouselSlideClasses} {index === currentIndex ? activeSlideClasses : inactiveSlideClasses}">
						<!-- Desktop Layout -->
						<div class="hidden lg:block">
							<div class={bannerCardClasses}>
								<!-- Token Section -->
								<div class={tokenSectionClasses}>
									<div class={tokenHeaderClasses}>
										<div class="mb-3">
											<h3 class={tokenNameClasses}>{item.token.name}</h3>
										</div>
										<div class={tokenContractClasses}>{item.token.contractAddress}</div>
									</div>

									<!-- Desktop: Fixed 4-column grid for proper alignment -->
									<div class={tokenStatsDesktopClasses}>
										<div class={statItemClasses}>
											<div class={statLabelClasses}>Total Supply</div>
											<div class={statValueClasses}>
												{formatSupply(item.token.supply.maxSupply, item.token.decimals)}
											</div>
										</div>

										<div class={statItemClasses}>
											<div class={statLabelClasses}>Available Supply</div>
											<div class={statValueClasses}>
												{formatSupply(getAvailableSupplyBigInt(item.token).toString(), item.token.decimals)}
											</div>
										</div>

										<div class={statItemClasses}>
											<div class={statLabelClasses}>Base Returns</div>
											<div class={statValueClasses + ' text-primary'}>
												{calculatedReturns?.baseReturn !== undefined ? Math.round(calculatedReturns.baseReturn) + '%' : 'TBD'}
											</div>
										</div>

										<div class={statItemClasses}>
											<div class={statLabelClasses}>Bonus Returns</div>
											<div class={statValueClasses + ' text-primary'}>
												+{calculatedReturns?.bonusReturn !== undefined ? Math.round(calculatedReturns.bonusReturn) + '%' : 'TBD'}
											</div>
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

								<!-- Desktop Asset Section -->
								<div class={assetSectionClasses}>
									<!-- Cover Image at the top -->
									{#if item.asset.coverImage}
										<div class="mb-6 -mx-8 -mt-8">
											<img 
												src={item.asset.coverImage} 
												alt={item.asset.name}
												class="w-full h-48 object-cover"
												loading="lazy"
											/>
										</div>
									{/if}

									<div class={assetHeaderClasses}>
										<div class="flex items-center gap-2 mb-2">
											<div class={getStatusIndicatorClasses(item.asset.production.status)}></div>
											<span class={statusTextClasses}>{item.asset.production.status.toUpperCase()}</span>
										</div>
										<h3 class={assetNameClasses}>{item.asset.name}</h3>
										<div class={assetLocationClasses}>
											{item.asset.location.state}, {item.asset.location.country}
										</div>
									</div>

									<div class={assetStatsClasses}>
										<div class={statItemClasses}>
											<div class={statLabelClasses}>Remaining Production</div>
											<div class={statValueClasses}>{item.asset.production?.expectedRemainingProduction || 'TBD'}</div>
										</div>
									</div>

									<div class={assetMetaClasses}>
										<div class={assetMetaItemClasses}>
											<span class={assetMetaLabelClasses}>Operator:</span>
											<span class={assetMetaValueClasses}>{item.asset.operator.name}</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						<!-- Mobile Layout -->
						<div class="lg:hidden">
							<div class={mobileBannerCardClasses}>
								<!-- Mobile: Asset Section First -->
								<div class={mobileAssetSectionClasses}>
									<!-- Cover Image with reduced spacing -->
									{#if item.asset.coverImage}
										<div class="mb-2 -mx-3 -mt-3">
											<img 
												src={item.asset.coverImage} 
												alt={item.asset.name}
												class="w-full h-32 object-cover"
												loading="lazy"
											/>
										</div>
									{/if}

									<div class="flex items-center gap-2 mb-1">
										<div class={getStatusIndicatorClasses(item.asset.production.status)}></div>
										<span class="text-xs font-medium text-black uppercase tracking-wide">{item.asset.production.status}</span>
									</div>
									<h3 class="text-lg font-bold text-black mb-1 leading-tight">{item.asset.name}</h3>
									<div class="text-sm text-black opacity-70">
										{item.asset.location.state}, {item.asset.location.country}
									</div>
									<div class="text-sm text-black opacity-70 mt-1">
										<span class="font-medium">Remaining:</span> 
										<span>{item.asset.production?.expectedRemainingProduction || 'TBD'}</span>
									</div>
								</div>

								<!-- Mobile: Token Section -->
								<div class={mobileTokenSectionClasses}>
									<div class="mb-3">
										<h4 class="text-base font-bold text-black mb-1">{item.token.name}</h4>
										<div class="text-xs text-secondary opacity-80">{item.token.contractAddress}</div>
									</div>

									<!-- Mobile: 2x2 grid for stats -->
									<div class="grid grid-cols-2 gap-3 mb-4">
										<div class={statItemClasses}>
											<div class="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Available</div>
											<div class="text-sm font-bold text-black">
												{formatSupply(getAvailableSupplyBigInt(item.token).toString(), item.token.decimals)}
											</div>
										</div>

										<div class={statItemClasses}>
											<div class="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Total Supply</div>
											<div class="text-sm font-bold text-black">
												{formatSupply(item.token.supply.maxSupply, item.token.decimals)}
											</div>
										</div>

										<div class={statItemClasses}>
											<div class="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Base Returns</div>
											<div class="text-sm font-bold text-primary">
												{calculatedReturns?.baseReturn !== undefined ? Math.round(calculatedReturns.baseReturn) + '%' : 'TBD'}
											</div>
										</div>

										<div class={statItemClasses}>
											<div class="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Bonus Returns</div>
											<div class="text-sm font-bold text-primary">
												+{calculatedReturns?.bonusReturn !== undefined ? Math.round(calculatedReturns.bonusReturn) + '%' : 'TBD'}
											</div>
										</div>
									</div>

									<!-- Mobile: Inline buttons with shorter text -->
									<div class={tokenActionsMobileClasses}>
										<PrimaryButton 
											on:click={() => handleBuyTokens(item.token.contractAddress)}
											size="small"
											fullWidth
										>
											Buy
										</PrimaryButton>
										<SecondaryButton 
											href="/assets/{item.asset.id}"
											size="small"
											fullWidth
										>
											View
										</SecondaryButton>
									</div>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Indicators (remain inside carousel wrapper) -->
			{#if featuredTokensWithAssets.length > 1}
				<div class={indicatorsClasses}>
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

