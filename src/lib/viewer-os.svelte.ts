// Detected viewer operating system, so the {% screenshot variant="frame" %}
// browser chrome matches the OS the reader is actually on (macOS traffic
// lights on the left, Windows controls on the right, a GNOME-ish circular
// set on Linux). SSR-safe: defaults to 'mac' until detected in the browser
// (no hydration mismatch — detection runs on mount, after hydration).

export type ViewerOS = 'mac' | 'windows' | 'linux';

export const viewerOS = $state<{ os: ViewerOS }>({ os: 'mac' });

let detected = false;

export function detectViewerOS(): void {
	if (detected || typeof navigator === 'undefined') return;
	detected = true;
	const uaData = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData;
	const platform = (uaData?.platform || navigator.platform || '').toLowerCase();
	const ua = navigator.userAgent.toLowerCase();

	if (platform.includes('mac') || /mac|iphone|ipad|ipod/.test(ua)) {
		viewerOS.os = 'mac';
	} else if (platform.includes('win') || ua.includes('windows')) {
		viewerOS.os = 'windows';
	} else if (platform.includes('linux') || /linux|x11|cros/.test(ua)) {
		// Android reports "linux" too; treat it as Linux chrome, which is the
		// closest of the three.
		viewerOS.os = 'linux';
	}
	// Anything unrecognised keeps the macOS default.
}
