// URL safety for author-supplied link targets. Author content (markdown
// links, {% card href %}, {% avatar url %}, {% quote cite %}) becomes a real
// <a href>; a `javascript:` / `data:` / `vbscript:` URL there is click-to-XSS.
// These helpers gate the href down to schemes that are safe to navigate to.
//
// The match mirrors how a browser resolves a scheme, so an obfuscated scheme
// can't slip past: the URL parser strips ASCII TAB/LF/CR from anywhere and
// ignores leading C0-control/space bytes before reading the scheme — so
// "java\tscript:", "javascript:" and "  JavaScript:" all resolve to the
// javascript scheme. We normalise the same way before testing.

// Schemes that are safe to put in an href. NOT data:/blob:/javascript:/
// vbscript:/file: (these execute script or load attacker-controlled content).
const SAFE_SCHEMES = new Set(['http', 'https', 'mailto', 'tel']);

/**
 * True when `raw` is safe to use as an <a href> / link target. A value with
 * no scheme (site-root `/x`, relative `x`, anchor `#x`, query `?x`, or
 * protocol-relative `//host`) is safe — it can't execute script. A value WITH
 * a scheme is safe only if the scheme is in the allow-list.
 *
 * `null`/`undefined` is treated as safe (there is nothing to render; the
 * caller decides whether to emit a link at all).
 */
export function isSafeUrl(raw: string | null | undefined): boolean {
	if (raw == null) return true;
	const s = raw.replace(/[\t\n\r]/g, '').replace(/^[\x00-\x20]+/, '');
	const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(s);
	if (!scheme) return true; // no scheme → relative/anchor/protocol-relative
	return SAFE_SCHEMES.has(scheme[1].toLowerCase());
}

/**
 * The href to render: the value when it is safe, otherwise `undefined` so the
 * caller omits the attribute entirely (an inert `<a>` rather than a live
 * `javascript:` link).
 */
export function safeHref(href: string | null | undefined): string | undefined {
	return href != null && isSafeUrl(href) ? href : undefined;
}
