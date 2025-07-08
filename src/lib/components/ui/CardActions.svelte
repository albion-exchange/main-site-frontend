<script lang="ts">
	export let gap = '1rem';
	export let justify = 'flex-start';
</script>

<div class="card-actions" style:gap={gap} style:justify-content={justify}>
	<slot />
</div>

<style>
	.card-actions {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
	}
	
	/* Ensure buttons in card actions have consistent styling */
	:global(.card-actions > *) {
		flex: 1;
		min-width: 0;
	}
	
	:global(.card-actions > a),
	:global(.card-actions > button) {
		text-align: center;
	}
	
	@media (max-width: 480px) {
		.card-actions {
			flex-direction: column;
		}
		
		:global(.card-actions > *) {
			width: 100%;
		}
	}
</style>