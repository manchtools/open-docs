import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

// Serves the operator's optional theme.css from the content directory at
// runtime (0.3.x bundled it at build time). The layout injects the <link>
// only when the file exists, so a 404 here is just a stale client.
export function GET() {
	const dirs = [env.OPEN_DOCS_CONTENT, 'src/content'].filter(Boolean) as string[];
	for (const dir of dirs) {
		const file = join(dir, 'theme.css');
		if (existsSync(file)) {
			return new Response(readFileSync(file, 'utf8'), {
				headers: { 'content-type': 'text/css; charset=utf-8', 'cache-control': 'no-cache' }
			});
		}
	}
	throw error(404, 'no theme.css in the content directory');
}
