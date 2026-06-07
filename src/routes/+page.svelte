<script lang="ts">
	import { defaultLang } from '$lib/i18n';
	import Seo from '$lib/components/seo.svelte';
	import Hero from '$lib/components/hero.svelte';

	// Landing page for the default language ('/'). Other languages render
	// the same hero at their bare path ('/de') via the [...slug] route.
</script>

<Seo path="/" type="website" lang={defaultLang} slug="" />
<Hero lang={defaultLang} />
