<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	export let isOpen = false;
	export let isConnecting = false;
	
	const dispatch = createEventDispatcher();
	
	function handleConnect() {
		dispatch('connect');
	}
	
	function handleClose() {
		if (!isConnecting) {
			dispatch('close');
		}
	}
	
	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleClose();
		}
	}
</script>

{#if isOpen}
	<div class="modal-backdrop" on:click={handleBackdropClick}>
		<div class="modal-content">
			<div class="modal-header">
				<h2>Connect Your Wallet</h2>
				{#if !isConnecting}
					<button class="close-btn" on:click={handleClose}>&times;</button>
				{/if}
			</div>
			
			<div class="modal-body">
				<div class="placeholder-notice">
					<div class="placeholder-icon">🚧</div>
					<h3>PLACEHOLDER MODAL</h3>
					<p>This is a mock wallet connection interface for demonstration purposes.</p>
				</div>
				
				<div class="wallet-options">
					<div class="wallet-option">
						<div class="wallet-info">
							<div class="wallet-icon">🦊</div>
							<div class="wallet-details">
								<h4>MetaMask</h4>
								<p>Connect using browser extension</p>
							</div>
						</div>
						<span class="status-indicator">Most Popular</span>
					</div>
					
					<div class="wallet-option">
						<div class="wallet-info">
							<div class="wallet-icon">👛</div>
							<div class="wallet-details">
								<h4>WalletConnect</h4>
								<p>Connect using mobile wallet</p>
							</div>
						</div>
						<span class="status-indicator">Mobile</span>
					</div>
					
					<div class="wallet-option">
						<div class="wallet-info">
							<div class="wallet-icon">🔗</div>
							<div class="wallet-details">
								<h4>Coinbase Wallet</h4>
								<p>Connect using Coinbase</p>
							</div>
						</div>
						<span class="status-indicator">Secure</span>
					</div>
				</div>
				
				<div class="connection-info">
					<h4>Why Connect a Wallet?</h4>
					<ul>
						<li>View your token holdings and portfolio</li>
						<li>Claim payouts and distributions</li>
						<li>Purchase and manage investments</li>
						<li>Access transaction history</li>
					</ul>
				</div>
			</div>
			
			<div class="modal-footer">
				<button 
					class="connect-btn"
					on:click={handleConnect}
					disabled={isConnecting}
				>
					{#if isConnecting}
						<span class="spinner"></span>
						Connecting...
					{:else}
						Confirm Mock Connection
					{/if}
				</button>
				
				<div class="security-notice">
					<span class="security-icon">🔒</span>
					<span>Your wallet connection is secure and encrypted</span>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}
	
	.modal-content {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		max-width: 500px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
	}
	
	.modal-header {
		padding: 2rem 2rem 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid var(--color-light-gray);
	}
	
	.modal-header h2 {
		font-size: 1.5rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0;
	}
	
	.close-btn {
		background: none;
		border: none;
		font-size: 2rem;
		color: var(--color-black);
		cursor: pointer;
		opacity: 0.6;
		transition: opacity 0.2s ease;
		line-height: 1;
		padding: 0;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.close-btn:hover {
		opacity: 1;
	}
	
	.modal-body {
		padding: 2rem;
	}
	
	.placeholder-notice {
		background: #fef3c7;
		border: 1px solid #fbbf24;
		padding: 1.5rem;
		text-align: center;
		margin-bottom: 2rem;
	}
	
	.placeholder-icon {
		font-size: 2rem;
		margin-bottom: 0.5rem;
	}
	
	.placeholder-notice h3 {
		font-size: 1.1rem;
		font-weight: var(--font-weight-extrabold);
		color: #92400e;
		margin-bottom: 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	
	.placeholder-notice p {
		color: #92400e;
		font-weight: var(--font-weight-semibold);
		margin: 0;
	}
	
	.wallet-options {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 2rem;
	}
	
	.wallet-option {
		border: 1px solid var(--color-light-gray);
		padding: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		transition: border-color 0.2s ease;
		cursor: pointer;
	}
	
	.wallet-option:hover {
		border-color: var(--color-primary);
	}
	
	.wallet-info {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	
	.wallet-icon {
		font-size: 1.5rem;
		width: 2.5rem;
		height: 2.5rem;
		background: var(--color-light-gray);
		border-radius: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.wallet-details h4 {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.25rem;
		font-size: 0.9rem;
	}
	
	.wallet-details p {
		font-size: 0.8rem;
		color: var(--color-black);
		opacity: 0.7;
		margin: 0;
	}
	
	.status-indicator {
		background: var(--color-primary);
		color: var(--color-white);
		padding: 0.25rem 0.5rem;
		font-size: 0.7rem;
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	
	.connection-info {
		background: var(--color-light-gray);
		padding: 1.5rem;
		margin-bottom: 2rem;
	}
	
	.connection-info h4 {
		font-size: 0.9rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 1rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	
	.connection-info ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	
	.connection-info li {
		font-size: 0.85rem;
		color: var(--color-black);
		margin-bottom: 0.5rem;
		padding-left: 1.5rem;
		position: relative;
	}
	
	.connection-info li::before {
		content: '✓';
		position: absolute;
		left: 0;
		color: var(--color-primary);
		font-weight: var(--font-weight-bold);
	}
	
	.modal-footer {
		padding: 1rem 2rem 2rem;
		border-top: 1px solid var(--color-light-gray);
	}
	
	.connect-btn {
		width: 100%;
		background: var(--color-black);
		color: var(--color-white);
		border: none;
		padding: 1rem 2rem;
		font-family: var(--font-family);
		font-weight: var(--font-weight-extrabold);
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		transition: background-color 0.2s ease;
		margin-bottom: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}
	
	.connect-btn:hover:not(:disabled) {
		background: var(--color-secondary);
	}
	
	.connect-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
	
	.spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid transparent;
		border-top: 2px solid currentColor;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
	
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	
	.security-notice {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-size: 0.8rem;
		color: var(--color-black);
		opacity: 0.7;
	}
	
	.security-icon {
		color: var(--color-primary);
	}
	
	@media (max-width: 768px) {
		.modal-content {
			margin: 1rem;
			max-height: calc(100vh - 2rem);
		}
		
		.modal-header,
		.modal-body,
		.modal-footer {
			padding-left: 1rem;
			padding-right: 1rem;
		}
		
		.wallet-option {
			flex-direction: column;
			gap: 1rem;
			text-align: center;
		}
	}
</style>