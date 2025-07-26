<script lang="ts">
	import SectionTitle from '$lib/components/components/SectionTitle.svelte';
	import { PageLayout, HeroSection, ContentSection } from '$lib/components/layout';
</script>

<svelte:head>
	<title>Support - Albion</title>
	<meta name="description" content="Get help with the Albion platform, browse FAQs, and find support resources" />
</svelte:head>

<PageLayout>
	<!-- Hero Section -->
	<HeroSection 
		title="Support Center"
		subtitle="Find answers to your questions, browse our knowledge base, and get the help you need."
		showBorder={true}
	/>


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

	<!-- Still Need Help Section -->
	<ContentSection background="light-gray" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-8">Still need help?</SectionTitle>
		<p class="text-lg text-black text-center mb-8 max-w-2xl mx-auto">
			Our team is here to help. Reach out to us directly for personalized support.
		</p>
		<div class="flex flex-col sm:flex-row gap-6 justify-center items-center">
			<a href="mailto:contact@albion.labs" class="text-primary font-semibold text-lg no-underline hover:opacity-80 transition-opacity duration-200">
				contact@albion.labs
			</a>
			<span class="text-black">or</span>
			<a href="https://t.me/+rw9m7NqlTfhhN2I8" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold no-underline rounded-lg hover:bg-secondary transition-colors duration-200">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
					<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
				</svg>
				Join our Telegram
			</a>
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
</PageLayout>

