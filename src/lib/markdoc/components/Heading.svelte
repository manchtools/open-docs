<script lang="ts">
	// Renders Markdoc {% heading %} (the override of the markdown heading
	// node). Emits the right h1–h6 element with the id the heading-anchor
	// pass assigned. Every heading gets a copy affordance (faintly visible always, full strength on hover):
	// h2 and deeper copy a deep link to the section; the h1 copies the
	// page's own URL. On a blog index the h1 additionally offers an RSS
	// button that copies the section's Atom feed URL (provided via the
	// 'od:feed' context by the page component).

	import { getContext } from 'svelte';
	import { page } from '$app/state';
	import { t } from '$lib/ui-strings';
	import LinkIcon from '@lucide/svelte/icons/link';
	import Rss from '@lucide/svelte/icons/rss';
	import Check from '@lucide/svelte/icons/check';

	type Props = {
		level: number;
		id?: string;
		children?: import('svelte').Snippet;
	};

	const { level, id, children }: Props = $props();

	const lang = $derived((page.data.lang as string | undefined) ?? 'en');
	const tag = $derived(`h${level}` as `h${1 | 2 | 3 | 4 | 5 | 6}`);
	// h2 and deeper link to their fragment; the h1 is the page itself and
	// copies the page URL (no fragment).
	const anchored = $derived(level === 1 || (!!id && level >= 2));

	// Blog index pages provide their Atom feed URL through context; the h1
	// then renders the RSS copy button alongside the link button.
	const feedOf = getContext<(() => string | null) | undefined>('od:feed');
	const feedHref = $derived(level === 1 ? (feedOf?.() ?? null) : null);

	// Pagefind search weight: body text is weight 1, so lifting headings
	// makes a term in a title/heading outrank the same term buried in prose.
	// h4–h6 stay at the default. Tunable.
	const searchWeight = $derived(level === 1 ? 10 : level === 2 ? 5 : level === 3 ? 3 : undefined);

	let copied = $state<'link' | 'feed' | null>(null);
	let resetTimer: ReturnType<typeof setTimeout> | undefined;

	async function copy(event: MouseEvent, what: 'link' | 'feed') {
		// Don't let the anchor navigate — clicking only copies.
		event.preventDefault();
		const url =
			what === 'feed'
				? `${location.origin}${feedHref}`
				: level === 1
					? `${location.origin}${location.pathname}`
					: `${location.origin}${location.pathname}#${id}`;
		try {
			await navigator.clipboard.writeText(url);
			copied = what;
			clearTimeout(resetTimer);
			resetTimer = setTimeout(() => (copied = null), 1500);
		} catch {
			// Clipboard needs a secure context (https/localhost); if it's
			// unavailable we do nothing rather than jump the page.
		}
	}

	const btnClass =
		'not-prose ml-2 inline-flex size-5 items-center justify-center rounded align-middle text-muted-foreground no-underline opacity-30 transition-opacity hover:bg-muted hover:text-primary hover:opacity-100 focus-visible:opacity-100 group-hover/anchor:opacity-100';
</script>

<svelte:element
	this={tag}
	{id}
	data-pagefind-weight={searchWeight}
	class={anchored ? 'group/anchor' : undefined}
>
	{@render children?.()}{#if anchored}<a
			href={level === 1 ? page.url.pathname : `#${id}`}
			onclick={(e) => copy(e, 'link')}
			aria-label={copied === 'link' ? t(lang, 'copied') : t(lang, 'copyLink')}
			title={t(lang, 'copyLink')}
			class={btnClass}
			>{#if copied === 'link'}<Check class="size-3.5" />{:else}<LinkIcon
					class="size-3.5"
				/>{/if}</a
		>{/if}{#if feedHref}<a
			href={feedHref}
			onclick={(e) => copy(e, 'feed')}
			aria-label={copied === 'feed' ? t(lang, 'copied') : t(lang, 'copyFeed')}
			title={t(lang, 'copyFeed')}
			class={btnClass}
			>{#if copied === 'feed'}<Check class="size-3.5" />{:else}<Rss class="size-3.5" />{/if}</a
		>{/if}
</svelte:element>
