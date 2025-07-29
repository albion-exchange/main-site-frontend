<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { PageLayout, HeroSection, ContentSection } from '$lib/components/layout';
	import { PrimaryButton } from '$lib/components/components';
	
	let redirectUrl = '/';
	
	onMount(() => {
		// Check if there's a return URL in the query params
		const returnUrl = $page.url.searchParams.get('return');
		
		// If no return URL, check sessionStorage for the last visited page
		if (returnUrl) {
			// Validate the URL to prevent open redirects
			try {
				const url = new URL(returnUrl, window.location.origin);
				// Only allow internal redirects
				if (url.origin === window.location.origin) {
					redirectUrl = url.pathname + url.search + url.hash;
				}
			} catch (e) {
				// If URL parsing fails, use the returnUrl as a pathname
				if (returnUrl.startsWith('/')) {
					redirectUrl = returnUrl;
				}
			}
		} else {
			// Try to get the last page from sessionStorage
			const lastPage = sessionStorage.getItem('lastPageBeforeSubscribe');
			if (lastPage && lastPage.startsWith('/')) {
				redirectUrl = lastPage;
			} else {
				// If no stored page, check the referrer
				const referrer = document.referrer;
				if (referrer && referrer.includes(window.location.origin)) {
					try {
						const referrerUrl = new URL(referrer);
						if (referrerUrl.origin === window.location.origin) {
							redirectUrl = referrerUrl.pathname + referrerUrl.search + referrerUrl.hash;
						}
					} catch (e) {
						// Keep default redirect
					}
				}
			}
		}
	});
	
	function handleReturn() {
		// Clear the stored last page
		sessionStorage.removeItem('lastPageBeforeSubscribe');
		goto(redirectUrl);
	}
</script>

<svelte:head>
	<title>Thank You - Albion</title>
	<meta name="description" content="Thank you for subscribing to Albion updates" />
</svelte:head>

<PageLayout>
	<HeroSection 
		title="Thank You for Subscribing!"
		subtitle="You've been successfully added to our mailing list. We'll keep you updated on new investment opportunities and platform updates."
		showBorder={true}
		showButtons={false}
	/>
	
	<ContentSection background="white" padding="standard" centered>
		<div class="max-w-2xl mx-auto text-center">
			<div class="mb-8">
				<svg class="w-24 h-24 mx-auto mb-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
				</svg>
				
				<h2 class="text-2xl lg:text-3xl font-extrabold text-black mb-4">You're All Set!</h2>
				
				<p class="text-lg text-black opacity-70 mb-6">
					You'll receive an email confirmation shortly. In the meantime, feel free to explore our platform and available investment opportunities.
				</p>
				
				<div class="bg-light-gray p-6 rounded-lg mb-8">
					<h3 class="text-lg font-extrabold text-black mb-3">What's Next?</h3>
					<ul class="text-left text-black opacity-70 space-y-2">
						<li class="flex items-start">
							<span class="text-primary mr-2">•</span>
							<span>Check your email for a confirmation message</span>
						</li>
						<li class="flex items-start">
							<span class="text-primary mr-2">•</span>
							<span>Browse our available energy assets and token releases</span>
						</li>
						<li class="flex items-start">
							<span class="text-primary mr-2">•</span>
							<span>Join our community for exclusive updates and insights</span>
						</li>
					</ul>
				</div>
				
				<PrimaryButton on:click={handleReturn} size="large">
					Continue Browsing
				</PrimaryButton>
			</div>
		</div>
	</ContentSection>
</PageLayout>