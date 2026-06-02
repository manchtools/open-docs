<script lang="ts">
	// Markdoc `table` node → shadcn-svelte Table. Table.Root wraps the
	// <table> in a `w-full overflow-x-auto` container, so a wide table
	// scrolls sideways inside its own box instead of overflowing the page
	// on small screens. The thead/tbody/tr/th/td overrides alongside this
	// render the rest of the table with shadcn parts.
	import * as UITable from '$lib/components/ui/table';
	type Props = { children?: import('svelte').Snippet };
	const { children }: Props = $props();
</script>

<UITable.Root>
	{@render children?.()}
</UITable.Root>
