<script lang="ts">
	import '../app.css';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { PUBLIC_WALLETCONNECT_ID } from '$env/static/public';
	import { defaultConfig } from 'svelte-wagmi';
	import { base } from '@wagmi/core/chains';
	import { injected, walletConnect } from '@wagmi/connectors';
	import { onMount } from 'svelte';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { BASE_RPC_ENDPOINTS } from '$lib/config/rpcEndpoints';

	const baseNetworkFallbackRpcs = {
		...base,
		rpcUrls: {
			...base.rpcUrls,
			default: {
				http: BASE_RPC_ENDPOINTS
			},
			public: {
				http: BASE_RPC_ENDPOINTS
			}
		}
	};


	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: Infinity
			}
		}
	});

	const initWallet = async () => {
		const erckit = defaultConfig({
			autoConnect: true,
			appName: 'base',
			walletConnectProjectId: PUBLIC_WALLETCONNECT_ID,
			chains: [baseNetworkFallbackRpcs], // Use custom chain with multiple RPC URLs
			connectors: [injected(), walletConnect({ projectId: PUBLIC_WALLETCONNECT_ID })]
		});
		await erckit.init();
	};

	onMount(() => {
		initWallet();
		injectAnalytics();
		injectSpeedInsights();
		return () => {
			document.body.style.overflow = '';
		};
	});
</script>

<QueryClientProvider client={queryClient}>
	<slot />
</QueryClientProvider>