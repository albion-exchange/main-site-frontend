<script lang="ts">
	
	export let columns: 2 | 3 | 4 = 3;
	export let gap: 'small' | 'medium' | 'large' = 'medium';
	export let className = '';
	
	const columnClasses = {
		2: 'grid grid-cols-1 sm:grid-cols-2',
		3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
		4: 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
	};
	
	const gapClasses = {
		small: 'gap-4 sm:gap-5 lg:gap-6',
		medium: 'gap-6 sm:gap-7 lg:gap-8',
		large: 'gap-8 sm:gap-10 lg:gap-12',
	};
	
	$: classes = `${columnClasses[columns]} ${gapClasses[gap]} ${className}`;
</script>

<div class={classes}>
	<slot />
</div>