import type { MetadataRoute } from 'next';

const siteUrl = 'https://cevanta-ai-receptionist.vercel.app';
const lastModified = new Date('2026-10-26T00:00:00.000Z');

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
      images: [`${siteUrl}/cevanta-funnel-cta-email.jpg`],
      videos: [{
        title: 'How a Cevanta AI receptionist call reaches the office dashboard',
        thumbnail_loc: `${siteUrl}/call-demo-poster.svg`,
        description: 'A fictional service call showing the AI receptionist capturing a request for office review.',
        content_loc: `${siteUrl}/cevanta-call-demo.mp4`
      }]
    },
    {
      url: `${siteUrl}/demo-dashboard`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8
    }
  ];
}
