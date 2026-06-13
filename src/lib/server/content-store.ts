// Runtime content store — the 0.4.0 replacement for the import.meta.glob
// build pipeline. Scans a directory of Markdown at boot and derives
// everything the site needs: languages, per-language navigation, page
// metadata, meta/legal pages, and a Markdoc render tree per page. The
// tree-building, ordering, i18n, and frontmatter rules are ported from
// the 0.3.x nav.ts/content.ts verbatim, so the derived site is identical;
// only the source changed (fs at boot instead of Vite at build).
//
// Validation is fail-closed, matching what the old build caught: unknown
// tags, missing required attributes, and dead internal links collect into
// `errors`, and the boot wiring refuses to serve when any exist.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import Markdoc, { type RenderableTreeNode } from '@markdoc/markdoc';
import { cleanSlug, stripPrefix, titleFromSegment } from '../slug';
import { slugLang, pickLanguages, hrefFor } from '../i18n';
import type { NavItem, NavNode } from '../nav-core';
import { applyHeadingAnchors, applyFootnotes, stripHtmlComments } from './markdown';
import { buildSchemaFromRegistry, type RegistrySchema } from './markdoc-schema';
import { looksLikeInlineSvg, validateSvgIcon } from './svg-icon';
import { applyTokens, buildTokenMap } from '../../../scripts/tokens.js';

export type PostMeta = {
	/** ISO date (frontmatter `date: YYYY-MM-DD`) — the canonical sort key. */
	date: string;
	/** Display name — the literal value, or the author page's title. */
	author?: string;
	/** From the author page's `avatar:` frontmatter (path under static/). */
	authorAvatar?: string;
	/** Canonical slug-href of the author page, when `author:` is a path. */
	authorHref?: string;
	tags: string[];
	cover?: string;
	/** True when the cover came from a {% hero %} in the body — the post
	 *  header must not render a second one. */
	coverFromBody?: boolean;
	readingTimeMin: number;
	/** Slug of the blog section this post belongs to. */
	section: string;
};

export type PostListItem = {
	title: string;
	/** Public (localized) href — language-prefixed for non-default langs. */
	href: string;
	/** Canonical, language-agnostic slug — the key into getPage(), used by
	 *  the feed builder to render each post's body. */
	slug: string;
	description?: string;
} & PostMeta;

export type PageData = {
	title: string;
	description?: string;
	tree: RenderableTreeNode;
	/** Present when the page is a blog post. */
	post?: PostMeta;
};

export type StoreError = { file: string; line?: number; message: string };

export type ContentStore = {
	languages: string[];
	defaultLang: string;
	i18nActive: boolean;
	errors: StoreError[];
	getPage(lang: string, slug: string): PageData | null;
	navByLang(lang: string): NavNode[];
	flatNavFor(lang: string): NavItem[];
	metaPagesFor(lang: string): NavItem[];
	pageMetaFor(lang: string, slug: string): { title: string; description?: string };
	listPaths(): string[];
	localizedHref(lang: string, slug: string): string;
	/** Is this slug a `blog: true` section index? */
	isBlogSection(slug: string): boolean;
	/** Slugs of every `blog: true` section — one Atom feed is built per
	 *  section (per language) at startup. */
	blogSections(): string[];
	/** Posts of a blog section, newest first, localized. */
	postsFor(lang: string, section: string): PostListItem[];
	/** Posts of a section carrying the given tag slug, newest first. */
	postsByTag(lang: string, section: string, tag: string): PostListItem[];
	/** Chronological neighbours of a post (newer/older), or null for non-posts. */
	chronoFor(
		lang: string,
		slug: string
	): { newer: NavItem | null; older: NavItem | null } | null;
};

type Options = {
	contentDir: string;
	defaultLang?: string;
	schema?: RegistrySchema;
	tokens?: Record<string, string>;
	/** Directories that may hold static assets (checked for screenshot
	 *  files, first hit wins). Defaults cover dev (static/) and the
	 *  container (the merged build/client + the /static mount). */
	staticDirs?: string[];
	/** Serve `draft: true` posts (dev mode). Production excludes them. */
	includeDrafts?: boolean;
};

// ---------------------------------------------------------------------------
// Frontmatter + helpers (ported from 0.3.x nav.ts — same minimal parser, so
// the same files parse the same way).
// ---------------------------------------------------------------------------

function frontmatter(raw: string): Record<string, string> {
	const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
	if (!m) return {};
	const out: Record<string, string> = {};
	for (const line of m[1].split(/\r?\n/)) {
		const kv = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line);
		if (!kv) continue;
		let value = kv[2].trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}
		out[kv[1].toLowerCase()] = value;
	}
	return out;
}

function orderOf(fm: Record<string, string>, segment: string): number | null {
	if (fm.order != null && fm.order !== '') {
		const n = Number(fm.order);
		if (Number.isFinite(n)) return n;
	}
	return stripPrefix(segment).order;
}

// First prose paragraph, cleaned and trimmed to ~155 chars — the
// meta-description fallback (ported from nav.ts).
function firstParagraph(raw: string): string | undefined {
	const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
	let para = '';
	let inFence = false;
	for (const line of body.split(/\r?\n/)) {
		const t = line.trim();
		if (t.startsWith('```')) {
			inFence = !inFence;
			continue;
		}
		if (inFence) continue;
		if (!t) {
			if (para) break;
			continue;
		}
		if (t.startsWith('#') || t.startsWith('{%') || t.startsWith('|') || t.startsWith('>')) continue;
		if (/^([-*+]|\d+\.)\s/.test(t)) continue;
		para += (para ? ' ' : '') + t;
	}
	const clean = para
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/\{%[^%]*%\}/g, '')
		.replace(/[`*_~]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
	if (!clean) return undefined;
	return clean.length > 155 ? clean.slice(0, 152).replace(/\s+\S*$/, '') + '…' : clean;
}

// First `#` H1 — title fallback for translated section index files.
function firstH1(raw: string): string | undefined {
	const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
	const m = /^#\s+(.+?)\s*$/m.exec(body);
	return m ? m[1].replace(/[`*_]/g, '').trim() : undefined;
}

function metaTitle(virtualPath: string, fm: Record<string, string>): string {
	const segments = virtualPath
		.replace(/^\/src\/content\//, '')
		.replace(/\.(md|markdoc)$/, '')
		.split('/');
	const file = segments[segments.length - 1];
	const isIndex = stripPrefix(file).rest.toLowerCase() === 'index';
	const titleSeg = isIndex ? (segments[segments.length - 2] ?? file) : file;
	return fm.title ?? titleFromSegment(titleSeg);
}

// ---------------------------------------------------------------------------
// Nav tree building (ported from 0.3.x nav.ts, parameterized by file map).
// ---------------------------------------------------------------------------

const MAX_SECTION_DEPTH = 3;
const FALLBACK = Number.POSITIVE_INFINITY;

type BuildNode = {
	title: string;
	label?: string;
	href?: string;
	order: number;
	icon?: string;
	children: Map<string, BuildNode>;
};

const isSection = (n: BuildNode): boolean => n.children.size > 0;

function byOrderThenTitle(a: BuildNode, b: BuildNode): number {
	if (a.order !== b.order) return a.order < b.order ? -1 : 1;
	return a.title.localeCompare(b.title);
}

export function createContentStore(opts: Options): ContentStore {
	const defaultLang = (opts.defaultLang ?? 'en').trim().toLowerCase();
	const tokens = opts.tokens ?? buildTokenMap();
	const schema =
		opts.schema ??
		buildSchemaFromRegistry('src/lib/markdoc/tags.svelte', 'src/lib/markdoc/nodes.svelte');
	const errors: StoreError[] = [];

	// --- scan ---------------------------------------------------------------
	// Virtual paths keep the '/src/content/' prefix so the battle-tested
	// slug/i18n helpers apply unchanged regardless of the real directory.
	const sources = new Map<string, string>(); // virtualPath → raw
	let entries: import('node:fs').Dirent[] = [];
	try {
		entries = readdirSync(opts.contentDir, { recursive: true, withFileTypes: true });
	} catch {
		// missing dir → empty site; the boot wiring decides how to react
	}
	const hasOwnIndex = new Set<string>();
	for (const entry of entries) {
		if (!entry.isFile() || !/^index\.(md|markdoc)$/i.test(entry.name)) continue;
		hasOwnIndex.add(entry.parentPath ?? opts.contentDir);
	}
	for (const entry of entries) {
		if (!entry.isFile() || !/\.(md|markdoc)$/.test(entry.name)) continue;
		const dir = entry.parentPath ?? opts.contentDir;
		const abs = join(dir, entry.name);
		let rel = abs.slice(join(opts.contentDir, '/').length).replaceAll('\\', '/');
		// GitHub convention: README.md is the folder index when no index
		// file exists.
		if (/(^|\/)README\.(md|markdoc)$/i.test(rel) && !hasOwnIndex.has(dir)) {
			rel = rel.replace(/README(\.(md|markdoc))$/i, 'index$1');
		}
		try {
			sources.set('/src/content/' + rel, readFileSync(abs, 'utf8'));
		} catch (err) {
			errors.push({ file: rel, message: `unreadable: ${String(err)}` });
		}
	}

	const languages = pickLanguages([...sources.keys()], defaultLang);
	const i18nActive = languages.length > 1;
	const localizedHref = (lang: string, slug: string) =>
		hrefFor(lang, slug, defaultLang, i18nActive);

	// --- Markdoc transform config -------------------------------------------
	const config = {
		tags: Object.fromEntries(
			Object.entries(schema.tags).map(([name, t]) => [
				name,
				{
					render: t.render,
					attributes: Object.fromEntries(
						Object.entries(t.attributes).map(([a, s]) => [a, { required: s.required }])
					)
				}
			])
		),
		nodes: {
			// GFM task lists: a list item starting with "[ ] " / "[x] " becomes
			// a disabled checkbox. Plain markdown convention, not a tag — so it
			// lives here rather than in the component registry.
			// Markdown images render through the Screenshot component (flat),
			// like an editor preview — local paths, content-relative paths,
			// and web URLs alike.
			image: {
				...Markdoc.nodes.image,
				transform(node: import('@markdoc/markdoc').Node, cfg: import('@markdoc/markdoc').Config) {
					const a = node.transformAttributes(cfg) as Record<string, string>;
					return new Markdoc.Tag('Screenshot', {
						src: a.src,
						alt: a.alt ?? '',
						variant: 'flat',
						// marks markdown-image origin: only these get relative-src
						// resolution ({% screenshot %} srcs stay bare names under
						// static/screenshots/, per the block contract)
						implicit: true
					});
				}
			},
			item: {
				...Markdoc.nodes.item,
				transform(node: import('@markdoc/markdoc').Node, cfg: import('@markdoc/markdoc').Config) {
					const children = node.transformChildren(cfg);
					// The marker is the item's leading text — directly (tight
					// list) or inside the first paragraph/inline tag (loose).
					const holder: { arr: unknown[] } | null = (() => {
						if (typeof children[0] === 'string') return { arr: children as unknown[] };
						const f = children[0] as { children?: unknown[] } | undefined;
						if (f && Array.isArray(f.children) && typeof f.children[0] === 'string')
							return { arr: f.children };
						return null;
					})();
					const text = holder?.arr[0] as string | undefined;
					const m = typeof text === 'string' ? /^\[( |x|X)\] /.exec(text) : null;
					if (m && holder) {
						holder.arr[0] = (text as string).slice(4);
						const box = new Markdoc.Tag('input', {
							type: 'checkbox',
							disabled: true,
							...(m[1] !== ' ' ? { checked: true } : {})
						});
						return new Markdoc.Tag('li', { class: 'od-task' }, [box, ...children]);
					}
					return new Markdoc.Tag('li', node.transformAttributes(cfg), children);
				}
			},
			...Object.fromEntries(
			Object.entries(schema.nodes).map(([type, t]) => {
				const base = Markdoc.nodes[type as keyof typeof Markdoc.nodes] as {
					attributes?: Record<string, unknown>;
				};
				// Markdoc's built-in schemas mark several attributes
				// `render: false` (heading `level`, fence `content`, …) because
				// their default transforms consume them internally. Our
				// components ARE the consumers, so strip the flag — attributes
				// must flow through transformAttributes into component props,
				// exactly as the old pipeline's schema copies behaved.
				const attributes = Object.fromEntries(
					Object.entries(base.attributes ?? {}).map(([name, def]) => {
						const { render: _render, ...rest } = def as Record<string, unknown>;
						return [name, rest];
					})
				);
				return [
					type,
					{
						...base,
						attributes,
						transform(
							node: import('@markdoc/markdoc').Node,
							cfg: import('@markdoc/markdoc').Config
						) {
							return new Markdoc.Tag(
								t.render,
								node.transformAttributes(cfg),
								node.transformChildren(cfg)
							);
						}
					}
				];
			})
		)
		}
	};

	// --- parse + validate + transform every file ----------------------------
	type FileData = {
		virtualPath: string;
		shortPath: string;
		lang: string;
		slug: string;
		fm: Record<string, string>;
		raw: string;
		tree: RenderableTreeNode;
		ids: Set<string>;
	};

	// Blog sections: a section whose index sets `blog: true` (default
	// language defines the structure, as everywhere). Posts are its
	// non-index descendant pages — except an `authors/` subfolder, whose
	// pages are profile pages, not posts.
	const blogSections = new Set<string>();
	for (const [virtualPath, original] of sources) {
		const { lang, slug } = slugLang(virtualPath, defaultLang);
		if (lang !== defaultLang) continue;
		const file = virtualPath.split('/').pop() ?? '';
		if (stripPrefix(file.replace(/\.(md|markdoc)$/, '')).rest.toLowerCase() !== 'index') continue;
		if (frontmatter(original).blog?.toLowerCase() === 'true' && slug) blogSections.add(slug);
	}
	const postSectionOf = (slug: string): string | undefined => {
		for (const sec of blogSections) {
			if (!slug.startsWith(sec + '/')) continue;
			if (slug.startsWith(sec + '/authors/')) return undefined;
			return sec;
		}
		return undefined;
	};
	// Author profile pages: servable and linkable, but never sidebar
	// entries or posts.
	const isAuthorPage = (slug: string): boolean =>
		[...blogSections].some((sec) => slug.startsWith(sec + '/authors/'));

	const linkRenderName = schema.nodes.link?.render ?? 'Link';

	const files: FileData[] = [];
	for (const [virtualPath, original] of sources) {
		const shortPath = virtualPath.replace('/src/content/', '');
		const { lang, slug } = slugLang(virtualPath, defaultLang);
		const fm = frontmatter(original);
		// An inline-SVG `icon:` is rendered verbatim ({@html}) on hero/section
		// cards, so it's a stored-XSS sink. Validate it fail-closed against the
		// safe-presentation allow-list (emoji / image-path icons are untouched).
		if (looksLikeInlineSvg(fm.icon)) {
			const reason = validateSvgIcon(fm.icon);
			if (reason) errors.push({ file: shortPath, message: `unsafe inline-SVG icon: ${reason}` });
		}
		// Drafts: a post with `draft: true` is invisible in production —
		// nav, content, paths, search, feeds — and visible in dev.
		if (
			!opts.includeDrafts &&
			fm.draft?.toLowerCase() === 'true' &&
			postSectionOf(slug) !== undefined
		) {
			continue;
		}
		const raw = applyHeadingAnchors(applyFootnotes(stripHtmlComments(applyTokens(original, tokens))));
		const ast = Markdoc.parse(raw);
		// Fences are literal. Markdoc parses {% tags %} inside code fences
		// into child nodes (process=true by default), which would validate
		// and render documentation EXAMPLES as real tags. The docs promise
		// fenced examples are shown verbatim — prune the children; fences
		// render from their raw `content` attribute.
		for (const node of ast.walk()) {
			if (node.type === 'fence') node.children = [];
		}
		for (const v of Markdoc.validate(ast, config)) {
			const entry = {
				file: shortPath,
				line: (v.lines?.[0] ?? 0) + 1,
				message: `${v.error.id}: ${v.error.message}`
			};
			if (v.error.level === 'error' || v.error.level === 'critical') errors.push(entry);
			else console.warn(`[open-docs] ${entry.file}:${entry.line} ${entry.message}`);
		}
		// Plain JSON tree (Tag instances → POJOs) so SvelteKit `load` can
		// serialize it and the client renderer can hydrate from it.
		const tree = JSON.parse(JSON.stringify(Markdoc.transform(ast, config)));
		const ids = new Set<string>();
		(function collect(n: unknown): void {
			if (Array.isArray(n)) return n.forEach(collect);
			if (!n || typeof n !== 'object') return;
			const t = n as { attributes?: { id?: unknown }; children?: unknown };
			if (typeof t.attributes?.id === 'string') ids.add(t.attributes.id);
			collect(t.children);
		})(tree);
		files.push({ virtualPath, shortPath, lang, slug, fm, raw: original, tree, ids });
	}

	// --- content lookup: lang → slug → page ---------------------------------
	const byLang = new Map<string, Map<string, FileData>>();
	for (const f of files) {
		if (!byLang.has(f.lang)) byLang.set(f.lang, new Map());
		const langMap = byLang.get(f.lang)!;
		const existing = langMap.get(f.slug);
		if (existing) {
			// Two source files collapse to the same slug in one language (e.g.
			// `index.md` and `introduction.md` both → '', or `foo.md` and
			// `01-foo.md` both → 'foo'). Silently overwriting loses a page with
			// no signal — fail the boot, like every other content error.
			errors.push({
				file: f.shortPath,
				message: `duplicate slug "${f.slug || '(landing)'}" — also produced by ${existing.shortPath}`
			});
			continue;
		}
		langMap.set(f.slug, f);
	}
	const defaultFiles = byLang.get(defaultLang) ?? new Map<string, FileData>();

	function fileFor(lang: string, slug: string): FileData | null {
		return byLang.get(lang)?.get(slug) ?? defaultFiles.get(slug) ?? null;
	}

	// --- post metadata (blog sections) -----------------------------------
	// docref: begin post-frontmatter-contract
	// `date: YYYY-MM-DD` is the canonical sort key and is REQUIRED on every
	// post; a missing/malformed date fails the boot like any author error.
	const postMeta: Record<string, PostMeta> = {};
	for (const f of defaultFiles.values()) {
		const section = postSectionOf(f.slug);
		if (!section) continue;
		const date = f.fm.date;
		if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
			errors.push({
				file: f.shortPath,
				message: `posts in a blog section need a valid \`date: YYYY-MM-DD\` (got: ${date ?? 'none'})`
			});
			continue;
		}
		const body = f.raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
		const words = body.split(/\s+/).filter(Boolean).length;
		// `author:` is a literal display name, or a site-absolute path to an
		// author page whose frontmatter supplies name (title) and avatar.
		let author: string | undefined = f.fm.author;
		let authorAvatar: string | undefined;
		let authorHref: string | undefined;
		if (author?.startsWith('/')) {
			const authorFile = defaultFiles.get(author.replace(/^\//, ''));
			if (!authorFile) {
				errors.push({
					file: f.shortPath,
					message: `author page not found: ${author}`
				});
				author = undefined;
			} else {
				authorHref = author;
				author = authorFile.fm.title ?? authorFile.slug.split('/').pop();
				authorAvatar = authorFile.fm.avatar;
			}
		}
		// `cover:` frontmatter wins; otherwise the first {% hero %} in the
		// body supplies the cover (listing thumbnail + og:image) — no need
		// to state the image twice.
		let cover = f.fm.cover;
		let coverFromBody: boolean | undefined;
		if (!cover) {
			(function findHero(n: unknown): void {
				if (cover !== undefined || !n) return;
				if (Array.isArray(n)) return n.forEach(findHero);
				if (typeof n !== 'object') return;
				const t = n as { name?: string; attributes?: { src?: unknown }; children?: unknown };
				if (t.name === 'Hero' && typeof t.attributes?.src === 'string') {
					if (!/^https?:/.test(t.attributes.src)) {
						cover = t.attributes.src.replace(/^\//, '');
						coverFromBody = true;
					}
					return;
				}
				findHero(t.children);
			})(f.tree);
		}
		postMeta[f.slug] = {
			date,
			author,
			authorAvatar,
			authorHref,
			tags: (f.fm.tags ?? '')
				.split(',')
				.map((t) => t.trim())
				.filter(Boolean),
			cover,
			coverFromBody,
			readingTimeMin: Math.max(1, Math.round(words / 200)),
			section
		};
	}
	// docref: end post-frontmatter-contract

	// Relative references, resolved per linking file (VSCode/GitHub style;
	// sources are never rewritten): ./other.md, ../x.md#a, sibling.md, and
	// relative image srcs. .md/.markdoc and NN- prefixes map through the
	// normal slug rules; index/README collapse to the folder URL.
	const resolveRel = (fromSlug: string, ref: string): string | null => {
		if (/^([a-z]+:|\/|#)/i.test(ref)) return null; // absolute, scheme, or pure anchor
		const [pathPart, anchor] = ref.split('#');
		if (!pathPart) return null;
		const baseSegs = fromSlug.split('/').slice(0, -1);
		for (const seg of pathPart.split('/')) {
			if (seg === '' || seg === '.') continue;
			if (seg === '..') baseSegs.pop();
			else baseSegs.push(seg);
		}
		const joined = baseSegs.join('/');
		const target = /\.(md|markdoc)$/i.test(joined)
			? cleanSlug('/src/content/' + joined.replace(/(^|\/)README\.(md|markdoc)$/i, '$1index.$2'))
			: joined; // asset: keep the extension
		return '/' + target + (anchor ? '#' + anchor : '');
	};
	for (const f of files) {
		(function resolve(n: unknown): void {
			if (Array.isArray(n)) return n.forEach(resolve);
			if (!n || typeof n !== 'object') return;
			const tag = n as { name?: string; attributes?: Record<string, unknown>; children?: unknown };
			if (tag.name === linkRenderName && typeof tag.attributes?.href === 'string') {
				const r = resolveRel(f.slug, tag.attributes.href);
				if (r) tag.attributes.href = r === '/index' ? '/' : r;
			}
			if (
				tag.name === 'Screenshot' &&
				tag.attributes?.implicit === true &&
				typeof tag.attributes?.src === 'string'
			) {
				const r = resolveRel(f.slug, tag.attributes.src);
				if (r) tag.attributes.src = r;
				delete tag.attributes.implicit;
			}
			resolve(tag.children);
		})(f.tree);
	}

	// {% avatar author="/path" %}: fill name/src/description/url from the
	// referenced page so authors are stated once. Unresolvable → boot error.
	for (const f of files) {
		(function enrich(n: unknown): void {
			if (Array.isArray(n)) return n.forEach(enrich);
			if (!n || typeof n !== 'object') return;
			const tag = n as { name?: string; attributes?: Record<string, unknown>; children?: unknown };
			if (tag.name === 'Avatar' && typeof tag.attributes?.author === 'string') {
				const ref = defaultFiles.get((tag.attributes.author as string).replace(/^\//, ''));
				if (!ref) {
					errors.push({ file: f.shortPath, message: `author page not found: ${tag.attributes.author}` });
				} else {
					tag.attributes.name ??= ref.fm.title ?? ref.slug.split('/').pop();
					tag.attributes.src ??= ref.fm.avatar;
					tag.attributes.description ??= firstParagraph(ref.raw);
					tag.attributes.url ??= '/' + ref.slug;
				}
			}
			enrich(tag.children);
		})(f.tree);
	}

	// Nav order for posts: newest-first via negated timestamp; same-date
	// ties rank by title DESCENDING (v0.4.0 above v0.3.3), mirrored in
	// postsFor(). The +rank (0..n ms) never crosses into the previous day.
	const postNavOrder: Record<string, number> = {};
	{
		const groups = new Map<string, string[]>();
		for (const [slug, m] of Object.entries(postMeta)) {
			const key = `${m.section}|${m.date}`;
			(groups.get(key) ?? groups.set(key, []).get(key)!).push(slug);
		}
		for (const slugs of groups.values()) {
			slugs.sort((a, b) =>
				(defaultFiles.get(b)?.fm.title ?? b).localeCompare(defaultFiles.get(a)?.fm.title ?? a)
			);
			slugs.forEach((slug, rank) => {
				postNavOrder[slug] = -Date.parse(postMeta[slug].date) + rank;
			});
		}
	}

	// --- nav tree (default language defines the structure) ------------------
	const metaRaw: { title: string; href: string; label?: string; order: number }[] = [];

	function buildTree(): NavNode[] {
		const root: BuildNode = { title: '', order: FALLBACK, children: new Map() };

		for (const f of defaultFiles.values()) {
			if (isAuthorPage(f.slug)) continue;
			const fm = f.fm;
			const href = '/' + f.slug;
			const rawSegments = f.virtualPath
				.replace(/^\/src\/content\//, '')
				.replace(/\.(md|markdoc)$/, '')
				.split('/');
			const fileSegment = rawSegments[rawSegments.length - 1];
			const dirSegments = rawSegments.slice(0, -1);
			const isIndex = stripPrefix(fileSegment).rest.toLowerCase() === 'index';
			const label = fm.label ?? fm.sidebar_label;

			if (fm.meta?.toLowerCase() === 'true') {
				metaRaw.push({
					title: fm.title ?? titleFromSegment(fileSegment),
					href,
					label,
					order: orderOf(fm, fileSegment) ?? FALLBACK
				});
				continue;
			}

			if (f.slug === '') {
				// Same key shape as section index pages ('pg:index'); the root is
				// built via toNodes(top), not toNavNode, so this stays consistent
				// without changing nav output.
				root.children.set('pg:index', {
					title: fm.title ?? 'Introduction',
					href: '/',
					label,
					order: orderOf(fm, fileSegment) ?? Number.NEGATIVE_INFINITY,
					children: new Map()
				});
				continue;
			}

			let parent = root;
			for (const rawDir of dirSegments.slice(0, MAX_SECTION_DEPTH)) {
				const { rest, order } = stripPrefix(rawDir);
				const key = 'sec:' + rest;
				let section = parent.children.get(key);
				if (!section) {
					section = { title: titleFromSegment(rawDir), order: order ?? FALLBACK, children: new Map() };
					parent.children.set(key, section);
				} else if (order != null) {
					section.order = order;
				}
				parent = section;
			}

			if (isIndex && fm.icon && parent !== root) parent.icon = fm.icon;

			const pageKey = 'pg:' + stripPrefix(fileSegment).rest;
			parent.children.set(pageKey, {
				title: fm.title ?? (isIndex ? 'Overview' : titleFromSegment(fileSegment)),
				href,
				label,
				// Posts sort newest-first: the negated timestamp rides the
				// existing order machinery (ties fall through to the title
				// comparison, matching the proposal).
				order:
					postNavOrder[f.slug] ??
					orderOf(fm, fileSegment) ??
					(isIndex ? Number.NEGATIVE_INFINITY : FALLBACK),
				children: new Map()
			});
		}

		return toNodes(root, true);
	}

	function toNavNode(n: BuildNode): NavNode {
		if (!isSection(n)) return { title: n.title, label: n.label, href: n.href };
		const indexHref = n.children.get('pg:index')?.href;
		const items = toNodes(n).filter((c) => c.items || c.href !== indexHref);
		return { title: n.title, label: n.label, icon: n.icon, href: indexHref, items };
	}

	function toNodes(section: BuildNode, top = false): NavNode[] {
		const children = [...section.children.values()];
		if (!top) {
			children.sort(byOrderThenTitle);
			return children.map(toNavNode);
		}
		const pages = children.filter((c) => !isSection(c)).sort(byOrderThenTitle);
		const sections = children.filter(isSection).sort(byOrderThenTitle);
		const out: NavNode[] = [];
		if (pages.length > 0) out.push({ title: '', items: pages.map(toNavNode) });
		for (const s of sections) out.push(toNavNode(s));
		return out;
	}

	const nav = buildTree();
	const metaPages: NavItem[] = metaRaw
		.sort((a, b) => (a.order !== b.order ? a.order - b.order : a.title.localeCompare(b.title)))
		.map(({ title, href, label }) => ({ title, href, label }));

	// --- per-language overlays (ported from nav.ts) --------------------------
	type Trans = { title?: string; label?: string; icon?: string; description?: string };
	const defaultMeta: Record<string, { title: string; description?: string }> = {};
	const transByLang: Record<string, Record<string, Trans>> = {};
	for (const f of files) {
		if (f.slug === '') continue;
		if (f.lang === defaultLang) {
			defaultMeta[f.slug] = {
				title: metaTitle(f.virtualPath, f.fm),
				description: f.fm.description || firstParagraph(f.raw)
			};
		} else {
			(transByLang[f.lang] ??= {})[f.slug] = {
				title: f.fm.title ?? firstH1(f.raw),
				label: f.fm.label ?? f.fm.sidebar_label,
				icon: f.fm.icon,
				description: f.fm.description || firstParagraph(f.raw)
			};
		}
	}

	function localizeNode(n: NavNode, lang: string): NavNode {
		const slug = n.href != null ? n.href.replace(/^\//, '') : undefined;
		const t = slug != null ? transByLang[lang]?.[slug] : undefined;
		return {
			title: t?.title ?? n.title,
			label: t?.label ?? n.label,
			icon: t?.icon ?? n.icon,
			href: slug != null ? localizedHref(lang, slug) : undefined,
			items: n.items?.map((c) => localizeNode(c, lang))
		};
	}

	function navByLang(lang: string): NavNode[] {
		return lang === defaultLang ? nav : nav.map((n) => localizeNode(n, lang));
	}

	function flatten(nodes: NavNode[]): NavItem[] {
		const out: NavItem[] = [];
		for (const n of nodes) {
			if (n.href) out.push({ title: n.title, href: n.href, label: n.label });
			if (n.items) out.push(...flatten(n.items));
		}
		return out;
	}

	// Map a (possibly language-prefixed) href back to its canonical slug.
	function hrefSlug(href: string, lang: string): string {
		const p = href.replace(/^\//, '');
		if (lang !== defaultLang && (p === lang || p.startsWith(lang + '/'))) {
			return p.slice(lang.length + 1);
		}
		return p;
	}

	// Posts leave the docs prev/next chain (their chain is chronological —
	// see chronoFor); the blog index itself stays a regular page.
	function flatNavFor(lang: string): NavItem[] {
		return flatten(navByLang(lang)).filter((i) => !postMeta[hrefSlug(i.href, lang)]);
	}

	function postsFor(lang: string, section: string): PostListItem[] {
		return Object.entries(postMeta)
			.filter(([, m]) => m.section === section)
			.sort(([sa, a], [sb, b]) =>
				a.date === b.date
					? // Same-date ties break by title DESCENDING — changelogs
						// often release several versions a day, and v0.4.0
						// belongs above v0.3.3.
						pageMetaFor(lang, sb).title.localeCompare(pageMetaFor(lang, sa).title)
					: a.date < b.date
						? 1
						: -1
			)
			.map(([slug, m]) => ({
				...m,
				...pageMetaFor(lang, slug),
				slug,
				href: localizedHref(lang, slug)
			}));
	}

	const tagSlug = (t: string) => t.toLowerCase().replace(/\s+/g, '-');

	function postsByTag(lang: string, section: string, tag: string): PostListItem[] {
		return postsFor(lang, section).filter((p) => p.tags.some((t) => tagSlug(t) === tag));
	}

	function chronoFor(
		lang: string,
		slug: string
	): { newer: NavItem | null; older: NavItem | null } | null {
		const m = postMeta[slug];
		if (!m) return null;
		const list = postsFor(lang, m.section);
		const href = localizedHref(lang, slug);
		const idx = list.findIndex((p) => p.href === href);
		const toItem = (p: PostListItem | undefined): NavItem | null =>
			p ? { title: p.title, href: p.href } : null;
		return {
			newer: idx > 0 ? toItem(list[idx - 1]) : null,
			older: idx >= 0 && idx < list.length - 1 ? toItem(list[idx + 1]) : null
		};
	}

	function metaPagesFor(lang: string): NavItem[] {
		if (lang === defaultLang) return metaPages;
		return metaPages.map((m) => {
			const slug = m.href.replace(/^\//, '');
			const t = transByLang[lang]?.[slug];
			return { title: t?.title ?? m.title, href: localizedHref(lang, slug), label: t?.label ?? m.label };
		});
	}

	function pageMetaFor(lang: string, slug: string) {
		const base = defaultMeta[slug];
		const t = lang !== defaultLang ? transByLang[lang]?.[slug] : undefined;
		return { title: t?.title ?? base?.title ?? '', description: t?.description ?? base?.description };
	}

	// --- servable paths -------------------------------------------------------
	function listPaths(): string[] {
		const slugs = [...defaultFiles.keys()].filter((s) => s !== '');
		// Generated tag-listing pages, one per unique tag per blog section.
		for (const m of Object.values(postMeta)) {
			for (const t of m.tags) {
				const p = `${m.section}/tags/${tagSlug(t)}`;
				if (!slugs.includes(p)) slugs.push(p);
			}
		}
		const out = ['/'];
		for (const lang of languages) {
			if (lang === defaultLang) {
				out.push(...slugs.map((s) => '/' + s));
			} else {
				out.push('/' + lang, ...slugs.map((s) => `/${lang}/${s}`));
			}
		}
		return out;
	}

	// --- link validation (replaces the prerender crawl) -----------------------
	{
		const known = new Set(listPaths());
		// Atom feeds are served by the hooks layer (not pages), so they are
		// linkable but deliberately absent from listPaths()/sitemap.
		for (const sec of blogSections) {
			for (const lang of languages) {
				known.add(localizedHref(lang, sec) + '/feed.xml');
			}
		}
		const linkRender = schema.nodes.link?.render ?? 'Link';
		const screenshotRender = schema.tags.screenshot?.render ?? 'Screenshot';
		const cardRender = schema.tags.card?.render ?? 'Card';
		const staticDirs = opts.staticDirs ?? ['static', 'build/client'];
		// Post covers must exist, like screenshot files.
		for (const [slug, m] of Object.entries(postMeta)) {
			if (!m.cover) continue;
			const rel = m.cover.replace(/^\//, '');
			if (!staticDirs.some((d) => existsSync(join(d, rel)))) {
				errors.push({
					file: defaultFiles.get(slug)?.shortPath ?? slug,
					message: `cover "${m.cover}" not found under static/`
				});
			}
		}
		for (const f of files) {
			(function walk(n: unknown): void {
				if (Array.isArray(n)) return n.forEach(walk);
				if (!n || typeof n !== 'object') return;
				const tag = n as {
					name?: string;
					attributes?: Record<string, unknown>;
					children?: unknown;
				};
					// A {% card icon="<svg…>" %} is rendered verbatim ({@html}) —
					// validate any inline-SVG icon fail-closed, like frontmatter icons.
					if (tag.name === cardRender && looksLikeInlineSvg(tag.attributes?.icon as string)) {
						const reason = validateSvgIcon(String(tag.attributes!.icon));
						if (reason) {
							errors.push({ file: f.shortPath, message: `unsafe inline-SVG card icon: ${reason}` });
						}
					}
					if (tag.name === screenshotRender) {
					// A screenshot pointing at a missing file fails validation.
					// Block-style srcs are bare names under static/screenshots/;
					// implicit markdown images carry full paths (static/ or
					// content-relative, already resolved); web URLs are skipped.
					for (const attr of ['src', 'dark'] as const) {
						const value = tag.attributes?.[attr];
						if (typeof value !== 'string' || !value || /^[a-z]+:/i.test(value)) continue;
						const rels = value.startsWith('/')
							? [value.slice(1)]
							: ['screenshots/' + value];
						const dirs = [...staticDirs, opts.contentDir];
						if (!dirs.some((d) => rels.some((r) => existsSync(join(d, r))))) {
							errors.push({
								file: f.shortPath,
								message: `screenshot ${attr}="${value}" not found under static/ or the content directory`
							});
						}
					}
				}
				if (tag.name === linkRender) {
					const href = String(tag.attributes?.href ?? '');
					if (href.startsWith('/')) {
						const [path, anchor] = href.split('#');
						if (!known.has(path)) {
							errors.push({ file: f.shortPath, message: `dead internal link: ${href}` });
						} else if (anchor) {
							// Anchor check, with the 0.3.x policy: strict on the
							// default language, warn for /<lang>/ targets (a
							// translated heading legitimately changes its id).
							const targetLangSeg = path.split('/')[1];
							const isLangPath = languages.includes(targetLangSeg) && targetLangSeg !== defaultLang;
							const slug = isLangPath
								? path.split('/').slice(2).join('/')
								: path.replace(/^\//, '');
							const target = fileFor(isLangPath ? targetLangSeg : defaultLang, slug);
							if (target && !target.ids.has(anchor)) {
								const msg = `anchor #${anchor} not found on ${path}`;
								if (isLangPath) console.warn(`[open-docs] ${f.shortPath}: ${msg}`);
								else errors.push({ file: f.shortPath, message: msg });
							}
						}
					}
				}
				walk(tag.children);
			})(f.tree);
		}
	}

	// --- page lookup -----------------------------------------------------------
	function getPage(lang: string, slug: string): PageData | null {
		const f = fileFor(lang, slug);
		if (!f) return null;
		const meta = pageMetaFor(lang, slug);
		return {
			title: meta.title || f.fm.title || '',
			description: meta.description,
			tree: f.tree,
			post: postMeta[slug]
		};
	}

	return {
		languages,
		defaultLang,
		i18nActive,
		errors,
		getPage,
		navByLang,
		flatNavFor,
		metaPagesFor,
		pageMetaFor,
		listPaths,
		localizedHref,
		isBlogSection: (slug: string) => blogSections.has(slug),
		blogSections: () => [...blogSections],
		postsFor,
		postsByTag,
		chronoFor
	};
}
