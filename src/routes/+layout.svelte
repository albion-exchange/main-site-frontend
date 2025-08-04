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

	const baseRpcUrls = [
		// "https://mainnet.base.org",
		"https://base-rpc.publicnode.com",
		"https://base.llamarpc.com",
		"https://0xrpc.io/base",
		"https://base.drpc.org",
		"https://base-mainnet.gateway.tatum.io"
	]
	const baseNetworkFallbackRpcs = {
	...base,
	rpcUrls: {
		...base.rpcUrls,
		default: {
			http: baseRpcUrls
		},
		public: {
			http: baseRpcUrls
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
			chains: [baseNetworkFallbackRpcs],
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