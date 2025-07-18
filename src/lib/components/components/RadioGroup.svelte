<script lang="ts">
	import { setContext, createEventDispatcher } from 'svelte';
	import { writable } from 'svelte/store';
	
	export let name: string = '';
	export let value: string = '';
	
	const dispatch = createEventDispatcher();
	const selectedValue = writable(value);
	
	$: selectedValue.set(value);
	
	setContext('radioGroup', {
		name,
		selectedValue,
		updateValue: (newValue: string) => {
			value = newValue;
			selectedValue.set(newValue);
			dispatch('input', newValue);
			dispatch('change', newValue);
		}
	});
</script>

<div class="radio-group" role="radiogroup">
	<slot />
</div>

<style>
	.radio-group {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
</style>