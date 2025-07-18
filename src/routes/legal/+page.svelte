<script lang="ts">
	import SectionTitle from '$lib/components/components/SectionTitle.svelte';
	import ControlButton from '$lib/components/components/ControlButton.svelte';
	import { PageLayout, HeroSection, ContentSection } from '$lib/components/layout';
	
	let activeSection = 'terms';
</script>

<svelte:head>
	<title>Legal - Albion</title>
	<meta name="description" content="Legal information, terms of service, and compliance details for Albion platform" />
</svelte:head>

<PageLayout>
	<!-- Hero Section -->
	<HeroSection 
		title="Legal Information"
		subtitle="Important legal documents and compliance information for the Albion platform."
		showBorder={true}
	/>

	<!-- Legal Navigation -->
	<ContentSection background="gray" padding="compact" centered>
		<div class="flex md:flex-row flex-col md:gap-4 gap-3 md:flex-wrap md:justify-center items-center">
			<ControlButton 
				active={activeSection === 'terms'}
				on:click={() => activeSection = 'terms'}
			>
				Terms of Service
			</ControlButton>
			<ControlButton 
				active={activeSection === 'privacy'}
				on:click={() => activeSection = 'privacy'}
			>
				Privacy Policy
			</ControlButton>
			<ControlButton 
				active={activeSection === 'disclosures'}
				on:click={() => activeSection = 'disclosures'}
			>
				Investment Disclosures
			</ControlButton>
			<ControlButton 
				active={activeSection === 'compliance'}
				on:click={() => activeSection = 'compliance'}
			>
				Compliance
			</ControlButton>
		</div>
	</ContentSection>

	<!-- Legal Content -->
	<ContentSection background="white" padding="standard">
		{#if activeSection === 'terms'}
			<div class="bg-white md:p-12 p-8">
				<SectionTitle level="h2" size="section">Terms of Service</SectionTitle>
				<p class="text-black opacity-70 text-sm mb-8">Last updated: December 2024</p>
				
				<div class="space-y-4">
					<h3 class="text-xl font-extrabold text-black mt-8 mb-4">1. Acceptance of Terms</h3>
					<p class="leading-relaxed mb-4 text-black">By accessing and using the Albion platform, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our services.</p>
					
					<h3 class="text-xl font-extrabold text-black mt-8 mb-4">2. Platform Description</h3>
					<p class="leading-relaxed mb-4 text-black">Albion provides a blockchain-based platform for investing in tokenized oil & gas assets. Our platform enables users to purchase royalty tokens representing fractional ownership in energy production revenue.</p>
					
					<h3 class="text-xl font-extrabold text-black mt-8 mb-4">3. User Eligibility</h3>
					<p class="leading-relaxed mb-4 text-black">You must be at least 18 years old and legally capable of entering into binding contracts. You must also comply with all applicable laws and regulations in your jurisdiction.</p>
					
					<h3 class="text-xl font-extrabold text-black mt-8 mb-4">4. Account Registration</h3>
					<p class="leading-relaxed mb-4 text-black">To use our platform, you must create an account and complete our Know Your Customer (KYC) verification process. You are responsible for maintaining the security of your account credentials.</p>
					
					<h3 class="text-xl font-extrabold text-black mt-8 mb-4">5. Investment Terms</h3>
					<p class="leading-relaxed mb-4 text-black">All investments are subject to specific terms outlined in the respective token offering documents. Past performance does not guarantee future results. Investments may lose value.</p>
					
					<h3 class="text-xl font-extrabold text-black mt-8 mb-4">6. Limitation of Liability</h3>
					<p class="leading-relaxed mb-4 text-black">Albion's liability is limited to the maximum extent permitted by law. We are not liable for investment losses, market volatility, or technical issues beyond our control.</p>
					
					<h3 class="text-xl font-extrabold text-black mt-8 mb-4">7. Termination</h3>
					<p class="leading-relaxed mb-4 text-black">We may terminate or suspend your account at any time for violation of these terms or applicable laws. You may close your account at any time subject to existing investment commitments.</p>
				</div>
			</div>
		{:else if activeSection === 'privacy'}
			<div class="bg-white md:p-12 p-8">
				<SectionTitle level="h2" size="section">Privacy Policy</SectionTitle>
				<p class="text-black opacity-70 text-sm mb-8">Last updated: December 2024</p>
				
				<div class="space-y-4">
					<h3>1. Information We Collect</h3>
					<p>We collect personal information necessary for KYC compliance, including name, address, identification documents, and financial information. We also collect usage data and technical information about your interaction with our platform.</p>
					
					<h3>2. How We Use Information</h3>
					<p>Your information is used for account verification, compliance with legal requirements, platform operation, customer support, and communication about your investments.</p>
					
					<h3>3. Information Sharing</h3>
					<p>We may share information with regulatory authorities, service providers, and professional advisors as required by law or necessary for platform operation. We do not sell personal information to third parties.</p>
					
					<h3>4. Data Security</h3>
					<p>We implement industry-standard security measures including encryption, secure servers, and access controls to protect your personal information.</p>
					
					<h3>5. Data Retention</h3>
					<p>We retain personal information for as long as necessary to provide services and comply with legal obligations. Some information may be retained longer for regulatory compliance.</p>
					
					<h3>6. Your Rights</h3>
					<p>You have the right to access, correct, or delete your personal information, subject to legal and contractual requirements. Contact us to exercise these rights.</p>
					
					<h3>7. Cookies and Tracking</h3>
					<p>We use cookies and similar technologies to improve platform functionality and user experience. You can control cookie settings in your browser.</p>
					
					<h3>8. Contact Information</h3>
					<p>For privacy-related questions, contact our Data Protection Officer at privacy@albion.com.</p>
				</div>
			</div>
		{:else if activeSection === 'disclosures'}
			<div class="bg-white md:p-12 p-8">
				<SectionTitle level="h2" size="section">Investment Disclosures</SectionTitle>
				<p class="text-black opacity-70 text-sm mb-8">Last updated: December 2024</p>
				
				<div class="space-y-4">
					<h3>Important Investment Warnings</h3>
					<div class="bg-yellow-50 border border-yellow-400 p-6 my-8">
						<h4 class="text-yellow-800 font-extrabold mb-3 text-base">⚠️ High-Return Investment Warning</h4>
						<p class="text-yellow-800 mb-0 font-semibold">Oil & gas investments carry significant operational, market, and regulatory risks. Returns are not guaranteed and you may lose your entire investment.</p>
					</div>
					
					<h3>1. Nature of Investment</h3>
					<p>Albion tokens represent fractional ownership in oil & gas revenue streams. Token holders receive payments based on actual production and commodity prices, which can be volatile.</p>
					
					<h3>2. Principal Investment Risks</h3>
					<ul>
						<li><strong>Commodity Price Risk:</strong> Oil and gas prices fluctuate significantly based on market conditions</li>
						<li><strong>Production Risk:</strong> Wells may produce less than expected due to geological or operational factors</li>
						<li><strong>Regulatory Risk:</strong> Changes in regulations may affect operations and profitability</li>
						<li><strong>Liquidity Risk:</strong> Tokens may not be easily tradeable</li>
						<li><strong>Technology Risk:</strong> Blockchain and smart contract risks</li>
					</ul>
					
					<h3>3. No Guarantee of Returns</h3>
					<p>Projected returns are estimates based on current production and prices. Actual returns may be significantly lower or you may lose your entire investment.</p>
					
					<h3>4. Regulatory Considerations</h3>
					<p>These investments may be considered securities in some jurisdictions. Ensure compliance with local investment laws before participating.</p>
					
					<h3>5. Tax Implications</h3>
					<p>Token ownership and distributions may have tax consequences. Consult with a tax professional regarding your specific situation.</p>
					
					<h3>6. Professional Advice</h3>
					<p>Consider seeking independent financial, legal, and tax advice before making any investment decision.</p>
				</div>
			</div>
		{:else if activeSection === 'compliance'}
			<div class="bg-white md:p-12 p-8">
				<SectionTitle level="h2" size="section">Regulatory Compliance</SectionTitle>
				<p class="text-black opacity-70 text-sm mb-8">Last updated: December 2024</p>
				
				<div class="space-y-4">
					<h3>1. Regulatory Framework</h3>
					<p>Albion operates in compliance with applicable securities, commodities, and financial services regulations. Our legal framework is designed to protect investors while enabling innovation.</p>
					
					<h3>2. Securities Compliance</h3>
					<p>Token offerings may be subject to securities regulations. We work with legal counsel to ensure appropriate compliance structures including proper registration or exemptions.</p>
					
					<h3>3. Anti-Money Laundering (AML)</h3>
					<p>We maintain comprehensive AML policies including customer due diligence, ongoing monitoring, and suspicious activity reporting as required by law.</p>
					
					<h3>4. Know Your Customer (KYC)</h3>
					<p>All users must complete identity verification including:</p>
					<ul>
						<li>Government-issued photo identification</li>
						<li>Proof of address</li>
						<li>Source of funds verification</li>
						<li>Sanctions and PEP screening</li>
					</ul>
					
					<h3>5. Data Protection</h3>
					<p>We comply with applicable data protection laws including GDPR, CCPA, and other privacy regulations where applicable.</p>
					
					<h3>6. Jurisdictional Restrictions</h3>
					<p>Our services may not be available in all jurisdictions. We maintain restrictions on certain countries and regions as required by law.</p>
					
					<h3>7. Audit and Reporting</h3>
					<p>We engage independent auditors and maintain regular reporting to regulatory authorities as required. All asset valuations and performance data are verified by third parties.</p>
					
					<h3>8. Investor Protection</h3>
					<p>We maintain appropriate investor protection measures including segregated client funds, professional indemnity insurance, and independent custody arrangements where applicable.</p>
				</div>
			</div>
		{/if}
	</ContentSection>

	<!-- Contact Section -->
	<ContentSection background="secondary" padding="standard" centered>
			<h2 class="text-[1.75rem] font-extrabold mb-4 text-white">Legal Questions?</h2>
			<p class="text-lg mb-8 opacity-90">If you have questions about our legal documents or compliance procedures, please contact our legal team.</p>
			<div class="flex flex-col gap-3 md:text-center text-left">
				<div class="text-sm px-3 py-3 bg-white/10 border border-white/20">
					<strong class="text-white font-extrabold">Email:</strong> legal@albion.com
				</div>
				<div class="text-sm px-3 py-3 bg-white/10 border border-white/20">
					<strong class="text-white font-extrabold">Phone:</strong> +1 (555) 123-4567
				</div>
				<div class="text-sm px-3 py-3 bg-white/10 border border-white/20">
					<strong class="text-white font-extrabold">Address:</strong> 123 Energy Plaza, Houston, TX 77002
				</div>
			</div>
	</ContentSection>
</PageLayout>

