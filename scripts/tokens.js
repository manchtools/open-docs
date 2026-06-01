// Build-time content tokens. Any PUBLIC_TOKEN_<NAME> env var is exposed to
// .md/.markdoc as a {{NAME}} placeholder, substituted during the build.
//
// Shared by the tokenReplacer preprocessor (which performs the real
// substitution) and the CSP frame-src derivation (which resolves embed
// URLs the same way before reading their host), so the two never disagree
// about what a {{TOKEN}} expands to.

/**
 * Build the `{{NAME}}` → value map from the current environment.
 * @returns {Record<string, string>}
 */
export function buildTokenMap() {
	return Object.fromEntries(
		Object.entries(process.env)
			.filter(([k]) => k.startsWith('PUBLIC_TOKEN_'))
			.map(([k, v]) => [`{{${k.slice('PUBLIC_TOKEN_'.length)}}}`, v ?? ''])
	);
}

/**
 * Replace every `{{NAME}}` placeholder in `text` with its token value.
 * A plain string swap — no AST work — matching the preprocessor exactly.
 * @param {string} text
 * @param {Record<string, string>} tokens
 * @returns {string}
 */
export function applyTokens(text, tokens) {
	let out = text;
	for (const [token, value] of Object.entries(tokens)) {
		if (out.includes(token)) out = out.split(token).join(value);
	}
	return out;
}
