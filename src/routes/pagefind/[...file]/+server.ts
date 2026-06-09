import { createReadStream, existsSync, statSync } from 'node:fs';
import { Readable } from 'node:stream';
import { join, resolve, sep } from 'node:path';
import { error } from '@sveltejs/kit';

// Serves the Pagefind index from disk at request time. The index is
// written a few seconds AFTER the server starts (scripts/index-search.ts
// renders the live pages), and the bun adapter snapshots its static file
// list at startup — so the freshly written files would 404 until a
// restart. This route reads the directory live instead.
const ROOT = resolve('build/client/pagefind');

const MIME: Record<string, string> = {
	'.js': 'text/javascript; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.json': 'application/json',
	'.css': 'text/css; charset=utf-8',
	'.wasm': 'application/wasm'
};

export function GET({ params }: { params: { file: string } }) {
	const target = resolve(join(ROOT, params.file));
	// stay inside the index dir — no traversal
	if (!target.startsWith(ROOT + sep) || !existsSync(target) || !statSync(target).isFile()) {
		throw error(404, 'not indexed yet');
	}
	const ext = target.slice(target.lastIndexOf('.'));
	return new Response(Readable.toWeb(createReadStream(target)) as ReadableStream, {
		headers: {
			'content-type': MIME[ext] ?? 'application/octet-stream',
			'cache-control': 'no-cache'
		}
	});
}
