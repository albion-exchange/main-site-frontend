<script lang="ts">
	import { typography } from '$lib/styles/typography';
	
	export let value: string | number;
	export let label: string;
	export let note: string = '';
	export let size: 'large' | 'medium' | 'small' = 'medium';
	export let valueColor: 'default' | 'primary' | 'positive' | 'negative' = 'default';
	export let center = true;
	
	const sizeClasses = {
		large: typography.metricValueLarge,
		medium: typography.metricValue,
		small: typography.metricValueSmall,
	};
	
	const colorClasses = {
		default: 'text-black',
		primary: 'text-primary',
		positive: 'text-primary',
		negative: 'text-red-600',
	};
	
	$: valueClasses = `${sizeClasses[size]} ${colorClasses[valueColor]} mb-2`;
	$: containerClasses = center ? 'text-center' : '';
</script>

<div class={containerClasses}>
	<div class={valueClasses}>{value}</div>
	<div class={typography.label}>{label}</div>
	{#if note}
		<div class="{typography.meta} mt-1">{note}</div>
	{/if}
</div>