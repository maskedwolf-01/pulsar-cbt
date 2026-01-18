import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Pulsar CBT | #1 FUOYE Exam Practice Platform',
  description: 'The best free CBT practice site for FUOYE students. Master GST 101, GST 103, MTH 101, PHY 101, and more with realistic simulations and instant results.',
  metadataBase: new URL('https://pulsar-cbt.vercel.app'), 
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    title: 'Pulsar CBT | Dominate Your FUOYE Exams',
    description: 'Free CBT practice for Federal University Oye-Ekiti. 200+ Questions per course. Instant Scoring.',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'Pulsar CBT Preview',
      },
    ],
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
      <body className={inter.className}>{children}</body>
    </html>
  );
}
