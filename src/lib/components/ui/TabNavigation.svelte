<script lang="ts">
	export let tabs: Array<{
		id: string;
		label: string;
		disabled?: boolean;
		badge?: string | number;
	}> = [];
	export let activeTab: string = '';
	export let variant: 'default' | 'minimal' | 'pills' = 'default';
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let fullWidth: boolean = false;
	export let centered: boolean = false;

	// Events
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	function handleTabClick(tabId: string) {
		const tab = tabs.find(t => t.id === tabId);
		if (!tab?.disabled) {
			activeTab = tabId;
			dispatch('tabChange', { tabId });
		}
	}

	function handleKeydown(event: KeyboardEvent, tabId: string) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleTabClick(tabId);
		} else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
			event.preventDefault();
			const currentIndex = tabs.findIndex(t => t.id === activeTab);
			const direction = event.key === 'ArrowLeft' ? -1 : 1;
			let nextIndex = currentIndex + direction;
			
			// Wrap around
			if (nextIndex < 0) nextIndex = tabs.length - 1;
			if (nextIndex >= tabs.length) nextIndex = 0;
			
			// Find next non-disabled tab
			while (tabs[nextIndex]?.disabled && nextIndex !== currentIndex) {
				nextIndex = (nextIndex + direction + tabs.length) % tabs.length;
			}
			
			if (!tabs[nextIndex]?.disabled) {
				handleTabClick(tabs[nextIndex].id);
			}
		}
	}
</script>

<nav 
	class="tab-navigation" 
	class:minimal={variant === 'minimal'}
	class:pills={variant === 'pills'}
	class:small={size === 'small'}
	class:medium={size === 'medium'}
	class:large={size === 'large'}
	class:full-width={fullWidth}
	class:centered
	role="tablist"
>
	{#each tabs as tab (tab.id)}
		<button
			class="tab-btn"
			class:active={activeTab === tab.id}
			class:disabled={tab.disabled}
			disabled={tab.disabled}
			role="tab"
			aria-selected={activeTab === tab.id}
			aria-controls="tabpanel-{tab.id}"
			tabindex={activeTab === tab.id ? 0 : -1}
			on:click={() => handleTabClick(tab.id)}
			on:keydown={(e) => handleKeydown(e, tab.id)}
		>
			{tab.label}
			{#if tab.badge}
				<span class="tab-badge">{tab.badge}</span>
			{/if}
		</button>
	{/each}
</nav>

<style>
	.tab-navigation {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		background: var(--color-white);
		border-bottom: 1px solid var(--color-light-gray);
		overflow-x: auto;
		scroll-behavior: smooth;
	}

	.tab-navigation.full-width {
		width: 100%;
	}

	.tab-navigation.centered {
		justify-content: center;
	}

	.tab-navigation.minimal {
		border-bottom: none;
		background: transparent;
	}

	.tab-navigation.pills {
		background: var(--color-light-gray);
		border-radius: 8px;
		padding: 0.25rem;
		border-bottom: none;
	}

	.tab-btn {
		background: transparent;
		border: none;
		font-family: var(--font-family);
		font-weight: var(--font-weight-bold);
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		position: relative;
	}

	/* Size variants */
	.tab-navigation.small .tab-btn {
		padding: 0.5rem 1rem;
		font-size: 0.7rem;
	}

	.tab-navigation.medium .tab-btn {
		padding: 0.75rem 1.5rem;
		font-size: 0.8rem;
	}

	.tab-navigation.large .tab-btn {
		padding: 1rem 2rem;
		font-size: 0.9rem;
	}

	/* Default variant */
	.tab-navigation:not(.minimal):not(.pills) .tab-btn {
		color: var(--color-black);
		opacity: 0.6;
		border-bottom: 3px solid transparent;
	}

	.tab-navigation:not(.minimal):not(.pills) .tab-btn:hover:not(.active):not(.disabled) {
		opacity: 1;
		background: var(--color-primary);
		color: var(--color-white);
	}

	.tab-navigation:not(.minimal):not(.pills) .tab-btn.active {
		background: var(--color-secondary);
		color: var(--color-white);
		opacity: 1;
		border-bottom-color: var(--color-secondary);
	}

	/* Minimal variant */
	.tab-navigation.minimal .tab-btn {
		color: var(--color-secondary);
		border-bottom: 2px solid transparent;
	}

	.tab-navigation.minimal .tab-btn:hover:not(.active):not(.disabled) {
		color: var(--color-black);
	}

	.tab-navigation.minimal .tab-btn.active {
		color: var(--color-black);
		border-bottom-color: var(--color-primary);
	}

	/* Pills variant */
	.tab-navigation.pills .tab-btn {
		color: var(--color-secondary);
		border-radius: 6px;
	}

	.tab-navigation.pills .tab-btn:hover:not(.active):not(.disabled) {
		background: rgba(255, 255, 255, 0.7);
		color: var(--color-black);
	}

	.tab-navigation.pills .tab-btn.active {
		background: var(--color-white);
		color: var(--color-black);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	/* Disabled state */
	.tab-btn.disabled {
		opacity: 0.3;
		cursor: not-allowed;
		pointer-events: none;
	}

	/* Focus styles */
	.tab-btn:focus {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	/* Badge */
	.tab-badge {
		background: var(--color-primary);
		color: var(--color-white);
		border-radius: 50%;
		font-size: 0.6em;
		font-weight: var(--font-weight-extrabold);
		min-width: 1.2em;
		height: 1.2em;
		display: flex;
		align-items: center;
		justify-content: center;
		text-transform: none;
		letter-spacing: 0;
	}

	.tab-btn.active .tab-badge {
		background: var(--color-white);
		color: var(--color-secondary);
	}

	.tab-navigation.minimal .tab-btn.active .tab-badge {
		background: var(--color-primary);
		color: var(--color-white);
	}

	.tab-navigation.pills .tab-btn.active .tab-badge {
		background: var(--color-primary);
		color: var(--color-white);
	}

	/* Full width tabs */
	.tab-navigation.full-width .tab-btn {
		flex: 1;
		text-align: center;
		justify-content: center;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.tab-navigation {
			gap: 0;
		}

		.tab-navigation:not(.pills) .tab-btn {
			font-size: 0.7rem;
			padding: 0.75rem 1rem;
		}

		.tab-navigation.pills .tab-btn {
			font-size: 0.7rem;
			padding: 0.5rem 0.75rem;
		}

		/* Hide badges on small screens if they make tabs too cramped */
		.tab-badge {
			display: none;
		}
	}

	@media (max-width: 480px) {
		.tab-navigation .tab-btn {
			font-size: 0.65rem;
			padding: 0.5rem 0.75rem;
		}
	}

	/* Scrollbar styling for overflow */
	.tab-navigation::-webkit-scrollbar {
		height: 4px;
	}

	.tab-navigation::-webkit-scrollbar-track {
		background: transparent;
	}

	.tab-navigation::-webkit-scrollbar-thumb {
		background: var(--color-light-gray);
		border-radius: 2px;
	}

	.tab-navigation::-webkit-scrollbar-thumb:hover {
		background: var(--color-secondary);
	}
</style>