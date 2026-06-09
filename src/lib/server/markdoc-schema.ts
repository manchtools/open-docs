// Markdoc schema generation — the bridge that keeps "a new component
// prop is automatically a valid Markdoc attribute" working in the runtime
// pipeline.
//
// Source of truth is unchanged from the build-time pipeline: the export
// registries (src/lib/markdoc/tags.svelte / nodes.svelte) name the tags
// and node overrides, and each component's `$props()` defines the
// attributes (a prop without a default is REQUIRED — content relies on
// this, e.g. `column.span = ''` exists to be optional). Prop extraction
// parses each component with svelte/compiler and reads the `$props()`
// destructuring, with the same required/optional semantics the old
// preprocessor applied (no default ⇒ required, `children` excluded).
//
// Runs at IMAGE build (scripts/generate-markdoc-schema.ts) → schema.json,
// which the runtime content pipeline feeds to Markdoc.validate/transform.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import Markdoc from '@markdoc/markdoc';
import { parse } from 'svelte/compiler';

export type AttributeSpec = { required: boolean };
export type TagSpec = { render: string; attributes: Record<string, AttributeSpec> };

export type RegistrySchema = {
	/** Markdoc tag name (lowercased export) → component + attributes. */
	tags: Record<string, TagSpec>;
	/** Markdoc node type (lowercased export, e.g. 'heading') → component. */
	nodes: Record<string, TagSpec>;
};

// `export { default as Name } from './path.svelte';` pairs from a registry
// file, comments stripped so documentation can't inject phantom exports.
function exportedComponents(registryFile: string): { name: string; path: string }[] {
	const raw = readFileSync(registryFile, 'utf8')
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/\/\/[^\n]*/g, '');
	const out: { name: string; path: string }[] = [];
	for (const m of raw.matchAll(
		/export\s*\{\s*default\s+as\s+(\w+)\s*\}\s*from\s*['"]([^'"]+)['"]/g
	)) {
		out.push({ name: m[1], path: m[2] });
	}
	if (out.length === 0) {
		throw new Error(`[markdoc-schema] no component exports found in ${registryFile}`);
	}
	return out;
}

// Extract the component's props from its `$props()` destructuring:
//   let { a, b = fallback, children } = $props();
// → { a: {required:true}, b: {required:false} }   (children excluded —
// it's the content body, not an attribute). A prop without a default is
// required, matching the behavior content was written against.
function componentProps(componentFile: string): Record<string, AttributeSpec> {
	const source = readFileSync(componentFile, 'utf8');
	const ast = parse(source, { modern: true });
	const props: Record<string, AttributeSpec> = {};
	const body = (ast.instance?.content as { body?: unknown[] } | undefined)?.body ?? [];
	for (const stmt of body as Array<Record<string, unknown>>) {
		if (stmt.type !== 'VariableDeclaration') continue;
		for (const decl of stmt.declarations as Array<Record<string, unknown>>) {
			const init = decl.init as Record<string, unknown> | null;
			const callee = init?.callee as Record<string, unknown> | undefined;
			if (init?.type !== 'CallExpression' || callee?.name !== '$props') continue;
			const id = decl.id as Record<string, unknown>;
			if (id.type !== 'ObjectPattern') continue;
			for (const prop of id.properties as Array<Record<string, unknown>>) {
				if (prop.type !== 'Property') continue; // skip ...rest
				const key = prop.key as Record<string, unknown>;
				const value = prop.value as Record<string, unknown>;
				const name = key.name as string | undefined;
				if (!name || name === 'children') continue;
				props[name] = { required: value.type !== 'AssignmentPattern' };
			}
		}
	}
	return props;
}

/**
 * Build the tag + node schema from the component registries. Throws on an
 * unreadable registry, an empty registry, or a node export that doesn't
 * correspond to a Markdoc node type (fail closed — a silently dropped
 * override would un-style every page).
 */
export function buildSchemaFromRegistry(tagsFile: string, nodesFile: string): RegistrySchema {
	const tags: Record<string, TagSpec> = {};
	for (const { name, path } of exportedComponents(tagsFile)) {
		const component = join(dirname(tagsFile), path);
		tags[name.toLowerCase()] = { render: name, attributes: componentProps(component) };
	}

	const nodes: Record<string, TagSpec> = {};
	for (const { name, path } of exportedComponents(nodesFile)) {
		const type = name.toLowerCase();
		if (!(type in Markdoc.nodes)) {
			throw new Error(
				`[markdoc-schema] "${name}" in ${nodesFile} is not a Markdoc node type ` +
					`(expected one of: ${Object.keys(Markdoc.nodes).join(', ')})`
			);
		}
		const component = join(dirname(nodesFile), path);
		nodes[type] = { render: name, attributes: componentProps(component) };
	}

	return { tags, nodes };
}
