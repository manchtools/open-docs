// The server's content-store singleton. Wires the runtime environment
// (content dir, default language, tokens) into createContentStore, fails
// closed on validation errors in production, and — in dev — rebuilds the
// store when the content directory changes so authoring hot-reloads.

import { readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { createContentStore, type ContentStore } from './content-store';
import type { RegistrySchema } from './markdoc-schema';
import schemaJson from '../markdoc/schema.json';

// Content lives in src/content by default (dev + the image's bundled
// docs); the container points OPEN_DOCS_CONTENT at the /content mount, so
// operator content is read in place — no copy, no rebuild.
function contentDir(): string {
	const mounted = env.OPEN_DOCS_CONTENT;
	if (mounted && existsSync(mounted) && readdirSync(mounted).length > 0) return mounted;
	return 'src/content';
}

// Cheap change fingerprint for dev hot-reload: newest mtime + file count.
function fingerprint(dir: string): string {
	let newest = 0;
	let count = 0;
	let entries: import('node:fs').Dirent[] = [];
	try {
		entries = readdirSync(dir, { recursive: true, withFileTypes: true });
	} catch {
		return 'missing';
	}
	for (const e of entries) {
		if (!e.isFile()) continue;
		count++;
		try {
			const m = statSync(join(e.parentPath ?? dir, e.name)).mtimeMs;
			if (m > newest) newest = m;
		} catch {
			// raced a delete — the count still changes the fingerprint
		}
	}
	return `${count}:${newest}`;
}

let cached: ContentStore | null = null;
let cachedPrint = '';

export function getStore(): ContentStore {
	const dir = contentDir();
	if (dev) {
		const print = `${dir}|${fingerprint(dir)}`;
		if (!cached || cachedPrint !== print) {
			cached = build(dir);
			cachedPrint = print;
		}
		return cached;
	}
	if (!cached) cached = build(dir);
	return cached;
}

function build(dir: string): ContentStore {
	const store = createContentStore({
		contentDir: dir,
		// docref: begin default-lang
		defaultLang: (env.PUBLIC_DEFAULT_LANG || 'en').trim().toLowerCase(),
		// docref: end default-lang
		schema: schemaJson as RegistrySchema,
		// Screenshot files may live in the repo's static/ (dev), the served
		// client dir (container, after the entrypoint merge), or the raw
		// /static mount.
		// docref: begin static-dir
		staticDirs: [env.OPEN_DOCS_STATIC, 'static', 'build/client'].filter(
			(d): d is string => !!d
		),
		// docref: end static-dir
		// Drafts (`draft: true` posts) render in dev, never in production.
		includeDrafts: dev
	});

	if (store.errors.length > 0) {
		const listing = store.errors
			.map((e) => `  ${e.file}${e.line ? ':' + e.line : ''}  ${e.message}`)
			.join('\n');
		if (dev) {
			console.error(`[open-docs] content validation errors:\n${listing}`);
		} else {
			// Fail closed in production, like the old build did — a container
			// must not come up serving silently broken content.
			throw new Error(`[open-docs] content validation failed:\n${listing}`);
		}
	}
	// One unambiguous line about what is actually being served — the
	// answer to "is this my content or the bundled docs?".
	console.log(
		`[open-docs] content source: ${dir} — ${store.listPaths().length} pages, languages: ${store.languages.join(', ')}`
	);
	return store;
}
