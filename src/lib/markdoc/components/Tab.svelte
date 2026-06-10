<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';

	// Single panel inside a {% tabs %} block. Parent owns the trigger
	// row (via its `labels` attribute) so this component just renders
	// a Tabs.Content keyed by the matching `label`.

	type Props = {
		label: string;
		children?: import('svelte').Snippet;
	};

	// docref: begin props
	const { label, children }: Props = $props();
	// docref: end props
</script>

<Tabs.Content value={label}>
	{@render children?.()}
</Tabs.Content>
