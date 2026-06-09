import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// Vitest setup. Pure logic tests (i18n, markdown pipeline, content store)
// run plain; the Svelte plugin + $app stubs let component tests render
// real components through svelte/server (SSR parity smoke tests for the
// MarkdocTree renderer).
export default defineConfig({
	plugins: [svelte()],
	resolve: {
		alias: {
			$lib: r('./src/lib'),
			'$app/paths': r('./src/lib/server/__fixtures__/stubs/app-paths.ts'),
			'$app/state': r('./src/lib/server/__fixtures__/stubs/app-state.ts'),
			'$app/navigation': r('./src/lib/server/__fixtures__/stubs/app-navigation.ts'),
			'$app/environment': r('./src/lib/server/__fixtures__/stubs/app-environment.ts')
		}
	},
	test: {
		include: ['src/**/*.test.ts'],
		environment: 'node'
	}
});
