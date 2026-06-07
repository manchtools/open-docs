<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import Sidebar from './sidebar.svelte';
	import Menu from '@lucide/svelte/icons/menu';

	// Mobile hamburger + drawer. Visible only at md:hidden; the
	// desktop sticky sidebar covers everything from md+ already.
	//
	// Built on shadcn-svelte's Sheet primitive: focus trap, return
	// focus to the trigger, Esc + outside-click dismissal and the
	// slide-in chrome all come for free from bits-ui under the hood.
	// We only own the trigger button, the inner nav, and the close
	// behaviour on navigation.

	let open = $state(false);

	// Close on every successful navigation so tapping a link drops
	// the drawer rather than leaving it covering the destination.
	afterNavigate(() => {
		open = false;
	});
</script>

<Sheet.Root bind:open>
	<Sheet.Trigger>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="ghost"
				size="icon-sm"
				class="md:hidden"
				aria-label="Open navigation menu"
			>
				<Menu class="size-5" />
			</Button>
		{/snippet}
	</Sheet.Trigger>

	<Sheet.Content side="left" class="flex w-72 max-w-[85vw] flex-col gap-0 p-0">
		<Sheet.Header class="h-14 shrink-0 border-b border-border px-4">
			<Sheet.Title class="text-base">Menu</Sheet.Title>
			<Sheet.Description class="sr-only">Documentation navigation</Sheet.Description>
		</Sheet.Header>
		<!-- Give the nav the *remaining* height (not h-full of the whole
		     sheet) so it scrolls inside the drawer; otherwise it overflows
		     past the bottom and the last links can't be reached/tapped. -->
		<div class="min-h-0 flex-1">
			<Sidebar />
		</div>
	</Sheet.Content>
</Sheet.Root>
