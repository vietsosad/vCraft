import Link from "next/link";
import { prisma } from "@/lib/db";
import { asStages } from "@/lib/types";
import { GLAZES } from "@/lib/constants";
import { formatDate, formatNumber, formatVnd } from "@/lib/format";
import { Badge, Card, EmptyState } from "@/components/ui/primitives";
import { QuoteStatusBadge } from "@/components/quotes/quote-status";
import { InviteArtisans } from "@/components/admin/invite-artisans";

export const dynamic = "force-dynamic";

/** Bảng điều phối đơn sỉ toàn làng: xem mọi yêu cầu, chào giá, phân bổ và tiến độ từng lô. */
export default async function CoordinationPage() {
  const [quotes, artisans] = await Promise.all([
    prisma.quoteRequest.findMany({
      where: { status: { not: "DRAFT_REQUEST" } },
      orderBy: { updatedAt: "desc" },
      include: {
        bids: { where: { status: { not: "WITHDRAWN" } }, include: { artisan: { select: { workshopName: true } } }, orderBy: { offeredPricePerUnit: "asc" } },
        invitations: { select: { artisanId: true } },
        allocatedBatches: { select: { batchCode: true, status: true, allocatedQuantity: true, productionStages: true, artisan: { select: { workshopName: true } } } },
      },
    }),
    prisma.artisanProfile.findMany({ where: { verificationStatus: "APPROVED", acceptsWholesale: true }, select: { id: true, workshopName: true, maxMonthlyCapacity: true } }),
  ]);

  if (quotes.length === 0) return <EmptyState title="Chưa có đơn sỉ nào được gửi" />;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-3xl">Điều phối đơn sỉ</h2>
        <p className="text-sm text-ash">BQL xem được mọi chào giá, mời thêm xưởng khi đơn ít người chào và theo dõi tiến độ từng hộ được phân bổ.</p>
      </div>
      {quotes.map((q) => {
        const committed = q.bids.filter((b) => b.status === "PENDING").reduce((s, b) => s + b.committedQuantity, 0);
        const open = ["SENT_TO_ARTISANS", "ARTISANS_BIDDING"].includes(q.status);
        const notInvited = artisans.filter((a) => !q.invitations.some((i) => i.artisanId === a.id));
        return (
          <Card key={q.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/b2b-quotes/${q.requestCode}`} className="font-mono text-sm text-cobalt hover:underline">{q.requestCode}</Link>
                  <QuoteStatusBadge status={q.status} />
                  <span className="font-mono text-[11px] text-ash">v{q.version}</span>
                </div>
                <p className="mt-1 font-display text-xl">{q.title}</p>
                <p className="text-sm text-ash">{q.organizationName} · {formatNumber(q.quantity)} sp · {GLAZES[q.preferredGlaze].label} · cập nhật {formatDate(q.updatedAt, true)}</p>
              </div>
              {open && (
                <div className="text-right text-sm">
                  <p>Đã chào nhận <strong className={committed >= q.quantity ? "text-celadon" : "text-terracotta"}>{formatNumber(committed)}</strong> / {formatNumber(q.quantity)} sp</p>
                  <p className="text-xs text-ash">{q.invitations.length} xưởng được mời · {q.bids.length} chào giá</p>
                </div>
              )}
            </div>

            {open && q.bids.length > 0 && (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {q.bids.map((b) => (
                  <li key={b.id} className="rounded-md border border-line bg-white/80 p-3 text-sm">
                    <p className="font-medium">{b.artisan.workshopName}</p>
                    <p className="font-mono text-xs">{formatVnd(b.offeredPricePerUnit)} · {formatNumber(b.committedQuantity)} sp · {b.estimatedDays} ngày</p>
                  </li>
                ))}
              </ul>
            )}
            {open && committed < q.quantity && notInvited.length > 0 && <InviteArtisans code={q.requestCode} artisans={notInvited} />}

            {q.allocatedBatches.length > 0 && (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {q.allocatedBatches.map((b) => {
                  const n = asStages(b.productionStages).length;
                  const late = q.status === "IN_PRODUCTION" && n < 3;
                  return (
                    <li key={b.batchCode} className="rounded-md border border-line bg-white/80 p-3 text-sm">
                      <div className="flex items-center justify-between gap-2"><span className="font-medium">{b.artisan.workshopName}</span><Badge tone={b.status === "COMPLETED" ? "celadon" : late ? "terracotta" : "gold"}>{b.status === "COMPLETED" ? "Hoàn tất" : late ? "Cần đôn đốc" : "Đang làm"}</Badge></div>
                      <p className="font-mono text-xs text-ash">{b.batchCode} · {formatNumber(b.allocatedQuantity ?? 0)} sp · {n}/6 công đoạn</p>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded bg-bisque"><div className="h-full bg-terracotta" style={{ width: `${Math.min(100, (n / 6) * 100)}%` }} /></div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        );
      })}
    </div>
  );
}
