<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	export let active = false;
	export let disabled = false;
	
	const dispatch = createEventDispatcher();
	
	$: classes = active 
		? `px-8 py-4 border-b-2 border-secondary bg-secondary text-white font-semibold text-sm uppercase tracking-wider ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
		: `px-8 py-4 no-underline font-semibold text-sm uppercase tracking-wider transition-colors duration-200 inline-block border-b-2 border-transparent hover:text-secondary ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
</script>

<button
	class={classes}
	{disabled}
	on:click
	on:keydown
>
	<slot />
</button>