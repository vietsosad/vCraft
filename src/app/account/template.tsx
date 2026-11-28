import type { ReactNode } from "react";

/** Mỗi lần đổi điểm dừng, trang mới hiện ra trong 0.2s (không trượt, không chặn đọc). */
export default function AccountTemplate({ children }: { children: ReactNode }) {
  return <div className="lang-page">{children}</div>;
}
