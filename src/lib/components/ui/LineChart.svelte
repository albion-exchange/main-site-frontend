<script lang="ts">
	import { onMount } from 'svelte';
	import ChartTooltip from './ChartTooltip.svelte';
	
	export let data: Array<{date: string; value: number}> = [];
	export let width: number = 300;
	export let height: number = 200;
	export let valuePrefix: string = '$';
	export let valueSuffix: string = '';
	export let strokeColor: string = '#08bccc';
	export let fillColor: string = '#08bccc';
	export let fillOpacity: number = 0.1;
	export let showGrid: boolean = true;
	export let animate: boolean = true;
	
	let svg: SVGSVGElement;
	let tooltipData = {
		show: false,
		x: 0,
		y: 0,
		value: 0,
		label: ''
	};
	
	const padding = { top: 20, right: 20, bottom: 40, left: 60 };
	const chartWidth = width - padding.left - padding.right;
	const chartHeight = height - padding.top - padding.bottom;
	
	$: xScale = (index: number) => (index / (data.length - 1)) * chartWidth;
	$: yScale = (value: number) => {
		const min = 0; // Always start at 0 for x-intercept
		const max = Math.max(...data.map(d => d.value)) * 1.1; // Add 10% padding at top
		const range = max - min || 1;
		return chartHeight - ((value - min) / range) * chartHeight;
	};
	
	$: yAxisLabels = (() => {
		const max = Math.max(...data.map(d => d.value)) * 1.1;
		const step = max / 5;
		return Array.from({length: 6}, (_, i) => Math.round(step * i));
	})();
	
	$: pathData = data.map((d, i) => {
		const x = xScale(i);
		const y = yScale(d.value);
		return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
	}).join(' ');
	
	$: areaPath = pathData + ` L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;
	
	function handleMouseMove(event: MouseEvent) {
		if (!svg || data.length === 0) return;
		
		const rect = svg.getBoundingClientRect();
		const x = event.clientX - rect.left - padding.left;
		const index = Math.round((x / chartWidth) * (data.length - 1));
		
		if (index >= 0 && index < data.length) {
			const dataPoint = data[index];
			tooltipData = {
				show: true,
				x: xScale(index) + padding.left,
				y: yScale(dataPoint.value) + padding.top,
				value: dataPoint.value,
				label: new Date(dataPoint.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
			};
		}
	}
	
	function handleMouseLeave() {
		tooltipData.show = false;
	}
	
	onMount(() => {
		if (animate && svg) {
			const path = svg.querySelector('.line-path') as SVGPathElement;
			if (path) {
				const length = path.getTotalLength();
				path.style.strokeDasharray = `${length}`;
				path.style.strokeDashoffset = `${length}`;
				path.style.transition = 'stroke-dashoffset 1s ease-in-out';
				setTimeout(() => {
					path.style.strokeDashoffset = '0';
				}, 100);
			}
		}
	});
</script>

<div class="relative" style="width: {width}px; height: {height}px;">
	<svg
		bind:this={svg}
		{width}
		{height}
		on:mousemove={handleMouseMove}
		on:mouseleave={handleMouseLeave}
		class="cursor-crosshair"
		role="img"
		aria-label="Line chart"
	>
		<g transform="translate({padding.left}, {padding.top})">
			{#if showGrid}
				<!-- Horizontal grid lines -->
				{#each yAxisLabels as _, i}
					<line
						x1="0"
						y1={chartHeight - (chartHeight * (i / (yAxisLabels.length - 1)))}
						x2={chartWidth}
						y2={chartHeight - (chartHeight * (i / (yAxisLabels.length - 1)))}
						stroke="#f8f4f4"
						stroke-width="1"
					/>
				{/each}
			{/if}
			
			<!-- Y-axis labels -->
			{#each yAxisLabels as label, i}
				<text
					x="-10"
					y={chartHeight - (chartHeight * (i / (yAxisLabels.length - 1))) + 5}
					text-anchor="end"
					font-size="11"
					fill="#666"
				>
					{valuePrefix}{label.toLocaleString()}{valueSuffix}
				</text>
			{/each}
			
			{#if data.length > 0}
				<!-- Area fill -->
				<path
					d={areaPath}
					fill={fillColor}
					fill-opacity={fillOpacity}
				/>
				
				<!-- Line -->
				<path
					class="line-path"
					d={pathData}
					fill="none"
					stroke={strokeColor}
					stroke-width="2"
				/>
				
				<!-- Data points -->
				{#each data as d, i}
					<circle
						cx={xScale(i)}
						cy={yScale(d.value)}
						r="3"
						fill={strokeColor}
						class="hover:r-4 transition-all duration-200"
					/>
				{/each}
			{/if}
			
			<!-- X-axis labels -->
			{#if data.length > 0}
				<text
					x="0"
					y={chartHeight + 20}
					text-anchor="start"
					class="text-xs fill-black opacity-70"
				>
					{new Date(data[0].date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
				</text>
				<text
					x={chartWidth}
					y={chartHeight + 20}
					text-anchor="end"
					class="text-xs fill-black opacity-70"
				>
					{new Date(data[data.length - 1].date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
				</text>
			{/if}
		</g>
	</svg>
	
	<ChartTooltip
		show={tooltipData.show}
		x={tooltipData.x}
		y={tooltipData.y}
		value={tooltipData.value}
		label={tooltipData.label}
		valuePrefix={valuePrefix}
		valueSuffix={valueSuffix}
	/>
</div>