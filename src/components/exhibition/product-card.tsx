import Link from "next/link";
import { QrCode } from "lucide-react";
import type { GlazeType } from "@prisma/client";
import { VImage } from "@/components/ui/vimage";
import { GLAZES } from "@/lib/constants";
import { formatVnd } from "@/lib/format";
import type { MediaImage } from "@/lib/types";
import { FavoriteButton } from "@/components/engagement/favorite-button";

export type ProductCardData = {
  id?: string;
  slug: string;
  name: string;
  glazeType: GlazeType;
  priceVnd: number;
  isUniquePiece: boolean;
  image: MediaImage | null;
  artisan: { workshopName: string; slug: string };
  currentBatch: { batchCode: string } | null;
};

/**
 * Thẻ tác phẩm: viên gốm ảnh 4:5 có bóng men khi rê chuột, nhãn triển lãm phía dưới
 * (mẫu men, tên tác phẩm, xưởng, giá). Nút lưu nằm ngoài liên kết để không lồng phần tử tương tác.
 */
export function ProductCard({
  p,
  priority,
  favorite,
}: {
  p: ProductCardData;
  priority?: boolean;
  favorite?: { on: boolean; can: boolean | "guest" };
}) {
  const glaze = GLAZES[p.glazeType];
  return (
    <article className="group relative">
      <Link href={`/products/${p.slug}`} className="block">
        <div className="tile glaze bg-nga-sau">
          <VImage
            image={p.image}
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            imgClassName="transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
          />
          <div className="absolute left-2.5 top-2.5 z-[3] flex flex-wrap gap-1.5">
            {p.isUniquePiece && <span className="rounded-[4px] bg-dem/85 px-2 py-0.5 text-[11px] font-semibold text-giay backdrop-blur">Độc bản</span>}
          </div>
          {p.currentBatch && (
            <span className="absolute bottom-2.5 left-2.5 z-[3] inline-flex items-center gap-1 rounded-[4px] bg-su/90 px-2 py-0.5 text-[11px] font-semibold text-ngoc backdrop-blur">
              <QrCode className="size-3" aria-hidden /> Có nhật ký lô
            </span>
          )}
        </div>
        <div className="mt-3 flex gap-2.5">
          <span aria-hidden className="mt-1 size-3.5 shrink-0 rounded-[3px] shadow-[inset_0_1px_0_rgb(255_255_255/0.4)] ring-1 ring-muc/10" style={{ background: glaze.color }} />
          <div className="min-w-0">
            <h3 className="font-serif text-[1.25rem] leading-snug transition-colors group-hover:text-lam">{p.name}</h3>
            <p className="truncate text-xs text-tro">
              {glaze.label} · {p.artisan.workshopName}
            </p>
            <p className="mt-1 text-sm font-semibold tabular">{formatVnd(p.priceVnd)}</p>
          </div>
        </div>
      </Link>
      {favorite && p.id && (
        <FavoriteButton productId={p.id} initial={favorite.on} canFavorite={favorite.can} className="absolute right-2.5 top-2.5 z-[4]" />
      )}
    </article>
  );
}
