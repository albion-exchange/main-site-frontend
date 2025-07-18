import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		setupFiles: ['./src/test-setup.ts'],
		globals: true,
		coverage: {
			reporter: ['text', 'json', 'html'],
			include: ['src/lib/**/*.{js,ts,svelte}'],
			exclude: [
				'src/lib/**/*.test.{js,ts}',
				'src/lib/**/*.spec.{js,ts}',
				'src/lib/types/**',
				'src/lib/data/**'
			],
			thresholds: {
				global: {
					branches: 80,
					functions: 80,
					lines: 80,
					statements: 80
				}
			}
		}
	}
});