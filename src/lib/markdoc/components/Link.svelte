<script lang="ts">
	import { base } from '$app/paths';
	import { safeHref } from '$lib/safe-url';

	// Renders markdown links. External links (anything not starting
	// with /, #, or `mailto:`) get target="_blank" + rel attributes
	// so accidental cross-origin links can't reach back to opener.
	// Internal links stay as plain <a> so SvelteKit's preload-on-hover
	// keeps working.
	//
	// Internal site-absolute hrefs get the base prefix, like every chrome
	// link does — authors write `/guides/x` and BASE_PATH deploys resolve
	// it under the sub-path. (This was missing for content links before
	// 0.4.0, which broke every internal link — and the old prerender —
	// under BASE_PATH.)

	type Props = {
		href: string;
		title?: string;
		children?: import('svelte').Snippet;
	};

	const { href: rawHref, title, children }: Props = $props();

	const isExternal = $derived(
		!(
			rawHref.startsWith('/') ||
			rawHref.startsWith('#') ||
			rawHref.startsWith('mailto:') ||
			rawHref.startsWith('tel:')
		)
	);

	// Gate the final href: a `javascript:`/`data:` link from author markdown
	// is click-to-XSS. undefined → an inert <a> (no href), never a live link.
	const href = $derived(safeHref(rawHref.startsWith('/') ? base + rawHref : rawHref));

	// Self-contained link styling so a link reads as a link in ANY
	// container — including inside a `not-prose` block (callout, step,
	// accordion), where the `.prose a` rule that normally colours links is
	// suppressed. Matches the prose link look, and out-specifies the
	// plugin's zero-specificity rule, so links in flowing prose look the
	// same as before.
	const linkClass =
		'font-medium text-primary underline underline-offset-4 hover:text-primary/80';
</script>

{#if isExternal}
	<a {href} {title} class={linkClass} target="_blank" rel="noopener noreferrer"
		>{@render children?.()}</a
	>
{:else}
	<a {href} {title} class={linkClass}>{@render children?.()}</a>
{/if}
