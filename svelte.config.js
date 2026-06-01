import adapter from 'svelte-adapter-bun';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { markdoc } from 'svelte-markdoc-preprocess';

// Generic build-time token replacer. Authors can write `{{MY_TOKEN}}`
// in their markdown and we'll substitute it at build time with the
// value of `process.env.PUBLIC_TOKEN_MY_TOKEN` (PUBLIC_TOKEN_ prefix
// so it doesn't clash with other env vars and stays Vite-compatible).
//
// Pure string replace; no AST work, so it can't break Markdoc syntax
// downstream as long as the value injected doesn't contain Markdoc-
// significant characters (URLs and most config strings don't).
const tokens = Object.fromEntries(
	Object.entries(process.env)
		.filter(([k]) => k.startsWith('PUBLIC_TOKEN_'))
		.map(([k, v]) => [`{{${k.slice('PUBLIC_TOKEN_'.length)}}}`, v ?? ''])
);

const tokenReplacer = {
	name: 'open-docs-token-replacer',
	markup({ content, filename }) {
		if (!filename || !/\.(md|markdoc)$/.test(filename)) return;
		if (Object.keys(tokens).length === 0) return;
		let out = content;
		for (const [token, value] of Object.entries(tokens)) {
			if (out.includes(token)) {
				out = out.split(token).join(value);
			}
		}
		return out === content ? undefined : { code: out };
	}
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Three preprocessors, in order: token replacer rewrites
	// `{{TOKEN}}` in .md/.markdoc sources from PUBLIC_TOKEN_* env vars;
	// vitePreprocess handles <style lang="postcss"> etc. in .svelte
	// files; markdoc turns the (now-substituted) .md/.markdoc content
	// into a Svelte component.
	//
	// `tags` and `nodes` for markdoc are paths to .svelte files that
	// re-export the components by name; svelte-markdoc-preprocess
	// parses the Svelte AST to find `export { default as Foo } from
	// '...'` declarations and auto-generates the Markdoc schema from
	// those. See src/lib/markdoc/tags.svelte + nodes.svelte.
	preprocess: [
		tokenReplacer,
		vitePreprocess(),
		markdoc({
			tags: './src/lib/markdoc/tags.svelte',
			nodes: './src/lib/markdoc/nodes.svelte',
			extensions: ['.md', '.markdoc']
		})
	],

	// Tell SvelteKit that .md and .markdoc files ARE Svelte
	// components (after the markdoc preprocessor runs over them).
	// This lets `import.meta.glob('/src/content/**/*.md')` resolve as
	// if each file were a `.svelte` source.
	extensions: ['.svelte', '.markdoc', '.md'],

	kit: {
		adapter: adapter(),
		prerender: {
			// app.html references favicon PNG fallbacks, apple-touch-icon,
			// and og.png. Most docsets won't ship every size — treat 404s
			// on those optional assets as warnings, not build failures.
			// SVG favicon is still required.
			handleHttpError: ({ path, status }) => {
				if (status !== 404) throw new Error(`${status} ${path}`);
				const optional = [
					'/favicon-16.png',
					'/favicon-32.png',
					'/apple-touch-icon.png',
					'/og.png'
				];
				if (optional.includes(path)) {
					console.warn(`[open-docs] optional asset missing: ${path}`);
					return;
				}
				throw new Error(`404 ${path}`);
			}
		},
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
				'frame-ancestors': ['none']
			}
		},
		paths: {
			base: process.env.BASE_PATH || ''
		}
	}
};

export default config;
