<script lang="ts">
	import { page } from '$app/stores';
	import { createQuery } from '@tanstack/svelte-query';
	import { getSftMetadata } from '$lib/queries/getSftMetadata';
	import { getSfts } from '$lib/queries/getSfts';
	import { sftMetadata, sfts } from '$lib/stores';
	import { web3Modal, signerAddress, connected, loading, disconnectWagmi } from 'svelte-wagmi';
	import { PrimaryButton, SecondaryButton } from '$lib/components/components';
	import { formatAddress } from '$lib/utils/formatters';
	import { slide } from 'svelte/transition';
	
	$: currentPath = $page.url.pathname;
	let mobileMenuOpen = false;
	
	// Real wallet connection
	async function connectWallet() {
		if ($connected && $signerAddress) {
			// Disconnect wallet
			await disconnectWagmi();
			return;
		}
		
		// Open Web3Modal for wallet connection
		$web3Modal.open();
	}
	
	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}
	
	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	$: query = createQuery({
		queryKey: ['getSftMetadata'],
		queryFn: () => {
			return getSftMetadata();
		}
	});
	$: if ($query && $query.data) {
		sftMetadata.set($query.data);
	}

	$: vaultQuery = createQuery({
		queryKey: ['getSfts'],
		queryFn: () => {
			return getSfts();
		}
	});
	$: sfts.set($vaultQuery.data);
	

	
	// Enhanced Tailwind class mappings with better mobile responsiveness
	$: appClasses = 'min-h-screen flex flex-col';
	$: headerClasses = 'border-b border-light-gray bg-white sticky top-0 z-[100]';
	$: navContainerClasses = 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 sm:h-20 lg:h-24';
	$: logoClasses = 'flex items-center gap-1';
	$: logoImageClasses = 'h-12 sm:h-14 lg:h-16 w-auto';
	$: mobileMenuButtonClasses = 'md:hidden bg-transparent border-none cursor-pointer p-2 z-[101] touch-target';
	$: hamburgerClasses = 'block w-6 h-0.5 bg-black transition-all duration-300 ease-out relative';
	$: hamburgerOpenClasses = 'bg-transparent';
	$: desktopNavClasses = 'hidden md:flex';
	$: navLinksClasses = 'flex gap-6 lg:gap-8 items-center';
	$: navLinkClasses = 'text-black no-underline font-medium py-2 relative transition-colors duration-200 hover:text-primary touch-target text-sm lg:text-base';
	$: navLinkActiveClasses = 'text-primary after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary';
	$: mobileNavClasses = 'md:hidden fixed top-16 left-0 right-0 bg-white border-b border-light-gray z-[99] shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto';
	$: mobileNavLinksClasses = 'flex flex-col p-0 gap-0';
	$: mobileNavLinkClasses = 'text-black no-underline font-medium py-4 px-4 sm:px-6 border-b border-light-gray transition-colors duration-200 last:border-b-0 hover:text-primary hover:bg-light-gray touch-target text-base';
	$: mobileNavLinkActiveClasses = 'text-primary bg-light-gray';
	$: mobileNavActionsClasses = 'p-4 sm:p-6 border-t border-light-gray bg-light-gray';
	$: mainContentClasses = 'flex-1';
	$: footerClasses = 'bg-light-gray mt-8 sm:mt-12 lg:mt-16';
	$: footerContainerClasses = 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 lg:pt-12 pb-4';
	$: footerContentClasses = 'grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12 mb-6 sm:mb-8';
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
				<a href="/" class="{logoClasses} z-[102]" on:click={closeMobileMenu}>
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
				
				<!-- Right side: Wallet button + Mobile menu button -->
				<div class="flex items-center gap-2 flex-shrink-0">
					<!-- Wallet button (responsive for both desktop and mobile) -->
					<button 
						class="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm bg-white border border-light-gray rounded hover:bg-light-gray hover:border-secondary transition-all duration-200"
						on:click={connectWallet}
						disabled={$loading}
					>
						{#if $loading}
							<svg class="w-3 h-3 sm:w-4 sm:h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
							<span class="hidden sm:inline">Connecting...</span>
							<span class="sm:hidden">...</span>
						{:else if $connected && $signerAddress}
							<svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
							</svg>
							<span class="hidden sm:inline">{formatAddress($signerAddress)}</span>
							<span class="sm:hidden">{formatAddress($signerAddress).split('...')[0]}...</span>
						{:else}
							<svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
							<span>Connect</span>
						{/if}
					</button>
					
					<!-- Mobile menu button -->
					<button class="md:hidden bg-transparent border-none cursor-pointer p-2 z-[101] relative flex-shrink-0 w-10 h-10 flex items-center justify-center" on:click={toggleMobileMenu} aria-label="Toggle menu">
						<div class="w-6 h-5 relative flex flex-col justify-between">
							<span class="block w-full h-0.5 bg-black transition-all duration-300 {mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}"></span>
							<span class="block w-full h-0.5 bg-black transition-all duration-300 {mobileMenuOpen ? 'opacity-0' : ''}"></span>
							<span class="block w-full h-0.5 bg-black transition-all duration-300 {mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}"></span>
						</div>
					</button>
				</div>
			</div>
			
			<!-- Mobile navigation menu -->
			{#if mobileMenuOpen}
			<div class={mobileNavClasses} transition:slide={{ duration: 300 }}>
				<div class={mobileNavLinksClasses}>
					<a href="/" class="{mobileNavLinkClasses} {currentPath === '/' ? mobileNavLinkActiveClasses : ''}" on:click={closeMobileMenu}>Home</a>
					<a href="/assets" class="{mobileNavLinkClasses} {currentPath.startsWith('/assets') ? mobileNavLinkActiveClasses : ''}" on:click={closeMobileMenu}>Invest</a>
					<a href="/portfolio" class="{mobileNavLinkClasses} {currentPath === '/portfolio' ? mobileNavLinkActiveClasses : ''}" on:click={closeMobileMenu}>Portfolio</a>
					<a href="/claims" class="{mobileNavLinkClasses} {currentPath === '/claims' ? mobileNavLinkActiveClasses : ''}" on:click={closeMobileMenu}>Claims</a>
				</div>
			</div>
			{/if}
		</nav>
	</header>

	<main class={mainContentClasses}>
		<slot />
	</main>

	<footer class={footerClasses}>
		<div class={footerContainerClasses}>
			<div class={footerContentClasses}>
				<!-- Left Column: Brand -->
				<div class="flex flex-col">
					<div class="overflow-hidden mb-3 sm:mb-4">
						<img src="/assets/footer.svg" alt="Albion" class={footerLogoClasses} style="margin-left: -0.18rem" />
					</div>
					<p class={footerSectionPClasses}>Tokenized oil field investments</p>
					<div class="mt-auto pt-6 lg:pt-8">
						<p class="text-black text-sm">&copy; 2025 Albion. All rights reserved.</p>
					</div>
				</div>

				<!-- Middle Column: Newsletter & Social -->
				<div class="flex flex-col lg:order-2">
					<h4 class={footerSectionH4Classes}>Sign up for the Newsletter</h4>
					<p class={footerSectionPClasses}>Get the latest updates on new token releases and platform news</p>
					
					<!-- MailChimp Newsletter Signup Form -->
					<div id="mc_embed_signup" class="mt-4">
						<form action="https://your-domain.us1.list-manage.com/subscribe/post?u=YOUR_USER_ID&id=YOUR_LIST_ID" 
							  method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" target="_blank">
							<div id="mc_embed_signup_scroll" class="flex gap-2">
								<input type="email" value="" name="EMAIL" 
									   placeholder="Enter email address"
									   id="mce-EMAIL" required
									   class="flex-1 px-3 py-3 border border-light-gray font-figtree text-sm bg-white text-black transition-colors duration-200 focus:outline-none focus:border-black"
								/>
								<!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
								<div style="position: absolute; left: -5000px;" aria-hidden="true">
									<input type="text" name="b_YOUR_USER_ID_YOUR_LIST_ID" tabindex="-1" value="">
								</div>
								<input type="submit" value="Sign up" name="subscribe" id="mc-embedded-subscribe"
									   class="px-4 py-3 bg-black text-white border-none font-figtree font-extrabold text-sm uppercase tracking-wider cursor-pointer transition-colors duration-200 hover:bg-secondary whitespace-nowrap"
								/>
							</div>
						</form>
					</div>

					<div class="mt-6">
						<h4 class={footerSectionH4Classes}>Connect with us</h4>
						<div class={footerSocialButtonsClasses}>
							<a href="https://twitter.com/albion" target="_blank" rel="noopener noreferrer" class="{footerSocialBtnClasses} {footerSocialTwitterClasses}" aria-label="Follow Albion on Twitter">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
									<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
								</svg>
							</a>
							<a href="https://linkedin.com/company/albion" target="_blank" rel="noopener noreferrer" class="{footerSocialBtnClasses} {footerSocialLinkedinClasses}" aria-label="Follow Albion on LinkedIn">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
									<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
								</svg>
							</a>
							<a href="https://t.me/albion" target="_blank" rel="noopener noreferrer" class="{footerSocialBtnClasses} {footerSocialTelegramClasses}" aria-label="Join Albion on Telegram">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
									<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
								</svg>
							</a>
							<a href="https://discord.gg/albion" target="_blank" rel="noopener noreferrer" class="{footerSocialBtnClasses} {footerSocialDiscordClasses}" aria-label="Join Albion on Discord">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
									<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.30zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
								</svg>
							</a>
						</div>
					</div>
				</div>

				<!-- Right Column: Navigation -->
				<div class="flex flex-col lg:order-3">
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 lg:gap-8">
						<div class="lg:text-right">
							<h4 class="{footerSectionH4Classes} lg:text-right">Platform</h4>
							<ul class="{footerSectionUlClasses} lg:text-right">
								<li class={footerSectionLiClasses}><a href="/assets" class={footerSectionLinkClasses}>Browse Assets</a></li>
								<li class={footerSectionLiClasses}><a href="/portfolio" class={footerSectionLinkClasses}>Portfolio</a></li>
								<li class={footerSectionLiClasses}><a href="/claims" class={footerSectionLinkClasses}>Claim Payouts</a></li>
							</ul>
						</div>
						<div class="lg:text-right">
							<h4 class="{footerSectionH4Classes} lg:text-right">Company</h4>
							<ul class="{footerSectionUlClasses} lg:text-right">
								<li class={footerSectionLiClasses}><a href="/about" class={footerSectionLinkClasses}>About</a></li>
								<li class={footerSectionLiClasses}><a href="/contact" class={footerSectionLinkClasses}>Contact</a></li>
								<li class={footerSectionLiClasses}><a href="/legal" class={footerSectionLinkClasses}>Legal</a></li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	</footer>
</div>



