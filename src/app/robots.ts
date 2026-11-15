import type { MetadataRoute } from 'next';

const privatePaths = [
  '/api/',
  '/auth/',
  '/invite',
  '/setup',
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/workspaces',
  '/workspaces/'
];

export default function robots(): MetadataRoute.Robots {
  const publicRules = (userAgent: string | string[]) => ({
    userAgent,
    allow: ['/', '/demo-dashboard'],
    disallow: privatePaths
  });

  return {
    rules: [
      publicRules('*'),
      publicRules('Googlebot'),
      publicRules('Bingbot'),
      publicRules('OAI-SearchBot')
    ],
    sitemap: 'https://cevanta-ai-receptionist.vercel.app/sitemap.xml',
    host: 'https://cevanta-ai-receptionist.vercel.app'
  };
}
