// Fail-closed validator for author-supplied inline-SVG icons.
//
// Section `index.md` `icon:` frontmatter and `{% card icon="…" %}` accept an
// inline `<svg>` that the renderer prints verbatim with {@html} (Card.svelte /
// hero.svelte). That makes the icon a stored-XSS sink for any content author.
// Rather than sanitise (transform) — which has a large bypass surface — we
// VALIDATE against a strict allow-list at content-ingestion time and fail the
// boot on anything outside it, matching open-docs' "invalid content fails
// startup" model. An icon either is a plain presentational SVG or it doesn't
// ship.
//
// The allow-list is the primary control: only known presentation elements and
// attributes survive, so unknown/again-novel vectors are rejected by default.
// The explicit rejections below are redundant insurance.

// Presentational SVG elements an icon legitimately needs. NOT: script,
// foreignObject, a, use, image, iframe, style, or the SMIL animation
// elements (set/animate*) — every one is a script or external-load vector.
const ALLOWED_ELEMENTS = new Set([
	'svg', 'g', 'path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon',
	'defs', 'lineargradient', 'radialgradient', 'stop', 'clippath', 'mask',
	'title', 'desc', 'text', 'tspan', 'symbol'
]);

// Presentation attributes only. NOT: any on* handler, href/xlink:href/src
// (external load), or style (CSS-based tracking/exfil).
const ALLOWED_ATTRS = new Set([
	'id', 'class', 'role', 'focusable', 'aria-hidden', 'aria-label',
	'xmlns', 'xmlns:xlink', 'version', 'viewbox', 'preserveaspectratio',
	'width', 'height', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry',
	'dx', 'dy', 'd', 'points', 'transform', 'vector-effect',
	'fill', 'fill-rule', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-linecap',
	'stroke-linejoin', 'stroke-miterlimit', 'stroke-dasharray', 'stroke-dashoffset',
	'stroke-opacity', 'opacity', 'clip-rule', 'clip-path', 'mask',
	'offset', 'stop-color', 'stop-opacity', 'gradientunits', 'gradienttransform', 'spreadmethod',
	'font-size', 'font-family', 'font-weight', 'text-anchor', 'dominant-baseline'
]);

const MAX_LEN = 16384;

/** Does this value look like an inline SVG (vs an emoji or an image path)? */
export function looksLikeInlineSvg(value: string | undefined): boolean {
	return !!value && value.trim().toLowerCase().startsWith('<svg');
}

// Validate one tag's attribute blob. Anchored matching consumes the blob from
// the start; any leftover means we can't reason about it → reject.
function checkAttributes(blob: string): string | null {
	let rest = blob.trim();
	if (rest.endsWith('/')) rest = rest.slice(0, -1).trimEnd();
	const attrRe = /^([a-zA-Z_:][a-zA-Z0-9_:.-]*)(\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+))?\s*/;
	while (rest.length) {
		const m = attrRe.exec(rest);
		if (!m) return 'malformed attribute';
		const name = m[1].toLowerCase();
		if (name.startsWith('on')) return `event-handler attribute "${name}"`;
		if (!ALLOWED_ATTRS.has(name)) return `disallowed attribute "${name}"`;
		if (m[3]) {
			const value = m[3].replace(/^["']|["']$/g, '');
			const compact = value.replace(/[\t\n\r ]/g, '').toLowerCase();
			// A scheme that isn't http(s)/mailto/tel, or any external url(),
			// is a load/exfil vector — reject.
			const scheme = /^([a-z][a-z0-9+.-]*):/.exec(compact);
			if (scheme && !/^(https?|mailto|tel)$/.test(scheme[1])) {
				return `disallowed URL scheme in "${name}"`;
			}
			if (/url\(\s*['"]?\s*(?:https?:|\/\/|[a-z]+:)/.test(compact)) {
				return `external url() in "${name}"`;
			}
		}
		rest = rest.slice(m[0].length);
	}
	return null;
}

/**
 * Validate an inline-SVG icon. Returns `null` when safe, or a short human
 * reason when it must be rejected. Only call when {@link looksLikeInlineSvg}.
 */
export function validateSvgIcon(value: string): string | null {
	const svg = value.trim();
	if (!svg.toLowerCase().startsWith('<svg')) return 'must start with <svg';
	if (svg.length > MAX_LEN) return `too large (max ${MAX_LEN} bytes)`;

	// Comments, CDATA, doctype, processing instructions and entity references
	// are never needed in an icon and each can smuggle markup or an encoded
	// scheme past a token check — reject outright.
	if (/<!--|-->|<!\[cdata|<!doctype|<\?|&#|&[a-z]+;/i.test(svg)) {
		return 'comments, CDATA, doctype, processing instructions, or entities are not allowed';
	}

	// Walk every tag; ensure ALL of the markup is allow-listed and that no
	// stray "<" sits outside a recognised tag (fail closed on anything we
	// cannot cleanly tokenise).
	const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
	let cursor = 0;
	let m: RegExpExecArray | null;
	while ((m = tagRe.exec(svg))) {
		if (svg.slice(cursor, m.index).includes('<')) return 'malformed markup';
		cursor = tagRe.lastIndex;
		const el = m[1].toLowerCase();
		if (!ALLOWED_ELEMENTS.has(el)) return `disallowed element <${el}>`;
		const isClosing = m[0].startsWith('</');
		if (!isClosing) {
			const reason = checkAttributes(m[2]);
			if (reason) return `<${el}>: ${reason}`;
		}
	}
	if (svg.slice(cursor).includes('<')) return 'malformed markup';

	return null;
}
