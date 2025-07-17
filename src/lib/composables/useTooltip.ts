/**
 * Tooltip composable
 * Extracts tooltip state and logic from components
 */

import { writable } from 'svelte/store';

export interface TooltipState {
  visible: boolean;
  content: string;
  id: string;
}

/**
 * Create tooltip composable
 */
export function useTooltip() {
  const { subscribe, set, update } = writable<TooltipState>({
    visible: false,
    content: '',
    id: ''
  });

  let timer: ReturnType<typeof setTimeout> | null = null;

  const show = (id: string, content: string, delay: number = 300) => {
    // Clear any existing timer
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      set({
        visible: true,
        content,
        id
      });
    }, delay);
  };

  const hide = (delay: number = 100) => {
    // Clear any existing timer
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      set({
        visible: false,
        content: '',
        id: ''
      });
    }, delay);
  };

  const hideImmediate = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    set({
      visible: false,
      content: '',
      id: ''
    });
  };

  const isVisible = (id: string) => {
    let currentState: TooltipState;
    const unsubscribe = subscribe(state => {
      currentState = state;
    });
    unsubscribe();
    return currentState!.visible && currentState!.id === id;
  };

  return {
    subscribe,
    show,
    hide,
    hideImmediate,
    isVisible
  };
}