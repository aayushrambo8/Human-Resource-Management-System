import type { MetadataRoute } from 'next';

function getBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || 'https://hrms.bitmesra.ac.in';
  return raw.replace(/\/+$/, '');
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/privacy', '/terms'],
        disallow: ['/api/', '/actuator/', '/settings/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
