/**
 * @fileoverview AssetMetrics Component (Organism)
 * 
 * An asset metrics organism that displays multiple asset-related metrics
 * in a grid layout using MetricCard molecules. This component contains
 * business logic for formatting and displaying asset data.
 * 
 * @component AssetMetrics
 * @example
 * <AssetMetrics {asset} loading={false} />
 */

<script lang="ts">
	import { MetricCard } from '../molecules';
	import { useAssetMetrics } from '$lib/composables/useAssetMetrics';
	import type { Asset } from '$lib/types/uiTypes';
	
	// Props
	export let asset: Asset;
	export let loading = false;
	export let variant: 'default' | 'compact' = 'default';
	
	// Use asset metrics composable for business logic
	const {
		totalValue,
		monthlyRevenue,
		uptime,
		roi,
		productionMetrics,
		operationalMetrics
	} = useAssetMetrics(asset);
	
	// Computed grid layout based on variant
	$: gridClasses = variant === 'compact' 
		? 'grid grid-cols-2 md:grid-cols-4 gap-4'
		: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6';
	
	$: cardSize = variant === 'compact' ? 'small' : 'medium';
	
	// Metric definitions with computed values
	$: metrics = [
		{
			title: 'Asset Value',
			value: $totalValue.formatted,
			icon: 'Building' as const,
			trend: $totalValue.trend,
			description: 'Current market value'
		},
		{
			title: 'Monthly Revenue',
			value: $monthlyRevenue.formatted,
			icon: 'DollarSign' as const,
			trend: $monthlyRevenue.trend,
			description: 'Latest month revenue'
		},
		{
			title: 'Uptime',
			value: $uptime.formatted,
			icon: 'Activity' as const,
			trend: $uptime.trend,
			description: 'Operational uptime',
			variant: $uptime.value >= 95 ? 'success' : $uptime.value >= 90 ? 'warning' : 'danger'
		},
		{
			title: 'ROI',
			value: $roi.formatted,
			icon: 'TrendingUp' as const,
			trend: $roi.trend,
			description: 'Return on investment',
			variant: $roi.value > 0 ? 'success' : 'danger'
		}
	];
	
	// Additional metrics for expanded view
	$: additionalMetrics = variant === 'default' ? [
		{
			title: 'Production Rate',
			value: $productionMetrics.rate.formatted,
			icon: 'Gauge' as const,
			description: 'Current production rate'
		},
		{
			title: 'Efficiency',
			value: $operationalMetrics.efficiency.formatted,
			icon: 'Zap' as const,
			description: 'Operational efficiency'
		}
	] : [];
</script>

<div class="space-y-6">
	<!-- Primary metrics -->
	<div>
		{#if variant === 'default'}
			<h3 class="text-lg font-semibold text-gray-900 mb-4">Asset Performance</h3>
		{/if}
		
		<div class={gridClasses}>
			{#each metrics as metric}
				<MetricCard
					title={metric.title}
					value={metric.value}
					icon={metric.icon}
					trend={metric.trend}
					description={metric.description}
					variant={metric.variant || 'default'}
					size={cardSize}
					{loading}
				/>
			{/each}
		</div>
	</div>
	
	<!-- Additional metrics for expanded view -->
	{#if additionalMetrics.length > 0}
		<div>
			<h4 class="text-md font-medium text-gray-800 mb-3">Additional Metrics</h4>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				{#each additionalMetrics as metric}
					<MetricCard
						title={metric.title}
						value={metric.value}
						icon={metric.icon}
						description={metric.description}
						size="small"
						{loading}
					/>
				{/each}
			</div>
		</div>
	{/if}
	
	<!-- Loading state overlay -->
	{#if loading}
		<div class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
			<div class="flex items-center space-x-2 text-gray-600">
				<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
				<span>Loading metrics...</span>
			</div>
		</div>
	{/if}
</div>