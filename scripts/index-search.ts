// Boot-time search indexing. Fetches every servable path from the running
// server (listed by /sitemap.xml), feeds the rendered HTML to Pagefind's
// Node API, and writes the index into build/client/pagefind — the same
// place the 0.3.x build put it, so the search UI is unchanged. Pagefind
// reads <html lang> per page, which keeps the per-language indexes.
//
// Runs at container start (seconds, ~50 MB) right after the server is up;
// until it finishes, the search dialog shows its friendly "index not
// found" message, same as dev mode.

import { createIndex } from 'pagefind';

const server = process.argv[2] ?? `http://localhost:${process.env.PORT ?? 3000}`;
const out = process.argv[3] ?? 'build/client/pagefind';
// Sub-path deploys serve everything under BASE_PATH; the sitemap lives
// there and page paths must carry the prefix (both for fetching and for
// the URLs stored in the index, which the search UI links to).
const base = (process.env.BASE_PATH ?? '').replace(/\/+$/, '');

async function waitForServer(timeoutMs = 60_000): Promise<void> {
	const t0 = Date.now();
	for (;;) {
		try {
			const res = await fetch(`${server}${base}/sitemap.xml`);
			if (res.ok) return;
		} catch {
			// not up yet
		}
		if (Date.now() - t0 > timeoutMs) throw new Error(`server at ${server} not ready`);
		await new Promise((r) => setTimeout(r, 250));
	}
}

await waitForServer();

const sitemap = await (await fetch(`${server}${base}/sitemap.xml`)).text();
const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
	// locs are absolute when PUBLIC_SITE_URL is set, path-only otherwise;
	// either way the served path must carry the base prefix.
	const p = new URL(m[1], server).pathname;
	return p.startsWith(base + '/') || p === base ? p : base + (p === '/' ? '' : p) || '/';
});
if (paths.length === 0) throw new Error('sitemap listed no pages');

const { index, errors } = await createIndex({});
if (!index) throw new Error(`pagefind: ${errors.join('; ')}`);

let added = 0;
for (const path of paths) {
	const res = await fetch(`${server}${path}`);
	if (!res.ok) {
		console.warn(`[search] skipping ${path} (HTTP ${res.status})`);
		continue;
	}
	const { errors: addErrors } = await index.addHTMLFile({
		url: path,
		content: await res.text()
	});
	for (const e of addErrors) console.warn(`[search] ${path}: ${e}`);
	added++;
}

const { errors: writeErrors } = await index.writeFiles({ outputPath: out });
for (const e of writeErrors) console.warn(`[search] write: ${e}`);
await index.deleteIndex?.();

console.log(`[search] indexed ${added}/${paths.length} pages → ${out}`);
