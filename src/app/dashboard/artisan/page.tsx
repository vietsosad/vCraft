import Link from "next/link";
import { ArrowRight, Megaphone, QrCode, FileText, Package, ScanLine, CalendarDays, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { getOpenState } from "@/lib/opening-hours";
import { asStages } from "@/lib/types";
import { formatDate, formatNumber, timeAgo } from "@/lib/format";
import { NEWS_CATEGORIES } from "@/lib/constants";
import { Card, Stat, EmptyState, Badge, PageHeader } from "@/components/ui/primitives";
import { CountUp } from "@/components/motion/count-up";
import { BookingStatusBadge } from "@/components/engagement/booking-actions";
import { ButtonLink } from "@/components/ui/button";
import { OpenToggle } from "@/components/artisan/open-toggle";

export const dynamic = "force-dynamic";

export default async function ArtisanDashboard() {
  const user = await pageRequireRole("/dashboard/artisan", "ARTISAN");
  const artisanId = user.artisanId!;
  const today = new Date(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date()) + "T00:00:00Z");
  const [profile, products, batches, invitations, urgent, bookings] = await Promise.all([
    prisma.artisanProfile.findUniqueOrThrow({ where: { id: artisanId }, select: { isOpenForVisit: true, openingHours: true, openDays: true, workshopName: true, artisanName: true, ratingAvg: true, ratingCount: true } }),
    prisma.product.count({ where: { artisanId } }),
    prisma.productBatch.findMany({ where: { artisanId }, orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.quoteInvitation.findMany({
      where: { artisanId, quoteRequest: { status: { in: ["SENT_TO_ARTISANS", "ARTISANS_BIDDING"] } } },
      include: { quoteRequest: { include: { bids: { where: { artisanId }, select: { id: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.communityNews.findMany({ where: { isPublished: true, isUrgent: true }, orderBy: { publishedAt: "desc" }, take: 2 }),
    prisma.experienceBooking.findMany({ where: { artisanId, visitDate: { gte: today }, status: { in: ["PENDING", "CONFIRMED"] } }, orderBy: [{ visitDate: "asc" }, { slot: "asc" }], take: 4 }),
  ]);
  const scans = batches.reduce((s, b) => s + b.scanCount, 0);
  const open = getOpenState(profile);
  const newOpps = invitations.filter((i) => i.quoteRequest.bids.length === 0);

  return (
    <div className="space-y-8">
      <PageHeader title={`Chào ${profile.artisanName.split(" ").slice(-1)[0]}`} description={`${profile.workshopName} · ${profile.ratingCount ? `${profile.ratingAvg.toFixed(1)} sao từ ${profile.ratingCount} lượt đánh giá` : "chưa có đánh giá"}`} className="mb-0" />
      {urgent.map((n) => (
        <Link key={n.id} href={`/news/${n.slug}`} className="tile glaze tile-dat flex items-center gap-3 px-4 py-3 text-sm text-giay">
          <Megaphone className="size-4 shrink-0" aria-hidden />
          <span className="rounded-[3px] bg-giay/15 px-1.5 py-0.5 text-[11px] font-semibold">Khẩn · {NEWS_CATEGORIES[n.category]}</span>
          <span className="truncate">{n.title}</span>
          <ArrowRight className="ml-auto size-4 shrink-0" aria-hidden />
        </Link>
      ))}

      <Card className="p-5"><OpenToggle initial={profile.isOpenForVisit} label={open.label} /></Card>

      <div className="mosaic grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/artisan/quotes" className="block rounded-[var(--radius-tile)]"><Stat tone={newOpps.length ? "dat" : "plain"} label="Cơ hội báo giá mới" value={<CountUp value={newOpps.length} />} hint={`${invitations.length} yêu cầu đang mở`} className="glaze" /></Link>
        <Link href="/dashboard/artisan/bookings" className="block rounded-[var(--radius-tile)]"><Stat label="Lịch hẹn sắp tới" value={<CountUp value={bookings.length} />} hint={`${bookings.filter((b) => b.status === "PENDING").length} chờ xác nhận`} className="glaze" /></Link>
        <Link href="/dashboard/artisan/stats" className="block rounded-[var(--radius-tile)]"><Stat label="Lượt quét QR" value={<CountUp value={scans} />} hint={`${batches.length} lô gần đây`} className="glaze" /></Link>
        <Link href="/dashboard/artisan/products" className="block rounded-[var(--radius-tile)]"><Stat label="Sản phẩm" value={<CountUp value={products} />} className="glaze" /></Link>
      </div>

      {bookings.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="title-md">Khách sắp ghé xưởng</h2>
            <Link href="/dashboard/artisan/bookings" className="text-sm font-semibold text-datnung">Tất cả lịch →</Link>
          </div>
          <ul className="mosaic grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {bookings.map((b) => (
              <li key={b.id} className="tile bg-su p-4">
                <p className="flex items-center gap-2 text-sm text-tro"><CalendarDays className="size-4" aria-hidden /> {b.visitDate.getUTCDate()}/{b.visitDate.getUTCMonth() + 1} · {b.slot}</p>
                <p className="mt-1 font-semibold">{b.contactName}</p>
                <p className="mb-2 flex items-center gap-1 text-sm text-tro"><Users className="size-3.5" aria-hidden /> {b.guests} khách</p>
                <BookingStatusBadge status={b.status} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="title-md">Cơ hội báo giá</h2>
            <Link href="/dashboard/artisan/quotes" className="text-sm text-datnung">Tất cả →</Link>
          </div>
          {invitations.length === 0 ? (
            <EmptyState icon={<FileText className="size-6" />} title="Chưa có lời mời nào" description="Khi khách sỉ cần dòng men xưởng bạn làm, lời mời sẽ xuất hiện ở đây." />
          ) : (
            <ul className="space-y-3">
              {invitations.slice(0, 4).map((i) => (
                <li key={i.id}>
                  <Link href={`/dashboard/artisan/quotes/${i.quoteRequest.requestCode}`} className="tile glaze block bg-su p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="code text-lam">{i.quoteRequest.requestCode}</span>
                      {i.quoteRequest.bids.length ? <Badge tone="celadon">Đã chào giá</Badge> : <Badge tone="gold">Mới</Badge>}
                    </div>
                    <p className="mt-1 font-medium">{i.quoteRequest.title}</p>
                    <p className="text-xs text-tro">{formatNumber(i.quoteRequest.quantity)} sp · hạn chào giá {i.quoteRequest.biddingClosesAt ? formatDate(i.quoteRequest.biddingClosesAt, true) : "—"}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="title-md">Lô gần đây</h2>
            <ButtonLink href="/dashboard/artisan/batches/new" size="sm"><QrCode className="size-4" /> Mở lô mới</ButtonLink>
          </div>
          {batches.length === 0 ? (
            <EmptyState icon={<Package className="size-6" />} title="Mỗi mẻ gốm là một câu chuyện" description="Mở lô đầu tiên và ghi lại công đoạn đầu tiên." />
          ) : (
            <ul className="space-y-3">
              {batches.map((b) => (
                <li key={b.id}>
                  <Link href={`/dashboard/artisan/batches/${b.batchCode}`} className="tile glaze flex items-center justify-between gap-3 bg-su p-4">
                    <div className="min-w-0">
                      <p className="text-xs text-tro"><span className="code">{b.batchCode}</span> · {asStages(b.productionStages).length}/6 công đoạn</p>
                      <p className="truncate font-medium">{b.batchTitle}</p>
                      <p className="text-xs text-tro">Cập nhật {timeAgo(b.updatedAt)}</p>
                    </div>
                    <div className="text-right">
                      <Badge tone={b.status === "COMPLETED" ? "celadon" : "gold"}>{b.status === "COMPLETED" ? "Đã khóa" : "Đang làm"}</Badge>
                      <p className="mt-1 flex items-center justify-end gap-1 font-mono text-xs text-tro"><ScanLine className="size-3" />{b.scanCount}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
