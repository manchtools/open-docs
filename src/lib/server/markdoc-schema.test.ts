import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildSchemaFromRegistry } from './markdoc-schema';

// Contract: the runtime Markdoc schema is generated from the SAME source
// of truth as the old build pipeline — the export registries
// (tags.svelte / nodes.svelte) plus each component's $props(). A new
// export or a new prop must appear in the schema with no manual step;
// a prop without a default is a REQUIRED attribute (matching the
// preprocessor's behavior that content relies on today).

const TAGS = 'src/lib/markdoc/tags.svelte';
const NODES = 'src/lib/markdoc/nodes.svelte';

// Discover the expected names from the registry files themselves (the
// test must not carry its own component list, which would go stale).
// Comments are stripped first — the registry's doc comment illustrates the
// export syntax and must not count as an export.
function exportedNames(file: string): string[] {
	const raw = readFileSync(file, 'utf8')
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/\/\/[^\n]*/g, '');
	const out: string[] = [];
	for (const m of raw.matchAll(/export\s*\{\s*default\s+as\s+(\w+)\s*\}/g)) {
		out.push(m[1]);
	}
	return out;
}

describe('buildSchemaFromRegistry', () => {
	const schema = buildSchemaFromRegistry(TAGS, NODES);

	it('covers exactly the tag registry (self-discovering, lowercased)', () => {
		const expected = exportedNames(TAGS).map((n) => n.toLowerCase());
		expect(expected.length).toBeGreaterThan(0); // guard: never match zero
		expect(Object.keys(schema.tags).sort()).toEqual([...expected].sort());
	});

	it('covers exactly the node registry, mapped to real Markdoc node types', () => {
		const expected = exportedNames(NODES).map((n) => n.toLowerCase());
		expect(expected.length).toBeGreaterThan(0);
		expect(Object.keys(schema.nodes).sort()).toEqual([...expected].sort());
	});

	it('keeps each tag pointing at its component (render = export name)', () => {
		expect(schema.tags.callout.render).toBe('Callout');
		expect(schema.tags.filetree.render).toBe('FileTree');
	});

	it('marks props without defaults as required attributes', () => {
		// Design intent: `tabs` cannot render without its labels list, and a
		// screenshot without src/alt is meaningless — those props carry no
		// default in the component, so the schema must demand them.
		expect(schema.tags.tabs.attributes.labels).toEqual({ required: true });
		expect(schema.tags.screenshot.attributes.src).toEqual({ required: true });
		expect(schema.tags.screenshot.attributes.alt).toEqual({ required: true });
	});

	it('marks props with defaults as optional attributes', () => {
		expect(schema.tags.callout.attributes.type).toEqual({ required: false });
		expect(schema.tags.callout.attributes.title).toEqual({ required: false });
		// span = '' exists precisely so the preprocessor treats it optional —
		// the runtime schema must preserve that.
		expect(schema.tags.column.attributes.span).toEqual({ required: false });
	});

	it('matches the reference docs on card and tabs optionality', () => {
		// markdoc-tags reference: card takes a required `title` with optional
		// `href`/`icon`; `tabs initial` "defaults to the first" tab.
		expect(schema.tags.card.attributes.title).toEqual({ required: true });
		expect(schema.tags.card.attributes.href).toEqual({ required: false });
		expect(schema.tags.card.attributes.icon).toEqual({ required: false });
		expect(schema.tags.tabs.attributes.initial).toEqual({ required: false });
	});

	it('never exposes the children snippet as an attribute', () => {
		for (const [name, tag] of Object.entries(schema.tags)) {
			expect(tag.attributes.children, `tag ${name}`).toBeUndefined();
		}
	});

	it('rejects a node export that has no Markdoc node type (fail closed)', () => {
		// "Bogus" is not a Markdoc node — wiring it must fail loudly at
		// schema-build time, not silently drop the override.
		expect(() =>
			buildSchemaFromRegistry(TAGS, 'src/lib/server/__fixtures__/bad-nodes.svelte')
		).toThrow(/bogus/i);
	});

	it('rejects an unreadable registry file (fail closed)', () => {
		expect(() => buildSchemaFromRegistry(TAGS, '/tmp/nonexistent-nodes.svelte')).toThrow();
	});
});
