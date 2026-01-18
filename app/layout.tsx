import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google"; 
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Pulsar CBT | #1 FUOYE Exam Practice Platform',
  description: 'The premier academic simulation engine for Federal University Oye-Ekiti. Master MTH 101, GST 101, and more with precision timing and instant analytics.',
  metadataBase: new URL('https://pulsar-cbt.vercel.app'), 
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    title: 'Pulsar CBT | Dominate Your FUOYE Exams',
    description: 'Free CBT practice for Federal University Oye-Ekiti. 200+ Questions per course. Instant Scoring.',
    images: [{ url: '/api/og', width: 1200, height: 630, alt: 'Pulsar CBT Preview' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pulsar CBT | FUOYE Practice',
    description: 'Ace your exams with Pulsar CBT.',
    images: ['/api/og'], 
  },
  keywords: ['Pulsar CBT', 'FUOYE CBT', 'FUOYE Past Questions', 'GST 101', 'MTH 101', 'Federal University Oye-Ekiti', 'CBT Practice'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-[#050508] text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
