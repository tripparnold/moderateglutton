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

export const metadata: Metadata = {
  title: {
    default:  'Moderate Glutton',
    template: '%s | Moderate Glutton',
  },
  description: 'A home cook, engineer, and Type 1 diabetic who overthinks just about every meal.',
  openGraph: {
    siteName: 'Moderate Glutton',
    type:     'website',
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
