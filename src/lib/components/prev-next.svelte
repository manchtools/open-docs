<script lang="ts">
	import { base } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/state';
	import type { NavItem } from '$lib/nav-core';
	import { t } from '$lib/ui-strings';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	// Previous / next page links at the bottom of each docs page.
	// The nav order in $lib/nav.ts is the source of truth; this
	// component finds the current page by href and surfaces the
	// neighbours.
	//
	// If the current path isn't in the nav list (e.g. a draft page
	// the author hasn't wired up yet), both prev and next are
	// undefined and the component renders nothing rather than
	// showing links to unrelated pages.
	//
	// Rendered as Button variant="outline" rather than raw anchors so
	// hover / focus / disabled states track the rest of the docs
	// chrome. The two-line label (eyebrow + title) lives inside the
	// button via Tailwind utilities.

	type Props = {
		currentHref: string;
	};

	const { currentHref }: Props = $props();

	// Prev/next within the current language's nav order (localized hrefs),
	// delivered by the layout load.
	const lang = $derived((page.data.lang as string) ?? 'en');
	const list = $derived((page.data.flatNav as NavItem[]) ?? []);
	const idx = $derived(list.findIndex((it) => it.href === currentHref));
	const prev = $derived(idx > 0 ? list[idx - 1] : undefined);
	const next = $derived(idx >= 0 && idx < list.length - 1 ? list[idx + 1] : undefined);
</script>

{#if prev || next}
	<!-- data-pagefind-ignore: this is navigational chrome that repeats the
	     neighbouring pages' titles. Without it, searching a page's title
	     also matches its neighbours via their prev/next links. -->
	<nav
		data-pagefind-ignore
		class="not-prose mt-12 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between"
		aria-label="Previous / next page"
	>
		{#if prev}
			<Button
				variant="outline"
				href={base + prev.href}
				class="group h-auto flex-1 justify-start gap-3 px-4 py-3"
			>
				<ChevronLeft
					class="size-5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5"
				/>
				<span class="flex flex-col items-start">
					<span class="text-xs font-normal uppercase tracking-wide text-muted-foreground">
						{t(lang, 'previous')}
					</span>
					<span class="font-medium">{prev.title}</span>
				</span>
			</Button>
		{:else}
			<div class="flex-1"></div>
		{/if}

		{#if next}
			<Button
				variant="outline"
				href={base + next.href}
				class="group h-auto flex-1 justify-end gap-3 px-4 py-3"
			>
				<span class="flex flex-col items-end">
					<span class="text-xs font-normal uppercase tracking-wide text-muted-foreground">
						{t(lang, 'next')}
					</span>
					<span class="font-medium">{next.title}</span>
				</span>
				<ChevronRight
					class="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
				/>
			</Button>
		{:else}
			<div class="flex-1"></div>
		{/if}
	</nav>
{/if}
