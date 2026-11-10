"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Bộ chạy chuyển động dùng chung cho toàn ứng dụng (một lần, không gắn vào từng thành phần):
 * 1. "Gắn viên": phần tử có [data-reveal] được đánh dấu data-in khi cuộn tới → CSS chạy hiệu ứng tile-set.
 *    Mặc định phần tử luôn hiện; chỉ ẩn chờ khi html có lớp .js (đặt bởi script khởi động).
 * 2. "Bóng men": vệt sáng trên viên .glaze đi theo con trỏ qua biến --mx/--my.
 */
export function MotionRuntime() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.in = "";
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    const scan = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>("[data-reveal]:not([data-in])").forEach((el) => {
        if (reduce) el.dataset.in = "";
        else io.observe(el);
      });
    };
    scan(document);
    const mo = new MutationObserver((muts) => {
      for (const m of muts) m.addedNodes.forEach((n) => n instanceof HTMLElement && (n.matches("[data-reveal]") ? scan(n.parentElement ?? n) : scan(n)));
    });
    mo.observe(document.body, { childList: true, subtree: true });
    // Lưới an toàn: sau 2,5 giây mọi phần tử còn chờ đều hiện (tránh "mất" nội dung nếu observer lỗi)
    const t = window.setTimeout(() => document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-in])").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) el.dataset.in = "";
    }), 2500);
    return () => {
      io.disconnect();
      mo.disconnect();
      window.clearTimeout(t);
    };
  }, [pathname]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.<HTMLElement>(".glaze");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100 - 50}%`);
      el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100 - 50}%`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);

  return null;
}
