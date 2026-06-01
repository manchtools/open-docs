<script lang="ts">
	// Renders markdown links. External links (anything not starting
	// with /, #, or `mailto:`) get target="_blank" + rel attributes
	// so accidental cross-origin links can't reach back to opener.
	// Internal links stay as plain <a> so SvelteKit's preload-on-hover
	// keeps working.

	type Props = {
		href: string;
		title?: string;
		children?: import('svelte').Snippet;
	};

	const { href, title, children }: Props = $props();

	const isExternal = $derived(
		!(
			href.startsWith('/') ||
			href.startsWith('#') ||
			href.startsWith('mailto:') ||
			href.startsWith('tel:')
		)
	);

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
