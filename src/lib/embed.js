// Shared {% embed %} URL normalisation. Imported by both the Embed
// component (to build the iframe `src`) and svelte.config.js (to derive
// the CSP `frame-src` from the embeds actually present in the content),
// so the two can never disagree about which origin an embed resolves to.
//
// Plain JS on purpose: svelte.config.js is evaluated by Node before the
// TS pipeline runs, so it can only import a .js module.

/**
 * Normalise a user-supplied embed URL to its iframe `src`. YouTube and Vimeo
 * watch/share links become their privacy-friendly embed form; any other
 * http(s) URL passes through unchanged.
 *
 * Returns '' for anything that is NOT an http(s) URL — a `javascript:`,
 * `data:` or other-scheme value in an iframe `src` is a stored-XSS sink, so
 * it must never reach the component. The caller renders a fallback for ''.
 *
 * @param {string} raw
 * @returns {string}
 */
export function toEmbedSrc(raw) {
	let url;
	try {
		url = new URL(raw);
	} catch {
		return ''; // not an absolute URL — nothing safe to frame
	}
	if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
	const host = url.hostname.replace(/^www\./, '');
	if (host === 'youtube.com' && url.searchParams.get('v'))
		return `https://www.youtube-nocookie.com/embed/${url.searchParams.get('v')}`;
	if (host === 'youtu.be') return `https://www.youtube-nocookie.com/embed/${url.pathname.slice(1)}`;
	if (host === 'vimeo.com' && /^\/\d+$/.test(url.pathname))
		return `https://player.vimeo.com/video/${url.pathname.slice(1)}`;
	return url.href;
}
