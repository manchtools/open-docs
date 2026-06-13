import { realpathSync, statSync } from 'node:fs';
import { resolve, join, sep } from 'node:path';

// Resolve a request-supplied relative path under a fixed root and confirm the
// result is a regular file that genuinely lives inside that root.
//
// `path.resolve()` collapses ".." lexically but does NOT follow symlinks, so a
// symlink planted inside the root (e.g. an image that points at /etc/passwd)
// passes a `startsWith(root)` check yet reads an arbitrary host file. We
// canonicalise BOTH the root and the target with realpathSync and re-check
// containment on the real paths, so a symlink escape is rejected.
//
// Returns the canonical absolute file path when safe, or null (caller 404s).
export function resolveFileWithin(root: string, relPath: string): string | null {
	if (relPath.includes('\0')) return null;

	// Canonicalise the root once so comparisons hold even when the root itself
	// is reached through a symlink (common in container mounts).
	let rootReal: string;
	try {
		rootReal = realpathSync(resolve(root));
	} catch {
		rootReal = resolve(root);
	}

	const target = resolve(join(rootReal, relPath));
	// Cheap lexical gate first — rejects "../" before touching the filesystem.
	if (target !== rootReal && !target.startsWith(rootReal + sep)) return null;

	// Canonical (symlink-followed) path must ALSO stay inside the root.
	let real: string;
	try {
		real = realpathSync(target);
	} catch {
		return null; // missing file or broken/looping symlink
	}
	if (real !== rootReal && !real.startsWith(rootReal + sep)) return null;

	try {
		if (!statSync(real).isFile()) return null;
	} catch {
		return null;
	}
	return real;
}
