<script lang="ts">
	import { formatNumber, formatSmartNumber, formatCurrency, formatTokenSupply } from '$lib/utils/formatters';
	
	export let value: number | string;
	export let type: 'number' | 'currency' | 'token' = 'number';
	export let compact: boolean = true;
	export let threshold: number = 10000;
	export let decimals: number = 1;
	export let prefix: string = '';
	export let suffix: string = '';
	
	let showTooltip = false;
	let tooltipElement: HTMLElement;
	
	// Convert string to number if needed
	$: numValue = typeof value === 'string' ? parseFloat(value) : value;
	
	// Format the display value
	$: displayValue = (() => {
		if (!compact) {
			if (type === 'currency') {
				return formatCurrency(numValue);
			}
			return formatNumber(numValue);
		}
		
		switch (type) {
			case 'currency':
				return formatCurrency(numValue, { compact: true });
			case 'token':
				return formatTokenSupply(numValue, { decimals });
			default:
				return formatSmartNumber(numValue, { threshold, decimals, prefix, suffix });
		}
	})();
	
	// Format the full value for tooltip
	$: fullValue = (() => {
		switch (type) {
			case 'currency':
				return formatCurrency(numValue, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
			case 'token':
				return formatNumber(numValue, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
			default:
				return prefix + formatNumber(numValue, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + suffix;
		}
	})();
	
	// Only show tooltip if the value is actually compacted
	$: shouldShowTooltip = compact && (
		(type === 'currency' && numValue >= 1000000) ||
		(type === 'token' && numValue >= threshold) ||
		(type === 'number' && numValue >= threshold)
	);
	
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
			bind:this={tooltipElement}
			class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap z-50 pointer-events-none"
			role="tooltip"
		>
			{fullValue}
			<span class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></span>
		</span>
	{/if}
</span>