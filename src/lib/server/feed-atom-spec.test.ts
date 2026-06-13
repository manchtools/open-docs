import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createContentStore } from './content-store';
import { buildAtomFeed } from './feed';

// W3C / RFC 4287 Atom 1.0 conformance. Two passes, run against the REAL
// generated feeds:
//   1. `xmllint --relaxng` against the normative Atom RELAX NG grammar
//      (RFC 4287, shipped as __fixtures__/atom.rng) — the same grammar the
//      W3C Feed Validator enforces structurally. This catches wrong
//      cardinality, misplaced elements, bad namespaces.
//   2. A TS conformance pass for the normative MUSTs a grammar can't express:
//      RFC3339 timestamps, absolute-IRI ids, and the "no content ⇒ summary"
//      rule. A self-test (a feed with its <id> removed) proves the pass
//      actually rejects.
// A feed is only syndication-ready (absolute ids) with PUBLIC_SITE_URL set,
// so conformance is asserted on that configuration.

const SITE = 'https://docs.example.com';
const store = createContentStore({
	contentDir: 'src/lib/server/__fixtures__/content',
	defaultLang: 'en',
	staticDirs: ['src/lib/server/__fixtures__/static-ok']
});

const RNG = fileURLToPath(new URL('./__fixtures__/atom.rng', import.meta.url));

function xmllintAvailable(): boolean {
	try {
		execFileSync('xmllint', ['--version'], { stdio: 'ignore' });
		return true;
	} catch {
		return false;
	}
}
const HAS_XMLLINT = xmllintAvailable();

/** Validate `xml` against the Atom RELAX NG schema with xmllint. */
function relaxng(xml: string): { ok: boolean; out: string } {
	const dir = mkdtempSync(join(tmpdir(), 'od-feed-'));
	const file = join(dir, 'feed.xml');
	writeFileSync(file, xml);
	try {
		execFileSync('xmllint', ['--noout', '--relaxng', RNG, file], { stdio: 'pipe' });
		return { ok: true, out: '' };
	} catch (e) {
		const err = e as { stderr?: Buffer; stdout?: Buffer };
		return { ok: false, out: String(err.stderr ?? err.stdout ?? e) };
	}
}

const RFC3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

/** RFC 4287 conformance MUSTs not captured by the grammar. Returns the list
 *  of violations ([] === conformant). CDATA/comments are masked first so the
 *  article HTML can't be mistaken for feed structure. */
function rfc4287Violations(xml: string): string[] {
	const e: string[] = [];
	const x = xml.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '').replace(/<!--[\s\S]*?-->/g, '');
	const tagCount = (s: string, t: string) => (s.match(new RegExp(`<${t}(?:\\s[^>]*)?>`, 'g')) ?? []).length;
	const firstText = (s: string, t: string) => {
		const m = s.match(new RegExp(`<${t}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${t}>`));
		return m ? m[1].trim() : null;
	};

	const feedOpen = x.match(/<feed\b[^>]*>/);
	if (!feedOpen) return ['no <feed> root element'];
	if (!/\sxmlns="http:\/\/www\.w3\.org\/2005\/Atom"/.test(feedOpen[0])) e.push('feed is not in the Atom namespace');

	const entriesAt = x.indexOf('<entry>');
	const head = entriesAt === -1 ? x : x.slice(0, entriesAt);
	for (const t of ['id', 'title', 'updated']) {
		const n = tagCount(head, t);
		if (n !== 1) e.push(`feed MUST have exactly one <${t}> (found ${n})`); // RFC 4287 §4.1.1
	}
	const fu = firstText(head, 'updated');
	if (fu && !RFC3339.test(fu)) e.push(`feed <updated> is not an RFC3339 date: "${fu}"`);

	const entries = [...x.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => m[1]);
	let everyEntryHasAuthor = entries.length > 0;
	entries.forEach((entry, i) => {
		for (const t of ['id', 'title', 'updated']) {
			const n = tagCount(entry, t);
			if (n !== 1) e.push(`entry ${i} MUST have exactly one <${t}> (found ${n})`); // §4.1.2
		}
		const up = firstText(entry, 'updated');
		if (up && !RFC3339.test(up)) e.push(`entry ${i} <updated> is not RFC3339: "${up}"`);
		const pub = firstText(entry, 'published');
		if (pub && !RFC3339.test(pub)) e.push(`entry ${i} <published> is not RFC3339: "${pub}"`);
		const id = firstText(entry, 'id') ?? '';
		if (id && !/^[a-z][a-z0-9+.-]*:/i.test(id)) e.push(`entry ${i} <id> MUST be an absolute IRI: "${id}"`); // §4.2.6
		if (tagCount(entry, 'content') === 0 && tagCount(entry, 'summary') === 0) {
			e.push(`entry ${i} with no <content> MUST carry a <summary>`); // §4.1.2
		}
		if (!/<author>\s*<name>/.test(entry)) everyEntryHasAuthor = false;
	});

	// §4.1.1: a feed MUST have an author unless every entry (or its source) does.
	if (!/<author>\s*<name>/.test(head) && !everyEntryHasAuthor) {
		e.push('feed MUST carry an <author> unless every entry does');
	}
	return e;
}

const feedFor = (lang: string, section: string, basePath = '') =>
	buildAtomFeed({ store, siteTitle: 'open-docs', lang, section, siteUrl: SITE, basePath })!;

describe('Atom 1.0 (RFC 4287) conformance', () => {
	it('xmllint is available for the W3C-grade validator pass', () => {
		// The RELAX NG pass needs libxml2-utils. Install it to enforce the
		// grammar pass (the TS conformance pass below runs regardless).
		expect(HAS_XMLLINT, 'install `libxml2-utils` (provides xmllint) to run the Atom RELAX NG validation').toBe(true);
	});

	for (const [lang, section] of [
		['en', 'blog'],
		['de', 'blog'],
		['en', 'news']
	] as const) {
		it(`${lang}/${section} validates against the normative Atom RELAX NG grammar`, () => {
			const xml = feedFor(lang, section);
			const r = relaxng(xml);
			expect(r.ok, r.out).toBe(true);
		});

		it(`${lang}/${section} satisfies the RFC 4287 MUSTs (dates, absolute ids, content/summary)`, () => {
			expect(rfc4287Violations(feedFor(lang, section))).toEqual([]);
		});
	}

	it('stays conformant under BASE_PATH', () => {
		const xml = feedFor('en', 'blog', '/docs');
		expect(relaxng(xml).ok, relaxng(xml).out).toBe(true);
		expect(rfc4287Violations(xml)).toEqual([]);
	});

	it('the validator pass actually rejects — a feed missing the feed <id> fails both checks', () => {
		// Remove the first <id> (the feed-level one); entries keep theirs.
		const broken = feedFor('en', 'blog').replace(/[ \t]*<id>[^<]*<\/id>\n?/, '');
		expect(rfc4287Violations(broken)).not.toEqual([]);
		expect(relaxng(broken).ok).toBe(false);
	});
});
