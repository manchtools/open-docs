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

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import Markdoc, { type RenderableTreeNode } from '@markdoc/markdoc';
import { cleanSlug, stripPrefix, titleFromSegment } from '../slug';
import { slugLang, pickLanguages, hrefFor } from '../i18n';
import type { NavItem, NavNode } from '../nav-core';
import { applyHeadingAnchors } from './markdown';
import { buildSchemaFromRegistry, type RegistrySchema } from './markdoc-schema';
import { applyTokens, buildTokenMap } from '../../../scripts/tokens.js';

export type PageData = {
	title: string;
	description?: string;
	tree: RenderableTreeNode;
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
};

type Options = {
	contentDir: string;
	defaultLang?: string;
	schema?: RegistrySchema;
	tokens?: Record<string, string>;
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
	for (const entry of entries) {
		if (!entry.isFile() || !/\.(md|markdoc)$/.test(entry.name)) continue;
		const dir = entry.parentPath ?? opts.contentDir;
		const abs = join(dir, entry.name);
		const rel = abs.slice(join(opts.contentDir, '/').length).replaceAll('\\', '/');
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
		nodes: Object.fromEntries(
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

	const files: FileData[] = [];
	for (const [virtualPath, original] of sources) {
		const shortPath = virtualPath.replace('/src/content/', '');
		const { lang, slug } = slugLang(virtualPath, defaultLang);
		const fm = frontmatter(original);
		const raw = applyHeadingAnchors(applyTokens(original, tokens));
		const ast = Markdoc.parse(raw);
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
		byLang.get(f.lang)!.set(f.slug, f);
	}
	const defaultFiles = byLang.get(defaultLang) ?? new Map<string, FileData>();

	function fileFor(lang: string, slug: string): FileData | null {
		return byLang.get(lang)?.get(slug) ?? defaultFiles.get(slug) ?? null;
	}

	// --- nav tree (default language defines the structure) ------------------
	const metaRaw: { title: string; href: string; label?: string; order: number }[] = [];

	function buildTree(): NavNode[] {
		const root: BuildNode = { title: '', order: FALLBACK, children: new Map() };

		for (const f of defaultFiles.values()) {
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
				root.children.set('pg:__landing__', {
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
				order: orderOf(fm, fileSegment) ?? (isIndex ? Number.NEGATIVE_INFINITY : FALLBACK),
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

	function flatNavFor(lang: string): NavItem[] {
		return flatten(navByLang(lang));
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
		const linkRender = schema.nodes.link?.render ?? 'Link';
		for (const f of files) {
			(function walk(n: unknown): void {
				if (Array.isArray(n)) return n.forEach(walk);
				if (!n || typeof n !== 'object') return;
				const tag = n as {
					name?: string;
					attributes?: Record<string, unknown>;
					children?: unknown;
				};
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
			tree: f.tree
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
		localizedHref
	};
}
