<script lang="ts">
	export let direction: 'horizontal' | 'vertical' = 'horizontal';
	export let gap: 'small' | 'medium' | 'large' = 'medium';
	export let centered = false;
	export let wrap = true;
	
	const directionClasses = {
		horizontal: 'flex-row',
		vertical: 'flex-col'
	};
	
	const gapClasses = {
		small: 'gap-2',
		medium: 'gap-4',
		large: 'gap-6'
	};
	
	$: classes = `flex ${directionClasses[direction]} ${gapClasses[gap]} ${centered ? 'justify-center items-center' : ''} ${wrap ? 'flex-wrap' : ''}`;
</script>

<div class={classes}>
	<slot />
</div>