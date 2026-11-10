"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, Globe } from "lucide-react";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { ZONES, type Role } from "./zones";

/** Menu tài khoản: chỉ liệt kê các mục thuộc khu của vai trò người dùng. */
export function UserMenu({
  user,
  align = "right",
  showSiteLink = false,
}: {
  user: { name: string; email: string; role: Role; status: string };
  align?: "right" | "left";
  showSiteLink?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const zone = ZONES[user.role];

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

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    router.push(zone.loginHref);
    router.refresh();
  }

  const initials = user.name.split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-[var(--radius-tile)] border border-vua bg-su py-1 pl-1 pr-2 transition hover:border-muc/30"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Tài khoản ${user.name}`}
      >
        <span className={cn("grid size-8 place-items-center rounded-[4px] text-xs font-bold text-giay", zone.avatar)}>{initials}</span>
        <span className="hidden max-w-32 truncate text-sm font-medium md:block">{user.name}</span>
        <ChevronDown className={cn("size-4 text-tro transition-transform duration-300", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute top-12 z-50 w-72 origin-top overflow-hidden rounded-[8px] border border-vua bg-su shadow-lift",
              align === "right" ? "right-0" : "left-0",
            )}
          >
            <div className={cn("px-4 py-3 text-giay", zone.band)}>
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs opacity-80">{user.email}</p>
              <p className="mt-1.5 inline-flex rounded-[3px] bg-giay/15 px-1.5 py-0.5 text-[11px] font-semibold">
                {zone.roleLabel}
                {user.status === "PENDING" && " · chờ duyệt"}
              </p>
            </div>
            <div className="py-1">
              {zone.menu.map((l) => (
                <Link key={l.href} href={l.href} role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-nga-dam">
                  <l.icon className="size-4 text-tro" /> {l.label}
                </Link>
              ))}
              {showSiteLink && (
                <Link href="/" role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-nga-dam">
                  <Globe className="size-4 text-tro" /> Xem trang triển lãm
                </Link>
              )}
            </div>
            <button onClick={logout} role="menuitem" className="flex w-full items-center gap-2.5 border-t border-vua px-4 py-2.5 text-left text-sm hover:bg-nga-dam">
              <LogOut className="size-4 text-tro" /> Đăng xuất
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
