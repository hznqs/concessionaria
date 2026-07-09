import {
  FUEL_LABELS,
  TRANSMISSION_LABELS,
  BODY_TYPE_LABELS,
  formatMileage,
} from "@/lib/utils";
import { FuelType, TransmissionType, BodyType } from "@prisma/client";
import { 
  BadgeCheck, Car, Calendar, Gauge, Fuel, 
  Settings2, CarFront, Palette, DoorOpen 
} from "lucide-react";

type VehicleSpecsProps = {
  vehicle: {
    brand:        { name: string };
    model:        { name: string };
    yearMfr:      number;
    yearModel:    number;
    mileage:      number;
    color:        string;
    doors:        number;
    fuel:         FuelType;
    transmission: TransmissionType;
    bodyType:     BodyType;
  };
};

export default function VehicleSpecs({ vehicle }: VehicleSpecsProps) {
  const specs = [
    { icon: <BadgeCheck size={18} />, label: "Marca",          value: vehicle.brand.name                       },
    { icon: <Car size={18} />,        label: "Modelo",          value: vehicle.model.name                       },
    { icon: <Calendar size={18} />,   label: "Ano Fabricação",  value: String(vehicle.yearMfr)                  },
    { icon: <Calendar size={18} />,   label: "Ano Modelo",      value: String(vehicle.yearModel)                },
    { icon: <Gauge size={18} />,      label: "Quilometragem",   value: formatMileage(vehicle.mileage)            },
    { icon: <Fuel size={18} />,       label: "Combustível",     value: FUEL_LABELS[vehicle.fuel] ?? vehicle.fuel },
    { icon: <Settings2 size={18} />,  label: "Câmbio",         value: TRANSMISSION_LABELS[vehicle.transmission] ?? vehicle.transmission },
    { icon: <CarFront size={18} />,   label: "Carroceria",      value: BODY_TYPE_LABELS[vehicle.bodyType] ?? vehicle.bodyType },
    { icon: <Palette size={18} />,    label: "Cor",             value: vehicle.color                             },
    { icon: <DoorOpen size={18} />,   label: "Portas",          value: `${vehicle.doors} portas`                 },
  ];

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {specs.map((spec, idx) => (
        <div
          key={spec.label}
          className="flex items-center gap-4 px-5 py-3.5 border-b border-ink-200/60 dark:border-white/5 last:border-none
                     hover:bg-ink-100/50 dark:hover:bg-white/[0.02] transition-colors"
        >
          <div className="text-ink-500 dark:text-ink-400">
            {spec.icon}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-ink-500 dark:text-ink-500">
              {spec.label}
            </p>
            <p className="text-ink-900 dark:text-white text-sm font-medium">{spec.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
