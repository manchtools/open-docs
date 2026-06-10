<!--
  Markdoc *tag* registry — every {% custom %} block authors can use
  is a named re-export from this file. svelte-markdoc-preprocess
  parses the file as a Svelte AST and finds `export { default as X }
  from '...'` declarations; the export name becomes the tag name
  (lowercased — `Callout` → `{% callout %}`).

  Component prop names become Markdoc attribute names. The
  preprocessor reads the exported Svelte component's prop list at
  build time, so any new prop on Callout.svelte is automatically a
  valid Markdoc attribute. Define `prop` types explicitly in the
  component's $props() so the preprocessor picks them up.
-->
<script module>
	export { default as Callout } from './components/Callout.svelte';
	export { default as Tabs } from './components/Tabs.svelte';
	export { default as Tab } from './components/Tab.svelte';
	export { default as Screenshot } from './components/Screenshot.svelte';
	export { default as Steps } from './components/Steps.svelte';
	export { default as Step } from './components/Step.svelte';
	export { default as Cards } from './components/Cards.svelte';
	export { default as Card } from './components/Card.svelte';
	export { default as Accordions } from './components/AccordionGroup.svelte';
	export { default as Accordion } from './components/Accordion.svelte';
	export { default as FileTree } from './components/FileTree.svelte';
	export { default as Badge } from './components/Badge.svelte';
	export { default as Boost } from './components/Boost.svelte';
	export { default as Embed } from './components/Embed.svelte';
	export { default as Code } from './components/Code.svelte';

	// Layout blocks: side-by-side columns (capped at 3 wide) and a
	// responsive grid; both use {% column %} cells.
	export { default as Columns } from './components/Columns.svelte';
	export { default as Column } from './components/Column.svelte';
	export { default as Grid } from './components/Grid.svelte';

	// Blog blocks (usable anywhere): full-bleed hero image and an author
	// card; an avatar directly after a hero overlaps it by half its image.
	export { default as Hero } from './components/Hero.svelte';
	export { default as Avatar } from './components/Avatar.svelte';
	export { default as Quote } from './components/Quote.svelte';
	export { default as Gallery } from './components/Gallery.svelte';

	// Footnote rendering (emitted by the GFM-footnote source pass; authors
	// write [^id], not these tags).
	export { default as Footnotes } from './components/Footnotes.svelte';
	export { default as Footnote } from './components/Footnote.svelte';
	export { default as FootnoteRef } from './components/FootnoteRef.svelte';
</script>
