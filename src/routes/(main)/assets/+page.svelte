<script lang="ts">
	import { PageLayout, HeroSection, ContentSection } from '$lib/components/layout';
	import { AssetCard } from '$lib/components/patterns';
	import { getImageUrl } from '$lib/utils/imagePath';
	import { allAssets, isInitialized, platformStats } from '$lib/stores/blockchainStore';
	
	// Filter state
	let sortBy: 'name' | 'apy' | 'recent' = 'name';
	let showFilters = false;
	
	// Get assets from the unified store
	$: assets = $allAssets;
	
	// Sort assets based on selection
	$: sortedAssets = [...assets].sort((a, b) => {
		switch (sortBy) {
			case 'name':
				return a.asset.name.localeCompare(b.asset.name);
			case 'apy':
				// Sort by highest APY (placeholder - would need actual APY calculation)
				return 0;
			case 'recent':
				// Sort by most recent release
				return 0;
			default:
				return 0;
		}
	});
</script>

<svelte:head>
	<title>Invest in Energy Assets - Albion</title>
	<meta name="description" content="Browse and invest in tokenized energy assets with transparent returns and monthly distributions" />
</svelte:head>

<PageLayout variant="default">
	<!-- Hero Section -->
	<HeroSection 
		title="Energy Assets" 
		subtitle="Direct investment in producing energy infrastructure with transparent, monthly distributions"
		showBorder={false}
	/>

	<!-- Platform Stats -->
	{#if $isInitialized}
		<ContentSection background="gray" padding="compact">
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
				<div class="text-center">
					<div class="text-2xl md:text-3xl font-extrabold text-primary">
						${$platformStats.totalInvestedMillions.toFixed(1)}M
					</div>
					<div class="text-sm md:text-base text-black opacity-70">Total Invested</div>
				</div>
				<div class="text-center">
					<div class="text-2xl md:text-3xl font-extrabold text-primary">
						{$platformStats.totalAssets}
					</div>
					<div class="text-sm md:text-base text-black opacity-70">Active Assets</div>
				</div>
				<div class="text-center">
					<div class="text-2xl md:text-3xl font-extrabold text-primary">
						{$platformStats.totalCountries}
					</div>
					<div class="text-sm md:text-base text-black opacity-70">Countries</div>
				</div>
				<div class="text-center">
					<div class="text-2xl md:text-3xl font-extrabold text-primary">
						{$platformStats.totalTokens}
					</div>
					<div class="text-sm md:text-base text-black opacity-70">Token Releases</div>
				</div>
			</div>
		</ContentSection>
	{/if}

	<!-- Asset Grid -->
	<ContentSection background="white" padding="standard">
		<div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
			<h2 class="text-2xl font-extrabold text-black">Available Assets</h2>
			
			<!-- Sort Controls -->
			<div class="flex gap-2">
				<select 
					bind:value={sortBy}
					class="px-4 py-2 border border-light-gray bg-white text-black text-sm"
				>
					<option value="name">Sort by Name</option>
					<option value="apy">Sort by APY</option>
					<option value="recent">Most Recent</option>
				</select>
			</div>
		</div>

		{#if !$isInitialized}
			<!-- Loading State -->
			<div class="text-center py-16">
				<div class="inline-flex items-center gap-3 text-black">
					<svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
							d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
					</svg>
					<span>Loading energy assets...</span>
				</div>
			</div>
		{:else if sortedAssets.length === 0}
			<!-- Empty State -->
			<div class="text-center py-16">
				<p class="text-lg text-black opacity-70">No assets available at this time.</p>
			</div>
		{:else}
			<!-- Asset Grid -->
			<div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
				{#each sortedAssets as assetData}
					<AssetCard 
						asset={assetData.asset}
						token={assetData.tokens}
						energyFieldId={assetData.energyField}
					/>
				{/each}
			</div>
		{/if}
	</ContentSection>
</PageLayout>