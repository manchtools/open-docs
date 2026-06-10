<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	// {% badge variant="info" %}Beta{% /badge %}
	//
	// Inline status pill for headings and list items, built on
	// shadcn-svelte's Badge with the docs' semantic colour variants (added
	// in src/lib/components/ui/badge/badge.svelte). `default` uses the
	// neutral secondary look so it doesn't shout like the primary fill.
	type Variant = 'default' | 'info' | 'success' | 'warning' | 'danger';
	// docref: begin props
	let { variant = 'default', children }: { variant?: Variant; children?: import('svelte').Snippet } =
		$props();
	// docref: end props

	const variantMap = {
		default: 'secondary',
		info: 'info',
		success: 'success',
		warning: 'warning',
		danger: 'danger'
	} as const;
</script>

<Badge variant={variantMap[variant]} class="align-middle">
	{@render children?.()}
</Badge>
