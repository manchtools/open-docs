<script lang="ts">
	import { getContext } from 'svelte';
	import * as Accordion from '$lib/components/ui/accordion';

	// {% accordion title="Question?" %} answer {% /accordion %}
	//
	// One disclosure, built on shadcn-svelte's Accordion. Inside an
	// {% accordions %} group it renders as a bare <Accordion.Item> under the
	// group's shared root (so the group controls single/multiple). Used on
	// its own, it wraps itself in a single, collapsible root.
	let { title, children }: { title?: string; children?: import('svelte').Snippet } = $props();

	const inGroup = getContext('open-docs-accordion-group') === true;
	const value = $props.id();
</script>

{#snippet item()}
	<Accordion.Item {value}>
		<Accordion.Trigger>{title}</Accordion.Trigger>
		<Accordion.Content>{@render children?.()}</Accordion.Content>
	</Accordion.Item>
{/snippet}

{#if inGroup}
	{@render item()}
{:else}
	<Accordion.Root type="single" class="my-3 w-full [&_h3]:m-0">
		{@render item()}
	</Accordion.Root>
{/if}
