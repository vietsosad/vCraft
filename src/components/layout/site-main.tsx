"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * <main> của khu công khai. Trang chủ "/" giữ nguyên thế giới triển lãm (không gắn lớp nào);
 * mọi trang bên trong mang phạm vi thao tác .ui-operate (chữ Be Vietnam Pro, chuyển động ngắn – xem src/styles/operate.css).
 */
export function SiteMain({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <main id="main" className={pathname === "/" ? undefined : "ui-operate"}>
      {children}
    </main>
  );
}
