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
</script>

<div class="carousel-container" bind:this={carouselContainer}>
	{#if loading}
		<div class="loading-state">
			<div class="spinner"></div>
			<p>Loading featured tokens...</p>
		</div>
	{:else if error}
		<div class="error-state">
			<p>Error: {error}</p>
			<button on:click={loadFeaturedTokens} class="retry-button">Retry</button>
		</div>
	{:else if featuredTokensWithAssets.length === 0}
		<div class="empty-state">
			<p>No featured tokens available</p>
		</div>
	{:else}
		<!-- Navigation Controls (outside carousel wrapper) -->
		{#if featuredTokensWithAssets.length > 1}
			<button 
				class="nav-button prev" 
				on:click={prevSlide}
				aria-label="Previous token"
			>
				‹
			</button>
			
			<button 
				class="nav-button next" 
				on:click={nextSlide}
				aria-label="Next token"
			>
				›
			</button>
		{/if}

		<div 
			class="carousel-wrapper"
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
				class="carousel-track"
				style="transform: translateX(-{currentIndex * 100}%)"
			>
				{#each featuredTokensWithAssets as item, index}
					{@const calculatedReturns = dataStoreService.getCalculatedTokenReturns(item.token.contractAddress)}
					<div class="carousel-slide" class:active={index === currentIndex}>
						<div class="banner-card">
							<!-- Token Section -->
							<div class="token-section">
								<div class="token-header">
									<h3 class="token-name">{item.token.name}</h3>
									<div class="token-contract">{item.token.contractAddress}</div>
								</div>

								<div class="token-stats">
									<div class="stat-item">
										<div class="stat-label">Total Supply</div>
										<div class="stat-value">
											{formatSupply(item.token.supply.maxSupply, item.token.decimals)}
										</div>
									</div>
									
									<div class="stat-item">
										<div class="stat-label">Available Supply</div>
										<div class="stat-value">
											{formatSupply((BigInt(item.token.supply.maxSupply) - BigInt(item.token.supply.mintedSupply)).toString(), item.token.decimals)}
										</div>
									</div>
									<div class="stat-item">
										<div class="stat-label">Estimated Base Payout</div>
										<div class="stat-value">{calculatedReturns?.baseReturn !== undefined ? Math.round(calculatedReturns.baseReturn) + '%' : 'TBD'}</div>
									</div>
									
									<div class="stat-item">
										<div class="stat-label">Estimated Bonus Payout</div>
										<div class="stat-value">+{calculatedReturns?.bonusReturn !== undefined ? Math.round(calculatedReturns.bonusReturn) + '%' : 'TBD'}</div>
									</div>
								</div>

								<div class="token-actions">
									<PrimaryButton on:click={() => handleBuyTokens(item.token.contractAddress)}>
										Buy Tokens
									</PrimaryButton>
									<SecondaryButton href="/assets/{item.asset.id}">
										View Asset
									</SecondaryButton>
								</div>
							</div>

							<!-- Asset Section -->
							<div class="asset-section">
								<div class="asset-header">
									<div class="asset-status">
										<div class="status-indicator {item.asset.production.status}"></div>
										<span class="status-text">{item.asset.production.status.toUpperCase()}</span>
									</div>
									<h3 class="asset-name">{item.asset.name}</h3>
									<div class="asset-location">
										{item.asset.location.state}, {item.asset.location.country}
									</div>
								</div>

								<div class="asset-description">
									{item.asset.description}
								</div>

								<div class="asset-stats">
									<div class="stat-item">
										<div class="stat-label">Expected Remaining Production</div>
										<div class="stat-value">{dataStoreService.getCalculatedRemainingProduction(item.asset.id)}</div>
									</div>
								</div>

								<div class="asset-meta">
									<div class="operator">
										<span class="label">Operator:</span>
										<span class="value">{item.asset.operator.name}</span>
									</div>
									<div class="field-type">
										<span class="label">Type:</span>
										<span class="value">{item.asset.technical.fieldType}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Indicators (remain inside carousel wrapper) -->
			{#if featuredTokensWithAssets.length > 1}
				<div class="indicators">
					{#each featuredTokensWithAssets as _, index}
						<button 
							class="indicator {index === currentIndex ? 'active' : ''}"
							on:click={() => goToSlide(index)}
							aria-label="Go to slide {index + 1}"
						></button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.carousel-container {
		position: relative;
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	.loading-state, .error-state, .empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		text-align: center;
		color: var(--color-black);
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		border-radius: 8px;
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--color-light-gray);
		border-top: 3px solid var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.retry-button {
		margin-top: 1rem;
		padding: 0.75rem 1.5rem;
		background: var(--color-primary);
		color: var(--color-white);
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: var(--font-weight-semibold);
		transition: background-color 0.2s ease;
	}

	.retry-button:hover {
		background: var(--color-secondary);
	}

	.carousel-wrapper {
		position: relative;
		overflow: hidden;
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		outline: none;
		touch-action: pan-y;
	}

	.carousel-wrapper:focus {
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1), 0 0 0 3px var(--color-primary);
	}

	.carousel-track {
		display: flex;
		width: 100%;
		transition: transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
		will-change: transform;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	.carousel-slide {
		flex: 0 0 100%;
		width: 100%;
		position: relative;
		transition: opacity 0.6s ease, transform 0.6s ease;
		transform: scale(0.95);
		opacity: 0.7;
	}

	.carousel-slide.active {
		transform: scale(1);
		opacity: 1;
	}

	.banner-card {
		display: grid;
		grid-template-columns: 1fr 1fr;
		min-height: 400px;
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		transition: transform 0.3s ease, box-shadow 0.3s ease;
		animation: slideIn 0.6s ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.carousel-wrapper:hover .banner-card {
		transform: translateY(-2px);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
	}

	.token-section {
		padding: 3rem;
		background: var(--color-white);
		border-right: 1px solid var(--color-light-gray);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.asset-section {
		padding: 3rem;
		background: var(--color-light-gray);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.token-header {
		margin-bottom: 2rem;
	}

	.token-name {
		font-size: 1.5rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.75rem;
		line-height: 1.2;
	}

	.token-symbol {
		font-size: 1rem;
		font-weight: var(--font-weight-semibold);
		color: var(--color-secondary);
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
	}

	.token-contract {
		font-size: 0.85rem;
		font-weight: var(--font-weight-medium);
		color: var(--color-secondary);
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		word-break: break-all;
		line-height: 1.4;
		padding: 0.25rem 0;
		opacity: 0.8;
	}

	.asset-header {
		margin-bottom: 1.5rem;
	}

	.asset-status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.status-indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--color-secondary);
	}

	.status-indicator.producing {
		background: #22c55e;
		animation: pulse-status 2s infinite;
	}

	.status-indicator.funding {
		background: #f59e0b;
	}

	.status-indicator.completed {
		background: var(--color-secondary);
	}

	@keyframes pulse-status {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.6; }
	}

	.status-text {
		font-size: 0.75rem;
		font-weight: var(--font-weight-semibold);
		color: var(--color-secondary);
		letter-spacing: 0.05em;
	}

	.asset-name {
		font-size: 1.5rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
		line-height: 1.2;
	}

	.asset-location {
		font-size: 0.9rem;
		color: var(--color-secondary);
		font-weight: var(--font-weight-semibold);
	}

	.asset-description {
		font-size: 0.95rem;
		line-height: 1.6;
		color: var(--color-black);
		margin-bottom: 2rem;
	}

	.token-stats {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-template-rows: repeat(2, 1fr);
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.asset-stats {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.stat-item {
		text-align: left;
	}

	.stat-label {
		font-size: 0.75rem;
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.25rem;
	}

	.stat-value {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
	}

	.token-actions {
		display: flex;
		gap: 1rem;
	}

	.action-button {
		flex: 1;
		padding: 0.75rem 1rem;
		text-decoration: none;
		font-weight: var(--font-weight-semibold);
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-radius: 4px;
		transition: all 0.2s ease;
		text-align: center;
		border: 1px solid transparent;
	}

	.action-button.primary {
		background: var(--color-black);
		color: var(--color-white);
	}

	.action-button.primary:hover {
		background: var(--color-secondary);
	}

	.action-button.secondary {
		background: var(--color-white);
		color: var(--color-black);
		border-color: var(--color-black);
	}

	.action-button.secondary:hover {
		background: var(--color-black);
		color: var(--color-white);
	}

	.asset-meta {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.asset-meta > div {
		display: flex;
		gap: 0.5rem;
	}

	.asset-meta .label {
		font-size: 0.85rem;
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
	}

	.asset-meta .value {
		font-size: 0.85rem;
		color: var(--color-secondary);
	}

	.nav-button {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 48px;
		height: 48px;
		background: rgba(0, 0, 0, 0.7);
		color: var(--color-white);
		border: none;
		border-radius: 50%;
		font-size: 1.5rem;
		cursor: pointer;
		transition: all 0.2s ease;
		z-index: 10;
	}

	.nav-button:hover {
		background: var(--color-black);
		transform: translateY(-50%) scale(1.1);
		backdrop-filter: blur(10px);
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
	}

	.nav-button.prev {
		left: -4rem;
	}

	.nav-button.next {
		right: -4rem;
	}

	.indicators {
		position: absolute;
		bottom: 1.5rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 0.5rem;
		z-index: 10;
	}

	.indicator {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: none;
		background: rgba(255, 255, 255, 0.5);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.indicator.active {
		background: var(--color-white);
		transform: scale(1.2);
		box-shadow: 0 2px 8px rgba(255, 255, 255, 0.4);
	}

	.indicator:hover {
		background: rgba(255, 255, 255, 0.8);
	}

	@media (max-width: 768px) {
		.banner-card {
			grid-template-columns: 1fr;
			min-height: auto;
		}

		.token-section, .asset-section {
			padding: 2rem;
		}

		.token-section {
			border-right: none;
			border-bottom: 1px solid var(--color-light-gray);
		}

		.token-contract {
			font-size: 0.75rem;
		}

		.token-stats, .asset-stats {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.action-button {
			font-size: 0.8rem;
			padding: 0.65rem 0.85rem;
		}

		.nav-button {
			width: 40px;
			height: 40px;
			font-size: 1.25rem;
		}

		.nav-button.prev {
			left: -3rem;
		}

		.nav-button.next {
			right: -3rem;
		}

		.indicators {
			bottom: 1rem;
		}
	}

	@media (max-width: 768px) {
		.carousel-container {
			padding: 0 1rem;
		}
	}

	@media (max-width: 480px) {
		.carousel-container {
			padding: 0 1rem;
		}

		.token-section, .asset-section {
			padding: 1.5rem;
		}

		.token-name, .asset-name {
			font-size: 1.25rem;
		}

		.token-contract {
			font-size: 0.7rem;
		}

		.action-button {
			font-size: 0.75rem;
			padding: 0.6rem 0.8rem;
		}

		.nav-button {
			width: 36px;
			height: 36px;
			font-size: 1.1rem;
		}

		.nav-button.prev {
			left: -2rem;
		}

		.nav-button.next {
			right: -2rem;
		}

		.carousel-wrapper:hover .banner-card {
			transform: none;
		}

		.carousel-slide {
			transform: scale(1);
			opacity: 1;
		}

		.carousel-track {
			transition: transform 0.4s ease;
		}
	}
</style>