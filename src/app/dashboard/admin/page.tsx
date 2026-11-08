import Link from "next/link";
import type { QuoteStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getStats } from "@/lib/services/admin-service";
import { QUOTE_FLOW, QUOTE_STATUS, GLAZES, GLAZE_KEYS } from "@/lib/constants";
import { formatNumber, formatVnd, timeAgo } from "@/lib/format";
import { Card, Stat } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

const ACTION_LABEL: Record<string, string> = {
  ARTISAN_APPROVED: "Duyệt hộ nghề", ARTISAN_REJECTED: "Từ chối hồ sơ", USER_SUSPENDED: "Khóa tài khoản", USER_REACTIVATED: "Mở khóa tài khoản",
  NEWS_CREATED: "Đăng tin", NEWS_UPDATED: "Sửa tin", NEWS_DELETED: "Xóa tin", QUOTE_ACCEPTED: "Chốt đơn sỉ", QUOTE_INVITE: "Mời thêm xưởng",
};

export default async function AdminOverview() {
  const [stats, byGlaze, topBatches, logs] = await Promise.all([
    getStats(),
    prisma.product.groupBy({ by: ["glazeType"], where: { isPublished: true }, _count: { _all: true } }),
    prisma.productBatch.findMany({ orderBy: { scanCount: "desc" }, take: 5, include: { artisan: { select: { workshopName: true } } } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { actor: { select: { name: true } } } }),
  ]);
  const maxQuotes = Math.max(1, ...QUOTE_FLOW.map((s) => stats.quotesByStatus[s] ?? 0));
  const maxGlaze = Math.max(1, ...byGlaze.map((g) => g._count._all));
  const maxScan = Math.max(1, ...topBatches.map((b) => b.scanCount));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Stat label="Hộ nghề xác thực" value={stats.artisans} />
        <Link href="/dashboard/admin/approvals" className="block"><Stat label="Hồ sơ chờ duyệt" value={<span className={stats.pending ? "text-terracotta" : ""}>{stats.pending}</span>} hint="Bấm để duyệt" /></Link>
        <Stat label="Tác phẩm công khai" value={stats.products} />
        <Stat label="Lượt quét QR" value={formatNumber(stats.scans)} hint={`${stats.batches} lô sản xuất`} />
        <Stat label="Giá trị đơn sỉ đã chốt" value={<span className="text-3xl">{formatVnd(stats.orderValue)}</span>} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-2xl">Yêu cầu báo giá theo trạng thái</h2>
          <ul className="mt-5 space-y-3">
            {(QUOTE_FLOW as QuoteStatus[]).map((s) => {
              const n = stats.quotesByStatus[s] ?? 0;
              return (
                <li key={s} className="grid grid-cols-[150px_1fr_32px] items-center gap-3 text-sm">
                  <span className="text-ash">{QUOTE_STATUS[s].label}</span>
                  <span className="h-3 overflow-hidden rounded-full bg-bisque"><span className="block h-full rounded-full bg-cobalt" style={{ width: `${(n / maxQuotes) * 100}%` }} /></span>
                  <span className="text-right font-mono">{n}</span>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card className="p-6">
          <h2 className="text-2xl">Tác phẩm theo dòng men</h2>
          <ul className="mt-5 space-y-3">
            {GLAZE_KEYS.map((g) => {
              const n = byGlaze.find((x) => x.glazeType === g)?._count._all ?? 0;
              return (
                <li key={g} className="grid grid-cols-[150px_1fr_32px] items-center gap-3 text-sm">
                  <span className="flex items-center gap-1.5 text-ash"><span className="size-2.5 rounded-full" style={{ background: GLAZES[g].color }} />{GLAZES[g].label}</span>
                  <span className="h-3 overflow-hidden rounded-full bg-bisque"><span className="block h-full rounded-full bg-terracotta" style={{ width: `${(n / maxGlaze) * 100}%` }} /></span>
                  <span className="text-right font-mono">{n}</span>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card className="p-6">
          <h2 className="text-2xl">Lô được quét nhiều nhất</h2>
          <ul className="mt-5 space-y-3">
            {topBatches.map((b) => (
              <li key={b.id} className="text-sm">
                <div className="flex justify-between gap-2"><Link href={`/trace/${b.batchCode}`} className="truncate hover:text-terracotta">{b.batchTitle}</Link><span className="font-mono">{formatNumber(b.scanCount)}</span></div>
                <div className="mt-1 h-1.5 overflow-hidden rounded bg-bisque"><div className="h-full bg-celadon" style={{ width: `${(b.scanCount / maxScan) * 100}%` }} /></div>
                <p className="mt-0.5 text-xs text-ash">{b.artisan.workshopName} · {b.batchCode}</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-6">
          <h2 className="text-2xl">Nhật ký thao tác</h2>
          <ul className="mt-5 divide-y divide-line text-sm">
            {logs.length === 0 && <li className="py-3 text-ash">Chưa có thao tác nào.</li>}
            {logs.map((l) => (
              <li key={l.id} className="flex justify-between gap-3 py-2.5">
                <span><strong>{l.actor?.name ?? "Hệ thống"}</strong> · {ACTION_LABEL[l.action] ?? l.action}</span>
                <span className="shrink-0 text-xs text-ash">{timeAgo(l.createdAt)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
