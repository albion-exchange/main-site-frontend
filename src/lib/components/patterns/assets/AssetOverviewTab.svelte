<script lang="ts">
	import type { Asset } from '$lib/types/uiTypes';
	import SectionTitle from '$lib/components/components/SectionTitle.svelte';
	import { formatEndDate } from '$lib/utils/formatters';
	import { useTooltip } from '$lib/composables';

	export let asset: Asset;

	const { showTooltipWithDelay, hideTooltip, showTooltip } = useTooltip();



	function formatPricing(benchmarkPremium: string, transportCosts: string): string {
		let pricingText = '';
		
		// Format benchmark premium/discount
		if (benchmarkPremium) {
			const value = benchmarkPremium.replace(/[^-+\d.]/g, '');
			if (value.startsWith('-')) {
				pricingText = `US$${value.substring(1)} discount to benchmark`;
			} else if (value.startsWith('+')) {
				pricingText = `US$${value.substring(1)} premium to benchmark`;
			} else if (value !== '0') {
				pricingText = `US$${value} premium to benchmark`;
			}
		}
		
		// Format transport costs (always show, even if zero)
		if (transportCosts !== undefined && transportCosts !== null) {
			const costValue = transportCosts.replace(/[^-+\d.]/g, '') || '0';
			if (pricingText) {
				pricingText += '\n';
			}
			pricingText += `US$${costValue} transport costs`;
		}
		
		return pricingText || 'At benchmark';
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
					<span class="text-black whitespace-pre-line text-right">{formatPricing(asset?.technical?.pricing?.benchmarkPremium || '', asset?.technical?.pricing?.transportCosts || '')}</span>
				</div>
				<div class="flex justify-between pb-3 border-b border-light-gray text-base last:border-b-0 last:pb-0">
					<span class="font-semibold text-black">First Oil</span>
					<span class="text-black">{formatEndDate(asset?.technical?.firstOil || '')}</span>
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
					<span class="text-black">{asset?.terms?.interestType}</span>
				</div>
				<div class="flex justify-between pb-3 border-b border-light-gray text-base last:border-b-0 last:pb-0">
					<span class="font-semibold text-black relative">
						Amount
						<span class="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-light-gray text-black text-[10px] font-bold ml-1 cursor-help opacity-70 transition-opacity duration-200 hover:opacity-100"
							on:mouseenter={() => showTooltipWithDelay('amount')}
							on:mouseleave={hideTooltip}
							role="button"
							tabindex="0">ⓘ</span>
						{#if $showTooltip === 'amount'}
							<div class="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white p-2 rounded text-xs whitespace-nowrap z-[1000] mb-[5px] max-w-[200px] whitespace-normal text-left">
								All numbers shown have already been adjusted for the royalty percentage and represent the net amounts payable to token holders
								<div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-black"></div>
							</div>
						{/if}
					</span>
					<span class="text-black">{asset?.terms?.amount}%</span>
				</div>
				<div class="flex justify-between pb-3 border-b border-light-gray text-base last:border-b-0 last:pb-0">
					<span class="font-semibold text-black">Payment Frequency</span>
					<span class="text-black">{asset?.terms?.paymentFrequency} days</span>
				</div>
				<div class="flex justify-between pb-3 border-b border-light-gray text-base last:border-b-0 last:pb-0">
					<span class="font-semibold text-black">Water Depth</span>
					<span class="text-black">{asset?.location?.waterDepth || 'Onshore'}</span>
				</div>
				<div class="flex justify-between gap-4 pb-3 border-b border-light-gray text-base last:border-b-0 last:pb-0">
					<span class="font-semibold text-black">Infrastructure</span>
					<span class="text-black text-right flex-1">{asset?.technical?.infrastructure}</span>
				</div>
				<div class="flex justify-between gap-4 pb-3 border-b border-light-gray text-base last:border-b-0 last:pb-0">
					<span class="font-semibold text-black">Environmental</span>
					<span class="text-black text-right flex-1">{asset?.technical?.environmental}</span>
				</div>
			</div>
		</div>
	</div>

</div>