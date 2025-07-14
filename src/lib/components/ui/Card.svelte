<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	// Props
	export let hoverable = true;
	export let clickable = false;
	export let paddingClass = 'p-0';
	export let roundedClass = 'rounded-none';
	export let overflowClass = 'overflow-hidden';
	export let heightClass = '';
	
	const dispatch = createEventDispatcher();
	
	function handleClick(event: MouseEvent) {
		if (clickable) {
			dispatch('click', event);
		}
	}
	
	// Generate Tailwind classes
	$: classes = `border border-light-gray bg-white transition-colors duration-200 relative ${paddingClass} ${roundedClass} ${overflowClass} ${heightClass} ${hoverable ? 'cursor-pointer hover:border-primary' : ''} ${clickable ? 'focus:outline-primary focus:outline-2 focus:outline-offset-2' : ''}`;
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

