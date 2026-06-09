// 0.4.0: pages are rendered on the server at request time from the
// runtime content store (no Vite prerender — content is data, not code).
// SSR stays on, so crawlers get full HTML; a boot warm pass renders every
// page once for the Pagefind index.
export const ssr = true;

// Disable trailing slashes — matches the [...slug] route shape and avoids
// /a/ and /a being treated as two pages by search/SEO.
export const trailingSlash = 'never';
