<script lang="ts">
	import Label from './Label.svelte';
	
	export let label: string;
	export let value: string | number;
	export let valueColor: 'default' | 'primary' | 'secondary' | 'success' | 'danger' = 'default';
	export let size: 'small' | 'medium' = 'medium';
	
	const valueColorClasses = {
		default: 'text-black',
		primary: 'text-primary',
		secondary: 'text-secondary',
		success: 'text-green-600',
		danger: 'text-red-600'
	};
	
	const sizeClasses = {
		small: 'text-sm',
		medium: 'text-base'
	};
</script>

<div class="flex justify-between items-center {sizeClasses[size]}">
	<Label variant="muted" size={size === 'small' ? 'xs' : 'sm'}>{label}</Label>
	<span class="{valueColorClasses[valueColor]} font-semibold">{value}</span>
</div>