import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { unstable_cache } from 'next/cache';
import { VehicleStatus, FuelType, TransmissionType, BodyType, Prisma } from '@prisma/client';

export const VehicleFiltersSchema = z.object({
  brandIds: z.array(z.string()).optional(),
  modelIds: z.array(z.string()).optional(),
  yearMfrMin: z.coerce.number().optional(),
  yearMfrMax: z.coerce.number().optional(),
  yearModelMin: z.coerce.number().optional(),
  yearModelMax: z.coerce.number().optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  mileageMin: z.coerce.number().optional(),
  mileageMax: z.coerce.number().optional(),
  fuelTypes: z.array(z.string()).optional(),
  transmissionTypes: z.array(z.string()).optional(),
  bodyTypes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  statuses: z.array(z.string()).optional(),
  featured: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

export type VehicleFilters = z.infer<typeof VehicleFiltersSchema>;

export const VehicleSortSchema = z.enum([
  'price_asc',
  'price_desc',
  'year_desc',
  'year_asc',
  'mileage_asc',
  'mileage_desc',
  'created_desc',
  'created_asc',
]);

export type VehicleSort = z.infer<typeof VehicleSortSchema>;

export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(12),
});

export type Pagination = z.infer<typeof PaginationSchema>;

type FacetWhere = Omit<VehicleFilters, 'featured' | 'statuses'> & { statuses?: string[] };

function buildVehicleWhere(filters: VehicleFilters): Prisma.VehicleWhereInput {
  const where: Prisma.VehicleWhereInput = {};

  if (filters.brandIds?.length) where.brandId = { in: filters.brandIds };
  if (filters.modelIds?.length) where.modelId = { in: filters.modelIds };
  if (filters.fuelTypes?.length) where.fuel = { in: filters.fuelTypes as FuelType[] };
  if (filters.transmissionTypes?.length) where.transmission = { in: filters.transmissionTypes as TransmissionType[] };
  if (filters.bodyTypes?.length) where.bodyType = { in: filters.bodyTypes as BodyType[] };
  if (filters.colors?.length) where.color = { in: filters.colors };
  if (filters.statuses?.length) where.status = { in: filters.statuses as VehicleStatus[] };
  if (filters.featured !== undefined) where.featured = filters.featured;

  if (filters.yearMfrMin || filters.yearMfrMax) {
    where.yearMfr = {};
    if (filters.yearMfrMin) where.yearMfr.gte = filters.yearMfrMin;
    if (filters.yearMfrMax) where.yearMfr.lte = filters.yearMfrMax;
  }

  if (filters.yearModelMin || filters.yearModelMax) {
    where.yearModel = {};
    if (filters.yearModelMin) where.yearModel.gte = filters.yearModelMin;
    if (filters.yearModelMax) where.yearModel.lte = filters.yearModelMax;
  }

  if (filters.priceMin || filters.priceMax) {
    where.price = {};
    if (filters.priceMin) where.price.gte = filters.priceMin;
    if (filters.priceMax) where.price.lte = filters.priceMax;
  }

  if (filters.mileageMin || filters.mileageMax) {
    where.mileage = {};
    if (filters.mileageMin) where.mileage.gte = filters.mileageMin;
    if (filters.mileageMax) where.mileage.lte = filters.mileageMax;
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { brand: { name: { contains: filters.search, mode: 'insensitive' } } },
      { model: { name: { contains: filters.search, mode: 'insensitive' } } },
    ];
  }

  return where;
}

function resolveOrderBy(sort: VehicleSort): Prisma.VehicleOrderByWithRelationInput {
  switch (sort) {
    case 'price_asc': return { price: 'asc' };
    case 'price_desc': return { price: 'desc' };
    case 'year_desc': return { yearModel: 'desc' };
    case 'year_asc': return { yearModel: 'asc' };
    case 'mileage_asc': return { mileage: 'asc' };
    case 'mileage_desc': return { mileage: 'desc' };
    case 'created_asc': return { createdAt: 'asc' };
    default: return { createdAt: 'desc' };
  }
}

async function fetchVehiclesUncached(filters: VehicleFilters = {}, pagination: Pagination = { page: 1, pageSize: 12 }, sort: VehicleSort = 'created_desc') {
  const where = buildVehicleWhere(filters);
  const orderBy = resolveOrderBy(sort);

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      orderBy,
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
      include: {
        brand: true,
        model: true,
        images: { where: { isCover: true }, take: 1 },
      },
    }),
    prisma.vehicle.count({ where }),
  ]);

  return { vehicles, total, totalPages: Math.ceil(total / pagination.pageSize) };
}

export const getVehicles = unstable_cache(
  fetchVehiclesUncached,
  ['vehicles-list'],
  { revalidate: 60, tags: ['vehicles'] },
);

export async function getBrands() {
  return prisma.brand.findMany({
    where: { models: { some: { vehicles: { some: { status: 'AVAILABLE' } } } } },
    include: { _count: { select: { models: true } } },
    orderBy: { name: 'asc' },
  });
}

export async function getModels(brandId?: string) {
  return prisma.carModel.findMany({
    where: {
      brandId: brandId ?? undefined,
      vehicles: { some: { status: 'AVAILABLE' } },
    },
    orderBy: { name: 'asc' },
  });
}

export async function getPriceRange() {
  const agg = await prisma.vehicle.aggregate({
    where: { status: 'AVAILABLE' },
    _min: { price: true },
    _max: { price: true },
  });
  return { min: Number(agg._min.price ?? 0), max: Number(agg._max.price ?? 0) };
}

export async function getMileageRange() {
  const agg = await prisma.vehicle.aggregate({
    where: { status: 'AVAILABLE' },
    _min: { mileage: true },
    _max: { mileage: true },
  });
  return { min: agg._min.mileage ?? 0, max: agg._max.mileage ?? 0 };
}

export async function getYearRange() {
  const agg = await prisma.vehicle.aggregate({
    where: { status: 'AVAILABLE' },
    _min: { yearModel: true },
    _max: { yearModel: true },
  });
  return { min: agg._min.yearModel ?? new Date().getFullYear(), max: agg._max.yearModel ?? new Date().getFullYear() };
}

async function fetchFacetsUncached(filters: FacetWhere = {}) {
  const where: Prisma.VehicleWhereInput = { status: 'AVAILABLE' };

  if (filters.brandIds?.length) where.brandId = { in: filters.brandIds };
  if (filters.modelIds?.length) where.modelId = { in: filters.modelIds };
  if (filters.fuelTypes?.length) where.fuel = { in: filters.fuelTypes as FuelType[] };
  if (filters.transmissionTypes?.length) where.transmission = { in: filters.transmissionTypes as TransmissionType[] };
  if (filters.bodyTypes?.length) where.bodyType = { in: filters.bodyTypes as BodyType[] };
  if (filters.colors?.length) where.color = { in: filters.colors };

  if (filters.yearMfrMin || filters.yearMfrMax) {
    where.yearMfr = {};
    if (filters.yearMfrMin) where.yearMfr.gte = filters.yearMfrMin;
    if (filters.yearMfrMax) where.yearMfr.lte = filters.yearMfrMax;
  }
  if (filters.yearModelMin || filters.yearModelMax) {
    where.yearModel = {};
    if (filters.yearModelMin) where.yearModel.gte = filters.yearModelMin;
    if (filters.yearModelMax) where.yearModel.lte = filters.yearModelMax;
  }
  if (filters.priceMin || filters.priceMax) {
    where.price = {};
    if (filters.priceMin) where.price.gte = filters.priceMin;
    if (filters.priceMax) where.price.lte = filters.priceMax;
  }
  if (filters.mileageMin || filters.mileageMax) {
    where.mileage = {};
    if (filters.mileageMin) where.mileage.gte = filters.mileageMin;
    if (filters.mileageMax) where.mileage.lte = filters.mileageMax;
  }

  const [brands, models, fuels, transmissions, bodyTypes, colors, priceRange, mileageRange, yearRange] = await Promise.all([
    prisma.brand.findMany({
      where: { vehicles: { some: where } },
      select: { id: true, name: true, _count: { select: { vehicles: { where } } } },
      orderBy: { name: 'asc' },
    }),
    prisma.carModel.findMany({
      where: { vehicles: { some: where } },
      select: { id: true, name: true, brandId: true, _count: { select: { vehicles: { where } } } },
      orderBy: { name: 'asc' },
    }),
    prisma.vehicle.groupBy({ by: ['fuel'], where, _count: { fuel: true } }),
    prisma.vehicle.groupBy({ by: ['transmission'], where, _count: { transmission: true } }),
    prisma.vehicle.groupBy({ by: ['bodyType'], where, _count: { bodyType: true } }),
    prisma.vehicle.groupBy({ by: ['color'], where, _count: { color: true } }),
    prisma.vehicle.aggregate({ where, _min: { price: true }, _max: { price: true } }),
    prisma.vehicle.aggregate({ where, _min: { mileage: true }, _max: { mileage: true } }),
    prisma.vehicle.aggregate({ where, _min: { yearModel: true }, _max: { yearModel: true } }),
  ]);

  return {
    brands: brands.map(b => ({ id: b.id, name: b.name, count: b._count.vehicles })),
    models: models.map(m => ({ id: m.id, name: m.name, brandId: m.brandId, count: m._count.vehicles })),
    fuels: fuels.map(f => ({ value: f.fuel, count: f._count.fuel })),
    transmissions: transmissions.map(t => ({ value: t.transmission, count: t._count.transmission })),
    bodyTypes: bodyTypes.map(b => ({ value: b.bodyType, count: b._count.bodyType })),
    colors: colors.map(c => ({ value: c.color, count: c._count.color })),
    priceRange: { min: Number(priceRange._min.price ?? 0), max: Number(priceRange._max.price ?? 0) },
    mileageRange: { min: mileageRange._min.mileage ?? 0, max: mileageRange._max.mileage ?? 0 },
    yearRange: { min: yearRange._min.yearModel ?? new Date().getFullYear(), max: yearRange._max.yearModel ?? new Date().getFullYear() },
  };
}

export const getFacets = unstable_cache(
  fetchFacetsUncached,
  undefined,
  { revalidate: 60, tags: ['vehicles'] },
);

async function fetchVehicleBySlugUncached(slug: string) {
  return prisma.vehicle.findFirst({
    where: { slug, status: 'AVAILABLE' },
    include: {
      brand: true,
      model: true,
      images: { orderBy: { order: 'asc' } },
      features: { include: { feature: true } },
    },
  });
}

export const getVehicleBySlug = unstable_cache(
  fetchVehicleBySlugUncached,
  ['vehicle-detail'],
  { revalidate: 60, tags: ['vehicles'] },
);

async function fetchRelatedUncached(args: { vehicleId: string; brandId: string; bodyType: BodyType; limit: number }) {
  return prisma.vehicle.findMany({
    where: {
      id: { not: args.vehicleId },
      brandId: args.brandId,
      bodyType: args.bodyType,
      status: 'AVAILABLE',
    },
    take: args.limit,
    include: {
      brand: true,
      model: true,
      images: { where: { isCover: true }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export function getRelatedVehicles(vehicleId: string, brandId: string, bodyType: BodyType, limit = 6) {
  return unstable_cache(
    () => fetchRelatedUncached({ vehicleId, brandId, bodyType, limit }),
    ['vehicle-related', vehicleId],
    { revalidate: 60, tags: ['vehicles'] },
  )();
}

export type VehicleWithRelations = {
  id: string;
  slug: string;
  title: string;
  yearMfr: number;
  yearModel: number;
  price: number;
  mileage: number;
  fuel: string;
  transmission: string;
  bodyType: string;
  color: string;
  doors: number;
  status: string;
  featured: boolean;
  createdAt: Date | null;
  brand: { id: string; name: string };
  model: { id: string; name: string };
  images: { id: string; url: string; isCover: boolean; alt: string | null }[];
};

export type FacetsData = {
  brands: { id: string; name: string; count: number }[];
  models: { id: string; name: string; brandId: string; count: number }[];
  fuels: { value: string; count: number }[];
  transmissions: { value: string; count: number }[];
  bodyTypes: { value: string; count: number }[];
  colors: { value: string; count: number }[];
  priceRange: { min: number; max: number };
  mileageRange: { min: number; max: number };
  yearRange: { min: number; max: number };
};