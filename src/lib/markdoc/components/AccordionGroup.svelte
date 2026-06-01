<script lang="ts">
	import { setContext } from 'svelte';
	import * as Accordion from '$lib/components/ui/accordion';

	// {% accordions %} {% accordion %}…{% /accordion %} … {% /accordions %}
	//
	// A group of accordions, built on shadcn-svelte's Accordion (bits-ui),
	// so it has smooth height animation and full keyboard/ARIA support.
	// `exclusive` (default true) maps to type="single" — one open at a time,
	// like tabs; `exclusive=false` → type="multiple", several can stay open.
	//
	// `[&_h3]:m-0` neutralises the prose heading margin the trigger's <h3>
	// header would otherwise inherit (the group lives inside `.prose`).
	let {
		exclusive = true,
		children
	}: { exclusive?: boolean; children?: import('svelte').Snippet } = $props();

	// Tell child accordions they're in a group, so each renders only an
	// <Accordion.Item> under this shared <Accordion.Root>.
	setContext('open-docs-accordion-group', true);
</script>

{#if exclusive}
	<Accordion.Root type="single" class="my-6 w-full [&_h3]:m-0">
		{@render children?.()}
	</Accordion.Root>
{:else}
	<Accordion.Root type="multiple" class="my-6 w-full [&_h3]:m-0">
		{@render children?.()}
	</Accordion.Root>
{/if}
