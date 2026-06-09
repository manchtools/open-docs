// Runtime site configuration — every value an operator might want to
// rebrand, read from the environment when the server handles the request
// (NOT baked at build time). `docker run -e PUBLIC_BRAND_NAME=…` therefore
// takes effect with no rebuild. Defaults match 0.3.x.

import { env } from '$env/dynamic/public';
import type { SiteConfig } from '../site';

export function siteConfig(): SiteConfig {
	return {
		brandName: env.PUBLIC_BRAND_NAME ?? 'open-docs',
		brandTagline: env.PUBLIC_BRAND_TAGLINE ?? 'docs',
		logoSrc: env.PUBLIC_LOGO_SRC ?? '/favicon.svg',
		siteTitle: env.PUBLIC_SITE_TITLE ?? 'open-docs',
		siteDescription: env.PUBLIC_SITE_DESCRIPTION ?? 'Documentation site built with open-docs.',
		repoUrl: env.PUBLIC_REPO_URL ?? '',
		siteUrl: (env.PUBLIC_SITE_URL ?? '').replace(/\/+$/, '')
	};
}
