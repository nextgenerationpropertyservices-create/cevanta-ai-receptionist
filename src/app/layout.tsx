import type { Metadata } from 'next';
import { PwaRegister } from '@/components/pwa-register';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL('https://cevanta-ai-receptionist.vercel.app'),
  title: {
    default: 'Cevanta · AI receptionist for service businesses',
    template: '%s · Cevanta'
  },
  description: 'Managed AI answering and an office-review dashboard for HVAC, plumbing, electrical, roofing, and other field-service businesses.',
  verification: { google: 'jEseTcl4qjZkSyPA12bZNG8IyjbaPyPo7jj3WPntXOs' },
  manifest: '/manifest.webmanifest',
  applicationName: 'Cevanta',
  category: 'business',
  openGraph: {
    type: 'website',
    siteName: 'Cevanta',
    locale: 'en_US',
    images: [{ url: '/cevanta-funnel-cta-email.jpg', alt: 'Cevanta AI receptionist for service businesses' }]
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/cevanta-funnel-cta-email.jpg']
  },
  appleWebApp: { capable: true, title: 'Cevanta', statusBarStyle: 'black-translucent' },
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }]
  }
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body><PwaRegister/><a className="skip-link" href="#main">Skip to content</a>{children}</body></html>;
}
