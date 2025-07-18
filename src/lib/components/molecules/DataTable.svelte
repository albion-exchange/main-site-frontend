/**
 * @fileoverview DataTable Component (Molecule)
 * 
 * A data table molecule that provides consistent table styling and basic
 * functionality like sorting and loading states.
 * 
 * @component DataTable
 * @example
 * <DataTable 
 *   columns={[{ key: 'name', label: 'Name', sortable: true }]}
 *   data={items}
 *   loading={false}
 * />
 */

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Icon } from '../atoms';
	
	// Type definitions
	interface Column {
		key: string;
		label: string;
		sortable?: boolean;
		align?: 'left' | 'center' | 'right';
		width?: string;
		render?: (value: any, row: any) => string;
	}
	
	interface SortState {
		column: string;
		direction: 'asc' | 'desc';
	}
	
	// Event dispatcher
	const dispatch = createEventDispatcher<{
		sort: SortState;
		rowClick: { row: any; index: number };
	}>();
	
	// Props
	export let columns: Column[] = [];
	export let data: any[] = [];
	export let loading = false;
	export let sortable = true;
	export let clickableRows = false;
	export let emptyMessage = 'No data available';
	export let loadingMessage = 'Loading...';
	export let sort: SortState | null = null;
	export let striped = true;
	export let hover = true;
	export let size: 'small' | 'medium' | 'large' = 'medium';
	
	// Computed classes
	$: tableClasses = [
		'min-w-full divide-y divide-gray-200',
		size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : 'text-base'
	].join(' ');
	
	$: rowClasses = (index: number) => [
		'divide-x divide-gray-200',
		striped && index % 2 === 0 ? 'bg-white' : striped ? 'bg-gray-50' : 'bg-white',
		hover ? 'hover:bg-gray-100' : '',
		clickableRows ? 'cursor-pointer' : ''
	].join(' ');
	
	$: cellPadding = {
		small: 'px-3 py-2',
		medium: 'px-4 py-3',
		large: 'px-6 py-4'
	}[size];
	
	// Sorting functionality
	function handleSort(column: Column) {
		if (!sortable || !column.sortable) return;
		
		const newDirection = sort?.column === column.key && sort?.direction === 'asc' ? 'desc' : 'asc';
		const newSort = { column: column.key, direction: newDirection };
		
		sort = newSort;
		dispatch('sort', newSort);
	}
	
	function handleRowClick(row: any, index: number) {
		if (clickableRows) {
			dispatch('rowClick', { row, index });
		}
	}
	
	// Get cell value with optional custom renderer
	function getCellValue(row: any, column: Column): string {
		const value = row[column.key];
		return column.render ? column.render(value, row) : String(value ?? '');
	}
	
	// Get column alignment classes
	function getAlignmentClasses(align: Column['align']): string {
		switch (align) {
			case 'center': return 'text-center';
			case 'right': return 'text-right';
			default: return 'text-left';
		}
	}
</script>

<div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
	<div class="overflow-x-auto">
		<table class={tableClasses}>
			<thead class="bg-gray-50">
				<tr class="divide-x divide-gray-200">
					{#each columns as column}
						<th 
							scope="col"
							class={`${cellPadding} font-medium text-gray-900 ${getAlignmentClasses(column.align)} ${column.sortable && sortable ? 'cursor-pointer select-none hover:bg-gray-100' : ''}`}
							style={column.width ? `width: ${column.width}` : ''}
							on:click={() => handleSort(column)}
							on:keydown={(e) => e.key === 'Enter' && handleSort(column)}
							tabindex={column.sortable && sortable ? 0 : -1}
							role={column.sortable && sortable ? 'button' : undefined}
							aria-sort={sort?.column === column.key ? sort.direction === 'asc' ? 'ascending' : 'descending' : 'none'}
						>
							<div class="flex items-center space-x-1">
								<span>{column.label}</span>
								{#if column.sortable && sortable}
									{#if sort?.column === column.key}
										<Icon 
											name={sort.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
											size="xs"
											color="gray"
										/>
									{:else}
										<Icon 
											name="ChevronsUpDown" 
											size="xs"
											color="gray"
										/>
									{/if}
								{/if}
							</div>
						</th>
					{/each}
				</tr>
			</thead>
			
			<tbody class="bg-white divide-y divide-gray-200">
				{#if loading}
					<tr>
						<td colspan={columns.length} class={`${cellPadding} text-center text-gray-500`}>
							<div class="flex items-center justify-center space-x-2">
								<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
								<span>{loadingMessage}</span>
							</div>
						</td>
					</tr>
				{:else if data.length === 0}
					<tr>
						<td colspan={columns.length} class={`${cellPadding} text-center text-gray-500`}>
							{emptyMessage}
						</td>
					</tr>
				{:else}
					{#each data as row, index}
						<tr 
							class={rowClasses(index)}
							on:click={() => handleRowClick(row, index)}
							on:keydown={(e) => e.key === 'Enter' && handleRowClick(row, index)}
							tabindex={clickableRows ? 0 : -1}
							role={clickableRows ? 'button' : undefined}
						>
							{#each columns as column}
								<td 
									class={`${cellPadding} text-gray-900 ${getAlignmentClasses(column.align)}`}
									style={column.width ? `width: ${column.width}` : ''}
								>
									{getCellValue(row, column)}
								</td>
							{/each}
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>