<script lang="ts">
	let activeSection = 'terms';
	
	// Tailwind class mappings
	$: pageClasses = 'pt-0';
	$: heroClasses = 'py-16 px-8 text-center bg-white border-b border-light-gray';
	$: heroContentClasses = 'max-w-6xl mx-auto';
	$: heroTitleClasses = 'text-4xl font-extrabold mb-4 text-black tracking-tight leading-tight';
	$: heroDescriptionClasses = 'text-lg leading-relaxed text-black max-w-2xl mx-auto';
	$: legalNavClasses = 'bg-light-gray border-b border-light-gray px-8 py-8';
	$: navContainerClasses = 'max-w-6xl mx-auto flex gap-4 flex-wrap justify-center';
	$: navBtnClasses = 'bg-white border border-light-gray px-6 py-3 font-figtree font-semibold text-sm text-black cursor-pointer transition-all duration-200 hover:bg-black hover:text-white hover:border-black';
	$: navBtnActiveClasses = 'bg-black text-white border-black';
	$: legalContentClasses = 'py-16 px-8 max-w-6xl mx-auto';
	$: documentClasses = 'bg-white border border-light-gray p-12';
	$: documentTitleClasses = 'text-3xl font-extrabold text-black mb-2';
	$: lastUpdatedClasses = 'text-black opacity-70 text-sm mb-8';
	$: documentContentClasses = 'space-y-4';
	$: documentH3Classes = 'text-xl font-extrabold text-black mt-8 mb-4';
	$: documentH4Classes = 'text-lg font-extrabold text-black mt-6 mb-3';
	$: documentPClasses = 'leading-relaxed mb-4 text-black';
	$: documentUlClasses = 'my-4 pl-8';
	$: documentLiClasses = 'mb-2 leading-normal text-black';
	$: warningBoxClasses = 'bg-yellow-50 border border-yellow-400 p-6 my-8';
	$: warningTitleClasses = 'text-yellow-800 font-extrabold mb-3 text-base';
	$: warningTextClasses = 'text-yellow-800 mb-0 font-semibold';
	$: legalContactClasses = 'bg-secondary text-white py-16 px-8 text-center';
	$: contactContentClasses = 'max-w-6xl mx-auto';
	$: contactTitleClasses = 'text-[1.75rem] font-extrabold mb-4';
	$: contactDescriptionClasses = 'text-lg mb-8 opacity-90';
	$: contactOptionsClasses = 'flex flex-col gap-3';
	$: contactOptionClasses = 'text-sm px-3 py-3 bg-white/10 border border-white/20';
	$: contactStrongClasses = 'text-primary font-extrabold';
	
	// Mobile responsive classes
	$: mobileHeroTitleClasses = 'md:text-4xl text-3xl font-extrabold mb-4 text-black tracking-tight leading-tight';
	$: mobileNavContainerClasses = 'max-w-6xl mx-auto flex md:flex-row flex-col md:gap-4 gap-3 md:flex-wrap md:justify-center items-center';
	$: mobileNavBtnClasses = 'bg-white border border-light-gray px-6 py-3 font-figtree font-semibold text-sm text-black cursor-pointer transition-all duration-200 hover:bg-black hover:text-white hover:border-black md:w-auto w-full max-w-xs text-center';
	$: mobileDocumentClasses = 'bg-white border border-light-gray md:p-12 p-8';
	$: mobileLegalContentClasses = 'md:py-16 py-8 md:px-8 px-4 max-w-6xl mx-auto';
	$: mobileContactOptionsClasses = 'flex flex-col gap-3 md:text-center text-left';
</script>

<svelte:head>
	<title>Legal - Albion</title>
	<meta name="description" content="Legal information, terms of service, and compliance details for Albion platform" />
</svelte:head>

<main class={pageClasses}>
	<!-- Hero Section -->
	<section class={heroClasses}>
		<div class={heroContentClasses}>
			<h1 class={mobileHeroTitleClasses}>Legal Information</h1>
			<p class={heroDescriptionClasses}>Important legal documents and compliance information for the Albion platform.</p>
		</div>
	</section>

	<!-- Legal Navigation -->
	<section class={legalNavClasses}>
		<div class={mobileNavContainerClasses}>
			<button 
				class="{mobileNavBtnClasses} {activeSection === 'terms' ? navBtnActiveClasses : ''}"
				on:click={() => activeSection = 'terms'}
			>
				Terms of Service
			</button>
			<button 
				class="{mobileNavBtnClasses} {activeSection === 'privacy' ? navBtnActiveClasses : ''}"
				on:click={() => activeSection = 'privacy'}
			>
				Privacy Policy
			</button>
			<button 
				class="{mobileNavBtnClasses} {activeSection === 'disclosures' ? navBtnActiveClasses : ''}"
				on:click={() => activeSection = 'disclosures'}
			>
				Investment Disclosures
			</button>
			<button 
				class="{mobileNavBtnClasses} {activeSection === 'compliance' ? navBtnActiveClasses : ''}"
				on:click={() => activeSection = 'compliance'}
			>
				Compliance
			</button>
		</div>
	</section>

	<!-- Legal Content -->
	<section class={mobileLegalContentClasses}>
		{#if activeSection === 'terms'}
			<div class={mobileDocumentClasses}>
				<h2 class={documentTitleClasses}>Terms of Service</h2>
				<p class={lastUpdatedClasses}>Last updated: December 2024</p>
				
				<div class={documentContentClasses}>
					<h3 class={documentH3Classes}>1. Acceptance of Terms</h3>
					<p class={documentPClasses}>By accessing and using the Albion platform, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our services.</p>
					
					<h3 class={documentH3Classes}>2. Platform Description</h3>
					<p class={documentPClasses}>Albion provides a blockchain-based platform for investing in tokenized oil & gas assets. Our platform enables users to purchase royalty tokens representing fractional ownership in energy production revenue.</p>
					
					<h3 class={documentH3Classes}>3. User Eligibility</h3>
					<p class={documentPClasses}>You must be at least 18 years old and legally capable of entering into binding contracts. You must also comply with all applicable laws and regulations in your jurisdiction.</p>
					
					<h3 class={documentH3Classes}>4. Account Registration</h3>
					<p class={documentPClasses}>To use our platform, you must create an account and complete our Know Your Customer (KYC) verification process. You are responsible for maintaining the security of your account credentials.</p>
					
					<h3 class={documentH3Classes}>5. Investment Terms</h3>
					<p class={documentPClasses}>All investments are subject to specific terms outlined in the respective token offering documents. Past performance does not guarantee future results. Investments may lose value.</p>
					
					<h3 class={documentH3Classes}>6. Platform Fees</h3>
					<p class={documentPClasses}>Albion charges management fees and transaction fees as disclosed in the relevant offering materials. All fees are clearly outlined before investment.</p>
					
					<h3 class={documentH3Classes}>7. Limitation of Liability</h3>
					<p class={documentPClasses}>Albion's liability is limited to the maximum extent permitted by law. We are not liable for investment losses, market volatility, or technical issues beyond our control.</p>
					
					<h3 class={documentH3Classes}>8. Termination</h3>
					<p class={documentPClasses}>We may terminate or suspend your account at any time for violation of these terms or applicable laws. You may close your account at any time subject to existing investment commitments.</p>
				</div>
			</div>
		{:else if activeSection === 'privacy'}
			<div class={mobileDocumentClasses}>
				<h2 class={documentTitleClasses}>Privacy Policy</h2>
				<p class={lastUpdatedClasses}>Last updated: December 2024</p>
				
				<div class={documentContentClasses}>
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
			<div class={mobileDocumentClasses}>
				<h2 class={documentTitleClasses}>Investment Disclosures</h2>
				<p class={lastUpdatedClasses}>Last updated: December 2024</p>
				
				<div class={documentContentClasses}>
					<h3>Important Investment Warnings</h3>
					<div class={warningBoxClasses}>
						<h4 class={warningTitleClasses}>⚠️ High-Return Investment Warning</h4>
						<p class={warningTextClasses}>Oil & gas investments carry significant operational, market, and regulatory risks. Returns are not guaranteed and you may lose your entire investment.</p>
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
			<div class={mobileDocumentClasses}>
				<h2 class={documentTitleClasses}>Regulatory Compliance</h2>
				<p class={lastUpdatedClasses}>Last updated: December 2024</p>
				
				<div class={documentContentClasses}>
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
	</section>

	<!-- Contact Section -->
	<section class={legalContactClasses}>
		<div class={contactContentClasses}>
			<h2 class={contactTitleClasses}>Legal Questions?</h2>
			<p class={contactDescriptionClasses}>If you have questions about our legal documents or compliance procedures, please contact our legal team.</p>
			<div class={mobileContactOptionsClasses}>
				<div class={contactOptionClasses}>
					<strong class={contactStrongClasses}>Email:</strong> legal@albion.com
				</div>
				<div class={contactOptionClasses}>
					<strong class={contactStrongClasses}>Phone:</strong> +1 (555) 123-4567
				</div>
				<div class={contactOptionClasses}>
					<strong class={contactStrongClasses}>Address:</strong> 123 Energy Plaza, Houston, TX 77002
				</div>
			</div>
		</div>
	</section>
</main>

