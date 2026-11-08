import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FilePlus2, Users, Scale, Lock, Factory, Truck } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { GLAZES } from "@/lib/constants";
import { formatDate, formatNumber, formatVnd } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/primitives";
import { QuoteStatusBadge } from "@/components/quotes/quote-status";

export const metadata: Metadata = { title: "Đặt hàng sỉ", description: "Gửi yêu cầu báo giá sỉ tới các xưởng gốm Bát Tràng, so sánh chào giá và chia đơn cho nhiều hộ." };
export const dynamic = "force-dynamic";

const STEPS = [
  { icon: FilePlus2, title: "Gửi một yêu cầu", text: "Mô tả số lượng, dòng men, thời hạn, file logo." },
  { icon: Users, title: "Hệ thống mời đúng xưởng", text: "Lọc theo dòng men, công suất và uy tín." },
  { icon: Scale, title: "So sánh chào giá kín", text: "Các xưởng không thấy giá của nhau." },
  { icon: Lock, title: "Chốt và chia đơn", text: "Khóa bản ghi chống chốt trùng, sinh lô QR cho từng hộ." },
  { icon: Factory, title: "Theo dõi sản xuất", text: "Xem nhật ký lô của từng xưởng." },
  { icon: Truck, title: "Nhận hàng", text: "Xác nhận khi mọi lô đã hoàn tất." },
];

export default async function QuotesPage() {
  const user = await getCurrentUser();
  if (user?.role === "ARTISAN") redirect("/dashboard/artisan/quotes");
  if (user?.role === "ADMIN") redirect("/dashboard/admin/coordination");

  const quotes = user
    ? await prisma.quoteRequest.findMany({
        where: { buyerId: user.id },
        orderBy: { updatedAt: "desc" },
        include: { _count: { select: { bids: { where: { status: { not: "WITHDRAWN" } } } } } },
      })
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow !text-cobalt">Phòng đấu thầu B2B</p>
          <h1 className="mt-3 text-5xl md:text-6xl">Đặt hàng sỉ</h1>
          <p className="mt-3 max-w-2xl text-ash">Một yêu cầu, nhiều xưởng chào giá, chia đơn minh bạch cho nhiều hộ cùng làm.</p>
        </div>
        <ButtonLink href="/b2b-quotes/new" variant="cobalt" size="lg"><FilePlus2 className="size-4" /> Tạo yêu cầu báo giá</ButtonLink>
      </div>

      <ol className="mt-10 grid gap-px overflow-hidden rounded-[var(--radius-tile)] border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
        {STEPS.map((s, i) => (
          <li key={s.title} className="bg-kaolin p-5">
            <s.icon className="size-5 text-cobalt" />
            <p className="mt-3 font-mono text-[11px] text-ash">Bước {i + 1}</p>
            <p className="font-display text-lg leading-tight">{s.title}</p>
            <p className="mt-1 text-xs text-ash">{s.text}</p>
          </li>
        ))}
      </ol>

      <section className="mt-12">
        <h2 className="text-3xl">Yêu cầu của tôi</h2>
        {!user ? (
          <div className="mt-6">
            <EmptyState title="Đăng nhập để quản lý yêu cầu báo giá" description="Tài khoản khách sỉ giúp bạn theo dõi chào giá và tiến độ sản xuất theo thời gian thực." action={<ButtonLink href="/login?next=/b2b-quotes">Đăng nhập</ButtonLink>} />
          </div>
        ) : quotes.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="Bạn chưa có yêu cầu nào" description="Thử đặt 500 chiếc cốc men trắng ngà in logo cho sự kiện sắp tới." action={<ButtonLink href="/b2b-quotes/new" variant="cobalt">Tạo yêu cầu đầu tiên</ButtonLink>} />
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-[var(--radius-tile)] border border-line bg-white/70">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-bisque/70 text-left text-xs uppercase tracking-wider text-ash">
                <tr><th className="px-4 py-3">Mã</th><th className="px-4 py-3">Yêu cầu</th><th className="px-4 py-3 text-right">Số lượng</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3 text-right">Chào giá</th><th className="px-4 py-3">Cập nhật</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-bisque/40">
                    <td className="px-4 py-3 font-mono text-xs"><Link href={`/b2b-quotes/${q.requestCode}`} className="text-cobalt hover:underline">{q.requestCode}</Link></td>
                    <td className="px-4 py-3"><Link href={`/b2b-quotes/${q.requestCode}`} className="hover:text-terracotta">{q.title}</Link><p className="text-xs text-ash">{GLAZES[q.preferredGlaze].label} · ngân sách {formatVnd(q.targetBudgetPerUnit)}/sp</p></td>
                    <td className="px-4 py-3 text-right font-mono tabular">{formatNumber(q.quantity)}</td>
                    <td className="px-4 py-3"><QuoteStatusBadge status={q.status} /></td>
                    <td className="px-4 py-3 text-right font-mono">{q._count.bids}</td>
                    <td className="px-4 py-3 text-xs text-ash">{formatDate(q.updatedAt, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
