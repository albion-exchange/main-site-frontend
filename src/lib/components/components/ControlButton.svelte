<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	export let active = false;
	export let variant: 'default' | 'primary' = 'default';
	export let disabled = false;
	export let size: 'small' | 'medium' = 'medium';
	
	const dispatch = createEventDispatcher();
	
	$: sizeClasses = size === 'small' ? 'px-4 py-2 text-xs' : 'px-6 py-3 text-sm';
	$: variantClasses = variant === 'primary' ? 'bg-primary text-white border-primary hover:bg-secondary hover:border-secondary' : 'px-6 py-3 font-semibold text-sm uppercase tracking-wider transition-all duration-200 border-2 bg-white text-black border-light-gray hover:bg-light-gray';
	$: activeClasses = active && variant === 'default' ? 'px-6 py-3 font-semibold text-sm uppercase tracking-wider transition-all duration-200 border-2 bg-secondary text-white border-secondary' : '';
	$: disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
	$: classes = `${variantClasses} ${activeClasses} ${sizeClasses} ${disabledClasses}`.trim();
</script>

<button
	class={classes}
	{disabled}
	on:click
	on:keydown
>
	<slot />
</button>