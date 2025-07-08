<script lang="ts">
	export let status: string;
	export let variant: 'default' | 'producing' | 'funding' | 'completed' | 'available' | 'claimed' | 'pending' = 'default';
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let uppercase: boolean = true;
	export let showIcon: boolean = false;
	export let animated: boolean = false;

	// Auto-detect variant from status if not explicitly set
	$: computedVariant = variant === 'default' ? getVariantFromStatus(status) : variant;

	function getVariantFromStatus(status: string): typeof variant {
		const statusLower = status.toLowerCase();
		if (statusLower.includes('producing')) return 'producing';
		if (statusLower.includes('funding')) return 'funding';
		if (statusLower.includes('completed')) return 'completed';
		if (statusLower.includes('available')) return 'available';
		if (statusLower.includes('claimed')) return 'claimed';
		if (statusLower.includes('pending')) return 'pending';
		return 'default';
	}

	function getIcon(variant: string): string {
		switch (variant) {
			case 'producing': return '●';
			case 'funding': return '◐';
			case 'completed': return '✓';
			case 'available': return '◯';
			case 'claimed': return '✓';
			case 'pending': return '⏳';
			default: return '●';
		}
	}
</script>

<span 
	class="status-badge" 
	class:small={size === 'small'}
	class:medium={size === 'medium'}
	class:large={size === 'large'}
	class:producing={computedVariant === 'producing'}
	class:funding={computedVariant === 'funding'}
	class:completed={computedVariant === 'completed'}
	class:available={computedVariant === 'available'}
	class:claimed={computedVariant === 'claimed'}
	class:pending={computedVariant === 'pending'}
	class:animated={animated && computedVariant === 'producing'}
>
	{#if showIcon}
		<span class="status-icon">{getIcon(computedVariant)}</span>
	{/if}
	{uppercase ? status.toUpperCase() : status}
</span>

<style>
	.status-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		background: var(--color-light-gray);
		color: var(--color-secondary);
		padding: 0.25rem 0.5rem;
		font-size: 0.7rem;
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-radius: 0.25rem;
		white-space: nowrap;
	}

	/* Size variants */
	.status-badge.small {
		padding: 0.125rem 0.375rem;
		font-size: 0.6rem;
	}

	.status-badge.medium {
		padding: 0.25rem 0.5rem;
		font-size: 0.7rem;
	}

	.status-badge.large {
		padding: 0.375rem 0.75rem;
		font-size: 0.8rem;
	}

	/* Status variants */
	.status-badge.producing {
		background: #dcfce7;
		color: #16a34a;
		border: 1px solid #bbf7d0;
	}

	.status-badge.funding {
		background: #fef3c7;
		color: #d97706;
		border: 1px solid #fed7aa;
	}

	.status-badge.completed {
		background: var(--color-light-gray);
		color: var(--color-primary);
		border: 1px solid var(--color-primary);
	}

	.status-badge.available {
		background: #dbeafe;
		color: var(--color-primary);
		border: 1px solid #93c5fd;
	}

	.status-badge.claimed {
		background: #dcfce7;
		color: #16a34a;
		border: 1px solid #bbf7d0;
	}

	.status-badge.pending {
		background: #f3f4f6;
		color: #6b7280;
		border: 1px solid #d1d5db;
	}

	/* Animation for producing status */
	.status-badge.animated {
		position: relative;
		overflow: hidden;
	}

	.status-badge.animated::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(255, 255, 255, 0.4),
			transparent
		);
		animation: shine 2s infinite;
	}

	@keyframes shine {
		0% {
			left: -100%;
		}
		100% {
			left: 100%;
		}
	}

	/* Status icon */
	.status-icon {
		font-size: 0.8em;
	}

	/* Pulse animation for producing status with icon */
	.status-badge.producing .status-icon {
		animation: pulse-status 2s infinite;
	}

	@keyframes pulse-status {
		0%, 100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.7;
			transform: scale(1.1);
		}
	}

	/* Hover effects */
	.status-badge:hover {
		filter: brightness(0.95);
	}

	/* Accessibility */
	@media (prefers-reduced-motion: reduce) {
		.status-badge.animated::before,
		.status-badge.producing .status-icon {
			animation: none;
		}
	}
</style>