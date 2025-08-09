import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock fetch globally for unit tests
global.fetch = vi.fn();

// Mock web3 related globals if needed
Object.defineProperty(window, 'ethereum', {
  writable: true,
  value: {
    request: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  },
});