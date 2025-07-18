<script lang="ts">
	import { onMount } from 'svelte';
	import { useAssetService, useTokenService } from '$lib/services';
	import type { Asset } from '$lib/types/uiTypes';
	import AssetCard from '$lib/components/organisms/assets/AssetCard.svelte';
	import TokenPurchaseWidget from '$lib/components/organisms/TokenPurchaseWidget.svelte';
	import { SecondaryButton, SectionTitle, Card, CardContent } from '$lib/components/atoms';
	import { PageLayout, HeroSection, ContentSection } from '$lib/components/templates';

	let loading = true;
	let allAssets: Asset[] = [];
	let showSoldOutAssets = false;
	
	// Token purchase widget state
	let showPurchaseWidget = false;
	let selectedAssetId: string | null = null;
	
	const assetService = useAssetService();
	const tokenService = useTokenService();

	onMount(async () => {
		try {
			// Load assets from data store
			allAssets = assetService.getAllAssets();
			loading = false;
		} catch (error) {
			console.error('Error loading assets:', error);
			loading = false;
		}
	});

	// Check if an asset has available tokens
	function hasAvailableTokens(asset: Asset): boolean {
		const tokens = tokenService.getTokensByAssetId(asset.id);
		return tokens.some(token => {
			const supply = tokenService.getTokenSupply(token.contractAddress);
			return supply && supply.available > 0;
		});
	}
	
	// Filter assets based on availability
	$: filteredAssets = showSoldOutAssets 
		? allAssets 
		: allAssets.filter(asset => hasAvailableTokens(asset));
	
	// Count sold out assets
	$: soldOutCount = allAssets.filter(asset => !hasAvailableTokens(asset)).length;
	
	function handleBuyTokens(event: CustomEvent) {
		selectedAssetId = event.detail.assetId;
		showPurchaseWidget = true;
	}
	
	function handlePurchaseSuccess(event: CustomEvent) {
		// Purchase successful - could add user notification here
		showPurchaseWidget = false;
	}
	
	function handleWidgetClose() {
		showPurchaseWidget = false;
		selectedAssetId = null;
	}
</script>

<svelte:head>
	<title>Assets - Albion</title>
	<meta name="description" content="Browse available oil field assets for investment" />
</svelte:head>

<PageLayout variant="constrained">
	<!-- Header Section -->
	<HeroSection 
		title="Available Assets"
		subtitle="Discover tokenized oil field investments"
		showBorder={false}
	>
		{#if loading}
			<!-- Loading State -->
			<div class="text-center mt-8">
				<p class="text-base text-black leading-relaxed">Loading assets...</p>
			</div>
		{:else}
			<!-- Assets Grid -->
			<div class="mt-24">
				{#if filteredAssets.length === 0 && !showSoldOutAssets}
					<!-- No Available Assets -->
					<Card>
						<CardContent>
							<div class="text-center">
								<SectionTitle level="h3" size="card">No Available Assets</SectionTitle>
								<p class="text-base text-black leading-relaxed mt-4">All assets are currently sold out.</p>
							</div>
						</CardContent>
					</Card>
				{:else if filteredAssets.length === 0}
					<!-- No Assets Found -->
					<Card>
						<CardContent>
							<div class="text-center">
								<SectionTitle level="h3" size="card">No Assets Found</SectionTitle>
								<p class="text-base text-black leading-relaxed mt-4">Try adjusting your search criteria or filters to find assets.</p>
							</div>
						</CardContent>
					</Card>
				{:else}
					<!-- Assets Grid -->
					<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
						{#each filteredAssets as asset}
							<AssetCard {asset} on:buyTokens={handleBuyTokens} />
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</HeroSection>

	<!-- View Sold Out Assets Toggle -->
	{#if !loading && filteredAssets.length > 0}
		{#if soldOutCount > 0 && !showSoldOutAssets}
			<div class="text-center mt-12">
				<SecondaryButton on:click={() => showSoldOutAssets = true}>
					View Sold Out Assets ({soldOutCount})
				</SecondaryButton>
			</div>
		{:else if showSoldOutAssets && soldOutCount > 0}
			<div class="text-center mt-12">
				<SecondaryButton on:click={() => showSoldOutAssets = false}>
					Hide Sold Out Assets
				</SecondaryButton>
			</div>
		{/if}
	{/if}
</PageLayout>


<!-- Token Purchase Widget -->
<TokenPurchaseWidget 
	bind:isOpen={showPurchaseWidget}
	assetId={selectedAssetId}
	on:purchaseSuccess={handlePurchaseSuccess}
	on:close={handleWidgetClose}
/>

