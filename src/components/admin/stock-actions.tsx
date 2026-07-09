"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2, Eye, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import type { VehicleStatus } from "@prisma/client";

interface StockActionsProps {
  vehicleId:     string;
  currentStatus: VehicleStatus;
  slug:          string;
}

export default function StockActions({ vehicleId, currentStatus, slug }: StockActionsProps) {
  const router  = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function toggleStatus() {
    const next = currentStatus === "AVAILABLE" ? "SOLD" : "AVAILABLE";
    setLoading("status");
    try {
      const res = await apiFetch(`/api/vehicles/${vehicleId}`, {
        method: "PUT",
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) console.error(await res.text());
      router.refresh();
    } catch (err) {
      console.error("Erro ao alternar status:", err);
    } finally {
      setLoading(null);
    }
  }

  async function deleteVehicle() {
    if (!confirm("Excluir este veículo? Esta ação não pode ser desfeita.")) return;
    setLoading("delete");
    try {
      const res = await apiFetch(`/api/vehicles/${vehicleId}`, { method: "DELETE" });
      if (!res.ok) console.error(await res.text());
      router.refresh();
    } catch (err) {
      console.error("Erro ao excluir veículo:", err);
    } finally {
      setLoading(null);
    }
  }

  const isSold = currentStatus === "SOLD";

  return (
    <div className="flex items-center gap-1.5">
      {/* Preview */}
      <Link
        href={`/veiculos/${slug}`}
        target="_blank"
        className="p-2 rounded-lg glass text-ink-400 hover:text-primary-400 transition-colors"
        title="Ver na vitrine"
      >
        <Eye size={14} />
      </Link>

      {/* Edit */}
      <Link
        href={`/painel/estoque/${vehicleId}`}
        className="p-2 rounded-lg glass text-ink-400 hover:text-amber-400 transition-colors"
        title="Editar"
      >
        <Pencil size={14} />
      </Link>

      {/* Toggle status */}
      <button
        onClick={toggleStatus}
        disabled={!!loading}
        className="p-2 rounded-lg glass text-ink-400 hover:text-emerald-400 transition-colors disabled:opacity-50"
        title={isSold ? "Marcar como Disponível" : "Marcar como Vendido"}
      >
        {loading === "status"
          ? <Loader2 size={14} className="animate-spin" />
          : isSold ? <ToggleLeft size={14} /> : <ToggleRight size={14} />
        }
      </button>

      {/* Delete */}
      <button
        onClick={deleteVehicle}
        disabled={!!loading}
        className="p-2 rounded-lg glass text-ink-400 hover:text-red-400 transition-colors disabled:opacity-50"
        title="Excluir"
      >
        {loading === "delete"
          ? <Loader2 size={14} className="animate-spin" />
          : <Trash2 size={14} />
        }
      </button>
    </div>
  );
}
