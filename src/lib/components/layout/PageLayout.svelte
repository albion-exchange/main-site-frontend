<script lang="ts">
	export let variant: 'default' | 'constrained' = 'default';
	export let className = '';
	
	$: mainClasses = variant === 'constrained' 
		? `max-w-6xl mx-auto ${className}`
		: `pt-0 ${className}`;
</script>

<main class={mainClasses}>
	<slot />
</main>