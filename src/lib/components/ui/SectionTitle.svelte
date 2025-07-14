<script lang="ts">
	
	export let level: 'h1' | 'h2' | 'h3' = 'h2';
	export let size: 'page' | 'section' | 'card' | 'subsection' = 'section';
	export let center = false;
	export let className = '';
	
	const sizeClasses = {
		page: 'text-3xl md:text-4xl font-extrabold text-black mb-8 font-figtree uppercase tracking-tight',
		section: 'text-2xl md:text-3xl font-extrabold text-black mb-6 font-figtree uppercase tracking-wider',
		card: 'text-xl md:text-2xl font-extrabold text-black mb-4 font-figtree uppercase tracking-wider',
		subsection: 'text-lg md:text-xl font-extrabold text-black uppercase tracking-wider font-figtree',
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