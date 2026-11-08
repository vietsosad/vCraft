import Link from "next/link";
import { ArrowRight, Megaphone, QrCode, FileText, Package, ScanLine } from "lucide-react";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { getOpenState } from "@/lib/opening-hours";
import { asStages } from "@/lib/types";
import { formatDate, formatNumber, timeAgo } from "@/lib/format";
import { NEWS_CATEGORIES } from "@/lib/constants";
import { Card, Stat, EmptyState, Badge } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { OpenToggle } from "@/components/artisan/open-toggle";

export const dynamic = "force-dynamic";

export default async function ArtisanDashboard() {
  const user = await pageRequireRole("/dashboard/artisan", "ARTISAN");
  const artisanId = user.artisanId!;
  const [profile, products, batches, invitations, urgent] = await Promise.all([
    prisma.artisanProfile.findUniqueOrThrow({ where: { id: artisanId }, select: { isOpenForVisit: true, openingHours: true, openDays: true } }),
    prisma.product.count({ where: { artisanId } }),
    prisma.productBatch.findMany({ where: { artisanId }, orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.quoteInvitation.findMany({
      where: { artisanId, quoteRequest: { status: { in: ["SENT_TO_ARTISANS", "ARTISANS_BIDDING"] } } },
      include: { quoteRequest: { include: { bids: { where: { artisanId }, select: { id: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.communityNews.findMany({ where: { isPublished: true, isUrgent: true }, orderBy: { publishedAt: "desc" }, take: 2 }),
  ]);
  const scans = batches.reduce((s, b) => s + b.scanCount, 0);
  const open = getOpenState(profile);
  const newOpps = invitations.filter((i) => i.quoteRequest.bids.length === 0);

  return (
    <div className="space-y-8">
      {urgent.map((n) => (
        <Link key={n.id} href={`/news/${n.slug}`} className="flex items-center gap-3 rounded-[var(--radius-tile)] bg-terracotta px-4 py-3 text-sm text-kaolin">
          <Megaphone className="size-4 shrink-0" />
          <span className="font-mono text-[11px] uppercase tracking-widest">Khẩn · {NEWS_CATEGORIES[n.category]}</span>
          <span className="truncate">{n.title}</span>
          <ArrowRight className="ml-auto size-4 shrink-0" />
        </Link>
      ))}

      <Card className="p-5"><OpenToggle initial={profile.isOpenForVisit} label={open.label} /></Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Sản phẩm" value={products} />
        <Stat label="Lô sản xuất" value={batches.length} />
        <Stat label="Lượt quét QR" value={formatNumber(scans)} />
        <Stat label="Cơ hội báo giá mới" value={newOpps.length} hint={`${invitations.length} yêu cầu đang mở`} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl">Cơ hội báo giá</h2>
            <Link href="/dashboard/artisan/quotes" className="text-sm text-terracotta">Tất cả →</Link>
          </div>
          {invitations.length === 0 ? (
            <EmptyState icon={<FileText className="size-6" />} title="Chưa có lời mời nào" description="Khi khách sỉ cần dòng men xưởng bạn làm, lời mời sẽ xuất hiện ở đây." />
          ) : (
            <ul className="space-y-3">
              {invitations.slice(0, 4).map((i) => (
                <li key={i.id}>
                  <Link href={`/dashboard/artisan/quotes/${i.quoteRequest.requestCode}`} className="block rounded-[var(--radius-tile)] border border-line bg-white/70 p-4 hover:border-terracotta/40">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-cobalt">{i.quoteRequest.requestCode}</span>
                      {i.quoteRequest.bids.length ? <Badge tone="celadon">Đã chào giá</Badge> : <Badge tone="gold">Mới</Badge>}
                    </div>
                    <p className="mt-1 font-medium">{i.quoteRequest.title}</p>
                    <p className="text-xs text-ash">{formatNumber(i.quoteRequest.quantity)} sp · hạn chào giá {i.quoteRequest.biddingClosesAt ? formatDate(i.quoteRequest.biddingClosesAt, true) : "—"}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl">Lô gần đây</h2>
            <ButtonLink href="/dashboard/artisan/batches/new" size="sm"><QrCode className="size-4" /> Mở lô mới</ButtonLink>
          </div>
          {batches.length === 0 ? (
            <EmptyState icon={<Package className="size-6" />} title="Mỗi mẻ gốm là một câu chuyện" description="Mở lô đầu tiên và ghi lại công đoạn đầu tiên." />
          ) : (
            <ul className="space-y-3">
              {batches.map((b) => (
                <li key={b.id}>
                  <Link href={`/dashboard/artisan/batches/${b.batchCode}`} className="flex items-center justify-between gap-3 rounded-[var(--radius-tile)] border border-line bg-white/70 p-4 hover:border-terracotta/40">
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-ash">{b.batchCode} · {asStages(b.productionStages).length}/6 công đoạn</p>
                      <p className="truncate font-medium">{b.batchTitle}</p>
                      <p className="text-xs text-ash">Cập nhật {timeAgo(b.updatedAt)}</p>
                    </div>
                    <div className="text-right">
                      <Badge tone={b.status === "COMPLETED" ? "celadon" : "gold"}>{b.status === "COMPLETED" ? "Đã khóa" : "Đang làm"}</Badge>
                      <p className="mt-1 flex items-center justify-end gap-1 font-mono text-xs text-ash"><ScanLine className="size-3" />{b.scanCount}</p>
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
