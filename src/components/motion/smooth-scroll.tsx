"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/**
 * Cuộn mượt có quán tính (Lenis) cho khu công khai – cảm giác lướt như lật một cuốn sách ảnh.
 * Không bật khi người dùng chọn giảm chuyển động; cảm ứng giữ cuộn gốc của thiết bị.
 * Khi đổi trang, đưa về đầu trang ngay lập tức.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 1,
      anchors: { offset: -96 },
      prevent: (node) => !!node.closest?.("dialog, [role='dialog'], .leaflet-container, [data-lenis-prevent]"),
    });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    let raf = requestAnimationFrame(function loop(time) {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  useEffect(() => {
    const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
    if (lenis && !window.location.hash) lenis.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
