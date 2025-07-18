<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	export let checked: boolean = false;
	export let disabled: boolean = false;
	export let label: string = '';
	export let name: string = '';
	export let value: string = '';
	
	const dispatch = createEventDispatcher();
	
	function handleChange(event: Event) {
		const target = event.target as HTMLInputElement;
		checked = target.checked;
		dispatch('change', { checked, value });
	}
</script>

<label class="checkbox-container" class:disabled>
	<input
		type="checkbox"
		{checked}
		{disabled}
		{name}
		{value}
		on:change={handleChange}
		class="checkbox-input"
	/>
	<span class="checkbox-box"></span>
	{#if label}
		<span class="checkbox-label">{label}</span>
	{/if}
</label>

<style>
	.checkbox-container {
		display: inline-flex;
		align-items: center;
		cursor: pointer;
		position: relative;
		user-select: none;
	}
	
	.checkbox-container.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.checkbox-input {
		position: absolute;
		opacity: 0;
		cursor: pointer;
		height: 0;
		width: 0;
	}
	
	.checkbox-box {
		height: 20px;
		width: 20px;
		background-color: #ffffff;
		border: 2px solid #e5e7eb;
		border-radius: 4px;
		display: inline-block;
		position: relative;
		transition: all 0.2s ease;
	}
	
	.checkbox-input:checked ~ .checkbox-box {
		background-color: #08bccc;
		border-color: #08bccc;
	}
	
	.checkbox-input:focus ~ .checkbox-box {
		box-shadow: 0 0 0 3px rgba(8, 188, 204, 0.1);
	}
	
	.checkbox-box::after {
		content: '';
		position: absolute;
		display: none;
		left: 6px;
		top: 2px;
		width: 5px;
		height: 10px;
		border: solid white;
		border-width: 0 2px 2px 0;
		transform: rotate(45deg);
	}
	
	.checkbox-input:checked ~ .checkbox-box::after {
		display: block;
	}
	
	.checkbox-label {
		margin-left: 0.5rem;
		color: #000000;
		font-size: 0.875rem;
		line-height: 1.25rem;
	}
	
	.checkbox-container:hover:not(.disabled) .checkbox-box {
		border-color: #08bccc;
	}
</style>