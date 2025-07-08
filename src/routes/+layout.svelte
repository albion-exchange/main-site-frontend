<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { walletStore, walletActions, formatAddress } from '$lib/stores/wallet';
	import { PrimaryButton, SecondaryButton } from '$lib/components/ui';
	
	$: currentPath = $page.url.pathname;
	let mobileMenuOpen = false;
	
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
	
	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}
	
	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<div class="app">
	<header class="main-header">
		<nav class="main-nav">
			<div class="nav-container">
				<a href="/" class="logo" on:click={closeMobileMenu}>
					<img src="/assets/logo.svg" alt="Albion Logo" class="logo-image" />
				</a>
				
				<!-- Mobile menu button -->
				<button class="mobile-menu-button" on:click={toggleMobileMenu} aria-label="Toggle menu">
					<span class="hamburger" class:open={mobileMenuOpen}></span>
				</button>
				
				<!-- Desktop navigation -->
				<div class="nav-links desktop-nav">
					<a href="/" class:active={currentPath === '/'}>Home</a>
					<a href="/assets" class:active={currentPath.startsWith('/assets')}>Invest</a>
					<a href="/portfolio" class:active={currentPath === '/portfolio'}>Portfolio</a>
					<a href="/claims" class:active={currentPath === '/claims'}>Claims</a>
				</div>
				
				<div class="nav-actions desktop-nav">
					<SecondaryButton 
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
					</SecondaryButton>
				</div>
			</div>
			
			<!-- Mobile navigation menu -->
			<div class="mobile-nav" class:open={mobileMenuOpen}>
				<div class="mobile-nav-links">
					<a href="/" class:active={currentPath === '/'} on:click={closeMobileMenu}>Home</a>
					<a href="/assets" class:active={currentPath.startsWith('/assets')} on:click={closeMobileMenu}>Invest</a>
					<a href="/portfolio" class:active={currentPath === '/portfolio'} on:click={closeMobileMenu}>Portfolio</a>
					<a href="/claims" class:active={currentPath === '/claims'} on:click={closeMobileMenu}>Claims</a>
				</div>
				<div class="mobile-nav-actions">
					<SecondaryButton 
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
					</SecondaryButton>
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
					<img src="/assets/footer.svg" alt="Albion" class="footer-logo" />
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
				<div class="footer-section">
					<h4>Stay Connected</h4>
					<p>Follow Albion for the latest updates on energy investments and platform news</p>
					<div class="footer-social-buttons">
						<a href="https://twitter.com/albion" target="_blank" rel="noopener noreferrer" class="footer-social-btn twitter" aria-label="Follow Albion on Twitter">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
								<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
							</svg>
						</a>
						<a href="https://linkedin.com/company/albion" target="_blank" rel="noopener noreferrer" class="footer-social-btn linkedin" aria-label="Follow Albion on LinkedIn">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
								<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
							</svg>
						</a>
						<a href="https://t.me/albion" target="_blank" rel="noopener noreferrer" class="footer-social-btn telegram" aria-label="Join Albion on Telegram">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
								<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
							</svg>
						</a>
						<a href="https://discord.gg/albion" target="_blank" rel="noopener noreferrer" class="footer-social-btn discord" aria-label="Join Albion on Discord">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
								<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.30zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
							</svg>
						</a>
					</div>
				</div>
			</div>
			<div class="footer-bottom">
				<p>&copy; 2025 Albion. All rights reserved.</p>
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
		height: 100px;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.logo-image {
		height: 4rem;
		width: auto;
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
		grid-template-columns: 2fr 1fr 1fr 1.5fr;
		gap: 3rem;
		margin-bottom: 2rem;
	}


	.footer-logo {
		height: 40px;
		margin-bottom: 1rem;
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

	/* Footer Social Buttons */
	.footer-social-buttons {
		display: flex;
		gap: 1rem;
		margin-top: 1rem;
	}

	.footer-social-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		border: 2px solid var(--color-black);
		color: var(--color-black);
		text-decoration: none;
		transition: all 0.2s ease;
	}

	.footer-social-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.footer-social-btn.twitter:hover {
		border-color: #1da1f2;
		color: #1da1f2;
	}

	.footer-social-btn.linkedin:hover {
		border-color: #0077b5;
		color: #0077b5;
	}

	.footer-social-btn.telegram:hover {
		border-color: #0088cc;
		color: #0088cc;
	}

	.footer-social-btn.discord:hover {
		border-color: #5865f2;
		color: #5865f2;
	}

	/* Mobile menu button */
	.mobile-menu-button {
		display: none;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
		z-index: 101;
	}

	.hamburger {
		display: block;
		width: 24px;
		height: 2px;
		background: var(--color-black);
		transition: all 0.3s ease;
		position: relative;
	}

	.hamburger::before,
	.hamburger::after {
		content: '';
		position: absolute;
		width: 24px;
		height: 2px;
		background: var(--color-black);
		transition: all 0.3s ease;
	}

	.hamburger::before {
		top: -8px;
	}

	.hamburger::after {
		top: 8px;
	}

	.hamburger.open {
		background: transparent;
	}

	.hamburger.open::before {
		transform: rotate(45deg);
		top: 0;
	}

	.hamburger.open::after {
		transform: rotate(-45deg);
		top: 0;
	}

	/* Mobile navigation */
	.mobile-nav {
		display: none;
		position: fixed;
		top: 100px;
		left: 0;
		right: 0;
		background: var(--color-white);
		border-bottom: 1px solid var(--color-light-gray);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		z-index: 100;
		transform: translateY(-100%);
		transition: transform 0.3s ease;
	}

	.mobile-nav.open {
		transform: translateY(0);
	}

	.mobile-nav-links {
		display: flex;
		flex-direction: column;
		padding: 1rem;
		gap: 0;
	}

	.mobile-nav-links a {
		color: var(--color-black);
		text-decoration: none;
		font-weight: var(--font-weight-medium);
		padding: 1rem 0;
		border-bottom: 1px solid var(--color-light-gray);
		transition: color 0.2s ease;
	}

	.mobile-nav-links a:last-child {
		border-bottom: none;
	}

	.mobile-nav-links a:hover,
	.mobile-nav-links a.active {
		color: var(--color-primary);
	}

	.mobile-nav-actions {
		padding: 1rem;
		border-top: 1px solid var(--color-light-gray);
	}

	@media (max-width: 768px) {
		.nav-container {
			padding: 0 1rem;
			height: 100px;
		}

		.mobile-menu-button {
			display: block;
		}

		.desktop-nav {
			display: none;
		}

		.mobile-nav {
			display: block;
		}

		.footer-content {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.footer-social-buttons {
			justify-content: center;
			gap: 0.75rem;
		}
	}
</style>