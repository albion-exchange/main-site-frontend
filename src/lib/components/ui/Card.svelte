<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	// Props
	export let hoverable = true;
	export let clickable = false;
	export let paddingClass = 'p-0';
	export let roundedClass = 'rounded-none';
	export let overflowClass = 'overflow-hidden';
	
	const dispatch = createEventDispatcher();
	
	function handleClick(event: MouseEvent) {
		if (clickable) {
			dispatch('click', event);
		}
	}
	
	// Generate Tailwind classes
	$: classes = `border border-light-gray bg-white shadow-sm transition-all duration-200 relative ${paddingClass} ${roundedClass} ${overflowClass} ${hoverable ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg md:hover:-translate-y-px md:hover:shadow-md' : ''} ${clickable ? 'active:translate-y-0 active:shadow-sm focus:outline-primary focus:outline-2 focus:outline-offset-2' : ''} [@media(hover:none)]:hover:transform-none [@media(hover:none)]:hover:shadow-sm`;
</script>

<article 
	class={classes}
	on:click={handleClick}
	on:keydown
	role={clickable ? 'button' : 'article'}
	{...(clickable ? { tabindex: 0 } : {})}
>
	<slot />
</article>

