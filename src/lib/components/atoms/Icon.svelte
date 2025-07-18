/**
 * @fileoverview Base Icon Component (Atom)
 * 
 * A foundational icon component that provides consistent sizing and styling
 * for all icons across the application using Lucide icons.
 * 
 * @component Icon
 * @example
 * <Icon name="user" size="medium" color="gray" />
 */

<script lang="ts">
	import * as lucide from 'lucide-svelte';
	
	// Props with clear types and defaults
	export let name: keyof typeof lucide;
	export let size: 'xs' | 'small' | 'medium' | 'large' | 'xl' = 'medium';
	export let color: 'current' | 'gray' | 'blue' | 'green' | 'red' | 'yellow' | 'purple' = 'current';
	export let strokeWidth = 2;
	export let ariaLabel: string | undefined = undefined;
	export let ariaHidden = true;
	
	// Get the icon component dynamically
	$: IconComponent = lucide[name];
	
	// Computed classes based on props
	$: sizeClasses = {
		xs: 'w-3 h-3',
		small: 'w-4 h-4',
		medium: 'w-5 h-5',
		large: 'w-6 h-6',
		xl: 'w-8 h-8'
	}[size];
	
	$: colorClasses = {
		current: 'text-current',
		gray: 'text-gray-500',
		blue: 'text-blue-500',
		green: 'text-green-500',
		red: 'text-red-500',
		yellow: 'text-yellow-500',
		purple: 'text-purple-500'
	}[color];
	
	$: iconClasses = `${sizeClasses} ${colorClasses}`;
</script>

{#if IconComponent}
	<svelte:component 
		this={IconComponent} 
		class={iconClasses}
		stroke-width={strokeWidth}
		aria-label={ariaLabel}
		aria-hidden={ariaHidden}
	/>
{:else}
	<!-- Fallback for missing icons -->
	<div 
		class={`${sizeClasses} ${colorClasses} border border-current rounded flex items-center justify-center text-xs`}
		aria-label={ariaLabel || `Missing icon: ${name}`}
	>
		?
	</div>
{/if}