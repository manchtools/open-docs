<script lang="ts">
	// Renders Markdoc {% heading %} (the override of the markdown heading
	// node). Emits the right h1–h6 element with the id the headingAnchors
	// preprocessor assigned (see svelte.config.js). For h2 and deeper it
	// also renders a hover-revealed link that copies a deep link to the
	// section to the clipboard — the standard "click the ¶/link to share
	// this heading" affordance.

	import LinkIcon from '@lucide/svelte/icons/link';
	import Check from '@lucide/svelte/icons/check';

	type Props = {
		level: number;
		id?: string;
		children?: import('svelte').Snippet;
	};

	const { level, id, children }: Props = $props();

	const tag = $derived(`h${level}` as `h${1 | 2 | 3 | 4 | 5 | 6}`);
	// The page title (h1) is the page itself; anchoring it to a fragment
	// is noise. Link everything from h2 down that has an id.
	const anchored = $derived(!!id && level >= 2);

	let copied = $state(false);
	let resetTimer: ReturnType<typeof setTimeout> | undefined;

	async function copyLink(event: MouseEvent) {
		// Don't let the anchor navigate to the fragment — that would scroll
		// the page. Clicking should only copy the link, nothing else moves.
		event.preventDefault();
		if (!id) return;
		// Absolute URL of the current page + this section. location already
		// includes any BASE_PATH, so no need to re-derive it.
		const url = `${location.origin}${location.pathname}#${id}`;
		try {
			await navigator.clipboard.writeText(url);
			copied = true;
			clearTimeout(resetTimer);
			resetTimer = setTimeout(() => (copied = false), 1500);
		} catch {
			// Clipboard needs a secure context (https/localhost); if it's
			// unavailable we simply do nothing rather than jump the page.
		}
	}
</script>

<svelte:element this={tag} {id} class={anchored ? 'group/anchor' : undefined}>
	{@render children?.()}{#if anchored}<a
			href={`#${id}`}
			onclick={copyLink}
			aria-label={copied ? 'Link copied' : 'Copy link to this section'}
			class="not-prose ml-2 inline-flex size-5 items-center justify-center rounded align-middle text-muted-foreground no-underline opacity-0 transition-opacity hover:bg-muted hover:text-primary focus-visible:opacity-100 group-hover/anchor:opacity-100"
			>{#if copied}<Check class="size-3.5" />{:else}<LinkIcon class="size-3.5" />{/if}</a
		>{/if}
</svelte:element>
