<script lang="ts">
	export let background: 'white' | 'gray' | 'secondary' = 'white';
	export let padding: 'compact' | 'standard' | 'large' | 'none' = 'standard';
	export let centered = false;
	export let maxWidth = true;
	export let className = '';
	
	const backgroundClasses = {
		white: 'bg-white',
		gray: 'bg-light-gray',
		secondary: 'bg-secondary text-white'
	};
	
	const paddingClasses = {
		compact: 'py-8 px-4 md:py-12 md:px-8',
		standard: 'py-16 px-8',
		large: 'py-24 px-8',
		none: ''
	};
	
	$: sectionClasses = `${backgroundClasses[background]} ${paddingClasses[padding]} ${className}`;
	$: contentClasses = `${maxWidth ? 'max-w-6xl mx-auto' : ''} ${centered ? 'text-center' : ''}`;
</script>

<section class={sectionClasses}>
	<div class={contentClasses}>
		<slot />
	</div>
</section>