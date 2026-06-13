// Escaping for values embedded in the generated llms.txt markdown index.
// Page titles/descriptions (semi-trusted author frontmatter) and URLs (slugs
// that can contain parens) sit inside `[text](url)` link syntax; an
// unescaped `]` or `)` would break the link and let following text be
// misread as structure.

/** Escape text used inside a markdown link label `[…]` (CommonMark backslash). */
export const mdEscapeText = (s: string): string => s.replace(/[\\[\]]/g, (c) => '\\' + c);

/** Percent-encode the characters that would terminate a `(url)` target.
 *  (encodeURIComponent leaves parentheses untouched, so map them explicitly.) */
export const mdEscapeUrl = (s: string): string =>
	s.replace(/[()\s<>]/g, (c) => (c === '(' ? '%28' : c === ')' ? '%29' : encodeURIComponent(c)));
