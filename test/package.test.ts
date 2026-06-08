import { describe, it, expect } from 'bun:test';

describe('package structure', () => {
  it('should have correct name in package.json', async () => {
    const pkg = await import('../../package.json');
    expect(pkg.name).toBe('laoli-creative');
  });

  it('should expose CLI and SDK exports', async () => {
    const pkg = await import('../../package.json');
    expect(pkg.exports['.'].import).toBe('./dist/sdk/index.mjs');
    expect(pkg.exports['./sdk'].import).toBe('./dist/sdk/index.mjs');
  });

  it('should have lint script', async () => {
    const pkg = await import('../../package.json');
    expect(pkg.scripts.lint).toBe('eslint src/ test/');
  });
});
