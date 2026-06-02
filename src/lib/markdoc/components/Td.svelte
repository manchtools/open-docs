<script lang="ts">
	// `td` → shadcn Table.Cell. Preserve column alignment and let cell text
	// wrap (shadcn cells default to `whitespace-nowrap`); inline code is kept
	// on one line by the table-cell rule in app.css.
	import * as UITable from '$lib/components/ui/table';
	type Props = {
		align?: 'left' | 'center' | 'right';
		children?: import('svelte').Snippet;
	};
	const { align, children }: Props = $props();
	const cls = $derived(
		'whitespace-normal' +
			(align === 'center' ? ' text-center' : align === 'right' ? ' text-right' : '')
	);
</script>

<UITable.Cell class={cls}>{@render children?.()}</UITable.Cell>
