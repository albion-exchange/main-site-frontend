<script lang="ts">
	import '../app.css';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { defaultConfig } from 'svelte-wagmi';
	import { base } from '@wagmi/core/chains';
	import { injected, walletConnect } from '@wagmi/connectors';
	import { onMount } from 'svelte';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

	let PUBLIC_WALLETCONNECT_ID = 'demo';

	const baseNetworkFallbackRpcs = {
		...base,
		rpcUrls: {
			...base.rpcUrls,
			default: {
				http: [
					"https://mainnet.base.org",
					"https://base-rpc.publicnode.com",
					"https://base.llamarpc.com",
					"https://0xrpc.io/base",
					"https://base.drpc.org",
					"https://base-mainnet.gateway.tatum.io",
					"https://base.blockpi.network/v1/rpc/public",
					"https://1rpc.io/base",
					"https://base.meowrpc.com"
				]
			},
			public: {
				http: [
					"https://mainnet.base.org",
					"https://base-rpc.publicnode.com",
					"https://base.llamarpc.com",
					"https://0xrpc.io/base",
					"https://base.drpc.org",
					"https://base-mainnet.gateway.tatum.io",
					"https://base.blockpi.network/v1/rpc/public",
					"https://1rpc.io/base",
					"https://base.meowrpc.com"
				]
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

	onMount(async () => {
		try {
			// @ts-ignore - dynamic import to avoid SSR build error when env not defined
			const mod = await import('$env/static/public');
			PUBLIC_WALLETCONNECT_ID = (mod as any).PUBLIC_WALLETCONNECT_ID || 'demo';
		} catch {
			PUBLIC_WALLETCONNECT_ID = 'demo';
		}
		await initWallet();
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