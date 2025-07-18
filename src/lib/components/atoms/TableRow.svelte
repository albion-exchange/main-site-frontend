<script lang="ts">
	
	export let columnWidths: string = '';
	export let hoverable = true;
	export let className = '';
	
	$: classes = `grid items-center gap-4 p-4 border-b border-light-gray hover:bg-light-gray transition-colors duration-200 ${columnWidths} ${hoverable ? '' : 'hover:bg-transparent'} ${className}`;
</script>

<div class={classes}>
	<slot />
</div>