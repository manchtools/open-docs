<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { t } from '$lib/ui-strings';
	import type { PostListItem } from '$lib/server/content-store';

	// Generated post list under a blog section's index prose — newest
	// first, with cover thumb, localized date, description, reading time,
	// and author. Derived server-side; no file to maintain.
	let { posts }: { posts: PostListItem[] } = $props();

	const lang = $derived((page.data.lang as string) ?? 'en');
	const fmt = $derived(
		new Intl.DateTimeFormat(lang, { year: 'numeric', month: 'long', day: 'numeric' })
	);
	const img = (p: string) => base + (p.startsWith('/') ? p : '/' + p);
</script>

<div class="not-prose mt-10 space-y-8" data-pagefind-ignore>
	{#each posts as post (post.href)}
		<article class="group flex gap-5">
			{#if post.cover}
				<a href={base + post.href} class="hidden shrink-0 sm:block" tabindex="-1" aria-hidden="true">
					<img
						src={img(post.cover)}
						alt=""
						class="h-24 w-36 rounded-lg border border-border object-cover"
						loading="lazy"
					/>
				</a>
			{/if}
			<div class="min-w-0">
				<p class="text-xs text-muted-foreground">
					<time datetime={post.date}>{fmt.format(new Date(post.date))}</time>
					· {post.readingTimeMin} {t(lang, 'minRead')}
					{#if post.author}· {post.author}{/if}
				</p>
				<h2 class="mt-1 text-lg font-semibold tracking-tight">
					<a href={base + post.href} class="hover:underline underline-offset-4">{post.title}</a>
				</h2>
				{#if post.description}
					<p class="mt-1 text-sm text-muted-foreground">{post.description}</p>
				{/if}
				{#if post.tags.length}
					<p class="mt-2 flex flex-wrap gap-1.5">
						{#each post.tags as tag (tag)}
							<span
								class="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[0.7rem] text-muted-foreground"
								>{tag}</span
							>
						{/each}
					</p>
				{/if}
			</div>
		</article>
	{/each}
</div>
