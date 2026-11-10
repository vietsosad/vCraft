import "server-only";
import { randomUUID } from "node:crypto";
import type { GlazeType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ConflictError, NotFoundError, BadRequestError } from "@/lib/errors";
import { asStages, type ProductionStage } from "@/lib/types";
import { REQUIRED_STAGE_KEYS } from "@/lib/constants";
import type { BatchCreateInput, StageInput } from "@/lib/validators/batch";
import { nextBatchCode } from "./codes";
import { qrDataUrl } from "./qr";
import { autoStartProductionFromBatch } from "./quotation-service";
import { notify } from "./notification-service";

/** Lấy lô thuộc xưởng của người gọi – chống IDOR (sửa lô của xưởng khác). */
async function getOwnBatch(artisanId: string, code: string) {
  const batch = await prisma.productBatch.findUnique({ where: { batchCode: code } });
  if (!batch || batch.artisanId !== artisanId) throw new NotFoundError("Không tìm thấy lô sản xuất của xưởng bạn.");
  return batch;
}

export async function createBatch(artisanId: string, input: BatchCreateInput) {
  return prisma.$transaction(async (tx) => {
    const batchCode = await nextBatchCode(tx, input.glazeType);
    return tx.productBatch.create({
      data: {
        ...input,
        glazeType: input.glazeType as GlazeType,
        batchCode,
        artisanId,
        qrCodeDataUrl: await qrDataUrl(batchCode),
        productionStages: [],
      },
    });
  });
}

function sortStages(stages: ProductionStage[]) {
  return [...stages].sort((a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt));
}

/**
 * Thêm một mốc vào nhật ký. Lô đã hoàn tất thì nhật ký bị khóa:
 * chỉ còn được thêm "ghi chú bổ sung" (isAddendum), không sửa được lịch sử.
 * Cập nhật có điều kiện theo updatedAt để hai thiết bị cùng ghi không đè mất mốc của nhau.
 */
export async function addStage(artisanId: string, actorId: string, code: string, input: StageInput) {
  const batch = await getOwnBatch(artisanId, code);
  const stages = asStages(batch.productionStages);
  const isAddendum = batch.status === "COMPLETED";

  const stage: ProductionStage = {
    id: randomUUID(),
    key: input.key,
    title: isAddendum ? `Ghi chú bổ sung: ${input.title}` : input.title,
    description: input.description,
    occurredAt: new Date(input.occurredAt).toISOString(),
    temperatureC: input.temperatureC ?? null,
    images: input.images,
    isAddendum,
    recordedAt: new Date().toISOString(),
  };

  const updated = await prisma.productBatch.updateMany({
    where: { id: batch.id, updatedAt: batch.updatedAt },
    data: { productionStages: sortStages([...stages, stage]) },
  });
  if (updated.count === 0) {
    throw new ConflictError("BATCH_CHANGED", "Nhật ký vừa được cập nhật trên thiết bị khác. Vui lòng tải lại rồi thử lại.");
  }

  if (batch.quoteRequestId && !isAddendum) {
    await autoStartProductionFromBatch(batch.quoteRequestId, actorId);
    const quote = await prisma.quoteRequest.findUnique({ where: { id: batch.quoteRequestId }, select: { buyerId: true, requestCode: true } });
    if (quote) {
      await notify(quote.buyerId, {
        type: "BATCH_PROGRESS",
        title: "Đơn hàng có cập nhật sản xuất mới",
        body: `${batch.batchCode}: ${stage.title}`,
        link: `/trace/${batch.batchCode}`,
      });
    }
  }
  return stage;
}

/** Xóa mốc – chỉ khi lô chưa khóa. */
export async function removeStage(artisanId: string, code: string, stageId: string) {
  const batch = await getOwnBatch(artisanId, code);
  if (batch.lockedAt) throw new ConflictError("BATCH_LOCKED", "Nhật ký đã khóa, không thể xóa mốc. Bạn chỉ có thể thêm ghi chú bổ sung.");
  const stages = asStages(batch.productionStages);
  if (!stages.some((s) => s.id === stageId)) throw new NotFoundError("Không tìm thấy mốc.");
  const updated = await prisma.productBatch.updateMany({
    where: { id: batch.id, updatedAt: batch.updatedAt, lockedAt: null },
    data: { productionStages: stages.filter((s) => s.id !== stageId) },
  });
  if (updated.count === 0) throw new ConflictError("BATCH_CHANGED", "Nhật ký vừa thay đổi. Vui lòng tải lại.");
}

/** Hoàn tất lô: cần mốc "Nung hoàn thiện" và "Ra lò, kiểm định"; sau đó khóa nhật ký. */
export async function completeBatch(artisanId: string, code: string) {
  const batch = await getOwnBatch(artisanId, code);
  if (batch.status === "COMPLETED") throw new ConflictError("BATCH_LOCKED", "Lô đã hoàn tất từ trước.");
  const keys = new Set(asStages(batch.productionStages).map((s) => s.key));
  const missing = REQUIRED_STAGE_KEYS.filter((k) => !keys.has(k));
  if (missing.length) {
    throw new BadRequestError(
      "Cần ghi đủ mốc “Nung hoàn thiện” và “Ra lò, kiểm định” trước khi hoàn tất lô.",
      { missing },
      "STAGES_INCOMPLETE",
    );
  }
  const updated = await prisma.productBatch.updateMany({
    where: { id: batch.id, status: "IN_PROGRESS" },
    data: { status: "COMPLETED", lockedAt: new Date() },
  });
  if (updated.count === 0) throw new ConflictError("BATCH_LOCKED", "Lô đã được hoàn tất ở nơi khác.");
}

/** Dữ liệu trang truy xuất công khai. */
export async function getTrace(code: string) {
  return prisma.productBatch.findUnique({
    where: { batchCode: code },
    include: {
      artisan: {
        select: {
          slug: true, workshopName: true, artisanName: true, artisanTitle: true, clanName: true,
          generation: true, establishedYear: true, verificationStatus: true, coverImage: true, address: true,
          latitude: true, longitude: true,
        },
      },
      products: { where: { isPublished: true }, select: { slug: true, name: true, images: true, priceVnd: true } },
      quoteRequest: { select: { organizationName: true, requestCode: true } },
    },
  });
}

/** Ghi nhận một lượt quét QR (tăng nguyên tử). */
export async function recordScan(code: string) {
  const batch = await prisma.productBatch.findUnique({ where: { batchCode: code }, select: { id: true } });
  if (!batch) return false;
  // Tăng bộ đếm tổng và ghi một lượt quét có thời điểm (để vẽ biểu đồ theo ngày)
  await prisma.$transaction([
    prisma.productBatch.update({ where: { id: batch.id }, data: { scanCount: { increment: 1 } } }),
    prisma.scanEvent.create({ data: { batchId: batch.id } }),
  ]);
  return true;
}
