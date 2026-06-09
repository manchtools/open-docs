// Build-time helper: derive the CSP `frame-src` allow-list from the
// {% embed %} blocks present in the content, so the iframe allow-list is
// exactly as wide as the content needs — with no host list to maintain.
//
// Why it runs at config-load time rather than "in the pipeline":
// SvelteKit resolves `kit.csp` once and stamps the resulting CSP into
// every prerendered HTML file during the build. Nothing later in the
// pipeline can edit an already-emitted CSP, so the allow-list has to be
// known up front. This module keeps that logic out of svelte.config.js
// (and out of the browser-safe embed helper, since it touches node:fs).
//
// {{TOKEN}} embed URLs (PUBLIC_TOKEN_*) are resolved with the same
// substitution the build uses, so even token-injected embeds derive their
// host automatically — there is nothing for an operator to configure.

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { toEmbedSrc } from '../src/lib/embed.js';
import { buildTokenMap, applyTokens } from './tokens.js';

const EMBED_TAG = /\{%\s*embed\b[\s\S]*?%\}/g;
const SRC_ATTR = /\bsrc\s*=\s*["']([^"']+)["']/;

/**
 * Collect the unique iframe origins to allow in `frame-src` — every host
 * the {% embed %} blocks in the content resolve to (after token
 * substitution and the component's URL normalisation).
 *
 * @param {string} [contentDir]
 * @returns {string[]}
 */
export function deriveFrameSrc(contentDir = 'src/content') {
	const tokens = buildTokenMap();
	const hosts = new Set();

	let entries;
	try {
		entries = readdirSync(contentDir, { recursive: true, withFileTypes: true });
	} catch {
		return [];
	}

	for (const entry of entries) {
		if (!entry.isFile() || !/\.(md|markdoc)$/.test(entry.name)) continue;
		const dir = entry.parentPath ?? contentDir;
		let text;
		try {
			text = readFileSync(join(dir, entry.name), 'utf8');
		} catch {
			continue;
		}
		// Resolve {{TOKEN}} placeholders exactly as the build will, so a
		// token-injected embed URL derives its real host.
		text = applyTokens(text, tokens);
		for (const tag of text.match(EMBED_TAG) ?? []) {
			const m = SRC_ATTR.exec(tag);
			if (!m) continue;
			try {
				hosts.add(new URL(toEmbedSrc(m[1])).origin);
			} catch {
				/* still not a static URL (e.g. an unset token) — skip */
			}
		}
	}

	return [...hosts];
}
