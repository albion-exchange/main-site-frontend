/**
 * @fileoverview UI Store
 * 
 * Centralized state management for UI-related functionality like modals, 
 * notifications, and other interface states.
 */

import { writable } from 'svelte/store';

/**
 * Modal state interface
 */
interface ModalState {
	showWalletModal: boolean;
}

/**
 * Initial modal state
 */
const initialModalState: ModalState = {
	showWalletModal: false
};

/**
 * Modal state store
 */
const modalStore = writable<ModalState>(initialModalState);

/**
 * Modal state actions
 */
export const modalState = {
	...modalStore,
	showWalletModal: () => modalStore.update(state => ({ ...state, showWalletModal: true })),
	hideWalletModal: () => modalStore.update(state => ({ ...state, showWalletModal: false }))
};