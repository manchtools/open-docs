<script lang="ts">
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { Button } from '$lib/components/ui/button';
	import * as Command from '$lib/components/ui/command';
	import { cn } from '$lib/utils';
	import Search from '@lucide/svelte/icons/search';

	// Static-site search built on shadcn-svelte's Command palette,
	// powered by a Pagefind index baked at build time. The trigger
	// in the top-nav opens a CommandDialog; ⌘K / Ctrl+K also opens
	// it. bits-ui handles focus trap, return-focus, and Escape; we
	// own the Pagefind loader, the query→results pipeline, and the
	// goto on selection.
	//
	// Dev mode has no index (pagefind only runs in the production
	// build), so the import will fail and we surface a friendly
	// 'search needs the production build' message rather than
	// breaking the trigger.

	type PagefindResult = {
		url: string;
		excerpt: string;
		meta: { title?: string };
	};

	type PagefindModule = {
		search(query: string): Promise<{
			results: { id: string; data(): Promise<PagefindResult> }[];
		}>;
		options(opts: Record<string, unknown>): Promise<void>;
	};

	let open = $state(false);
	let query = $state('');
	let results = $state<PagefindResult[]>([]);
	let loading = $state(false);
	let loadError = $state<string | null>(null);
	let mod = $state<PagefindModule | null>(null);

	// Ref to the search field. bits-ui focuses the dialog *container* on
	// open, not the input — so on touch devices the first tap only opens
	// the palette and a second tap is needed to place the cursor (and raise
	// the keyboard). We focus the input ourselves once it mounts.
	let searchInput = $state<HTMLInputElement | null>(null);

	const isMac = $derived(
		browser &&
			typeof navigator !== 'undefined' &&
			/mac|iphone|ipad|ipod/i.test(navigator.platform || '')
	);

	async function ensureLoaded() {
		if (mod || loading) return;
		loading = true;
		loadError = null;
		try {
			// Vite tries to bundle string-template dynamic imports; the
			// @vite-ignore comment keeps it as a runtime resolve. Path
			// resolves to /pagefind/pagefind.js (built into
			// build/client/pagefind by the package.json build script).
			const m = await import(/* @vite-ignore */ `${base}/pagefind/pagefind.js`);
			await m.options({
				baseUrl: base + '/',
				// Ranking tuned for docs. All are Pagefind's BM25-style knobs;
				// tweak to taste. https://pagefind.app/docs/ranking/
				ranking: {
					// Favour pages that contain the exact search terms over
					// fuzzy/compound matches — docs searches are usually precise.
					termSimilarity: 1.4,
					// Reduce the bias toward very short pages so a thorough page
					// isn't out-ranked by a stub that mentions the term once.
					pageLength: 0.6,
					// Defaults for the rest.
					termFrequency: 1.0,
					termSaturation: 1.4
				}
			});
			mod = m;
		} catch (err) {
			loadError =
				err instanceof Error && err.message.includes('dynamically imported module')
					? 'Search index not found. Run `bun run build` to generate it (only available in the production build).'
					: 'Failed to load search index.';
			console.warn('[search] load failed', err);
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (!open) {
			results = [];
			query = '';
			return;
		}
		void ensureLoaded();
	});

	$effect(() => {
		// Once the dialog is open and the field has mounted, move focus to it
		// on the next frame (after bits-ui has run its own open-focus), so a
		// single tap is enough to start typing.
		if (!open) return;
		const el = searchInput;
		if (el) requestAnimationFrame(() => el.focus());
	});

	$effect(() => {
		if (!mod || !query.trim()) {
			results = [];
			return;
		}
		const q = query;
		void (async () => {
			const search = await mod.search(q);
			if (q !== query) return; // stale, newer query in flight
			const top = await Promise.all(search.results.slice(0, 8).map((r) => r.data()));
			results = top;
		})();
	});

	function onKeydown(event: KeyboardEvent) {
		const isToggle =
			event.key === 'k' && (event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey;
		if (isToggle) {
			event.preventDefault();
			open = !open;
		}
	}

	function pick(url: string) {
		open = false;
		const term = query.trim();
		if (!term) {
			void goto(url);
			return;
		}
		// Carry the search term to the destination so it can be highlighted
		// there (handled by the afterNavigate hook in +layout.svelte). Each
		// word gets its own `highlight` param — Pagefind's highlighter reads
		// them with getAll() and marks each word, whereas a single
		// space-joined value only matches the literal phrase.
		const params = term
			.split(/\s+/)
			.filter(Boolean)
			.map((word) => `highlight=${encodeURIComponent(word)}`)
			.join('&');
		const [path, hash] = url.split('#');
		const sep = path.includes('?') ? '&' : '?';
		void goto(`${path}${sep}${params}${hash ? `#${hash}` : ''}`);
	}
</script>

<svelte:window on:keydown={onKeydown} />

<Button
	variant="outline"
	onclick={() => (open = true)}
	aria-label="Search docs"
	class={cn(
		'h-9 w-full max-w-xs justify-start gap-2 bg-muted/40 text-sm text-muted-foreground',
		'hover:bg-muted hover:text-foreground md:w-64'
	)}
>
	<Search class="size-4 shrink-0" />
	<span class="flex-1 text-left">Search docs…</span>
	<kbd
		class="hidden items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium md:inline-flex"
	>
		{isMac ? '⌘' : 'Ctrl'}<span>K</span>
	</kbd>
</Button>

<Command.Dialog bind:open shouldFilter={false}>
	<Command.Input bind:ref={searchInput} placeholder="Search the docs…" bind:value={query} />
	<Command.List class="max-h-[60vh]">
		{#if loadError}
			<div class="p-4 text-sm text-muted-foreground">{loadError}</div>
		{:else if loading && !mod}
			<Command.Loading>Loading search index…</Command.Loading>
		{:else if !query.trim()}
			<Command.Empty>Start typing to search.</Command.Empty>
		{:else if results.length === 0}
			<Command.Empty>No results for "{query}".</Command.Empty>
		{:else}
			<Command.Group>
				{#each results as result (result.url)}
					<Command.Item
						value={result.url}
						onSelect={() => pick(result.url)}
						class="flex flex-col items-start gap-0.5"
					>
						<div class="text-sm font-medium">{result.meta.title || 'Untitled'}</div>
						<!-- Pagefind returns excerpts with <mark>...</mark> wrapping
						     matched terms. Render as HTML to keep the highlights. -->
						<div
							class="text-xs text-muted-foreground [&_mark]:bg-yellow-200 [&_mark]:px-0.5 [&_mark]:text-foreground dark:[&_mark]:bg-yellow-700/40"
						>
							{@html result.excerpt}
						</div>
					</Command.Item>
				{/each}
			</Command.Group>
		{/if}
	</Command.List>
</Command.Dialog>
