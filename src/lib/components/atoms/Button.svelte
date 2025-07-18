/**
 * @fileoverview Base Button Component (Atom)
 * 
 * A foundational button component that provides consistent styling and behavior
 * across the application. This is an atom-level component that should contain
 * minimal logic and focus on presentation.
 * 
 * @component Button
 * @example
 * <Button variant="primary" size="medium" on:click={handleClick}>
 *   Click me
 * </Button>
 */

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	// Event dispatcher for button interactions
	const dispatch = createEventDispatcher<{
		click: MouseEvent;
	}>();
	
	// Props with clear types and defaults
	export let variant: 'primary' | 'secondary' | 'danger' | 'ghost' = 'primary';
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let disabled = false;
	export let loading = false;
	export let fullWidth = false;
	export let type: 'button' | 'submit' | 'reset' = 'button';
	export let ariaLabel: string | undefined = undefined;
	
	// Computed class based on props
	$: baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
	
	$: variantClasses = {
		primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-sm hover:shadow-md',
		secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500',
		danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm hover:shadow-md',
		ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500'
	}[variant];
	
	$: sizeClasses = {
		small: 'px-3 py-1.5 text-sm',
		medium: 'px-4 py-2 text-base',
		large: 'px-6 py-3 text-lg'
	}[size];
	
	$: widthClasses = fullWidth ? 'w-full' : '';
	
	$: buttonClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${widthClasses}`;
	
	function handleClick(event: MouseEvent) {
		if (!disabled && !loading) {
			dispatch('click', event);
		}
	}
</script>

<button
	{type}
	class={buttonClasses}
	{disabled}
	aria-label={ariaLabel}
	on:click={handleClick}
>
	{#if loading}
		<svg 
			class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
			fill="none" 
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
			<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
		</svg>
		Loading...
	{:else}
		<slot />
	{/if}
</button>