<script lang="ts">
	import { onMount } from 'svelte';
	import { useConfigService } from '$lib/services';
	import SectionTitle from '$lib/components/components/SectionTitle.svelte';
	import { PageLayout, HeroSection, ContentSection } from '$lib/components/layout';
	
	let companyInfo: any = {};
	const configService = useConfigService();
	
	onMount(() => {
		try {
			companyInfo = configService.getCompanyConfig();
		} catch (error) {
			console.error('Failed to load company info:', error);
		}
	});
</script>

<svelte:head>
	<title>Support - Albion</title>
	<meta name="description" content="Get support for the Albion platform - FAQs, resources, and contact information" />
</svelte:head>

<PageLayout>
	<!-- Hero Section -->
	<HeroSection 
		title="Support"
		subtitle="Find answers to your questions and get help with the Albion platform."
		showBorder={true}
	/>

	<!-- FAQ Section -->
	<ContentSection background="white" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-12">Frequently Asked Questions</SectionTitle>
		
		<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
			<div class="bg-white p-8 text-left border border-light-gray">
				<SectionTitle level="h3" size="small" uppercase>How do I start investing?</SectionTitle>
				<p class="text-sm text-black">Create an account, complete KYC verification, connect your wallet, and browse available assets to make your first investment.</p>
			</div>
			
			<div class="bg-white p-8 text-left border border-light-gray">
				<SectionTitle level="h3" size="small" uppercase>What is the minimum investment?</SectionTitle>
				<p class="text-sm text-black">Minimum investments vary by asset, typically ranging from $1,000 to $5,000 depending on the tranche selected.</p>
			</div>
			
			<div class="bg-white p-8 text-left border border-light-gray">
				<SectionTitle level="h3" size="small" uppercase>How often are payouts distributed?</SectionTitle>
				<p class="text-sm text-black">Payouts are distributed monthly based on actual production revenue from the underlying oil & gas assets.</p>
			</div>
			
			<div class="bg-white p-8 text-left border border-light-gray">
				<SectionTitle level="h3" size="small" uppercase>Can I sell my tokens?</SectionTitle>
				<p class="text-sm text-black">Secondary market trading will be available in Q2 2024. Currently, tokens can be held until asset maturity.</p>
			</div>
			
			<div class="bg-white p-8 text-left border border-light-gray">
				<SectionTitle level="h3" size="small" uppercase>How do I claim my payouts?</SectionTitle>
				<p class="text-sm text-black">Visit the Claims page in your portfolio to view and claim available payouts from your token holdings.</p>
			</div>
			
			<div class="bg-white p-8 text-left border border-light-gray">
				<SectionTitle level="h3" size="small" uppercase>What wallet types are supported?</SectionTitle>
				<p class="text-sm text-black">We support MetaMask, WalletConnect, and other popular Ethereum wallets. Make sure your wallet is connected to the correct network.</p>
			</div>
		</div>
	</ContentSection>

	<!-- Support Resources -->
	<ContentSection background="secondary" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-12 text-white">Support Resources</SectionTitle>
		
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			<div class="bg-white/10 border border-white/20 p-8 text-center">
				<div class="text-5xl mb-4">📚</div>
				<SectionTitle level="h3" size="small" uppercase textColor="white">Knowledge Base</SectionTitle>
				<p class="mb-6 opacity-90 text-sm">Comprehensive guides and tutorials</p>
				<a href="/help" class="text-primary no-underline font-semibold text-sm uppercase tracking-wider hover:opacity-80 transition-opacity duration-200">Browse Articles</a>
			</div>
			
			<div class="bg-white/10 border border-white/20 p-8 text-center">
				<div class="text-5xl mb-4">🎥</div>
				<SectionTitle level="h3" size="small" uppercase textColor="white">Video Tutorials</SectionTitle>
				<p class="mb-6 opacity-90 text-sm">Step-by-step platform walkthroughs</p>
				<a href="/tutorials" class="text-primary no-underline font-semibold text-sm uppercase tracking-wider hover:opacity-80 transition-opacity duration-200">Watch Videos</a>
			</div>
			
			<div class="bg-white/10 border border-white/20 p-8 text-center">
				<div class="text-5xl mb-4">💬</div>
				<SectionTitle level="h3" size="small" uppercase textColor="white">Community Forum</SectionTitle>
				<p class="mb-6 opacity-90 text-sm">Connect with other investors</p>
				<a href="/community" class="text-primary no-underline font-semibold text-sm uppercase tracking-wider hover:opacity-80 transition-opacity duration-200">Join Discussion</a>
			</div>
		</div>
	</ContentSection>

	<!-- Get Help Section -->
	<ContentSection background="white" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-12">Still Need Help?</SectionTitle>
		
		<div class="max-w-4xl mx-auto">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
				<!-- Email Support -->
				<div class="bg-light-gray border border-light-gray p-8 text-center">
					<div class="text-5xl mb-4">📧</div>
					<SectionTitle level="h3" size="small" uppercase className="mb-4">Email Support</SectionTitle>
					<p class="text-black mb-6">Get personalized help from our support team</p>
					<a 
						href="mailto:contact@albion.exchange" 
						class="inline-block px-6 py-3 bg-black text-white border-none font-figtree font-extrabold text-sm uppercase tracking-wider cursor-pointer transition-colors duration-200 hover:bg-secondary no-underline"
					>
						contact@albion.exchange
					</a>
					<p class="text-xs text-black opacity-70 mt-4">We respond within 24 hours</p>
				</div>

				<!-- Telegram Support -->
				<div class="bg-light-gray border border-light-gray p-8 text-center">
					<div class="text-5xl mb-4">💬</div>
					<SectionTitle level="h3" size="small" uppercase className="mb-4">Telegram Community</SectionTitle>
					<p class="text-black mb-6">Join our community for real-time discussions and support</p>
					<a 
						href="https://t.me/albion_support" 
						target="_blank" 
						rel="noopener noreferrer"
						class="inline-block px-6 py-3 bg-[#0088cc] text-white border-none font-figtree font-extrabold text-sm uppercase tracking-wider cursor-pointer transition-colors duration-200 hover:bg-[#0077b5] no-underline"
					>
						Join Telegram
					</a>
					<p class="text-xs text-black opacity-70 mt-4">Active community support</p>
				</div>
			</div>

			<!-- Additional Support Info -->
			<div class="mt-12 text-center">
				<div class="bg-white border border-light-gray p-8">
					<SectionTitle level="h3" size="small" uppercase className="mb-4">Support Hours</SectionTitle>
					<div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
						<div>
							<p class="font-semibold text-black mb-1">Email Support</p>
							<p class="text-black opacity-70">24/7 - We aim to respond within 24 hours</p>
						</div>
						<div>
							<p class="font-semibold text-black mb-1">Telegram Community</p>
							<p class="text-black opacity-70">24/7 - Community-driven support</p>
						</div>
						<div>
							<p class="font-semibold text-black mb-1">Platform Status</p>
							<p class="text-black opacity-70">Check <a href="/status" class="text-primary hover:opacity-80">status.albion.exchange</a></p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</ContentSection>
</PageLayout>

