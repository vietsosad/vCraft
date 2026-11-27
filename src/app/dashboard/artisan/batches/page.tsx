import Link from "next/link";
import { QrCode, ScanLine, Lock } from "lucide-react";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { asStages } from "@/lib/types";
import { GLAZES } from "@/lib/constants";
import { formatDate, formatNumber } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button";
import { Badge, EmptyState, PageHeader } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

export default async function BatchesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const user = await pageRequireRole("/dashboard/artisan/batches", "ARTISAN");
  const allBatches = await prisma.productBatch.findMany({
    where: { artisanId: user.artisanId! },
    orderBy: { createdAt: "desc" },
    include: { quoteRequest: { select: { requestCode: true } }, _count: { select: { products: true } } },
  });

  const activeFilter = status === "IN_PROGRESS" || status === "COMPLETED" ? status : "ALL";
  const batches = activeFilter === "ALL" ? allBatches : allBatches.filter((b) => b.status === activeFilter);
  const inProgressCount = allBatches.filter((b) => b.status === "IN_PROGRESS").length;
  const completedCount = allBatches.filter((b) => b.status === "COMPLETED").length;

  const tabs = [
    { key: "ALL", label: `Tất cả (${allBatches.length})`, href: "/dashboard/artisan/batches" },
    { key: "IN_PROGRESS", label: `Đang làm (${inProgressCount})`, href: "/dashboard/artisan/batches?status=IN_PROGRESS" },
    { key: "COMPLETED", label: `Đã khóa (${completedCount})`, href: "/dashboard/artisan/batches?status=COMPLETED" },
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lô sản xuất & nhật ký"
        description="Mỗi lô có một mã QR dùng chung cho mọi sản phẩm trong lô. Lô hoàn tất sẽ khóa nhật ký."
        actions={
          <ButtonLink href="/dashboard/artisan/batches/new">
            <QrCode className="size-4" aria-hidden /> Mở lô mới
          </ButtonLink>
        }
        className="mb-0"
      />

      {allBatches.length > 0 && (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Lọc trạng thái lô">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={t.href}
              role="tab"
              aria-selected={activeFilter === t.key}
              className={cn(
                "inline-flex min-h-11 items-center rounded-[var(--radius-tile)] border px-4 text-sm font-semibold transition-colors",
                activeFilter === t.key
                  ? "border-datnung bg-datnung text-on"
                  : "border-vua bg-su/80 text-tro hover:border-datnung/40 hover:text-muc",
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>
      )}

      {batches.length === 0 ? (
        <EmptyState
          title={allBatches.length === 0 ? "Mỗi mẻ gốm là một câu chuyện" : "Không có lô nào ở trạng thái này"}
          description={allBatches.length === 0 ? "Hãy mở lô đầu tiên và ghi lại công đoạn xử lý đất." : "Chuyển sang thẻ Tất cả để xem toàn bộ lô của xưởng."}
          action={
            allBatches.length === 0 ? (
              <ButtonLink href="/dashboard/artisan/batches/new">Mở lô mới</ButtonLink>
            ) : (
              <ButtonLink href="/dashboard/artisan/batches" variant="outline">Xem tất cả lô</ButtonLink>
            )
          }
        />
      ) : (
        <>
          {/* Thẻ cho điện thoại (thao tác một tay, không cuộn ngang) */}
          <ul className="space-y-3 md:hidden">
            {batches.map((b) => {
              const n = asStages(b.productionStages).filter((s) => !s.isAddendum).length;
              return (
                <li key={b.id}>
                  <Link href={`/dashboard/artisan/batches/${b.batchCode}`} className="tile glaze block bg-su p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="code text-datnung">{b.batchCode}</span>
                      <Badge tone={b.status === "COMPLETED" ? "celadon" : "gold"}>
                        {b.status === "COMPLETED" ? <><Lock className="size-3" /> Đã khóa</> : "Đang làm"}
                      </Badge>
                    </div>
                    <p className="mt-1.5 font-serif text-lg font-semibold leading-snug">{b.batchTitle}</p>
                    <p className="mt-1 text-xs text-tro">
                      {GLAZES[b.glazeType].label} · {formatNumber(b.quantityProduced)} sp · {b._count.products} sản phẩm gắn lô
                      {b.quoteRequest ? ` · đơn ${b.quoteRequest.requestCode}` : ""}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex flex-1 items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-nga-sau">
                          <div className="h-full bg-datnung" style={{ width: `${Math.min(100, (n / 6) * 100)}%` }} />
                        </div>
                        <span className="font-mono text-xs text-tro">{n}/6</span>
                      </div>
                      <span className="inline-flex items-center gap-1 font-mono text-xs text-tro">
                        <ScanLine className="size-3.5" aria-hidden /> {formatNumber(b.scanCount)}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Bảng cho máy tính */}
          <div className="relative hidden overflow-x-auto rounded-[var(--radius-tile)] border border-vua bg-su/80 md:block">
            <table className="w-full text-sm">
              <thead className="bg-nga-dam/70 text-left text-xs uppercase tracking-wider text-tro">
                <tr>
                  <th className="px-4 py-3">Mã lô</th>
                  <th className="px-4 py-3">Tên lô</th>
                  <th className="px-4 py-3">Tiến độ</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Lượt quét</th>
                  <th className="px-4 py-3">Ngày mở</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vua">
                {batches.map((b) => {
                  const n = asStages(b.productionStages).filter((s) => !s.isAddendum).length;
                  return (
                    <tr key={b.id} className="hover:bg-nga-dam/40">
                      <td className="px-4 py-3 font-mono text-xs">
                        <Link href={`/dashboard/artisan/batches/${b.batchCode}`} className="font-semibold text-datnung hover:underline">
                          {b.batchCode}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/artisan/batches/${b.batchCode}`} className="font-medium hover:text-datnung">
                          {b.batchTitle}
                        </Link>
                        <p className="text-xs text-tro">
                          {GLAZES[b.glazeType].label} · {formatNumber(b.quantityProduced)} sp · {b._count.products} sản phẩm gắn lô
                          {b.quoteRequest ? ` · đơn ${b.quoteRequest.requestCode}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-1.5 w-28 overflow-hidden rounded bg-nga-sau">
                          <div className="h-full bg-datnung" style={{ width: `${Math.min(100, (n / 6) * 100)}%` }} />
                        </div>
                        <p className="mt-1 font-mono text-[11px] text-tro">{n}/6 công đoạn</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={b.status === "COMPLETED" ? "celadon" : "gold"}>
                          {b.status === "COMPLETED" ? "Đã khóa" : "Đang làm"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{formatNumber(b.scanCount)}</td>
                      <td className="px-4 py-3 text-xs text-tro">{formatDate(b.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
