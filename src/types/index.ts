import type { VehicleStatus, FuelType, TransmissionType, BodyType } from "@prisma/client";

export type VehicleCard = {
  id:           string;
  title:        string;
  slug:         string;
  price:        number;
  yearMfr:      number;
  yearModel:    number;
  mileage:      number;
  fuel:         FuelType;
  transmission: TransmissionType;
  bodyType:     BodyType;
  status:       VehicleStatus;
  featured:     boolean;
  brand: { name: string; slug: string };
  model: { name: string; slug: string };
  images: { url: string; isCover: boolean; alt: string | null }[];
};

export type CatalogFilters = {
  brand?:        string;
  model?:        string;
  fuel?:         string;
  transmission?: string;
  bodyType?:     string;
  minPrice?:     string;
  maxPrice?:     string;
  sort?:         string;
  page?:         string;
};
