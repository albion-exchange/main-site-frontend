<script lang="ts">
	import type { Asset } from '$lib/types/uiTypes';
	import SectionTitle from '$lib/components/ui/SectionTitle.svelte';
	import { useTooltip } from '$lib/composables';

	export let asset: Asset;

	const { showTooltipWithDelay, hideTooltip, showTooltip } = useTooltip();

	function formatEndDate(dateStr: string): string {
		if (!dateStr || dateStr === 'undefined') return 'TBD';
		const parts = dateStr.split('-');
		if (parts.length < 2) return 'TBD';
		const [year, month] = parts;
		const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
						 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		const monthIndex = parseInt(month) - 1;
		if (monthIndex < 0 || monthIndex >= 12) return 'TBD';
		return `${monthNames[monthIndex]} ${year}`;
	}

	function formatPricing(benchmarkPremium: string): string {
		if (benchmarkPremium.startsWith('-')) {
			return `${benchmarkPremium.substring(1)} discount`;
		} else if (benchmarkPremium.startsWith('+')) {
			return `${benchmarkPremium.substring(1)} premium`;
		} else {
			return `${benchmarkPremium} premium`;
		}
	}
</script>

<div class="flex-1 flex flex-col">
	<div class="grid md:grid-cols-2 grid-cols-1 gap-12 mb-12">
		<div>
			<SectionTitle level="h3" size="subsection" className="mb-6 uppercase tracking-wider">Asset Fundamentals</SectionTitle>
			<div class="flex flex-col gap-4">
				<div class="flex justify-between pb-3 border-b border-light-gray text-base last:border-b-0 last:pb-0">
					<span class="font-semibold text-black">Field Type</span>
					<span class="text-black">{asset?.technical?.fieldType}</span>
				</div>
				<div class="flex justify-between pb-3 border-b border-light-gray text-base last:border-b-0 last:pb-0">
					<span class="font-semibold text-black">Crude Benchmark</span>
					<span class="text-black">{asset?.technical?.crudeBenchmark}</span>
				</div>
				<div class="flex justify-between pb-3 border-b border-light-gray text-base last:border-b-0 last:pb-0">
					<span class="font-semibold text-black">Pricing</span>
					<span class="text-black">{formatPricing(asset?.technical?.pricing?.benchmarkPremium || '')}, {asset?.technical?.pricing?.transportCosts}</span>
				</div>
				<div class="flex justify-between pb-3 border-b border-light-gray text-base last:border-b-0 last:pb-0">
					<span class="font-semibold text-black">First Oil</span>
					<span class="text-black">{asset?.technical?.firstOil}</span>
				</div>
				<div class="flex justify-between pb-3 border-b border-light-gray text-base last:border-b-0 last:pb-0">
					<span class="font-semibold text-black">Estimated End Date</span>
					<span class="text-black">{formatEndDate(asset?.technical?.expectedEndDate || '')}</span>
				</div>
				<div class="flex justify-between pb-3 border-b border-light-gray text-base last:border-b-0 last:pb-0">
					<span class="font-semibold text-black">Coordinates</span>
					<span class="text-black">{asset?.location?.coordinates?.lat}°, {asset?.location?.coordinates?.lng}°</span>
				</div>
			</div>
		</div>

		<div>
			<SectionTitle level="h3" size="subsection" className="mb-6 uppercase tracking-wider">Asset Terms</SectionTitle>
			<div class="flex flex-col gap-4">
				<div class="flex justify-between pb-3 border-b border-light-gray text-base last:border-b-0 last:pb-0">
					<span class="font-semibold text-black">Interest Type</span>
					<span class="text-black">{asset?.assetTerms?.interestType}</span>
				</div>
				<div class="flex justify-between pb-3 border-b border-light-gray text-base last:border-b-0 last:pb-0">
					<span class="font-semibold text-black relative">
						Amount
						{#if asset?.assetTerms?.amountTooltip}
							<span class="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-light-gray text-black text-[10px] font-bold ml-1 cursor-help opacity-70 transition-opacity duration-200 hover:opacity-100"
								on:mouseenter={() => showTooltipWithDelay('amount')}
								on:mouseleave={hideTooltip}
								role="button"
								tabindex="0">ⓘ</span>
							{#if $showTooltip === 'amount'}
								<div class="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white p-2 rounded text-xs whitespace-nowrap z-[1000] mb-[5px] max-w-[200px] whitespace-normal text-left">
									{asset?.assetTerms?.amountTooltip}
									<div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-black"></div>
								</div>
							{/if}
						{/if}
					</span>
					<span class="text-black">{asset?.assetTerms?.amount}</span>
				</div>
				<div class="flex justify-between pb-3 border-b border-light-gray text-base last:border-b-0 last:pb-0">
					<span class="font-semibold text-black">Payment Frequency</span>
					<span class="text-black">{asset?.assetTerms?.paymentFrequency}</span>
				</div>
				<div class="flex justify-between pb-3 border-b border-light-gray text-base last:border-b-0 last:pb-0">
					<span class="font-semibold text-black">Water Depth</span>
					<span class="text-black">{asset?.location?.waterDepth || 'Onshore'}</span>
				</div>
				<div class="flex justify-between pb-3 border-b border-light-gray text-base last:border-b-0 last:pb-0">
					<span class="font-semibold text-black">Infrastructure</span>
					<span class="text-black">{asset?.technical?.infrastructure}</span>
				</div>
				<div class="flex justify-between pb-3 border-b border-light-gray text-base last:border-b-0 last:pb-0">
					<span class="font-semibold text-black">Environmental</span>
					<span class="text-black">{asset?.technical?.environmental}</span>
				</div>
			</div>
		</div>
	</div>

	<div class="mt-12">
		<SectionTitle level="h3" size="subsection" className="mb-6 uppercase tracking-wider">About this Asset</SectionTitle>
		<div class="text-base text-black leading-relaxed space-y-4">
			{#if asset?.description}
				{#each asset.description.split('\n') as paragraph}
					{#if paragraph.trim()}
						<p>{paragraph}</p>
					{/if}
				{/each}
			{:else}
				<p>This energy asset represents a direct investment opportunity in proven oil and gas production. Located in a strategic region with established infrastructure, this asset offers steady cash flow through regular monthly distributions based on actual production revenue.</p>
				<p>The investment is structured as a royalty interest, providing investors with a percentage of gross revenue from oil and gas production. This means returns are directly tied to commodity prices and production volumes, offering both income and potential upside from energy market dynamics.</p>
				<p>All tokens are backed by verifiable production data and monthly revenue reports, ensuring transparency and accountability in your investment returns.</p>
			{/if}
		</div>
	</div>
</div>