<script lang="ts">
	// A single step inside {% steps %}. The number in the marker comes
	// from the CSS counter the parent resets; the left border draws the
	// connecting line, dropped on the last step.
	let { title, children }: { title?: string; children?: import('svelte').Snippet } = $props();
</script>

<div class="step relative border-l border-border pb-6 pl-7 last:border-l-transparent last:pb-1">
	<span
		class="step-marker absolute -left-3 top-0 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
	></span>
	{#if title}
		<p class="mb-1 font-semibold text-foreground">{title}</p>
	{/if}
	<div class="text-sm text-muted-foreground [&>:first-child]:mt-0 [&>:last-child]:mb-0">
		{@render children?.()}
	</div>
</div>

<style>
	.step {
		counter-increment: step;
	}
	.step-marker::before {
		content: counter(step);
	}
</style>
