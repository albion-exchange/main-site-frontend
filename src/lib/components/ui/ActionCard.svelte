<script lang="ts">
	export let title: string;
	export let description: string;
	export let icon: string = '';
	export let actionText: string = 'Action';
	export let actionVariant: 'primary' | 'secondary' | 'claim' | 'manage' = 'primary';
	export let href: string | undefined = undefined;
	export let disabled: boolean = false;
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let centered: boolean = true;
	
	// Events
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	function handleAction() {
		if (!disabled) {
			dispatch('action');
		}
	}
</script>

<div 
	class="action-card" 
	class:small={size === 'small'}
	class:medium={size === 'medium'}
	class:large={size === 'large'}
	class:centered
>
	{#if icon}
		<div class="action-icon">{icon}</div>
	{/if}
	
	<h4 class="action-title">{title}</h4>
	
	<p class="action-description">{description}</p>
	
	{#if href}
		<a 
			{href} 
			class="action-btn {actionVariant}"
			class:disabled
		>
			{actionText}
		</a>
	{:else}
		<button 
			class="action-btn {actionVariant}"
			class:disabled
			{disabled}
			on:click={handleAction}
		>
			{actionText}
		</button>
	{/if}
</div>

<style>
	.action-card {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		padding: 2rem;
		border-radius: 8px;
		transition: all 0.2s ease;
	}

	.action-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
	}

	.action-card.centered {
		text-align: center;
	}

	/* Size variants */
	.action-card.small {
		padding: 1rem;
	}

	.action-card.medium {
		padding: 2rem;
	}

	.action-card.large {
		padding: 2.5rem;
	}

	.action-icon {
		font-size: 2rem;
		margin: 0 auto 1rem;
		display: block;
	}

	.action-card.small .action-icon {
		font-size: 1.5rem;
		margin-bottom: 0.75rem;
	}

	.action-card.large .action-icon {
		font-size: 2.5rem;
		margin-bottom: 1.25rem;
	}

	.action-title {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
		text-transform: uppercase;
		font-size: 0.9rem;
		letter-spacing: 0.05em;
		line-height: 1.2;
	}

	.action-card.small .action-title {
		font-size: 0.8rem;
		margin-bottom: 0.375rem;
	}

	.action-card.large .action-title {
		font-size: 1rem;
		margin-bottom: 0.625rem;
	}

	.action-description {
		font-size: 0.85rem;
		color: var(--color-black);
		opacity: 0.7;
		margin-bottom: 1.5rem;
		line-height: 1.4;
	}

	.action-card.small .action-description {
		font-size: 0.8rem;
		margin-bottom: 1rem;
	}

	.action-card.large .action-description {
		font-size: 0.9rem;
		margin-bottom: 1.75rem;
	}

	.action-btn {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		border: none;
		font-family: var(--font-family);
		font-weight: var(--font-weight-extrabold);
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		transition: all 0.2s ease;
		text-decoration: none;
		border-radius: 4px;
		text-align: center;
		min-width: 120px;
	}

	.action-card.small .action-btn {
		padding: 0.5rem 1rem;
		font-size: 0.75rem;
		min-width: 100px;
	}

	.action-card.large .action-btn {
		padding: 1rem 2rem;
		font-size: 0.85rem;
		min-width: 140px;
	}

	/* Button variants */
	.action-btn.primary {
		background: var(--color-black);
		color: var(--color-white);
	}

	.action-btn.primary:hover:not(.disabled) {
		background: var(--color-secondary);
	}

	.action-btn.secondary {
		background: var(--color-white);
		color: var(--color-black);
		border: 1px solid var(--color-black);
	}

	.action-btn.secondary:hover:not(.disabled) {
		background: var(--color-black);
		color: var(--color-white);
	}

	.action-btn.claim {
		background: var(--color-primary);
		color: var(--color-white);
	}

	.action-btn.claim:hover:not(.disabled) {
		background: var(--color-secondary);
	}

	.action-btn.manage {
		background: var(--color-black);
		color: var(--color-white);
		width: 100%;
	}

	.action-btn.manage:hover:not(.disabled) {
		background: var(--color-secondary);
	}

	.action-btn.disabled {
		opacity: 0.5;
		cursor: not-allowed;
		pointer-events: none;
	}

	/* Focus states for accessibility */
	.action-btn:focus {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.action-card {
			padding: 1.5rem;
		}

		.action-card.large {
			padding: 2rem;
		}

		.action-icon {
			font-size: 1.75rem;
		}

		.action-title {
			font-size: 0.85rem;
		}

		.action-description {
			font-size: 0.8rem;
		}

		.action-btn {
			width: 100%;
			min-width: auto;
		}
	}
</style>