<script lang="ts">
	import { onMount } from 'svelte';
	import { mode } from 'mode-watcher';
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
	import Copy from '@lucide/svelte/icons/copy';
	import Check from '@lucide/svelte/icons/check';
	import { cn } from '$lib/utils';
	import { t } from '$lib/ui-strings';
	import { defaultLang } from '$lib/i18n';

	const lang = $derived((page.data.lang as string | undefined) ?? defaultLang);

	// Fenced code block. Two branches:
	//
	//   - language === 'mermaid' renders as a diagram via mermaid.js.
	//     Dynamic-imported on mount so the ~500KB bundle never ships
	//     on pages without diagrams. Re-renders when the colour mode
	//     flips so light/dark stays correct. Theme variables resolve
	//     from the shadcn CSS tokens at render time, so the diagram
	//     picks up whatever palette the rest of the docs is using.
	//
	//   - everything else gets Shiki-highlighted on mount. Dynamic
	//     import: zero added weight on initial paint, brief flash of
	//     unhighlighted code on first render (acceptable for docs).

	type Props = {
		content: string;
		language?: string;
	};

	const { content, language = 'text' }: Props = $props();

	const isMermaid = $derived(language === 'mermaid');

	let highlighted = $state<string | null>(null);
	let highlightError = $state<string | null>(null);
	let mermaidSvg = $state<string | null>(null);
	let mermaidError = $state<string | null>(null);
	let copied = $state(false);

	// Stable id per mounted component so mermaid.render's internal
	// xlink:href targets don't collide when a page has more than one
	// diagram. crypto.randomUUID isn't available SSR-side, so keep
	// this client-only by deriving inside an effect.
	let diagramId = $state('mermaid-pending');

	onMount(() => {
		if (isMermaid) {
			diagramId = `mermaid-${Math.random().toString(36).slice(2, 10)}`;
			return; // handled by the theme-reactive effect below
		}
		void (async () => {
			try {
				// Shiki is pre-bundled into static/vendor by esbuild (see
				// scripts/vendor-client-deps.ts) and loaded from there at
				// runtime, so the heavy grammar set never enters Vite's build
				// graph — that keeps the site build's memory down. @vite-ignore
				// stops Vite from trying to resolve/bundle the URL; the type
				// casts keep TS checking without re-importing the module graph.
				const { codeToHtml } = (await import(
					/* @vite-ignore */ `${base}/vendor/shiki.mjs`
				)) as typeof import('shiki');
				// Notation transformers read comments *inside* the code
				// (`// [!code highlight]`, `// [!code ++]` / `--`) and tag
				// the affected lines with `.highlighted` / `.diff.add` /
				// `.diff.remove`, stripping the marker comment. This is how
				// line-highlight and diff work without fence meta (which
				// Markdoc discards). Styled by the rules below.
				const { transformerNotationHighlight, transformerNotationDiff } = (await import(
					/* @vite-ignore */ `${base}/vendor/shiki-transformers.mjs`
				)) as typeof import('@shikijs/transformers');
				// Dual-theme per the official Shiki guide:
				// https://shiki.style/guide/dual-themes
				// Light theme renders as direct inline `color:` and
				// `background-color:` on each span/pre (default
				// behaviour). Dark theme values are emitted as
				// `--shiki-dark` CSS variables on the same elements.
				// The CSS rule below swaps them in only when html.dark
				// is present, with !important to beat the typography
				// plugin's .prose pre color/background.
				highlighted = await codeToHtml(content.trimEnd(), {
					lang: language,
					themes: { light: 'github-light', dark: 'github-dark' },
					transformers: [transformerNotationHighlight(), transformerNotationDiff()]
				});
			} catch (err) {
				// Surface the failure to the rendered DOM so silent
				// regressions (CSP changes, missing language grammar,
				// Shiki WASM init issues) don't pass as "unstyled code
				// block, must be loading still."
				highlightError = err instanceof Error ? err.message : String(err);
				console.error('[CodeBlock] highlight failed', { language, err });
			}
		})();
	});

	// oklch() → sRGB conversion. Per CSS Color 4, modern browsers
	// preserve wide-gamut colours through both canvas2d.fillStyle
	// and CSSOM.color to avoid lossy down-conversion — which means
	// neither of the obvious round-trip tricks actually flattens
	// oklch into rgb. So we do the math directly:
	//   OKLch → OKLab → LMS → linear sRGB → gamma-corrected sRGB.
	// Refs: https://bottosson.github.io/posts/oklab/ +
	// the CSS Color 4 spec matrices.
	function oklchToRgb(value: string): string {
		const m = value.match(
			/oklch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)/i
		);
		if (!m) return value;
		const pct = (s: string, scale = 1) =>
			s.endsWith('%') ? parseFloat(s) / 100 : parseFloat(s) * scale;
		const L = pct(m[1]);
		const C = pct(m[2], m[2].endsWith('%') ? 0.4 : 1); // 100% chroma = 0.4 per spec
		const H = (parseFloat(m[3]) * Math.PI) / 180;
		const A = m[4] ? pct(m[4]) : 1;

		const a = C * Math.cos(H);
		const b = C * Math.sin(H);

		const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
		const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
		const s_ = L - 0.0894841775 * a - 1.291485548 * b;

		const lc = l_ * l_ * l_;
		const mc = m_ * m_ * m_;
		const sc = s_ * s_ * s_;

		const r = 4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc;
		const g = -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc;
		const bl = -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc;

		const toSrgb = (v: number) => {
			const c = Math.max(0, Math.min(1, v));
			return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
		};

		const R = Math.round(toSrgb(r) * 255);
		const G = Math.round(toSrgb(g) * 255);
		const B = Math.round(toSrgb(bl) * 255);
		return A === 1 ? `rgb(${R}, ${G}, ${B})` : `rgba(${R}, ${G}, ${B}, ${A})`;
	}

	// Resolves a shadcn `--token` to a colour mermaid can parse.
	// The tokens in this project are oklch() values; mermaid's
	// colour parser only handles rgb/hex/hsl, so we convert in JS.
	function token(name: string): string {
		const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
		if (!raw) return '';
		if (raw.startsWith('oklch')) return oklchToRgb(raw);
		return raw;
	}

	$effect(() => {
		if (!isMermaid || diagramId === 'mermaid-pending') return;
		// Subscribe to the colour mode so a theme flip re-renders.
		const isDark = mode.current === 'dark';
		void (async () => {
			try {
				// Pre-bundled like Shiki above — Mermaid (+d3) alone costs the
				// Vite build ~450 MB of peak memory if bundled there.
				const mermaid = (
					(await import(/* @vite-ignore */ `${base}/vendor/mermaid.mjs`)) as typeof import('mermaid')
				).default;
				mermaid.initialize({
					startOnLoad: false,
					theme: 'base',
					securityLevel: 'strict',
					fontFamily:
						'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
					themeVariables: {
						background: 'transparent',
						// Nodes use a neutral, subtle fill paired with a
						// guaranteed-contrast text colour (the secondary pair), and
						// take --primary only as a *border* accent. Filling nodes
						// with --primary itself washed labels out on saturated brand
						// colours; this keeps every label legible whatever palette
						// the operator's theme.css sets, while the brand still reads
						// through on the node outlines and is the diagram's accent.
						primaryColor: token('--secondary'),
						primaryTextColor: token('--secondary-foreground'),
						primaryBorderColor: token('--primary'),
						mainBkg: token('--secondary'),
						nodeBorder: token('--primary'),
						secondaryColor: token('--muted'),
						secondaryTextColor: token('--foreground'),
						secondaryBorderColor: token('--border'),
						tertiaryColor: token('--accent'),
						tertiaryTextColor: token('--accent-foreground'),
						tertiaryBorderColor: token('--border'),
						lineColor: token('--foreground'),
						textColor: token('--foreground'),
						clusterBkg: token('--muted'),
						clusterBorder: token('--border'),
						edgeLabelBackground: token('--background'),
						fontSize: '14px'
					},
					flowchart: {
						curve: 'basis',
						htmlLabels: true,
						padding: 16,
						nodeSpacing: 50,
						rankSpacing: 60,
						useMaxWidth: true
					}
				});
				const { svg } = await mermaid.render(diagramId, content.trim());
				mermaidSvg = svg;
				mermaidError = null;
				// Mark the effect dependency so reactivity picks up the
				// theme change (mode.current was already read above).
				void isDark;
			} catch (err) {
				const msg = err instanceof Error ? err.message : String(err);
				mermaidError = msg;
				console.warn('[CodeBlock] mermaid render failed', { err });
			}
		})();
	});

	async function copy() {
		try {
			await navigator.clipboard.writeText(content);
			copied = true;
			setTimeout(() => (copied = false), 1500);
		} catch {
			// Clipboard API can fail in cross-origin iframes or under
			// strict CSP. No-op rather than crash; readers can still
			// select and copy by hand.
		}
	}
</script>

{#if isMermaid}
	<!-- data-pagefind-ignore: the diagram renders client-side; the static
	     HTML only holds the "Rendering diagram…" placeholder, which is index
	     noise. -->
	<figure data-pagefind-ignore class="not-prose my-8">
		{#if mermaidError}
			<div
				class="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive"
			>
				<p class="font-medium">Mermaid render failed</p>
				<p class="mt-1 font-mono text-xs">{mermaidError}</p>
				<pre class="mt-2 overflow-x-auto text-xs text-muted-foreground"><code
						>{content}</code
					></pre>
			</div>
		{:else if mermaidSvg}
			<div class="mermaid-figure flex justify-center">
				{@html mermaidSvg}
			</div>
		{:else}
			<div class="flex h-32 items-center justify-center text-sm text-muted-foreground">
				{t(lang, 'renderingDiagram')}
			</div>
		{/if}
	</figure>
{:else}
	<!-- `code-block` carries self-contained padding/radius (see <style>)
	     so the block looks right in ANY container — including inside a
	     `not-prose` block like a step or callout, where the typography
	     plugin's `.prose pre` rule (which we used to lean on) is
	     suppressed. The wrapper also positions the absolute copy button. -->
	<div class="code-block group relative">
		<Button
			variant="ghost"
			size="icon-sm"
			onclick={copy}
			aria-label={t(lang, copied ? 'copied' : 'copyCode')}
			class={cn(
				'absolute right-2 top-2 z-10 bg-muted/80 backdrop-blur',
				'opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100'
			)}
		>
			{#if copied}
				<Check class="size-4" />
			{:else}
				<Copy class="size-4" />
			{/if}
		</Button>

		{#if highlighted}
			<!-- Shiki returns its own <pre>; the typography plugin's
			     .prose pre rule styles the outer chrome and the .shiki
			     span colours below handle dual-theme token colours. -->
			{@html highlighted}
		{:else}
			<pre><code class="language-{language}">{content}</code></pre>
		{/if}
	</div>
{/if}

<style>
	/* Mermaid output polish. The library inlines most styling onto
	   SVG elements via themeVariables, but a few global tweaks help
	   it sit cleanly in prose. */
	:global(.mermaid-figure svg) {
		max-width: 100%;
		height: auto;
	}
	:global(.mermaid-figure .nodeLabel),
	:global(.mermaid-figure .edgeLabel) {
		font-weight: 500;
	}
	/* Edge labels: mermaid bakes textColor + edgeLabelBackground in
	   at render time. Re-rendering on mode flip races with the new
	   tokens (and mermaid sometimes carries the old fill into the
	   <rect> behind the foreignObject). Pin them to live CSS
	   variables so the .dark class flip handles theming without any
	   mermaid re-render at all. */
	:global(.mermaid-figure .edgeLabel),
	:global(.mermaid-figure .edgeLabel p),
	:global(.mermaid-figure .edgeLabel span) {
		color: var(--foreground) !important;
		background-color: var(--background) !important;
		font-size: 12px;
	}
	:global(.mermaid-figure .edgeLabel rect),
	:global(.mermaid-figure rect.label-background),
	:global(.mermaid-figure .edge-label-background) {
		fill: var(--background) !important;
	}

	/* Shiki dual-theme: light colours arrive inline on each span as
	   `color:` / `background-color:` (default defaultColor behaviour).
	   Dark colours arrive on the same spans as `--shiki-dark` /
	   `--shiki-dark-bg` CSS variables. When html.dark is present we
	   swap the variables in. !important is required to beat the
	   typography plugin's `.prose pre { color, background-color }`.
	   This is straight from the official Shiki guide:
	   https://shiki.style/guide/dual-themes */

	/* Tint the pre background with var(--muted) in BOTH modes so it
	   matches the inline <code> chip in both light and dark. Without
	   this, dark mode would fall back to Shiki's github-dark bg
	   (#24292e) which is a different shade than --muted's dark value.
	   !important beats Shiki's inline style="background-color:..."
	   on the pre. */
	:global(.shiki) {
		background-color: var(--muted) !important;
	}
	/* Swap to the dark theme's token colours when html.dark is on.
	   Background is intentionally NOT set here — the rule above
	   covers both modes for the pre. */
	:global(html.dark .shiki),
	:global(html.dark .shiki span) {
		color: var(--shiki-dark) !important;
	}

	/* Self-contained code-block chrome. Code blocks used to get their
	   padding/radius/font-size from the typography plugin's `.prose pre`
	   rule, which a `not-prose` ancestor (a step, callout, card, the
	   {% code %} wrapper, …) suppresses — leaving the code flush and
	   unpadded. We set those here instead, so a block renders identically
	   in any container. Values mirror the prose defaults, and these
	   selectors out-specify `.prose :where(pre)` (zero specificity), so
	   blocks already in flowing prose are unchanged. Vertical margin is
	   deliberately left to the context. */
	:global(.code-block pre) {
		padding: 0.857em 1.143em;
		border-radius: 0.375rem;
		overflow-x: auto;
		font-size: 0.875em;
		line-height: 1.7;
		background-color: var(--muted);
	}

	/* Line highlighting + diff, applied by the Shiki notation transformers.
	   Affected lines stretch to the full code width so the tint reads as a
	   band; diff add/remove are green/red, highlight uses the brand tint. */
	:global(.shiki .line.highlighted),
	:global(.shiki .line.diff) {
		display: inline-block;
		width: 100%;
	}
	:global(.shiki .line.highlighted) {
		background-color: color-mix(in oklab, var(--primary) 14%, transparent);
	}
	:global(.shiki .line.diff.add) {
		background-color: color-mix(in oklab, #22c55e 18%, transparent);
	}
	:global(.shiki .line.diff.remove) {
		background-color: color-mix(in oklab, #ef4444 18%, transparent);
		opacity: 0.75;
	}

	/* GitHub-style +/- gutter. When a block contains any diff line, reserve a
	   left gutter on every line (so the code stays aligned) and render a + or
	   - sign in it for added/removed lines, so the change reads even without
	   colour. The marker is a CSS ::before, so it isn't part of the copied
	   text (copy uses the raw source, not the DOM). */
	:global(.shiki:has(.line.diff) .line) {
		display: inline-block;
		width: 100%;
		box-sizing: border-box;
		padding-left: 1.6em;
		position: relative;
	}
	:global(.shiki .line.diff::before) {
		position: absolute;
		left: 0.5em;
		font-weight: 600;
	}
	:global(.shiki .line.diff.add::before) {
		content: '+';
		color: #16a34a;
	}
	:global(.shiki .line.diff.remove::before) {
		content: '-';
		color: #dc2626;
	}
</style>
