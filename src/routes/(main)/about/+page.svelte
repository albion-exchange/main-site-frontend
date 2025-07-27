<script lang="ts">
	import { onMount } from 'svelte';
	import { useConfigService } from '$lib/services';
	import SectionTitle from '$lib/components/components/SectionTitle.svelte';
	import PrimaryButton from '$lib/components/components/PrimaryButton.svelte';
	import SecondaryButton from '$lib/components/components/SecondaryButton.svelte';
	import Card from '$lib/components/components/Card.svelte';
	import { PageLayout, HeroSection, ContentSection } from '$lib/components/layout';
	
	let platformStats: any = {};
	let loading = true;
	const configService = useConfigService();

	onMount(async () => {
		try {
			platformStats = configService.getPlatformStats();
			loading = false;
		} catch (error) {
			console.error('Error loading platform stats:', error);
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>About - Albion Labs</title>
	<meta name="description" content="Building the foundation for a next-generation Energy Protocol through blockchain-native value capture and real-world asset expertise" />
</svelte:head>

<PageLayout>
	<!-- Hero Section -->
	<HeroSection 
		title="About Albion Labs"
		subtitle="Building the foundation for a next-generation Energy Protocol through the unique fusion of digital innovation, blockchain finance, and real-world energy expertise."
		showBorder={false}
	/>

	<!-- Founding Heritage Section -->
	<ContentSection background="gray" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-8">Proven Leadership Heritage</SectionTitle>
		<p class="text-lg leading-relaxed text-black mb-12">Our founding team brings together deep experience from leading technology companies, successful blockchain ventures, and institutional energy markets. This unique combination enables us to take a distinctive view on long-term value creation by pairing real-world asset knowledge with blockchain-native value capture.</p>
		
		<!-- Brand Experience Icons -->
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
			<Card hoverable={false} paddingClass="p-6" roundedClass="rounded-lg">
				<div class="text-center">
					<div class="w-16 h-16 bg-[#4285F4] text-white rounded-lg flex items-center justify-center text-2xl font-bold mx-auto mb-4">G</div>
					<p class="text-sm font-semibold text-black">Google</p>
					<p class="text-xs text-gray-600">Special Projects</p>
				</div>
			</Card>
			
			<Card hoverable={false} paddingClass="p-6" roundedClass="rounded-lg">
				<div class="text-center">
					<div class="w-16 h-16 bg-[#E10A0A] text-white rounded-lg flex items-center justify-center text-2xl font-bold mx-auto mb-4">V</div>
					<p class="text-sm font-semibold text-black">Virgin</p>
					<p class="text-xs text-gray-600">Expedition Initiatives</p>
				</div>
			</Card>
			
			<Card hoverable={false} paddingClass="p-6" roundedClass="rounded-lg">
				<div class="text-center">
					<div class="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-bold mx-auto mb-4">HC</div>
					<p class="text-sm font-semibold text-black">Hollowchain</p>
					<p class="text-xs text-gray-600">Co-Founded</p>
				</div>
			</Card>
			
			<Card hoverable={false} paddingClass="p-6" roundedClass="rounded-lg">
				<div class="text-center">
					<div class="w-16 h-16 bg-[#FFD700] text-black rounded-lg flex items-center justify-center text-2xl font-bold mx-auto mb-4">⚡</div>
					<p class="text-sm font-semibold text-black">FTSE 250</p>
					<p class="text-xs text-gray-600">Strategic Exit 2014</p>
				</div>
			</Card>
		</div>
	</ContentSection>

	<!-- Core Expertise Section -->
	<ContentSection background="white" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-12">The Albion Advantage</SectionTitle>
		
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<Card hoverable={false} paddingClass="p-8" roundedClass="rounded-lg">
				<div class="text-center">
					<div class="text-5xl mb-4">🔗</div>
					<SectionTitle level="h3" size="small" uppercase>Digital Innovation</SectionTitle>
					<p class="text-sm text-black">Pioneering blockchain solutions and smart contract architecture from our experience at leading technology companies and successful blockchain ventures.</p>
				</div>
			</Card>
			
			<Card hoverable={false} paddingClass="p-8" roundedClass="rounded-lg">
				<div class="text-center">
					<div class="text-5xl mb-4">⛽</div>
					<SectionTitle level="h3" size="small" uppercase>Energy Expertise</SectionTitle>
					<p class="text-sm text-black">Deep understanding of energy markets and real-world asset management, rooted in the original "landman" tradition and institutional-grade operations.</p>
				</div>
			</Card>
			
			<Card hoverable={false} paddingClass="p-8" roundedClass="rounded-lg">
				<div class="text-center">
					<div class="text-5xl mb-4">💎</div>
					<SectionTitle level="h3" size="small" uppercase>Value Creation</SectionTitle>
					<p class="text-sm text-black">Proven track record in building and exiting successful ventures, including a strategic sale to Qatar and high-impact expedition initiatives.</p>
				</div>
			</Card>
		</div>
	</ContentSection>

	<!-- How It Works -->
	<ContentSection background="gray" padding="standard" centered>
			<SectionTitle level="h2" size="section" center className="mb-12">How Albion Labs Works</SectionTitle>
			
			<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
				<Card hoverable={false} paddingClass="p-8" roundedClass="rounded-lg">
					<div class="text-center">
						<div class="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6">1</div>
						<SectionTitle level="h3" size="small" uppercase>Asset Identification</SectionTitle>
						<p class="text-sm text-black">Leveraging our energy sector expertise to identify proven oil & gas assets with established production and clear revenue streams.</p>
					</div>
				</Card>
				
				<Card hoverable={false} paddingClass="p-8" roundedClass="rounded-lg">
					<div class="text-center">
						<div class="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6">2</div>
						<SectionTitle level="h3" size="small" uppercase>Protocol Integration</SectionTitle>
						<p class="text-sm text-black">Assets are integrated into our Energy Protocol, creating fractional ownership through blockchain-native value capture mechanisms.</p>
					</div>
				</Card>
				
				<Card hoverable={false} paddingClass="p-8" roundedClass="rounded-lg">
					<div class="text-center">
						<div class="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6">3</div>
						<SectionTitle level="h3" size="small" uppercase>Democratized Access</SectionTitle>
						<p class="text-sm text-black">Institutional-grade energy investments become accessible to a broader range of investors through tokenized participation.</p>
					</div>
				</Card>
				
				<Card hoverable={false} paddingClass="p-8" roundedClass="rounded-lg">
					<div class="text-center">
						<div class="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6">4</div>
						<SectionTitle level="h3" size="small" uppercase>Value Distribution</SectionTitle>
						<p class="text-sm text-black">Automated revenue distribution to participants based on real production data and transparent smart contract governance.</p>
					</div>
				</Card>
		</div>
	</ContentSection>

	<!-- Vision Section -->
	<ContentSection background="white" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-8">Our Vision</SectionTitle>
		<div class="max-w-4xl mx-auto">
			<p class="text-lg leading-relaxed text-black mb-6">At Albion Labs, we're building more than just another investment platform. We're creating the foundational infrastructure for a next-generation Energy Protocol that bridges traditional energy markets with blockchain innovation.</p>
			<p class="text-lg leading-relaxed text-black">Our unique background—spanning digital innovation at global tech companies, successful blockchain ventures, and institutional energy operations—positions us to unlock new models of value creation in the energy sector through transparent, accessible, and efficient blockchain-native solutions.</p>
		</div>
	</ContentSection>

	<!-- Company Stats -->
	<ContentSection background="secondary" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-12 text-white">Platform Metrics</SectionTitle>
		
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
			{#if loading}
				<div class="text-center py-8 col-span-full">Loading metrics...</div>
			{:else}
				<div class="text-center">
					<div class="text-4xl font-extrabold text-primary mb-2">{platformStats.totalInvestmentVolume?.formatted || 'N/A'}</div>
					<div class="text-sm font-semibold opacity-90">Protocol Volume</div>
				</div>
				<div class="text-center">
					<div class="text-4xl font-extrabold text-primary mb-2">{platformStats.activeInvestors?.formatted || 'N/A'}</div>
					<div class="text-sm font-semibold opacity-90">Protocol Participants</div>
				</div>
				<div class="text-center">
					<div class="text-4xl font-extrabold text-primary mb-2">{platformStats.activeAssets?.formatted || 'N/A'}</div>
					<div class="text-sm font-semibold opacity-90">Integrated Assets</div>
				</div>
				<div class="text-center">
					<div class="text-4xl font-extrabold text-primary mb-2">{platformStats.averagePayout?.formatted || 'N/A'}</div>
					<div class="text-sm font-semibold opacity-90">Average Distribution</div>
				</div>
			{/if}
		</div>
	</ContentSection>

	<!-- Contact CTA -->
	<ContentSection background="white" padding="standard" centered>
			<SectionTitle level="h2" size="section" center className="mb-4">Join the Energy Protocol</SectionTitle>
			<p class="text-lg text-black mb-8">Be part of the next generation of energy investment infrastructure.</p>
			<div class="flex md:flex-row flex-col gap-4 justify-center items-center">
				<PrimaryButton href="/assets" size="large">Explore Protocol</PrimaryButton>
				<SecondaryButton href="/contact" size="large">Partner with Us</SecondaryButton>
		</div>
	</ContentSection>
</PageLayout>

