<script lang="ts">
	
	export let level: 'h1' | 'h2' | 'h3' | 'h4' = 'h2';
	export let size: 'page' | 'section' | 'card' | 'subsection' | 'small' | 'large-stat' | 'modal' = 'section';
	export let center = false;
	export let className = '';
	export let uppercase = false;
	export let textColor: 'black' | 'white' | 'primary' | 'secondary' = 'black';
	
	const sizeClasses = {
		page: 'typography-display mb-8',
		section: 'typography-h2 mb-6',
		card: 'typography-h3 mb-4',
		subsection: 'typography-h4',
		small: 'typography-h5 mb-4',
		'large-stat': 'typography-display mb-2',
		modal: 'typography-h3 m-0'
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