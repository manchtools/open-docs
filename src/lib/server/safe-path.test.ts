import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, basename } from 'node:path';
import { resolveFileWithin } from './safe-path';

// Contract: only a regular file whose REAL (symlink-followed) path lives
// inside the root may be served. Traversal, symlink escape, missing files,
// directories, and NUL bytes must all be rejected.

let base: string;
let root: string; // the served root
let outside: string; // a sibling dir holding a "secret" the root must not reach

beforeAll(() => {
	base = mkdtempSync(join(tmpdir(), 'od-safepath-'));
	root = join(base, 'root');
	outside = join(base, 'outside');
	mkdirSync(join(root, 'sub'), { recursive: true });
	mkdirSync(outside, { recursive: true });
	writeFileSync(join(root, 'ok.txt'), 'inside');
	writeFileSync(join(root, 'sub', 'nested.txt'), 'nested');
	writeFileSync(join(outside, 'secret.txt'), 'TOP SECRET');
	// A symlink INSIDE root that points OUTSIDE it — the escape vector.
	symlinkSync(join(outside, 'secret.txt'), join(root, 'evil.txt'));
	// A symlink inside root pointing at an absolute host path.
	symlinkSync('/etc/hostname', join(root, 'host.txt'));
});

afterAll(() => rmSync(base, { recursive: true, force: true }));

describe('resolveFileWithin — serves genuine in-root files', () => {
	it('resolves a top-level file', () => {
		expect(resolveFileWithin(root, 'ok.txt')).toBe(join(root, 'ok.txt'));
	});
	it('resolves a nested file', () => {
		expect(resolveFileWithin(root, 'sub/nested.txt')).toBe(join(root, 'sub', 'nested.txt'));
	});
});

describe('resolveFileWithin — rejects escapes and non-files', () => {
	it('rejects ../ traversal', () => {
		expect(resolveFileWithin(root, '../outside/secret.txt')).toBeNull();
	});
	it('rejects a symlink that points outside the root', () => {
		// The lexical path is inside root, but the real target is the sibling.
		expect(resolveFileWithin(root, 'evil.txt')).toBeNull();
	});
	it('rejects a symlink to an absolute host path', () => {
		expect(resolveFileWithin(root, 'host.txt')).toBeNull();
	});
	it('rejects a directory', () => {
		expect(resolveFileWithin(root, 'sub')).toBeNull();
	});
	it('rejects a missing file', () => {
		expect(resolveFileWithin(root, 'nope.txt')).toBeNull();
	});
	it('rejects a NUL byte', () => {
		expect(resolveFileWithin(root, 'ok.txt\0.png')).toBeNull();
	});
	it('does not leak the outside secret by any of these means', () => {
		// sanity: the secret really is reachable on disk, just not via the root
		expect(basename(join(outside, 'secret.txt'))).toBe('secret.txt');
		expect(resolveFileWithin(root, 'evil.txt')).toBeNull();
	});
});
