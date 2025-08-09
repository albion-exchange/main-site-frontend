import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}", "tests/**/*.{test,spec}.{js,ts,jsx,tsx}"],
    exclude: ["tests/e2e/**/*"],
    globals: true,
    environment: "jsdom",
    setupFiles: ["src/lib/test/setup.ts"],
    testTimeout: 30000, // 30 seconds for integration tests
  },
  // E2E tests configuration
  define: {
    "import.meta.vitest": undefined,
  },
});