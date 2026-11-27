import Link from "next/link";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { asStrings } from "@/lib/types";
import { GLAZES } from "@/lib/constants";
import { formatDate, formatNumber, formatVnd } from "@/lib/format";
import { Badge, EmptyState, PageHeader } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { QuoteStatusBadge } from "@/components/quotes/quote-status";
import { classifyArtisanQuote, normalizeQuoteTab } from "@/lib/artisan-quotes";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

const BID_LABEL = {
  PENDING: ["Đã chào giá", "gold"],
  ACCEPTED: ["Trúng thầu", "celadon"],
  REJECTED: ["Không được chọn", "ash"],
  WITHDRAWN: ["Đã rút", "ash"],
} as const;

export default async function ArtisanQuotesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const activeTab = normalizeQuoteTab(tab);
  const user = await pageRequireRole("/dashboard/artisan/quotes", "ARTISAN");

  const invitations = await prisma.quoteInvitation.findMany({
    where: { artisanId: user.artisanId! },
    orderBy: { createdAt: "desc" },
    include: { quoteRequest: { include: { bids: { where: { artisanId: user.artisanId! } } } } },
  });

  const classified = invitations.map((inv) => {
    const bid = inv.quoteRequest.bids[0];
    return { inv, bid, bucket: classifyArtisanQuote(inv.quoteRequest.status, bid) };
  });

  const counts = {
    all: classified.length,
    pending: classified.filter((x) => x.bucket === "pending").length,
    active: classified.filter((x) => x.bucket === "active").length,
    history: classified.filter((x) => x.bucket === "history").length,
  };

  const items = activeTab === "all" ? classified : classified.filter((x) => x.bucket === activeTab);

  const tabs = [
    { key: "all", label: `Tất cả (${counts.all})`, href: "/dashboard/artisan/quotes" },
    { key: "pending", label: `Chờ chào giá (${counts.pending})`, href: "/dashboard/artisan/quotes?tab=pending" },
    { key: "active", label: `Đơn đang làm (${counts.active})`, href: "/dashboard/artisan/quotes?tab=active" },
    { key: "history", label: `Đã chào & lịch sử (${counts.history})`, href: "/dashboard/artisan/quotes?tab=history" },
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cơ hội báo giá & đơn sỉ"
        description="Các yêu cầu sỉ mà xưởng bạn được hệ thống hoặc Ban quản lý mời chào giá. Đây là đấu giá kín: bạn không thấy giá của xưởng khác."
        className="mb-0"
      />

      {invitations.length > 0 && (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Lọc cơ hội báo giá">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={t.href}
              role="tab"
              aria-selected={activeTab === t.key}
              className={cn(
                "inline-flex min-h-11 items-center rounded-[var(--radius-tile)] border px-4 text-sm font-semibold transition-colors",
                activeTab === t.key
                  ? "border-datnung bg-datnung text-on"
                  : "border-vua bg-su/80 text-tro hover:border-datnung/40 hover:text-muc",
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          title={invitations.length === 0 ? "Chưa có lời mời nào" : "Không có yêu cầu nào trong mục này"}
          description={
            invitations.length === 0
              ? "Hoàn thiện dòng men sở trường và công suất trong hồ sơ xưởng để được ghép đơn phù hợp."
              : "Chọn thẻ Tất cả để xem toàn bộ cơ hội báo giá của xưởng."
          }
          action={
            invitations.length === 0 ? (
              <ButtonLink href="/dashboard/artisan/profile" variant="outline">Cập nhật hồ sơ xưởng</ButtonLink>
            ) : (
              <ButtonLink href="/dashboard/artisan/quotes" variant="outline">Xem tất cả</ButtonLink>
            )
          }
        />
      ) : (
        <ul className="space-y-3">
          {items.map(({ inv: i, bid, bucket }) => {
            const q = i.quoteRequest;
            const allocated = bid?.allocatedQuantity ?? bid?.committedQuantity;
            return (
              <li key={i.id}>
                <Link
                  href={`/dashboard/artisan/quotes/${q.requestCode}`}
                  className="tile glaze block bg-su p-5 transition-colors hover:border-datnung/50"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="code text-lam">{q.requestCode}</span>
                    <QuoteStatusBadge status={q.status} />
                    {bid ? (
                      <Badge tone={BID_LABEL[bid.status][1]}>{BID_LABEL[bid.status][0]}</Badge>
                    ) : (
                      ["SENT_TO_ARTISANS", "ARTISANS_BIDDING"].includes(q.status) && <Badge tone="terracotta">Chưa chào giá</Badge>
                    )}
                    {i.invitedBy === "ADMIN" && <Badge tone="cobalt">BQL mời</Badge>}
                  </div>

                  <p className="mt-2 font-serif text-xl font-semibold">{q.title}</p>

                  {bid?.status === "ACCEPTED" && allocated ? (
                    <p className="mt-1 text-sm text-ngoc">
                      {q.organizationName} · được phân bổ <strong>{formatNumber(allocated)} sp</strong> · giá trị{" "}
                      <strong>{formatVnd(allocated * bid.offeredPricePerUnit)}</strong>
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-tro">
                      {q.organizationName} · {formatNumber(q.quantity)} sp · {GLAZES[q.preferredGlaze].label} · ngân sách{" "}
                      {formatVnd(q.targetBudgetPerUnit)}/sp · cần trong {q.deadlineDays} ngày
                      {q.biddingClosesAt && ` · hạn chào giá ${formatDate(q.biddingClosesAt, true)}`}
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-tro">
                    <span>Lý do được mời: {asStrings(i.matchReasons).join(" · ")}</span>
                    <span className="font-semibold text-datnung">
                      {bucket === "pending"
                        ? "Chào giá ngay →"
                        : bucket === "active"
                          ? "Cập nhật sản xuất & giao hàng →"
                          : "Xem chi tiết →"}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
