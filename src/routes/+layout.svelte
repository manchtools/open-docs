<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { afterNavigate } from '$app/navigation';
	import TopNav from '$lib/components/top-nav.svelte';
	import Sidebar from '$lib/components/sidebar.svelte';
	import { siteConfig } from '$lib/config';

	type Props = { children?: import('svelte').Snippet };
	const { children }: Props = $props();

	// `main` is the internal scroll container in the fixed-viewport
	// layout below, so SvelteKit's default scroll-to-top-of-window
	// after navigation is a no-op for us. afterNavigate scrolls the
	// main container itself, which is what the user actually sees,
	// otherwise clicking the Prev/Next buttons (or any sidebar link)
	// at the bottom of a long page lands the next page mid-scroll.
	let mainEl = $state<HTMLElement | null>(null);
	afterNavigate(() => {
		mainEl?.scrollTo({ top: 0, behavior: 'instant' });
	});
</script>

<ModeWatcher />

<!-- Fixed-viewport layout. Outer container is exactly the viewport
     height; the middle row owns the remaining vertical space
     (viewport - topnav - footer). Sidebar and main each scroll
     internally inside that row, so the footer stays at the bottom
     of the viewport on short pages instead of producing an unwanted
     scrollbar past the fold. -->
<div class="flex h-screen flex-col">
	<TopNav />

	<div class="container mx-auto flex w-full max-w-screen-2xl flex-1 overflow-hidden px-4 lg:px-6">
		<aside class="hidden h-full w-64 shrink-0 border-r border-border md:block">
			<Sidebar />
		</aside>

		<main bind:this={mainEl} class="min-w-0 flex-1 overflow-y-auto" data-pagefind-body>
			{@render children?.()}
		</main>
	</div>

	<footer class="border-t border-border py-6 text-sm text-muted-foreground">
		<div class="container mx-auto max-w-screen-2xl px-4 lg:px-6">
			<p>
				{siteConfig.brandName}
				{#if siteConfig.brandTagline}{siteConfig.brandTagline}{/if},
				built with <a
					class="underline underline-offset-4 hover:text-foreground"
					href="https://github.com/manchtools/open-docs">open-docs</a>.
				{#if siteConfig.repoUrl}
					<a
						class="underline underline-offset-4 hover:text-foreground"
						href={siteConfig.repoUrl}
					>
						Edit on GitHub
					</a>
				{/if}
			</p>
		</div>
	</footer>
</div>
