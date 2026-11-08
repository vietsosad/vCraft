import type { ReactNode } from "react";
import { VImage } from "@/components/ui/vimage";
import manifest from "../../../public/seed/manifest.json";

/** Bố cục trang xác thực: ảnh làng nghề một bên, biểu mẫu một bên. */
export function AuthShell({ title, subtitle, children, image = "artisan-paint" }: { title: string; subtitle: string; children: ReactNode; image?: keyof typeof manifest }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:px-6 lg:grid-cols-2 lg:items-center">
      <div className="hidden lg:block">
        <VImage image={manifest[image]} ratio="4/5" sizes="45vw" className="rounded-[var(--radius-tile)] shadow-lift" />
      </div>
      <div className="mx-auto w-full max-w-md">
        <p className="eyebrow">vCraft · Bát Tràng</p>
        <h1 className="mt-3 text-4xl md:text-5xl">{title}</h1>
        <p className="mb-8 mt-2 text-ash">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
