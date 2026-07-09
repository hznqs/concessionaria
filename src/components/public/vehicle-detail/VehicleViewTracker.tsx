'use client';

import { useEffect } from 'react';

export function VehicleViewTracker({ vehicleId }: { vehicleId: string }) {
  useEffect(() => {
    fetch(`/api/vehicles/${vehicleId}/views`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {});
  }, [vehicleId]);

  return null;
}
