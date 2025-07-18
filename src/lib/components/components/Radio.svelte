<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	
	export let value: string = '';
	export let label: string = '';
	export let disabled: boolean = false;
	
	const context = getContext('radioGroup') as {
		name: string;
		selectedValue: Writable<string>;
		updateValue: (value: string) => void;
	};
	
	const { name, selectedValue, updateValue } = context;
	
	$: checked = $selectedValue === value;
	
	function handleChange() {
		if (!disabled) {
			updateValue(value);
		}
	}
</script>

<label class="radio-container" class:disabled>
	<input
		type="radio"
		{name}
		{value}
		{checked}
		{disabled}
		on:change={handleChange}
		class="radio-input"
	/>
	<span class="radio-button"></span>
	{#if label}
		<span class="radio-label">{label}</span>
	{/if}
</label>

<style>
	.radio-container {
		display: inline-flex;
		align-items: center;
		cursor: pointer;
		position: relative;
		user-select: none;
	}
	
	.radio-container.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.radio-input {
		position: absolute;
		opacity: 0;
		cursor: pointer;
		height: 0;
		width: 0;
	}
	
	.radio-button {
		height: 20px;
		width: 20px;
		background-color: #ffffff;
		border: 2px solid #e5e7eb;
		border-radius: 50%;
		display: inline-block;
		position: relative;
		transition: all 0.2s ease;
	}
	
	.radio-input:checked ~ .radio-button {
		border-color: #08bccc;
	}
	
	.radio-input:focus ~ .radio-button {
		box-shadow: 0 0 0 3px rgba(8, 188, 204, 0.1);
	}
	
	.radio-button::after {
		content: '';
		position: absolute;
		display: none;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background-color: #08bccc;
	}
	
	.radio-input:checked ~ .radio-button::after {
		display: block;
	}
	
	.radio-label {
		margin-left: 0.5rem;
		color: #000000;
		font-size: 0.875rem;
		line-height: 1.25rem;
	}
	
	.radio-container:hover:not(.disabled) .radio-button {
		border-color: #08bccc;
	}
</style>