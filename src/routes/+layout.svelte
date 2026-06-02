<script lang="ts">
	import '../app.css';

	// Optional user theme override. If the operator drops a `theme.css`
	// into their content root (it ships in the same mount as the
	// markdown), it's bundled *after* app.css here so its rules win on
	// equal specificity — override the shadcn design tokens (colors,
	// radius, fonts) or target component classes directly. The glob
	// is a no-op when the file is absent, so the default theme stands.
	// See theme.example.css at the repo root for a starting point.
	import.meta.glob('/src/content/theme.css', { eager: true });

	import { ModeWatcher } from 'mode-watcher';
	import { afterNavigate } from '$app/navigation';
	import ThemeColor from '$lib/components/theme-color.svelte';
	import TopNav from '$lib/components/top-nav.svelte';
	import Sidebar from '$lib/components/sidebar.svelte';
	import { siteConfig } from '$lib/config';

	type Props = { children?: import('svelte').Snippet };
	const { children }: Props = $props();

	// The stack open-docs is built on, shown in the footer colophon.
	// Intentionally hardcoded (no config flag) so the credit ships with
	// every deployment.
	const techStack = [
		{ name: 'SvelteKit', href: 'https://svelte.dev/docs/kit' },
		{ name: 'Svelte', href: 'https://svelte.dev' },
		{ name: 'Markdoc', href: 'https://markdoc.dev' },
		{ name: 'Shiki', href: 'https://shiki.style' },
		{ name: 'Tailwind CSS', href: 'https://tailwindcss.com' },
		{ name: 'shadcn-svelte', href: 'https://shadcn-svelte.com' },
		{ name: 'Pagefind', href: 'https://pagefind.app' }
	];

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
<ThemeColor />

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
		<div
			class="container mx-auto flex max-w-screen-2xl flex-col gap-x-6 gap-y-2 px-4 sm:flex-row sm:items-center sm:justify-between lg:px-6"
		>
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

			<!-- Colophon: the stack open-docs is built on. Hardcoded into
			     the shell on purpose — there is no env flag to hide it, so
			     it travels with every deployment. Removing it means forking. -->
			<p class="text-xs text-muted-foreground/80 sm:shrink-0 sm:text-right">
				Powered by{#each techStack as tech, i (tech.href)}{i === 0
						? ' '
						: i === techStack.length - 1
							? ', and '
							: ', '}<a
						class="underline-offset-4 hover:text-foreground hover:underline"
						href={tech.href}
						target="_blank"
						rel="noopener noreferrer">{tech.name}</a>{/each}.
			</p>
		</div>
	</footer>
</div>
