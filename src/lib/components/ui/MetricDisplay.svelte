<script lang="ts">
	
	export let value: string | number;
	export let label: string;
	export let note: string = '';
	export let size: 'large' | 'medium' | 'small' = 'medium';
	export let valueColor: 'default' | 'primary' | 'positive' | 'negative' = 'default';
	export let center = true;
	
	const sizeClasses = {
		large: 'text-3xl font-extrabold text-black',
		medium: 'text-2xl font-extrabold text-black',
		small: 'text-xl font-extrabold text-black',
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
	<div class="text-xs font-bold text-black uppercase tracking-wider">{label}</div>
	{#if note}
		<div class="text-xs text-black opacity-70 mt-1">{note}</div>
	{/if}
</div>