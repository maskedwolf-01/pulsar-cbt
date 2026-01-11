import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pulsar-cbt.vercel.app';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/auth`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    // Exam Pages - High Priority
    { url: `${baseUrl}/exam/mth101`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/exam/gst103`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/exam/cos101`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/exam/phy101`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/exam/bio101`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/exam/chm101`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/exam/sta111`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/exam/ent101`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/exam/gst101`, lastModified: new Date(), priority: 0.8 },
  ];
     }
