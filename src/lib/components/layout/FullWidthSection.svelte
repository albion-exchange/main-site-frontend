<script lang="ts">
	export let background: 'white' | 'gray' | 'secondary' = 'white';
	export let padding: 'compact' | 'standard' | 'large' = 'standard';
	export let className = '';
	
	const backgroundClasses = {
		white: 'bg-white',
		gray: 'bg-light-gray',
		secondary: 'bg-secondary text-white'
	};
	
	const paddingClasses = {
		compact: 'py-8 md:py-12',
		standard: 'py-16',
		large: 'py-24'
	};
	
	$: sectionClasses = `${backgroundClasses[background]} ${paddingClasses[padding]} ${className}`;
</script>

<section class={sectionClasses}>
	<div class="max-w-6xl mx-auto px-8">
		<slot />
	</div>
</section>