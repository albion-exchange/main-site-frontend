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
		compact: 'py-8 md:py-12',
		standard: 'py-16',
		large: 'py-24',
		none: ''
	};
	
	$: sectionClasses = `${backgroundClasses[background]} ${paddingClasses[padding]} ${className}`;
	$: contentClasses = `${maxWidth ? 'max-w-6xl mx-auto px-8' : ''} ${centered ? 'text-center' : ''}`;
</script>

<section class={sectionClasses}>
	<div class={contentClasses}>
		<slot />
	</div>
</section>