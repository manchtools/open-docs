import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	// Expose PUBLIC_*-prefixed env vars to import.meta.env, which
	// src/lib/config.ts reads for rebranding (PUBLIC_BRAND_NAME,
	// PUBLIC_SITE_TITLE, …). Vite's default envPrefix is VITE_ only, so
	// without this every import.meta.env.PUBLIC_* is undefined at build and
	// the rebrand values silently fall back to the "open-docs" defaults.
	// (Vite's loadEnv merges matching process.env vars, so `docker run -e`
	// values are picked up at the container's build-at-start step.)
	envPrefix: ['VITE_', 'PUBLIC_'],
	define: {
		__APP_VERSION__: JSON.stringify(process.env.APP_VERSION || 'dev'),
		__BASE_PATH__: JSON.stringify(process.env.BASE_PATH || '/')
	},
	plugins: [tailwindcss(), sveltekit()],
	server: {
		// Match web/ — allow *.localhost so the docs preview can
		// share the cookie scope with the main app when an operator
		// is running everything locally.
		allowedHosts: ['.localhost']
	}
});
