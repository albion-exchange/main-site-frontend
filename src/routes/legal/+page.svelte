<script lang="ts">
	let activeSection = 'terms';
</script>

<svelte:head>
	<title>Legal - Albion</title>
	<meta name="description" content="Legal information, terms of service, and compliance details for Albion platform" />
</svelte:head>

<main class="legal-page">
	<!-- Hero Section -->
	<section class="hero">
		<div class="hero-content">
			<h1>Legal Information</h1>
			<p>Important legal documents and compliance information for the Albion platform.</p>
		</div>
	</section>

	<!-- Legal Navigation -->
	<section class="legal-nav">
		<div class="nav-container">
			<button 
				class="nav-btn"
				class:active={activeSection === 'terms'}
				on:click={() => activeSection = 'terms'}
			>
				Terms of Service
			</button>
			<button 
				class="nav-btn"
				class:active={activeSection === 'privacy'}
				on:click={() => activeSection = 'privacy'}
			>
				Privacy Policy
			</button>
			<button 
				class="nav-btn"
				class:active={activeSection === 'disclosures'}
				on:click={() => activeSection = 'disclosures'}
			>
				Investment Disclosures
			</button>
			<button 
				class="nav-btn"
				class:active={activeSection === 'compliance'}
				on:click={() => activeSection = 'compliance'}
			>
				Compliance
			</button>
		</div>
	</section>

	<!-- Legal Content -->
	<section class="legal-content">
		{#if activeSection === 'terms'}
			<div class="document">
				<h2>Terms of Service</h2>
				<p class="last-updated">Last updated: December 2024</p>
				
				<div class="document-content">
					<h3>1. Acceptance of Terms</h3>
					<p>By accessing and using the Albion platform, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our services.</p>
					
					<h3>2. Platform Description</h3>
					<p>Albion provides a blockchain-based platform for investing in tokenized oil & gas assets. Our platform enables users to purchase royalty tokens representing fractional ownership in energy production revenue.</p>
					
					<h3>3. User Eligibility</h3>
					<p>You must be at least 18 years old and legally capable of entering into binding contracts. You must also comply with all applicable laws and regulations in your jurisdiction.</p>
					
					<h3>4. Account Registration</h3>
					<p>To use our platform, you must create an account and complete our Know Your Customer (KYC) verification process. You are responsible for maintaining the security of your account credentials.</p>
					
					<h3>5. Investment Terms</h3>
					<p>All investments are subject to specific terms outlined in the respective token offering documents. Past performance does not guarantee future results. Investments may lose value.</p>
					
					<h3>6. Platform Fees</h3>
					<p>Albion charges management fees and transaction fees as disclosed in the relevant offering materials. All fees are clearly outlined before investment.</p>
					
					<h3>7. Limitation of Liability</h3>
					<p>Albion's liability is limited to the maximum extent permitted by law. We are not liable for investment losses, market volatility, or technical issues beyond our control.</p>
					
					<h3>8. Termination</h3>
					<p>We may terminate or suspend your account at any time for violation of these terms or applicable laws. You may close your account at any time subject to existing investment commitments.</p>
				</div>
			</div>
		{:else if activeSection === 'privacy'}
			<div class="document">
				<h2>Privacy Policy</h2>
				<p class="last-updated">Last updated: December 2024</p>
				
				<div class="document-content">
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
			<div class="document">
				<h2>Investment Disclosures</h2>
				<p class="last-updated">Last updated: December 2024</p>
				
				<div class="document-content">
					<h3>Important Investment Warnings</h3>
					<div class="warning-box">
						<h4>⚠️ High-Return Investment Warning</h4>
						<p>Oil & gas investments carry significant operational, market, and regulatory risks. Returns are not guaranteed and you may lose your entire investment.</p>
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
			<div class="document">
				<h2>Regulatory Compliance</h2>
				<p class="last-updated">Last updated: December 2024</p>
				
				<div class="document-content">
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
	<section class="legal-contact">
		<div class="contact-content">
			<h2>Legal Questions?</h2>
			<p>If you have questions about our legal documents or compliance procedures, please contact our legal team.</p>
			<div class="contact-options">
				<div class="contact-option">
					<strong>Email:</strong> legal@albion.com
				</div>
				<div class="contact-option">
					<strong>Phone:</strong> +1 (555) 123-4567
				</div>
				<div class="contact-option">
					<strong>Address:</strong> 123 Energy Plaza, Houston, TX 77002
				</div>
			</div>
		</div>
	</section>
</main>

<style>
	.legal-page {
		padding-top: 0;
	}

	.hero {
		padding: 4rem 2rem;
		text-align: center;
		background: var(--color-white);
		border-bottom: 1px solid var(--color-light-gray);
	}

	.hero-content {
		max-width: 800px;
		margin: 0 auto;
	}

	.hero h1 {
		font-size: 2.5rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 1rem;
		color: var(--color-black);
		letter-spacing: -0.02em;
		line-height: 1.1;
	}

	.hero p {
		font-size: 1.1rem;
		line-height: 1.6;
		color: var(--color-black);
		max-width: 600px;
		margin: 0 auto;
	}

	.legal-nav {
		background: var(--color-light-gray);
		border-bottom: 1px solid var(--color-light-gray);
		padding: 2rem;
	}

	.nav-container {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.nav-btn {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		padding: 0.75rem 1.5rem;
		font-family: var(--font-family);
		font-weight: var(--font-weight-semibold);
		font-size: 0.9rem;
		color: var(--color-black);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.nav-btn:hover {
		background: var(--color-black);
		color: var(--color-white);
		border-color: var(--color-black);
	}

	.nav-btn.active {
		background: var(--color-black);
		color: var(--color-white);
		border-color: var(--color-black);
	}

	.legal-content {
		padding: 4rem 2rem;
		max-width: 800px;
		margin: 0 auto;
	}

	.document {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		padding: 3rem;
	}

	.document h2 {
		font-size: 2rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
	}

	.last-updated {
		color: var(--color-black);
		opacity: 0.7;
		font-size: 0.9rem;
		margin-bottom: 2rem;
	}

	.document-content h3 {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin: 2rem 0 1rem 0;
	}

	.document-content h4 {
		font-size: 1.1rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin: 1.5rem 0 0.75rem 0;
	}

	.document-content p {
		line-height: 1.6;
		margin-bottom: 1rem;
		color: var(--color-black);
	}

	.document-content ul {
		margin: 1rem 0;
		padding-left: 2rem;
	}

	.document-content li {
		margin-bottom: 0.5rem;
		line-height: 1.5;
		color: var(--color-black);
	}

	.document-content li strong {
		font-weight: var(--font-weight-extrabold);
	}

	.warning-box {
		background: #fef3c7;
		border: 1px solid #fbbf24;
		padding: 1.5rem;
		margin: 2rem 0;
	}

	.warning-box h4 {
		color: #92400e;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 0.75rem;
		font-size: 1rem;
	}

	.warning-box p {
		color: #92400e;
		margin-bottom: 0;
		font-weight: var(--font-weight-semibold);
	}

	.legal-contact {
		background: var(--color-secondary);
		color: var(--color-white);
		padding: 4rem 2rem;
		text-align: center;
	}

	.contact-content {
		max-width: 600px;
		margin: 0 auto;
	}

	.legal-contact h2 {
		font-size: 1.75rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 1rem;
	}

	.legal-contact p {
		font-size: 1.1rem;
		margin-bottom: 2rem;
		opacity: 0.9;
	}

	.contact-options {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.contact-option {
		font-size: 0.95rem;
		padding: 0.75rem;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.contact-option strong {
		color: var(--color-primary);
		font-weight: var(--font-weight-extrabold);
	}

	@media (max-width: 768px) {
		.hero h1 {
			font-size: 2rem;
		}

		.nav-container {
			flex-direction: column;
			align-items: center;
		}

		.nav-btn {
			width: 100%;
			max-width: 300px;
			text-align: center;
		}

		.document {
			padding: 2rem;
		}

		.legal-content {
			padding: 2rem 1rem;
		}

		.contact-options {
			text-align: left;
		}
	}
</style>