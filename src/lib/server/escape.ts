// Shared XML/HTML text escaping for the server-rendered, hand-built markup:
// Atom feeds (feed.ts), the feed render profile (feed-render.ts), and the
// sitemap (routes/sitemap.xml). Centralised so the escaping rule can never
// drift between the places that emit XML — a single sequence to audit.
//
// Two contexts:
//   - element text: `&`, `<`, `>` must be entities (a stray `&` or `<` is
//     malformed XML; a `>` is escaped too, matching the prior feed builder).
//   - attribute values (double-quoted): the above plus `"`.
// We never emit single-quoted attributes, so `'` is intentionally left as-is.

/** Escape a string for XML/HTML *element text* content. */
export const escapeXmlText = (s: string): string =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Escape a string for a double-quoted XML/HTML *attribute* value. */
export const escapeXmlAttr = (s: string): string => escapeXmlText(s).replace(/"/g, '&quot;');
