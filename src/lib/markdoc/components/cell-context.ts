// Shared key for the "am I inside a {% column %}/{% grid %} cell?" Svelte
// context. Column sets it; the paragraph node override reads it so a cell's
// block content (e.g. a callout) isn't wrapped in a <p> — see Paragraph.svelte.
export const MDOC_CELL = Symbol('mdoc-cell');
