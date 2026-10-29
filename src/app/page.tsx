import type { Metadata } from 'next';
import { LandingPage } from '@/components/ui';

const siteUrl = 'https://cevanta-ai-receptionist.vercel.app';

export const metadata: Metadata = {
  title: 'AI receptionist for HVAC and trade service businesses',
  description: 'Cevanta answers service calls, captures the caller’s contact details, issue, urgency, and preferred time, then gives the office a clear lead to review.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Cevanta AI receptionist for service businesses',
    description: 'Capture missed-call opportunities and give your office a clear next step—without promising appointments or dispatching technicians by default.',
    url: '/',
    type: 'website',
    siteName: 'Cevanta',
    locale: 'en_US',
    images: [{
      url: '/cevanta-funnel-cta-email.jpg',
      alt: 'Cevanta AI receptionist for service businesses'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cevanta AI receptionist for service businesses',
    description: 'AI answering with an office-review dashboard for HVAC and other trade-service businesses.',
    images: ['/cevanta-funnel-cta-email.jpg']
  }
};

const faq = [
  {
    question: 'What is Cevanta?',
    answer: 'Cevanta is a managed AI answering service and office-review dashboard for field-service businesses. It captures service-call details and organizes them into a clear lead for the office.'
  },
  {
    question: 'Who is Cevanta built for?',
    answer: 'Cevanta is built for HVAC, plumbing, electrical, roofing, and similar service businesses that cannot answer every call while their teams are working.'
  },
  {
    question: 'What happens after the AI answers a call?',
    answer: 'The office receives the caller’s name, contact details, service request, urgency, and preferred timing so a team member can review and choose the next action.'
  },
  {
    question: 'Does Cevanta automatically confirm appointments or dispatch technicians?',
    answer: 'Not by default. The managed pilot keeps the office in control and does not promise appointment times, collect payment, or dispatch a technician without approved and tested automation.'
  }
] as const;

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Cevanta',
      url: siteUrl,
      logo: `${siteUrl}/cevanta-logo-v1.png`,
      description: 'Managed AI answering and an office-review dashboard for field-service businesses.'
    },
    {
      '@type': 'Service',
      '@id': `${siteUrl}/#service`,
      name: 'Cevanta managed AI answering',
      serviceType: 'Managed AI answering and office-review lead capture',
      provider: { '@id': `${siteUrl}/#organization` },
      url: siteUrl,
      description: 'Answers service calls, captures contact details, the service request, urgency, and preferred timing, then presents the request for office review.',
      audience: {
        '@type': 'BusinessAudience',
        audienceType: 'HVAC, plumbing, electrical, roofing, and other field-service businesses'
      }
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${siteUrl}/#dashboard`,
      name: 'Cevanta office-review dashboard',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: `${siteUrl}/demo-dashboard`,
      description: 'A dashboard for reviewing AI-captured service leads and choosing the next office action.'
    },
    {
      '@type': 'FAQPage',
      '@id': `${siteUrl}/#faq`,
      mainEntity: faq.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer }
      }))
    }
  ]
};

export default function Home() {
  return <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
    />
    <LandingPage faq={faq} />
  </>;
}
