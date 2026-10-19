import { describe, expect, it } from 'vitest';
import { starterServicesForTrade, templateForTrade } from '@/lib/client-onboarding-blueprint';

describe('client onboarding starter templates', () => {
  it('selects a trade template and creates safe editable services', () => {
    const template = templateForTrade('licensed electrician');
    const services = starterServicesForTrade('licensed electrician');

    expect(template.id).toBe('electrical');
    expect(services.length).toBe(template.defaultServices.length);
    expect(services[0]).toMatchObject({ id: null, enabled: true, position: 0 });
    expect(services.every(service => service.description.includes('Office-review intake'))).toBe(true);
  });

  it('falls back to a general trade template for an unknown industry', () => {
    const services = starterServicesForTrade('specialty service company');
    expect(services.length).toBeGreaterThan(0);
    expect(services[0].name).toBe('Service request');
  });
});
