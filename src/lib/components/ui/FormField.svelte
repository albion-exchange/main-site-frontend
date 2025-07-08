<script lang="ts">
	export let label: string = '';
	export let type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'textarea' | 'select' = 'text';
	export let placeholder: string = '';
	export let value: string | number = '';
	export let required: boolean = false;
	export let disabled: boolean = false;
	export let readonly: boolean = false;
	export let error: string = '';
	export let helpText: string = '';
	export let id: string = '';
	export let name: string = '';
	export let rows: number = 4; // For textarea
	export let options: Array<{label: string, value: string | number}> = []; // For select
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let fullWidth: boolean = true;
	export let variant: 'default' | 'minimal' | 'bordered' = 'default';

	// Generate unique ID if not provided
	import { createEventDispatcher } from 'svelte';
	
	const dispatch = createEventDispatcher();
	const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
		value = target.value;
		dispatch('input', { value, event });
	}

	function handleChange(event: Event) {
		const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
		value = target.value;
		dispatch('change', { value, event });
	}

	function handleBlur(event: FocusEvent) {
		dispatch('blur', { value, event });
	}

	function handleFocus(event: FocusEvent) {
		dispatch('focus', { value, event });
	}
</script>

<div 
	class="form-field" 
	class:small={size === 'small'}
	class:medium={size === 'medium'}
	class:large={size === 'large'}
	class:full-width={fullWidth}
	class:minimal={variant === 'minimal'}
	class:bordered={variant === 'bordered'}
	class:has-error={error}
	class:disabled
>
	{#if label}
		<label for={fieldId} class="field-label">
			{label}
			{#if required}
				<span class="required-indicator">*</span>
			{/if}
		</label>
	{/if}

	<div class="field-wrapper">
		{#if type === 'textarea'}
			<textarea
				{...$$restProps}
				id={fieldId}
				{name}
				{placeholder}
				{required}
				{disabled}
				{readonly}
				{rows}
				{value}
				class="field-input"
				on:input={handleInput}
				on:change={handleChange}
				on:blur={handleBlur}
				on:focus={handleFocus}
			></textarea>
		{:else if type === 'select'}
			<select
				{...$$restProps}
				id={fieldId}
				{name}
				{required}
				{disabled}
				{value}
				class="field-input"
				on:change={handleChange}
				on:blur={handleBlur}
				on:focus={handleFocus}
			>
				{#if placeholder}
					<option value="" disabled selected={!value}>{placeholder}</option>
				{/if}
				{#each options as option}
					<option value={option.value} selected={value === option.value}>
						{option.label}
					</option>
				{/each}
			</select>
		{:else}
			<input
				{...$$restProps}
				{type}
				id={fieldId}
				{name}
				{placeholder}
				{required}
				{disabled}
				{readonly}
				{value}
				class="field-input"
				on:input={handleInput}
				on:change={handleChange}
				on:blur={handleBlur}
				on:focus={handleFocus}
			/>
		{/if}
	</div>

	{#if helpText && !error}
		<div class="help-text">{helpText}</div>
	{/if}

	{#if error}
		<div class="error-text" role="alert">{error}</div>
	{/if}
</div>

<style>
	.form-field {
		display: flex;
		flex-direction: column;
		margin-bottom: 1rem;
	}

	.form-field.full-width {
		width: 100%;
	}

	.form-field.disabled {
		opacity: 0.6;
		pointer-events: none;
	}

	.field-label {
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.form-field.small .field-label {
		font-size: 0.8rem;
		margin-bottom: 0.375rem;
	}

	.form-field.large .field-label {
		font-size: 1rem;
		margin-bottom: 0.625rem;
	}

	.required-indicator {
		color: #dc2626;
		font-weight: var(--font-weight-bold);
	}

	.field-wrapper {
		position: relative;
	}

	.field-input {
		width: 100%;
		border: 1px solid var(--color-light-gray);
		font-family: var(--font-family);
		font-size: 0.9rem;
		color: var(--color-black);
		background: var(--color-white);
		transition: all 0.2s ease;
		box-sizing: border-box;
	}

	/* Size variants */
	.form-field.small .field-input {
		padding: 0.5rem 0.75rem;
		font-size: 0.8rem;
	}

	.form-field.medium .field-input {
		padding: 0.75rem 1rem;
		font-size: 0.9rem;
	}

	.form-field.large .field-input {
		padding: 1rem 1.25rem;
		font-size: 1rem;
	}

	/* Style variants */
	.form-field:not(.minimal):not(.bordered) .field-input {
		border-radius: 0;
		border: 1px solid var(--color-light-gray);
	}

	.form-field.minimal .field-input {
		border: none;
		border-bottom: 1px solid var(--color-light-gray);
		border-radius: 0;
		background: transparent;
	}

	.form-field.bordered .field-input {
		border: 2px solid var(--color-light-gray);
		border-radius: 4px;
	}

	/* Focus states */
	.field-input:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.form-field.minimal .field-input:focus {
		border-bottom-color: var(--color-primary);
	}

	.form-field.bordered .field-input:focus {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 2px rgba(8, 188, 204, 0.1);
	}

	/* Error states */
	.form-field.has-error .field-input {
		border-color: #dc2626;
	}

	.form-field.has-error.bordered .field-input {
		box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.1);
	}

	/* Disabled states */
	.field-input:disabled {
		background: #f9fafb;
		color: #6b7280;
		cursor: not-allowed;
	}

	/* Textarea specific */
	textarea.field-input {
		resize: vertical;
		min-height: 100px;
		line-height: 1.5;
	}

	/* Select specific */
	select.field-input {
		cursor: pointer;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpolyline points='6,9 12,15 18,9'%3E%3C/polyline%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.75rem center;
		background-size: 1rem;
		appearance: none;
		padding-right: 2.5rem;
	}

	/* Help and error text */
	.help-text,
	.error-text {
		font-size: 0.75rem;
		margin-top: 0.375rem;
		line-height: 1.4;
	}

	.help-text {
		color: var(--color-secondary);
	}

	.error-text {
		color: #dc2626;
		font-weight: var(--font-weight-medium);
	}

	/* Placeholder styling */
	.field-input::placeholder {
		color: #9ca3af;
		opacity: 1;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.form-field {
			margin-bottom: 1.25rem;
		}

		.field-label {
			font-size: 0.85rem;
		}

		.field-input {
			font-size: 16px; /* Prevents zoom on iOS */
		}
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.field-input {
			border-width: 2px;
		}
		
		.field-input:focus {
			border-width: 3px;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.field-input {
			transition: none;
		}
	}
</style>