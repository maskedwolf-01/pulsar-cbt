import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://pulsar-cbt.vercel.app'),
  title: {
    default: 'Pulsar CBT | Best Exam Practice Site for Students',
    template: '%s | Pulsar CBT', 
  },
  description: 'The ultimate free CBT practice platform for Nigerian students. Real exam simulation, instant scoring, and past questions for GST 103, MTH 101, COS 101, and more.',
  keywords: [
    'Best CBT site',
    'CBT practice online', 
    'Exam simulator', 
    'FUOYE CBT', 
    'Past questions', 
    'GST 103 exam', 
    'MTH 101 practice', 
    'Nigeria student app',
    'ScholarHub', 
    'FacultyVault'
  ],
  authors: [{ name: 'Pulsar Dev Team' }],
  creator: 'Pulsar Dev Team',
  openGraph: {
    title: 'Pulsar CBT - Ace Your Exams',
    description: 'Stop guessing. Start practicing. The ultimate exam simulator for students.',
    url: 'https://pulsar-cbt.vercel.app',
    siteName: 'Pulsar CBT',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Pulsar CBT Dashboard',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  // ✅ YOUR GOOGLE VERIFICATION CODE IS HERE:
  verification: {
    google: 'hugNiTDq-Yc1WjydouZi5mmLtNU6iaCmbhxSymjAWe8',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#09090b] text-white antialiased`}>
        {children}
      </body>
    </html>
  );
    }
