<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	// Props
	export let variant: 'primary' | 'secondary' = 'primary';
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let fullWidth = false;
	export let disabled = false;
	export let type: 'button' | 'submit' | 'reset' = 'button';
	export let href: string | undefined = undefined;
	
	const dispatch = createEventDispatcher();
	
	function handleClick(event: MouseEvent) {
		if (!disabled) {
			dispatch('click', event);
		}
	}
	
	// Size mappings
	const sizeClasses = {
		small: 'btn-small',
		medium: 'btn-medium',
		large: 'btn-large'
	};
	
	$: classes = `btn btn-${variant} ${sizeClasses[size]} ${fullWidth ? 'btn-full-width' : ''} ${disabled ? 'btn-disabled' : ''}`;
</script>

{#if href && !disabled}
	<a 
		{href}
		class={classes}
		on:click={handleClick}
	>
		<slot />
	</a>
{:else}
	<button
		{type}
		{disabled}
		class={classes}
		on:click={handleClick}
	>
		<slot />
	</button>
{/if}

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-weight: var(--font-weight-semibold, 600);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		text-decoration: none;
		cursor: pointer;
		transition: all 0.2s ease;
		border: 2px solid;
		border-radius: 0; /* Sharp corners */
		white-space: nowrap;
		position: relative;
		overflow: hidden;
	}
	
	/* Size variants */
	.btn-small {
		padding: 0.5rem 1rem;
		font-size: 0.75rem;
	}
	
	.btn-medium {
		padding: 0.75rem 1.5rem;
		font-size: 0.875rem;
	}
	
	.btn-large {
		padding: 1rem 2rem;
		font-size: 1rem;
	}
	
	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.btn-small {
			padding: 0.5rem 0.875rem;
			font-size: 0.7rem;
		}
		
		.btn-medium {
			padding: 0.625rem 1.25rem;
			font-size: 0.8rem;
		}
		
		.btn-large {
			padding: 0.875rem 1.75rem;
			font-size: 0.9rem;
		}
	}
	
	/* Primary variant - black background, white text */
	.btn-primary {
		background: var(--color-black, #000000);
		color: var(--color-white, #ffffff);
		border-color: var(--color-black, #000000);
	}
	
	.btn-primary:hover:not(.btn-disabled) {
		background: #283c84;
		border-color: #283c84;
	}
	
	.btn-primary:active:not(.btn-disabled) {
		transform: translateY(1px);
	}
	
	/* Secondary variant - white background, black text */
	.btn-secondary {
		background: var(--color-white, #ffffff);
		color: var(--color-black, #000000);
		border-color: var(--color-black, #000000);
	}
	
	.btn-secondary:hover:not(.btn-disabled) {
		background: #08bccc;
		color: var(--color-white, #ffffff);
		border-color: #08bccc;
	}
	
	.btn-secondary:active:not(.btn-disabled) {
		transform: translateY(1px);
	}
	
	/* Full width variant */
	.btn-full-width {
		width: 100%;
	}
	
	/* Disabled state */
	.btn-disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.btn-disabled:hover {
		background: inherit;
		color: inherit;
		border-color: inherit;
	}
	
	/* Focus state for accessibility */
	.btn:focus {
		outline: 2px solid var(--color-primary-blue, #08bccc);
		outline-offset: 2px;
	}
	
	/* Remove default button styles */
	button.btn {
		font-family: inherit;
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
	}
</style>