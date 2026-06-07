import adapter from 'svelte-adapter-bun';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { markdoc } from 'svelte-markdoc-preprocess';
import GithubSlugger from 'github-slugger';
import { deriveFrameSrc } from './scripts/derive-frame-src.js';
import { buildTokenMap, applyTokens } from './scripts/tokens.js';

// Generic build-time token replacer. Authors can write `{{MY_TOKEN}}`
// in their markdown and we'll substitute it at build time with the
// value of `process.env.PUBLIC_TOKEN_MY_TOKEN` (PUBLIC_TOKEN_ prefix
// so it doesn't clash with other env vars and stays Vite-compatible).
// The substitution lives in scripts/tokens.js so the CSP frame-src
// derivation can resolve {{TOKEN}} embed URLs identically.
const tokens = buildTokenMap();

const tokenReplacer = {
	name: 'open-docs-token-replacer',
	markup({ content, filename }) {
		if (!filename || !/\.(md|markdoc)$/.test(filename)) return;
		if (Object.keys(tokens).length === 0) return;
		const out = applyTokens(content, tokens);
		return out === content ? undefined : { code: out };
	}
};

// Heading anchors. Markdoc's default heading node carries only the
// level, so without help every <h2>/<h3> renders id-less and the
// on-page TOC (which queries `h2[id]`) stays empty. We inject a Markdoc
// id annotation (`{% #slug %}`) onto each heading at build time,
// slugging the text with github-slugger (GitHub-compatible, deduped per
// file). The id lands in the prerendered HTML, so anchor links and the
// TOC work without any client JS.
//
// Runs before the markdoc preprocessor (which consumes the annotation)
// and skips anything inside fenced code blocks, so `# comment` lines in
// examples are left alone. An author can still pin a custom id by
// writing their own `{% #my-id %}` — we never overwrite one.
const headingAnchors = {
	name: 'open-docs-heading-anchors',
	markup({ content, filename }) {
		if (!filename || !/\.(md|markdoc)$/.test(filename)) return;

		const slugger = new GithubSlugger();
		const lines = content.split('\n');
		let fenceChar = ''; // '`' or '~' of the open fence; '' when outside
		let fenceLen = 0; // open-fence length, so nested fences don't mis-close
		let changed = false;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];

			// Track fenced code. A fence closes only on the same character
			// and an equal-or-longer run, which keeps a 3-backtick block
			// nested inside a 4-backtick block from closing it early.
			const fence = /^\s*(`{3,}|~{3,})/.exec(line);
			if (fence) {
				const char = fence[1][0];
				const len = fence[1].length;
				if (!fenceChar) {
					fenceChar = char;
					fenceLen = len;
				} else if (char === fenceChar && len >= fenceLen) {
					fenceChar = '';
					fenceLen = 0;
				}
				continue;
			}
			if (fenceChar) continue;

			const heading = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
			if (!heading) continue;

			const [, hashes, rawText] = heading;
			// Leave author-pinned ids (or any existing annotation) alone.
			if (rawText.includes('{%')) continue;

			// Drop ATX closing hashes, then strip inline markdown so the
			// slug reads from the visible words (`code`, **bold**, [links]).
			const text = rawText.replace(/\s+#+\s*$/, '');
			const plain = text
				.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
				.replace(/[`*_~]/g, '')
				.trim();

			// ASCII-fold before slugging. A Markdoc `{% #id %}` annotation only
			// accepts an ASCII identifier, so an accented heading (e.g. German
			// "Nächste Schritte" or French "Référence") would otherwise inject a
			// non-ASCII id and fail the build. Decompose + strip diacritics
			// (ä→a, é→e, ñ→n), expand ß→ss, then drop anything still non-ASCII.
			const ascii =
				plain
					.normalize('NFKD')
					.replace(/[̀-ͯ]/g, '')
					.replace(/ß/g, 'ss')
					.replace(/[^\x00-\x7F]/g, '') || 'section';

			lines[i] = `${hashes} ${text} {% #${slugger.slug(ascii)} %}`;
			changed = true;
		}

		return changed ? { code: lines.join('\n') } : undefined;
	}
};

// CSP frame-src is derived from the {% embed %} blocks in the content
// (see scripts/derive-frame-src.js). It has to be computed here, at
// config-load time, because SvelteKit stamps the CSP into the prerendered
// HTML during the build — the pipeline can't edit it afterwards.
const frameSrc = deriveFrameSrc();

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Four preprocessors, in order: token replacer rewrites
	// `{{TOKEN}}` in .md/.markdoc sources from PUBLIC_TOKEN_* env vars;
	// headingAnchors injects `{% #slug %}` id annotations onto headings;
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
		headingAnchors,
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
			},
			// Cross-language anchor links. A translated page can keep an anchor
			// that targets the original heading slug, but translated headings
			// get translated ids — so `/de/x#english-anchor` may not exist. The
			// link still lands on the right page (just not the exact section),
			// so tolerate it on `/<lang>/` paths (a 2-letter first segment) and
			// stay strict for the default language, where a missing id is a
			// genuine broken link.
			handleMissingId: ({ path, id, referrers }) => {
				const seg = path.split('/')[1];
				if (seg && seg.length === 2) {
					console.warn(
						`[open-docs] cross-language anchor #${id} not found on ${path}` +
							(referrers?.length ? ` (from ${referrers[0]})` : '')
					);
					return;
				}
				throw new Error(`Missing id "#${id}" on ${path}`);
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
				// frame-src is derived from the {% embed %} blocks in your
				// content (see frameSrc above); omitted entirely when there
				// are no embeds, so default-src 'self' governs frames.
				...(frameSrc.length > 0 ? { 'frame-src': frameSrc } : {}),
				'frame-ancestors': ['none']
			}
		},
		paths: {
			base: process.env.BASE_PATH || ''
		}
	}
};

export default config;
