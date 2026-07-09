import { cn } from "@/lib/utils";
import { STATUS_CONFIG } from "@/lib/utils";
import type { VehicleStatus } from "@prisma/client";

export default function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border",
        config.bg,
        config.color
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", {
        "bg-emerald-400": status === "AVAILABLE",
        "bg-amber-400":   status === "RESERVED",
        "bg-red-400":     status === "SOLD",
      })} />
      {config.label}
    </span>
  );
}
