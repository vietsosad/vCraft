"use client";

import { useEffect, useRef } from "react";

/**
 * Gợn nước khi nhấn: hai vòng men lam loang ra ngay tại điểm bấm (như mặt sông lúc thả viên sỏi),
 * không chặn điều hướng của liên kết. Bỏ qua khi giảm chuyển động, khi bấm kèm phím bổ trợ, hoặc khi nút bị khóa.
 */
export function LangPress() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const mark = ref.current;
    const surface = mark?.closest(".lang");
    if (!mark || !surface || !mark.animate) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let anim: Animation | undefined;

    const onClick = (e: Event) => {
      if (!(e instanceof MouseEvent) || reduce.matches || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const item = e.target instanceof Element ? e.target.closest("a, button") : null;
      if (!item || item.matches(":disabled, [aria-disabled=true]") || item.closest("[role=dialog]")) return;
      let { clientX: x, clientY: y } = e;
      if (!e.detail) {
        const r = item.getBoundingClientRect();
        x = r.x + r.width / 2;
        y = r.y + r.height / 2;
      }
      anim?.cancel();
      mark.style.left = `${x}px`;
      mark.style.top = `${y}px`;
      anim = mark.animate(
        [
          { opacity: 0.9, scale: 0.35 },
          { opacity: 0.55, scale: 1.15, offset: 0.4 },
          { opacity: 0, scale: 1.9 },
        ],
        { duration: 520, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
      );
    };
    const stop = () => { if (reduce.matches) anim?.cancel(); };
    surface.addEventListener("click", onClick, true);
    reduce.addEventListener("change", stop);
    return () => {
      anim?.cancel();
      surface.removeEventListener("click", onClick, true);
      reduce.removeEventListener("change", stop);
    };
  }, []);

  return (
    <span aria-hidden className="an-gon no-print">
      <span ref={ref} className="gon" />
    </span>
  );
}
