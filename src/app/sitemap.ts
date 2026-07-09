import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://autoprime.com.br';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/veiculos`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },

    { url: `${baseUrl}/unidades`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/sobre`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contato`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/venda`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  const vehicles = await prisma.vehicle.findMany({
    where: { status: { not: 'SOLD' } },
    select: { slug: true, updatedAt: true },
  });

  const vehicleRoutes: MetadataRoute.Sitemap = vehicles.map((v) => ({
    url: `${baseUrl}/veiculos/${v.slug}`,
    lastModified: v.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const brands = await prisma.brand.findMany({ select: { slug: true } });
  const brandRoutes: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${baseUrl}/veiculos?brand=${b.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...vehicleRoutes, ...brandRoutes];
}