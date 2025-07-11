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
	$: modalClasses = 'bg-white border-2 border-black w-full max-w-md max-h-[90vh] overflow-y-auto animate-modal-slide';
	$: headerClasses = 'flex justify-between items-center px-6 py-4 border-b border-light-gray';
	$: titleClasses = 'text-xl font-extrabold text-black uppercase tracking-wide';
	$: closeClasses = 'bg-transparent border-none text-2xl text-black cursor-pointer w-8 h-8 flex items-center justify-center hover:bg-light-gray rounded transition-colors duration-200';
	$: bodyClasses = 'p-6';
	$: footerClasses = 'px-6 py-4 border-t border-light-gray';
	
	// Placeholder banner classes
	$: placeholderBannerClasses = 'bg-yellow-50 border border-yellow-200 p-4 mb-6 text-center';
	$: placeholderIconClasses = 'text-3xl mb-2';
	$: placeholderTitleClasses = 'font-extrabold text-black uppercase tracking-wide mb-2';
	$: placeholderTextClasses = 'text-sm text-black opacity-70';
	
	// Wallet options classes
	$: walletOptionsClasses = 'space-y-3 mb-6';
	$: walletOptionClasses = 'border border-light-gray p-4 hover:bg-light-gray transition-colors duration-200 cursor-pointer flex justify-between items-center';
	$: walletOptionContentClasses = 'flex items-center gap-3';
	$: walletIconClasses = 'text-2xl';
	$: walletNameClasses = 'font-extrabold text-black text-sm uppercase tracking-wide';
	$: walletDescClasses = 'text-xs text-black opacity-70';
	$: walletBadgeClasses = 'px-2 py-1 text-xs font-bold uppercase tracking-wide text-white';
	$: walletBadgePrimaryClasses = 'bg-primary';
	$: walletBadgeSecondaryClasses = 'bg-secondary';
	$: walletBadgeSecureClasses = 'bg-green-600';
	
	// Info section classes
	$: infoSectionClasses = 'bg-light-gray p-4';
	$: infoTitleClasses = 'font-extrabold text-black text-sm uppercase tracking-wide mb-3';
	$: infoListClasses = 'space-y-2 text-sm text-black opacity-80';
	$: infoItemClasses = 'flex items-start gap-2';
	$: infoBulletClasses = 'text-primary';
	
	// Button classes
	$: connectButtonClasses = 'w-full bg-black text-white py-3 px-6 font-extrabold uppercase tracking-wide hover:bg-secondary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';
	$: spinnerClasses = 'w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin';
	
	// Security notice classes
	$: securityNoticeClasses = 'flex items-center justify-center gap-2 mt-3 text-xs text-black opacity-60';
	$: securityIconClasses = 'text-green-600';
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

