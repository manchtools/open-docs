import { createReadStream } from 'node:fs';
import { Readable } from 'node:stream';
import { resolve } from 'node:path';
import { error } from '@sveltejs/kit';
import { resolveFileWithin } from '$lib/server/safe-path';

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
	// Traversal- and symlink-guarded resolution: stay inside the index dir.
	const target = resolveFileWithin(ROOT, params.file);
	if (!target) throw error(404, 'not indexed yet');
	const ext = target.slice(target.lastIndexOf('.'));
	return new Response(Readable.toWeb(createReadStream(target)) as ReadableStream, {
		headers: {
			'content-type': MIME[ext] ?? 'application/octet-stream',
			'cache-control': 'no-cache'
		}
	});
}
