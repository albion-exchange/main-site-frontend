<script lang="ts">
	
	export let level: 'h1' | 'h2' | 'h3' | 'h4' = 'h2';
	export let size: 'page' | 'section' | 'card' | 'subsection' | 'legal' | 'small' | 'large-stat' | 'modal' = 'section';
	export let center = false;
	export let className = '';
	export let uppercase = false;
	export let textColor: 'black' | 'white' | 'primary' | 'secondary' = 'black';
	
	const sizeClasses = {
		page: 'text-4xl md:text-5xl font-extrabold mb-8 font-figtree',
		section: 'text-2xl md:text-3xl font-extrabold mb-6 font-figtree',
		card: 'text-xl md:text-2xl font-extrabold mb-4 font-figtree',
		subsection: 'text-lg md:text-xl font-extrabold font-figtree',
		legal: 'text-xl font-extrabold mt-8 mb-4 font-figtree',
		small: 'text-lg font-extrabold mb-4 font-figtree',
		'large-stat': 'text-4xl font-extrabold mb-2 font-figtree',
		modal: 'text-xl font-extrabold m-0 font-figtree'
	};
	
	const colorClasses = {
		black: 'text-black',
		white: 'text-white',
		primary: 'text-primary',
		secondary: 'text-secondary'
	};
	
	$: classes = `${sizeClasses[size]} ${colorClasses[textColor]} ${center ? 'text-center' : ''} ${uppercase ? 'uppercase tracking-wider' : ''} ${className}`;
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