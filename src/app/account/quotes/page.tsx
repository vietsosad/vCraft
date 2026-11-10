import type { Metadata } from "next";
import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { GLAZES } from "@/lib/constants";
import { formatDate, formatNumber, formatVnd } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/primitives";
import { QuoteStatusBadge } from "@/components/quotes/quote-status";

export const metadata: Metadata = { title: "Đơn đặt sỉ của tôi" };
export const dynamic = "force-dynamic";

export default async function AccountQuotes() {
  const user = await pageRequireRole("/account/quotes", "BUYER");
  const quotes = await prisma.quoteRequest.findMany({
    where: { buyerId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { bids: { where: { status: { not: "WITHDRAWN" } } } } } },
  });

  return (
    <>
      <PageHeader
        title="Đơn đặt sỉ"
        description="Một yêu cầu, nhiều xưởng chào giá kín. So sánh, chốt và chia đơn cho nhiều hộ cùng làm."
        actions={<ButtonLink href="/account/quotes/new"><FilePlus2 className="size-4" /> Tạo yêu cầu báo giá</ButtonLink>}
      />
      {quotes.length === 0 ? (
        <EmptyState title="Bạn chưa có yêu cầu nào" description="Thử đặt 500 chiếc cốc men trắng ngà in logo cho sự kiện sắp tới." action={<ButtonLink href="/account/quotes/new">Tạo yêu cầu đầu tiên</ButtonLink>} />
      ) : (
        <div className="relative overflow-x-auto rounded-[8px] border border-vua bg-su">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-nga-dam text-left text-xs font-semibold text-tro">
              <tr>
                <th className="px-4 py-3">Mã</th>
                <th className="px-4 py-3">Yêu cầu</th>
                <th className="px-4 py-3 text-right">Số lượng</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Chào giá</th>
                <th className="px-4 py-3">Cập nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vua">
              {quotes.map((q, i) => (
                <tr key={q.id} data-reveal style={{ ["--d" as string]: `${i * 40}ms` }} className="transition hover:bg-nga-dam/50">
                  <td className="px-4 py-3"><Link href={`/account/quotes/${q.requestCode}`} className="code text-lam hover:underline">{q.requestCode}</Link></td>
                  <td className="px-4 py-3">
                    <Link href={`/account/quotes/${q.requestCode}`} className="font-medium hover:text-lam">{q.title}</Link>
                    <p className="text-xs text-tro">{GLAZES[q.preferredGlaze].label} · ngân sách {formatVnd(q.targetBudgetPerUnit)}/sp</p>
                  </td>
                  <td className="px-4 py-3 text-right tabular">{formatNumber(q.quantity)}</td>
                  <td className="px-4 py-3"><QuoteStatusBadge status={q.status} /></td>
                  <td className="px-4 py-3 text-right tabular">{q._count.bids}</td>
                  <td className="px-4 py-3 text-xs text-tro">{formatDate(q.updatedAt, true)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
