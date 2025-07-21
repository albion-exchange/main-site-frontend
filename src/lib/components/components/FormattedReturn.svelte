<script lang="ts">
	import { formatSmartReturn } from '$lib/utils/formatters';
	
	export let value: number | undefined;
	export let showPlus: boolean = false;
	export let threshold: number = 100;
	
	let showTooltip = false;
	
	$: displayValue = formatSmartReturn(value, { threshold, showPlus });
	$: fullValue = value !== undefined ? `${value.toFixed(1)}%` : 'TBD';
	$: shouldShowTooltip = value !== undefined && value >= threshold;
	
	function handleMouseEnter() {
		if (shouldShowTooltip) {
			showTooltip = true;
		}
	}
	
	function handleMouseLeave() {
		showTooltip = false;
	}
</script>

<span 
	class="relative inline-block cursor-help"
	on:mouseenter={handleMouseEnter}
	on:mouseleave={handleMouseLeave}
	role="text"
	aria-label={shouldShowTooltip ? fullValue : displayValue}
>
	{displayValue}
	
	{#if showTooltip && shouldShowTooltip}
		<span 
			class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap z-50 pointer-events-none"
			role="tooltip"
		>
			{showPlus && value > 0 ? '+' : ''}{fullValue}
			<span class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></span>
		</span>
	{/if}
</span>