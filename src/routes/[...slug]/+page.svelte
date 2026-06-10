<script lang="ts">
	import { base } from '$app/paths';
	import Toc from '$lib/components/toc.svelte';
	import PrevNext from '$lib/components/prev-next.svelte';
	import Seo from '$lib/components/seo.svelte';
	import Hero from '$lib/components/hero.svelte';
	import MarkdocTree, { type TreeNode } from '$lib/markdoc/MarkdocTree.svelte';
	import PostHeader from '$lib/components/post-header.svelte';
	import BlogListing from '$lib/components/blog-listing.svelte';
	import type { PostMeta, PostListItem } from '$lib/server/content-store';
	type Props = {
		data: {
			isHome: boolean;
			tree?: TreeNode;
			lang: string;
			currentHref: string;
			post?: PostMeta | null;
			posts?: PostListItem[] | null;
			tag?: string;
			feedHref?: string | null;
			seo: {
				title?: string;
				description?: string;
				path: string;
				lang: string;
				slug: string;
				published?: string;
				authorName?: string;
				image?: string;
			};
		};
	};
	const { data }: Props = $props();
</script>

<Seo
	title={data.seo.title}
	description={data.seo.description}
	path={data.seo.path}
	lang={data.seo.lang}
	slug={data.seo.slug}
	published={data.seo.published}
	authorName={data.seo.authorName}
	image={data.seo.image}
	type={data.isHome ? 'website' : 'article'}
/>

<svelte:head>
	{#if data.feedHref}
		<link
			rel="alternate"
			type="application/atom+xml"
			href={`${base}${data.feedHref}`}
			title="Atom feed"
		/>
	{/if}
</svelte:head>

{#if data.isHome}
	<Hero lang={data.lang} />
{:else}
	<div class="flex">
		<article class="min-w-0 flex-1 px-6 py-12 xl:px-12">
			<!-- The page's Markdoc tree renders here through the component
			     registry. prose-neutral matches the shadcn neutral palette;
			     the plugin's prose-invert variant flips it for dark mode. -->
			<div class="prose prose-neutral dark:prose-invert max-w-none">
				{#if data.post}
					<PostHeader post={data.post} />
				{/if}
				{#if data.tag}
					<h1>#{data.tag}</h1>
				{:else}
					<MarkdocTree node={data.tree} />
				{/if}
			</div>

			{#if data.posts}
				<BlogListing posts={data.posts} />
			{/if}

			<PrevNext currentHref={data.currentHref} />
		</article>

		<Toc />
	</div>
{/if}
