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

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleClose();
		}
	}
	
	// Tailwind class mappings
	$: backdropClasses = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4';
	$: modalClasses = 'bg-white border-2 border-black w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl';
	$: headerClasses = 'flex justify-between items-center px-8 py-6 border-b border-light-gray';
	$: titleClasses = 'typography-h2 text-black uppercase tracking-wide';
	$: closeClasses = 'bg-transparent border-none text-3xl text-black cursor-pointer w-10 h-10 flex items-center justify-center hover:text-primary transition-colors duration-200';
	$: bodyClasses = 'p-8';
	$: footerClasses = 'px-8 py-6 border-t border-light-gray';
	
	// Placeholder banner classes
	$: placeholderBannerClasses = 'bg-light-gray border border-light-gray p-6 mb-8 text-center';
	$: placeholderIconClasses = 'text-4xl mb-3';
	$: placeholderTitleClasses = 'font-extrabold text-black uppercase tracking-wide mb-2';
	$: placeholderTextClasses = 'text-sm text-black';
	
	// Wallet options classes
	$: walletOptionsClasses = 'space-y-4 mb-8';
	$: walletOptionClasses = 'border border-light-gray p-6 hover:border-primary transition-colors duration-200 cursor-pointer flex justify-between items-center';
	$: walletOptionContentClasses = 'flex items-center gap-4';
	$: walletIconClasses = 'text-3xl';
	$: walletNameClasses = 'font-extrabold text-black text-base uppercase tracking-wide';
	$: walletDescClasses = 'text-sm text-black mt-1';
	$: walletBadgeClasses = 'px-3 py-1 text-xs font-bold uppercase tracking-wide text-white';
	$: walletBadgePrimaryClasses = 'bg-primary';
	$: walletBadgeSecondaryClasses = 'bg-secondary';
	$: walletBadgeSecureClasses = 'bg-primary';
	
	// Info section classes
	$: infoSectionClasses = 'bg-white border border-light-gray p-6';
	$: infoTitleClasses = 'font-extrabold text-black text-base uppercase tracking-wide mb-4';
	$: infoListClasses = 'space-y-3 text-sm text-black';
	$: infoItemClasses = 'flex items-start gap-3';
	$: infoBulletClasses = 'text-primary';
	
	// Button classes
	$: connectButtonClasses = 'w-full bg-black text-white py-3 px-6 font-semibold uppercase tracking-wide border-2 border-black hover:bg-secondary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';
	$: spinnerClasses = 'w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin';
	
	// Security notice classes
	$: securityNoticeClasses = 'flex items-center justify-center gap-2 mt-4 text-xs text-black';
	$: securityIconClasses = 'text-primary';
</script>

{#if isOpen}
	<div class={backdropClasses} on:click={handleBackdropClick} on:keydown={handleKeydown} role="dialog" aria-modal="true" tabindex="-1">
		<div class={modalClasses}>
			<div class={headerClasses}>
				<h2 class={titleClasses}>Connect Your Wallet</h2>
				{#if !isConnecting}
					<button class={closeClasses} on:click={handleClose}>&times;</button>
				{/if}
			</div>
			
			<div class={bodyClasses}>
				<div class={placeholderBannerClasses}>
					<div class={placeholderIconClasses}>🚧</div>
					<h3 class={placeholderTitleClasses}>PLACEHOLDER MODAL</h3>
					<p class={placeholderTextClasses}>This is a mock wallet connection interface for demonstration purposes.</p>
				</div>
				
				<div class={walletOptionsClasses}>
					<div class={walletOptionClasses}>
						<div class={walletOptionContentClasses}>
							<div class={walletIconClasses}>🦊</div>
							<div>
								<h4 class={walletNameClasses}>MetaMask</h4>
								<p class={walletDescClasses}>Connect using browser extension</p>
							</div>
						</div>
						<span class="{walletBadgeClasses} {walletBadgePrimaryClasses}">Most Popular</span>
					</div>
					
					<div class={walletOptionClasses}>
						<div class={walletOptionContentClasses}>
							<div class={walletIconClasses}>👛</div>
							<div>
								<h4 class={walletNameClasses}>WalletConnect</h4>
								<p class={walletDescClasses}>Connect using mobile wallet</p>
							</div>
						</div>
						<span class="{walletBadgeClasses} {walletBadgeSecondaryClasses}">Mobile</span>
					</div>
					
					<div class={walletOptionClasses}>
						<div class={walletOptionContentClasses}>
							<div class={walletIconClasses}>🔗</div>
							<div>
								<h4 class={walletNameClasses}>Coinbase Wallet</h4>
								<p class={walletDescClasses}>Connect using Coinbase</p>
							</div>
						</div>
						<span class="{walletBadgeClasses} {walletBadgeSecureClasses}">Secure</span>
					</div>
				</div>
				
				<div class={infoSectionClasses}>
					<h4 class={infoTitleClasses}>Why Connect a Wallet?</h4>
					<ul class={infoListClasses}>
						<li class={infoItemClasses}><span class={infoBulletClasses}>•</span>View your token holdings and portfolio</li>
						<li class={infoItemClasses}><span class={infoBulletClasses}>•</span>Claim payouts and distributions</li>
						<li class={infoItemClasses}><span class={infoBulletClasses}>•</span>Purchase and manage investments</li>
						<li class={infoItemClasses}><span class={infoBulletClasses}>•</span>Access transaction history</li>
					</ul>
				</div>
			</div>
			
			<div class={footerClasses}>
				<button 
					class={connectButtonClasses}
					on:click={handleConnect}
					disabled={isConnecting}
				>
					{#if isConnecting}
						<span class={spinnerClasses}></span>
						Connecting...
					{:else}
						Confirm Mock Connection
					{/if}
				</button>
				
				<div class={securityNoticeClasses}>
					<span class={securityIconClasses}>🔒</span>
					<span>Your wallet connection is secure and encrypted</span>
				</div>
			</div>
		</div>
	</div>
{/if}

