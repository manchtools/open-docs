// Pre-bundle the heavy, lazily-loaded client libraries (Mermaid, Shiki)
// into static/vendor/ with esbuild, OUTSIDE the Vite build.
//
// Why: Vite/Rollup holds every module of the build graph in memory.
// Mermaid (+d3) and Shiki (632 grammars) account for roughly a quarter of
// the build's ~2 GB peak even though they are runtime-only, lazy-loaded,
// and content-independent. esbuild (Go) bundles them in seconds with a
// few hundred MB, and CodeBlock.svelte loads them at runtime from
// `/vendor/...` — so Vite never sees them and the main build gets
// noticeably lighter. Code-splitting is preserved: Shiki grammars and
// Mermaid diagram renderers stay lazy chunks fetched on demand.
//
// Runs automatically before `bun run dev` and `bun run build` (see
// package.json); skips itself when the output is already fresh for the
// installed package versions.

import { build } from 'esbuild';
import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';

const OUT = 'static/vendor';
const STAMP = `${OUT}/.versions.json`;

function pkgVersion(name: string): string {
	return JSON.parse(readFileSync(`node_modules/${name}/package.json`, 'utf8')).version as string;
}

const versions = {
	mermaid: pkgVersion('mermaid'),
	shiki: pkgVersion('shiki'),
	'@shikijs/transformers': pkgVersion('@shikijs/transformers'),
	esbuild: pkgVersion('esbuild')
};

if (existsSync(STAMP)) {
	try {
		if (JSON.stringify(JSON.parse(readFileSync(STAMP, 'utf8'))) === JSON.stringify(versions)) {
			console.log('[vendor] static/vendor up to date — skipping');
			process.exit(0);
		}
	} catch {
		// unreadable stamp → rebuild
	}
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

await build({
	entryPoints: {
		mermaid: 'mermaid',
		shiki: 'shiki',
		'shiki-transformers': '@shikijs/transformers'
	},
	bundle: true,
	splitting: true,
	format: 'esm',
	platform: 'browser',
	target: 'es2022',
	minify: true,
	outdir: OUT,
	entryNames: '[name]',
	chunkNames: 'chunks/[name]-[hash]',
	outExtension: { '.js': '.mjs' },
	logLevel: 'warning'
});

writeFileSync(STAMP, JSON.stringify(versions, null, '\t') + '\n');
console.log('[vendor] bundled mermaid + shiki into static/vendor/');
