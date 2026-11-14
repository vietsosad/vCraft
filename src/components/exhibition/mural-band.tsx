import Link from "next/link";
import type { MediaImage } from "@/lib/types";
import { VImage } from "@/components/ui/vimage";
import { RevealText } from "@/components/motion/reveal-text";

/**
 * "Con đường gốm sứ" thật: hai hàng ảnh chụp bức tranh gốm ghép ven sông Hồng trôi ngược chiều nhau
 * theo tiến độ cuộn (biến --p do bộ chạy chuyển động cấp). Đây là hình mẫu của cả giao diện:
 * mỗi viên gốm là một phần của bức tranh chung. Giảm chuyển động thì hai hàng đứng yên.
 */
export function MuralBand({ top, bottom }: { top: MediaImage[]; bottom: MediaImage[] }) {
  const row = (images: MediaImage[], dir: "to-left" | "to-right") => (
    <div className={`mural-row ${dir}`}>
      {[...images, ...images].map((img, i) => (
        <figure key={img.src + i} className="tile w-[min(64vw,420px)] shrink-0" aria-hidden={i >= images.length}>
          <VImage image={img} ratio="3/2" sizes="(max-width: 768px) 64vw, 420px" />
        </figure>
      ))}
    </div>
  );
  return (
    <section id="con-duong-gom-su" data-chapter="Con đường gốm sứ" aria-label="Con đường gốm sứ ven sông Hồng" className="overflow-hidden bg-dem py-20 text-giay md:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-end md:px-6">
        <RevealText as="h2" text="Và làng ghép nên một con đường" className="block font-display text-[clamp(2.2rem,4.6vw,4.2rem)] uppercase leading-[0.95]" />
        <p data-reveal style={{ ["--d" as string]: "200ms", ["--rot" as string]: "0deg" }} className="max-w-xl text-giay/75">
          Gần bốn cây số tranh ghép gốm chạy dọc đê sông Hồng, hoàn thành dịp Đại lễ 1000 năm Thăng Long, phần lớn làm từ gốm Bát Tràng.
          Mỗi mảnh nhỏ chẳng nói được gì, đặt cạnh nhau thì thành thuyền rồng, khóm tre, cổng làng. vCraft mượn đúng cách ấy:
          mỗi xưởng, mỗi lô, mỗi tác phẩm là một viên trong bức ghép chung.
        </p>
      </div>
      <div data-progress="through" className="mt-12 space-y-[6px]">
        {row(top, "to-left")}
        {row(bottom, "to-right")}
      </div>
      <p className="mx-auto mt-6 max-w-[1440px] px-4 text-xs text-giay/55 md:px-6">
        Ảnh chụp Con đường gốm sứ ven sông Hồng, Hà Nội, từ Wikimedia Commons.{" "}
        <Link href="/credits" className="underline underline-offset-4 hover:text-giay">Xem ghi công</Link>
      </p>
    </section>
  );
}
