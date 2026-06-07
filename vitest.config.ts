import { defineConfig } from 'vitest/config';

// Minimal Vitest setup for unit tests of pure logic (e.g. the i18n
// cores in src/lib/i18n.ts). Uses Vite under the hood, so import.meta.glob
// and import.meta.env resolve the same way they do in the app build.
export default defineConfig({
	test: {
		include: ['src/**/*.test.ts'],
		environment: 'node'
	}
});
