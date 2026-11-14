"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Chapter = { id: string; label: string };

/**
 * Thanh chỉ chặng ở mép phải (màn rộng): mỗi khúc của trang chủ là một viên nhỏ, viên đang xem sáng lên,
 * rê chuột hiện tên chặng, bấm để tới thẳng chặng đó. Đọc các phần tử có [data-chapter] nên không cần cấu hình.
 */
export function JourneyRail() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [active, setActive] = useState("");

  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>("[data-chapter]")].filter((el) => el.id);
    setChapters(els.map((el) => ({ id: el.id, label: el.dataset.chapter ?? "" })));
    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting ? e.intersectionRect.height : 0);
        let best = "";
        let max = 0;
        for (const [id, h] of visible) if (h > max) [best, max] = [id, h];
        if (best) setActive(best);
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  function go(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const lenis = (window as unknown as { __lenis?: { scrollTo: (t: HTMLElement, o?: object) => void } }).__lenis;
    if (lenis) lenis.scrollTo(el, { offset: -90, duration: 1.4 });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (chapters.length < 3) return null;
  return (
    <nav aria-label="Các chặng của trang" className="no-print fixed right-3 top-1/2 z-[450] hidden -translate-y-1/2 xl:block">
      <ol className="flex flex-col gap-1.5 rounded-[8px] bg-dem/55 p-1.5 backdrop-blur-md">
        {chapters.map((c) => {
          const on = c.id === active;
          return (
            <li key={c.id} className="group relative flex justify-end">
              <button
                type="button"
                onClick={() => go(c.id)}
                aria-current={on ? "location" : undefined}
                aria-label={`Tới chặng ${c.label}`}
                className="grid size-5 place-items-center"
              >
                <span className={cn("block rounded-[2px] transition-all duration-500", on ? "size-3.5 bg-giay" : "size-2 bg-giay/45 group-hover:bg-giay/80")} />
              </button>
              <span className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-[4px] bg-dem px-2 py-1 text-xs font-medium text-giay opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:opacity-100">
                {c.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
