import { writable } from 'svelte/store';

interface WalletState {
	isConnected: boolean;
	address: string;
	isConnecting: boolean;
}

const initialState: WalletState = {
	isConnected: false,
	address: '',
	isConnecting: false
};

export const walletStore = writable<WalletState>(initialState);

export const walletActions = {
	async connect(): Promise<void> {
		walletStore.update(state => ({ ...state, isConnecting: true }));
		
		// Simulate wallet connection delay
		await new Promise(resolve => setTimeout(resolve, 1500));
		
		// Mock wallet connection
		walletStore.update(state => ({
			...state,
			isConnected: true,
			address: '0x7d8f...a2b1',
			isConnecting: false
		}));
	},
	
	disconnect(): void {
		walletStore.update(state => ({
			...state,
			isConnected: false,
			address: '',
			isConnecting: false
		}));
	}
};

export function formatAddress(address: string): string {
	if (!address) return '';
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
}