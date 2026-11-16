"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Mỗi lần chuyển ngăn: lòng ngăn kéo trượt ra. Trang tủ chè có cánh tủ riêng nên không trượt. */
export default function AccountTemplate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <div className={pathname === "/account" ? undefined : "drawer-out"}>{children}</div>;
}
