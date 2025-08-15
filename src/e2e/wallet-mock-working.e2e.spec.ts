import { render, screen, fireEvent, waitFor } from '@testing-library/svelte/svelte5';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { installHttpMocks } from './http-mock';

// Create a simple test component that uses wallet
import { writable } from 'svelte/store';

// Mock wagmi BEFORE any imports that use it
vi.mock('svelte-wagmi', async () => {
  const { writable } = await import('svelte/store');
  return {
    web3Modal: writable({ open: vi.fn() }),
    signerAddress: writable(null),
    connected: writable(false),
    loading: writable(false),
    wagmiConfig: {},
    chainId: writable(8453),
    disconnectWagmi: vi.fn(),
  };
});

// Mock other dependencies
vi.mock('$app/stores', async () => {
  const { readable } = await import('svelte/store');
  return {
    page: readable({ url: new URL('http://localhost/'), params: {}, route: {}, status: 200, error: null, data: {} }),
    navigating: readable(null),
    updated: { subscribe: () => () => {} },
  };
});

vi.mock('@tanstack/svelte-query', () => ({
  createQuery: vi.fn(() => ({ subscribe: () => () => {} }))
}));

vi.mock('$lib/queries/getSftMetadata', () => ({
  getSftMetadata: vi.fn(async () => [])
}));

vi.mock('$lib/queries/getSfts', () => ({
  getSfts: vi.fn(async () => [])
}));

vi.mock('$lib/stores', async () => {
  const { writable } = await import('svelte/store');
  return {
    sftMetadata: writable([]),
    sfts: writable([])
  };
});

const ADDRESS = '0xc699575fe18f00104d926f0167cd858ce6d8b32e';
const WALLET = '0x1111111111111111111111111111111111111111';

describe('Wallet Mock Working Tests', () => {
  let restore: () => void;
  
  beforeEach(() => {
    vi.clearAllMocks();
    restore = installHttpMocks({
      sftSubgraphUrl: 'https://example.com/sft',
      metadataSubgraphUrl: 'https://example.com/meta',
      orderbookSubgraphUrl: 'https://example.com/orderbook',
      ipfsGateway: 'https://gateway.pinata.cloud/ipfs',
      wallet: WALLET,
      address: ADDRESS,
      orderHash: '0x123',
      csvCid: 'test',
    });
  });

  afterEach(() => {
    restore?.();
  });

  it('can mock wallet connection state', async () => {
    const wagmi = await import('svelte-wagmi');
    
    // Verify initial state
    let connected = false;
    wagmi.connected.subscribe(value => connected = value)();
    expect(connected).toBe(false);
    
    // Simulate connection
    wagmi.connected.set(true);
    wagmi.signerAddress.set(WALLET);
    
    // Verify connected state
    wagmi.connected.subscribe(value => connected = value)();
    expect(connected).toBe(true);
    
    let address = null;
    wagmi.signerAddress.subscribe(value => address = value)();
    expect(address).toBe(WALLET);
  });

  it('can mock wallet disconnect', async () => {
    const wagmi = await import('svelte-wagmi');
    
    // Start connected
    wagmi.connected.set(true);
    wagmi.signerAddress.set(WALLET);
    
    // Disconnect
    await wagmi.disconnectWagmi();
    
    // Should be called
    expect(wagmi.disconnectWagmi).toHaveBeenCalled();
  });

  it('can mock network changes', async () => {
    const wagmi = await import('svelte-wagmi');
    
    let chainId = 0;
    wagmi.chainId.subscribe(value => chainId = value)();
    expect(chainId).toBe(8453); // Base
    
    // Switch to wrong network
    wagmi.chainId.set(1); // Ethereum
    
    wagmi.chainId.subscribe(value => chainId = value)();
    expect(chainId).toBe(1);
  });

  it('can mock wallet loading states', async () => {
    const wagmi = await import('svelte-wagmi');
    
    let loading = false;
    wagmi.loading.subscribe(value => loading = value)();
    expect(loading).toBe(false);
    
    // Start loading
    wagmi.loading.set(true);
    wagmi.loading.subscribe(value => loading = value)();
    expect(loading).toBe(true);
    
    // Finish loading
    wagmi.loading.set(false);
    wagmi.loading.subscribe(value => loading = value)();
    expect(loading).toBe(false);
  });

  it('can mock Web3Modal interactions', async () => {
    const wagmi = await import('svelte-wagmi');
    const openMock = vi.fn();
    
    wagmi.web3Modal.set({ open: openMock });
    
    // Get modal and call open
    let modal: any = null;
    wagmi.web3Modal.subscribe(value => modal = value)();
    modal.open();
    
    expect(openMock).toHaveBeenCalled();
  });
});

describe('Wallet Error Scenarios', () => {
  it('can simulate connection rejection', async () => {
    const wagmi = await import('svelte-wagmi');
    const openMock = vi.fn(() => {
      throw new Error('User rejected connection');
    });
    
    wagmi.web3Modal.set({ open: openMock });
    
    let modal: any = null;
    wagmi.web3Modal.subscribe(value => modal = value)();
    
    // Should throw
    expect(() => modal.open()).toThrow('User rejected connection');
  });

  it('can simulate wrong network', async () => {
    const wagmi = await import('svelte-wagmi');
    
    // Connect to wrong network
    wagmi.connected.set(true);
    wagmi.signerAddress.set(WALLET);
    wagmi.chainId.set(1); // Wrong network
    
    let chainId = 0;
    wagmi.chainId.subscribe(value => chainId = value)();
    
    // App should detect wrong network
    const isWrongNetwork = chainId !== 8453;
    expect(isWrongNetwork).toBe(true);
  });

  it('can simulate wallet disconnect during transaction', async () => {
    const wagmi = await import('svelte-wagmi');
    
    // Start connected
    wagmi.connected.set(true);
    wagmi.signerAddress.set(WALLET);
    
    // Simulate disconnect during transaction
    setTimeout(() => {
      wagmi.connected.set(false);
      wagmi.signerAddress.set(null);
    }, 100);
    
    // Start a "transaction"
    let connected = true;
    wagmi.connected.subscribe(value => connected = value)();
    expect(connected).toBe(true);
    
    // Wait for disconnect
    await new Promise(resolve => setTimeout(resolve, 150));
    
    wagmi.connected.subscribe(value => connected = value)();
    expect(connected).toBe(false);
  });
});