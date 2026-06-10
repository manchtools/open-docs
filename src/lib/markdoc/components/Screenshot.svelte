<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { viewerOS, detectViewerOS } from '$lib/viewer-os.svelte';

	// The faux-browser chrome mirrors the reader's own OS (detected on
	// mount; macOS until then). See $lib/viewer-os.
	onMount(detectViewerOS);
	const os = $derived(viewerOS.os);

	// {% screenshot src="dashboard.png" alt="..." caption="..." dark="dashboard-dark.png" /%}
	//
	// Renders an image from /static/screenshots/ with optional
	// browser-frame chrome, a caption, and a separate dark-mode
	// variant. The <picture> + prefers-color-scheme split is a CSS
	// fallback for visitors who haven't toggled the in-app theme; the
	// in-app .dark class wins via the second source.
	//
	// Image paths are resolved against BASE_PATH so the docs work
	// when hosted under a subpath.

	type Props = {
		src: string;
		alt: string;
		dark?: string;
		caption?: string;
		// 'frame' wraps the image in a faux-browser chrome; 'flat'
		// renders just the image with a subtle border. Default is
		// 'frame' because most UI screenshots benefit from context.
		variant?: 'frame' | 'flat';
		// Optional max width override (e.g. '720px'). Default is the
		// prose column width.
		width?: string;
	};

	const {
		src,
		alt,
		dark = undefined,
		caption = undefined,
		variant = 'frame',
		width = undefined
	}: Props = $props();

	// Block-style srcs are bare names under static/screenshots/ (the
	// documented contract). Implicit markdown images arrive with full
	// paths (static or content-relative, pre-resolved) or web URLs and
	// pass through untouched apart from BASE_PATH.
	const resolve = (path: string) =>
		/^[a-z]+:/i.test(path)
			? path
			: path.startsWith('/')
				? `${base}${path}`
				: `${base}/screenshots/${path}`;
</script>

<figure class="not-prose my-8" style={width ? `max-width: ${width}; margin-inline: auto;` : ''}>
	{#if variant === 'frame'}
		<div class="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
			<!-- Faux-browser title bar with OS-accurate window controls (no
			     fake URL bar — those age badly). -->
			<div
				class="flex items-center border-b border-border bg-muted/40 px-3 py-2"
				class:justify-end={os !== 'mac'}
			>
				{#if os === 'mac'}
					<!-- macOS: traffic lights on the left. -->
					<div class="flex items-center gap-2">
						<span class="size-3 rounded-full bg-[#ff5f57]"></span>
						<span class="size-3 rounded-full bg-[#febc2e]"></span>
						<span class="size-3 rounded-full bg-[#28c840]"></span>
					</div>
				{:else if os === 'windows'}
					<!-- Windows: flat minimize / maximize / close on the right. -->
					<div class="flex items-center gap-4 text-muted-foreground/70">
						<span class="block h-px w-3 bg-current"></span>
						<span class="block size-2.5 rounded-[1px] border border-current"></span>
						<svg viewBox="0 0 10 10" class="size-2.5" aria-hidden="true">
							<path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" stroke-width="1.2" fill="none" />
						</svg>
					</div>
				{:else}
					<!-- Linux (GNOME-ish): circular buttons on the right. -->
					<div class="flex items-center gap-2 text-muted-foreground/80">
						<span class="flex size-3.5 items-center justify-center rounded-full bg-muted-foreground/15">
							<span class="block h-px w-1.5 bg-current"></span>
						</span>
						<span class="flex size-3.5 items-center justify-center rounded-full bg-muted-foreground/15">
							<span class="block size-1.5 rounded-[1px] border border-current"></span>
						</span>
						<span class="flex size-3.5 items-center justify-center rounded-full bg-muted-foreground/15">
							<svg viewBox="0 0 10 10" class="size-2" aria-hidden="true">
								<path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" stroke-width="1.4" fill="none" />
							</svg>
						</span>
					</div>
				{/if}
			</div>
			<picture>
				{#if dark}
					<source srcset={resolve(dark)} media="(prefers-color-scheme: dark)" />
					<!-- The in-app .dark class flips this via CSS below -->
					<source srcset={resolve(dark)} class="dark-source" />
				{/if}
				<img {alt} src={resolve(src)} loading="lazy" class="block w-full h-auto" />
			</picture>
		</div>
	{:else}
		<div class="overflow-hidden rounded-lg border border-border">
			<picture>
				{#if dark}
					<source srcset={resolve(dark)} media="(prefers-color-scheme: dark)" />
					<source srcset={resolve(dark)} class="dark-source" />
				{/if}
				<img {alt} src={resolve(src)} loading="lazy" class="block w-full h-auto" />
			</picture>
		</div>
	{/if}
	{#if caption}
		<figcaption class="mt-3 text-center text-sm text-muted-foreground">{caption}</figcaption>
	{/if}
</figure>

<style>
	/* When the .dark class is on the document, swap to the dark
	   variant by activating its <source>. The CSS-only approach
	   keeps the SSR HTML correct for visitors without JS. */
	:global(html.dark) figure picture source.dark-source {
		display: block;
	}
</style>
