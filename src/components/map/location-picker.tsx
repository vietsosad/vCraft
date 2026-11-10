"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { api } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/primitives";

const PickerMap = dynamic(() => import("./location-picker-map"), { ssr: false, loading: () => <Skeleton className="h-full w-full rounded-none" /> });

/**
 * Chọn vị trí xưởng: kéo ghim hoặc bấm bản đồ → tọa độ tự cập nhật và địa chỉ được tự điền
 * (reverse geocoding qua /api/geocode, có debounce).
 */
export function LocationPicker({ lat, lng, onChange }: { lat: number; lng: number; onChange: (v: { latitude: number; longitude: number; address?: string }) => void }) {
  const [resolving, setResolving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function pick(latitude: number, longitude: number) {
    const lat5 = Number(latitude.toFixed(6));
    const lng5 = Number(longitude.toFixed(6));
    onChange({ latitude: lat5, longitude: lng5 });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setResolving(true);
      try {
        const { address } = await api<{ address: string }>(`/api/geocode?lat=${lat5}&lng=${lng5}`);
        onChange({ latitude: lat5, longitude: lng5, address });
      } finally {
        setResolving(false);
      }
    }, 500);
  }

  return (
    <div>
      <div className="h-64 overflow-hidden rounded-[var(--radius-tile)] border border-vua">
        <PickerMap lat={lat} lng={lng} onPick={pick} />
      </div>
      <p className="mt-1.5 flex items-center gap-1.5 font-mono text-xs text-tro">
        <MapPin className="size-3.5 text-datnung" /> {lat.toFixed(6)}, {lng.toFixed(6)}
        {resolving && <span className="text-datnung">· đang tìm địa chỉ…</span>}
      </p>
    </div>
  );
}
