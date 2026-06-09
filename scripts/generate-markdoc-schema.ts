// Generate src/lib/markdoc/schema.json from the component registries
// (tags.svelte / nodes.svelte + each component's $props()). Runs before
// `vite dev` / `vite build` so the schema ships inside the app shell; the
// runtime content store feeds it to Markdoc.validate/transform. This is
// what keeps "a new component prop is automatically a valid Markdoc
// attribute" true without compiling content through Vite.

import { writeFileSync } from 'node:fs';
import { buildSchemaFromRegistry } from '../src/lib/server/markdoc-schema';

const schema = buildSchemaFromRegistry(
	'src/lib/markdoc/tags.svelte',
	'src/lib/markdoc/nodes.svelte'
);

writeFileSync('src/lib/markdoc/schema.json', JSON.stringify(schema, null, '\t') + '\n');
console.log(
	`[schema] ${Object.keys(schema.tags).length} tags, ${Object.keys(schema.nodes).length} nodes → src/lib/markdoc/schema.json`
);
