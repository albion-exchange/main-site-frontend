<script lang="ts">
	import { onMount } from 'svelte';

	interface PendingClaim {
		assetId: string;
		assetName: string;
		amount: number;
		month: string;
		contractAddress: string;
	}

	interface ClaimHistory {
		assetName: string;
		amount: number;
		month: string;
		claimedAt: string;
		transactionHash: string;
	}

	let pendingClaims: PendingClaim[] = [];
	let claimHistory: ClaimHistory[] = [];
	let loading = true;
	let isConnected = false;
	let claiming = false;
	let claimSuccess = false;
	let claimError: string | null = null;

	onMount(async () => {
		// Mock loading claims data
		setTimeout(() => {
			// Mock data - in real app this would be fetched from blockchain
			pendingClaims = [
				{
					assetId: 'texas-gulf-alpha',
					assetName: 'Texas Gulf Alpha',
					amount: 1247.50,
					month: '2024-06',
					contractAddress: '0x1234567890abcdef'
				},
				{
					assetId: 'permian-beta',
					assetName: 'Permian Beta',
					amount: 892.25,
					month: '2024-06',
					contractAddress: '0x9876543210fedcba'
				}
			];

			claimHistory = [
				{
					assetName: 'Texas Gulf Alpha',
					amount: 1156.75,
					month: '2024-05',
					claimedAt: '2024-06-05T10:30:00Z',
					transactionHash: '0xabcdef1234567890'
				}
			];
			
			loading = false;
		}, 1000);
	});

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(amount);
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function formatMonthYear(monthString: string): string {
		const [year, month] = monthString.split('-');
		return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long'
		});
	}

	function getTotalPendingAmount(): number {
		return pendingClaims.reduce((total, claim) => total + claim.amount, 0);
	}

	function getTotalClaimedAmount(): number {
		return claimHistory.reduce((total, claim) => total + claim.amount, 0);
	}

	async function claimAll() {
		if (pendingClaims.length === 0) return;
		
		claiming = true;
		claimError = null;
		claimSuccess = false;

		try {
			// Mock smart contract call
			// In real app, this would call the smart contract claim function
			await new Promise(resolve => setTimeout(resolve, 3000));
			
			// Mock success - move pending claims to history
			const newHistoryEntries = pendingClaims.map(claim => ({
				assetName: claim.assetName,
				amount: claim.amount,
				month: claim.month,
				claimedAt: new Date().toISOString(),
				transactionHash: '0x' + Math.random().toString(16).substring(2, 18)
			}));
			
			claimHistory = [...newHistoryEntries, ...claimHistory];
			pendingClaims = [];
			claimSuccess = true;
			
		} catch (error) {
			claimError = 'Failed to claim rewards. Please try again.';
			console.error('Claim error:', error);
		} finally {
			claiming = false;
		}
	}

	async function claimSingle(claim: PendingClaim) {
		claiming = true;
		claimError = null;
		claimSuccess = false;

		try {
			// Mock smart contract call for single claim
			await new Promise(resolve => setTimeout(resolve, 2000));
			
			// Move this claim to history
			const newHistoryEntry = {
				assetName: claim.assetName,
				amount: claim.amount,
				month: claim.month,
				claimedAt: new Date().toISOString(),
				transactionHash: '0x' + Math.random().toString(16).substring(2, 18)
			};
			
			claimHistory = [newHistoryEntry, ...claimHistory];
			pendingClaims = pendingClaims.filter(c => c.assetId !== claim.assetId);
			claimSuccess = true;
			
		} catch (error) {
			claimError = 'Failed to claim reward. Please try again.';
			console.error('Claim error:', error);
		} finally {
			claiming = false;
		}
	}

	function connectWallet() {
		isConnected = true;
	}
</script>

<svelte:head>
	<title>Claims - Albion</title>
	<meta name="description" content="Claim your asset income distributions" />
</svelte:head>

<main class="claims-page">
	<header class="page-header">
		<h1>Income Claims</h1>
		<p>Claim your monthly asset distributions</p>
	</header>

	{#if !isConnected}
		<div class="wallet-connection">
			<div class="connection-prompt">
				<h2>Connect Your Wallet</h2>
				<p>Connect your wallet to view and claim your pending income distributions.</p>
				<button class="btn-primary" on:click={connectWallet}>
					Connect Wallet
				</button>
			</div>
		</div>
	{:else if loading}
		<div class="loading-state">
			<p>Loading your claims...</p>
		</div>
	{:else}
		<div class="claims-content">
			<!-- Status Messages -->
			{#if claimSuccess}
				<div class="success-message">
					<h3>Claims Successful!</h3>
					<p>Your income has been successfully transferred to your wallet.</p>
				</div>
			{/if}

			{#if claimError}
				<div class="error-message">
					<h3>Claim Failed</h3>
					<p>{claimError}</p>
				</div>
			{/if}

			<!-- Claims Summary -->
			<div class="claims-summary">
				<div class="summary-card">
					<h3>Pending Claims</h3>
					<span class="value pending">{formatCurrency(getTotalPendingAmount())}</span>
					<span class="count">{pendingClaims.length} distributions</span>
				</div>
				<div class="summary-card">
					<h3>Total Claimed</h3>
					<span class="value claimed">{formatCurrency(getTotalClaimedAmount())}</span>
					<span class="count">{claimHistory.length} distributions</span>
				</div>
			</div>

			<!-- Pending Claims Section -->
			<section class="pending-section">
				<div class="section-header">
					<h2>Pending Claims</h2>
					{#if pendingClaims.length > 0}
						<button 
							class="btn-primary claim-all-btn" 
							on:click={claimAll}
							disabled={claiming}
						>
							{#if claiming}
								Claiming...
							{:else}
								Claim All ({formatCurrency(getTotalPendingAmount())})
							{/if}
						</button>
					{/if}
				</div>

				{#if pendingClaims.length === 0}
					<div class="empty-state">
						<p>No pending claims at this time.</p>
						<p>Check back next month for new distributions.</p>
					</div>
				{:else}
					<div class="claims-list">
						{#each pendingClaims as claim}
							<article class="claim-card">
								<div class="claim-info">
									<h3>{claim.assetName}</h3>
									<p class="claim-period">Distribution for {formatMonthYear(claim.month)}</p>
									<p class="claim-amount">{formatCurrency(claim.amount)}</p>
								</div>
								<div class="claim-actions">
									<button 
										class="btn-secondary" 
										on:click={() => claimSingle(claim)}
										disabled={claiming}
									>
										{#if claiming}
											Claiming...
										{:else}
											Claim
										{/if}
									</button>
								</div>
							</article>
						{/each}
					</div>
				{/if}
			</section>

			<!-- Claim History Section -->
			<section class="history-section">
				<h2>Claim History</h2>
				
				{#if claimHistory.length === 0}
					<div class="empty-state">
						<p>No claims history yet.</p>
					</div>
				{:else}
					<div class="history-table">
						<div class="table-header">
							<span>Asset</span>
							<span>Period</span>
							<span>Amount</span>
							<span>Claimed Date</span>
							<span>Transaction</span>
						</div>
						{#each claimHistory as claim}
							<div class="table-row">
								<span class="asset-name">{claim.assetName}</span>
								<span>{formatMonthYear(claim.month)}</span>
								<span class="amount">{formatCurrency(claim.amount)}</span>
								<span>{formatDate(claim.claimedAt)}</span>
								<span class="tx-hash">
									<a href="https://etherscan.io/tx/{claim.transactionHash}" target="_blank" rel="noopener">
										{claim.transactionHash.substring(0, 10)}...
									</a>
								</span>
							</div>
						{/each}
					</div>
				{/if}
			</section>
		</div>
	{/if}
</main>

<style>
	.claims-page {
		padding: 4rem 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.page-header {
		text-align: center;
		margin-bottom: 4rem;
	}

	.page-header h1 {
		font-size: 3rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 1rem;
		color: var(--color-black);
	}

	.page-header p {
		font-size: 1.25rem;
		color: var(--color-black);
	}

	.wallet-connection {
		display: flex;
		justify-content: center;
		margin: 4rem 0;
	}

	.connection-prompt {
		text-align: center;
		padding: 3rem;
		border: 1px solid var(--color-light-gray);
		max-width: 500px;
	}

	.connection-prompt h2 {
		font-size: 1.5rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 1rem;
		color: var(--color-black);
	}

	.loading-state {
		text-align: center;
		padding: 4rem 2rem;
		color: var(--color-black);
	}

	.success-message,
	.error-message {
		padding: 1.5rem;
		margin-bottom: 2rem;
		text-align: center;
	}

	.success-message {
		background: #e8f5e8;
		border: 1px solid var(--color-primary);
		color: var(--color-secondary);
	}

	.error-message {
		background: #ffe8e8;
		border: 1px solid #ff6b6b;
		color: #d63447;
	}

	.claims-summary {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
		margin-bottom: 4rem;
	}

	.summary-card {
		padding: 2rem;
		border: 1px solid var(--color-light-gray);
		text-align: center;
	}

	.summary-card h3 {
		font-size: 0.9rem;
		color: var(--color-secondary);
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 1rem;
	}

	.summary-card .value {
		display: block;
		font-size: 2rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 0.5rem;
	}

	.summary-card .value.pending {
		color: var(--color-primary);
	}

	.summary-card .value.claimed {
		color: var(--color-secondary);
	}

	.summary-card .count {
		font-size: 0.9rem;
		color: var(--color-black);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.section-header h2 {
		font-size: 1.5rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
	}

	.claim-all-btn {
		padding: 0.75rem 1.5rem;
	}

	.empty-state {
		text-align: center;
		padding: 3rem;
		border: 1px solid var(--color-light-gray);
		margin-bottom: 3rem;
	}

	.empty-state p {
		margin-bottom: 0.5rem;
		color: var(--color-black);
	}

	.claims-list {
		display: grid;
		gap: 1rem;
		margin-bottom: 4rem;
	}

	.claim-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border: 1px solid var(--color-light-gray);
	}

	.claim-info h3 {
		font-size: 1.1rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 0.25rem;
		color: var(--color-black);
	}

	.claim-period {
		font-size: 0.8rem;
		color: var(--color-secondary);
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.5rem;
	}

	.claim-amount {
		font-size: 1.25rem;
		font-weight: var(--font-weight-bold);
		color: var(--color-primary);
	}

	.history-section {
		margin-top: 4rem;
	}

	.history-section h2 {
		font-size: 1.5rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 2rem;
		color: var(--color-black);
	}

	.history-table {
		border: 1px solid var(--color-light-gray);
	}

	.table-header,
	.table-row {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
		padding: 1rem;
		border-bottom: 1px solid var(--color-light-gray);
	}

	.table-header {
		background: var(--color-light-gray);
		font-weight: var(--font-weight-bold);
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.table-row:last-child {
		border-bottom: none;
	}

	.asset-name {
		font-weight: var(--font-weight-semibold);
	}

	.amount {
		color: var(--color-primary);
		font-weight: var(--font-weight-bold);
	}

	.tx-hash a {
		color: var(--color-secondary);
		font-family: monospace;
		font-size: 0.9rem;
	}

	.btn-primary,
	.btn-secondary {
		padding: 0.75rem 1.5rem;
		text-align: center;
		text-decoration: none;
		font-weight: var(--font-weight-semibold);
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		transition: background-color 0.2s ease;
		border: none;
		cursor: pointer;
	}

	.btn-primary {
		background: var(--color-primary);
		color: var(--color-white);
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--color-secondary);
	}

	.btn-secondary {
		background: var(--color-white);
		color: var(--color-secondary);
		border: 1px solid var(--color-secondary);
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--color-secondary);
		color: var(--color-white);
	}

	.btn-primary:disabled,
	.btn-secondary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (max-width: 768px) {
		.claims-page {
			padding: 2rem 1rem;
		}

		.page-header h1 {
			font-size: 2rem;
		}

		.section-header {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}

		.claim-card {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}

		.table-header,
		.table-row {
			grid-template-columns: 1fr;
			gap: 0.5rem;
		}

		.table-header span,
		.table-row span {
			padding: 0.25rem 0;
		}
	}
</style>