<script lang="ts">
	
	export let level: 'h1' | 'h2' | 'h3' = 'h2';
	export let size: 'page' | 'section' | 'card' | 'subsection' = 'section';
	export let center = false;
	export let className = '';
	
	const sizeClasses = {
		page: 'text-4xl font-extrabold text-black mb-8',
		section: 'text-3xl font-extrabold text-black mb-6',
		card: 'text-xl font-extrabold text-black mb-4',
		subsection: 'text-lg font-extrabold text-black uppercase tracking-wider',
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