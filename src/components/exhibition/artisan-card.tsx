import Link from "next/link";
import type { GlazeType } from "@prisma/client";
import { VImage } from "@/components/ui/vimage";
import { VerifiedSeal } from "@/components/ui/primitives";
import { GLAZES } from "@/lib/constants";
import type { MediaImage } from "@/lib/types";
import type { OpenState } from "@/lib/opening-hours";
import { cn } from "@/lib/cn";

export type ArtisanCardData = {
  slug: string;
  workshopName: string;
  artisanName: string;
  artisanTitle: string;
  tagline: string | null;
  establishedYear: number;
  generation: number;
  specialties: GlazeType[];
  coverImage: MediaImage | null;
  openState: OpenState;
};

export function ArtisanCard({ a }: { a: ArtisanCardData }) {
  return (
    <Link href={`/artisans/${a.slug}`} className="group block overflow-hidden rounded-[var(--radius-tile)] border border-line bg-white/70 shadow-soft transition hover:shadow-lift">
      <div className="relative">
        <VImage image={a.coverImage} ratio="16/10" sizes="(max-width: 768px) 100vw, 33vw" imgClassName="transition-transform duration-700 group-hover:scale-[1.03]" />
        <span
          className={cn(
            "absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
            a.openState.isOpenNow ? "bg-celadon text-kaolin" : "bg-kaolin/90 text-ash",
          )}
        >
          <span className={cn("size-1.5 rounded-full", a.openState.isOpenNow ? "bg-kaolin" : "bg-ash")} />
          {a.openState.isOpenNow ? "Đang mở cửa" : "Đang đóng"}
        </span>
      </div>
      <div className="space-y-2 p-5">
        <VerifiedSeal />
        <h3 className="font-display text-2xl group-hover:text-terracotta">{a.workshopName}</h3>
        <p className="text-sm text-ash">
          {a.artisanTitle} {a.artisanName} · từ {a.establishedYear} · đời thứ {a.generation}
        </p>
        {a.tagline && <p className="font-display text-lg italic text-ink/70">“{a.tagline}”</p>}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {a.specialties.map((s) => (
            <span key={s} className="inline-flex items-center gap-1 rounded-full bg-bisque px-2 py-0.5 text-[11px]">
              <span className="size-2 rounded-full" style={{ background: GLAZES[s].color }} />
              {GLAZES[s].label}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
