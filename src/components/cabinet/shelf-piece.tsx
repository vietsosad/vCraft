import Image from "next/image";
import Link from "next/link";
import type { MediaImage } from "@/lib/types";
import { cutoutFor } from "@/lib/cutouts";
import { VImage } from "@/components/ui/vimage";
import { cn } from "@/lib/cn";

/**
 * Một món trên kệ tủ chè. Ảnh đã tách nền thì món đồ đứng thẳng trên mặt kệ với bóng tiếp đất;
 * ảnh chưa tách được (chụp tại chợ, nền rối) thì đứng trong khung tranh viền chỉ vàng.
 */
export function ShelfPiece({
  href,
  name,
  image,
  label,
  sizes,
  className,
}: {
  href: string;
  name: string;
  image: MediaImage | null | undefined;
  /** chữ khắc dưới chân khung (vd tên xưởng) */
  label?: string;
  sizes: string;
  className?: string;
}) {
  const cut = cutoutFor(image?.src);
  return (
    <Link href={href} className={cn("on-shelf group relative block", className)} title={name}>
      {cut ? (
        <span className="relative block aspect-[4/5]">
          {/* bóng tiếp đất: vệt tối mềm ngay dưới đáy món đồ */}
          <span aria-hidden className="absolute inset-x-[12%] -bottom-[3px] h-[7px] rounded-[50%] bg-[radial-gradient(closest-side,rgb(20_12_8/0.45),transparent)]" />
          <Image src={cut} alt={image?.alt || name} fill sizes={sizes} className="object-contain object-bottom" />
        </span>
      ) : (
        <span className="frame-gilt relative block">
          <VImage image={image} ratio="4/5" sizes={sizes} className="rounded-[2px]" />
          {label && (
            <span className="lacquer absolute inset-x-[3px] bottom-[3px] truncate px-1.5 py-1 text-center font-display text-[10px] text-chi-nhat">{label}</span>
          )}
        </span>
      )}
      <span className="sr-only">{name}</span>
    </Link>
  );
}
