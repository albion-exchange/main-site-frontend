<script lang="ts">
	import SectionTitle from '$lib/components/components/SectionTitle.svelte';
	import { PageLayout, HeroSection, ContentSection } from '$lib/components/layout';
</script>

<svelte:head>
	<title>Support - Albion</title>
	<meta name="description" content="Get help and support for the Albion platform with our comprehensive resources and team assistance" />
</svelte:head>

<PageLayout>
	<!-- Hero Section -->
	<HeroSection 
		title="Support"
		subtitle="Get the help you need with our comprehensive support resources and dedicated team assistance."
		showBorder={true}
	/>

	<!-- Quick Help Section -->
	<ContentSection background="white" padding="standard">
		<SectionTitle level="h2" size="section" center className="mb-12">Quick Help</SectionTitle>
		
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			<div class="bg-white border border-light-gray p-8 text-center hover:shadow-md transition-shadow duration-200">
				<div class="text-5xl mb-4">📖</div>
				<SectionTitle level="h3" size="small" uppercase className="mb-4">Getting Started</SectionTitle>
				<p class="text-sm text-black mb-6">Learn how to create an account, complete KYC, and make your first investment.</p>
				<a href="/help/getting-started" class="text-primary no-underline font-semibold text-sm uppercase tracking-wider hover:opacity-80 transition-opacity duration-200">View Guide</a>
			</div>
			
			<div class="bg-white border border-light-gray p-8 text-center hover:shadow-md transition-shadow duration-200">
				<div class="text-5xl mb-4">💰</div>
				<SectionTitle level="h3" size="small" uppercase className="mb-4">Investments & Returns</SectionTitle>
				<p class="text-sm text-black mb-6">Understand how investments work, payouts are distributed, and returns are calculated.</p>
				<a href="/help/investments" class="text-primary no-underline font-semibold text-sm uppercase tracking-wider hover:opacity-80 transition-opacity duration-200">Learn More</a>
			</div>
			
			<div class="bg-white border border-light-gray p-8 text-center hover:shadow-md transition-shadow duration-200">
				<div class="text-5xl mb-4">🔒</div>
				<SectionTitle level="h3" size="small" uppercase className="mb-4">Security & Privacy</SectionTitle>
				<p class="text-sm text-black mb-6">Learn about our security measures, data protection, and account safety.</p>
				<a href="/help/security" class="text-primary no-underline font-semibold text-sm uppercase tracking-wider hover:opacity-80 transition-opacity duration-200">Read More</a>
			</div>
		</div>
	</ContentSection>

	<!-- FAQ Section -->
	<ContentSection background="white" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-12">Frequently Asked Questions</SectionTitle>
		
		<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
			<div class="bg-white p-8 text-left">
				<SectionTitle level="h3" size="small" uppercase>How do I start investing?</SectionTitle>
				<p class="text-sm text-black">Create an account, complete KYC verification, connect your wallet, and browse available assets to make your first investment.</p>
			</div>
			
			<div class="bg-white p-8 text-left">
				<SectionTitle level="h3" size="small" uppercase>What is the minimum investment?</SectionTitle>
				<p class="text-sm text-black">Minimum investments vary by asset, typically ranging from $1,000 to $5,000 depending on the tranche selected.</p>
			</div>
			
			<div class="bg-white p-8 text-left">
				<SectionTitle level="h3" size="small" uppercase>How often are payouts distributed?</SectionTitle>
				<p class="text-sm text-black">Payouts are distributed monthly based on actual production revenue from the underlying oil & gas assets.</p>
			</div>
			
			<div class="bg-white p-8 text-left">
				<SectionTitle level="h3" size="small" uppercase>Can I sell my tokens?</SectionTitle>
				<p class="text-sm text-black">Secondary market trading will be available in Q2 2024. Currently, tokens can be held until asset maturity.</p>
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

	<!-- Still Need Help Section -->
	<ContentSection background="secondary" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-8 text-white">Still Need Help?</SectionTitle>
		
		<div class="max-w-2xl mx-auto text-center">
			<p class="text-white opacity-90 mb-8 text-lg">Can't find what you're looking for? Our support team is here to help.</p>
			
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div class="bg-white/10 border border-white/20 p-6 rounded">
					<div class="text-3xl mb-4">📧</div>
					<SectionTitle level="h3" size="small" uppercase textColor="white" className="mb-3">Email Support</SectionTitle>
					<p class="text-white opacity-90 mb-4 text-sm">Get personalized help from our team</p>
					<a href="mailto:contact@albion.exchange" class="text-primary no-underline font-semibold text-sm uppercase tracking-wider hover:opacity-80 transition-opacity duration-200">contact@albion.exchange</a>
				</div>
				
				<div class="bg-white/10 border border-white/20 p-6 rounded">
					<div class="text-3xl mb-4">💬</div>
					<SectionTitle level="h3" size="small" uppercase textColor="white" className="mb-3">Join Our Community</SectionTitle>
					<p class="text-white opacity-90 mb-4 text-sm">Connect with other investors and get instant help</p>
					<a href="https://t.me/albion" target="_blank" rel="noopener noreferrer" class="text-primary no-underline font-semibold text-sm uppercase tracking-wider hover:opacity-80 transition-opacity duration-200">Telegram Channel</a>
				</div>
			</div>
		</div>
	</ContentSection>
</PageLayout>

