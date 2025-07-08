<script lang="ts">
	export let value: string | number;
	export let label: string;
	export let note: string = '';
	export let subtitle: string = '';
	export let variant: 'default' | 'positive' | 'negative' | 'primary' | 'available' | 'unclaimed' | 'payout' = 'default';
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let clickable: boolean = false;
	export let centered: boolean = true;

	// Events
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	function handleClick() {
		if (clickable) {
			dispatch('click');
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (clickable && (event.key === 'Enter' || event.key === ' ')) {
			event.preventDefault();
			dispatch('click');
		}
	}
</script>

<div 
	class="metric" 
	class:clickable
	class:centered
	class:small={size === 'small'}
	class:medium={size === 'medium'}
	class:large={size === 'large'}
	on:click={handleClick}
	on:keydown={handleKeydown}
	role={clickable ? 'button' : undefined}
	tabindex={clickable ? 0 : undefined}
>
	<div class="metric-value" class:positive={variant === 'positive'} class:negative={variant === 'negative'} class:primary={variant === 'primary'} class:available={variant === 'available'} class:unclaimed={variant === 'unclaimed'} class:payout={variant === 'payout'}>
		{value}
	</div>
	<div class="metric-label">{label}</div>
	{#if note}
		<div class="metric-note" class:positive={variant === 'positive'} class:negative={variant === 'negative'}>
			{note}
		</div>
	{/if}
	{#if subtitle}
		<div class="metric-subtitle">{subtitle}</div>
	{/if}
</div>

<style>
	.metric {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.25rem;
	}

	.metric.centered {
		align-items: center;
		text-align: center;
	}

	.metric.clickable {
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.metric.clickable:hover {
		transform: translateY(-2px);
		background-color: var(--color-light-gray);
		padding: 0.5rem;
		border-radius: 8px;
	}

	.metric.clickable:focus {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
		border-radius: 8px;
	}

	.metric-value {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
		line-height: 1;
	}

	/* Size variants */
	.metric.small .metric-value {
		font-size: 1rem;
	}

	.metric.medium .metric-value {
		font-size: 1.5rem;
	}

	.metric.large .metric-value {
		font-size: 2rem;
	}

	/* Color variants */
	.metric-value.positive {
		color: var(--color-primary);
	}

	.metric-value.negative {
		color: #dc2626;
	}

	.metric-value.primary {
		color: var(--color-primary);
	}

	.metric-value.available {
		color: var(--color-primary);
	}

	.metric-value.unclaimed {
		color: var(--color-primary);
	}

	.metric-value.payout {
		color: var(--color-primary);
	}

	.metric-label {
		font-size: 0.7rem;
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.25rem;
	}

	.metric.small .metric-label {
		font-size: 0.65rem;
	}

	.metric.medium .metric-label {
		font-size: 0.7rem;
	}

	.metric.large .metric-label {
		font-size: 0.8rem;
	}

	.metric-note {
		font-size: 0.65rem;
		color: var(--color-secondary);
		font-weight: var(--font-weight-medium);
	}

	.metric-note.positive {
		color: var(--color-primary);
	}

	.metric-note.negative {
		color: #dc2626;
	}

	.metric-subtitle {
		font-size: 0.7rem;
		color: var(--color-secondary);
		font-weight: var(--font-weight-medium);
		margin-top: 0.25rem;
	}

	.metric.large .metric-note,
	.metric.large .metric-subtitle {
		font-size: 0.75rem;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.metric.large .metric-value {
			font-size: 1.5rem;
		}
		
		.metric.medium .metric-value {
			font-size: 1.25rem;
		}
	}
</style>