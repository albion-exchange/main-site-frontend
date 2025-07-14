<script lang="ts">
	
	export let columns: 2 | 3 | 4 = 3;
	export let gap: 'small' | 'medium' | 'large' = 'medium';
	export let className = '';
	
	const columnClasses = {
		2: 'grid grid-cols-1 sm:grid-cols-2 gap-8',
		3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8',
		4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8',
	};
	
	const gapClasses = {
		small: 'gap-4',
		medium: 'gap-8',
		large: 'gap-12',
	};
	
	$: classes = `${columnClasses[columns]} ${className}`.replace(/gap-\d+/, gapClasses[gap]);
</script>

<div class={classes}>
	<slot />
</div>