<script lang="ts">
	import { layouts } from '$lib/styles/layouts';
	
	export let columnWidths: string = '';
	export let hoverable = true;
	export let className = '';
	
	$: classes = `${layouts.tableRow} ${columnWidths} ${hoverable ? '' : 'hover:bg-transparent'} ${className}`;
</script>

<div class={classes}>
	<slot />
</div>