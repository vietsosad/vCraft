import Image from "next/image";
import type { MediaImage } from "@/lib/types";
import { cn } from "@/lib/cn";

/**
 * Ảnh trưng bày: khung tỷ lệ cố định (không giật bố cục), ảnh mờ giữ chỗ (blur-up),
 * srcset tự sinh và lazy-load qua next/image.
 */
export function VImage({
  image,
  ratio = "4/5",
  sizes = "(max-width: 768px) 50vw, 25vw",
  priority,
  className,
  imgClassName,
}: {
  image: MediaImage | null | undefined;
  ratio?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-bisque-deep", className)} style={{ aspectRatio: ratio }}>
      {image ? (
        <Image
          src={image.src}
          alt={image.alt || ""}
          fill
          sizes={sizes}
          priority={priority}
          placeholder={image.blurDataURL ? "blur" : "empty"}
          blurDataURL={image.blurDataURL}
          className={cn("object-cover", imgClassName)}
        />
      ) : (
        <div className="crackle-bg absolute inset-0" aria-hidden />
      )}
    </div>
  );
}
