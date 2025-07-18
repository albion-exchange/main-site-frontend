<script lang="ts">
	import PageHeader from '../atoms/PageHeader.svelte';
	
	export let title: string;
	export let subtitle = '';
	export let showBorder = true;
	export let showButtons = false;
	export let className = '';
	
	$: sectionClasses = `${className || 'py-24'} px-8 text-center bg-white ${showBorder ? 'border-b border-light-gray' : ''}`;
</script>

<section class={sectionClasses}>
	<PageHeader {title} {subtitle} centered maxWidth="xl" />
	{#if showButtons}
		<slot name="buttons" />
	{/if}
	<slot />
</section>