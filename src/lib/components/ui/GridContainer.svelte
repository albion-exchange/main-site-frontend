<script lang="ts">
	import { layouts } from '$lib/styles/layouts';
	
	export let columns: 2 | 3 | 4 = 3;
	export let gap: 'small' | 'medium' | 'large' = 'medium';
	export let className = '';
	
	const columnClasses = {
		2: layouts.gridTwo,
		3: layouts.gridThree,
		4: layouts.gridFour,
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