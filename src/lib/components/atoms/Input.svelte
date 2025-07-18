<!--
@fileoverview Base Input Component (Atom)

A foundational input component that provides consistent styling and behavior
for all form inputs across the application.

@component Input
@example
<Input 
  type="email" 
  placeholder="Enter your email"
  bind:value={email}
  error={emailError}
/>
-->

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	// Event dispatcher for input interactions
	const dispatch = createEventDispatcher<{
		input: { value: string };
		focus: FocusEvent;
		blur: FocusEvent;
		keydown: KeyboardEvent;
	}>();
	
	// Props with clear types and defaults
	export let type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' = 'text';
	export let value = '';
	export let placeholder = '';
	export let disabled = false;
	export let required = false;
	export let readonly = false;
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let error: string | null = null;
	export let success = false;
	export let id: string | undefined = undefined;
	export let name: string | undefined = undefined;
	export let autocomplete: string | undefined = undefined;
	export let ariaLabel: string | undefined = undefined;
	export let ariaDescribedBy: string | undefined = undefined;
	
	// Input element reference
	let inputElement: HTMLInputElement;
	
	// Computed classes based on props
	$: baseClasses = 'block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
	
	$: stateClasses = error 
		? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
		: success
		? 'border-green-300 text-green-900 placeholder-green-300 focus:border-green-500 focus:ring-green-500'
		: 'border-gray-300 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500';
	
	$: sizeClasses = {
		small: 'px-3 py-1.5 text-sm',
		medium: 'px-3 py-2 text-base',
		large: 'px-4 py-3 text-lg'
	}[size];
	
	$: inputClasses = `${baseClasses} ${stateClasses} ${sizeClasses}`;
	
	// Event handlers
	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = target.value;
		dispatch('input', { value });
	}
	
	function handleFocus(event: FocusEvent) {
		dispatch('focus', event);
	}
	
	function handleBlur(event: FocusEvent) {
		dispatch('blur', event);
	}
	
	function handleKeydown(event: KeyboardEvent) {
		dispatch('keydown', event);
	}
	
	// Public methods for external control
	export function focus() {
		inputElement?.focus();
	}
	
	export function blur() {
		inputElement?.blur();
	}
	
	export function select() {
		inputElement?.select();
	}
</script>

<div class="relative">
	<input
		bind:this={inputElement}
		{type}
		{value}
		{placeholder}
		{disabled}
		{required}
		{readonly}
		{id}
		{name}
		{autocomplete}
		class={inputClasses}
		aria-label={ariaLabel}
		aria-describedby={ariaDescribedBy}
		aria-invalid={error ? 'true' : 'false'}
		on:input={handleInput}
		on:focus={handleFocus}
		on:blur={handleBlur}
		on:keydown={handleKeydown}
	/>
	
	{#if error}
		<div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
			<svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
				<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
			</svg>
		</div>
	{:else if success}
		<div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
			<svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
				<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
			</svg>
		</div>
	{/if}
</div>