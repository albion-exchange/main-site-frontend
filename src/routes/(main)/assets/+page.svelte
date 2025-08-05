<script lang="ts">
	import { readContract } from '@wagmi/core';
	import { wagmiConfig } from 'svelte-wagmi';
	import { 
		sfts, 
		sftMetadata, 
		sftDataLoading, 
		sftDataError, 
		hasInitialDataLoad,
		sftMetadataLoading,
		sftMetadataError,
		sftsLoading,
		sftsError
	} from '$lib/stores';
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
	let isProcessingAssets = false;
	let hasEverLoaded = false;
	
	// Token purchase widget state
	let showPurchaseWidget = false;
	let selectedAssetId: string | null = null;
	let selectedTokenAddress: string | null = null;

	async function loadTokenAndAssets() {
		try {
			isProcessingAssets = true;
			localError = null;
			
			// Clear previous data to prevent accumulation
			featuredTokensWithAssets = [];
			
			// Check what data we have available
			const hasMetadata = $sftMetadata && $sftMetadata.length > 0;
			const hasSfts = $sfts && $sfts.length > 0;
			
			if (!hasMetadata && !hasSfts) {
				localError = 'No asset data available';
				return;
			}
			
			if (!hasMetadata) {
				localError = 'Metadata not available - showing limited asset information';
			}
			
			if (!hasSfts) {
				localError = 'SFT data not available - cannot load assets';
				return;
			}
			
			// Proceed with available data
			if (hasMetadata && hasSfts) {
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
					} else {
						console.warn(`No metadata found for SFT ${sft.id}`);
					}
				}
				
				// Group the tokens and assets by energy field
				groupedEnergyFields = groupSftsByEnergyField(featuredTokensWithAssets);
				
				// Clear error if we successfully loaded some data
				if (featuredTokensWithAssets.length > 0) {
					localError = null;
				}
			}

		} catch(err) {
			console.error('Featured tokens loading error:', err);
			localError = err instanceof Error ? err.message : 'Failed to load asset data';
					} finally {
				isProcessingAssets = false;
				hasEverLoaded = true;
			}
	}
	
	// Load tokens when ANY data becomes available (partial success)
	$: if(($sfts || $sftMetadata) && $hasInitialDataLoad){
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
		if (!$sftDataLoading && !isProcessingAssets && featuredTokensWithAssets.length > 0) {
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
				{#if $sftDataLoading || isProcessingAssets}
		<!-- Loading State -->
		<LoadingSpinner message="Loading assets..." />
	{:else if $sftDataError && featuredTokensWithAssets.length === 0}
		<!-- Complete Failure - No Data Available -->
		<ContentSection background="white" padding="standard" centered>
			<div class="text-center">
				<div class="text-4xl mb-4">⚠️</div>
				<SectionTitle level="h3" size="card">Unable to Load Assets</SectionTitle>
				<p class="text-sm sm:text-base text-black leading-relaxed mt-4 max-w-md mx-auto">
					{$sftDataError}
				</p>
				<SecondaryButton on:click={() => window.location.reload()} className="mt-6">
					Try Again
				</SecondaryButton>
			</div>
		</ContentSection>
	{:else}
		<!-- Partial Success or Full Success -->
		
		<!-- Show warnings for partial failures -->
		{#if ($sftMetadataError || $sftsError || localError) && featuredTokensWithAssets.length > 0}
			<div class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
				<div class="flex items-start">
					<div class="text-yellow-400 mr-3 text-lg">⚠️</div>
					<div>
						<h4 class="text-yellow-800 font-medium mb-1">Partial Data Loading</h4>
						<p class="text-yellow-700 text-sm">
							{#if $sftMetadataError}
								Metadata: {$sftMetadataError}
							{/if}
							{#if $sftsError}
								SFT Data: {$sftsError}
							{/if}
							{#if localError}
								{localError}
							{/if}
							<br>Some assets may not be displayed with complete information.
						</p>
					</div>
				</div>
			</div>
		{/if}
		<!-- Assets Grid -->
		<div class="mt-12 sm:mt-16 lg:mt-24">
			{#if groupedEnergyFields.length === 0 && hasEverLoaded}
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
			{:else if groupedEnergyFields.length > 0}
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
			{:else if !hasEverLoaded}
				<!-- Still loading initial data -->
				<div class="text-center py-16">
					<LoadingSpinner message="Preparing assets..." showWrapper={false} />
				</div>
			{/if}
		</div>
	{/if}
	</HeroSection>

	<!-- View Sold Out Assets Toggle -->
	{#if !$sftDataLoading && !isProcessingAssets && !($sftDataError || localError) && featuredTokensWithAssets.length > 0}
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

