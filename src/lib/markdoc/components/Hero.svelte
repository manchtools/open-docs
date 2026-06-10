<script lang="ts">
	import { base } from '$app/paths';

	// {% hero src="cover.png" alt="..." title="..." subtitle="..." /%}
	//
	// Full-bleed image header: breaks out of the prose column (negative
	// horizontal margins mirror the article padding) and pulls flush to
	// the top when it is the first block on the page. Optional title /
	// subtitle render on a bottom gradient. Also used automatically when a
	// blog post sets `cover:` frontmatter.
	//
	// Pairing: an {% avatar %} placed directly after a hero overlaps it by
	// half the avatar image (see the adjacency rules in Avatar.svelte).
	let {
		src,
		alt = '',
		title = undefined,
		subtitle = undefined
	}: {
		src: string;
		alt?: string;
		title?: string;
		subtitle?: string;
	} = $props();

	const resolved = $derived(
		src.startsWith('http') ? src : base + (src.startsWith('/') ? src : '/' + src)
	);
</script>

<div class="od-hero not-prose relative -mx-6 my-8 overflow-hidden first:-mt-12 xl:-mx-12">
	<img src={resolved} {alt} class="h-56 w-full object-cover sm:h-72 lg:h-96" />
	{#if title || subtitle}
		<!-- Strong gradient + text shadow keep the overlay readable on
		     bright photos. -->
		<div
			class="od-hero-overlay absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-6 pb-5 pt-20 text-white xl:px-12"
		>
			{#if title}
				<p
					class="text-2xl font-bold tracking-tight [text-shadow:0_1px_4px_rgb(0_0_0/0.9)] sm:text-3xl"
				>
					{title}
				</p>
			{/if}
			{#if subtitle}
				<p class="mt-1 text-sm text-white/90 [text-shadow:0_1px_3px_rgb(0_0_0/0.9)] sm:text-base">
					{subtitle}
				</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* When an avatar follows (and will overlap the bottom-left corner),
	   lift the overlay text clear of the avatar's intrusion zone. */
	:global(.od-hero:has(+ .od-avatar) .od-hero-overlay) {
		padding-bottom: 4.5rem;
	}
</style>
