<script lang="ts">
	export let padding = '2rem';
</script>

<div class="card-content" style:padding={padding}>
	<slot />
</div>

<style>
	.card-content {
		position: relative;
	}
</style>