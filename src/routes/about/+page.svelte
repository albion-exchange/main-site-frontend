<script lang="ts">
	// About page logic can be added here
</script>

<svelte:head>
	<title>About - Albion</title>
	<meta name="description" content="Learn about Albion's institutional-grade oil & gas tokenization platform" />
</svelte:head>

<main class="about-page">
	<!-- Hero Section -->
	<section class="hero">
		<div class="hero-content">
			<h1>About Albion</h1>
			<p>Revolutionizing energy investment through blockchain technology and institutional-grade asset tokenization.</p>
		</div>
	</section>

	<!-- Mission Section -->
	<section class="mission">
		<div class="mission-content">
			<h2>Our Mission</h2>
			<p>We democratize access to institutional-quality oil & gas investments by leveraging blockchain technology to create transparent, liquid, and accessible energy assets for investors worldwide.</p>
		</div>
	</section>

	<!-- How It Works -->
	<section class="how-it-works">
		<h2>How Albion Works</h2>
		
		<div class="process-grid">
			<div class="process-step">
				<div class="step-number">1</div>
				<h3>Asset Acquisition</h3>
				<p>We acquire proven oil & gas assets with established production and clear revenue streams from institutional operators.</p>
			</div>
			
			<div class="process-step">
				<div class="step-number">2</div>
				<h3>Tokenization</h3>
				<p>Assets are tokenized on blockchain, creating fractional ownership opportunities with transparent smart contract governance.</p>
			</div>
			
			<div class="process-step">
				<div class="step-number">3</div>
				<h3>Investment Access</h3>
				<p>Investors can purchase royalty tokens representing fractional ownership in real oil & gas production revenue.</p>
			</div>
			
			<div class="process-step">
				<div class="step-number">4</div>
				<h3>Revenue Distribution</h3>
				<p>Monthly payouts are automatically distributed to token holders based on actual production and oil prices.</p>
			</div>
		</div>
	</section>

	<!-- Platform Benefits -->
	<section class="benefits">
		<h2>Platform Benefits</h2>
		
		<div class="benefits-grid">
			<div class="benefit">
				<div class="benefit-icon">🔒</div>
				<h3>Institutional Grade</h3>
				<p>All assets are vetted by professional operators with proven track records and regulatory compliance.</p>
			</div>
			
			<div class="benefit">
				<div class="benefit-icon">💰</div>
				<h3>Direct Revenue Share</h3>
				<p>Token holders receive proportional revenue from real oil & gas production with transparent accounting.</p>
			</div>
			
			<div class="benefit">
				<div class="benefit-icon">📊</div>
				<h3>Real-Time Transparency</h3>
				<p>Live production data, financial reporting, and market metrics provide complete investment visibility.</p>
			</div>
			
			<div class="benefit">
				<div class="benefit-icon">🌐</div>
				<h3>Global Access</h3>
				<p>Blockchain technology enables worldwide access to premium energy investments previously reserved for institutions.</p>
			</div>
		</div>
	</section>

	<!-- Team Section -->
	<section class="team">
		<h2>Leadership Team</h2>
		
		<div class="team-grid">
			<div class="team-member">
				<div class="member-avatar">JD</div>
				<h3>John Doe</h3>
				<p class="member-title">CEO & Founder</p>
				<p class="member-bio">Former energy sector executive with 15+ years experience in oil & gas operations and financial markets.</p>
			</div>
			
			<div class="team-member">
				<div class="member-avatar">JS</div>
				<h3>Jane Smith</h3>
				<p class="member-title">CTO</p>
				<p class="member-bio">Blockchain technology expert specializing in smart contract development and decentralized finance protocols.</p>
			</div>
			
			<div class="team-member">
				<div class="member-avatar">MB</div>
				<h3>Mike Brown</h3>
				<p class="member-title">Head of Operations</p>
				<p class="member-bio">Petroleum engineer with extensive experience in asset evaluation, production optimization, and regulatory compliance.</p>
			</div>
		</div>
	</section>

	<!-- Company Stats -->
	<section class="stats">
		<h2>Platform Statistics</h2>
		
		<div class="stats-grid">
			<div class="stat">
				<div class="stat-value">$127.4M</div>
				<div class="stat-label">Total Investment Volume</div>
			</div>
			<div class="stat">
				<div class="stat-value">8,924</div>
				<div class="stat-label">Active Investors</div>
			</div>
			<div class="stat">
				<div class="stat-value">4</div>
				<div class="stat-label">Active Assets</div>
			</div>
			<div class="stat">
				<div class="stat-value">11.3%</div>
				<div class="stat-label">Average Payout</div>
			</div>
		</div>
	</section>

	<!-- Contact CTA -->
	<section class="contact-cta">
		<div class="cta-content">
			<h2>Ready to Start Investing?</h2>
			<p>Join thousands of investors earning from institutional-grade energy assets.</p>
			<div class="cta-buttons">
				<a href="/assets" class="btn-primary">Browse Assets</a>
				<a href="/contact" class="btn-secondary">Contact Us</a>
			</div>
		</div>
	</section>
</main>

<style>
	.about-page {
		padding-top: 0;
	}

	.hero {
		padding: 6rem 2rem;
		text-align: center;
		background: var(--color-white);
		border-bottom: 1px solid var(--color-light-gray);
	}

	.hero-content {
		max-width: 1200px;
		margin: 0 auto;
	}

	.hero h1 {
		font-size: 3.5rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 2rem;
		color: var(--color-black);
		letter-spacing: -0.02em;
		line-height: 1.1;
	}

	.hero p {
		font-size: 1.25rem;
		line-height: 1.6;
		color: var(--color-black);
		max-width: 600px;
		margin: 0 auto;
	}

	.mission {
		padding: 4rem 2rem;
		background: var(--color-light-gray);
		text-align: center;
	}

	.mission-content {
		max-width: 1200px;
		margin: 0 auto;
	}

	.mission h2 {
		font-size: 2rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 2rem;
	}

	.mission p {
		font-size: 1.1rem;
		line-height: 1.6;
		color: var(--color-black);
	}

	.how-it-works {
		padding: 4rem 2rem;
		max-width: 1200px;
		margin: 0 auto;
		text-align: center;
	}

	.how-it-works h2 {
		font-size: 2rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 3rem;
	}

	.process-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 2rem;
	}

	.process-step {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		padding: 2rem;
		text-align: center;
	}

	.step-number {
		width: 60px;
		height: 60px;
		background: var(--color-black);
		color: var(--color-white);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		font-weight: var(--font-weight-extrabold);
		margin: 0 auto 1.5rem;
	}

	.process-step h3 {
		font-size: 1.1rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 1rem;
	}

	.process-step p {
		font-size: 0.9rem;
		line-height: 1.5;
		color: var(--color-black);
	}

	.benefits {
		padding: 4rem 2rem;
		background: var(--color-light-gray);
		text-align: center;
	}

	.benefits h2 {
		font-size: 2rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 3rem;
	}

	.benefits-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.benefit {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		padding: 2rem;
		text-align: center;
	}

	.benefit-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.benefit h3 {
		font-size: 1.1rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 1rem;
	}

	.benefit p {
		font-size: 0.9rem;
		line-height: 1.5;
		color: var(--color-black);
	}

	.team {
		padding: 4rem 2rem;
		max-width: 1200px;
		margin: 0 auto;
		text-align: center;
	}

	.team h2 {
		font-size: 2rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 3rem;
	}

	.team-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2rem;
	}

	.team-member {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		padding: 2rem;
		text-align: center;
	}

	.member-avatar {
		width: 80px;
		height: 80px;
		background: var(--color-secondary);
		color: var(--color-white);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		font-weight: var(--font-weight-extrabold);
		margin: 0 auto 1rem;
	}

	.team-member h3 {
		font-size: 1.1rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
	}

	.member-title {
		font-size: 0.9rem;
		color: var(--color-primary);
		font-weight: var(--font-weight-semibold);
		margin-bottom: 1rem;
	}

	.member-bio {
		font-size: 0.85rem;
		line-height: 1.5;
		color: var(--color-black);
	}

	.stats {
		padding: 4rem 2rem;
		background: var(--color-secondary);
		color: var(--color-white);
		text-align: center;
	}

	.stats h2 {
		font-size: 2rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 3rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.stat {
		text-align: center;
	}

	.stat-value {
		font-size: 2.5rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-primary);
		margin-bottom: 0.5rem;
	}

	.stat-label {
		font-size: 0.9rem;
		font-weight: var(--font-weight-semibold);
		opacity: 0.9;
	}

	.contact-cta {
		padding: 4rem 2rem;
		background: var(--color-white);
		text-align: center;
	}

	.cta-content {
		max-width: 1200px;
		margin: 0 auto;
	}

	.contact-cta h2 {
		font-size: 2rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 1rem;
	}

	.contact-cta p {
		font-size: 1.1rem;
		color: var(--color-black);
		margin-bottom: 2rem;
	}

	.cta-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.btn-primary,
	.btn-secondary {
		padding: 1rem 2rem;
		text-decoration: none;
		font-weight: var(--font-weight-semibold);
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		transition: background-color 0.2s ease;
		display: inline-block;
	}

	.btn-primary {
		background: var(--color-black);
		color: var(--color-white);
	}

	.btn-primary:hover {
		background: var(--color-secondary);
	}

	.btn-secondary {
		background: var(--color-white);
		color: var(--color-black);
		border: 1px solid var(--color-black);
	}

	.btn-secondary:hover {
		background: var(--color-black);
		color: var(--color-white);
	}

	@media (max-width: 768px) {
		.hero h1 {
			font-size: 2.5rem;
		}

		.process-grid {
			grid-template-columns: 1fr;
		}

		.benefits-grid {
			grid-template-columns: 1fr;
		}

		.team-grid {
			grid-template-columns: 1fr;
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.cta-buttons {
			flex-direction: column;
			align-items: center;
		}
	}
</style>