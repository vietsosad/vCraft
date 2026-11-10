"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ScanLine, Sparkles } from "lucide-react";
import { askConcierge } from "@/components/ai/concierge-drawer";
import { cn } from "@/lib/cn";

export const NAV_ITEMS = [
  { href: "/products", label: "Triển lãm" },
  { href: "/artisans", label: "Nghệ nhân" },
  { href: "/map", label: "Bản đồ làng" },
  { href: "/b2b-quotes", label: "Đặt hàng sỉ" },
  { href: "/news", label: "Bản tin" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Thanh điều hướng chính: viên gốm nhỏ trượt theo mục đang xem (chuyển động liên tục giữa các trang). */
export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Điều hướng chính" className="hidden lg:block">
      <ul className="flex items-center gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href} className="relative">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn("relative block rounded-[var(--radius-tile)] px-3 py-2 text-[15px] font-medium transition-colors", active ? "text-muc" : "text-muc/65 hover:text-muc")}
              >
                {item.label}
              </Link>
              {active && (
                <motion.span
                  layoutId="nav-tile"
                  className="absolute inset-x-3 -bottom-[16px] h-[5px] rounded-[2px] bg-datnung"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function MobileNav({ loggedIn }: { loggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="grid size-10 place-items-center rounded-[var(--radius-tile)] hover:bg-nga-dam"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Đóng menu" : "Mở menu"}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="grout absolute inset-x-0 top-full h-[calc(100dvh-100%)] overflow-y-auto border-b border-vua px-4 pb-10 pt-4"
          >
            <ul className="mosaic grid-cols-2">
              {NAV_ITEMS.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, y: 14, rotate: -2 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ delay: 0.05 + i * 0.04, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(i === 0 && "col-span-2")}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "tile flex min-h-24 items-end p-4 font-display text-[1.7rem] uppercase",
                      isActive(pathname, item.href) ? "tile-lam text-giay" : i % 3 === 1 ? "tile-hoavan text-lam" : "bg-su text-muc",
                    )}
                  >
                    {item.label}
                  </Link>
                </motion.li>
              ))}
              <li>
                <Link href="/scan" className="tile tile-dat flex h-full items-center gap-3 p-4 text-giay">
                  <ScanLine className="size-6 shrink-0" /> <span className="font-semibold leading-tight">Quét tem QR</span>
                </Link>
              </li>
              <li>
                <button type="button" onClick={() => { setOpen(false); askConcierge(""); }} className="tile tile-lam flex h-full w-full items-center gap-3 p-4 text-left text-giay">
                  <Sparkles className="size-6 shrink-0 text-[#f5c9a6]" /> <span className="font-semibold leading-tight">Hỏi Sứ giả AI</span>
                </button>
              </li>
            </ul>
            {!loggedIn && (
              <div className="mt-5 grid gap-2">
                <Link href="/login" className="rounded-[var(--radius-tile)] bg-lam py-3 text-center font-semibold text-on">Đăng nhập khách hàng</Link>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Link href="/login/artisan" className="rounded-[var(--radius-tile)] border border-vua bg-su py-2.5 text-center">Cổng nghệ nhân</Link>
                  <Link href="/login/admin" className="rounded-[var(--radius-tile)] border border-vua bg-su py-2.5 text-center">Cổng Ban quản lý</Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
