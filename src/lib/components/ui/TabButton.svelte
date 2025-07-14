<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { buttons } from '$lib/styles/buttons';
	
	export let active = false;
	export let disabled = false;
	
	const dispatch = createEventDispatcher();
	
	$: classes = active 
		? `${buttons.base} ${buttons.tabActive} ${disabled ? buttons.disabled : ''}`
		: `${buttons.base} ${buttons.tab} ${disabled ? buttons.disabled : ''}`;
</script>

<button
	class={classes}
	{disabled}
	on:click
	on:keydown
>
	<slot />
</button>