<script lang="ts">
	import SectionTitle from './SectionTitle.svelte';
	
	export let title: string;
	export let subtitle: string = '';
	export let centered = true;
	export let showDivider = false;
	export let maxWidth: 'sm' | 'md' | 'lg' | 'xl' = 'lg';
	
	const maxWidthClasses = {
		sm: 'max-w-2xl',
		md: 'max-w-3xl',
		lg: 'max-w-4xl',
		xl: 'max-w-6xl'
	};
	
	$: containerClasses = `${maxWidthClasses[maxWidth]} ${centered ? 'mx-auto text-center' : ''} mb-8`;
</script>

<header class={containerClasses}>
	<SectionTitle level="h1" size="page" center={centered}>{title}</SectionTitle>
	{#if subtitle}
		<p class="text-base md:text-lg leading-relaxed text-black mt-4 font-figtree {centered ? 'mx-auto' : ''}">
			{subtitle}
		</p>
	{/if}
	{#if showDivider}
		<div class="border-b border-light-gray mt-8"></div>
	{/if}
</header>

<style>
	p {
		max-width: 48rem; /* max-w-3xl equivalent */
	}
</style>