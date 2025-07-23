<script lang="ts">
	import { onMount } from 'svelte';
	import { useConfigService } from '$lib/services';
	import SectionTitle from '$lib/components/components/SectionTitle.svelte';
	import PrimaryButton from '$lib/components/components/PrimaryButton.svelte';
	import SecondaryButton from '$lib/components/components/SecondaryButton.svelte';
	import Card from '$lib/components/components/Card.svelte';
	import IconCard from '$lib/components/components/IconCard.svelte';
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
	<meta name="description" content="Learn about Albion Labs' next-generation Energy Protocol, built by blockchain innovators with deep energy sector expertise" />
</svelte:head>

<PageLayout>
	<!-- Hero Section -->
	<HeroSection 
		title="About Albion Labs"
		subtitle="Building the foundation for a next-generation Energy Protocol through the fusion of real-world asset knowledge and blockchain-native value capture."
		showBorder={false}
	/>

	<!-- Mission Section -->
	<ContentSection background="gray" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-8">Our Mission</SectionTitle>
		<p class="text-lg leading-relaxed text-black max-w-4xl mx-auto">
			Albion Labs combines deep energy sector expertise with cutting-edge blockchain innovation to create transparent, liquid, and accessible energy investments. 
			By pairing real-world asset knowledge with blockchain-native value capture, we're revolutionizing how institutional-quality energy assets reach global investors.
		</p>
	</ContentSection>

	<!-- Founding Team Experience -->
	<ContentSection background="white" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-8">Proven Track Record</SectionTitle>
		<p class="text-lg text-black mb-12 max-w-4xl mx-auto">
			Our founding team brings together unique expertise from blockchain innovation, digital transformation, and energy sector operations—rooted in the original "landman" tradition of energy exploration and development.
		</p>
		
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
			<IconCard
				icon="🔗"
				iconType="emoji"
				title="Blockchain Pioneers"
				description="Co-founded Hollowchain, bringing deep expertise in blockchain finance and tokenization protocols"
			/>
			
			<IconCard
				icon="🚀"
				iconType="emoji"
				title="Google Innovation"
				description="Led special projects at Google, driving high-impact digital transformation initiatives"
			/>
			
			<IconCard
				icon="✈️"
				iconType="emoji"
				title="Virgin Expeditions"
				description="Executed expedition initiatives for Virgin, demonstrating global project leadership capabilities"
			/>
			
			<IconCard
				icon="🛢️"
				iconType="emoji"
				title="Energy Expertise"
				description="Successfully exited FTSE 250-listed oil & gas company via strategic sale to Qatar in 2014"
			/>
		</div>

		<div class="bg-gray-50 rounded-xl p-8 max-w-4xl mx-auto">
			<SectionTitle level="h3" size="small" center className="mb-4">The Landman Legacy</SectionTitle>
			<p class="text-black leading-relaxed">
				Rooted in the original "landman" tradition of energy exploration, our team understands both the complexities of energy asset evaluation and the opportunities for long-term value creation. This unique perspective enables us to take a distinctive view on building sustainable energy investment protocols.
			</p>
		</div>
	</ContentSection>

	<!-- How It Works -->
	<ContentSection background="gray" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-12">How Albion Works</SectionTitle>
		
		<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
			<Card hoverable={false} paddingClass="p-8" roundedClass="rounded-lg">
				<div class="text-center">
					<div class="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6">1</div>
					<SectionTitle level="h3" size="small" uppercase>Asset Acquisition</SectionTitle>
					<p class="text-sm text-black">We acquire proven oil & gas assets with established production and clear revenue streams from institutional operators.</p>
				</div>
			</Card>
			
			<Card hoverable={false} paddingClass="p-8" roundedClass="rounded-lg">
				<div class="text-center">
					<div class="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6">2</div>
					<SectionTitle level="h3" size="small" uppercase>Tokenization</SectionTitle>
					<p class="text-sm text-black">Assets are tokenized on blockchain, creating fractional ownership opportunities with transparent smart contract governance.</p>
				</div>
			</Card>
			
			<Card hoverable={false} paddingClass="p-8" roundedClass="rounded-lg">
				<div class="text-center">
					<div class="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6">3</div>
					<SectionTitle level="h3" size="small" uppercase>Investment Access</SectionTitle>
					<p class="text-sm text-black">Investors can purchase royalty tokens representing fractional ownership in real oil & gas production revenue.</p>
				</div>
			</Card>
			
			<Card hoverable={false} paddingClass="p-8" roundedClass="rounded-lg">
				<div class="text-center">
					<div class="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6">4</div>
					<SectionTitle level="h3" size="small" uppercase>Revenue Distribution</SectionTitle>
					<p class="text-sm text-black">Monthly payouts are automatically distributed to token holders based on actual production and oil prices.</p>
				</div>
			</Card>
		</div>
	</ContentSection>

	<!-- Platform Benefits -->
	<ContentSection background="white" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-12">Platform Benefits</SectionTitle>
		
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<Card hoverable={false} paddingClass="p-8" roundedClass="rounded-lg">
				<div class="text-center">
					<div class="text-5xl mb-4">🔒</div>
					<SectionTitle level="h3" size="small" uppercase>Institutional Grade</SectionTitle>
					<p class="text-sm text-black">All assets are vetted by professional operators with proven track records and regulatory compliance.</p>
				</div>
			</Card>
			
			<Card hoverable={false} paddingClass="p-8" roundedClass="rounded-lg">
				<div class="text-center">
					<div class="text-5xl mb-4">💰</div>
					<SectionTitle level="h3" size="small" uppercase>Direct Revenue Share</SectionTitle>
					<p class="text-sm text-black">Token holders receive proportional revenue from real oil & gas production with transparent accounting.</p>
				</div>
			</Card>
			
			<Card hoverable={false} paddingClass="p-8" roundedClass="rounded-lg">
				<div class="text-center">
					<div class="text-5xl mb-4">📊</div>
					<SectionTitle level="h3" size="small" uppercase>Real-Time Transparency</SectionTitle>
					<p class="text-sm text-black">Live production data, financial reporting, and market metrics provide complete investment visibility.</p>
				</div>
			</Card>
			
			<Card hoverable={false} paddingClass="p-8" roundedClass="rounded-lg">
				<div class="text-center">
					<div class="text-5xl mb-4">🌐</div>
					<SectionTitle level="h3" size="small" uppercase>Global Access</SectionTitle>
					<p class="text-sm text-black">Blockchain technology enables worldwide access to premium energy investments previously reserved for institutions.</p>
				</div>
			</Card>
		</div>
	</ContentSection>

	<!-- Innovation DNA -->
	<ContentSection background="gray" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-8">Innovation DNA</SectionTitle>
		<div class="max-w-4xl mx-auto">
			<p class="text-lg text-black mb-8 leading-relaxed">
				The fusion of digital innovation, blockchain finance, and real-world energy expertise enables Albion Labs to take a distinctive view on long-term value creation. Our approach bridges traditional energy sector knowledge with next-generation financial technology.
			</p>
			
			<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
				<div class="text-center">
					<div class="text-6xl mb-4">⚡</div>
					<SectionTitle level="h4" size="small" className="mb-2">Energy Heritage</SectionTitle>
					<p class="text-sm text-black">Deep roots in energy exploration and asset development</p>
				</div>
				
				<div class="text-center">
					<div class="text-6xl mb-4">🔮</div>
					<SectionTitle level="h4" size="small" className="mb-2">Blockchain Innovation</SectionTitle>
					<p class="text-sm text-black">Pioneering tokenization and DeFi protocols</p>
				</div>
				
				<div class="text-center">
					<div class="text-6xl mb-4">🎯</div>
					<SectionTitle level="h4" size="small" className="mb-2">Strategic Vision</SectionTitle>
					<p class="text-sm text-black">Building tomorrow's energy investment infrastructure</p>
				</div>
			</div>
		</div>
	</ContentSection>

	<!-- Company Stats -->
	<ContentSection background="secondary" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-12 text-white">Platform Statistics</SectionTitle>
		
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
			{#if loading}
				<div class="text-center py-8 col-span-full">Loading statistics...</div>
			{:else}
				<div class="text-center">
					<div class="text-4xl font-extrabold text-primary mb-2">{platformStats.totalInvestmentVolume?.formatted || 'N/A'}</div>
					<div class="text-sm font-semibold opacity-90">Total Investment Volume</div>
				</div>
				<div class="text-center">
					<div class="text-4xl font-extrabold text-primary mb-2">{platformStats.activeInvestors?.formatted || 'N/A'}</div>
					<div class="text-sm font-semibold opacity-90">Active Investors</div>
				</div>
				<div class="text-center">
					<div class="text-4xl font-extrabold text-primary mb-2">{platformStats.activeAssets?.formatted || 'N/A'}</div>
					<div class="text-sm font-semibold opacity-90">Active Assets</div>
				</div>
				<div class="text-center">
					<div class="text-4xl font-extrabold text-primary mb-2">{platformStats.averagePayout?.formatted || 'N/A'}</div>
					<div class="text-sm font-semibold opacity-90">Average Payout</div>
				</div>
			{/if}
		</div>
	</ContentSection>

	<!-- Contact CTA -->
	<ContentSection background="white" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-4">Ready to Start Investing?</SectionTitle>
		<p class="text-lg text-black mb-8">Join the next generation of energy investment with institutional-grade assets powered by blockchain technology.</p>
		<div class="flex md:flex-row flex-col gap-4 justify-center items-center">
			<PrimaryButton href="/assets" size="large">Browse Assets</PrimaryButton>
			<SecondaryButton href="/contact" size="large">Contact Us</SecondaryButton>
		</div>
	</ContentSection>
</PageLayout>

