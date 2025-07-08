<script lang="ts">
	export let isOpen: boolean = false;
	export let title: string = '';
	export let size: 'small' | 'medium' | 'large' | 'full' = 'medium';
	export let centered: boolean = true;
	export let closable: boolean = true;
	export let closeOnOverlayClick: boolean = true;
	export let closeOnEscape: boolean = true;
	export let showHeader: boolean = true;
	export let showFooter: boolean = false;
	export let maxHeight: string = '90vh';

	// Events
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	const dispatch = createEventDispatcher();

	let modalElement: HTMLDivElement;
	let previouslyFocused: HTMLElement | null = null;

	function closeModal() {
		if (closable) {
			isOpen = false;
			dispatch('close');
		}
	}

	function handleOverlayClick(event: MouseEvent) {
		if (closeOnOverlayClick && event.target === event.currentTarget) {
			closeModal();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (closeOnEscape && event.key === 'Escape') {
			closeModal();
		}
		
		// Trap focus within modal
		if (event.key === 'Tab') {
			trapFocus(event);
		}
	}

	function trapFocus(event: KeyboardEvent) {
		if (!modalElement) return;

		const focusableElements = modalElement.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);
		const firstElement = focusableElements[0] as HTMLElement;
		const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

		if (event.shiftKey) {
			if (document.activeElement === firstElement) {
				lastElement?.focus();
				event.preventDefault();
			}
		} else {
			if (document.activeElement === lastElement) {
				firstElement?.focus();
				event.preventDefault();
			}
		}
	}

	function handleModalOpen() {
		if (isOpen) {
			previouslyFocused = document.activeElement as HTMLElement;
			document.body.style.overflow = 'hidden';
			
			// Focus the modal after it's rendered
			setTimeout(() => {
				const firstFocusable = modalElement?.querySelector(
					'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
				) as HTMLElement;
				
				if (firstFocusable) {
					firstFocusable.focus();
				} else {
					modalElement?.focus();
				}
			}, 100);
		} else {
			document.body.style.overflow = '';
			if (previouslyFocused) {
				previouslyFocused.focus();
				previouslyFocused = null;
			}
		}
	}

	$: if (typeof window !== 'undefined') {
		handleModalOpen();
	}

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			document.body.style.overflow = '';
		}
	});
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div 
		class="modal-overlay" 
		class:centered
		on:click={handleOverlayClick}
	>
		<div 
			bind:this={modalElement}
			class="modal" 
			class:small={size === 'small'}
			class:medium={size === 'medium'}
			class:large={size === 'large'}
			class:full={size === 'full'}
			style="max-height: {maxHeight};"
			role="dialog" 
			aria-modal="true" 
			aria-labelledby={title ? 'modal-title' : undefined}
			tabindex="0"
			on:click|stopPropagation
		>
			{#if showHeader}
				<div class="modal-header">
					{#if title}
						<h3 id="modal-title" class="modal-title">{title}</h3>
					{:else}
						<div class="modal-title-slot">
							<slot name="title" />
						</div>
					{/if}
					
					{#if closable}
						<button 
							class="modal-close" 
							on:click={closeModal}
							aria-label="Close modal"
						>
							×
						</button>
					{/if}
				</div>
			{/if}

			<div class="modal-content">
				<slot />
			</div>

			{#if showFooter || $$slots.footer}
				<div class="modal-footer">
					<slot name="footer" />
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		z-index: 1000;
		overflow-y: auto;
		padding: 1rem;
		box-sizing: border-box;
	}

	.modal-overlay.centered {
		align-items: center;
		justify-content: center;
	}

	.modal-overlay:not(.centered) {
		align-items: flex-start;
		justify-content: center;
		padding-top: 2rem;
	}

	.modal {
		background: var(--color-white);
		border: 2px solid var(--color-black);
		width: 100%;
		max-height: 100%;
		overflow-y: auto;
		position: relative;
		display: flex;
		flex-direction: column;
		animation: modalSlide 0.2s ease-out;
	}

	/* Size variants */
	.modal.small {
		max-width: 400px;
	}

	.modal.medium {
		max-width: 600px;
	}

	.modal.large {
		max-width: 900px;
	}

	.modal.full {
		max-width: 95vw;
		max-height: 95vh;
	}

	@keyframes modalSlide {
		from {
			transform: translateY(-20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem 2rem;
		border-bottom: 1px solid var(--color-light-gray);
		flex-shrink: 0;
	}

	.modal-title {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.modal-title-slot {
		flex: 1;
	}

	.modal-close {
		background: none;
		border: none;
		font-size: 1.5rem;
		color: var(--color-black);
		cursor: pointer;
		padding: 0;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: opacity 0.2s ease;
		border-radius: 4px;
	}

	.modal-close:hover {
		opacity: 0.7;
		background: var(--color-light-gray);
	}

	.modal-close:focus {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	.modal-content {
		padding: 2rem;
		flex: 1;
		overflow-y: auto;
		min-height: 0; /* Allow content to shrink */
	}

	.modal-footer {
		padding: 1rem 2rem 1.5rem;
		border-top: 1px solid var(--color-light-gray);
		flex-shrink: 0;
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		align-items: center;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.modal-overlay {
			padding: 0.5rem;
		}

		.modal-overlay:not(.centered) {
			padding-top: 1rem;
		}

		.modal {
			max-width: 100%;
			border: none;
			border-top: 2px solid var(--color-black);
		}

		.modal.full {
			max-width: 100%;
			max-height: 100%;
			height: 100%;
		}

		.modal-header {
			padding: 1rem 1.5rem;
		}

		.modal-content {
			padding: 1.5rem;
		}

		.modal-footer {
			padding: 1rem 1.5rem;
			flex-direction: column-reverse;
			gap: 0.5rem;
		}

		.modal-footer :global(button) {
			width: 100%;
		}

		.modal-title {
			font-size: 1.1rem;
		}
	}

	@media (max-width: 480px) {
		.modal-overlay {
			padding: 0;
		}

		.modal {
			height: 100%;
			max-height: 100vh;
		}

		.modal-header {
			padding: 0.75rem 1rem;
		}

		.modal-content {
			padding: 1rem;
		}

		.modal-footer {
			padding: 0.75rem 1rem;
		}
	}

	/* High contrast mode */
	@media (prefers-contrast: high) {
		.modal {
			border-width: 3px;
		}
		
		.modal-header,
		.modal-footer {
			border-width: 2px;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.modal {
			animation: none;
		}
	}

	/* Focus styles */
	.modal:focus {
		outline: none;
	}

	/* Ensure modal content doesn't overflow */
	.modal-content :global(*) {
		max-width: 100%;
	}

	/* Dark mode support (if implemented) */
	@media (prefers-color-scheme: dark) {
		.modal-overlay {
			background: rgba(0, 0, 0, 0.8);
		}
	}
</style>