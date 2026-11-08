"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/primitives";

/**
 * Lớp bọc client: nạp Leaflet bằng next/dynamic với { ssr: false }.
 * Leaflet đụng tới `window` ngay khi import, nên không được chạy ở server –
 * cách này tránh lỗi "window is not defined" mà Server Component vẫn nhúng được bản đồ.
 */
export const VillageMap = dynamic(() => import("./village-leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="relative h-full w-full">
      <Skeleton className="absolute inset-0 rounded-none" />
      <p className="absolute inset-0 grid place-items-center font-mono text-xs text-ash">Đang tải bản đồ làng…</p>
    </div>
  ),
});
