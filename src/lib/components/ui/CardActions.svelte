<script lang="ts">
	export let gap: 'small' | 'medium' | 'large' = 'medium';
	export let justify: 'start' | 'center' | 'end' | 'between' | 'around' = 'start';
	
	// Tailwind class mappings
	const gapClasses = {
		small: 'gap-2',
		medium: 'gap-4',
		large: 'gap-6'
	};
	
	const justifyClasses = {
		start: 'justify-start',
		center: 'justify-center',
		end: 'justify-end',
		between: 'justify-between',
		around: 'justify-around'
	};
	
	$: containerClasses = `flex items-center flex-wrap max-[480px]:flex-col ${gapClasses[gap]} ${justifyClasses[justify]} [&>*]:flex-1 [&>*]:min-w-0 [&>a]:text-center [&>button]:text-center max-[480px]:[&>*]:w-full`;
</script>

<div class={containerClasses}>
	<slot />
</div>

