import Link from "next/link";
import { ArrowRight, Handshake, QrCode, Moon } from "lucide-react";
import type { MediaImage } from "@/lib/types";
import { VImage } from "@/components/ui/vimage";

type Piece = { image: MediaImage | null; href: string; name: string };

/**
 * Khoảnh khắc mở màn: bức tường gốm ghép tự "gắn" từng viên vào lưới mạch vữa,
 * lan ra từ viên biển hiệu ở giữa (như thợ ghép đặt viên chủ trước rồi tỏa dần).
 * Viên ảnh là tác phẩm thật trong triển lãm; viên men là hoa văn lam, men rạn, sen, đất nung, men ngọc.
 * Lưới 12 cột × 6 hàng trên máy tính, viên biển hiệu chiếm 6 cột × 5 hàng để cả bức nằm gọn trong màn hình đầu.
 */
export function MosaicHero({
  pieces,
  hands,
  openNow,
  nextOpen,
  verified,
  traceCode,
}: {
  pieces: Piece[];
  hands: MediaImage;
  openNow: number;
  /** nhãn giờ mở cửa sớm nhất khi chưa xưởng nào mở, ví dụ "mở lại 07:30 sáng mai" */
  nextOpen: string | null;
  verified: number;
  traceCode: string;
}) {
  const p = (i: number) => pieces[i % pieces.length];
  const delay = (d: number) => ({ ["--d" as string]: `${120 + d * 85}ms` });
  const set = (rot: number, tx: number, ty: number) => ({ ["--rot" as string]: `${rot}deg`, ["--tx" as string]: `${tx}px`, ["--ty" as string]: `${ty}px` });
  const live = openNow > 0;
  // "Đóng cửa · mở lại 07:30 sáng mai" → { time: "07:30", when: "sáng mai" }: giờ to, chữ ngắn để ô hẹp vẫn gọn
  const m = nextOpen?.match(/(\d{2}:\d{2})\s*(.*)$/);
  const opening = m ? { time: m[1], when: m[2] || "hôm nay" } : null;

  return (
    <section aria-label="Giới thiệu vCraft" className="grout px-3 pb-10 pt-4 sm:px-4 md:px-6 md:pt-5">
      <div className="mosaic mx-auto max-w-[1440px] grid-flow-row-dense grid-cols-6 auto-rows-[minmax(64px,auto)] md:grid-cols-12 md:auto-rows-[minmax(clamp(56px,6.2vw,92px),auto)]">
        {/* Viên biển hiệu */}
        <div
          className="tile tile-lam col-span-6 row-span-4 flex animate-tile-set flex-col justify-between gap-6 p-6 text-giay sm:p-8 md:col-start-4 md:row-span-5 md:row-start-1 md:p-9"
          style={{ ...delay(0), ...set(0, 0, 14) }}
        >
          <h1 className="font-display text-[clamp(2.5rem,4.6vw,4.2rem)] font-extrabold uppercase leading-[0.95]">
            Tinh hoa làng nghề,
            <br />
            <span className="inline-block text-balance text-[#f5c9a6]">muôn phương lan tỏa</span>
          </h1>
          <p className="max-w-xl text-[17px] leading-relaxed text-giay/85">
            Mỗi món gốm ở đây là một viên trong bức ghép của cả làng Bát Tràng, và bạn kiểm chứng được nó: quét tem QR để xem từ ngày ngâm đất
            tới khi ra lò 1.300°C.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Link href="/products" className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-tile)] bg-giay px-6 font-semibold text-[#163a73] shadow-soft transition hover:bg-white">
              Vào phòng triển lãm <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link href="/b2b-quotes" className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-tile)] bg-giay/12 px-5 font-semibold text-giay ring-1 ring-inset ring-giay/30 transition hover:bg-giay/20">
              <Handshake className="size-4" aria-hidden /> Đặt hàng sỉ
            </Link>
          </div>
        </div>

        {/* Cột trái */}
        <Link href={p(0).href} aria-label={p(0).name} className="tile glaze col-span-3 row-span-2 animate-tile-set md:col-start-1 md:row-start-1" style={{ ...delay(3), ...set(-4, -18, 10) }}>
          <VImage image={p(0).image} ratio="auto" sizes="25vw" priority className="h-full" imgClassName="h-full" />
        </Link>
        <span aria-hidden className="tile tile-hoavan col-span-1 row-span-1 hidden animate-tile-set md:col-start-1 md:row-start-3 md:block" style={{ ...delay(3), ...set(5, -10, 12) }} />
        <span aria-hidden className="tile tile-dat col-span-1 row-span-1 hidden animate-tile-set md:col-start-2 md:row-start-3 md:block" style={{ ...delay(2), ...set(-3, -8, 16) }} />
        <Link
          href="/map"
          className="tile glaze tile-ngoc col-span-3 row-span-2 flex animate-tile-set flex-col justify-between p-4 text-giay md:col-span-1 md:col-start-3 md:row-span-3 md:row-start-3"
          style={{ ...delay(1), ...set(3, -6, 12) }}
        >
          {live ? (
            <span className="relative grid size-3 place-items-center" aria-hidden>
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-[#8fc7b1]" />
              <span className="relative size-3 rounded-full bg-[#8fc7b1]" />
            </span>
          ) : (
            <Moon className="size-4 text-giay/70" aria-hidden />
          )}
          {live ? (
            <span>
              <span className="block font-display text-4xl leading-none">{openNow}</span>
              <span className="block text-xs leading-tight text-giay/85">xưởng đang mở cửa</span>
            </span>
          ) : (
            <span className="leading-tight">
              <span className="block text-xs font-semibold text-giay/85">Đang nghỉ</span>
              {opening ? (
                <>
                  <span className="block font-display text-[1.7rem] leading-none">{opening.time}</span>
                  <span className="block text-xs text-giay/80">{opening.when}</span>
                </>
              ) : (
                <span className="block text-xs text-giay/80">xem giờ mở cửa</span>
              )}
            </span>
          )}
        </Link>
        <Link href={p(1).href} aria-label={p(1).name} className="tile glaze col-span-3 row-span-2 animate-tile-set md:col-span-2 md:col-start-1 md:row-start-4" style={{ ...delay(3), ...set(-2, -14, 18) }}>
          <VImage image={p(1).image} ratio="auto" sizes="20vw" className="h-full" imgClassName="h-full" />
        </Link>
        <span aria-hidden className="tile tile-ran col-span-3 row-span-1 hidden animate-tile-set md:col-start-1 md:row-start-6 md:block" style={{ ...delay(4), ...set(-5, -20, 18) }} />

        {/* Hàng dưới viên biển hiệu */}
        <Link
          href={`/trace/${traceCode}`}
          className="tile glaze col-span-6 row-span-1 flex animate-tile-set items-center gap-4 bg-su p-4 md:col-span-3 md:col-start-4 md:row-start-6"
          style={{ ...delay(1), ...set(2, 0, 20) }}
        >
          <span className="tile tile-lam grid size-12 shrink-0 place-items-center text-giay"><QrCode className="size-6" aria-hidden /></span>
          <span className="min-w-0">
            <span className="block font-serif text-lg font-bold leading-tight">Quét tem, xem cả hành trình</span>
            <span className="code text-tro">{traceCode} · 6 công đoạn</span>
          </span>
        </Link>
        <span aria-hidden className="tile tile-sen col-span-1 row-span-1 hidden animate-tile-set md:col-start-7 md:row-start-6 md:block" style={{ ...delay(1), ...set(-3, 0, 18) }} />
        <Link href="/artisans" className="tile glaze col-span-6 row-span-1 flex animate-tile-set items-center gap-3 bg-su px-4 py-3 md:col-span-2 md:col-start-8 md:row-start-6" style={{ ...delay(2), ...set(4, 6, 16) }}>
          <svg viewBox="0 0 24 24" className="size-8 shrink-0 -rotate-3 text-doson" aria-hidden>
            <rect x="1.5" y="1.5" width="21" height="21" rx="2.5" fill="currentColor" />
            <rect x="4" y="4" width="16" height="16" rx="1" fill="none" stroke="#fffdf8" strokeWidth="1.1" />
            <path d="m7.6 12.4 2.9 2.9 5.9-6.4" fill="none" stroke="#fffdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm leading-tight"><strong className="block">{verified} hộ nghề</strong> do Ban quản lý xác thực</span>
        </Link>

        {/* Cột phải */}
        <Link href={p(3).href} aria-label={p(3).name} className="tile glaze col-span-3 row-span-2 animate-tile-set md:col-start-10 md:row-span-3 md:row-start-1" style={{ ...delay(2), ...set(4, 18, 10) }}>
          <VImage image={hands} ratio="auto" sizes="25vw" priority className="h-full" imgClassName="h-full" />
        </Link>
        <span aria-hidden className="tile tile-ngoc col-span-1 row-span-1 hidden animate-tile-set md:col-start-10 md:row-start-4 md:block" style={{ ...delay(3), ...set(-4, 12, 14) }} />
        <Link href={p(4).href} aria-label={p(4).name} className="tile glaze col-span-3 row-span-2 animate-tile-set md:col-span-2 md:col-start-11 md:row-start-4" style={{ ...delay(3), ...set(5, 20, 14) }}>
          <VImage image={p(4).image} ratio="auto" sizes="18vw" className="h-full" imgClassName="h-full" />
        </Link>
        <span aria-hidden className="tile tile-hoavan col-span-1 row-span-2 hidden animate-tile-set md:col-start-10 md:row-start-5 md:block" style={{ ...delay(4), ...set(-3, 14, 20) }} />
        <Link href={p(5).href} aria-label={p(5).name} className="tile glaze col-span-3 row-span-2 animate-tile-set md:col-span-2 md:col-start-11 md:row-span-1 md:row-start-6" style={{ ...delay(4), ...set(4, 22, 18) }}>
          <VImage image={p(5).image} ratio="auto" sizes="18vw" className="h-full" imgClassName="h-full" />
        </Link>
      </div>
    </section>
  );
}
