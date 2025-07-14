<script lang="ts">
	import { typography } from '$lib/styles/typography';
	
	export let level: 'h1' | 'h2' | 'h3' = 'h2';
	export let size: 'page' | 'section' | 'card' | 'subsection' = 'section';
	export let center = false;
	export let className = '';
	
	const sizeClasses = {
		page: typography.pageTitle,
		section: typography.sectionTitle,
		card: typography.cardTitle,
		subsection: typography.subsectionTitle,
	};
	
	$: classes = `${sizeClasses[size]} ${center ? 'text-center' : ''} ${className}`;
</script>

{#if level === 'h1'}
	<h1 class={classes}><slot /></h1>
{:else if level === 'h2'}
	<h2 class={classes}><slot /></h2>
{:else}
	<h3 class={classes}><slot /></h3>
{/if}