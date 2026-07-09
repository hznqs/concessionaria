import { Metadata } from 'next';
import CatalogClient from './CatalogClient';
import { getVehicles, getFacets, VehicleSort } from '@/lib/vehicles';
import { parseAsArrayOf, parseAsString, parseAsStringEnum } from 'nuqs/server';

const searchParamsCache = {
  brandIds: parseAsArrayOf(parseAsString).withDefault([]),
  modelIds: parseAsArrayOf(parseAsString).withDefault([]),
  fuelTypes: parseAsArrayOf(parseAsString).withDefault([]),
  transmissionTypes: parseAsArrayOf(parseAsString).withDefault([]),
  bodyTypes: parseAsArrayOf(parseAsString).withDefault([]),
  colors: parseAsArrayOf(parseAsString).withDefault([]),
  // Catálogo de venda: sempre AVAILABLE — não respeita status vindo da URL
  // (veículos vendidos ficam somente em /veiculos/vendidos).
  statuses: parseAsArrayOf(parseAsString).withDefault(['AVAILABLE']),
  priceMin: parseAsString,
  priceMax: parseAsString,
  mileageMin: parseAsString,
  mileageMax: parseAsString,
  yearModelMin: parseAsString,
  yearModelMax: parseAsString,
  search: parseAsString.withDefault(''),
  sort: parseAsStringEnum(['price_asc', 'price_desc', 'year_desc', 'year_asc', 'mileage_asc', 'mileage_desc', 'created_desc', 'created_asc']).withDefault('created_desc'),
  page: parseAsString.withDefault('1'),
  pageSize: parseAsString.withDefault('12'),
};

const ALLOWED_PUBLIC_STATUSES = ['AVAILABLE'];

export async function generateMetadata({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }): Promise<Metadata> {
  const parsed = Object.fromEntries(
    Object.entries(searchParamsCache).map(([key, parser]) => [
      key,
      parser.parseServerSide(searchParams[key as string] as string),
    ])
  ) as Record<string, unknown>;

  // Canonical sempre aponta para /veiculos (sem filtros) — evita conteúdo
  // duplicado SEO quando múltiplas combinações de filtros são compartilhadas.
  const brandIds = parsed.brandIds as string[] | undefined;
  const modelIds = parsed.modelIds as string[] | undefined;
  const fuelTypes = parsed.fuelTypes as string[] | undefined;
  const hasFilters = !!(brandIds?.length || modelIds?.length || fuelTypes?.length || parsed.priceMin || parsed.priceMax || parsed.search);

  return {
    title: `Veículos | AutoPrime`,
    description: `${(parsed.priceMin || parsed.priceMax ? 'Filtrados: ' : '')}Encontre os melhores veículos com os melhores preços.`,
    alternates: {
      canonical: '/veiculos',
    },
    robots: hasFilters
      ? { index: false, follow: true } // páginas filtradas não indexar
      : { index: true, follow: true },
    openGraph: {
      title: `Veículos | AutoPrime`,
      description: 'Catálogo completo de veículos seminovos e novos.',
    },
  };
}

export default async function CatalogPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const parsed = Object.fromEntries(
    Object.entries(searchParamsCache).map(([key, parser]) => [
      key,
      parser.parseServerSide(searchParams[key as string] as string),
    ])
  ) as {
    brandIds: string[];
    modelIds: string[];
    fuelTypes: string[];
    transmissionTypes: string[];
    bodyTypes: string[];
    colors: string[];
    statuses: string[];
    priceMin: string | undefined;
    priceMax: string | undefined;
    mileageMin: string | undefined;
    mileageMax: string | undefined;
    yearModelMin: string | undefined;
    yearModelMax: string | undefined;
    search: string;
    sort: VehicleSort;
    page: string;
    pageSize: string;
  };

  const filters = {
    brandIds: parsed.brandIds,
    modelIds: parsed.modelIds,
    fuelTypes: parsed.fuelTypes,
    transmissionTypes: parsed.transmissionTypes,
    bodyTypes: parsed.bodyTypes,
    colors: parsed.colors,
    // Força AVAILABLE — ignora qualquer status informado na URL para avoids
    // vazar veículos vendidos/reservados neste catálogo.
    statuses: ALLOWED_PUBLIC_STATUSES,
    priceMin: parsed.priceMin ? Number(parsed.priceMin) : undefined,
    priceMax: parsed.priceMax ? Number(parsed.priceMax) : undefined,
    mileageMin: parsed.mileageMin ? Number(parsed.mileageMin) : undefined,
    mileageMax: parsed.mileageMax ? Number(parsed.mileageMax) : undefined,
    yearModelMin: parsed.yearModelMin ? Number(parsed.yearModelMin) : undefined,
    yearModelMax: parsed.yearModelMax ? Number(parsed.yearModelMax) : undefined,
    search: parsed.search,
    featured: undefined as boolean | undefined,
  };

  const pagination = { page: Number(parsed.page), pageSize: Number(parsed.pageSize) };
  const sort = parsed.sort;

  const [vehiclesResult, facets] = await Promise.all([
    getVehicles(filters, pagination, sort),
    getFacets(filters),
  ]);

  return <CatalogClient initialData={{
    vehicles: vehiclesResult.vehicles.map(v => ({
      ...v,
      fuel: String(v.fuel),
      transmission: String(v.transmission),
      bodyType: String(v.bodyType),
      status: String(v.status),
      price: Number(v.price),
      createdAt: v.createdAt,
    })) as any,
    total: vehiclesResult.total,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages: vehiclesResult.totalPages,
    facets,
  }} />;
}