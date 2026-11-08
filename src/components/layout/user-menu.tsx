"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LayoutDashboard, LogOut, ShieldCheck, Store, FileText } from "lucide-react";
import { api } from "@/lib/api-client";

const ROLE_LABEL = { BUYER: "Khách hàng", ARTISAN: "Nghệ nhân", ADMIN: "Ban quản lý" } as const;

export function UserMenu({
  user,
}: {
  user: { name: string; email: string; role: keyof typeof ROLE_LABEL; status: string };
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const links =
    user.role === "ADMIN"
      ? [{ href: "/dashboard/admin", label: "Bảng điều phối BQL", icon: ShieldCheck }]
      : user.role === "ARTISAN"
        ? [
            { href: "/dashboard/artisan", label: "Xưởng của tôi", icon: Store },
            { href: "/dashboard/artisan/quotes", label: "Cơ hội báo giá", icon: FileText },
          ]
        : [{ href: "/b2b-quotes", label: "Yêu cầu báo giá của tôi", icon: LayoutDashboard }];

  const initials = user.name
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-line bg-white/70 py-1 pl-1 pr-2.5 hover:border-ink/30"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="grid size-8 place-items-center rounded-full bg-cobalt font-mono text-xs text-kaolin">{initials}</span>
        <span className="hidden max-w-32 truncate text-sm md:block">{user.name}</span>
        <ChevronDown className="size-4 text-ash" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-12 w-64 overflow-hidden rounded-lg border border-line bg-white shadow-lift">
          <div className="border-b border-line bg-bisque/60 px-4 py-3">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-ash">{user.email}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-terracotta">
              {ROLE_LABEL[user.role]}
              {user.status === "PENDING" && " · chờ duyệt"}
            </p>
          </div>
          {links.map((l) => (
            <Link key={l.href} href={l.href} role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-bisque">
              <l.icon className="size-4 text-ash" /> {l.label}
            </Link>
          ))}
          <button onClick={logout} role="menuitem" className="flex w-full items-center gap-2.5 border-t border-line px-4 py-2.5 text-left text-sm hover:bg-bisque">
            <LogOut className="size-4 text-ash" /> Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
