import Link from "next/link";
import { QrCode } from "lucide-react";
import type { GlazeType } from "@prisma/client";
import { VImage } from "@/components/ui/vimage";
import { GLAZES } from "@/lib/constants";
import { formatVnd } from "@/lib/format";
import type { MediaImage } from "@/lib/types";

export type ProductCardData = {
  slug: string;
  name: string;
  glazeType: GlazeType;
  priceVnd: number;
  isUniquePiece: boolean;
  image: MediaImage | null;
  artisan: { workshopName: string; slug: string };
  currentBatch: { batchCode: string } | null;
};

/** Thẻ tác phẩm kiểu nhãn triển lãm: ảnh 4:5, tên serif, xưởng, dòng men, giá. */
export function ProductCard({ p, priority }: { p: ProductCardData; priority?: boolean }) {
  return (
    <article className="group">
      <Link href={`/products/${p.slug}`} className="block">
        <div className="relative overflow-hidden rounded-[var(--radius-tile)]">
          <VImage
            image={p.image}
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            imgClassName="transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
            {p.isUniquePiece && (
              <span className="rounded-full bg-ink/85 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-kaolin">Độc bản</span>
            )}
          </div>
          {p.currentBatch && (
            <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-kaolin/90 px-2 py-0.5 font-mono text-[10px] text-celadon">
              <QrCode className="size-3" /> Truy xuất
            </span>
          )}
        </div>
        <div className="mt-3 space-y-0.5">
          <p className="flex items-center gap-1.5 text-xs text-ash">
            <span className="size-2 rounded-full ring-1 ring-ink/10" style={{ background: GLAZES[p.glazeType].color }} />
            {GLAZES[p.glazeType].label} · {p.artisan.workshopName}
          </p>
          <h3 className="font-display text-[1.3rem] leading-snug group-hover:text-terracotta">{p.name}</h3>
          <p className="font-mono text-sm tabular text-ink/80">{formatVnd(p.priceVnd)}</p>
        </div>
      </Link>
    </article>
  );
}
