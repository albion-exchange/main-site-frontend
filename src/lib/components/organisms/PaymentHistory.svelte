<!--
   @fileoverview PaymentHistory Component (Organism)
   
   A payment history organism that displays payment data in a table format
   with filtering, sorting, and export capabilities. Contains business logic
   for payment data management.
   
   @component PaymentHistory
   @example
   <PaymentHistory {payments} loading={false} />
-->

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { DataTable } from '../molecules';
	import { Button, Icon } from '../atoms';
	import { usePaymentData } from '$lib/composables/usePaymentData';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import type { Payment } from '$lib/types/uiTypes';
	
	// Event dispatcher
	const dispatch = createEventDispatcher<{
		export: { format: 'csv' | 'pdf' };
		claimPayment: { paymentId: string };
	}>();
	
	// Props
	export let payments: Payment[] = [];
	export let loading = false;
	export let allowClaiming = true;
	export let allowExport = true;
	export let pageSize = 10;
	
	// Use payment data composable for business logic
	const {
		filteredPayments,
		sortedPayments,
		totalAmount,
		unclaimedAmount,
		filters,
		sortState
	} = usePaymentData(payments);
	
	// Table columns configuration
	$: columns = [
		{
			key: 'date',
			label: 'Date',
			sortable: true,
			render: (value: string) => formatDate(value)
		},
		{
			key: 'assetName',
			label: 'Asset',
			sortable: true
		},
		{
			key: 'amount',
			label: 'Amount',
			sortable: true,
			align: 'right' as const,
			render: (value: number) => formatCurrency(value)
		},
		{
			key: 'status',
			label: 'Status',
			sortable: true,
			render: (value: string) => {
				const statusMap = {
					'claimed': '✅ Claimed',
					'unclaimed': '⏳ Unclaimed',
					'pending': '🔄 Pending'
				};
				return statusMap[value as keyof typeof statusMap] || value;
			}
		},
		...(allowClaiming ? [{
			key: 'actions',
			label: 'Actions',
			align: 'center' as const,
			render: (value: any, row: Payment) => row.status === 'unclaimed' ? 'Claim' : ''
		}] : [])
	];
	
	// Pagination state
	let currentPage = 1;
	$: totalPages = Math.ceil($sortedPayments.length / pageSize);
	$: paginatedPayments = $sortedPayments.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize
	);
	
	// Event handlers
	function handleSort(event: CustomEvent) {
		sortState.set(event.detail);
	}
	
	function handleRowClick(event: CustomEvent) {
		const { row } = event.detail;
		if (allowClaiming && row.status === 'unclaimed') {
			dispatch('claimPayment', { paymentId: row.id });
		}
	}
	
	function handleExport(format: 'csv' | 'pdf') {
		dispatch('export', { format });
	}
	
	function nextPage() {
		if (currentPage < totalPages) {
			currentPage++;
		}
	}
	
	function prevPage() {
		if (currentPage > 1) {
			currentPage--;
		}
	}
	
	// Filter handlers
	function handleStatusFilter(status: string) {
		filters.update(f => ({ ...f, status: status === 'all' ? null : status }));
		currentPage = 1; // Reset to first page when filtering
	}
</script>

<div class="space-y-6">
	<!-- Header with summary and actions -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<h3 class="text-lg font-semibold text-gray-900">Payment History</h3>
			<div class="flex items-center gap-4 mt-1 text-sm text-gray-600">
				<span>Total: {formatCurrency($totalAmount)}</span>
				{#if $unclaimedAmount > 0}
					<span class="text-orange-600">Unclaimed: {formatCurrency($unclaimedAmount)}</span>
				{/if}
			</div>
		</div>
		
		{#if allowExport}
			<div class="flex items-center gap-2">
				<Button
					variant="secondary"
					size="small"
					on:click={() => handleExport('csv')}
				>
					<Icon name="Download" size="xs" />
					CSV
				</Button>
				<Button
					variant="secondary"
					size="small"
					on:click={() => handleExport('pdf')}
				>
					<Icon name="FileText" size="xs" />
					PDF
				</Button>
			</div>
		{/if}
	</div>
	
	<!-- Filters -->
	<div class="flex items-center gap-2">
		<span class="text-sm font-medium text-gray-700">Filter by status:</span>
		{#each ['all', 'claimed', 'unclaimed', 'pending'] as status}
			<Button
				variant={$filters.status === (status === 'all' ? null : status) ? 'primary' : 'ghost'}
				size="small"
				on:click={() => handleStatusFilter(status)}
			>
				{status.charAt(0).toUpperCase() + status.slice(1)}
			</Button>
		{/each}
	</div>
	
	<!-- Data table -->
	<DataTable
		{columns}
		data={paginatedPayments}
		{loading}
		clickableRows={allowClaiming}
		sort={$sortState}
		emptyMessage="No payments found"
		on:sort={handleSort}
		on:rowClick={handleRowClick}
	/>
	
	<!-- Pagination -->
	{#if totalPages > 1}
		<div class="flex items-center justify-between">
			<div class="text-sm text-gray-700">
				Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, $sortedPayments.length)} of {$sortedPayments.length} payments
			</div>
			
			<div class="flex items-center gap-2">
				<Button
					variant="secondary"
					size="small"
					disabled={currentPage === 1}
					on:click={prevPage}
				>
					<Icon name="ChevronLeft" size="xs" />
					Previous
				</Button>
				
				<span class="px-3 py-1 text-sm">
					{currentPage} of {totalPages}
				</span>
				
				<Button
					variant="secondary"
					size="small"
					disabled={currentPage === totalPages}
					on:click={nextPage}
				>
					Next
					<Icon name="ChevronRight" size="xs" />
				</Button>
			</div>
		</div>
	{/if}
</div>