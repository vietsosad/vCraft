import type { Metadata } from "next";
import { FileSpreadsheet, Download } from "lucide-react";
import { prisma } from "@/lib/db";
import { villageStats } from "@/lib/services/stats-service";
import { Card, PageHeader } from "@/components/ui/primitives";
import { BarList } from "@/components/charts/charts";

export const metadata: Metadata = { title: "Báo cáo & xuất CSV" };
export const dynamic = "force-dynamic";

const BOOKING_LABEL: Record<string, string> = { PENDING: "Chờ xác nhận", CONFIRMED: "Đã xác nhận", COMPLETED: "Đã diễn ra", DECLINED: "Xưởng từ chối", CANCELLED: "Khách hủy" };

export default async function ReportsPage() {
  const [v, counts] = await Promise.all([
    villageStats(),
    Promise.all([
      prisma.quoteRequest.count(),
      prisma.artisanProfile.count(),
      prisma.productBatch.count(),
      prisma.experienceBooking.count(),
      prisma.auditLog.count(),
    ]),
  ]);
  const REPORTS = [
    { kind: "quotes", title: "Yêu cầu báo giá", desc: "Mã, người đặt, dòng men, số lượng, trạng thái, giá trị đã chốt.", n: counts[0] },
    { kind: "workshops", title: "Hộ nghề", desc: "Trạng thái duyệt, công suất, điểm đánh giá, số sản phẩm và lô.", n: counts[1] },
    { kind: "batches", title: "Lô sản xuất", desc: "Mã lô, xưởng, dòng men, lượt quét QR, đơn sỉ gắn kèm.", n: counts[2] },
    { kind: "bookings", title: "Lịch trải nghiệm", desc: "Ngày, khung giờ, số khách, doanh thu dự kiến, trạng thái.", n: counts[3] },
    { kind: "audit", title: "Nhật ký thao tác", desc: "Ai làm gì, lúc nào (5.000 dòng gần nhất).", n: counts[4] },
  ];

  return (
    <>
      <PageHeader title="Báo cáo & xuất CSV" description="Tệp CSV mã hóa UTF-8 có BOM, mở thẳng bằng Excel mà vẫn giữ đúng dấu tiếng Việt. Mỗi lần xuất được ghi vào nhật ký." />
      <div className="mosaic grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((r, i) => (
          <a
            key={r.kind}
            href={`/api/admin/reports/${r.kind}`}
            download
            data-reveal
            style={{ ["--d" as string]: `${i * 60}ms` }}
            className="tile glaze group flex flex-col gap-3 bg-su p-5"
          >
            <span className="tile tile-ngoc grid size-11 place-items-center text-giay"><FileSpreadsheet className="size-5" aria-hidden /></span>
            <span>
              <span className="block font-serif text-xl font-bold">{r.title}</span>
              <span className="mt-1 block text-sm text-tro">{r.desc}</span>
            </span>
            <span className="mt-auto flex items-center justify-between text-sm">
              <span className="text-tro">{r.n} dòng</span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-ngoc transition group-hover:translate-x-0.5"><Download className="size-4" aria-hidden /> Tải CSV</span>
            </span>
          </a>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-5 font-serif text-2xl font-bold normal-case">Lịch trải nghiệm theo trạng thái</h2>
          <BarList label="Số lịch trải nghiệm theo trạng thái" color="var(--chart-4)" items={Object.keys(BOOKING_LABEL).map((k) => ({ label: BOOKING_LABEL[k], value: v.bookings[k] ?? 0 }))} />
        </Card>
        <Card className="p-6">
          <h2 className="mb-5 font-serif text-2xl font-bold normal-case">Hộ nghề theo trạng thái duyệt</h2>
          <BarList
            label="Số hộ nghề theo trạng thái duyệt"
            color="var(--chart-3)"
            items={[
              { label: "Đã xác thực", value: v.workshops.APPROVED ?? 0 },
              { label: "Chờ duyệt", value: v.workshops.PENDING ?? 0 },
              { label: "Cần bổ sung", value: v.workshops.REJECTED ?? 0 },
            ]}
          />
        </Card>
      </div>
    </>
  );
}
