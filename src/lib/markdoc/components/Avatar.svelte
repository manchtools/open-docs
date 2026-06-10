<script lang="ts">
	import { base } from '$app/paths';

	// {% avatar name="Paul" src="/authors/paul.png" description="…" url="…" /%}
	//
	// Author card: round image + name (+ optional bio and link). Doubles
	// as the automatic byline on blog posts.
	//
	// Pairing: placed DIRECTLY after a {% hero %}, the avatar image
	// overlaps the hero's bottom edge by half its height (the classic
	// cover-photo header) — see the :global adjacency rules below. The
	// name/description stay below the hero edge so text never sits on the
	// photo. Standalone, the block renders with normal spacing.
	let {
		name,
		src = undefined,
		description = undefined,
		url = undefined
	}: {
		name: string;
		src?: string;
		description?: string;
		url?: string;
	} = $props();

	const resolved = $derived(
		src ? (src.startsWith('http') ? src : base + (src.startsWith('/') ? src : '/' + src)) : undefined
	);
</script>

<div class="od-avatar not-prose my-8 flex items-start gap-4">
	{#if resolved}
		<img
			src={resolved}
			alt={name}
			class="od-avatar-img size-20 shrink-0 rounded-full object-cover ring-4 ring-background"
		/>
	{/if}
	<div class="min-w-0 pt-1">
		{#if url}
			<a href={url} class="font-semibold text-foreground underline-offset-4 hover:underline"
				>{name}</a
			>
		{:else}
			<p class="font-semibold text-foreground">{name}</p>
		{/if}
		{#if description}
			<p class="mt-0.5 text-sm text-muted-foreground">{description}</p>
		{/if}
	</div>
</div>

<style>
	/* Hero + avatar pairing. When an avatar directly follows a hero, pull
	   the block up to the hero's edge (cancelling the hero's bottom
	   margin) and let the IMAGE overlap the hero by half its height — the
	   ring-4 ring-background carves the classic cutout. Only the image
	   rises; name/description stay below the hero so text never overlays
	   the photo. Fully :global because the two blocks are siblings
	   produced by different components (a scoped rule would be pruned). */
	:global(.od-hero + .od-avatar) {
		margin-top: -2rem;
	}
	:global(.od-hero + .od-avatar .od-avatar-img) {
		margin-top: -2.5rem; /* half of the 5rem (size-20) image */
		position: relative;
		z-index: 1;
	}
</style>
