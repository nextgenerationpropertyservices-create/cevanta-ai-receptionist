import { describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import FreeToolsPage from '@/app/free-tools/page';
import SignUpPage from '@/app/sign-up/page';

const harness=vi.hoisted(()=>({workspaces:vi.fn()}));
vi.mock('@/lib/supabase/config', () => ({ isSupabaseConfigured: () => true }));
vi.mock('@/app/actions/auth', () => ({ signUp: vi.fn(), provisionWorkspace: vi.fn(), signOut: vi.fn() }));
vi.mock('@/lib/server/queries', () => ({ getWorkspaces: harness.workspaces }));

import WorkspacesPage from '@/app/workspaces/page';

describe('free workspace acquisition', () => {
  it('explains useful free tools, limits, and automation boundaries', () => {
    const html=renderToStaticMarkup(createElement(FreeToolsPage));
    expect(html).toContain('Create my free workspace');
    expect(html).toContain('50</strong><span>active leads');
    expect(html).toContain('2</strong><span>technician roster spots');
    expect(html).toContain('A real starter workspace—not a fake trial.');
    expect(html).toContain('No credit card. No sales call required.');
    expect(html).toContain('/sign-up');
    expect(html).toContain('/demo-dashboard');
    expect(html).toContain('does not activate AI phone answering');
    expect(html).not.toMatch(/service-role|secret|webhook|api key/i);
  });

  it('uses trade-generic signup language without assuming marketing consent', () => {
    const html=renderToStaticMarkup(createElement(SignUpPage));
    expect(html).toContain('Create your workspace.');
    expect(html).toContain('service business');
    expect(html).toContain('No credit card required');
    expect(html).toContain('does not enroll you in marketing messages');
    expect(html).not.toContain('HVAC receptionist demo');
  });

  it('labels a free workspace and gives a clear free first-run action', async () => {
    harness.workspaces.mockResolvedValueOnce([{ id:'11111111-1111-4111-8111-111111111111', name:'Fictional Plumbing', trade:'Plumbing', timezone:'America/New_York', account_type:'client', plan:'free', created_at:'2026-10-31T00:00:00.000Z', updated_at:'2026-10-31T00:00:00.000Z' }]);
    const workspaceHtml=renderToStaticMarkup(await WorkspacesPage());
    expect(workspaceHtml).toContain('CLIENT WORKSPACE · Free tools');
    expect(workspaceHtml).toContain('Fictional Plumbing');

    harness.workspaces.mockResolvedValueOnce([]);
    const firstRunHtml=renderToStaticMarkup(await WorkspacesPage());
    expect(firstRunHtml).toContain('Create your free workspace');
    expect(firstRunHtml).toContain('No credit card is required');
  });
});
