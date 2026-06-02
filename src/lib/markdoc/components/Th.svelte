<script lang="ts">
	// `th` → shadcn Table.Head. Preserve the column's Markdown alignment
	// (`:---`, `:--:`, `--:`) and relax shadcn's default `whitespace-nowrap`
	// so long header text can wrap; inline code stays whole via the
	// table-cell rule in app.css.
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

<UITable.Head class={cls}>{@render children?.()}</UITable.Head>
