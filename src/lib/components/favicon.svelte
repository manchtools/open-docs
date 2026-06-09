<script lang="ts">
	import { mode } from 'mode-watcher';

	// Theme-following tab icons. Operators can ship a dark variant next to
	// any icon (`favicon-32-dark.png` for `favicon-32.png`, `favicon-dark.svg`
	// for `favicon.svg`, …); when present, the matching <link> swaps to it in
	// dark mode and back in light — synced to the in-app toggle, like the
	// rest of the chrome. Without dark assets this is a one-time existence
	// probe per icon and otherwise a no-op.
	//
	// Why JS at all: an SVG favicon with internal prefers-color-scheme
	// styles only follows the OS (not the toggle), browsers often prefer
	// the PNG sizes (which can't self-adapt), and `media=` on rel="icon"
	// links is not reliably honored — swapping the href is the one path
	// that works everywhere.

	const exists = new Map<string, Promise<boolean>>();

	function darkVariant(href: string): string | null {
		const m = /^(.*)\.(svg|png|ico)(\?.*)?$/.exec(href);
		return m ? `${m[1]}-dark.${m[2]}${m[3] ?? ''}` : null;
	}

	function probe(url: string): Promise<boolean> {
		if (!exists.has(url)) {
			exists.set(
				url,
				fetch(url, { method: 'HEAD' })
					.then((r) => r.ok)
					.catch(() => false)
			);
		}
		return exists.get(url)!;
	}

	$effect(() => {
		const dark = mode.current === 'dark';
		const links = document.querySelectorAll<HTMLLinkElement>(
			'link[rel="icon"], link[rel="apple-touch-icon"]'
		);
		for (const link of links) {
			// Remember the light href the first time we touch a link, so
			// toggling back always restores the original.
			const original = link.dataset.lightHref ?? link.getAttribute('href') ?? '';
			link.dataset.lightHref = original;

			if (!dark) {
				if (link.getAttribute('href') !== original) link.setAttribute('href', original);
				continue;
			}
			const candidate = darkVariant(original);
			if (!candidate) continue;
			void probe(candidate).then((ok) => {
				// Re-check the mode — the user may have toggled back while
				// the probe was in flight.
				if (ok && mode.current === 'dark') link.setAttribute('href', candidate);
			});
		}
	});
</script>
