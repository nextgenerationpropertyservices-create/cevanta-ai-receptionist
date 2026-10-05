import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import RootLayout, { metadata } from '@/app/layout';

describe('installable app shell', () => {
  it('publishes install metadata for Windows and Android wrappers', () => {
    expect(metadata.manifest).toBe('/manifest.webmanifest');
    expect(metadata.applicationName).toBe('Cevanta');
    expect(metadata.appleWebApp).toMatchObject({ capable: true, title: 'Cevanta' });
  });

  it('has a manifest with standalone display and dashboard start path', () => {
    const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8')) as {
      name: string;
      short_name: string;
      start_url: string;
      display: string;
      icons: Array<{ src: string; sizes: string; type: string }>;
    };

    expect(manifest.name).toBe('Cevanta AI Receptionist');
    expect(manifest.short_name).toBe('Cevanta');
    expect(manifest.start_url).toBe('/workspaces');
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons.map((icon) => icon.src)).toEqual(
      expect.arrayContaining(['/icons/icon.svg', '/icons/icon-192.png', '/icons/icon-512.png'])
    );
  });

  it('registers the app installer without changing dashboard content', () => {
    const output = renderToStaticMarkup(
      createElement(RootLayout, null, createElement('main', { id: 'main' }, 'Dashboard'))
    );

    expect(output).toContain('Dashboard');
    expect(output).toContain('Skip to content');
  });

  it('keeps the service worker away from private dashboard data', () => {
    const serviceWorker = readFileSync('public/sw.js', 'utf8');

    expect(serviceWorker).toContain("url.pathname.startsWith('/workspaces/')");
    expect(serviceWorker).toContain("url.pathname.startsWith('/api/')");
    expect(serviceWorker).toContain("url.pathname.startsWith('/auth/')");
    expect(serviceWorker).toContain('return;');
  });
});
