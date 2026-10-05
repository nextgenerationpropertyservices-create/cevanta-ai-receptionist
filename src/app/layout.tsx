import type { Metadata } from 'next';
import { PwaRegister } from '@/components/pwa-register';
import './globals.css';
export const metadata: Metadata = {
  title: 'Cevanta · Service starts here',
  description: 'AI receptionist and CRM dashboard for HVAC service businesses.',
  manifest: '/manifest.webmanifest',
  applicationName: 'Cevanta',
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
