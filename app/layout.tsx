import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Moderate Glutton',
  description: 'A home cook, engineer, and Type 1 diabetic who overthinks just about every meal.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
