<!--
@fileoverview PaymentHistory Organism

A comprehensive payment history display that combines DataTable molecule
with payment data management and filtering capabilities.

@component PaymentHistory
@example
<PaymentHistory userId="user-1" />
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import { DataTable } from '../molecules';
	import { getPaymentsByUser, type Payment } from '$lib/data/payments';

	// Props
	export let userId: string;

	// State
	let payments: Payment[] = [];
	let loading = true;
	let error: string | null = null;

	// Table configuration
	const columns = [
		{ key: 'date', label: 'Date', sortable: true },
		{ key: 'asset', label: 'Asset', sortable: true },
		{ key: 'amount', label: 'Amount', sortable: true },
		{ key: 'status', label: 'Status', sortable: false },
		{ key: 'actions', label: 'Actions', sortable: false }
	];

	onMount(() => {
		// Load payments for the user
		setTimeout(() => {
			try {
				payments = getPaymentsByUser(userId);
				loading = false;
			} catch (err) {
				error = 'Failed to load payments';
				loading = false;
			}
		}, 1000);
	});

	// Format payment data for table display
	$: tableData = payments.map(payment => ({
		...payment,
		amount: `$${payment.amount.toFixed(2)}`,
		date: new Date(payment.date).toLocaleDateString(),
		status: payment.status.charAt(0).toUpperCase() + payment.status.slice(1)
	}));

	function handleExport() {
		// Export functionality
		const csvContent = [
			['Date', 'Asset', 'Amount', 'Status', 'Transaction Hash'],
			...payments.map(p => [
				p.date,
				p.asset,
				p.amount.toString(),
				p.status,
				p.txHash || 'N/A'
			])
		].map(row => row.join(',')).join('\n');
		
		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `payment-history-${userId}.csv`;
		link.click();
		window.URL.revokeObjectURL(url);
	}

	function handleViewTransaction(payment: Payment) {
		if (payment.txHash) {
			// Open transaction in block explorer
			window.open(`https://etherscan.io/tx/${payment.txHash}`, '_blank');
		}
	}
</script>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<h3 class="text-lg font-semibold text-gray-900">Payment History</h3>
		<button
			on:click={handleExport}
			class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
			disabled={loading || payments.length === 0}
		>
			Export CSV
		</button>
	</div>

	{#if loading}
		<div class="animate-pulse space-y-4">
			{#each Array(5) as _}
				<div class="bg-gray-200 h-12 rounded"></div>
			{/each}
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4">
			<p class="text-red-600">Error loading payment history: {error}</p>
		</div>
	{:else if payments.length === 0}
		<div class="text-center py-8 text-gray-500">
			<p>No payments found for user {userId}</p>
		</div>
	{:else}
		<DataTable
			data={tableData}
			{columns}
			itemsPerPage={10}
			searchable={true}
			searchPlaceholder="Search payments..."
		>
			<svelte:fragment slot="status" let:item>
				<span class="px-2 py-1 text-xs font-medium rounded-full
					{item.status === 'Completed' ? 'bg-green-100 text-green-800' :
					 item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
					 'bg-red-100 text-red-800'}">
					{item.status}
				</span>
			</svelte:fragment>
			
			<svelte:fragment slot="actions" let:item>
				{#if item.txHash}
					<button
						on:click={() => handleViewTransaction(item)}
						class="text-blue-600 hover:text-blue-800 text-sm font-medium"
					>
						View Transaction
					</button>
				{:else}
					<span class="text-gray-400 text-sm">-</span>
				{/if}
			</svelte:fragment>
		</DataTable>
	{/if}
</div>