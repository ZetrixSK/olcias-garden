import pkgText from '../package.json?raw';
import changelogMd from '../CHANGELOG.md?raw';
import { describe, expect, it } from 'vitest';
import { CHANGELOG, LATEST } from './changelog';

describe('the changelog', () => {
  it('starts with the version the app is', () => {
    const pkg = JSON.parse(pkgText) as { version: string };
    expect(LATEST).toBe(pkg.version);
    expect(changelogMd).toContain(`## ${LATEST} `);
  });

  it('lists each version once, newest first, with a date and words in both languages', () => {
    const versions = CHANGELOG.map((e) => e.version);
    expect(new Set(versions).size).toBe(versions.length);
    const newer = (a: string, b: string) => a.split('.').map(Number).reduce((d, n, i) => d || n - Number(b.split('.')[i]), 0) > 0;
    for (let i = 1; i < CHANGELOG.length; i++) expect(newer(CHANGELOG[i - 1]!.version, CHANGELOG[i]!.version)).toBe(true);
    for (const e of CHANGELOG) {
      expect(e.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.en.length).toBeGreaterThan(0);
      expect(e.pl.length).toBe(e.en.length);
    }
  });
});
