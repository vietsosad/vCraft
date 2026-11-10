import { withApi } from "@/lib/http";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { QUOTE_STATUS, GLAZES } from "@/lib/constants";
import { audit } from "@/lib/services/audit";
import { csvResponse, toCsv } from "@/lib/services/stats-service";

const today = () => new Date().toISOString().slice(0, 10);

/** GET /api/admin/reports/:kind – xuất CSV cho Ban quản lý (mở được bằng Excel, giữ dấu tiếng Việt). */
export const GET = withApi<{ params: Promise<{ kind: string }> }>(async (_req, { params }) => {
  const admin = await requireRole("ADMIN");
  const { kind } = await params;
  let csv: string;
  switch (kind) {
    case "quotes": {
      const rows = await prisma.quoteRequest.findMany({
        orderBy: { createdAt: "desc" },
        include: { buyer: { select: { name: true, email: true } }, bids: { select: { status: true, offeredPricePerUnit: true, allocatedQuantity: true } } },
      });
      csv = toCsv(
        ["Mã", "Tiêu đề", "Đơn vị", "Người tạo", "Email", "Dòng men", "Số lượng", "Ngân sách/sp", "Trạng thái", "Số chào giá", "Giá trị đã chốt (VND)", "Ngày tạo"],
        rows.map((q) => [
          q.requestCode, q.title, q.organizationName, q.buyer.name, q.buyer.email, GLAZES[q.preferredGlaze].label, q.quantity, q.targetBudgetPerUnit,
          QUOTE_STATUS[q.status].label, q.bids.length,
          q.bids.filter((b) => b.status === "ACCEPTED").reduce((s, b) => s + b.offeredPricePerUnit * (b.allocatedQuantity ?? 0), 0),
          q.createdAt,
        ]),
      );
      break;
    }
    case "workshops": {
      const rows = await prisma.artisanProfile.findMany({
        orderBy: { workshopName: "asc" },
        include: { user: { select: { email: true, status: true } }, _count: { select: { products: true, batches: true, bookings: true } } },
      });
      csv = toCsv(
        ["Xưởng", "Nghệ nhân", "Email", "Trạng thái duyệt", "Tài khoản", "Năm thành lập", "Đời", "Công suất/tháng", "Nhận sỉ", "Trải nghiệm", "Điểm đánh giá", "Lượt đánh giá", "Sản phẩm", "Lô", "Lịch trải nghiệm"],
        rows.map((a) => [
          a.workshopName, a.artisanName, a.user.email, a.verificationStatus, a.user.status, a.establishedYear, a.generation, a.maxMonthlyCapacity,
          a.acceptsWholesale ? "Có" : "Không", a.experienceOffered ? "Có" : "Không", a.ratingAvg, a.ratingCount, a._count.products, a._count.batches, a._count.bookings,
        ]),
      );
      break;
    }
    case "batches": {
      const rows = await prisma.productBatch.findMany({ orderBy: { createdAt: "desc" }, include: { artisan: { select: { workshopName: true } }, quoteRequest: { select: { requestCode: true } } } });
      csv = toCsv(
        ["Mã lô", "Tên lô", "Xưởng", "Dòng men", "Số lượng", "Trạng thái", "Lượt quét", "Đơn sỉ", "Ngày tạo", "Ngày khóa"],
        rows.map((b) => [b.batchCode, b.batchTitle, b.artisan.workshopName, GLAZES[b.glazeType].label, b.quantityProduced, b.status, b.scanCount, b.quoteRequest?.requestCode ?? "", b.createdAt, b.lockedAt]),
      );
      break;
    }
    case "bookings": {
      const rows = await prisma.experienceBooking.findMany({ orderBy: { visitDate: "desc" }, include: { artisan: { select: { workshopName: true } } } });
      csv = toCsv(
        ["Mã", "Xưởng", "Ngày", "Giờ", "Số khách", "Người liên hệ", "Điện thoại", "Thành tiền (VND)", "Trạng thái"],
        rows.map((b) => [b.code, b.artisan.workshopName, b.visitDate.toISOString().slice(0, 10), b.slot, b.guests, b.contactName, b.contactPhone, b.totalVnd, b.status]),
      );
      break;
    }
    case "audit": {
      const rows = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 5000, include: { actor: { select: { email: true } } } });
      csv = toCsv(["Thời điểm", "Người thực hiện", "Hành động", "Đối tượng", "Mã đối tượng", "Chi tiết"], rows.map((r) => [r.createdAt, r.actor?.email ?? "Hệ thống", r.action, r.entity, r.entityId, JSON.stringify(r.meta)]));
      break;
    }
    default:
      throw new NotFoundError("Không có loại báo cáo này.");
  }
  await audit(admin.id, "report.exported", "Report", kind);
  return csvResponse(`vcraft-${kind}-${today()}.csv`, csv);
});
