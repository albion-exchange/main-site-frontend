<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { walletStore, walletActions, formatAddress } from '$lib/stores/wallet';
	import { PrimaryButton, SecondaryButton } from '$lib/components/ui';
	import WalletModal from '$lib/components/organisms/WalletModal.svelte';
	
	$: currentPath = $page.url.pathname;
	let mobileMenuOpen = false;
	let showWalletModal = false;
	
	// Mock wallet connection
	async function connectWallet() {
		if ($walletStore.isConnected) {
			// Disconnect wallet
			walletActions.disconnect();
			return;
		}
		
		// Show wallet modal instead of directly connecting
		showWalletModal = true;
	}
	
	async function handleWalletConnect() {
		await walletActions.connect();
		showWalletModal = false;
	}
	
	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}
	
	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
	
	// Tailwind class mappings
	$: appClasses = 'min-h-screen flex flex-col';
	$: headerClasses = 'border-b border-light-gray bg-white sticky top-0 z-[100]';
	$: navContainerClasses = 'max-w-6xl mx-auto px-8 flex items-center justify-between h-24';
	$: logoClasses = 'flex items-center gap-1';
	$: logoImageClasses = 'h-16 w-auto';
	$: mobileMenuButtonClasses = 'md:hidden bg-transparent border-none cursor-pointer p-2 z-[101]';
	$: hamburgerClasses = 'block w-6 h-0.5 bg-black transition-all duration-300 ease-out relative';
	$: hamburgerOpenClasses = 'bg-transparent';
	$: desktopNavClasses = 'hidden md:flex';
	$: navLinksClasses = 'flex gap-8 items-center';
	$: navLinkClasses = 'text-black no-underline font-medium py-2 relative transition-colors duration-200 hover:text-primary';
	$: navLinkActiveClasses = 'text-primary after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary';
	$: navActionsClasses = 'flex items-center gap-4';
	$: walletIconClasses = 'text-base';
	$: mobileNavClasses = 'md:hidden fixed top-24 left-0 right-0 bg-white border-b border-light-gray z-[100] transform -translate-y-full transition-transform duration-300 ease-out';
	$: mobileNavOpenClasses = 'transform translate-y-0';
	$: mobileNavLinksClasses = 'flex flex-col p-4 gap-0';
	$: mobileNavLinkClasses = 'text-black no-underline font-medium py-4 border-b border-light-gray transition-colors duration-200 last:border-b-0 hover:text-primary';
	$: mobileNavLinkActiveClasses = 'text-primary';
	$: mobileNavActionsClasses = 'p-4 border-t border-light-gray';
	$: mainContentClasses = 'flex-1';
	$: footerClasses = 'bg-light-gray mt-16';
	$: footerContainerClasses = 'max-w-6xl mx-auto px-8 pt-12 pb-4';
	$: footerContentClasses = 'grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1.5fr] gap-12 mb-8';
	$: footerLogoClasses = 'h-10 mb-4';
	$: footerSectionH4Classes = 'text-base font-extrabold mb-4 text-black';
	$: footerSectionPClasses = 'text-black leading-relaxed';
	$: footerSectionUlClasses = 'list-none p-0';
	$: footerSectionLiClasses = 'mb-2';
	$: footerSectionLinkClasses = 'text-black no-underline transition-colors duration-200 hover:text-primary';
	$: footerSocialButtonsClasses = 'flex gap-4 mt-4';
	$: footerSocialBtnClasses = 'flex items-center justify-center w-10 h-10 rounded-full border-2 border-black text-black no-underline transition-colors duration-200';
	$: footerSocialTwitterClasses = 'hover:border-[#1da1f2] hover:text-[#1da1f2]';
	$: footerSocialLinkedinClasses = 'hover:border-[#0077b5] hover:text-[#0077b5]';
	$: footerSocialTelegramClasses = 'hover:border-[#0088cc] hover:text-[#0088cc]';
	$: footerSocialDiscordClasses = 'hover:border-[#5865f2] hover:text-[#5865f2]';
	$: footerBottomClasses = 'pt-8 border-t border-white text-center';
	$: footerBottomPClasses = 'text-black text-sm';
	
	// Mobile responsive classes
	$: mobileNavContainerClasses = 'max-w-6xl mx-auto md:px-8 px-4 flex items-center justify-between h-24';
	$: mobileFooterContentClasses = 'grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1.5fr] md:gap-12 gap-8 mb-8';
	$: mobileFooterSocialButtonsClasses = 'flex lg:gap-4 gap-3 mt-4 lg:justify-start justify-center';
</script>

<div class={appClasses}>
	<header class={headerClasses}>
		<nav>
			<div class={mobileNavContainerClasses}>
				<a href="/" class={logoClasses} on:click={closeMobileMenu}>
					<div class="overflow-hidden">
						<img src="/assets/logo.svg" alt="Albion Logo" class={logoImageClasses} style="margin-left: -0.3rem" />
					</div>
				</a>
				
				<!-- Mobile menu button -->
				<button class={mobileMenuButtonClasses} on:click={toggleMobileMenu} aria-label="Toggle menu">
					<span class="{hamburgerClasses} {mobileMenuOpen ? hamburgerOpenClasses : ''} before:content-[''] before:absolute before:w-6 before:h-0.5 before:bg-black before:transition-all before:duration-300 before:ease-out before:-top-2 after:content-[''] after:absolute after:w-6 after:h-0.5 after:bg-black after:transition-all after:duration-300 after:ease-out after:top-2 {mobileMenuOpen ? 'before:rotate-45 before:top-0 after:-rotate-45 after:top-0' : ''}"></span>
				</button>
				
				<!-- Desktop navigation -->
				<div class="{navLinksClasses} {desktopNavClasses}">
					<a href="/" class="{navLinkClasses} {currentPath === '/' ? navLinkActiveClasses : ''}">Home</a>
					<a href="/assets" class="{navLinkClasses} {currentPath.startsWith('/assets') ? navLinkActiveClasses : ''}">Invest</a>
					<a href="/portfolio" class="{navLinkClasses} {currentPath === '/portfolio' ? navLinkActiveClasses : ''}">Portfolio</a>
					<a href="/claims" class="{navLinkClasses} {currentPath === '/claims' ? navLinkActiveClasses : ''}">Claims</a>
				</div>
				
				<div class="{navActionsClasses} {desktopNavClasses}">
					<SecondaryButton 
						on:click={connectWallet}
						disabled={$walletStore.isConnecting}
					>
						{#if $walletStore.isConnecting}
							Connecting...
						{:else if $walletStore.isConnected}
							<span class={walletIconClasses}>🔗</span>
							{formatAddress($walletStore.address)}
						{:else}
							<span class={walletIconClasses}>🔌</span>
							Connect Wallet
						{/if}
					</SecondaryButton>
				</div>
			</div>
			
			<!-- Mobile navigation menu -->
			<div class="{mobileNavClasses} {mobileMenuOpen ? mobileNavOpenClasses : ''}">
				<div class={mobileNavLinksClasses}>
					<a href="/" class="{mobileNavLinkClasses} {currentPath === '/' ? mobileNavLinkActiveClasses : ''}" on:click={closeMobileMenu}>Home</a>
					<a href="/assets" class="{mobileNavLinkClasses} {currentPath.startsWith('/assets') ? mobileNavLinkActiveClasses : ''}" on:click={closeMobileMenu}>Invest</a>
					<a href="/portfolio" class="{mobileNavLinkClasses} {currentPath === '/portfolio' ? mobileNavLinkActiveClasses : ''}" on:click={closeMobileMenu}>Portfolio</a>
					<a href="/claims" class="{mobileNavLinkClasses} {currentPath === '/claims' ? mobileNavLinkActiveClasses : ''}" on:click={closeMobileMenu}>Claims</a>
				</div>
				<div class={mobileNavActionsClasses}>
					<SecondaryButton 
						on:click={connectWallet}
						disabled={$walletStore.isConnecting}
					>
						{#if $walletStore.isConnecting}
							Connecting...
						{:else if $walletStore.isConnected}
							<span class={walletIconClasses}>🔗</span>
							{formatAddress($walletStore.address)}
						{:else}
							<span class={walletIconClasses}>🔌</span>
							Connect Wallet
						{/if}
					</SecondaryButton>
				</div>
			</div>
		</nav>
	</header>

	<main class={mainContentClasses}>
		<slot />
	</main>

	<footer class={footerClasses}>
		<div class="max-w-6xl mx-auto px-8 pt-12 pb-4">
			<div class="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1.5fr] md:gap-12 gap-8 mb-8">
				<div>
					<div class="overflow-hidden mb-4">
						<img src="/assets/footer.svg" alt="Albion" class="h-10" style="margin-left: -0.18rem" />
					</div>
					<p class="text-black leading-relaxed">Tokenized oil field investments</p>
				</div>
				<div>
					<h4 class="text-base font-extrabold mb-4 text-black">Platform</h4>
					<ul class="list-none p-0">
						<li class="mb-2"><a href="/assets" class="text-black no-underline transition-colors duration-200 hover:text-primary">Browse Assets</a></li>
						<li class="mb-2"><a href="/portfolio" class="text-black no-underline transition-colors duration-200 hover:text-primary">Portfolio</a></li>
						<li class="mb-2"><a href="/claims" class="text-black no-underline transition-colors duration-200 hover:text-primary">Claim Payouts</a></li>
					</ul>
				</div>
				<div>
					<h4 class="text-base font-extrabold mb-4 text-black">Company</h4>
					<ul class="list-none p-0">
						<li class="mb-2"><a href="/about" class="text-black no-underline transition-colors duration-200 hover:text-primary">About</a></li>
						<li class="mb-2"><a href="/contact" class="text-black no-underline transition-colors duration-200 hover:text-primary">Contact</a></li>
						<li class="mb-2"><a href="/legal" class="text-black no-underline transition-colors duration-200 hover:text-primary">Legal</a></li>
					</ul>
				</div>
				<div>
					<h4 class="text-base font-extrabold mb-4 text-black">Stay Connected</h4>
					<p class="text-black leading-relaxed">Follow Albion for the latest updates on energy investments and platform news</p>
					<div class="flex lg:gap-4 gap-3 mt-4 lg:justify-start justify-center">
						<a href="https://twitter.com/albion" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center w-10 h-10 rounded-full border-2 border-black text-black no-underline transition-colors duration-200 hover:border-[#1da1f2] hover:text-[#1da1f2]" aria-label="Follow Albion on Twitter">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
								<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
							</svg>
						</a>
						<a href="https://linkedin.com/company/albion" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center w-10 h-10 rounded-full border-2 border-black text-black no-underline transition-colors duration-200 hover:border-[#0077b5] hover:text-[#0077b5]" aria-label="Follow Albion on LinkedIn">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
								<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
							</svg>
						</a>
						<a href="https://t.me/albion" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center w-10 h-10 rounded-full border-2 border-black text-black no-underline transition-colors duration-200 hover:border-[#0088cc] hover:text-[#0088cc]" aria-label="Join Albion on Telegram">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
								<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
							</svg>
						</a>
						<a href="https://discord.gg/albion" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center w-10 h-10 rounded-full border-2 border-black text-black no-underline transition-colors duration-200 hover:border-[#5865f2] hover:text-[#5865f2]" aria-label="Join Albion on Discord">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
								<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.30zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
							</svg>
						</a>
					</div>
				</div>
			</div>
			<div class="pt-8 border-t border-white text-center">
				<p class="text-black text-sm">&copy; 2025 Albion. All rights reserved.</p>
			</div>
		</div>
	</footer>
</div>

<!-- Wallet Modal -->
<WalletModal 
	isOpen={showWalletModal}
	on:connect={handleWalletConnect}
	on:close={() => showWalletModal = false}
/>

