<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';
	import { cn } from '$lib/utils';

	// Right-side "On this page" TOC. Auto-built from the rendered DOM
	// rather than from frontmatter — that means the TOC always matches
	// what's actually on the page even if the author forgets to update a
	// separate index. Re-built on every navigation.
	//
	// Active-heading detection is scroll-based: the active heading is the
	// last one whose top has scrolled above a threshold line just below
	// the sticky nav. Crucially, when the scroll container is at the
	// bottom the *last* heading wins — a short final section can never
	// scroll its heading up to the threshold, which is why an
	// intersection-band approach left the last few entries un-highlighted.

	type Heading = { id: string; text: string; level: number };

	let headings = $state<Heading[]>([]);
	let activeId = $state<string | null>(null);
	let scrollEl: HTMLElement | null = null;
	let ticking = false;

	// px below the viewport top where a heading counts as "current" — a
	// little under the sticky top nav so the switch feels right.
	const THRESHOLD = 100;

	function computeActive() {
		ticking = false;
		const els = headings
			.map((h) => document.getElementById(h.id))
			.filter((el): el is HTMLElement => !!el);
		if (!els.length) return;

		// At the bottom of the scroll area the last heading always wins —
		// otherwise a short trailing section never reaches the threshold and
		// the last entries never light up.
		if (scrollEl && scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 2) {
			activeId = els[els.length - 1].id;
			return;
		}

		let current = els[0].id;
		for (const el of els) {
			if (el.getBoundingClientRect().top <= THRESHOLD) current = el.id;
			else break;
		}
		activeId = current;
	}

	function onScroll() {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(computeActive);
	}

	function collect() {
		const els = Array.from(document.querySelectorAll<HTMLElement>('main h2[id], main h3[id]'));
		headings = els.map((el) => ({
			id: el.id,
			text: el.textContent ?? '',
			level: Number(el.tagName.slice(1))
		}));
		computeActive();
	}

	onMount(() => {
		// Content scrolls inside <main>, not the window.
		scrollEl = document.querySelector('main');
		scrollEl?.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll, { passive: true });
		collect();
	});

	// Re-collect headings after every successful navigation. page.url
	// changes synchronously when the new route mounts; we wait a tick
	// for the markdoc-rendered content to be in the DOM.
	$effect(() => {
		void page.url.pathname;
		queueMicrotask(collect);
	});

	onDestroy(() => {
		// onDestroy also fires during SSR teardown, where there's no window.
		scrollEl?.removeEventListener('scroll', onScroll);
		if (typeof window !== 'undefined') window.removeEventListener('resize', onScroll);
	});
</script>

{#if headings.length > 1}
	<aside class="hidden xl:block w-56 shrink-0 py-6">
		<div class="sticky top-6 max-h-[calc(100%-3rem)] overflow-auto pr-2 text-sm">
			<p class="mb-2 font-semibold text-foreground/90">On this page</p>
			<ul class="space-y-1 border-l border-border">
				{#each headings as h (h.id)}
					<li>
						<a
							href={'#' + h.id}
							class={cn(
								'block py-1 pl-3 -ml-px border-l transition-colors',
								h.level > 2 && 'pl-6',
								activeId === h.id
									? 'border-foreground text-foreground font-medium'
									: 'border-transparent text-muted-foreground hover:text-foreground'
							)}
						>
							{h.text}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</aside>
{/if}
