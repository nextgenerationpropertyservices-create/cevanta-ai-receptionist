import { describe, expect, it } from 'vitest';

describe('owner insights UI contract', () => {
  it('labels estimates and keeps the page read-only', async () => {
    const source = await import('node:fs/promises').then(fs => fs.readFile('src/app/workspaces/[tenantId]/reports/page.tsx', 'utf8'));
    expect(source).toContain('OWNER INSIGHTS');
    expect(source).toContain('READ-ONLY ESTIMATES');
    expect(source).toContain('does not charge customers');
  });
});
