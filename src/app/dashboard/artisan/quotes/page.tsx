import Link from "next/link";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { asStrings } from "@/lib/types";
import { GLAZES } from "@/lib/constants";
import { formatDate, formatNumber, formatVnd } from "@/lib/format";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { QuoteStatusBadge } from "@/components/quotes/quote-status";

export const dynamic = "force-dynamic";

const BID_LABEL = { PENDING: ["Đã chào giá", "gold"], ACCEPTED: ["Trúng thầu", "celadon"], REJECTED: ["Không được chọn", "ash"], WITHDRAWN: ["Đã rút", "ash"] } as const;

export default async function ArtisanQuotesPage() {
  const user = await pageRequireRole("/dashboard/artisan/quotes", "ARTISAN");
  const invitations = await prisma.quoteInvitation.findMany({
    where: { artisanId: user.artisanId! },
    orderBy: { createdAt: "desc" },
    include: { quoteRequest: { include: { bids: { where: { artisanId: user.artisanId! } } } } },
  });

  return (
    <div>
      <h2 className="text-3xl">Cơ hội báo giá</h2>
      <p className="mb-6 text-sm text-tro">Các yêu cầu sỉ mà xưởng bạn được hệ thống hoặc Ban quản lý mời chào giá. Đây là đấu giá kín: bạn không thấy giá của xưởng khác.</p>
      {invitations.length === 0 ? (
        <EmptyState title="Chưa có lời mời nào" description="Hoàn thiện dòng men sở trường và công suất trong hồ sơ xưởng để được ghép đơn phù hợp." />
      ) : (
        <ul className="space-y-3">
          {invitations.map((i) => {
            const q = i.quoteRequest;
            const bid = q.bids[0];
            return (
              <li key={i.id}>
                <Link href={`/dashboard/artisan/quotes/${q.requestCode}`} className="block rounded-[var(--radius-tile)] border border-vua bg-su/70 p-5 hover:border-datnung/40">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-lam">{q.requestCode}</span>
                    <QuoteStatusBadge status={q.status} />
                    {bid ? <Badge tone={BID_LABEL[bid.status][1]}>{BID_LABEL[bid.status][0]}</Badge> : ["SENT_TO_ARTISANS", "ARTISANS_BIDDING"].includes(q.status) && <Badge tone="terracotta">Chưa chào giá</Badge>}
                    {i.invitedBy === "ADMIN" && <Badge tone="cobalt">BQL mời</Badge>}
                  </div>
                  <p className="mt-2 font-serif text-xl">{q.title}</p>
                  <p className="text-sm text-tro">
                    {q.organizationName} · {formatNumber(q.quantity)} sp · {GLAZES[q.preferredGlaze].label} · ngân sách {formatVnd(q.targetBudgetPerUnit)}/sp · cần trong {q.deadlineDays} ngày
                    {q.biddingClosesAt && ` · hạn chào giá ${formatDate(q.biddingClosesAt, true)}`}
                  </p>
                  <p className="mt-2 text-xs text-tro">Lý do được mời: {asStrings(i.matchReasons).join(" · ")}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
