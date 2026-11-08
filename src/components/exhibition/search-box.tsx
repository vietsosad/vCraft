"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Search } from "lucide-react";
import { api } from "@/lib/api-client";
import { formatVnd } from "@/lib/format";

type Suggest = {
  products: { slug: string; name: string; priceVnd: number }[];
  artisans: { slug: string; workshopName: string; artisanName: string }[];
};

/**
 * Ô tìm kiếm có gợi ý tức thì: debounce 250ms, hủy request cũ bằng AbortController,
 * điều hướng bằng phím ↑ ↓ Enter, tìm không dấu ("binh hut loc" → "Bình hút lộc").
 */
export function SearchBox({ value, onSubmit }: { value: string; onSubmit: (q: string) => void }) {
  const [q, setQ] = useState(value);
  const [data, setData] = useState<Suggest | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => setQ(value), [value]);

  useEffect(() => {
    if (q.trim().length < 2) {
      setData(null);
      return;
    }
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        setData(await api<Suggest>(`/api/search/suggest?q=${encodeURIComponent(q)}`, { signal: ctrl.signal }));
        setActive(-1);
      } catch {
        /* bị hủy hoặc lỗi mạng */
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [q]);

  const items = [
    ...(data?.artisans ?? []).map((a) => ({ href: `/artisans/${a.slug}`, label: a.workshopName, meta: a.artisanName })),
    ...(data?.products ?? []).map((p) => ({ href: `/products/${p.slug}`, label: p.name, meta: formatVnd(p.priceVnd) })),
  ];

  return (
    <div className="relative">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (active >= 0 && items[active]) window.location.href = items[active].href;
          else onSubmit(q.trim());
          setOpen(false);
        }}
      >
        <label htmlFor="product-search" className="sr-only">Tìm tác phẩm hoặc xưởng</label>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ash" />
        <input
          id="product-search"
          role="combobox"
          aria-expanded={open && items.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") setActive((i) => Math.min(i + 1, items.length - 1));
            if (e.key === "ArrowUp") setActive((i) => Math.max(i - 1, -1));
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Tìm “binh hut loc”, “men ngoc”, tên xưởng…"
          className="h-12 w-full rounded-full border border-line bg-white pl-10 pr-4 text-[15px] focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/15"
        />
      </form>
      {open && items.length > 0 && (
        <ul id={listId} role="listbox" className="absolute inset-x-0 top-14 z-30 overflow-hidden rounded-lg border border-line bg-white shadow-lift">
          {items.map((it, i) => (
            <li key={it.href} role="option" aria-selected={i === active}>
              <Link href={it.href} className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-bisque ${i === active ? "bg-bisque" : ""}`}>
                <span className="truncate">{it.label}</span>
                <span className="shrink-0 font-mono text-xs text-ash">{it.meta}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
