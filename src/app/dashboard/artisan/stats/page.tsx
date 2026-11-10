import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { pageRequireRole } from "@/lib/auth/guards";
import { artisanStats } from "@/lib/services/stats-service";
import { formatNumber } from "@/lib/format";
import { Card, PageHeader, Stat } from "@/components/ui/primitives";
import { CountUp } from "@/components/motion/count-up";
import { BarList, DailyColumns } from "@/components/charts/charts";

export const metadata: Metadata = { title: "Thống kê xưởng" };
export const dynamic = "force-dynamic";

export default async function ArtisanStats() {
  const user = await pageRequireRole("/dashboard/artisan/stats", "ARTISAN");
  const s = await artisanStats(user.artisanId!);
  const exportLink = (kind: string, label: string) => (
    <a href={`/api/me/reports/${kind}`} download className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-tile)] border border-muc/20 bg-su/60 px-3 text-sm font-semibold hover:border-muc/45">
      <Download className="size-4" aria-hidden /> {label}
    </a>
  );

  return (
    <>
      <PageHeader
        title="Thống kê xưởng"
        description="Khách quét QR bao nhiêu, chào giá trúng bao nhiêu, lớp nặn gốm đón bao nhiêu khách."
        actions={<>{exportLink("batches", "Lô (CSV)")}{exportLink("bids", "Chào giá (CSV)")}{exportLink("bookings", "Lịch hẹn (CSV)")}</>}
      />
      <div className="mosaic grid-cols-2 lg:grid-cols-4">
        <Stat tone="dat" label="Lượt quét QR 30 ngày" value={<CountUp value={s.scans30} />} hint={`${formatNumber(s.scansTotal)} lượt từ trước tới nay`} />
        <Stat label="Tỉ lệ trúng chào giá" value={s.bids.winRate === null ? "—" : <CountUp value={s.bids.winRate} format="percent" />} hint={`${s.bids.accepted}/${s.bids.total} chào giá được chọn`} />
        <Stat label="Doanh thu đơn sỉ" value={<span className="text-[2rem]"><CountUp value={s.wholesaleRevenue} format="vnd" /></span>} hint="Theo số lượng được phân bổ" />
        <Stat label="Khách đã đón" value={<CountUp value={s.bookings.guestsServed} />} hint={`${s.bookings.completed} buổi trải nghiệm`} />
      </div>

      <Card className="mt-6 p-6">
        <h2 className="font-serif text-2xl font-bold normal-case">Lượt quét QR mỗi ngày</h2>
        <p className="mb-4 text-sm text-tro">Tất cả các lô của xưởng, 30 ngày gần nhất.</p>
        <DailyColumns data={s.scans} label="Lượt quét QR của xưởng mỗi ngày" unit="lượt quét" color="var(--chart-2)" />
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-5 font-serif text-2xl font-bold normal-case">Lô được quét nhiều nhất</h2>
          <BarList label="Lượt quét theo lô" color="var(--chart-2)" items={s.topBatches.map((b) => ({ label: b.batchCode, value: b.scanCount }))} />
          <p className="mt-4 text-xs text-tro">
            Mở <Link href="/dashboard/artisan/batches" className="underline">Lô & nhật ký</Link> để in thêm tem QR cho lô bán chạy.
          </p>
        </Card>
        <Card className="p-6">
          <h2 className="mb-5 font-serif text-2xl font-bold normal-case">Lịch trải nghiệm</h2>
          <BarList
            label="Lịch trải nghiệm theo trạng thái"
            color="var(--chart-1)"
            items={[
              { label: "Chờ xác nhận", value: s.bookings.pending },
              { label: "Đã xác nhận", value: s.bookings.confirmed },
              { label: "Đã diễn ra", value: s.bookings.completed },
              { label: "Từ chối / hủy", value: s.bookings.declined },
            ]}
          />
          <p className="mt-4 text-sm text-tro">
            Điểm đánh giá: <strong className="text-muc">{s.rating.count ? `${s.rating.avg.toFixed(1)}/5` : "chưa có"}</strong> ({s.rating.count} lượt) ·{" "}
            {s.favorites} lượt khách lưu xưởng hoặc tác phẩm
          </p>
        </Card>
      </div>
    </>
  );
}
