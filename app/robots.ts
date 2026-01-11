import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/', // Keeps admin areas private if you create them later
    },
    sitemap: 'https://pulsar-cbt.vercel.app/sitemap.xml',
  };
}
