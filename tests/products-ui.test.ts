import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { availabilityLabel, cevantaProducts } from '@/lib/product-catalog';

const page = readFileSync(resolve(process.cwd(), 'src/app/workspaces/[tenantId]/products/page.tsx'), 'utf8');
const shell = readFileSync(resolve(process.cwd(), 'src/components/workspace-shell.tsx'), 'utf8');

describe('Cevanta product catalog', () => {
  it('defines the three sellable product paths as stand-alone or add-on offers', () => {
    expect(cevantaProducts.map(product => product.name)).toEqual([
      'No-Leak Quote Follow-Up',
      'Commercial Maintenance Reactivator',
      'Blueprint & Scope Intake',
    ]);
    expect(cevantaProducts.every(product => product.availability === 'both')).toBe(true);
    expect(cevantaProducts.every(product => product.pricing.startsWith('Suggested:'))).toBe(true);
    expect(availabilityLabel('both')).toBe('Stand-alone or add-on');
  });

  it('keeps the catalog honest about gated execution', () => {
    expect(page).toContain('SAFE BY DEFAULT');
    expect(page).toMatch(/messages, calendar writes, file processing, booking, payments, and dispatch remain off/i);
    expect(cevantaProducts.find(product => product.slug === 'maintenance-reactivator')?.cta).toBe('Open reactivation');
    expect(page).toContain('Review client integrations');
    expect(page).not.toMatch(/automatically books|guaranteed revenue|instantly processes/i);
  });

  it('exposes Products in the office navigation', () => {
    expect(shell).toContain("label:'Products'");
    expect(shell).toContain('`${base}/products`');
  });
});
