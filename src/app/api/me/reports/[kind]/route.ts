import { withApi } from "@/lib/http";
import { requireArtisan } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { GLAZES } from "@/lib/constants";
import { csvResponse, toCsv } from "@/lib/services/stats-service";

/** GET /api/me/reports/:kind – nghệ nhân xuất CSV dữ liệu của chính xưởng mình. */
export const GET = withApi<{ params: Promise<{ kind: string }> }>(async (_req, { params }) => {
  const user = await requireArtisan();
  const { kind } = await params;
  const day = new Date().toISOString().slice(0, 10);
  if (kind === "batches") {
    const rows = await prisma.productBatch.findMany({ where: { artisanId: user.artisanId }, orderBy: { createdAt: "desc" } });
    return csvResponse(`lo-san-xuat-${day}.csv`, toCsv(["Mã lô", "Tên lô", "Dòng men", "Số lượng", "Trạng thái", "Lượt quét", "Ngày tạo"], rows.map((b) => [b.batchCode, b.batchTitle, GLAZES[b.glazeType].label, b.quantityProduced, b.status, b.scanCount, b.createdAt])));
  }
  if (kind === "bookings") {
    const rows = await prisma.experienceBooking.findMany({ where: { artisanId: user.artisanId }, orderBy: { visitDate: "desc" } });
    return csvResponse(`lich-trai-nghiem-${day}.csv`, toCsv(["Mã", "Ngày", "Giờ", "Số khách", "Người liên hệ", "Điện thoại", "Ghi chú", "Thành tiền (VND)", "Trạng thái"], rows.map((b) => [b.code, b.visitDate.toISOString().slice(0, 10), b.slot, b.guests, b.contactName, b.contactPhone, b.note ?? "", b.totalVnd, b.status])));
  }
  if (kind === "bids") {
    const rows = await prisma.quoteBid.findMany({ where: { artisanId: user.artisanId }, orderBy: { createdAt: "desc" }, include: { quoteRequest: { select: { requestCode: true, title: true } } } });
    return csvResponse(`chao-gia-${day}.csv`, toCsv(["Mã yêu cầu", "Yêu cầu", "Đơn giá", "Nhận làm", "Được phân bổ", "Số ngày", "Trạng thái", "Ngày chào"], rows.map((b) => [b.quoteRequest.requestCode, b.quoteRequest.title, b.offeredPricePerUnit, b.committedQuantity, b.allocatedQuantity ?? "", b.estimatedDays, b.status, b.createdAt])));
  }
  throw new NotFoundError("Không có loại báo cáo này.");
});
