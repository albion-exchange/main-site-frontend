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
	<meta name="description" content="Democratizing energy investment to power the future of energy infrastructure" />
</svelte:head>

<PageLayout>
	<!-- Hero Section -->
	<HeroSection 
		title="About Albion Labs"
		subtitle="Democratizing energy investment to power the future of energy infrastructure"
		showBorder={false}
	/>

	<!-- Vision Section -->
	<ContentSection background="gray" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-8">Our Vision</SectionTitle>
		<div class="max-w-4xl mx-auto">
			<p class="text-lg leading-relaxed text-black mb-6">At Albion Labs, we're making direct investment in energy infrastructure accessible, giving people access to new income streams while helping energy companies unlock new capital to finance the world's energy needs.</p>
			<p class="text-lg leading-relaxed text-black">Our unique background—spanning digital innovation at global tech companies, successful web3 ventures, and the corporate actions for established energy companies—positions us to unlock new models of value creation in the energy sector through transparent, accessible, and efficient blockchain-native solutions.</p>
		</div>
	</ContentSection>

	<!-- Founding Heritage Section -->
	<ContentSection background="white" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-8">Leadership Team Highlights</SectionTitle>

		<!-- Brand Experience Icons -->
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
			<Card hoverable={false} paddingClass="p-6" roundedClass="rounded-lg">
				<div class="text-center">
					<div class="w-16 h-16 bg-[#4285F4] text-white rounded-lg flex items-center justify-center text-2xl font-bold mx-auto mb-4">G</div>
					<p class="text-sm font-semibold text-black">Google</p>
					<p class="text-xs text-gray-600">Led high impact special projects and initiatives</p>
				</div>
			</Card>
			
			<Card hoverable={false} paddingClass="p-6" roundedClass="rounded-lg">
				<div class="text-center">
					<div class="w-16 h-16 bg-[#E10A0A] text-white rounded-lg flex items-center justify-center text-2xl font-bold mx-auto mb-4">V</div>
					<p class="text-sm font-semibold text-black">Virgin</p>
					<p class="text-xs text-gray-600">Led high impact special projects and initiatives</p>
				</div>
			</Card>
			
			<Card hoverable={false} paddingClass="p-6" roundedClass="rounded-lg">
				<div class="text-center">
					<div class="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-bold mx-auto mb-4">HC</div>
					<p class="text-sm font-semibold text-black">Holochain</p>
					<p class="text-xs text-gray-600">Co-Founded</p>
				</div>
			</Card>
			
			<Card hoverable={false} paddingClass="p-6" roundedClass="rounded-lg">
				<div class="text-center">
					<div class="w-16 h-16 bg-[#FFD700] text-black rounded-lg flex items-center justify-center text-2xl font-bold mx-auto mb-4">⚡</div>
					<p class="text-sm font-semibold text-black">Heritage Oil</p>
					<p class="text-xs text-gray-600">Strategic sale for $XXM</p>
				</div>
			</Card>
		</div>
	</ContentSection>

	<!-- Core Expertise Section -->
	<ContentSection background="gray" padding="standard" centered>
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
	<ContentSection background="white" padding="standard" centered>
			<SectionTitle level="h2" size="section" center className="mb-12">Why Albion</SectionTitle>
			
			<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
				<Card hoverable={false} paddingClass="p-8" roundedClass="rounded-lg">
					<div class="text-center">
						<SectionTitle level="h3" size="small" uppercase>For Investors</SectionTitle>
						<p class="text-sm text-black">Flexibility for any size of investment. Access to investment opportunities not typically available to general public. Low overheads/fees</p>
					</div>
				</Card>
				
				<Card hoverable={false} paddingClass="p-8" roundedClass="rounded-lg">
					<div class="text-center">
						<SectionTitle level="h3" size="small" uppercase>For Asset Owners</SectionTitle>
						<p class="text-sm text-black">Access to new pools of project finance capital. Rapid capital raising.</p>
					</div>
				</Card>
		</div>
	</ContentSection>

	<!-- Contact CTA -->
	<ContentSection background="white" padding="standard" centered>
			<SectionTitle level="h2" size="section" center className="mb-4">Join us in transforming energy investing</SectionTitle>
			<p class="text-lg text-black mb-8">Be part of the next generation of energy investment infrastructure.</p>
			<div class="flex md:flex-row flex-col gap-4 justify-center items-center">
				<PrimaryButton href="/assets" size="large">Explore Investments</PrimaryButton>
				<SecondaryButton href="/contact" size="large">Partner with Us</SecondaryButton>
		</div>
	</ContentSection>
</PageLayout>

