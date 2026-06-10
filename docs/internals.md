# Code notes

This file is anchored to the codebase with docref. The fence below and
the claim under it carry content hashes of the code they reference;
`docref check` goes red the moment that code drifts, `docref refresh`
re-materializes the snippet, and the claim stays flagged until a reader
confirms the prose and runs `docref approve`.

## Heading ids for non-Latin headings

Headings that fold to nothing under ASCII (Cyrillic, CJK) cannot use a
text slug, so the anchor pass falls back to a stable content hash:

```ts docref=src/lib/server/markdown.ts#hashSlug:a6e46c4c
function hashSlug(s: string): string {
	let h = 5381;
	for (let k = 0; k < s.length; k++) h = ((h << 5) + h + s.charCodeAt(k)) >>> 0;
	return 'h' + h.toString(36);
}
```

## Footnote emission is block-form on purpose

<!-- docref: begin src=src/lib/server/markdown.ts#@footnote-block-form:7ef1a2b2 -->
Footnote tags must be emitted in block form, with the open tag, the
body, and the close tag on separate lines. A single-line tag counts as
an inline tag to Markdoc and gets wrapped in a paragraph, which puts an
`<li>` inside a `<p>`; browsers repair that markup and hydration then
trips over the repair. This is the v0.6.1 fix and must not regress.

```ts docref=src/lib/server/markdown.ts#@footnote-block-form:7ef1a2b2
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
```
<!-- docref: end -->
