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
        url:    '/media/website/og-image.png',
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
    images:      ['/media/website/og-image.png'],
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

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://moderateglutton.com/#organization',
      name: 'Moderate Glutton',
      url: 'https://moderateglutton.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://moderateglutton.com/media/website/logo-icon-512.png',
        width: 512,
        height: 512,
      },
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://moderateglutton.com/#website',
      url: 'https://moderateglutton.com',
      name: 'Moderate Glutton',
      description: DESCRIPTION,
      publisher: { '@id': 'https://moderateglutton.com/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://moderateglutton.com/?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
