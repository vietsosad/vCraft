import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FilePlus2, MapPin, QrCode } from "lucide-react";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { pendingReviews } from "@/lib/services/engagement-service";
import { buyerQuotes, daysUntil, todayStartVn, tracedBatches, workedWorkshops } from "@/lib/services/buyer-zone";
import { formatVnd, timeAgo } from "@/lib/format";
import { asImages } from "@/lib/types";
import { Band, Fringe } from "@/components/weave/band";
import { LaidPiece, OrderPatch, TracePatch, VisitLinks, dowOf, slotRange, visitWhen } from "@/components/weave/goods";
import { WovenBadge } from "@/components/weave/woven";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Việc của tôi" };
export const dynamic = "force-dynamic";

/**
 * Tấm dệt: ba dải nhuộm cho việc đang chạy (việc chờ bạn, đơn sỉ, lịch hẹn) xếp trên cùng;
 * phần lịch sử (đã lưu, truy xuất, xưởng đã làm cùng, thư) dùng dải nhẹ trên nền vải trơn.
 */
export default async function WeaveHome() {
  const user = await pageRequireRole("/account", "BUYER");
  const today = todayStartVn();
  const [quotes, upcoming, favorites, favCount, favWorkshops, toReview, letters, unread, worked, traced, tracedTotal] = await Promise.all([
    buyerQuotes(user.id),
    prisma.experienceBooking.findMany({
      where: { userId: user.id, status: { in: ["PENDING", "CONFIRMED"] }, visitDate: { gte: today } },
      orderBy: [{ visitDate: "asc" }, { slot: "asc" }],
      take: 2,
      include: { artisan: { select: { workshopName: true, slug: true, address: true, latitude: true, longitude: true, phone: true } } },
    }),
    prisma.favorite.findMany({
      where: { userId: user.id, product: { isPublished: true } },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { product: { select: { slug: true, name: true, images: true } } },
    }),
    prisma.favorite.count({ where: { userId: user.id, product: { isPublished: true } } }),
    prisma.favorite.findMany({
      where: { userId: user.id, artisanId: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { artisan: { select: { slug: true, workshopName: true, coverImage: true } } },
    }),
    pendingReviews(user.id),
    prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
    workedWorkshops(user.id),
    tracedBatches(user.id, 3),
    prisma.scanEvent.groupBy({ by: ["batchId"], where: { userId: user.id } }).then((r) => r.length),
  ]);

  const firstName = user.name.split(" ").slice(-1)[0];
  const running = quotes.filter((q) => !["DELIVERED", "CANCELLED"].includes(q.status));
  const urgent = running.filter((q) => q.next?.urgent);
  const shown = [...running].sort((a, b) => Number(!!b.next?.urgent) - Number(!!a.next?.urgent)).slice(0, 3);
  const next = upcoming[0];
  const daysToNext = next ? daysUntil(next.visitDate) : null;

  // Việc chờ bạn: mọi việc khách cần tự làm; con số trên tiêu đề đếm đúng danh sách này
  const tasks: { href: string; text: string; sub: string; dense: boolean }[] = [
    ...urgent.map((q) => ({ href: `/account/quotes/${q.code}`, text: q.next!.label, sub: q.title, dense: true })),
    ...(next && daysToNext !== null && daysToNext <= 7 ? [{ href: "/account/bookings", text: `Nặn gốm tại ${next.artisan.workshopName}`, sub: visitWhen(next.visitDate, next.slot), dense: daysToNext <= 1 }] : []),
    ...toReview.map((r) => ({ href: "/account/reviews", text: `Đánh giá ${r.artisan.workshopName}`, sub: r.title, dense: false })),
  ];

  const pieces = favorites.flatMap((f) => (f.product ? [{ key: f.id, href: `/products/${f.product.slug}`, name: f.product.name, image: asImages(f.product.images)[0] ?? null }] : []));

  return (
    <div className="det-home">
      {/* Nâu tám nước: lời chào và việc chờ bạn */}
      <Band hue="n8" weight="heavy" edges="bottom" label="Việc chờ bạn">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
          <div className="min-w-0">
            <h1 className="md:text-[2rem]">Chào {firstName}</h1>
            <p className="soft mt-1">{user.organization ?? "Khách của làng gốm Bát Tràng"}</p>
            <p className="soft mt-5 max-w-sm leading-relaxed">
              {next ? <>Buổi nặn gốm kế tiếp: <strong className="font-semibold text-[var(--band-ink)]">{visitWhen(next.visitDate, next.slot)}</strong>.</> : "Chưa có buổi nặn gốm nào sắp tới."}{" "}
              {unread ? <>Bạn còn <strong className="font-semibold text-[var(--band-ink)]">{unread} thư</strong> chưa mở.</> : "Hộp thư đã mở hết."}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/account/quotes/new" className="btn-moc"><FilePlus2 className="size-4" aria-hidden /> Tạo yêu cầu báo giá</Link>
              <Link href="/scan" className="btn-soi"><QrCode className="size-4" aria-hidden /> Quét tem QR</Link>
            </div>
          </div>
          <div className="min-w-0">
            <h2 className="flex items-baseline gap-2.5">
              {tasks.length > 0 && <span className="so op-stat">{tasks.length}</span>}
              <span>{tasks.length > 0 ? "việc chờ bạn" : "Không có việc nào chờ bạn"}</span>
            </h2>
            {tasks.length === 0 ? (
              <p className="soft mt-2 max-w-md">Bạn cứ thong thả xem làng.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {tasks.map((t) => (
                  <li key={t.href + t.text}>
                    <Link href={t.href} className={cn("patch group flex items-center gap-4 px-5 py-4", t.dense && "dense")} data-hue="n8">
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold leading-snug">{t.text}</span>
                        <span className="mt-0.5 block truncate text-sm text-tro">{t.sub}</span>
                      </span>
                      <ArrowRight className="size-5 shrink-0 text-muc/55 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Band>

      {/* Nâu bảy nước: đơn sỉ đang dệt */}
      <Band hue="n7" edges="bottom" label="Đơn sỉ">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            <h2 className="flex flex-wrap items-baseline gap-x-2.5">
              <span className="so op-stat">{running.length}</span>
              <span>Đơn sỉ đang dệt</span>
            </h2>
            <p className="soft mt-0.5 text-sm">{quotes.length} yêu cầu tất cả · {urgent.length} đang chờ bạn</p>
          </div>
          <Link href="/account/quotes" className="band-link">Xem tất cả đơn sỉ <ArrowRight className="size-4" aria-hidden /></Link>
        </div>
        {shown.length === 0 ? (
          <div className="patch max-w-xl p-6" data-hue="n7">
            <p className="text-lg font-semibold">Chưa có đơn sỉ nào đang chạy.</p>
            <p className="mt-1 text-sm text-tro">Gửi một yêu cầu, các xưởng có sở trường sẽ chào giá kín cho bạn so sánh.</p>
            <Link href="/account/quotes/new" className="mt-4 inline-flex min-h-10 items-center gap-1.5 font-semibold text-chu-nau">Tạo yêu cầu đầu tiên <ArrowRight className="size-4" aria-hidden /></Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-2.5">
            {shown.map((q) => <li key={q.id}><OrderPatch q={q} compact /></li>)}
          </ul>
        )}
      </Band>

      {/* Nâu sáu nước: buổi nặn gốm kế tiếp */}
      <Band hue="n6" edges="bottom" label="Lịch hẹn">
        {next ? (
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-8">
            <div className="flex items-center gap-3.5">
              <p className="so text-[2.25rem]">{next.visitDate.getUTCDate()}</p>
              <div>
                <p className="nhan">{dowOf(next.visitDate)}, tháng {next.visitDate.getUTCMonth() + 1}</p>
                <p className="mt-0.5 text-sm font-semibold">{daysToNext === 0 ? "Hôm nay" : `Còn ${daysToNext} ngày`}</p>
              </div>
            </div>
            <div className="min-w-0">
              <h2>Nặn gốm tại {next.artisan.workshopName}</h2>
              <p className="soft mt-1.5 tabular">{slotRange(next.slot)} · {next.guests} khách · tạm tính {formatVnd(next.totalVnd)}</p>
              <p className="soft mt-0.5 text-sm">{next.artisan.address}</p>
              <VisitLinks b={next} className="-ml-2.5 mt-3" />
            </div>
            <div className="md:text-right">
              {upcoming[1] && (
                <p className="soft max-w-56 text-sm">
                  Sau đó: <span className="font-semibold text-[var(--band-ink)]">{upcoming[1].artisan.workshopName}</span>, {visitWhen(upcoming[1].visitDate, upcoming[1].slot)}
                </p>
              )}
              <Link href="/account/bookings" className="band-link mt-2">Xem lịch hẹn <ArrowRight className="size-4" aria-hidden /></Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2>Chưa có buổi nặn gốm nào sắp tới</h2>
            <Link href="/map" className="band-link"><MapPin className="size-4" aria-hidden /> Tìm xưởng đang mở lớp</Link>
          </div>
        )}
      </Band>

      {/* Nâu năm nước: tác phẩm bày trên vải */}
      <Band hue="n5" tone="quiet" label="Đã lưu">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <div className="min-w-0">
            <h2><span className="so">{favCount}</span> tác phẩm đã lưu</h2>
            <p className="soft mt-0.5 text-sm">và {favWorkshops.length} xưởng bạn muốn quay lại</p>
          </div>
          <Link href="/account/favorites" className="band-link">Xem tất cả <ArrowRight className="size-4" aria-hidden /></Link>
        </div>
        {pieces.length === 0 ? (
          <p className="soft">Chưa lưu tác phẩm nào. Bấm trái tim trên tác phẩm trong phòng triển lãm để bày lên đây.</p>
        ) : (
          <ul className="grid grid-cols-3 items-end gap-4 sm:gap-6 md:grid-cols-6">
            {pieces.map((p) => (
              <li key={p.key}><LaidPiece href={p.href} name={p.name} image={p.image} sizes="(max-width: 768px) 30vw, 150px" /></li>
            ))}
          </ul>
        )}
        {favWorkshops.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-t border-[var(--band-line)] pt-5">
            {favWorkshops.map((f) => f.artisan && (
              <li key={f.id}>
                <Link href={`/artisans/${f.artisan.slug}`} className="group inline-flex items-center gap-3">
                  <WovenBadge name={f.artisan.workshopName} size={44} />
                  <span className="font-semibold underline decoration-[var(--band-line)] underline-offset-4 group-hover:decoration-current">{f.artisan.workshopName}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Band>

      {/* Nâu bốn nước: sổ truy xuất */}
      <Band hue="n4" tone="quiet" label="Sổ truy xuất">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h2><span className="so">{tracedTotal}</span> lô đã kiểm chứng</h2>
            <p className="soft mt-0.5 text-sm">những món bạn đã quét tem QR khi đăng nhập</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/scan" className="btn-moc"><QrCode className="size-4" aria-hidden /> Quét tem mới</Link>
            <Link href="/account/traces" className="btn-soi">Mở sổ</Link>
          </div>
        </div>
        {traced.length === 0 ? (
          <p className="soft max-w-xl">Lật đáy món gốm, quét tem QR khi đã đăng nhập: nhật ký ra đời của món đó sẽ được giữ lại ở đây.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {traced.map((t) => <li key={t.code}><TracePatch t={t} compact /></li>)}
          </ul>
        )}
      </Band>

      {/* Nâu ba nước: các xưởng đã làm việc cùng, việc đánh giá */}
      <Band hue="n3" tone="quiet" label="Xưởng đã làm việc cùng">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h2><span className="so">{worked.length}</span> xưởng đã làm việc cùng</h2>
            <p className="soft mt-0.5 text-sm">{toReview.length ? `${toReview.length} xưởng đang chờ bạn đánh giá` : "đã đánh giá đủ"}</p>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-4">
            {worked.slice(0, 4).map((w) => (
              <li key={w.id}>
                <Link href={`/artisans/${w.slug}`} className="group flex items-center gap-3">
                  <WovenBadge name={w.workshopName} size={48} faded={w.rating === null} />
                  <span className="leading-tight">
                    <span className="block font-semibold underline decoration-[var(--band-line)] underline-offset-4 group-hover:decoration-current">{w.workshopName}</span>
                    <span className="soft block text-[13px]">{[w.visited && "đã ghé", w.ordered && "đã đặt", w.rating !== null ? `bạn chấm ${w.rating}/5` : "chưa đánh giá"].filter(Boolean).join(" · ")}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {toReview.length > 0 && <Link href="/account/reviews" className="btn-moc self-start lg:self-center">Viết đánh giá</Link>}
        </div>
      </Band>

      {/* Nâu hai nước: thư */}
      <Band hue="n2" tone="quiet" label="Thư">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
          <div className="min-w-0">
            <h2><span className="so">{unread}</span> thư mới</h2>
            <Link href="/account/notifications" className="band-link text-sm">Mở hộp thư <ArrowRight className="size-4" aria-hidden /></Link>
          </div>
          {letters.length === 0 ? (
            <p className="soft">Chưa có thư nào.</p>
          ) : (
            <ul className="divide-y divide-[var(--band-line)]">
              {letters.map((n) => (
                <li key={n.id}>
                  <Link href={n.link ?? "/account/notifications"} className="group flex items-start gap-4 py-3">
                    <span className={cn("nhan mt-0.5 w-14 shrink-0 rounded-[3px] px-1 py-0.5 text-center", n.readAt ? "soft" : "bg-nghe text-[#2a1d0c]")}>{n.readAt ? "Đã mở" : "Mới"}</span>
                    <span className={cn("min-w-0 flex-1 leading-snug group-hover:underline", !n.readAt && "font-semibold")}>{n.title}</span>
                    <span className="soft shrink-0 text-[13px]">{timeAgo(n.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Band>
      <Fringe />
    </div>
  );
}
