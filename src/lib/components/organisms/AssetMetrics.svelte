<!--
@fileoverview AssetMetrics Organism

A comprehensive asset metrics display that combines multiple MetricCard molecules
to show key performance indicators for assets.

@component AssetMetrics
@example
<AssetMetrics assetId="asset-1" />
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import { MetricCard } from '../molecules';
	import { mockAssets, type AssetOverview } from '$lib/data/assets';

	// Local type definitions for metrics
	interface AssetMetrics {
		id: string;
		name: string;
		totalValue: number;
		currentValue: number;
		totalReturn: number;
		monthlyReturn: number;
		efficiency: number;
		uptime: number;
	}

	// Props
	export let assetId: string;

	// State
	let asset: AssetMetrics | null = null;
	let loading = true;
	let error: string | null = null;

	onMount(() => {
		// Find asset from mock data and simulate additional metrics
		const foundAsset = mockAssets.find(a => a.id === assetId);
		
		if (foundAsset) {
			// Simulate loading
			setTimeout(() => {
				asset = {
					id: foundAsset.id,
					name: foundAsset.name,
					totalValue: foundAsset.totalValue,
					currentValue: foundAsset.totalValue * 1.1, // 10% growth
					totalReturn: foundAsset.totalValue * foundAsset.expectedReturn,
					monthlyReturn: foundAsset.totalValue * foundAsset.expectedReturn / 12,
					efficiency: 85 + Math.random() * 10, // Random efficiency 85-95%
					uptime: 90 + Math.random() * 8 // Random uptime 90-98%
				};
				loading = false;
			}, 1000);
		} else {
			error = 'Asset not found';
			loading = false;
		}
	});

	// Computed values
	$: totalReturnPercentage = asset ? ((asset.totalReturn / asset.totalValue) * 100) : 0;
	$: monthlyReturnPercentage = asset ? ((asset.monthlyReturn / asset.currentValue) * 100 * 12) : 0;
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
	{#if loading}
		{#each Array(4) as _}
			<div class="animate-pulse">
				<div class="bg-gray-200 h-32 rounded-lg"></div>
			</div>
		{/each}
	{:else if error}
		<div class="col-span-full bg-red-50 border border-red-200 rounded-lg p-4">
			<p class="text-red-600">Error loading asset metrics: {error}</p>
		</div>
	{:else if asset}
		<MetricCard
			title="Total Value"
			value="${(asset.totalValue / 1000000).toFixed(1)}M"
			icon="DollarSign"
		/>
		
		<MetricCard
			title="Total Return"
			value="{totalReturnPercentage.toFixed(1)}%"
			trend={{ value: totalReturnPercentage, direction: 'up' }}
			icon="TrendingUp"
		/>
		
		<MetricCard
			title="Monthly Return"
			value="{monthlyReturnPercentage.toFixed(1)}%"
			trend={{ value: monthlyReturnPercentage, direction: 'up' }}
			icon="Calendar"
		/>
		
		<MetricCard
			title="Efficiency"
			value="{asset.efficiency.toFixed(1)}%"
			trend={{ value: asset.efficiency > 85 ? 2.1 : -1.2, direction: asset.efficiency > 85 ? 'up' : 'down' }}
			icon="Zap"
		/>
	{:else}
		<div class="col-span-full text-center py-8 text-gray-500">
			No asset data available
		</div>
	{/if}
</div>