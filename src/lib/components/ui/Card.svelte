<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	// Props
	export let hoverable = true;
	export let clickable = false;
	export let padding = '0';
	export let borderRadius = '0';
	export let overflow = 'hidden';
	
	const dispatch = createEventDispatcher();
	
	function handleClick(event: MouseEvent) {
		if (clickable) {
			dispatch('click', event);
		}
	}
</script>

<article 
	class="card"
	class:hoverable
	class:clickable
	style:padding={padding}
	style:border-radius={borderRadius}
	style:overflow={overflow}
	on:click={handleClick}
	on:keydown
	role={clickable ? 'button' : 'article'}
	{...(clickable ? { tabindex: 0 } : {})}
>
	<slot />
</article>

<style>
	.card {
		border: 1px solid var(--color-light-gray, #e2e8f0);
		background: white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s ease, box-shadow 0.2s ease;
		position: relative;
	}
	
	.card.hoverable {
		cursor: pointer;
	}
	
	.card.hoverable:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}
	
	.card.clickable:active {
		transform: translateY(0);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}
	
	/* Focus styles for accessibility */
	.card.clickable:focus {
		outline: 2px solid var(--color-primary-blue, #08bccc);
		outline-offset: 2px;
	}
	
	/* Disable hover effects on touch devices */
	@media (hover: none) {
		.card.hoverable:hover {
			transform: none;
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		}
	}
</style>