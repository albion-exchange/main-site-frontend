<script lang="ts">
	
	export let level: 'h1' | 'h2' | 'h3' | 'h4' = 'h2';
	export let size: 'page' | 'section' | 'card' | 'subsection' | 'legal' | 'small' | 'large-stat' | 'modal' = 'section';
	export let center = false;
	export let className = '';
	export let uppercase = false;
	
	const sizeClasses = {
		page: 'text-4xl md:text-5xl font-extrabold text-black mb-8 font-figtree',
		section: 'text-2xl md:text-3xl font-extrabold text-black mb-6 font-figtree',
		card: 'text-xl md:text-2xl font-extrabold text-black mb-4 font-figtree',
		subsection: 'text-lg md:text-xl font-extrabold text-black font-figtree',
		legal: 'text-xl font-extrabold text-black mt-8 mb-4 font-figtree',
		small: 'text-lg font-extrabold text-black mb-4 font-figtree',
		'large-stat': 'text-4xl font-extrabold text-black mb-2 font-figtree',
		modal: 'text-xl font-extrabold text-black m-0 font-figtree'
	};
	
	$: classes = `${sizeClasses[size]} ${center ? 'text-center' : ''} ${uppercase ? 'uppercase tracking-wider' : ''} ${className}`;
</script>

{#if level === 'h1'}
	<h1 class={classes}><slot /></h1>
{:else if level === 'h2'}
	<h2 class={classes}><slot /></h2>
{:else if level === 'h3'}
	<h3 class={classes}><slot /></h3>
{:else}
	<h4 class={classes}><slot /></h4>
{/if}