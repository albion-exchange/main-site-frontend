<script lang="ts">
	import Button from './Button.svelte';
	
	// Pass through all props except variant
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let fullWidth = false;
	export let disabled = false;
	export let type: 'button' | 'submit' | 'reset' = 'button';
	export let href: string | undefined = undefined;
</script>

<Button
	variant="secondary"
	{size}
	{fullWidth}
	{disabled}
	{type}
	{href}
	on:click
>
	<slot />
</Button>