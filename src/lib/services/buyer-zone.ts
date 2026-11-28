import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { asImage, asImages, type MediaImage } from "@/lib/types";

/**
 * Dữ liệu cho "Tấm dệt" – khu riêng của khách hàng. Mỗi hàm trả về đúng một dải:
 * đơn sỉ, sổ truy xuất, các xưởng đã làm việc cùng.
 */

export { ORDER_LEGS, legIndex, quoteNextStep, type QuoteNextStep } from "@/lib/order-legs";
import { quoteNextStep } from "@/lib/order-legs";

/** Đơn sỉ của khách kèm việc cần làm tiếp (gộp truy vấn trong một lượt render nhờ cache). */
export const buyerQuotes = cache(async (userId: string) => {
  const rows = await prisma.quoteRequest.findMany({
    where: { buyerId: userId },
    orderBy: { updatedAt: "desc" },
    include: {
      bids: {
        where: { status: { not: "WITHDRAWN" } },
        select: { status: true, allocatedQuantity: true, offeredPricePerUnit: true, artisan: { select: { workshopName: true, slug: true } } },
      },
      allocatedBatches: { select: { status: true } },
    },
  });
  return rows.map((q) => {
    const accepted = q.bids.filter((b) => b.status === "ACCEPTED");
    const batchesOpen = q.allocatedBatches.filter((b) => b.status !== "COMPLETED").length;
    const total = accepted.reduce((s, b) => s + (b.allocatedQuantity ?? 0) * b.offeredPricePerUnit, 0);
    return {
      id: q.id,
      code: q.requestCode,
      title: q.title,
      organization: q.organizationName,
      category: q.category,
      glaze: q.preferredGlaze,
      quantity: q.quantity,
      budget: q.targetBudgetPerUnit,
      deadlineDays: q.deadlineDays,
      status: q.status,
      updatedAt: q.updatedAt,
      createdAt: q.createdAt,
      bids: q.bids.length,
      workshops: accepted.map((b) => b.artisan),
      total,
      batches: q.allocatedBatches.length,
      batchesOpen,
      next: quoteNextStep({ status: q.status, bids: q.bids.length, batchesOpen, batches: q.allocatedBatches.length }),
    };
  });
});

export type BuyerQuote = Awaited<ReturnType<typeof buyerQuotes>>[number];

/** Các lô khách đã quét tem (mới nhất trước), gộp nhiều lượt quét của cùng một lô. */
export async function tracedBatches(userId: string, take = 60) {
  const scans = await prisma.scanEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 400,
    select: { batchId: true, createdAt: true },
  });
  const order: string[] = [];
  const meta = new Map<string, { last: Date; first: Date; count: number }>();
  for (const s of scans) {
    const m = meta.get(s.batchId);
    if (m) {
      m.count++;
      m.first = s.createdAt;
    } else {
      order.push(s.batchId);
      meta.set(s.batchId, { last: s.createdAt, first: s.createdAt, count: 1 });
    }
  }
  const ids = order.slice(0, take);
  if (ids.length === 0) return [];
  const batches = await prisma.productBatch.findMany({
    where: { id: { in: ids } },
    select: {
      id: true, batchCode: true, batchTitle: true, glazeType: true, status: true, lockedAt: true, createdAt: true,
      productionStages: true, coverImage: true, peakTempC: true, quantityProduced: true,
      artisan: { select: { workshopName: true, slug: true, clanName: true, verificationStatus: true } },
      products: { where: { isPublished: true }, select: { slug: true, name: true, images: true }, take: 1 },
    },
  });
  const byId = new Map(batches.map((b) => [b.id, b]));
  return ids.flatMap((id) => {
    const b = byId.get(id);
    if (!b) return [];
    const m = meta.get(id)!;
    const stages = Array.isArray(b.productionStages) ? (b.productionStages as unknown[]).length : 0;
    const product = b.products[0];
    const image: MediaImage | null = asImages(product?.images)[0] ?? asImage(b.coverImage);
    return [{
      code: b.batchCode,
      title: b.batchTitle,
      glaze: b.glazeType,
      locked: b.status === "COMPLETED",
      lockedAt: b.lockedAt,
      startedAt: b.createdAt,
      stages,
      peakTempC: b.peakTempC,
      quantity: b.quantityProduced,
      artisan: b.artisan,
      product: product ? { slug: product.slug, name: product.name } : null,
      image,
      lastScan: m.last,
      firstScan: m.first,
      scans: m.count,
    }];
  });
}

export type TracedBatch = Awaited<ReturnType<typeof tracedBatches>>[number];

/**
 * Các xưởng khách đã thật sự làm việc cùng (mỗi xưởng một huy hiệu dệt) –
 * đã ghé (buổi trải nghiệm hoàn tất), đã đặt (chào giá được chốt) hoặc đã đánh giá.
 */
export async function workedWorkshops(userId: string) {
  const [visits, orders, reviews] = await Promise.all([
    prisma.experienceBooking.findMany({
      where: { userId, status: "COMPLETED" },
      select: { visitDate: true, artisanId: true },
    }),
    prisma.quoteBid.findMany({
      where: { status: "ACCEPTED", quoteRequest: { buyerId: userId } },
      select: { artisanId: true, updatedAt: true },
    }),
    prisma.review.findMany({ where: { authorId: userId }, select: { artisanId: true, createdAt: true, rating: true } }),
  ]);
  const map = new Map<string, { visited: boolean; ordered: boolean; rating: number | null; since: Date }>();
  const touch = (id: string, at: Date) => {
    const cur = map.get(id) ?? { visited: false, ordered: false, rating: null, since: at };
    if (at < cur.since) cur.since = at;
    map.set(id, cur);
    return cur;
  };
  for (const v of visits) touch(v.artisanId, v.visitDate).visited = true;
  for (const o of orders) touch(o.artisanId, o.updatedAt).ordered = true;
  for (const r of reviews) touch(r.artisanId, r.createdAt).rating = r.rating;
  if (map.size === 0) return [];
  const artisans = await prisma.artisanProfile.findMany({
    where: { id: { in: [...map.keys()] } },
    select: { id: true, slug: true, workshopName: true, clanName: true, artisanName: true, establishedYear: true },
  });
  return artisans
    .map((a) => ({ ...a, ...map.get(a.id)! }))
    .sort((a, b) => a.since.getTime() - b.since.getTime());
}

export type WorkedWorkshop = Awaited<ReturnType<typeof workedWorkshops>>[number];


/** Lịch sắp tới (chờ xác nhận / đã xác nhận) từ hôm nay theo giờ Việt Nam. */
export function todayStartVn() {
  return new Date(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date()) + "T00:00:00Z");
}
