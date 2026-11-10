"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ShoppingBag, Flame, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";

const PORTALS = [
  { href: "/login", label: "Cổng khách hàng", hint: "Đặt sỉ, đặt lịch nặn gốm, lưu tác phẩm", icon: ShoppingBag, tile: "tile-lam" },
  { href: "/login/artisan", label: "Cổng nghệ nhân", hint: "Quản lý xưởng, lô sản xuất, chào giá", icon: Flame, tile: "tile-dat" },
  { href: "/login/admin", label: "Cổng Ban quản lý", hint: "Duyệt hộ nghề, điều phối, bản tin", icon: ShieldCheck, tile: "tile-ngoc" },
];

/** Nút "Đăng nhập" mở ra ba cổng riêng – mỗi vai trò một cửa. */
export function LoginPortals() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-1 rounded-[var(--radius-tile)] px-3 py-2 text-sm font-semibold text-muc transition hover:bg-nga-dam"
      >
        Đăng nhập <ChevronDown className={cn("size-4 text-tro transition-transform duration-300", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-12 z-50 w-80 rounded-[10px] border border-vua bg-vua p-1.5 shadow-lift"
          >
            <div className="grid gap-1.5">
              {PORTALS.map((p, i) => (
                <motion.div key={p.href} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                  <Link
                    href={p.href}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className="tile glaze flex items-center gap-3 bg-su p-3"
                  >
                    <span className={cn("tile grid size-10 shrink-0 place-items-center text-giay", p.tile)}>
                      <p.icon className="size-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{p.label}</span>
                      <span className="block text-xs text-tro">{p.hint}</span>
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
