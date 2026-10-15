import { describe, expect, it } from 'vitest';

describe('customer 360 timeline UI contract', () => {
  it('defines the customer-facing timeline language and safe boundaries', async () => {
    const page = await import('../src/app/workspaces/[tenantId]/customers/[customerId]/page');
    expect(page.default).toBeTypeOf('function');
    const source = await import('node:fs/promises').then(fs => fs.readFile('src/app/workspaces/[tenantId]/customers/[customerId]/page.tsx', 'utf8'));
    expect(source).toContain('CUSTOMER 360');
    expect(source).toContain('Activity timeline');
    expect(source).toContain('No activity has been recorded');
  });
});
