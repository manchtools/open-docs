// Shared structural-URL builder for the server surfaces that emit absolute
// links from a site-root path: the Atom feed (id/link/self) and the feed
// render profile (in-body href/src). Both compose `origin + base + path`
// identically; centralising it keeps them in lock-step.
//
// `siteUrl` is the PUBLIC_SITE_URL origin (no trailing slash, '' when unset —
// the documented relative-URL fallback). `basePath` is BASE_PATH (a leading
// slash or ''). `path` is a site-root path (leading slash). When siteUrl is
// '' the result is a base-correct relative URL, exactly as before.
export const joinAbsUrl = (siteUrl: string, basePath: string, path: string): string =>
	`${siteUrl}${basePath}${path}`;
