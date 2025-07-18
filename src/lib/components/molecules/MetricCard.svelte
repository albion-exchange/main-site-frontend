/**
 * @fileoverview MetricCard Component (Molecule)
 * 
 * A metric card molecule that displays a key metric with optional icon,
 * description, and change indicator. Used throughout the dashboard.
 * 
 * @component MetricCard
 * @example
 * <MetricCard 
 *   title="Total Assets"
 *   value="$2.4M"
 *   icon="building"
 *   trend={{ value: 12.5, direction: 'up' }}
 * />
 */

<script lang="ts">
	import { Icon } from '../atoms';
	import type * as lucide from 'lucide-svelte';
	
	// Type definitions
	interface Trend {
		value: number;
		direction: 'up' | 'down' | 'neutral';
		label?: string;
	}
	
	// Props
	export let title: string;
	export let value: string | number;
	export let description: string | null = null;
	export let icon: keyof typeof lucide | null = null;
	export let trend: Trend | null = null;
	export let loading = false;
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' = 'default';
	
	// Computed classes
	$: sizeClasses = {
		small: 'p-4',
		medium: 'p-6',
		large: 'p-8'
	}[size];
	
	$: variantClasses = {
		default: 'bg-white border-gray-200',
		primary: 'bg-blue-50 border-blue-200',
		success: 'bg-green-50 border-green-200',
		warning: 'bg-yellow-50 border-yellow-200',
		danger: 'bg-red-50 border-red-200'
	}[variant];
	
	$: cardClasses = `${sizeClasses} ${variantClasses} rounded-lg border shadow-sm`;
	
	$: titleSize = {
		small: 'text-sm',
		medium: 'text-base',
		large: 'text-lg'
	}[size];
	
	$: valueSize = {
		small: 'text-lg',
		medium: 'text-2xl',
		large: 'text-3xl'
	}[size];
	
	$: iconSize = {
		small: 'small',
		medium: 'medium',
		large: 'large'
	}[size] as 'small' | 'medium' | 'large';
	
	// Trend formatting
	$: trendColor = trend?.direction === 'up' 
		? 'text-green-600' 
		: trend?.direction === 'down' 
		? 'text-red-600' 
		: 'text-gray-500';
	
	$: trendIcon = trend?.direction === 'up' 
		? 'TrendingUp' 
		: trend?.direction === 'down' 
		? 'TrendingDown' 
		: 'Minus';
	
	// Format trend value
	$: formattedTrendValue = trend ? `${trend.value > 0 ? '+' : ''}${trend.value}%` : '';
</script>

<div class={cardClasses}>
	{#if loading}
		<div class="animate-pulse">
			<div class="flex items-start justify-between">
				<div class="space-y-2 flex-1">
					<div class="h-4 bg-gray-200 rounded w-1/2"></div>
					<div class="h-8 bg-gray-200 rounded w-3/4"></div>
					{#if description}
						<div class="h-3 bg-gray-200 rounded w-full"></div>
					{/if}
				</div>
				{#if icon}
					<div class="w-6 h-6 bg-gray-200 rounded"></div>
				{/if}
			</div>
		</div>
	{:else}
		<div class="flex items-start justify-between">
			<div class="space-y-1 flex-1">
				<h3 class={`font-medium text-gray-700 ${titleSize}`}>
					{title}
				</h3>
				
				<div class={`font-bold text-gray-900 ${valueSize}`}>
					{value}
				</div>
				
				{#if description}
					<p class="text-sm text-gray-600">
						{description}
					</p>
				{/if}
				
				{#if trend}
					<div class={`flex items-center space-x-1 text-sm ${trendColor}`}>
						<Icon name={trendIcon} size="xs" />
						<span>{formattedTrendValue}</span>
						{#if trend.label}
							<span class="text-gray-500">vs {trend.label}</span>
						{/if}
					</div>
				{/if}
			</div>
			
			{#if icon}
				<div class="flex-shrink-0">
					<Icon 
						name={icon} 
						size={iconSize}
						color="gray" 
					/>
				</div>
			{/if}
		</div>
	{/if}
</div>