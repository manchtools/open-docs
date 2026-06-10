// Markdown source passes that run BEFORE Markdoc parsing, at runtime.
// (0.4.0 moved these out of svelte.config.js preprocessors — content is no
// longer compiled by Vite, it's parsed at container boot.)

import GithubSlugger from 'github-slugger';

// Stable djb2 hash → short base36 id. Slug fallback for headings that fold
// to nothing under ASCII (Cyrillic, CJK, …), so the id is always a unique,
// valid ASCII identifier and content in any script keeps working.
function hashSlug(s: string): string {
	let h = 5381;
	for (let k = 0; k < s.length; k++) h = ((h << 5) + h + s.charCodeAt(k)) >>> 0;
	return 'h' + h.toString(36);
}

/**
 * Heading anchors. Markdoc's default heading node carries only the level,
 * so without help every <h2>/<h3> renders id-less and the on-page TOC
 * (which queries `h2[id]`) stays empty. Inject a Markdoc id annotation
 * (`{% #slug %}`) onto each ATX heading, slugging the visible text with
 * github-slugger (GitHub-compatible, deduped per file).
 *
 * Skips anything inside fenced code blocks, so `# comment` lines in
 * examples are left alone. An author can still pin a custom id by writing
 * their own `{% #my-id %}` — never overwritten. Non-ASCII text is folded
 * (ä→a, é→e, ß→ss); fully non-Latin headings fall back to a stable hash.
 */
export function applyHeadingAnchors(content: string): string {
	const slugger = new GithubSlugger();
	const lines = content.split('\n');
	let fenceChar = ''; // '`' or '~' of the open fence; '' when outside
	let fenceLen = 0; // open-fence length, so nested fences don't mis-close
	let changed = false;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// Track fenced code. A fence closes only on the same character and
		// an equal-or-longer run, which keeps a 3-backtick block nested
		// inside a 4-backtick block from closing it early.
		const fence = /^\s*(`{3,}|~{3,})/.exec(line);
		if (fence) {
			const char = fence[1][0];
			const len = fence[1].length;
			if (!fenceChar) {
				fenceChar = char;
				fenceLen = len;
			} else if (char === fenceChar && len >= fenceLen) {
				fenceChar = '';
				fenceLen = 0;
			}
			continue;
		}
		if (fenceChar) continue;

		const heading = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
		if (!heading) continue;

		const [, hashes, rawText] = heading;
		// Leave author-pinned ids (or any existing annotation) alone.
		if (rawText.includes('{%')) continue;

		// Drop ATX closing hashes, then strip inline markdown so the slug
		// reads from the visible words (`code`, **bold**, [links]).
		const text = rawText.replace(/\s+#+\s*$/, '');
		const plain = text
			.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
			.replace(/[`*_~]/g, '')
			.trim();

		// ASCII-fold before slugging: a `{% #id %}` annotation only accepts
		// an ASCII identifier. Decompose + strip diacritics, expand ß→ss,
		// drop anything still non-ASCII; hash-fall back if nothing is left.
		const ascii = plain
			.normalize('NFKD')
			.replace(/[̀-ͯ]/g, '')
			.replace(/ß/g, 'ss')
			.replace(/[^\x00-\x7F]/g, '')
			.trim();

		lines[i] = `${hashes} ${text} {% #${slugger.slug(ascii || hashSlug(plain))} %}`;
		changed = true;
	}

	return changed ? lines.join('\n') : content;
}

/**
 * Strip HTML comments outside code fences. Comments are author notes
 * (review remarks, disabled snippets) — rendering them as literal text
 * would leak them onto the page, and HTML is never rendered here.
 */
export function stripHtmlComments(content: string): string {
	const lines = content.split('\n');
	let fenceChar = '';
	let fenceLen = 0;
	let inComment = false;
	let changed = false;
	const out: string[] = [];

	for (const line of lines) {
		const fence = /^\s*(`{3,}|~{3,})/.exec(line);
		if (fence && !inComment) {
			const char = fence[1][0];
			const len = fence[1].length;
			if (!fenceChar) {
				fenceChar = char;
				fenceLen = len;
			} else if (char === fenceChar && len >= fenceLen) {
				fenceChar = '';
				fenceLen = 0;
			}
			out.push(line);
			continue;
		}
		if (fenceChar) {
			out.push(line);
			continue;
		}

		let rest = line;
		let kept = '';
		for (;;) {
			if (inComment) {
				const end = rest.indexOf('-->');
				if (end === -1) {
					rest = '';
					break;
				}
				rest = rest.slice(end + 3);
				inComment = false;
				changed = true;
			}
			const start = rest.indexOf('<!--');
			if (start === -1) {
				kept += rest;
				break;
			}
			kept += rest.slice(0, start);
			rest = rest.slice(start + 4);
			inComment = true;
			changed = true;
		}
		// Drop lines that were nothing but comment; keep partial lines.
		if (kept !== '' || !changed || line.trim() === '' || kept.trim() !== '') {
			if (!(kept === '' && line.trim().startsWith('<!--'))) out.push(kept === '' ? line : kept);
			else if (kept !== '') out.push(kept);
		}
	}

	return changed ? out.join('\n') : content;
}

/**
 * GFM footnotes as a source pass (like heading anchors). References
 * `[^id]` become `{% footnoteref %}` tags numbered by first appearance;
 * definition lines `[^id]: text` are collected, removed, and re-emitted
 * at the end of the page inside a `{% footnotes %}` block, keeping the
 * definition's inline markdown. Fenced code is untouched; references
 * without a definition stay literal.
 */
export function applyFootnotes(content: string): string {
	const lines = content.split('\n');
	const defs = new Map<string, string>();
	let fenceChar = '';
	let fenceLen = 0;

	// Pass 1: collect + remove definitions (outside fences).
	const body: string[] = [];
	for (const line of lines) {
		const fence = /^\s*(`{3,}|~{3,})/.exec(line);
		if (fence) {
			const char = fence[1][0];
			const len = fence[1].length;
			if (!fenceChar) {
				fenceChar = char;
				fenceLen = len;
			} else if (char === fenceChar && len >= fenceLen) {
				fenceChar = '';
				fenceLen = 0;
			}
			body.push(line);
			continue;
		}
		if (fenceChar) {
			body.push(line);
			continue;
		}
		const def = /^\[\^([^\]\s]+)\]:\s+(.*)$/.exec(line);
		if (def) {
			defs.set(def[1], def[2]);
			continue;
		}
		body.push(line);
	}
	if (defs.size === 0) return content;

	// Pass 2: replace references (outside fences) numbered by appearance.
	const order: string[] = [];
	fenceChar = '';
	fenceLen = 0;
	const replaced = body.map((line) => {
		const fence = /^\s*(`{3,}|~{3,})/.exec(line);
		if (fence) {
			const char = fence[1][0];
			const len = fence[1].length;
			if (!fenceChar) {
				fenceChar = char;
				fenceLen = len;
			} else if (char === fenceChar && len >= fenceLen) {
				fenceChar = '';
				fenceLen = 0;
			}
			return line;
		}
		if (fenceChar) return line;
		return line.replace(/\[\^([^\]\s]+)\]/g, (whole, id: string) => {
			if (!defs.has(id)) return whole;
			if (!order.includes(id)) order.push(id);
			return `{% footnoteref n=${order.indexOf(id) + 1} id="${id}" /%}`;
		});
	});
	if (order.length === 0) return content;

	// docref: begin footnote-block-form
	// Block form (open/body/close on separate lines) is required: a
	// single-line tag is an INLINE tag to Markdoc and would be wrapped in
	// a paragraph — putting the <li> inside a <p>, which browsers repair
	// and hydration then trips over.
	const section = [
		'',
		'{% footnotes %}',
		...order.flatMap((id) => [
			`{% footnote id="${id}" n=${order.indexOf(id) + 1} %}`,
			defs.get(id) ?? '',
			'{% /footnote %}'
		]),
		'{% /footnotes %}',
		''
	];
	// docref: end footnote-block-form
	return replaced.join('\n') + section.join('\n');
}
