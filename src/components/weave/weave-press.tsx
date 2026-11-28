"use client";

import { useEffect, useRef } from "react";

const interactive = [
  ".account-nav-link", ".account-task", ".account-letter-preview", ".account-link",
  ".account-tool", ".account-user-trigger", ".account-brand", ".account-site-link",
  ".account-filter-link", ".account-hero-summary a", ".account-piece",
  ".btn-moc", ".btn-soi", ".patch.lift a",
].join(",");

/** Dấu nhỏ hiện ngay tại điểm kích hoạt và không chặn điều hướng của liên kết. */
export function WeavePress() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const stamp = ref.current;
    const surface = stamp?.closest(".det");
    if (!stamp || !surface || !stamp.animate) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animation: Animation | undefined;

    const onClick = (event: Event) => {
      if (!(event instanceof MouseEvent) || reducedMotion.matches || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const item = event.target instanceof Element ? event.target.closest("a, button") : null;
      if (!item?.matches(interactive) || item.matches(":disabled, [aria-disabled=true]")) return;

      let { clientX: x, clientY: y } = event;
      if (!event.detail) {
        const bounds = item.getBoundingClientRect();
        x = bounds.x + bounds.width / 2;
        y = bounds.y + bounds.height / 2;
      }

      animation?.cancel();
      stamp.style.left = `${x}px`;
      stamp.style.top = `${y}px`;
      animation = stamp.animate([
        { opacity: 0.86, scale: 0.45 },
        { opacity: 0.5, scale: 1.1, offset: 0.35 },
        { opacity: 0, scale: 1.75 },
      ], { duration: 480, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
    };

    const stop = () => { if (reducedMotion.matches) animation?.cancel(); };
    surface.addEventListener("click", onClick, true);
    reducedMotion.addEventListener("change", stop);
    return () => {
      animation?.cancel();
      surface.removeEventListener("click", onClick, true);
      reducedMotion.removeEventListener("change", stop);
    };
  }, []);

  return (
    <span aria-hidden="true" className="account-press-layer no-print">
      <span ref={ref} className="account-press-mark" />
    </span>
  );
}
