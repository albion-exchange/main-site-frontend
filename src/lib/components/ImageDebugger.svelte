<script lang="ts">
	import dataStoreService from '$lib/services/DataStoreService';
	
	// Get the first asset to test
	const assets = dataStoreService.getAllAssets();
	const testAsset = assets[0];
	
	console.log('Debug - Test Asset:', testAsset);
	console.log('Debug - Cover Image Path:', testAsset?.coverImage);
	
	// Test different image paths
	const testPaths = [
		'/images/bak-hf-cover.jpeg',
		'/static/images/bak-hf-cover.jpeg', 
		'./images/bak-hf-cover.jpeg',
		'/test-image.txt'
	];
</script>

<div class="p-4 bg-yellow-100 border border-yellow-400 rounded">
	<h3 class="font-bold text-lg mb-4">Image Debug Information</h3>
	
	<div class="mb-4">
		<h4 class="font-semibold">Asset Cover Image Path:</h4>
		<code class="bg-gray-100 px-2 py-1 rounded">{testAsset?.coverImage || 'No asset found'}</code>
	</div>
	
	<div class="mb-4">
		<h4 class="font-semibold">Test Images:</h4>
		{#each testPaths as path}
			<div class="mb-2">
				<p>Path: <code class="bg-gray-100 px-2 py-1 rounded">{path}</code></p>
				<img 
					src={path} 
					alt="Test" 
					class="w-32 h-20 object-cover border"
					on:load={() => console.log('✅ Image loaded:', path)}
					on:error={() => console.log('❌ Image failed:', path)}
				/>
			</div>
		{/each}
	</div>
	
	<div class="mb-4">
		<h4 class="font-semibold">Test Static File:</h4>
		<iframe src="/test-image.txt" class="w-full h-20 border"></iframe>
	</div>
</div>