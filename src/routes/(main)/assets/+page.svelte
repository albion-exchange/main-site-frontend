<script lang="ts">
	import { readContract } from '@wagmi/core';
	import { wagmiConfig } from 'svelte-wagmi';
	import { sfts, sftMetadata, sftDataLoading, sftDataError, hasInitialDataLoad } from '$lib/stores';
	import type { Asset } from '$lib/types/uiTypes';
	import AssetCard from '$lib/components/patterns/assets/AssetCard.svelte';
	import TokenPurchaseWidget from '$lib/components/patterns/TokenPurchaseWidget.svelte';
	import { SecondaryButton, SectionTitle, Card, CardContent, LoadingSpinner } from '$lib/components/components';
	import { PageLayout, HeroSection, ContentSection } from '$lib/components/layout';
    import { decodeSftInformation } from '$lib/decodeMetadata/helpers';
	import type { Hex } from 'viem';
    import { generateAssetInstanceFromSftMeta, generateTokenMetadataInstanceFromSft } from '$lib/decodeMetadata/addSchemaToReceipts';
	import authorizerAbi from '$lib/abi/authorizer.json';
    import type { TokenMetadata } from '$lib/types/MetaboardTypes';
	import { groupSftsByEnergyField, type GroupedEnergyField } from '$lib/utils/energyFieldGrouping';

	let showSoldOutAssets = false;
	let featuredTokensWithAssets: Array<{ token: TokenMetadata; asset: Asset }> = [];
	let groupedEnergyFields: GroupedEnergyField[] = [];
	let localError: string | null = null;
	
	// Token purchase widget state
	let showPurchaseWidget = false;
	let selectedAssetId: string | null = null;
	let selectedTokenAddress: string | null = null;

	async function loadTokenAndAssets() {
		try {
			localError = null;
			
			// Clear previous data to prevent accumulation
			featuredTokensWithAssets = [];
			
			if($sftMetadata && $sfts) {
				const deocdedMeta = $sftMetadata.map((metaV1) => decodeSftInformation(metaV1));
				for(const sft of $sfts) {
					const pinnedMetadata: any = deocdedMeta.find(
						(meta) => meta?.contractAddress === `0x000000000000000000000000${sft.id.slice(2)}`
					);
					if(pinnedMetadata) {
						try {
							const sftMaxSharesSupply = await readContract($wagmiConfig, {
								abi: authorizerAbi,
								address: sft.activeAuthorizer?.address as Hex,
								functionName: 'maxSharesSupply',
								args: []
							}) as bigint;
							
							const tokenInstance = generateTokenMetadataInstanceFromSft(sft, pinnedMetadata, sftMaxSharesSupply.toString());
							const assetInstance = generateAssetInstanceFromSftMeta(sft, pinnedMetadata);
		
							featuredTokensWithAssets.push({ token: tokenInstance, asset: assetInstance });
						} catch (contractError) {
							console.warn(`Failed to load contract data for SFT ${sft.id}:`, contractError);
							// Continue with other SFTs even if one fails
						}
					}
				}
				
				// Group the tokens and assets by energy field
				groupedEnergyFields = groupSftsByEnergyField(featuredTokensWithAssets);
			}

		} catch(err) {
			console.error('Featured tokens loading error:', err);
			localError = err instanceof Error ? err.message : 'Failed to load asset data';
		}
	}
	
	// Load tokens when data becomes available
	$: if($sfts && $sftMetadata && $hasInitialDataLoad){
		loadTokenAndAssets();
	}

	// Check if an energy field group has available tokens
	function hasAvailableTokens(group: GroupedEnergyField): boolean {
		return group.tokens.some(token => {
			const hasAvailable = BigInt(token.supply.maxSupply) > BigInt(token.supply.mintedSupply);
			return hasAvailable;
		});
	}
	
	// Filter and group assets based on availability
	$: {
		if (!$sftDataLoading && featuredTokensWithAssets.length > 0) {
			const filteredTokensWithAssets = showSoldOutAssets 
				? featuredTokensWithAssets 
				: featuredTokensWithAssets.filter(item => {
					const hasAvailable = BigInt(item.token.supply.maxSupply) > BigInt(item.token.supply.mintedSupply);
					return hasAvailable;
				});
			
			groupedEnergyFields = groupSftsByEnergyField(filteredTokensWithAssets);
		}
	}
	
	// Count sold out assets
	$: soldOutCount = featuredTokensWithAssets.filter(item => {
		const hasAvailable = BigInt(item.token.supply.maxSupply) > BigInt(item.token.supply.mintedSupply);
		return !hasAvailable;
	}).length;
	
	function handleBuyTokens(event: CustomEvent) {
		selectedAssetId = event.detail.assetId;
		selectedTokenAddress = event.detail.tokenAddress;
		showPurchaseWidget = true;
	}
	
	function handlePurchaseSuccess(event: CustomEvent) {
		// Purchase successful - could add user notification here
		showPurchaseWidget = false;
	}
	
	function handleWidgetClose() {
		showPurchaseWidget = false;
		selectedAssetId = null;
		selectedTokenAddress = null;
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
		subtitle="Browse live energy investment opportunities with real-time production data and transparent returns"
		showBorder={false}
	>
				{#if $sftDataLoading}
		<!-- Loading State -->
		<LoadingSpinner message="Loading assets..." />
	{:else if $sftDataError || localError}
		<!-- Error State -->
		<ContentSection background="white" padding="standard" centered>
			<div class="text-center">
				<div class="text-4xl mb-4">⚠️</div>
				<SectionTitle level="h3" size="card">Unable to Load Assets</SectionTitle>
				<p class="text-sm sm:text-base text-black leading-relaxed mt-4 max-w-md mx-auto">
					{$sftDataError || localError}
				</p>
				<SecondaryButton on:click={() => window.location.reload()} className="mt-6">
					Try Again
				</SecondaryButton>
			</div>
		</ContentSection>
	{:else}
		<!-- Assets Grid -->
		<div class="mt-12 sm:mt-16 lg:mt-24">
			{#if groupedEnergyFields.length === 0}
				<!-- No Available Assets -->
				<Card>
					<CardContent>
						<div class="text-center py-8">
							<SectionTitle level="h3" size="card">No Available Assets</SectionTitle>
							<p class="text-sm sm:text-base text-black leading-relaxed mt-4">
								{showSoldOutAssets ? 'No assets found.' : 'All assets are currently sold out.'}
							</p>
						</div>
					</CardContent>
				</Card>
			{:else}
				<!-- Grouped Assets by Energy Field -->
				<div class="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 items-stretch">
					{#each groupedEnergyFields as energyField}
						<AssetCard 
							asset={energyField.asset} 
							token={energyField.tokens} 
							energyFieldId={energyField.id}
							on:buyTokens={handleBuyTokens} 
						/>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
	</HeroSection>

	<!-- View Sold Out Assets Toggle -->
	{#if !$sftDataLoading && !($sftDataError || localError) && featuredTokensWithAssets.length > 0}
		{#if soldOutCount > 0 && !showSoldOutAssets}
			<div class="text-center mt-8 sm:mt-12">
				<SecondaryButton on:click={() => showSoldOutAssets 	= true}>
					View Sold Out Assets ({soldOutCount})
				</SecondaryButton>
			</div>
		{:else if showSoldOutAssets && soldOutCount > 0}
			<div class="text-center mt-8 sm:mt-12">
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
	tokenAddress={selectedTokenAddress}
	assetId={selectedAssetId}
	on:purchaseSuccess={handlePurchaseSuccess}
	on:close={handleWidgetClose}
/>

