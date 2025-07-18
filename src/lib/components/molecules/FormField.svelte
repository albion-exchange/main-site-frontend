/**
 * @fileoverview FormField Component (Molecule)
 * 
 * A form field molecule that combines Label and Input atoms with error handling
 * and help text. This provides a consistent form field experience across the app.
 * 
 * @component FormField
 * @example
 * <FormField 
 *   label="Email Address"
 *   type="email"
 *   bind:value={email}
 *   error={errors.email}
 *   required
 * />
 */

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Label, Input } from '../atoms';
	
	// Event dispatcher
	const dispatch = createEventDispatcher<{
		input: { value: string };
		focus: FocusEvent;
		blur: FocusEvent;
	}>();
	
	// Props
	export let label: string;
	export let type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' = 'text';
	export let value = '';
	export let placeholder = '';
	export let disabled = false;
	export let required = false;
	export let readonly = false;
	export let error: string | null = null;
	export let success = false;
	export let helpText: string | null = null;
	export let id: string | undefined = undefined;
	export let name: string | undefined = undefined;
	export let autocomplete: string | undefined = undefined;
	
	// Generate unique ID if not provided
	$: fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
	$: helpTextId = helpText ? `${fieldId}-help` : undefined;
	$: errorId = error ? `${fieldId}-error` : undefined;
	$: describedBy = [helpTextId, errorId].filter(Boolean).join(' ') || undefined;
	
	// Input reference for external control
	let inputRef: Input;
	
	// Event handlers
	function handleInput(event: CustomEvent<{ value: string }>) {
		value = event.detail.value;
		dispatch('input', event.detail);
	}
	
	function handleFocus(event: CustomEvent<FocusEvent>) {
		dispatch('focus', event.detail);
	}
	
	function handleBlur(event: CustomEvent<FocusEvent>) {
		dispatch('blur', event.detail);
	}
	
	// Public methods
	export function focus() {
		inputRef?.focus();
	}
	
	export function blur() {
		inputRef?.blur();
	}
	
	export function select() {
		inputRef?.select();
	}
</script>

<div class="space-y-1">
	<Label 
		htmlFor={fieldId} 
		{required}
		color={error ? 'error' : success ? 'success' : 'default'}
	>
		{label}
	</Label>
	
	<Input
		bind:this={inputRef}
		{type}
		{value}
		{placeholder}
		{disabled}
		{required}
		{readonly}
		{error}
		{success}
		id={fieldId}
		{name}
		{autocomplete}
		ariaDescribedBy={describedBy}
		on:input={handleInput}
		on:focus={handleFocus}
		on:blur={handleBlur}
	/>
	
	{#if helpText && !error}
		<p id={helpTextId} class="text-sm text-gray-600">
			{helpText}
		</p>
	{/if}
	
	{#if error}
		<p id={errorId} class="text-sm text-red-600" role="alert">
			{error}
		</p>
	{/if}
</div>