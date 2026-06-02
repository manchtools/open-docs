<script lang="ts">
	// Keeps <meta name="theme-color"> — the colour mobile browsers paint
	// onto their own chrome (address bar, status bar) — in sync with the
	// site's --primary token.
	//
	// This can't be resolved on the server: --primary comes from the
	// operator's theme.css (loaded as a stylesheet) and has separate
	// light/dark values, and the active mode is client-only state owned by
	// mode-watcher. So there is no env flag and no server-rendered colour —
	// we read the computed token here and rewrite the meta tag, re-running
	// whenever mode-watcher toggles the `.dark` class on <html>.
	import { onMount } from 'svelte';

	function currentPrimary(): string {
		// getComputedStyle hands back a custom property's raw token, not a
		// usable colour, so bounce --primary through a throwaway element's
		// `color` and read it back resolved. The browser serialises it in a
		// form it can itself parse — `rgb()` on older engines, `oklch()` on
		// newer ones (both landed alongside theme-color's support for them) —
		// so the value is always valid in <meta name="theme-color">.
		const probe = document.createElement('span');
		probe.style.color = 'var(--primary)';
		probe.style.position = 'absolute';
		probe.style.visibility = 'hidden';
		document.body.appendChild(probe);
		const colour = getComputedStyle(probe).color;
		probe.remove();
		return colour;
	}

	function sync() {
		let meta = document.querySelector('meta[name="theme-color"]');
		if (!meta) {
			meta = document.createElement('meta');
			meta.setAttribute('name', 'theme-color');
			document.head.appendChild(meta);
		}
		meta.setAttribute('content', currentPrimary());
	}

	onMount(() => {
		sync();
		// mode-watcher toggles `.dark` on <html>; re-sync on every change.
		const observer = new MutationObserver(sync);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class']
		});
		return () => observer.disconnect();
	});
</script>
