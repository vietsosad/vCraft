import Link from "next/link";
import { QrCode } from "lucide-react";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { asStages } from "@/lib/types";
import { GLAZES } from "@/lib/constants";
import { formatDate, formatNumber } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button";
import { Badge, EmptyState } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function BatchesPage() {
  const user = await pageRequireRole("/dashboard/artisan/batches", "ARTISAN");
  const batches = await prisma.productBatch.findMany({
    where: { artisanId: user.artisanId! },
    orderBy: { createdAt: "desc" },
    include: { quoteRequest: { select: { requestCode: true } }, _count: { select: { products: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl">Lô sản xuất & nhật ký</h2>
          <p className="text-sm text-tro">Mỗi lô có một mã QR dùng chung cho mọi sản phẩm trong lô. Lô hoàn tất sẽ khóa nhật ký.</p>
        </div>
        <ButtonLink href="/dashboard/artisan/batches/new"><QrCode className="size-4" /> Mở lô mới</ButtonLink>
      </div>
      {batches.length === 0 ? (
        <EmptyState title="Mỗi mẻ gốm là một câu chuyện" description="Hãy mở lô đầu tiên và ghi lại công đoạn xử lý đất." action={<ButtonLink href="/dashboard/artisan/batches/new">Mở lô mới</ButtonLink>} />
      ) : (
        <div className="relative overflow-x-auto rounded-[var(--radius-tile)] border border-vua bg-su/70">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-nga-dam/70 text-left text-xs uppercase tracking-wider text-tro">
              <tr><th className="px-4 py-3">Mã lô</th><th className="px-4 py-3">Tên lô</th><th className="px-4 py-3">Tiến độ</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3 text-right">Lượt quét</th><th className="px-4 py-3">Ngày mở</th></tr>
            </thead>
            <tbody className="divide-y divide-vua">
              {batches.map((b) => {
                const n = asStages(b.productionStages).filter((s) => !s.isAddendum).length;
                return (
                  <tr key={b.id} className="hover:bg-nga-dam/40">
                    <td className="px-4 py-3 font-mono text-xs"><Link href={`/dashboard/artisan/batches/${b.batchCode}`} className="text-datnung hover:underline">{b.batchCode}</Link></td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/artisan/batches/${b.batchCode}`} className="hover:text-datnung">{b.batchTitle}</Link>
                      <p className="text-xs text-tro">{GLAZES[b.glazeType].label} · {formatNumber(b.quantityProduced)} sp · {b._count.products} sản phẩm gắn lô{b.quoteRequest ? ` · đơn ${b.quoteRequest.requestCode}` : ""}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-1.5 w-28 overflow-hidden rounded bg-nga-sau"><div className="h-full bg-datnung" style={{ width: `${Math.min(100, (n / 6) * 100)}%` }} /></div>
                      <p className="mt-1 font-mono text-[11px] text-tro">{n}/6 công đoạn</p>
                    </td>
                    <td className="px-4 py-3"><Badge tone={b.status === "COMPLETED" ? "celadon" : "gold"}>{b.status === "COMPLETED" ? "Đã khóa" : "Đang làm"}</Badge></td>
                    <td className="px-4 py-3 text-right font-mono">{formatNumber(b.scanCount)}</td>
                    <td className="px-4 py-3 text-xs text-tro">{formatDate(b.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
