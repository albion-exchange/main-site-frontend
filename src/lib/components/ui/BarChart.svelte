<script lang="ts">
	import ChartTooltip from './ChartTooltip.svelte';
	
	export let data: Array<{label: string; value: number}> = [];
	export let width: number = 950;
	export let height: number = 400;
	export let barColor: string = '#08bccc';
	export let lineColor: string = '#283c84';
	export let valuePrefix: string = '';
	export let valueSuffix: string = '';
	export let title: string = '';
	export let showLine: boolean = true;
	export let showValues: boolean = false;
	
	// Helper to determine which labels to show based on data density
	function getLabelsToShow(data: Array<{label: string; value: number}>): {indices: number[], showYear: boolean} {
		const count = data.length;
		let indices: number[] = [];
		let showYear = true;
		
		if (count <= 12) {
			// Show all months
			indices = data.map((_, i) => i);
		} else if (count <= 24) {
			// Show every other month
			indices = data.map((_, i) => i).filter(i => i % 2 === 0);
		} else if (count <= 48) {
			// Show quarterly (Jan, Apr, Jul, Oct)
			indices = data.map((_, i) => {
				try {
					const dateStr = data[i].label.includes('T') ? data[i].label : data[i].label + 'T00:00:00';
					const date = new Date(dateStr);
					if (isNaN(date.getTime())) return -1;
					const month = date.getMonth();
					return [0, 3, 6, 9].includes(month) ? i : -1;
				} catch {
					return -1;
				}
			}).filter(i => i >= 0);
		} else {
			// Show only years
			indices = data.map((_, i) => {
				const dateStr = data[i].label.includes('T') ? data[i].label : data[i].label + 'T00:00:00';
				const date = new Date(dateStr);
				const prevDateStr = i > 0 ? (data[i-1].label.includes('T') ? data[i-1].label : data[i-1].label + 'T00:00:00') : null;
				const prevDate = prevDateStr ? new Date(prevDateStr) : null;
				return !prevDate || date.getFullYear() !== prevDate.getFullYear() ? i : -1;
			}).filter(i => i >= 0);
			showYear = false; // Don't show year separately as it's in the label
		}
		
		return { indices, showYear };
	}
	
	let svg: SVGSVGElement;
	let tooltipData = {
		show: false,
		x: 0,
		y: 0,
		value: 0,
		label: ''
	};
	
	const padding = { top: 70, right: 80, bottom: 80, left: 90 };
	const chartWidth = width - padding.left - padding.right;
	const chartHeight = height - padding.top - padding.bottom;
	
	$: maxValue = Math.max(...data.map(d => d.value), 1);
	$: barWidth = chartWidth / Math.max(data.length, 1) * 0.6;
	$: barSpacing = chartWidth / Math.max(data.length, 1);
	
	function handleMouseMove(event: MouseEvent, index: number) {
		if (!svg || index >= data.length) return;
		
		const dataPoint = data[index];
		const x = padding.left + (index + 0.5) * barSpacing;
		const y = padding.top + chartHeight - (dataPoint.value / maxValue) * chartHeight;
		
		// Format date for tooltip
		let formattedLabel = dataPoint.label;
		try {
			const dateStr = dataPoint.label.includes('T') ? dataPoint.label : dataPoint.label + 'T00:00:00';
			const date = new Date(dateStr);
			if (!isNaN(date.getTime())) {
				formattedLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
			}
		} catch (e) {
			// Keep original label if date parsing fails
		}
		
		tooltipData = {
			show: true,
			x,
			y,
			value: dataPoint.value,
			label: formattedLabel
		};
	}
	
	function handleMouseLeave() {
		tooltipData.show = false;
	}
</script>

<div class="relative">
	<svg bind:this={svg} {width} {height} xmlns="http://www.w3.org/2000/svg">
		<!-- Background -->
		<rect width={width} height={height} fill="#ffffff" stroke="#f8f4f4" stroke-width="1"/>
		
		<!-- Grid lines -->
		{#each Array(7) as _, i}
			<line 
				x1={padding.left} 
				y1={padding.top + i * (chartHeight / 6)} 
				x2={padding.left + chartWidth} 
				y2={padding.top + i * (chartHeight / 6)} 
				stroke="#f8f4f4" 
				stroke-width="0.5" 
				opacity="0.5"
			/>
		{/each}
		{#each data as _, i}
			<line 
				x1={padding.left + (i + 1) * barSpacing} 
				y1={padding.top} 
				x2={padding.left + (i + 1) * barSpacing} 
				y2={padding.top + chartHeight} 
				stroke="#f8f4f4" 
				stroke-width="0.5" 
				opacity="0.3"
			/>
		{/each}
		
		<!-- Y-axis labels -->
		{#each Array(7) as _, i}
			<text 
				x={padding.left - 10} 
				y={padding.top + i * (chartHeight / 6) + 5} 
				text-anchor="end" 
				font-size="13" 
				fill="#000000" 
				font-family="Figtree" 
				font-weight="semibold"
			>
				{Math.round(maxValue * (1 - i / 6))}
			</text>
		{/each}
		
		<!-- X-axis labels -->
		{#if data.length > 0}
			{@const labelInfo = getLabelsToShow(data)}
			{#each data as item, i}
				{#if labelInfo.indices.includes(i)}
					{@const dateStr = item.label.includes('T') ? item.label : item.label + 'T00:00:00'}
					{@const date = new Date(dateStr)}
					{@const isValidDate = !isNaN(date.getTime())}
					{@const monthLabel = isValidDate ? date.toLocaleDateString('en-US', { month: 'short' }) : item.label}
					{@const year = isValidDate ? date.getFullYear() : ''}
					
					<text 
						x={padding.left + (i + 0.5) * barSpacing} 
						y={padding.top + chartHeight + 20} 
						text-anchor="middle" 
						font-size="12" 
						fill="#000000" 
						opacity="0.8"
					>
						{labelInfo.showYear ? monthLabel : year}
					</text>
					
					{#if labelInfo.showYear && (i === 0 || date.getFullYear() !== new Date(data[Math.max(0, i-1)].label.includes('T') ? data[Math.max(0, i-1)].label : data[Math.max(0, i-1)].label + 'T00:00:00').getFullYear())}
						<text 
							x={padding.left + (i + 0.5) * barSpacing} 
							y={padding.top + chartHeight + 35} 
							text-anchor="middle" 
							font-size="11" 
							fill="#666666" 
							font-weight="bold"
						>
							{year}
						</text>
					{/if}
				{/if}
			{/each}
		{/if}
		
		
		<!-- Line chart -->
		{#if showLine && data.length > 1}
			{@const linePath = data.map((item, i) => {
				const x = padding.left + (i + 0.5) * barSpacing;
				const y = padding.top + chartHeight - (item.value / maxValue) * chartHeight;
				return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
			}).join(' ')}
			
			<path 
				d={linePath} 
				fill="none" 
				stroke={lineColor} 
				stroke-width="3"
			/>
			
			<!-- Data points -->
			{#each data as item, i}
				{@const x = padding.left + (i + 0.5) * barSpacing}
				{@const y = padding.top + chartHeight - (item.value / maxValue) * chartHeight}
				
				<circle 
					cx={x} 
					cy={y} 
					r="4" 
					fill={lineColor}
					on:mousemove={(e) => handleMouseMove(e, i)}
					on:mouseleave={handleMouseLeave}
					class="cursor-pointer"
					role="button"
					tabindex="0"
					aria-label="Data point {i + 1}"
				/>
			{/each}
		{/if}
		
		<!-- Values on bars (if not using tooltip) -->
		{#if showValues && !tooltipData.show}
			{#each data as item, i}
				{@const x = padding.left + (i + 0.5) * barSpacing}
				{@const y = padding.top + chartHeight - (item.value / maxValue) * chartHeight - 10}
				
				<text 
					{x}
					{y}
					text-anchor="middle" 
					font-size="12" 
					font-weight="bold" 
					fill="#000000"
				>
					{Math.round(item.value)}
				</text>
			{/each}
		{/if}
		
		<!-- Title -->
		{#if title}
			<text 
				x={width / 2} 
				y="35" 
				text-anchor="middle" 
				font-size="18" 
				font-weight="bold" 
				fill="#000000" 
				font-family="Figtree"
			>
				{title}
			</text>
		{/if}
		
		<!-- Legend -->
		<rect x={width - 170} y="80" width="160" height="45" fill="#ffffff" stroke="#f8f4f4" stroke-width="1"/>
		<line x1={width - 160} y1="95" x2={width - 135} y2="95" stroke={barColor} stroke-width="3"/>
		<text x={width - 130} y="100" font-size="13" fill="#000000" font-family="Figtree" font-weight="medium">Production Rate</text>
		<circle cx={width - 148} cy="110" r="3" fill={lineColor}/>
		<text x={width - 130} y="115" font-size="13" fill="#000000" font-family="Figtree" font-weight="medium">Monthly Data</text>
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