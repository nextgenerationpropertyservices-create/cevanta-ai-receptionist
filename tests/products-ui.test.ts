import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { availabilityLabel, cevantaProducts, readinessLabel } from '@/lib/product-catalog';

const page = readFileSync(resolve(process.cwd(), 'src/app/workspaces/[tenantId]/products/page.tsx'), 'utf8');
const shell = readFileSync(resolve(process.cwd(), 'src/components/workspace-shell.tsx'), 'utf8');

describe('Cevanta product catalog', () => {
  it('defines a starter offer and the three growth product paths', () => {
    expect(cevantaProducts.map(product => product.name)).toEqual([
      'Lead Rescue Starter',
      'No-Leak Quote Follow-Up',
      'Commercial Maintenance Reactivator',
      'Blueprint & Scope Intake',
    ]);
    expect(cevantaProducts.find(product => product.slug === 'lead-rescue-starter')).toMatchObject({
      availability: 'standalone',
      readiness: 'available_now',
      cta: 'Open lead rescue workspace',
    });
    expect(cevantaProducts.filter(product => product.slug !== 'lead-rescue-starter').every(product => product.availability === 'both')).toBe(true);
    expect(availabilityLabel('both')).toBe('Stand-alone or add-on');
  });

  it('clearly separates available, guarded, and planned products', () => {
    expect(readinessLabel('available_now')).toBe('Available now');
    expect(readinessLabel('setup_required')).toBe('Setup & approval required');
    expect(readinessLabel('planned')).toBe('Planned — not live');
    expect(cevantaProducts.find(product => product.slug === 'maintenance-reactivator')?.readiness).toBe('setup_required');
    expect(cevantaProducts.find(product => product.slug === 'quote-follow-up')?.readiness).toBe('planned');
    expect(cevantaProducts.find(product => product.slug === 'blueprint-scope-intake')?.readiness).toBe('planned');
    expect(page).toContain('These offers are product designs, not working automation.');
  });

  it('keeps the catalog honest about gated execution and starter scope', () => {
    expect(page).toContain('SAFE BY DEFAULT');
    expect(page).toMatch(/messages, calendar writes, file processing, booking, payments, and dispatch remain off/i);
    expect(cevantaProducts.find(product => product.slug === 'maintenance-reactivator')?.cta).toBe('Open reactivation');
    expect(cevantaProducts.find(product => product.slug === 'lead-rescue-starter')?.outcome).toMatch(/No customer outreach is sent/i);
    expect(page).toContain('Review client integrations');
    expect(page).not.toMatch(/automatically books|guaranteed revenue|instantly processes/i);
  });

  it('exposes Products in the office navigation', () => {
    expect(shell).toContain("label:'Products'");
    expect(shell).toContain('`${base}/products`');
  });
});
