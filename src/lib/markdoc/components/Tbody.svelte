<script lang="ts">
	import * as UITable from '$lib/components/ui/table';
	type Props = { children?: import('svelte').Snippet };
	const { children }: Props = $props();
</script>

<UITable.Body>{@render children?.()}</UITable.Body>
