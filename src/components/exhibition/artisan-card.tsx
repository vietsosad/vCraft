import Link from "next/link";
import type { GlazeType } from "@prisma/client";
import { CalendarDays } from "lucide-react";
import { VImage } from "@/components/ui/vimage";
import { VerifiedSeal } from "@/components/ui/primitives";
import { GLAZES } from "@/lib/constants";
import type { MediaImage } from "@/lib/types";
import type { OpenState } from "@/lib/opening-hours";
import { cn } from "@/lib/cn";
import { Stars } from "@/components/engagement/stars";

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
  ratingAvg?: number;
  ratingCount?: number;
  experienceOffered?: boolean;
};

/** Gian trưng bày thu nhỏ: ảnh xưởng, trạng thái mở cửa theo giờ Việt Nam, con dấu xác thực, sao đánh giá. */
export function ArtisanCard({ a }: { a: ArtisanCardData }) {
  return (
    <Link href={`/artisans/${a.slug}`} className="tile glaze group block bg-su">
      <div className="relative">
        <VImage image={a.coverImage} ratio="16/10" sizes="(max-width: 768px) 100vw, 33vw" imgClassName="transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]" />
        <span
          className={cn(
            "absolute left-3 top-3 z-[3] inline-flex items-center gap-1.5 rounded-[4px] px-2.5 py-1 text-[11px] font-semibold backdrop-blur",
            a.openState.isOpenNow ? "bg-ngoc-nen/90 text-giay" : "bg-su/90 text-tro",
          )}
        >
          <span className="relative grid size-2 place-items-center">
            {a.openState.isOpenNow && <span className="absolute inset-0 animate-pulse-ring rounded-full bg-[#8fc7b1]" aria-hidden />}
            <span className={cn("relative size-2 rounded-full", a.openState.isOpenNow ? "bg-[#8fc7b1]" : "bg-tro")} />
          </span>
          {a.openState.isOpenNow ? "Đang mở cửa" : "Đang đóng"}
        </span>
        {a.experienceOffered && (
          <span className="absolute right-3 top-3 z-[3] inline-flex items-center gap-1 rounded-[4px] bg-su/90 px-2 py-1 text-[11px] font-semibold text-lam backdrop-blur">
            <CalendarDays className="size-3" aria-hidden /> Nặn gốm
          </span>
        )}
      </div>
      <div className="space-y-2 p-5">
        <div className="flex items-center justify-between gap-2">
          <VerifiedSeal />
          {a.ratingCount ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-tro">
              <Stars value={a.ratingAvg ?? 0} /> {a.ratingAvg?.toFixed(1)} ({a.ratingCount})
            </span>
          ) : null}
        </div>
        <h3 className="font-serif text-2xl transition-colors group-hover:text-lam">{a.workshopName}</h3>
        <p className="text-sm text-tro">
          {a.artisanTitle} {a.artisanName} · từ {a.establishedYear} · đời thứ {a.generation}
        </p>
        {a.tagline && <p className="font-serif text-lg italic text-muc/75">“{a.tagline}”</p>}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {a.specialties.map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5 rounded-[4px] bg-nga-dam px-2 py-0.5 text-[11px] font-medium">
              <span className="size-2.5 rounded-[2px]" style={{ background: GLAZES[s].color }} aria-hidden />
              {GLAZES[s].label}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
