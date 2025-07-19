<script lang="ts">
	import PageHeader from '../components/PageHeader.svelte';
	
	export let title: string;
	export let subtitle = '';
	export let showBorder = true;
	export let showButtons = false;
	export let className = '';
	
	$: sectionClasses = `${className || 'py-24'} text-center bg-white ${showBorder ? 'border-b border-light-gray' : ''}`;
</script>

<section class={sectionClasses}>
	<div class="max-w-6xl mx-auto px-8">
		<PageHeader {title} {subtitle} centered maxWidth="xl" />
		{#if showButtons}
			<slot name="buttons" />
		{/if}
		<slot />
	</div>
</section>