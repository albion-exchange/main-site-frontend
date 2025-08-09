import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ["tests/e2e/**/*.{test,spec}.{js,ts}"],
    globals: true,
    environment: "node",
    setupFiles: ["tests/e2e/setup.ts"],
    testTimeout: 60000, // 60 seconds for E2E tests
    hookTimeout: 30000,
    teardownTimeout: 30000,
  },
});