<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { buttons } from '$lib/styles/buttons';
	
	export let active = false;
	export let variant: 'default' | 'primary' = 'default';
	export let disabled = false;
	export let size: 'small' | 'medium' = 'medium';
	
	const dispatch = createEventDispatcher();
	
	$: sizeClasses = size === 'small' ? 'px-4 py-2 text-xs' : 'px-6 py-3 text-sm';
	$: variantClasses = variant === 'primary' ? buttons.controlPrimary : buttons.control;
	$: activeClasses = active && variant === 'default' ? buttons.controlActive : '';
	$: classes = `${buttons.base} ${variantClasses} ${activeClasses} ${sizeClasses} ${disabled ? buttons.disabled : ''}`;
</script>

<button
	class={classes}
	{disabled}
	on:click
	on:keydown
>
	<slot />
</button>