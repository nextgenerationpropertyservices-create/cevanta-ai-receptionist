import { describe, expect, it } from 'vitest';

describe('receptionist test center UI contract', () => {
  it('keeps testing fictional and side-effect free', async () => {
    const source = await import('node:fs/promises').then(fs => fs.readFile('src/app/workspaces/[tenantId]/receptionist/page.tsx', 'utf8'));
    expect(source).toContain('RECEPTIONIST QUALITY CENTER');
    expect(source).toContain('fictional data only');
    expect(source).toContain('do not place calls');
    expect(source).toContain('Roll back');
  });
});
