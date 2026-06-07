<script lang="ts">
	import { onMount } from 'svelte';
	import * as Dialog from '$lib/components/ui/dialog';

	// Click-to-zoom for content images and Mermaid diagrams. One delegated
	// listener catches clicks on any sizeable image (not wrapped in a link)
	// or Mermaid figure inside <main> and opens it enlarged in a dialog, so
	// complex diagrams and screenshots can be inspected without leaving the
	// page. Markdown images, the Screenshot block, and Mermaid all flow
	// through here — no per-component wiring.

	type Zoom = { kind: 'image'; src: string; alt: string } | { kind: 'svg'; html: string };

	let open = $state(false);
	let zoom = $state<Zoom | null>(null);

	function onClick(e: MouseEvent) {
		const t = e.target as HTMLElement | null;
		if (!t || !t.closest('main')) return;

		const img = t.closest('img') as HTMLImageElement | null;
		// Skip tiny images (icons) and images that are themselves links.
		if (img && !img.closest('a') && img.clientWidth > 80) {
			zoom = { kind: 'image', src: img.currentSrc || img.src, alt: img.alt };
			open = true;
			return;
		}

		const svg = t.closest('.mermaid-figure')?.querySelector('svg');
		if (svg) {
			zoom = { kind: 'svg', html: svg.outerHTML };
			open = true;
		}
	}

	onMount(() => {
		document.addEventListener('click', onClick);
		return () => document.removeEventListener('click', onClick);
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
