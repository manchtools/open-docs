import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getStore } from '$lib/server/store-instance';
import { splitRequest } from '$lib/i18n';

// Content routes, rendered at request time from the runtime store. The
// language peels off the path (default language unprefixed); a bare
// language path ('/de') is that language's landing page (the hero); any
// other slug resolves to a page tree, falling back to the default
// language for untranslated pages. Unknown slugs 404.
export const load: PageServerLoad = ({ params }) => {
	const store = getStore();
	const { lang, slug } = splitRequest(params.slug, store.languages, store.defaultLang);
	const href = store.localizedHref(lang, slug);

	if (slug === '') {
		return { isHome: true as const, lang, currentHref: href, seo: { path: href, lang, slug } };
	}

	// Generated tag-listing pages: <blog-section>/tags/<tag> has no file —
	// it renders the section's posts filtered by tag.
	const tagMatch = /^(.*)\/tags\/([^/]+)$/.exec(slug);
	if (tagMatch && store.isBlogSection(tagMatch[1])) {
		const [, section, tag] = tagMatch;
		const posts = store.postsByTag(lang, section, tag);
		if (posts.length === 0) throw error(404, `No posts tagged ${tag}`);
		return {
			isHome: false as const,
			lang,
			currentHref: href,
			post: null,
			chrono: null,
			posts,
			tag,
			feedHref: store.localizedHref(lang, section) + '/feed.xml',
			seo: { title: `#${tag}`, path: href, lang, slug }
		};
	}

	const page = store.getPage(lang, slug);
	if (!page) throw error(404, `No content for ${slug}`);

	return {
		isHome: false as const,
		tree: page.tree,
		lang,
		currentHref: href,
		// Blog data: post meta + chronological neighbours on posts, the
		// generated listing on a blog section's index.
		post: page.post ?? null,
		chrono: store.chronoFor(lang, slug),
		posts: store.isBlogSection(slug) ? store.postsFor(lang, slug) : null,
		// Feed advertisement on blog surfaces (index + posts).
		feedHref:
			page.post || store.isBlogSection(slug)
				? store.localizedHref(lang, page.post ? page.post.section : slug) + '/feed.xml'
				: null,
		seo: {
			title: page.title,
			description: page.description,
			path: href,
			lang,
			slug,
			// Article extras for posts: published date + cover as og:image.
			published: page.post?.date,
			authorName: page.post?.author,
			image: page.post?.cover
		}
	};
};
