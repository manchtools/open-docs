<script lang="ts">
	import { page } from '$app/state';
	import { t } from '$lib/ui-strings';
	import Hero from '$lib/markdoc/components/Hero.svelte';
	import type { PostMeta } from '$lib/server/content-store';

	// Automatic post header: the cover (when set) renders as a full-bleed
	// hero, followed by a date · reading-time · author line. The post's
	// own H1 follows from the Markdown body.
	let { post }: { post: PostMeta } = $props();

	const lang = $derived((page.data.lang as string) ?? 'en');
	const fmt = $derived(
		new Intl.DateTimeFormat(lang, { year: 'numeric', month: 'long', day: 'numeric' })
	);
</script>

{#if post.cover && !post.coverFromBody}
	<Hero src={post.cover} alt="" />
{/if}
<p class="not-prose mb-6 text-sm text-muted-foreground" data-pagefind-ignore>
	<time datetime={post.date}>{fmt.format(new Date(post.date))}</time>
	· {post.readingTimeMin} {t(lang, 'minRead')}
	{#if post.author}· {post.author}{/if}
</p>
