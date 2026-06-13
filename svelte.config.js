import adapter from 'svelte-adapter-bun';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// 0.4.0: content is no longer compiled through Vite. Markdown is parsed,
// validated, and rendered at runtime by the server content store
// (src/lib/server/content-store.ts); the token and heading-anchor passes
// that used to be preprocessors here live in src/lib/server/markdown.ts;
// the Markdoc schema is generated from the component registries by
// scripts/generate-markdoc-schema.ts before dev/build. This config builds
// only the app shell — it is content-independent.

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess()],

	kit: {
		adapter: adapter(),
		csp: {
			directives: {
				'default-src': ['self'],
				// 'unsafe-inline' is a CSP Level 1 fallback: when SvelteKit
				// emits a nonce (prod, CSP Level 2+ browsers) the browser
				// ignores 'unsafe-inline' automatically and only trusts
				// nonced scripts.
				//
				// 'wasm-unsafe-eval' lets Shiki instantiate its Oniguruma
				// regex engine (shipped as onig.wasm). Without it the
				// dynamic import of shiki throws on WASM compile and
				// code blocks render without syntax highlighting.
				'script-src': ['self', 'unsafe-inline', 'wasm-unsafe-eval'],
				'style-src': ['self', 'unsafe-inline'],
				'connect-src': ['self'],
				'img-src': ['self', 'data:'],
				'font-src': ['self'],
				// frame-src for {% embed %} hosts is derived from the *runtime*
				// content and appended to the CSP header in hooks.server.ts —
				// the mounted content isn't known at build time.
				'frame-ancestors': ['none']
			}
		},
		paths: {
			// docref: begin base-path
			base: process.env.BASE_PATH || ''
			// docref: end base-path
		}
	}
};

export default config;
