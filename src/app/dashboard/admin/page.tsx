import Link from "next/link";
import type { QuoteStatus } from "@prisma/client";
import { ArrowRight, ClipboardCheck, Download } from "lucide-react";
import { prisma } from "@/lib/db";
import { getStats } from "@/lib/services/admin-service";
import { villageStats } from "@/lib/services/stats-service";
import { QUOTE_FLOW, QUOTE_STATUS } from "@/lib/constants";
import { formatNumber, timeAgo } from "@/lib/format";
import { auditLabel } from "@/lib/audit-labels";
import { Card, PageHeader, Stat } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { CountUp } from "@/components/motion/count-up";
import { BarList, DailyColumns, StackedColumns } from "@/components/charts/charts";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [stats, v, logs, pendingApps] = await Promise.all([
    getStats(),
    villageStats(),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 7, include: { actor: { select: { name: true } } } }),
    prisma.artisanProfile.findMany({ where: { verificationStatus: "PENDING" }, select: { id: true, workshopName: true, createdAt: true }, take: 3 }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Toàn cảnh làng nghề"
        description="Số liệu 30 ngày gần nhất của cả làng: lượt quét QR, đơn sỉ, hộ nghề mới và khách đến trải nghiệm."
        actions={<ButtonLink href="/dashboard/admin/reports" variant="outline"><Download className="size-4" /> Xuất báo cáo</ButtonLink>}
      />

      {pendingApps.length > 0 && (
        <Link href="/dashboard/admin/approvals" data-reveal className="tile glaze tile-dat flex items-center gap-4 p-4 text-giay">
          <ClipboardCheck className="size-6 shrink-0" aria-hidden />
          <span className="flex-1">
            <span className="block font-semibold">{pendingApps.length} hồ sơ hộ nghề đang chờ duyệt</span>
            <span className="block text-sm text-giay/80">{pendingApps.map((a) => a.workshopName).join(", ")} · gửi {timeAgo(pendingApps[0].createdAt)}</span>
          </span>
          <ArrowRight className="size-5" aria-hidden />
        </Link>
      )}

      <div className="mosaic grid-cols-2 lg:grid-cols-4">
        <Stat tone="ngoc" label="Hộ nghề xác thực" value={<CountUp value={stats.artisans} />} hint={`${stats.products} tác phẩm công khai`} />
        <Stat label="Lượt quét QR (30 ngày)" value={<CountUp value={v.scans30} />} hint={`${formatNumber(stats.scans)} lượt từ trước tới nay`} />
        <Stat label="Giá trị đơn sỉ đã chốt" value={<span className="text-[2rem]"><CountUp value={v.gmv} format="vnd" /></span>} hint={`${formatNumber(v.unitsAllocated)} sản phẩm đã phân bổ`} />
        <Stat label="Khách đã đặt trải nghiệm" value={<CountUp value={v.guests} />} hint={`${v.bookings.COMPLETED ?? 0} buổi đã diễn ra`} />
      </div>

      <Card className="p-6">
        <h2 className="font-serif text-2xl font-bold normal-case">Lượt quét QR mỗi ngày</h2>
        <p className="mb-4 text-sm text-tro">Mỗi lượt quét là một khách kiểm tra nguồn gốc ngay tại quầy hoặc tại nhà.</p>
        <DailyColumns data={v.scans} label="Lượt quét QR mỗi ngày, 30 ngày gần nhất" unit="lượt quét" />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-serif text-2xl font-bold normal-case">Đăng ký mới theo tuần</h2>
          <p className="mb-4 text-sm text-tro">8 tuần gần nhất.</p>
          <StackedColumns
            label="Đăng ký mới theo tuần, khách hàng và hộ nghề"
            series={[{ name: "Khách hàng", color: "var(--chart-1)" }, { name: "Hộ nghề", color: "var(--chart-2)" }]}
            data={v.registrations.map((r) => ({ x: r.week, values: [r.BUYER, r.ARTISAN] }))}
          />
        </Card>
        <Card className="p-6">
          <h2 className="font-serif text-2xl font-bold normal-case">Yêu cầu báo giá theo trạng thái</h2>
          <p className="mb-5 text-sm text-tro">Theo máy trạng thái của sàn báo giá.</p>
          <BarList
            label="Số yêu cầu báo giá theo trạng thái"
            items={([...QUOTE_FLOW, "CANCELLED"] as QuoteStatus[]).map((s) => ({ label: QUOTE_STATUS[s].label, value: v.quotesByStatus[s] ?? 0 }))}
          />
        </Card>
        <Card className="p-6">
          <h2 className="font-serif text-2xl font-bold normal-case">Xưởng nhận nhiều đơn sỉ nhất</h2>
          <p className="mb-5 text-sm text-tro">Tổng số sản phẩm được phân bổ khi khách chốt.</p>
          <BarList label="Số sản phẩm được phân bổ theo xưởng" color="var(--chart-3)" items={v.topWorkshops.map((t) => ({ label: t.name, value: t.units }))} />
        </Card>
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold normal-case">Nhật ký thao tác</h2>
            <Link href="/dashboard/admin/audit" className="inline-flex items-center gap-1 text-sm font-semibold text-ngoc">Tất cả <ArrowRight className="size-4" /></Link>
          </div>
          <ul className="divide-y divide-vua text-sm">
            {logs.length === 0 && <li className="py-3 text-tro">Chưa có thao tác nào.</li>}
            {logs.map((l) => (
              <li key={l.id} className="flex justify-between gap-3 py-2.5">
                <span><strong>{l.actor?.name ?? "Hệ thống"}</strong> · {auditLabel(l.action)}</span>
                <span className="shrink-0 text-xs text-tro">{timeAgo(l.createdAt)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
