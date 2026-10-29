import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { metadata as layoutMetadata } from '@/app/layout';
import { metadata as pageMetadata } from '@/app/page';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';

const appSource = readFileSync(resolve(process.cwd(), 'src/app/page.tsx'), 'utf8');

describe('public AI-search and crawlability metadata', () => {
  it('publishes a stable canonical identity and useful social metadata', () => {
    expect(layoutMetadata.metadataBase?.toString()).toBe('https://cevanta-ai-receptionist.vercel.app/');
    expect(pageMetadata.alternates).toEqual({ canonical: '/' });
    expect(pageMetadata.openGraph).toMatchObject({
      type: 'website',
      siteName: 'Cevanta',
      locale: 'en_US',
      url: '/',
      images: [{ url: '/cevanta-funnel-cta-email.jpg' }]
    });
    expect(pageMetadata.twitter).toMatchObject({
      card: 'summary_large_image',
      images: ['/cevanta-funnel-cta-email.jpg']
    });
  });

  it('allows public search crawlers while excluding private application routes', () => {
    const result = robots();
    expect(result.sitemap).toBe('https://cevanta-ai-receptionist.vercel.app/sitemap.xml');
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    for (const crawler of ['*', 'Googlebot', 'Bingbot', 'OAI-SearchBot']) {
      const rule = rules.find(item => item.userAgent === crawler);
      expect(rule?.allow).toContain('/');
      expect(rule?.disallow).toEqual(expect.arrayContaining(['/api/', '/invite', '/setup', '/sign-in', '/sign-up', '/workspaces', '/workspaces/']));
    }
  });

  it('lists only canonical public pages in the sitemap', () => {
    const entries = sitemap();
    expect(entries.map(entry => entry.url)).toEqual([
      'https://cevanta-ai-receptionist.vercel.app',
      'https://cevanta-ai-receptionist.vercel.app/demo-dashboard'
    ]);
    expect(entries.some(entry => /sign-|setup|invite|workspaces|api/.test(entry.url))).toBe(false);
    expect(entries[0]?.videos?.[0]).toMatchObject({
      content_loc: 'https://cevanta-ai-receptionist.vercel.app/cevanta-call-demo.mp4'
    });
  });

  it('keeps structured data static, sanitized, and free of invented proof', () => {
    expect(appSource).toContain("'@type': 'FAQPage'");
    expect(appSource).toContain("'@type': 'SoftwareApplication'");
    expect(appSource).toContain("JSON.stringify(jsonLd).replace(/</g, '\\\\u003c')");
    expect(appSource).not.toMatch(/aggregateRating|reviewCount|ratingValue|customerCount|priceCurrency|postalAddress/);
  });
});
