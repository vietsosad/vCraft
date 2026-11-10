import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, FilePlus2, Heart, MapPin, Star } from "lucide-react";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { pendingReviews } from "@/lib/services/engagement-service";
import { formatDate, formatNumber, timeAgo } from "@/lib/format";
import { asImages } from "@/lib/types";
import { ButtonLink } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/primitives";
import { VImage } from "@/components/ui/vimage";
import { QuoteStatusBadge } from "@/components/quotes/quote-status";
import { BookingStatusBadge } from "@/components/engagement/booking-actions";
import { CountUp } from "@/components/motion/count-up";

export const metadata: Metadata = { title: "Tài khoản của tôi" };
export const dynamic = "force-dynamic";

export default async function AccountHome() {
  const user = await pageRequireRole("/account", "BUYER");
  const [quotes, bookings, favorites, toReview, notes] = await Promise.all([
    prisma.quoteRequest.findMany({
      where: { buyerId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 4,
      include: { _count: { select: { bids: { where: { status: { not: "WITHDRAWN" } } } } } },
    }),
    prisma.experienceBooking.findMany({
      where: { userId: user.id, status: { in: ["PENDING", "CONFIRMED"] } },
      orderBy: { visitDate: "asc" },
      take: 3,
      include: { artisan: { select: { workshopName: true, slug: true, coverImage: true } } },
    }),
    prisma.favorite.findMany({
      where: { userId: user.id, productId: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { product: { select: { slug: true, name: true, images: true } } },
    }),
    pendingReviews(user.id),
    prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 4 }),
  ]);
  const activeQuotes = quotes.filter((q) => !["DELIVERED", "CANCELLED"].includes(q.status)).length;
  const firstName = user.name.split(" ").slice(-1)[0];

  return (
    <div className="space-y-10">
      {/* Bức ghép chào mừng: viên lời chào + ba viên số liệu */}
      <section className="mosaic grid-cols-2 md:grid-cols-4" aria-label="Tổng quan">
        <div data-reveal className="tile tile-lam col-span-2 flex min-h-44 flex-col justify-between p-6 text-giay md:row-span-2">
          <div>
            <h1 className="title-lg">Chào {firstName}</h1>
            <p className="mt-1 text-sm text-giay/75">{user.organization ?? "Khách hàng vCraft"}</p>
            <p className="mt-3 max-w-sm text-giay/85">
              {activeQuotes > 0 ? `Bạn có ${activeQuotes} đơn sỉ đang chạy` : "Chưa có đơn sỉ nào đang chạy"}
              {bookings.length > 0 ? ` và ${bookings.length} lịch nặn gốm sắp tới.` : "."}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/account/quotes/new" className="inline-flex items-center gap-2 rounded-[var(--radius-tile)] bg-giay px-4 py-2.5 text-sm font-semibold text-[#163a73] transition hover:bg-giay/90">
              <FilePlus2 className="size-4" /> Tạo yêu cầu báo giá
            </Link>
            <Link href="/map" className="inline-flex items-center gap-2 rounded-[var(--radius-tile)] bg-giay/12 px-4 py-2.5 text-sm font-semibold text-giay transition hover:bg-giay/20">
              <MapPin className="size-4" /> Tìm xưởng nặn gốm
            </Link>
          </div>
        </div>
        <Link href="/account/quotes" data-reveal style={{ ["--d" as string]: "80ms" }} className="tile glaze bg-su p-5">
          <p className="text-sm text-tro">Đơn sỉ đang chạy</p>
          <p className="mt-2 font-display text-4xl"><CountUp value={activeQuotes} /></p>
        </Link>
        <Link href="/account/bookings" data-reveal style={{ ["--d" as string]: "140ms" }} className="tile glaze bg-lam-nhat p-5">
          <p className="text-sm text-tro">Lịch sắp tới</p>
          <p className="mt-2 font-display text-4xl text-lam"><CountUp value={bookings.length} /></p>
        </Link>
        <Link href="/account/favorites" data-reveal style={{ ["--d" as string]: "200ms" }} className="tile glaze bg-su p-5">
          <p className="flex items-center gap-1.5 text-sm text-tro"><Heart className="size-4" /> Đã lưu</p>
          <p className="mt-2 font-display text-4xl"><CountUp value={favorites.length} /></p>
        </Link>
        <Link href="/account/reviews" data-reveal style={{ ["--d" as string]: "260ms" }} className={toReview.length ? "tile glaze tile-dat p-5 text-giay" : "tile glaze bg-su p-5"}>
          <p className={toReview.length ? "flex items-center gap-1.5 text-sm text-giay/80" : "flex items-center gap-1.5 text-sm text-tro"}><Star className="size-4" /> Chờ đánh giá</p>
          <p className="mt-2 font-display text-4xl"><CountUp value={toReview.length} /></p>
        </Link>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="title-md">Đơn đặt sỉ</h2>
            <Link href="/account/quotes" className="inline-flex items-center gap-1 text-sm font-semibold text-lam">Tất cả <ArrowRight className="size-4" /></Link>
          </div>
          {quotes.length === 0 ? (
            <EmptyState title="Bạn chưa có yêu cầu nào" description="Thử đặt 500 chiếc cốc men trắng ngà in logo cho sự kiện sắp tới." action={<ButtonLink href="/account/quotes/new">Tạo yêu cầu đầu tiên</ButtonLink>} />
          ) : (
            <ul className="space-y-2">
              {quotes.map((q, i) => (
                <li key={q.id} data-reveal style={{ ["--d" as string]: `${i * 60}ms` }}>
                  <Link href={`/account/quotes/${q.requestCode}`} className="tile glaze flex items-center gap-4 bg-su p-4">
                    <div className="min-w-0 flex-1">
                      <p className="code text-lam">{q.requestCode}</p>
                      <p className="truncate font-medium">{q.title}</p>
                      <p className="text-xs text-tro">{formatNumber(q.quantity)} sản phẩm · {q._count.bids} chào giá · cập nhật {timeAgo(q.updatedAt)}</p>
                    </div>
                    <QuoteStatusBadge status={q.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="title-md">Lịch nặn gốm</h2>
            <Link href="/account/bookings" className="inline-flex items-center gap-1 text-sm font-semibold text-lam">Tất cả <ArrowRight className="size-4" /></Link>
          </div>
          {bookings.length === 0 ? (
            <EmptyState icon={<CalendarDays />} title="Chưa có lịch nào" description="Chọn một xưởng đang mở cửa trên bản đồ làng để đặt buổi nặn gốm." action={<ButtonLink href="/map" variant="outline">Mở bản đồ làng</ButtonLink>} />
          ) : (
            <ul className="space-y-2">
              {bookings.map((b) => (
                <li key={b.id}>
                  <Link href="/account/bookings" className="tile glaze flex items-center gap-4 bg-su p-3">
                    <div className="tile grid size-14 shrink-0 place-items-center bg-lam-nhat text-center leading-none text-lam">
                      <span className="font-display text-xl">{b.visitDate.getUTCDate()}</span>
                      <span className="text-[10px] font-semibold">th{b.visitDate.getUTCMonth() + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{b.artisan.workshopName}</p>
                      <p className="text-xs text-tro">{b.slot} · {b.guests} khách</p>
                    </div>
                    <BookingStatusBadge status={b.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="title-md">Tác phẩm đã lưu</h2>
            <Link href="/account/favorites" className="inline-flex items-center gap-1 text-sm font-semibold text-lam">Tất cả <ArrowRight className="size-4" /></Link>
          </div>
          {favorites.length === 0 ? (
            <EmptyState icon={<Heart />} title="Chưa lưu tác phẩm nào" description="Bấm biểu tượng trái tim trên tác phẩm trong phòng triển lãm để lưu lại." action={<ButtonLink href="/products" variant="outline">Vào phòng triển lãm</ButtonLink>} />
          ) : (
            <div className="mosaic grid-cols-2 sm:grid-cols-4">
              {favorites.map((f) => f.product && (
                <Link key={f.id} href={`/products/${f.product.slug}`} className="tile glaze group bg-su">
                  <VImage image={asImages(f.product.images)[0]} ratio="4/5" sizes="20vw" imgClassName="transition-transform duration-700 group-hover:scale-105" />
                  <p className="truncate px-2.5 py-2 text-sm font-medium">{f.product.name}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
        <section>
          <h2 className="title-md mb-4">Thông báo mới</h2>
          <Card className="divide-y divide-vua">
            {notes.length === 0 && <p className="p-4 text-sm text-tro">Chưa có thông báo nào.</p>}
            {notes.map((n) => (
              <Link key={n.id} href={n.link ?? "/account/notifications"} className="block px-4 py-3 transition hover:bg-nga-dam/60">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-tro">{formatDate(n.createdAt, true)}</p>
              </Link>
            ))}
          </Card>
        </section>
      </div>
    </div>
  );
}
