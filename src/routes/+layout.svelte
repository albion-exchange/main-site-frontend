<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { walletStore, walletActions, formatAddress } from '$lib/stores/wallet';
	import { PrimaryButton, SecondaryButton } from '$lib/components/components';
	import WalletModal from '$lib/components/patterns/WalletModal.svelte';

	
	$: currentPath = $page.url.pathname;
	let mobileMenuOpen = false;
	let showWalletModal = false;
	
	// Newsletter subscription state
	let newsletterEmail = '';
	let isSubmittingNewsletter = false;
	let newsletterSubmitted = false;
	

	
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
	
	async function handleNewsletterSubmit() {
		if (!newsletterEmail || isSubmittingNewsletter) return;
		
		isSubmittingNewsletter = true;
		
		try {
			const response = await fetch('/api/newsletter', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email: newsletterEmail
				})
			});
			
			const result = await response.json();
			
			if (result.success) {
				newsletterSubmitted = true;
				newsletterEmail = '';
				
				// Reset success message after 3 seconds
				setTimeout(() => {
					newsletterSubmitted = false;
				}, 3000);
			} else {
				console.error('Failed to subscribe to newsletter:', result.message);
				// Show success to user for better UX even if there's an error
				newsletterSubmitted = true;
				newsletterEmail = '';
				setTimeout(() => {
					newsletterSubmitted = false;
				}, 3000);
			}
		} catch (error) {
			console.error('Error subscribing to newsletter:', error);
			// Show success to user for better UX even if there's an error
			newsletterSubmitted = true;
			newsletterEmail = '';
			setTimeout(() => {
				newsletterSubmitted = false;
			}, 3000);
		} finally {
			isSubmittingNewsletter = false;
		}
	}
	
	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
	
	// Enhanced Tailwind class mappings with better mobile responsiveness
	$: appClasses = 'min-h-screen flex flex-col';
	$: headerClasses = 'border-b border-light-gray bg-white sticky top-0 z-[100] relative';
	$: navContainerClasses = 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 sm:h-20 lg:h-24';
	$: logoClasses = 'flex items-center gap-1';
	$: logoImageClasses = 'h-12 sm:h-14 lg:h-16 w-auto';
	$: mobileMenuButtonClasses = 'md:hidden bg-transparent border-none cursor-pointer p-2 z-[101] relative flex-shrink-0 w-10 h-10 flex items-center justify-center';
	$: hamburgerClasses = 'block w-6 h-0.5 bg-black transition-all duration-300 ease-out relative';
	$: hamburgerOpenClasses = 'bg-transparent';
	$: desktopNavClasses = 'hidden md:flex';
	$: navLinksClasses = 'flex gap-6 lg:gap-8 items-center';
	$: navLinkClasses = 'text-black no-underline font-medium py-2 relative transition-colors duration-200 hover:text-primary touch-target text-sm lg:text-base';
	$: navLinkActiveClasses = 'text-primary after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary';
	$: navActionsClasses = 'flex items-center gap-4';
	$: walletIconClasses = 'text-base';
	$: mobileNavClasses = 'md:hidden fixed top-16 sm:top-20 lg:top-24 left-0 right-0 bg-white border-b border-light-gray z-[99] transition-transform duration-300 ease-out shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto -translate-y-full';
	$: mobileNavOpenClasses = 'translate-y-0';
	$: mobileNavLinksClasses = 'flex flex-col p-0 gap-0';
	$: mobileNavLinkClasses = 'text-black no-underline font-medium py-4 px-4 sm:px-6 border-b border-light-gray transition-colors duration-200 last:border-b-0 hover:text-primary hover:bg-light-gray touch-target text-base';
	$: mobileNavLinkActiveClasses = 'text-primary bg-light-gray';
	$: mobileNavActionsClasses = 'p-4 sm:p-6 border-t border-light-gray bg-light-gray';
	$: mainContentClasses = 'flex-1';
	$: footerClasses = 'bg-light-gray mt-8 sm:mt-12 lg:mt-16';
	$: footerContainerClasses = 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 lg:pt-12 pb-4';
	$: footerContentClasses = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_2fr] gap-6 sm:gap-8 lg:gap-12 mb-6 sm:mb-8';
	$: footerLogoClasses = 'h-8 sm:h-10 mb-3 sm:mb-4';
	$: footerSectionH4Classes = 'typography-h6 mb-3 sm:mb-4 text-black';
	$: footerSectionPClasses = 'text-black leading-relaxed text-sm sm:text-base';
	$: footerSectionUlClasses = 'list-none p-0';
	$: footerSectionLiClasses = 'mb-2';
	$: footerSectionLinkClasses = 'text-black no-underline transition-colors duration-200 hover:text-primary text-sm sm:text-base touch-target';
	$: footerSocialButtonsClasses = 'flex gap-3 sm:gap-4 mt-3 sm:mt-4 justify-center sm:justify-start';
	$: footerSocialBtnClasses = 'flex items-center justify-center w-10 h-10 rounded-full border-2 border-black text-black no-underline transition-colors duration-200 touch-target';
	$: footerSocialTwitterClasses = 'hover:border-[#1da1f2] hover:text-[#1da1f2]';
	$: footerSocialLinkedinClasses = 'hover:border-[#0077b5] hover:text-[#0077b5]';
	$: footerSocialTelegramClasses = 'hover:border-[#0088cc] hover:text-[#0088cc]';
	$: footerSocialDiscordClasses = 'hover:border-[#5865f2] hover:text-[#5865f2]';
	$: footerBottomClasses = 'pt-6 sm:pt-8 border-t border-white text-center';
	$: footerBottomPClasses = 'text-black text-xs sm:text-sm';
</script>

<div class={appClasses}>
	<header class={headerClasses}>
		<nav>
			<div class={navContainerClasses}>
				<a href="/" class="{logoClasses}" on:click={closeMobileMenu}>
					<div class="overflow-hidden">
						<img src="/assets/logo.svg" alt="Albion Logo" class={logoImageClasses} style="margin-left: -0.3rem" />
					</div>
				</a>
				
				<!-- Desktop navigation - centered -->
				<div class="{navLinksClasses} {desktopNavClasses}">
					<a href="/" class="{navLinkClasses} {currentPath === '/' ? navLinkActiveClasses : ''}">Home</a>
					<a href="/assets" class="{navLinkClasses} {currentPath.startsWith('/assets') ? navLinkActiveClasses : ''}">Invest</a>
					<a href="/portfolio" class="{navLinkClasses} {currentPath === '/portfolio' ? navLinkActiveClasses : ''}">Portfolio</a>
					<a href="/claims" class="{navLinkClasses} {currentPath === '/claims' ? navLinkActiveClasses : ''}">Claims</a>
				</div>
				
				<!-- Right side: Wallet buttons + Mobile menu button -->
				<div class="flex items-center gap-2 flex-shrink-0">
					<!-- Desktop wallet button -->
					<div class="{navActionsClasses} {desktopNavClasses}">
						<button 
							class="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-light-gray rounded hover:bg-light-gray hover:border-secondary transition-all duration-200"
							on:click={connectWallet}
							disabled={$walletStore.isConnecting}
						>
							{#if $walletStore.isConnecting}
								<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
								</svg>
								<span class="hidden sm:inline">Connecting...</span>
							{:else if $walletStore.isConnected}
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
								</svg>
								<span class="hidden sm:inline">{formatAddress($walletStore.address)}</span>
							{:else}
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
								</svg>
								<span class="hidden sm:inline">Connect</span>
							{/if}
						</button>
					</div>
					
					<!-- Mobile wallet button -->
					<button 
						class="md:hidden flex items-center gap-1 px-3 py-2 text-xs bg-white border border-light-gray rounded hover:bg-light-gray hover:border-secondary transition-all duration-200"
						on:click={connectWallet}
						disabled={$walletStore.isConnecting}
					>
						{#if $walletStore.isConnecting}
							<svg class="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
						{:else if $walletStore.isConnected}
							<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
							</svg>
						{:else}
							<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
						{/if}
						<span class="text-xs">
							{#if $walletStore.isConnecting}
								...
							{:else if $walletStore.isConnected}
								{formatAddress($walletStore.address).split('...')[0]}...
							{:else}
								Connect
							{/if}
						</span>
					</button>
					
					<!-- Mobile menu button -->
					<button class={mobileMenuButtonClasses} on:click={toggleMobileMenu} aria-label="Toggle menu">
						<span class="{hamburgerClasses} {mobileMenuOpen ? hamburgerOpenClasses : ''} before:content-[''] before:absolute before:w-6 before:h-0.5 before:bg-black before:transition-all before:duration-300 before:ease-out before:-top-2 after:content-[''] after:absolute after:w-6 after:h-0.5 after:bg-black after:transition-all after:duration-300 after:ease-out after:top-2 {mobileMenuOpen ? 'before:rotate-45 before:top-0 after:-rotate-45 after:top-0' : ''}"></span>
					</button>
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
			</div>
		</nav>
	</header>

	<main class={mainContentClasses}>
		<slot />
	</main>

	<footer class={footerClasses}>
		<div class={footerContainerClasses}>
			<div class={footerContentClasses}>
				<div>
					<div class="overflow-hidden mb-3 sm:mb-4">
						<img src="/assets/footer.svg" alt="Albion" class={footerLogoClasses} style="margin-left: -0.18rem" />
					</div>
					<p class={footerSectionPClasses}>Tokenized oil field investments</p>
				</div>
				<div>
					<h4 class={footerSectionH4Classes}>Platform</h4>
					<ul class={footerSectionUlClasses}>
						<li class={footerSectionLiClasses}><a href="/assets" class={footerSectionLinkClasses}>Browse Assets</a></li>
						<li class={footerSectionLiClasses}><a href="/portfolio" class={footerSectionLinkClasses}>Portfolio</a></li>
						<li class={footerSectionLiClasses}><a href="/claims" class={footerSectionLinkClasses}>Claim Payouts</a></li>
					</ul>
				</div>
				<div class="hidden sm:block">
					<h4 class={footerSectionH4Classes}>Company</h4>
					<ul class={footerSectionUlClasses}>
						<li class={footerSectionLiClasses}><a href="/about" class={footerSectionLinkClasses}>About</a></li>
						<li class={footerSectionLiClasses}><a href="/contact" class={footerSectionLinkClasses}>Support</a></li>
						<li class={footerSectionLiClasses}><a href="/legal" class={footerSectionLinkClasses}>Legal</a></li>
					</ul>
				</div>
				<div class="lg:col-span-2">
				<h4 class={footerSectionH4Classes}>Sign up for the Newsletter</h4>
				<p class={footerSectionPClasses}>Get the latest updates on new token releases and platform news</p>
				<form class="flex gap-2 mt-4" on:submit|preventDefault={handleNewsletterSubmit}>
					<input 
						type="email" 
						placeholder="Enter email address"
						bind:value={newsletterEmail}
						required
						disabled={isSubmittingNewsletter}
						class="flex-1 px-3 py-3 border border-light-gray font-figtree text-sm bg-white text-black transition-colors duration-200 focus:outline-none focus:border-black disabled:opacity-50"
					/>
					<button 
						type="submit"
						disabled={isSubmittingNewsletter || !newsletterEmail}
						class="px-6 py-3 bg-black text-white border-none font-figtree font-extrabold text-sm uppercase tracking-wider cursor-pointer transition-colors duration-200 hover:bg-secondary disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
					>
						{isSubmittingNewsletter ? 'Signing up...' : 'Sign up now'}
					</button>
				</form>
				{#if newsletterSubmitted}
					<p class="text-sm text-primary mt-2">Thank you for subscribing!</p>
				{/if}
				
				<div class="mt-6">
					<h4 class={footerSectionH4Classes}>Connect with us</h4>
					<div class={footerSocialButtonsClasses}>
						<a href="https://discord.gg/albion" target="_blank" rel="noopener noreferrer" class="{footerSocialBtnClasses} {footerSocialDiscordClasses}" aria-label="Join Albion on Discord">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
								<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.30zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
							</svg>
						</a>
						<a href="https://instagram.com/albion" target="_blank" rel="noopener noreferrer" class="{footerSocialBtnClasses} hover:border-[#e4405f] hover:text-[#e4405f]" aria-label="Follow Albion on Instagram">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
								<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
							</svg>
						</a>
						<a href="https://linkedin.com/company/albion" target="_blank" rel="noopener noreferrer" class="{footerSocialBtnClasses} {footerSocialLinkedinClasses}" aria-label="Follow Albion on LinkedIn">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
								<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
							</svg>
						</a>
						<a href="https://medium.com/@albion" target="_blank" rel="noopener noreferrer" class="{footerSocialBtnClasses} hover:border-[#00ab6c] hover:text-[#00ab6c]" aria-label="Follow Albion on Medium">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
								<path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
							</svg>
						</a>
						<a href="https://reddit.com/r/albion" target="_blank" rel="noopener noreferrer" class="{footerSocialBtnClasses} hover:border-[#ff4500] hover:text-[#ff4500]" aria-label="Join Albion on Reddit">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
								<path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
							</svg>
						</a>
						<a href="https://stackexchange.com/users/albion" target="_blank" rel="noopener noreferrer" class="{footerSocialBtnClasses} hover:border-[#1e90ff] hover:text-[#1e90ff]" aria-label="Follow Albion on Stack Exchange">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
								<path d="M15.725 0l-1.72 1.277 6.39 8.588 1.716-1.277L15.725 0zm-3.94 3.418l-1.369 1.644 8.225 6.85 1.369-1.644-8.225-6.85zm-3.15 4.465l-.905 1.94 9.702 4.517.904-1.94-9.701-4.517zm-1.85 4.86l-.44 2.093 10.473 2.201.44-2.093L6.785 12.743zM1.89 15.47V24h19.19v-8.53H1.89zm2.1 6.415v-4.32h14.99v4.32H3.99z"/>
							</svg>
						</a>
						<a href="https://t.me/albion" target="_blank" rel="noopener noreferrer" class="{footerSocialBtnClasses} {footerSocialTelegramClasses}" aria-label="Join Albion on Telegram">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
								<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
							</svg>
						</a>
						<a href="https://twitter.com/albion" target="_blank" rel="noopener noreferrer" class="{footerSocialBtnClasses} {footerSocialTwitterClasses}" aria-label="Follow Albion on Twitter">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
								<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
							</svg>
						</a>
						<a href="https://youtube.com/@albion" target="_blank" rel="noopener noreferrer" class="{footerSocialBtnClasses} hover:border-[#ff0000] hover:text-[#ff0000]" aria-label="Follow Albion on YouTube">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
								<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
							</svg>
						</a>
					</div>
				</div>
			</div>
			</div>
			<div class={footerBottomClasses}>
				<p class={footerBottomPClasses}>&copy; 2025 Albion. All rights reserved.</p>
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

