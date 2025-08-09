import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    conditions: ['browser'],
    alias: {
      ws: '/workspace/src/e2e/shims/ws.ts'
    }
  },
  test: {
    include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}", "src/e2e/**/*.{test,spec}.{js,ts}"],
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/e2e/setup.ts"],
  },
});
