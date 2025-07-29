<script lang="ts">
	import SectionTitle from '$lib/components/components/SectionTitle.svelte';
	import { PageLayout, HeroSection, ContentSection } from '$lib/components/layout';
</script>

<svelte:head>
	<title>Support - Albion</title>
	<meta name="description" content="Get help with the Albion investment platform, browse our FAQs, and find support resources" />
</svelte:head>

<PageLayout>
	<!-- Hero Section -->
	<HeroSection 
		title="Support Center"
		subtitle="Find the answers to your questions, browse our knowledge base, and get the help you need."
		showBorder={true}
	/>


	<!-- FAQ Section -->
	<ContentSection background="white" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-12">Frequently Asked Questions</SectionTitle>
		
		<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
			<div class="bg-white p-8 text-left">
				<SectionTitle level="h3" size="small" uppercase>How do I start investing?</SectionTitle>
				<p class="text-sm text-black">Create an account by connecting your wallet, complete KYC verification, and browse available token releases to make your first investment.</p>
			</div>
			
			<div class="bg-white p-8 text-left">
				<SectionTitle level="h3" size="small" uppercase>How much do royalty tokens cost to mint</SectionTitle>
				<p class="text-sm text-black">Royalty tokens are minted (created and bought) for 1 USDT</p>
			</div>
			<div class="bg-white p-8 text-left">
				<SectionTitle level="h3" size="small" uppercase>What is the minimum investment?</SectionTitle>
				<p class="text-sm text-black">Thanks to web3 technologies, the minimum investment is a single token (1 USDT) plus a few cents for transaction costs (gas).</p>
			</div>
			<div class="bg-white p-8 text-left">
				<SectionTitle level="h3" size="small" uppercase>How often are payouts distributed?</SectionTitle>
				<p class="text-sm text-black">Distribution frequency is asset-specific. We aim to encourage monthly payments wherever possible but payment frequency and other terms will be specified in the asset details page</p>
			</div>
			<div class="bg-white p-8 text-left">
				<SectionTitle level="h3" size="small" uppercase>Can I sell my royalty tokens?</SectionTitle>
				<p class="text-sm text-black">Yes all legal claims and rights are bound to the token itself. We are working with third parties to support secondary markets for royalty tokens</p>
			</div>
			<div class="bg-white p-8 text-left">
				<SectionTitle level="h3" size="small" uppercase>What is the difference between an asset and token release?</SectionTitle>
				<p class="text-sm text-black">An asset is an underlying source of cash flow. This cash flow can be divided across multiple token releases each with different terms</p>
			</div>
		</div>
	</ContentSection>

	<!-- Still Need Help Section -->
	<ContentSection background="gray" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-8">Still need help?</SectionTitle>
		<div class="flex flex-col sm:flex-row gap-6 justify-center items-center">
			<a href="mailto:contact@albionlabs.org" class="text-primary font-semibold text-lg no-underline hover:opacity-80 transition-opacity duration-200">
				contact@albionlabs.org
			</a>
			<span class="text-black">or</span>
			<a href="https://t.me/albionlabs" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold no-underline rounded-lg hover:bg-secondary transition-colors duration-200">
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
		
		<div class="grid grid-cols-1 gap-8">
			<span></span>	
			<div class="text-3xl mb-4">🚧 This section under construction</div>
			<span></span>	
		</div>
	</ContentSection>
</PageLayout>

