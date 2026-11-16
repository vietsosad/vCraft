import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarPlus, FilePlus2, MapPin, Navigation, Plus, QrCode } from "lucide-react";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { pendingReviews } from "@/lib/services/engagement-service";
import { buyerQuotes, daysUntil, sealGlyphs, todayStartVn, tracedBatches, workshopSeals } from "@/lib/services/cabinet-service";
import { formatVnd, timeAgo } from "@/lib/format";
import { asImage, asImages } from "@/lib/types";
import { BrassLabel, CabinetBase, Doors, Pull, WorkshopSeal } from "@/components/cabinet/hardware";
import { OrderSlip, TraceSheet, VisitTicket, directionsUrl, visitWhen } from "@/components/cabinet/paper-goods";
import { CabinetDoorsRuntime } from "@/components/cabinet/cabinet-doors";
import { ShelfPiece } from "@/components/cabinet/shelf-piece";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Tủ chè của tôi" };
export const dynamic = "force-dynamic";

/** Tủ chè: mọi thứ khách giữ với làng nằm trong các ngăn của một chiếc tủ gỗ sơn then. */
export default async function CabinetHome() {
  const user = await pageRequireRole("/account", "BUYER");
  const today = todayStartVn();
  const [quotes, upcoming, favorites, favCount, favWorkshops, favWorkshopCount, toReview, letters, unread, seals, traced, tracedTotal] = await Promise.all([
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
      take: 3,
      include: { artisan: { select: { slug: true, workshopName: true, coverImage: true } } },
    }),
    prisma.favorite.count({ where: { userId: user.id, artisanId: { not: null } } }),
    pendingReviews(user.id),
    prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
    workshopSeals(user.id),
    tracedBatches(user.id, 3),
    prisma.scanEvent.groupBy({ by: ["batchId"], where: { userId: user.id } }).then((r) => r.length),
  ]);

  const firstName = user.name.split(" ").slice(-1)[0];
  const running = quotes.filter((q) => !["DELIVERED", "CANCELLED"].includes(q.status));
  const drawerQuotes = [...running].sort((a, b) => Number(!!b.next?.urgent) - Number(!!a.next?.urgent)).slice(0, 3);
  const next = upcoming[0];

  // Việc chờ bạn: tối đa ba dòng, việc gấp trước
  const tasks: { href: string; text: string; sub: string }[] = [
    ...running.filter((q) => q.next?.urgent).map((q) => ({ href: `/account/quotes/${q.code}`, text: q.next!.label, sub: q.title })),
    ...(next && daysUntil(next.visitDate) <= 7
      ? [{ href: "/account/bookings", text: `Nặn gốm tại ${next.artisan.workshopName}`, sub: visitWhen(next.visitDate, next.slot) }]
      : []),
    ...toReview.slice(0, 1).map((r) => ({ href: "/account/reviews", text: `Đóng dấu đánh giá cho ${r.artisan.workshopName}`, sub: r.title })),
  ].slice(0, 3);

  // Hai tầng kệ, sáu chỗ: tác phẩm trước, xưởng đã lưu sau; chỗ còn trống để viền nét đứt
  type Slot = { key: string; href: string; name: string; image: ReturnType<typeof asImage>; workshop?: boolean } | null;
  const shelfItems: Slot[] = [
    ...favorites.flatMap((f) => (f.product ? [{ key: f.id, href: `/products/${f.product.slug}`, name: f.product.name, image: asImages(f.product.images)[0] ?? null }] : [])),
    ...favWorkshops.flatMap((f) => (f.artisan ? [{ key: f.id, href: `/artisans/${f.artisan.slug}`, name: f.artisan.workshopName, image: asImage(f.artisan.coverImage), workshop: true }] : [])),
  ].slice(0, 6);
  const slots: Slot[] = Array.from({ length: 6 }, (_, i) => shelfItems[i] ?? null);
  const shelfRows = [slots.slice(0, 3), slots.slice(3, 6)];

  return (
    <>
      <CabinetDoorsRuntime />
      <div className="lacquer cab grid-cols-1 rounded-t-[12px] md:grid-cols-6 xl:grid-cols-12 lg:rounded-t-none">
        {/* Biển tên men lam: lời chào và việc chờ bạn */}
        <section aria-labelledby="tu-chao" className="cab-cell tile-lam flex min-h-[23rem] flex-col p-6 text-giay md:col-span-3 xl:col-span-4 xl:row-span-1 lg:p-7">
          <h1 id="tu-chao" className="title-lg">Chào {firstName}</h1>
          <p className="mt-1.5 text-sm text-giay/75">{user.organization ?? "Khách của làng gốm Bát Tràng"}</p>
          <div className="hoi-van mt-5 w-full opacity-45" aria-hidden />
          <h2 className="mt-4 font-serif text-lg font-bold normal-case tracking-normal text-giay/90">Việc chờ bạn</h2>
          {tasks.length === 0 ? (
            <p className="mt-2 max-w-xs text-[0.95rem] text-giay/80">Không có việc nào đang chờ. Tủ đã gọn gàng, bạn cứ thong thả xem làng.</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {tasks.map((t) => (
                <li key={t.href + t.text}>
                  <Link href={t.href} className="group -mx-2 flex items-start gap-2.5 rounded-[var(--radius-tile)] px-2 py-1.5 transition hover:bg-giay/10">
                    <span className="mt-[7px] size-2 shrink-0 rotate-45 rounded-[1px] bg-chi-nhat" aria-hidden />
                    <span className="min-w-0">
                      <span className="block font-semibold leading-snug">{t.text}</span>
                      <span className="line-clamp-2 block text-sm text-giay/70">{t.sub}</span>
                    </span>
                    <ArrowRight className="ml-auto mt-1 size-4 shrink-0 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-auto flex flex-wrap gap-2 pt-6">
            <Link href="/account/quotes/new" className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-tile)] bg-giay px-4 text-sm font-semibold text-[#163a73] shadow-[inset_0_-2px_0_rgb(0_0_0/0.1)] transition hover:bg-chi-nhat">
              <FilePlus2 className="size-4" aria-hidden /> Tạo yêu cầu báo giá
            </Link>
            <Link href="/scan" className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-tile)] bg-giay/12 px-4 text-sm font-semibold text-giay transition hover:bg-giay/20">
              <QrCode className="size-4" aria-hidden /> Quét tem QR
            </Link>
          </div>
        </section>

        {/* Ngăn lịch: vé buổi nặn gốm kế tiếp */}
        <section aria-labelledby="tu-lich" className="cab-cell paper-nga flex flex-col p-4 md:col-span-3 xl:order-3 xl:col-span-3">
          <Doors left="tile-lam" right="tile-hoavan" delay={90} />
          <div className="flex items-center justify-between gap-2">
            <h2 id="tu-lich"><BrassLabel>Lịch hẹn</BrassLabel></h2>
            {next && <p className="text-xs font-semibold text-lam">{daysUntil(next.visitDate) === 0 ? "Hôm nay" : `Còn ${daysUntil(next.visitDate)} ngày`}</p>}
          </div>
          {next ? (
            <>
              <VisitTicket b={next} size="compact" className="mt-4 -rotate-[1.2deg]" />
              <div className="mt-3 flex flex-wrap gap-1">
                <a href={`/api/bookings/${next.code}/ics`} download className="inline-flex min-h-10 items-center gap-1.5 rounded-[var(--radius-tile)] px-2 text-sm font-semibold text-lam transition hover:bg-lam-nhat">
                  <CalendarPlus className="size-4" aria-hidden /> Thêm vào lịch
                </a>
                <a href={directionsUrl(next.artisan.latitude, next.artisan.longitude)} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-1.5 rounded-[var(--radius-tile)] px-2 text-sm font-semibold text-lam transition hover:bg-lam-nhat">
                  <Navigation className="size-4" aria-hidden /> Chỉ đường
                </a>
              </div>
              <dl className="mt-3 space-y-2 border-t border-dashed border-muc/15 pt-3 text-sm">
                <div>
                  <dt className="text-xs text-tro">Địa chỉ xưởng</dt>
                  <dd className="leading-snug">{next.artisan.address}</dd>
                </div>
                <div className="flex gap-6">
                  {next.artisan.phone && (
                    <div>
                      <dt className="text-xs text-tro">Điện thoại</dt>
                      <dd className="tabular"><a href={`tel:${next.artisan.phone}`} className="hover:text-lam">{next.artisan.phone}</a></dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs text-tro">Tạm tính</dt>
                    <dd className="font-semibold tabular">{formatVnd(next.totalVnd)}</dd>
                  </div>
                </div>
                {next.note && (
                  <div>
                    <dt className="text-xs text-tro">Bạn đã dặn xưởng</dt>
                    <dd className="font-serif italic leading-snug">“{next.note}”</dd>
                  </div>
                )}
              </dl>
              {upcoming[1] && (
                <p className="mt-3 text-sm text-tro">
                  Sau đó: <span className="font-medium text-muc">{upcoming[1].artisan.workshopName}</span>, {visitWhen(upcoming[1].visitDate, upcoming[1].slot)}
                </p>
              )}
              <Link href="/account/bookings" className="mt-auto inline-flex min-h-10 items-center gap-1 pt-3 text-sm font-semibold text-lam">
                Mở ngăn lịch hẹn <ArrowRight className="size-4" aria-hidden />
              </Link>
            </>
          ) : (
            <div className="mt-4 flex flex-1 flex-col justify-between rounded-[4px] border-2 border-dashed border-muc/15 p-4">
              <p className="font-serif text-lg">Chưa có buổi nặn gốm nào sắp tới.</p>
              <Link href="/map" className="mt-3 inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-lam">
                <MapPin className="size-4" aria-hidden /> Tìm xưởng đang mở lớp
              </Link>
            </div>
          )}
        </section>

        {/* Kệ đã lưu: tác phẩm đứng trên hai tầng kệ */}
        <section aria-labelledby="tu-ke" className="cab-cell paper-nga flex flex-col px-4 pb-3 pt-4 md:col-span-6 xl:order-2 xl:col-span-5">
          <Doors left="tile-hoavan" right="tile-sen" delay={0} />
          <div className="flex items-center justify-between gap-2">
            <h2 id="tu-ke"><BrassLabel>Kệ đã lưu</BrassLabel></h2>
            <p className="text-xs text-tro">{favCount} tác phẩm · {favWorkshopCount} xưởng</p>
          </div>
          {shelfItems.length === 0 ? (
            <div className="mt-6 flex flex-1 flex-col justify-end">
              <p className="mb-3 max-w-sm font-serif text-lg">Kệ còn trống. Bấm trái tim trên tác phẩm trong phòng triển lãm để đặt lên kệ.</p>
              <div className="shelf-board" />
              <Link href="/products" className="mt-3 inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-lam">Vào phòng triển lãm <ArrowRight className="size-4" aria-hidden /></Link>
            </div>
          ) : (
            <div className="mt-4 flex flex-1 flex-col justify-end gap-4">
              {shelfRows.map((row, ri) => (
                <div key={ri}>
                  <ul className="mx-auto grid max-w-[30rem] grid-cols-3 items-end gap-3 px-2 sm:gap-5 sm:px-4">
                    {row.map((it, i) => {
                      const firstGap = !it && shelfItems.length === ri * 3 + i;
                      return (
                        <li key={it?.key ?? `trong-${ri}-${i}`}>
                          {it ? (
                            <ShelfPiece href={it.href} name={it.name} image={it.image} label={it.workshop ? it.name.replace(/^Xưởng gốm\s+/i, "") : undefined} sizes="(max-width: 1280px) 30vw, 140px" />
                          ) : firstGap ? (
                            <Link href="/products" className="grid aspect-[4/5] place-items-center rounded-[3px] border-2 border-dashed border-muc/20 text-tro transition hover:border-lam/50 hover:text-lam">
                              <Plus className="size-5" aria-hidden />
                              <span className="sr-only">Tìm thêm tác phẩm để đặt lên kệ</span>
                            </Link>
                          ) : (
                            <span className="block aspect-[4/5] rounded-[3px] border-2 border-dashed border-muc/10" aria-hidden />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  <div className="shelf-board" />
                </div>
              ))}
              <Link href="/account/favorites" className="inline-flex min-h-10 items-center gap-1 self-end text-sm font-semibold text-lam">Xem cả kệ <ArrowRight className="size-4" aria-hidden /></Link>
            </div>
          )}
        </section>

        {/* Ngăn kéo đơn sỉ: kéo ra thấy phiếu đặt hàng */}
        <section aria-labelledby="tu-don" className="cab-cell paper-nga flex flex-col md:col-span-6 xl:order-4 xl:col-span-6">
          <Doors left="tile-ran" right="tile-hoavan" delay={160} />
          <div className="flex flex-1 flex-col p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 id="tu-don"><BrassLabel>Đơn sỉ</BrassLabel></h2>
              <p className="text-xs text-tro">{running.length} đang chạy · {quotes.length} tất cả</p>
            </div>
            {drawerQuotes.length === 0 ? (
              <div className="mt-4 flex-1 rounded-[4px] border-2 border-dashed border-muc/15 p-4">
                <p className="font-serif text-lg">Chưa có đơn sỉ nào đang chạy.</p>
                <p className="mt-1 text-sm text-tro">Gửi một yêu cầu, các xưởng có sở trường sẽ chào giá kín cho bạn so sánh.</p>
              </div>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {drawerQuotes.map((q) => <li key={q.id}><OrderSlip q={q} compact /></li>)}
              </ul>
            )}
          </div>
          {/* Mặt ngăn kéo: quai đồng, bấm để mở cả ngăn */}
          <Link href="/account/quotes" className="lacquer-face group relative flex min-h-12 items-center justify-center gap-3 border-t border-[color-mix(in_srgb,var(--color-chi)_55%,transparent)] px-4 text-sm font-semibold text-giay/90 transition hover:text-giay">
            <Pull className="transition-transform duration-500 group-hover:translate-y-0.5" />
            Mở ngăn đơn sỉ
          </Link>
        </section>

        {/* Hộc thư */}
        <section aria-labelledby="tu-thu" className="cab-cell paper-nga flex flex-col p-4 md:col-span-3 xl:order-5 xl:col-span-3">
          <Doors left="tile-sen" right="tile-ran" delay={220} />
          <div className="flex items-center justify-between gap-2">
            <h2 id="tu-thu"><BrassLabel>Hộc thư</BrassLabel></h2>
            <p className={cn("text-xs", unread ? "font-semibold text-datnung" : "text-tro")}>{unread ? `${unread} chưa mở` : "đã mở hết"}</p>
          </div>
          {letters.length === 0 ? (
            <p className="mt-4 text-sm text-tro">Chưa có lá thư nào. Chào giá mới và lịch được xác nhận sẽ gửi về đây.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {letters.map((n) => (
                <li key={n.id}>
                  <Link href={n.link ?? "/account/notifications"} className="paper flex items-start gap-3 rounded-[3px] p-2.5 shadow-[0_8px_14px_-12px_rgb(28_18_12/0.6)] transition hover:-translate-y-0.5">
                    <span className={n.readAt ? "wax-open" : "wax"} aria-label={n.readAt ? "Đã mở" : "Chưa mở"}>
                      <span className="font-display text-[11px]">v</span>
                    </span>
                    <span className="min-w-0">
                      <span className={cn("line-clamp-2 text-sm leading-snug", !n.readAt && "font-semibold")}>{n.title}</span>
                      <span className="block text-xs text-tro">{timeAgo(n.createdAt)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link href="/account/notifications" className="mt-auto inline-flex min-h-10 items-center gap-1 pt-3 text-sm font-semibold text-lam">Mở hộc thư <ArrowRight className="size-4" aria-hidden /></Link>
        </section>

        {/* Hộp triện: dấu son của các xưởng đã làm việc cùng */}
        <section aria-labelledby="tu-trien" className="cab-cell paper flex flex-col p-4 md:col-span-3 xl:order-6 xl:col-span-3">
          <Doors left="tile-lam" right="tile-sen" delay={280} />
          <div className="flex items-center justify-between gap-2">
            <h2 id="tu-trien"><BrassLabel>Hộp triện</BrassLabel></h2>
            <p className="text-xs text-tro">{seals.length} xưởng</p>
          </div>
          {seals.length === 0 ? (
            <p className="mt-4 text-sm text-tro">Ghé một xưởng hoặc chốt một đơn sỉ, con triện của xưởng sẽ nằm ở đây.</p>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {seals.slice(0, 4).map((s, i) => (
                <li key={s.id}>
                  <Link href={`/artisans/${s.slug}`} className="group flex items-center gap-3">
                    <WorkshopSeal glyphs={sealGlyphs(s.workshopName)} label={`Triện ${s.workshopName}`} size={48} faded={s.rating === null} className="transition-transform duration-500 group-hover:scale-105" style={{ rotate: `${[-4, 3, -2, 5][i % 4]}deg` }} />
                    <span className="min-w-0 leading-tight">
                      <span className="block truncate font-serif text-[1.02rem] font-bold group-hover:text-lam">{s.workshopName}</span>
                      <span className="block text-xs text-tro">{[s.visited && "đã ghé", s.ordered && "đã đặt", s.rating !== null ? "đã đóng dấu" : "chờ đóng dấu"].filter(Boolean).join(" · ")}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {toReview.length > 0 ? (
            <Link href="/account/reviews" className="mt-auto inline-flex min-h-10 items-center gap-1 pt-3 text-sm font-semibold text-datnung">
              {toReview.length} xưởng chờ bạn đóng dấu <ArrowRight className="size-4" aria-hidden />
            </Link>
          ) : (
            <Link href="/account/reviews" className="mt-auto inline-flex min-h-10 items-center gap-1 pt-3 text-sm font-semibold text-lam">Xem đánh giá <ArrowRight className="size-4" aria-hidden /></Link>
          )}
        </section>

        {/* Ngăn dưới: sổ truy xuất */}
        <section aria-labelledby="tu-so" className="cab-cell paper-nga p-4 md:col-span-6 xl:order-7 xl:col-span-12">
          <Doors left="tile-hoavan" right="tile-ran" delay={330} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 id="tu-so"><BrassLabel>Sổ truy xuất</BrassLabel></h2>
              <p className="text-xs text-tro">{tracedTotal} lô bạn đã quét tem kiểm chứng</p>
            </div>
            <div className="flex items-center gap-1">
              <Link href="/scan" className="inline-flex min-h-10 items-center gap-1.5 rounded-[var(--radius-tile)] px-3 text-sm font-semibold text-lam transition hover:bg-lam-nhat">
                <QrCode className="size-4" aria-hidden /> Quét tem mới
              </Link>
              <Link href="/account/traces" className="inline-flex min-h-10 items-center gap-1 rounded-[var(--radius-tile)] px-3 text-sm font-semibold text-lam transition hover:bg-lam-nhat">
                Mở sổ <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
          {traced.length === 0 ? (
            <p className="mt-3 max-w-xl text-sm text-tro">Lật đáy món gốm, quét tem QR khi đã đăng nhập: nhật ký ra đời của món đó sẽ được giữ lại trong sổ này.</p>
          ) : (
            <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {traced.map((t) => <li key={t.code}><TraceSheet t={t} size="compact" /></li>)}
            </ul>
          )}
        </section>
      </div>
      <CabinetBase className="px-1" />
    </>
  );
}
