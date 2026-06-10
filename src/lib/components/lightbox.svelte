<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { t } from '$lib/ui-strings';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	// Click-to-zoom for content images and Mermaid diagrams. One delegated
	// listener catches clicks on any sizeable image (not wrapped in a link)
	// or Mermaid figure inside <main> and opens it enlarged in a dialog, so
	// complex diagrams and screenshots can be inspected without leaving the
	// page. Markdown images, the Screenshot block, Mermaid, and galleries
	// all flow through here — no per-component wiring.
	//
	// Images open into a manual carousel over every zoomable image on the
	// page (DOM order): arrow buttons and ←/→ keys move between them, a
	// counter shows the position. Nothing advances on its own. Diagrams
	// stay single-view.

	type Zoom = { kind: 'image'; src: string; alt: string } | { kind: 'svg'; html: string };

	let open = $state(false);
	let zoom = $state<Zoom | null>(null);
	let images = $state<{ src: string; alt: string }[]>([]);
	let index = $state(0);

	const lang = $derived((page.data.lang as string | undefined) ?? 'en');

	function zoomable(): HTMLImageElement[] {
		return [...document.querySelectorAll<HTMLImageElement>('main img')].filter(
			(i) => !i.closest('a') && i.clientWidth > 80
		);
	}

	function onClick(e: MouseEvent) {
		const t = e.target as HTMLElement | null;
		if (!t || !t.closest('main')) return;

		const img = t.closest('img') as HTMLImageElement | null;
		// Skip tiny images (icons) and images that are themselves links.
		if (img && !img.closest('a') && img.clientWidth > 80) {
			const all = zoomable();
			images = all.map((i) => ({ src: i.currentSrc || i.src, alt: i.alt }));
			index = Math.max(0, all.indexOf(img));
			zoom = { kind: 'image', ...images[index] };
			open = true;
			return;
		}

		const svg = t.closest('.mermaid-figure')?.querySelector('svg');
		if (svg) {
			images = [];
			zoom = { kind: 'svg', html: svg.outerHTML };
			open = true;
		}
	}

	function show(i: number) {
		if (i < 0 || i >= images.length) return;
		index = i;
		zoom = { kind: 'image', ...images[i] };
	}

	function onKeydown(e: KeyboardEvent) {
		if (!open || zoom?.kind !== 'image' || images.length < 2) return;
		if (e.key === 'ArrowLeft') {
			e.preventDefault();
			show(index - 1);
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			show(index + 1);
		}
	}

	onMount(() => {
		document.addEventListener('click', onClick);
		window.addEventListener('keydown', onKeydown);
		return () => {
			document.removeEventListener('click', onClick);
			window.removeEventListener('keydown', onKeydown);
		};
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="flex max-h-[95vh] max-w-[95vw] flex-col gap-0 overflow-auto p-2 sm:max-w-[95vw] sm:p-4"
	>
		<Dialog.Title class="sr-only">Enlarged view</Dialog.Title>
		<Dialog.Description class="sr-only">
			A larger view of the selected image or diagram.
		</Dialog.Description>
		{#if zoom?.kind === 'image'}
			<img
				src={zoom.src}
				alt={zoom.alt}
				class="mx-auto block h-auto max-h-[86vh] w-auto max-w-full"
			/>
			{#if images.length > 1}
				<Button
					variant="secondary"
					size="icon"
					class="absolute left-3 top-1/2 -translate-y-1/2 rounded-full shadow-md"
					aria-label={t(lang, 'previous')}
					disabled={index === 0}
					onclick={() => show(index - 1)}
				>
					<ChevronLeft class="size-5" />
				</Button>
				<Button
					variant="secondary"
					size="icon"
					class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full shadow-md"
					aria-label={t(lang, 'next')}
					disabled={index === images.length - 1}
					onclick={() => show(index + 1)}
				>
					<ChevronRight class="size-5" />
				</Button>
				<p
					class="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-2.5 py-0.5 text-xs text-muted-foreground shadow-sm"
				>
					{index + 1} / {images.length}
				</p>
			{/if}
		{:else if zoom?.kind === 'svg'}
			<!-- eslint-disable-next-line svelte/no-at-html-tags — our own rendered SVG -->
			<div class="lightbox-svg flex min-h-0 flex-1 items-center justify-center overflow-auto">
				{@html zoom.html}
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<style>
	/* Affordance: zoomable content shows the zoom cursor. */
	:global(main img),
	:global(main .mermaid-figure) {
		cursor: zoom-in;
	}
	/* In the lightbox a diagram should grow large and pan via scroll
	   rather than shrink to fit — the whole point is to see the detail. */
	:global(.lightbox-svg svg) {
		max-width: none !important;
		width: auto;
		height: auto;
		min-width: min(100%, 900px);
	}
</style>
