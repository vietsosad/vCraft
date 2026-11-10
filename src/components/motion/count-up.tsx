"use client";

import { useEffect, useRef, useState } from "react";

/** Số đếm dần lên khi cuộn tới (dừng ngay ở giá trị cuối nếu người dùng giảm chuyển động). */
export function CountUp({ value, format = "number", duration = 1100 }: { value: number; format?: "number" | "vnd" | "percent"; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setShown(0);
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 4);
        setShown(value * eased);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  const text =
    format === "vnd"
      ? `${new Intl.NumberFormat("vi-VN").format(Math.round(shown))} ₫`
      : format === "percent"
        ? `${Math.round(shown * 100)}%`
        : new Intl.NumberFormat("vi-VN").format(Math.round(shown));
  return (
    <span ref={ref} className="tabular">
      {text}
    </span>
  );
}
