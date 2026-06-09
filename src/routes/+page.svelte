<script lang="ts">
	import { page } from '$app/state';
	import Seo from '$lib/components/seo.svelte';
	import Hero from '$lib/components/hero.svelte';

	// Landing page for the default language ('/'). Other languages render
	// the same hero at their bare path ('/de') via the [...slug] route.
	const lang = $derived((page.data.lang as string) ?? 'en');
</script>

<Seo path="/" type="website" {lang} slug="" />
<Hero {lang} />
