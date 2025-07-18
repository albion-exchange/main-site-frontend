<script lang="ts">
	// import { onMount } from 'svelte';
	// import dataStoreService from '$lib/services/DataStoreService';
	import type { Asset, Token } from '$lib/types/uiTypes';
	import AssetCard from '$lib/components/assets/AssetCard.svelte';
	import TokenPurchaseWidget from '$lib/components/TokenPurchaseWidget.svelte';
	import { readContract } from '@wagmi/core';
	import { signerAddress, wagmiConfig, chainId } from 'svelte-wagmi';
	import { SecondaryButton, SectionTitle, Card, CardContent } from '$lib/components/ui';
	import { PageLayout, HeroSection, ContentSection } from '$lib/components/layout';
    import { sfts, sftMetadata } from '$lib/stores';
    import { decodeSftInformation } from '$lib/decodeMetadata/helpers';
    import { generateAssetInstanceFromSftMeta, generateTokenInstanceFromSft } from '$lib/decodeMetadata/addSchemaToReceipts';
    import type { Hex } from 'viem';

	let loading = true;
	// let allAssets: Asset[] = [];
	let showSoldOutAssets = false;
	let featuredTokensWithAssets: Array<{ token: Token; asset: Asset }> = [];
	let filteredAssets: Array<{ token: Token; asset: Asset }> = [];
	
	// Token purchase widget state
	let showPurchaseWidget = false;
	let selectedAssetId: string | null = null;

	async function loadTokenAndAssets() {
		try {
			loading = true;
			if($sftMetadata && $sfts) {
				const deocdedMeta = $sftMetadata.map((metaV1) => decodeSftInformation(metaV1));
				for(const sft of $sfts) {
					const pinnedMetadata: any = deocdedMeta.find(
						(meta) => meta?.contractAddress === `0x000000000000000000000000${sft.id.slice(2)}`
					);
					if(pinnedMetadata) {
	
						const sftMaxSharesSupply = await readContract($wagmiConfig, {
							abi: [{
									"inputs": [],
									"name": "maxSharesSupply",
									"outputs": [
										{
											"internalType": "uint256",
											"name": "",
											"type": "uint256"
										}
									],
									"stateMutability": "view",
									"type": "function"
								}],

								
							address: sft.activeAuthorizer?.address as Hex,
							functionName: 'maxSharesSupply',
							args: []
						});
						
						const tokenInstance = generateTokenInstanceFromSft(sft, sftMaxSharesSupply.toString());
						const assetInstance = generateAssetInstanceFromSftMeta(sft, pinnedMetadata);
	
						featuredTokensWithAssets.push({ token: tokenInstance, asset: assetInstance });
					
					}
				}
			}
			loading = false;

		} catch(err) {
			console.error('Featured tokens loading error:', err);
			loading = false;
		}
	}
	$: if($sfts && $sftMetadata){
		loadTokenAndAssets();
	}
	// Check if an asset has available tokens
	function hasAvailableTokens(asset: { token: Token; asset: Asset }): boolean {
		const hasAvailable = BigInt(asset.token.supply.maxSupply) > BigInt(asset.token.supply.mintedSupply);
		return hasAvailable;
	}
	
	// Filter assets based on availability
	$: {
		if (!loading) {
			filteredAssets = showSoldOutAssets 
				? featuredTokensWithAssets 
				: featuredTokensWithAssets.filter(asset => hasAvailableTokens(asset));
		}
	}
	
	// Count sold out assets
	$: soldOutCount = featuredTokensWithAssets.filter(asset => !hasAvailableTokens(asset)).length;
	
	function handleBuyTokens(event: CustomEvent) {
		selectedAssetId = event.detail.assetId;
		showPurchaseWidget = true;
	}
	
	function handlePurchaseSuccess(event: CustomEvent) {
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
	/>

	{#if loading}
		<!-- Loading State -->
		<ContentSection background="white" padding="standard" centered>
			<p class="text-base text-black leading-relaxed">Loading assets...</p>
		</ContentSection>
	{:else}
		<!-- Assets Section -->
		<ContentSection background="white" padding="standard" maxWidth={false}>
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
						<AssetCard asset={asset.asset} token={asset.token} on:buyTokens={handleBuyTokens} />
					{/each}
				</div>
			{/if}
			
			<!-- View Sold Out Assets Toggle -->
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
		</ContentSection>
	{/if}
</PageLayout>


<!-- Token Purchase Widget -->
<TokenPurchaseWidget 
	bind:isOpen={showPurchaseWidget}
	assetId={selectedAssetId}
	on:purchaseSuccess={handlePurchaseSuccess}
	on:close={handleWidgetClose}
/>

