/**
 * @fileoverview Card flip composable
 * Manages flippable card state
 */

import { writable, derived, type Writable, type Readable } from "svelte/store";

/**
 * Composable for managing flippable card states
 */
export function useCardFlip() {
  // Set of flipped card IDs
  const flippedCards: Writable<Set<string>> = writable(new Set());

  /**
   * Toggle card flip state
   */
  function toggle(cardId: string): void {
    flippedCards.update((cards) => {
      const newCards = new Set(cards);
      if (newCards.has(cardId)) {
        newCards.delete(cardId);
      } else {
        newCards.add(cardId);
      }
      return newCards;
    });
  }

  /**
   * Flip a specific card
   */
  function flip(cardId: string): void {
    flippedCards.update((cards) => {
      const newCards = new Set(cards);
      newCards.add(cardId);
      return newCards;
    });
  }

  /**
   * Unflip a specific card
   */
  function unflip(cardId: string): void {
    flippedCards.update((cards) => {
      const newCards = new Set(cards);
      newCards.delete(cardId);
      return newCards;
    });
  }

  /**
   * Check if a card is flipped
   */
  function isFlipped(cardId: string): boolean {
    let flipped = false;
    const unsubscribe = flippedCards.subscribe((cards) => {
      flipped = cards.has(cardId);
    });
    unsubscribe();
    return flipped;
  }

  /**
   * Create a derived store for a specific card
   */
  function getCardState(cardId: string): Readable<boolean> {
    return derived(flippedCards, ($cards) => $cards.has(cardId));
  }

  /**
   * Flip all cards
   */
  function flipAll(cardIds: string[]): void {
    flippedCards.update((cards) => {
      const newCards = new Set(cards);
      cardIds.forEach((id) => newCards.add(id));
      return newCards;
    });
  }

  /**
   * Unflip all cards
   */
  function unflipAll(): void {
    flippedCards.set(new Set());
  }

  /**
   * Get flip animation styles
   */
  function getFlipStyles(isFlipped: boolean): {
    container: string;
    front: string;
    back: string;
  } {
    return {
      container: `
        perspective: 1000px;
        transition: transform 0.6s;
        transform-style: preserve-3d;
        transform: rotateY(${isFlipped ? 180 : 0}deg);
      `,
      front: `
        backface-visibility: hidden;
        position: absolute;
        width: 100%;
        height: 100%;
      `,
      back: `
        backface-visibility: hidden;
        position: absolute;
        width: 100%;
        height: 100%;
        transform: rotateY(180deg);
      `,
    };
  }

  return {
    flippedCards: { subscribe: flippedCards.subscribe },
    toggle,
    flip,
    unflip,
    isFlipped,
    getCardState,
    flipAll,
    unflipAll,
    getFlipStyles,
  };
}
