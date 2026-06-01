<script lang="ts">
	// {% steps %} {% step title="..." %} … {% /step %} … {% /steps %}
	//
	// Numbered, vertically-connected procedure. Numbering is done with a
	// pure CSS counter (reset here, incremented per Step), so — unlike
	// Tabs — nothing needs to be enumerated up front for SSR.
	let { children }: { children?: import('svelte').Snippet } = $props();
</script>

<!-- No `not-prose`: step content keeps full prose styling (lists, inline
     code, links, code blocks all render correctly). The step chrome
     (markers, connector line, body text size/colour) is set with utility
     classes, which beat the typography plugin's zero-specificity rules. -->
<div class="steps my-6">
	{@render children?.()}
</div>

<style>
	.steps {
		counter-reset: step;
	}
</style>
