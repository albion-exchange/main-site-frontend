<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/atoms';
	import { modalState } from '$lib/stores/ui';

	let showWalletModal = false;

	// Reactive values for navigation state
	$: currentPath = $page.url.pathname;
	$: isHome = currentPath === '/';
	$: isAbout = currentPath === '/about';
	$: isAssets = currentPath === '/assets' || currentPath.startsWith('/assets/');
	$: isPortfolio = currentPath === '/portfolio';
	$: isClaims = currentPath === '/claims';
	$: isContact = currentPath === '/contact';
	$: isLegal = currentPath.startsWith('/legal/');

	// Subscribe to modal state
	$: showWalletModal = $modalState.showWalletModal;

	function closeModal() {
		modalState.hideWalletModal();
	}

	onMount(() => {
		// Any initialization logic
	});
</script>

<div class="flex flex-col min-h-screen bg-gray-50">
	<!-- Fixed Header -->
	<header class="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-gray-200 z-50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-16">
				<!-- Logo -->
				<div class="flex items-center">
					<a href="/" class="flex items-center space-x-3">
						<img src="/logo.svg" alt="Albion Logo" class="h-8 w-8" />
						<span class="text-xl font-bold text-gray-900">Albion</span>
					</a>
				</div>

				<!-- Desktop Navigation -->
				<nav class="hidden md:flex items-center space-x-8">
					<a
						href="/"
						class="text-sm font-medium transition-colors duration-200 {isHome
							? 'text-blue-600'
							: 'text-gray-700 hover:text-blue-600'}"
					>
						Home
					</a>
					<a
						href="/about"
						class="text-sm font-medium transition-colors duration-200 {isAbout
							? 'text-blue-600'
							: 'text-gray-700 hover:text-blue-600'}"
					>
						About
					</a>
					<a
						href="/assets"
						class="text-sm font-medium transition-colors duration-200 {isAssets
							? 'text-blue-600'
							: 'text-gray-700 hover:text-blue-600'}"
					>
						Assets
					</a>
					<a
						href="/portfolio"
						class="text-sm font-medium transition-colors duration-200 {isPortfolio
							? 'text-blue-600'
							: 'text-gray-700 hover:text-blue-600'}"
					>
						Portfolio
					</a>
					<a
						href="/claims"
						class="text-sm font-medium transition-colors duration-200 {isClaims
							? 'text-blue-600'
							: 'text-gray-700 hover:text-blue-600'}"
					>
						Claims
					</a>
					<a
						href="/contact"
						class="text-sm font-medium transition-colors duration-200 {isContact
							? 'text-blue-600'
							: 'text-gray-700 hover:text-blue-600'}"
					>
						Contact
					</a>
				</nav>

				<!-- Wallet Connection Button -->
				<div class="flex items-center space-x-4">
					<Button
						variant="secondary"
						size="small"
						on:click={() => modalState.showWalletModal()}
						class="hidden sm:inline-flex"
					>
						<svg
							class="w-4 h-4 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
							></path>
						</svg>
						Connect Wallet
					</Button>

					<!-- Mobile menu button -->
					<Button
						variant="secondary"
						size="small"
						class="md:hidden"
						ariaLabel="Open mobile menu"
					>
						<svg
							class="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 6h16M4 12h16M4 18h16"
							></path>
						</svg>
					</Button>
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content with top padding for fixed header -->
	<main class="flex-1 pt-16">
		<slot />
	</main>

	<!-- Footer -->
	<footer class="bg-gray-900 text-white">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
			<div class="grid grid-cols-1 md:grid-cols-4 gap-8">
				<!-- Company Info -->
				<div class="space-y-4">
					<div class="flex items-center space-x-3">
						<img src="/logo.svg" alt="Albion Logo" class="h-8 w-8" />
						<span class="text-xl font-bold">Albion</span>
					</div>
					<p class="text-gray-400 text-sm">
						Democratizing access to institutional-grade oil & gas investments through blockchain technology.
					</p>
				</div>

				<!-- Quick Links -->
				<div>
					<h3 class="text-sm font-semibold mb-4">Platform</h3>
					<ul class="space-y-2 text-sm text-gray-400">
						<li><a href="/assets" class="hover:text-white transition-colors">Browse Assets</a></li>
						<li><a href="/portfolio" class="hover:text-white transition-colors">Portfolio</a></li>
						<li><a href="/claims" class="hover:text-white transition-colors">Claims</a></li>
					</ul>
				</div>

				<!-- Resources -->
				<div>
					<h3 class="text-sm font-semibold mb-4">Resources</h3>
					<ul class="space-y-2 text-sm text-gray-400">
						<li><a href="/about" class="hover:text-white transition-colors">About</a></li>
						<li><a href="/contact" class="hover:text-white transition-colors">Contact</a></li>
						<li><a href="/legal/terms" class="hover:text-white transition-colors">Terms</a></li>
						<li><a href="/legal/privacy" class="hover:text-white transition-colors">Privacy</a></li>
					</ul>
				</div>

				<!-- Social & Contact -->
				<div>
					<h3 class="text-sm font-semibold mb-4">Connect</h3>
					<div class="flex space-x-4">
						<a href="https://twitter.com/albion" target="_blank" rel="noopener noreferrer" class="text-gray-400 hover:text-white transition-colors">
							<span class="sr-only">Twitter</span>
							<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
								<path
									d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"
								/>
							</svg>
						</a>
						<a href="https://linkedin.com/company/albion" target="_blank" rel="noopener noreferrer" class="text-gray-400 hover:text-white transition-colors">
							<span class="sr-only">LinkedIn</span>
							<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
									clip-rule="evenodd"
								/>
							</svg>
						</a>
					</div>
				</div>
			</div>

			<div class="mt-8 pt-8 border-t border-gray-800">
				<p class="text-center text-xs text-gray-400">
					© 2024 Albion. All rights reserved. | Designed for institutional-grade oil & gas investments.
				</p>
			</div>
		</div>
	</footer>
</div>

