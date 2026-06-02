<!--
  Markdoc *node* overrides — built-in Markdown elements whose
  rendering we want to customise. Export names match Markdoc's
  built-in node names (lowercased):

    Heading → heading       (we add id anchors for the TOC)
    Link    → link          (external links get rel/target attrs)
    Fence   → fence (code)  (shiki syntax highlighting + copy button)
    Table…  → table/thead/… (shadcn-svelte Table parts; Root scrolls
                             sideways instead of overflowing on mobile)

  Anything not listed here falls through to Markdoc's default
  renderer, which emits plain HTML and gets typographic styling
  via the .prose rules in app.css.
-->
<script module>
	export { default as Heading } from './components/Heading.svelte';
	export { default as Link } from './components/Link.svelte';
	export { default as Fence } from './components/CodeBlock.svelte';

	export { default as Table } from './components/Table.svelte';
	export { default as Thead } from './components/Thead.svelte';
	export { default as Tbody } from './components/Tbody.svelte';
	export { default as Tr } from './components/Tr.svelte';
	export { default as Th } from './components/Th.svelte';
	export { default as Td } from './components/Td.svelte';
</script>
