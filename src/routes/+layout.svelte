<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { walletStore, walletActions, formatAddress } from '$lib/stores/wallet';
	
	$: currentPath = $page.url.pathname;
	
	// Mock wallet connection
	async function connectWallet() {
		if ($walletStore.isConnected) {
			// Disconnect wallet
			walletActions.disconnect();
			return;
		}
		
		// Connect wallet
		await walletActions.connect();
	}
</script>

<div class="app">
	<header class="main-header">
		<nav class="main-nav">
			<div class="nav-container">
				<a href="/" class="logo">
					<span>Albion</span>
				</a>
				
				<div class="nav-links">
					<a href="/" class:active={currentPath === '/'}>Home</a>
					<a href="/assets" class:active={currentPath.startsWith('/assets')}>Assets</a>
					<a href="/portfolio" class:active={currentPath === '/portfolio'}>Portfolio</a>
					<a href="/claims" class:active={currentPath === '/claims'}>Claims</a>
				</div>
				
				<div class="nav-actions">
					<button 
						class="wallet-btn"
						class:connected={$walletStore.isConnected}
						class:connecting={$walletStore.isConnecting}
						on:click={connectWallet}
						disabled={$walletStore.isConnecting}
					>
						{#if $walletStore.isConnecting}
							Connecting...
						{:else if $walletStore.isConnected}
							<span class="wallet-icon">🔗</span>
							{formatAddress($walletStore.address)}
						{:else}
							<span class="wallet-icon">🔌</span>
							Connect Wallet
						{/if}
					</button>
					<a href="/buy-tokens" class="btn-primary">Buy Tokens</a>
				</div>
			</div>
		</nav>
	</header>

	<main class="main-content">
		<slot />
	</main>

	<footer class="main-footer">
		<div class="footer-container">
			<div class="footer-content">
				<div class="footer-section">
					<h3>Albion</h3>
					<p>Tokenized oil field investments</p>
				</div>
				<div class="footer-section">
					<h4>Platform</h4>
					<ul>
						<li><a href="/assets">Browse Assets</a></li>
						<li><a href="/portfolio">Portfolio</a></li>
						<li><a href="/claims">Claim Payouts</a></li>
					</ul>
				</div>
				<div class="footer-section">
					<h4>Company</h4>
					<ul>
						<li><a href="/about">About</a></li>
						<li><a href="/contact">Contact</a></li>
						<li><a href="/legal">Legal</a></li>
					</ul>
				</div>
			</div>
			<div class="footer-bottom">
				<p>&copy; 2024 Albion. All rights reserved.</p>
			</div>
		</div>
	</footer>
</div>

<style>
	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.main-header {
		border-bottom: 1px solid var(--color-light-gray);
		background: var(--color-white);
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.nav-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 80px;
	}

	.logo span {
		font-size: 1.5rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		text-decoration: none;
	}

	.nav-links {
		display: flex;
		gap: 2rem;
		align-items: center;
	}

	.nav-links a {
		color: var(--color-black);
		text-decoration: none;
		font-weight: var(--font-weight-medium);
		padding: 0.5rem 0;
		position: relative;
		transition: color 0.2s ease;
	}

	.nav-links a:hover {
		color: var(--color-primary);
	}

	.nav-links a.active {
		color: var(--color-primary);
	}

	.nav-links a.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 2px;
		background: var(--color-primary);
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.btn-primary {
		background: var(--color-primary);
		color: var(--color-white);
		padding: 0.5rem 1rem;
		text-decoration: none;
		font-weight: var(--font-weight-semibold);
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		transition: background-color 0.2s ease;
	}

	.btn-primary:hover {
		background: var(--color-secondary);
	}

	.wallet-btn {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		color: var(--color-black);
		padding: 0.5rem 1rem;
		font-family: var(--font-family);
		font-weight: var(--font-weight-semibold);
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.wallet-btn:hover:not(:disabled) {
		background: var(--color-light-gray);
		border-color: var(--color-black);
	}

	.wallet-btn.connected {
		background: var(--color-light-gray);
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	.wallet-btn.connecting {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.wallet-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.wallet-icon {
		font-size: 1rem;
	}

	.main-content {
		flex: 1;
	}

	.main-footer {
		background: var(--color-light-gray);
		margin-top: 4rem;
	}

	.footer-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 3rem 2rem 1rem;
	}

	.footer-content {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr;
		gap: 3rem;
		margin-bottom: 2rem;
	}

	.footer-section h3 {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 1rem;
		color: var(--color-black);
	}

	.footer-section h4 {
		font-size: 1rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 1rem;
		color: var(--color-black);
	}

	.footer-section p {
		color: var(--color-black);
		line-height: 1.6;
	}

	.footer-section ul {
		list-style: none;
		padding: 0;
	}

	.footer-section ul li {
		margin-bottom: 0.5rem;
	}

	.footer-section ul li a {
		color: var(--color-black);
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.footer-section ul li a:hover {
		color: var(--color-primary);
	}

	.footer-bottom {
		padding-top: 2rem;
		border-top: 1px solid var(--color-white);
		text-align: center;
	}

	.footer-bottom p {
		color: var(--color-black);
		font-size: 0.9rem;
	}

	@media (max-width: 768px) {
		.nav-container {
			padding: 0 1rem;
			flex-wrap: wrap;
			height: auto;
			padding-top: 1rem;
			padding-bottom: 1rem;
		}

		.nav-links {
			order: 3;
			width: 100%;
			justify-content: center;
			margin-top: 1rem;
			padding-top: 1rem;
			border-top: 1px solid var(--color-light-gray);
		}

		.nav-actions {
			flex-direction: column;
			gap: 0.5rem;
		}

		.wallet-btn {
			font-size: 0.8rem;
			padding: 0.4rem 0.8rem;
		}

		.footer-content {
			grid-template-columns: 1fr;
			gap: 2rem;
		}
	}
</style>