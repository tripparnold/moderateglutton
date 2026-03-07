import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import Nav    from '@/components/Nav';
import Footer from '@/components/Footer';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600'],
  style:    ['normal', 'italic'],
  variable: '--font-cormorant',
  display:  'swap',
});

const inter = Inter({
  subsets:  ['latin'],
  weight:   ['300', '400', '500'],
  variable: '--font-inter',
  display:  'swap',
});

const DESCRIPTION = 'Recipes worth making again, a running guide to Houston restaurants, and notes from eating around the world — by a home cook, engineer, and Type 1 diabetic.';

export const metadata: Metadata = {
  title: {
    default:  'Moderate Glutton',
    template: '%s | Moderate Glutton',
  },
  description: DESCRIPTION,
  metadataBase: new URL('https://moderateglutton.com'),
  keywords: ['food blog', 'home cooking', 'recipes', 'Houston restaurants', 'travel food', 'Type 1 diabetic cooking'],
  authors: [{ name: 'Tripp Arnold' }],
  openGraph: {
    siteName:    'Moderate Glutton',
    type:        'website',
    url:         'https://moderateglutton.com',
    title:       'Moderate Glutton',
    description: DESCRIPTION,
    images: [
      {
        url:    '/media/website/logo-icon.png',
        width:  1200,
        height: 630,
        alt:    'Moderate Glutton',
      },
    ],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Moderate Glutton',
    description: DESCRIPTION,
    images:      ['/media/website/logo-icon.png'],
  },
  icons: {
    icon:  '/icon.png',
    apple: '/icon.png',
  },
  robots: {
    index:  true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Nav />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
