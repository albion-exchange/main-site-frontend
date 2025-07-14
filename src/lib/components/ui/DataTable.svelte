<script lang="ts">
	import { layouts } from '$lib/styles/layouts';
	
	export let columns: string[] = [];
	export let columnWidths: string = '';
	export let className = '';
	
	$: headerClasses = `${layouts.tableHeader} ${columnWidths}`;
	$: containerClasses = `${layouts.card} overflow-hidden ${className}`;
</script>

<div class={containerClasses}>
	{#if columns.length > 0}
		<div class={headerClasses}>
			{#each columns as column}
				<div class="font-extrabold text-black text-xs uppercase tracking-wider">
					{column}
				</div>
			{/each}
		</div>
	{/if}
	<slot />
</div>