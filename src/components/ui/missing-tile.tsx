import type { ReactNode } from "react";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/cn";

const TILES = ["tile-lam", "tile-hoavan", "tile-ran", "tile-dat", "tile-sen", "tile-ngoc", "tile-hoavan", null, "tile-lam", "tile-ran", "tile-dat", "tile-sen", "tile-ngoc", "tile-lam", "tile-hoavan"];

/**
 * Trang lỗi kiểu "viên gốm bị thiếu": bức ghép 5×3 với đúng một ô trống mạch vữa –
 * thứ người dùng tìm không có ở đó. Dùng cho 404, 403 và lỗi hệ thống.
 */
export function MissingTile({ code, title, children, actions }: { code: string; title: string; children: ReactNode; actions: ReactNode }) {
  return (
    <main id="main" className="grout grid min-h-dvh place-items-center px-4 py-16">
      <div className="w-full max-w-xl text-center">
        <div className="mb-10 flex justify-center"><Logo /></div>
        <div className="mosaic mx-auto grid w-fit grid-cols-5" aria-hidden>
          {TILES.map((t, i) => (
            <span
              key={i}
              className={cn("size-14 animate-tile-set sm:size-16", t ? cn("tile", t) : "grid place-items-center rounded-[var(--radius-tile)] border-2 border-dashed border-tro/40 bg-nga")}
              style={{ ["--d" as string]: `${i * 40}ms` }}
            >
              {!t && <span className="font-display text-lg text-tro">{code}</span>}
            </span>
          ))}
        </div>
        <h1 className="title-lg mt-10">{title}</h1>
        <div className="mx-auto mt-4 max-w-md text-tro">{children}</div>
        <div className="mt-8 flex flex-wrap justify-center gap-2">{actions}</div>
      </div>
    </main>
  );
}
