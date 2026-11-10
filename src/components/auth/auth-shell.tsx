import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VImage } from "@/components/ui/vimage";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import { cn } from "@/lib/cn";
import manifest from "../../../public/seed/manifest.json";

export type Portal = "customer" | "artisan" | "admin";

const PORTAL_STYLE: Record<Portal, { tile: string; name: string; tone: "lam" | "datnung" | "ngoc"; pattern: string[] }> = {
  customer: { tile: "tile-lam", name: "Cổng khách hàng", tone: "lam", pattern: ["tile-hoavan", "tile-lam", "tile-sen", "tile-ran"] },
  artisan: { tile: "tile-dat", name: "Cổng nghệ nhân", tone: "datnung", pattern: ["tile-ran", "tile-dat", "tile-hoavan", "tile-dat"] },
  admin: { tile: "tile-ngoc", name: "Cổng Ban quản lý", tone: "ngoc", pattern: ["tile-ngoc", "tile-hoavan", "tile-ran", "tile-ngoc"] },
};

/**
 * Bố cục trang xác thực: một bức gốm ghép (ảnh thật + viên men của cổng) bên trái,
 * biểu mẫu bên phải. Mỗi cổng đăng nhập mang màu men của khu nó dẫn tới.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  image = "artisan-paint",
  portal = "customer",
  aside,
  wide = false,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  image?: keyof typeof manifest;
  portal?: Portal;
  aside?: ReactNode;
  wide?: boolean;
}) {
  const style = PORTAL_STYLE[portal];
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <div className="grout relative hidden p-6 lg:block">
        <div className="mosaic sticky top-6 h-[calc(100dvh-3rem)] grid-cols-6 grid-rows-6">
          <div data-reveal style={{ ["--d" as string]: "0ms" }} className="tile col-span-4 row-span-6 bg-nga-sau">
            <VImage image={manifest[image]} ratio="auto" sizes="40vw" priority className="h-full" imgClassName="h-full object-cover" />
          </div>
          {style.pattern.map((t, i) => (
            <div key={i} data-reveal style={{ ["--d" as string]: `${120 + i * 90}ms` }} className={cn("tile col-span-2", i === 1 ? "row-span-2" : "row-span-1", t)} />
          ))}
          <div data-reveal style={{ ["--d" as string]: "520ms" }} className={cn("tile col-span-2 row-span-1 flex items-end p-3 text-giay", style.tile)}>
            <p className="font-display text-lg leading-none">{style.name}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col px-4 py-6 md:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 rounded-[var(--radius-tile)] px-2 py-2 text-sm text-tro transition hover:text-muc">
            <ArrowLeft className="size-4" /> Trang triển lãm
          </Link>
          <ThemeToggle />
        </div>
        <div className={cn("mx-auto flex w-full flex-1 flex-col justify-center py-10", wide ? "max-w-2xl" : "max-w-md")}>
          <Logo tone={style.tone} sub={style.name} className="mb-10" />
          <h1 className="title-lg">{title}</h1>
          <p className="mb-8 mt-3 text-tro">{subtitle}</p>
          {children}
          {aside && <div className="mt-10">{aside}</div>}
        </div>
      </div>
    </div>
  );
}

/** Ba cổng ở cuối trang đăng nhập – cho người vào nhầm cửa. */
export function PortalSwitch({ current }: { current: Portal }) {
  const items: { key: Portal; href: string; label: string }[] = [
    { key: "customer", href: "/login", label: "Khách hàng" },
    { key: "artisan", href: "/login/artisan", label: "Nghệ nhân" },
    { key: "admin", href: "/login/admin", label: "Ban quản lý" },
  ];
  return (
    <nav aria-label="Chọn cổng đăng nhập" className="rounded-[10px] bg-vua p-1">
      <ul className="grid grid-cols-3 gap-1 text-center text-sm">
        {items.map((i) => (
          <li key={i.key}>
            <Link
              href={i.href}
              aria-current={i.key === current ? "page" : undefined}
              className={cn(
                "block rounded-[7px] px-2 py-2.5 font-medium transition",
                i.key === current ? cn(PORTAL_STYLE[i.key].tile, "text-giay shadow-soft") : "bg-su text-tro hover:text-muc",
              )}
            >
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
