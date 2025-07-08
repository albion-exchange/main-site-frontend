<script lang="ts">
	export let src: string;
	export let alt: string;
	export let height = '200px';
	export let zoomOnHover = true;
</script>

<div class="card-image" style:height={height}>
	<img 
		{src} 
		{alt} 
		class:zoom-on-hover={zoomOnHover}
		loading="lazy"
	/>
</div>

<style>
	.card-image {
		overflow: hidden;
		position: relative;
		width: 100%;
	}
	
	.card-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}
	
	.card-image img.zoom-on-hover {
		will-change: transform;
	}
	
	/* Parent card hover triggers image zoom */
	:global(.card:hover) .card-image img.zoom-on-hover {
		transform: scale(1.05);
	}
	
	/* Disable zoom on touch devices */
	@media (hover: none) {
		:global(.card:hover) .card-image img.zoom-on-hover {
			transform: none;
		}
	}
</style>