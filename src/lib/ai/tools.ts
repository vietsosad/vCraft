import "server-only";
import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import type { GlazeType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { GLAZES, GLAZE_KEYS, CATEGORIES, CATEGORY_SLUGS, NEWS_CATEGORIES, QUOTE_STATUS, categoryLabel } from "@/lib/constants";
import { listWorkshops, buildProductWhere } from "@/lib/services/catalog-service";
import { suggestAllocation } from "@/lib/services/allocation";
import { asStages } from "@/lib/types";
import type { SessionUser } from "@/lib/auth/session";

/**
 * 5 công cụ của trợ lý "Sứ giả Tinh hoa Bát Tràng". Mỗi công cụ có schema Zod để kiểm tra
 * đầu vào do mô hình sinh ra, rồi truy vấn dữ liệu sống qua Prisma.
 */
export type Card = { title: string; subtitle: string; href: string };
export type ToolOutput = { data: unknown; cards: Card[] };
type Ctx = { user: SessionUser | null };

const glaze = z.enum(GLAZE_KEYS as [string, ...string[]]);

export const toolSchemas = {
  queryWorkshopsAndMap: z.object({
    onlyOpenForVisit: z.boolean().optional(),
    glazeSpecialty: glaze.optional(),
    keyword: z.string().max(60).optional(),
  }),
  verifyBatchByCode: z.object({
    batchCode: z.string().max(40).optional(),
    productKeyword: z.string().max(60).optional(),
  }),
  searchExhibitionCatalog: z.object({
    category: z.enum(CATEGORY_SLUGS).optional(),
    glazeType: glaze.optional(),
    maxPriceVnd: z.number().int().positive().optional(),
    keyword: z.string().max(60).optional(),
  }),
  inspectB2BQuotesAndCapacity: z.object({
    requestCode: z.string().max(40).optional(),
    requiredQuantity: z.number().int().positive().optional(),
    deadlineDays: z.number().int().positive().optional(),
  }),
  getCommunityAnnouncements: z.object({
    category: z.enum(["NGUYEN_LIEU", "LICH_CUP_DIEN", "CHINH_SACH", "SU_KIEN"]).optional(),
    limit: z.number().int().min(1).max(10).optional(),
  }),
};
export type ToolName = keyof typeof toolSchemas;

export const TOOL_LABEL: Record<ToolName, string> = {
  queryWorkshopsAndMap: "Tra cứu xưởng trên bản đồ",
  verifyBatchByCode: "Xác minh nguồn gốc lô",
  searchExhibitionCatalog: "Tìm trong triển lãm",
  inspectB2BQuotesAndCapacity: "Kiểm tra đơn sỉ và công suất",
  getCommunityAnnouncements: "Đọc bản tin BQL",
};

const glazeList = GLAZE_KEYS.map((g) => `${g} (${GLAZES[g].label})`).join(", ");

/** Định nghĩa công cụ gửi cho Claude (JSON Schema). */
export const anthropicTools: Anthropic.Beta.BetaTool[] = [
  {
    name: "queryWorkshopsAndMap",
    description:
      "Tìm xưởng gốm đã được Ban quản lý xác thực, kèm tọa độ, giờ mở cửa, trạng thái đang mở cửa (tính theo giờ Việt Nam), giá trải nghiệm và dòng men sở trường. Dùng khi hỏi xưởng nào đang mở, nên ghé đâu, ở tọa độ nào.",
    input_schema: {
      type: "object",
      properties: {
        onlyOpenForVisit: { type: "boolean", description: "Chỉ lấy xưởng đang mở cửa đón khách ngay lúc này" },
        glazeSpecialty: { type: "string", enum: GLAZE_KEYS, description: `Dòng men sở trường: ${glazeList}` },
        keyword: { type: "string", description: "Từ khóa tên xưởng hoặc nghệ nhân" },
      },
    },
    eager_input_streaming: true,
  },
  {
    name: "verifyBatchByCode",
    description:
      "Xác minh nguồn gốc một lô sản phẩm theo mã lô (ví dụ BT-2026-RAN-001) hoặc từ khóa sản phẩm: trả về nhật ký các công đoạn, nhiệt độ nung, nguồn đất và trạng thái khóa nhật ký.",
    input_schema: {
      type: "object",
      properties: {
        batchCode: { type: "string", description: "Mã lô, dạng BT-YYYY-XXX-NNN" },
        productKeyword: { type: "string", description: "Tên sản phẩm nếu không biết mã lô" },
      },
    },
    eager_input_streaming: true,
  },
  {
    name: "searchExhibitionCatalog",
    description: "Tìm tác phẩm trong triển lãm theo phân loại, dòng men, giá tối đa hoặc từ khóa. Dùng để gợi ý sản phẩm, so sánh dòng men.",
    input_schema: {
      type: "object",
      properties: {
        category: { type: "string", enum: CATEGORIES.map((c) => c.slug), description: CATEGORIES.map((c) => `${c.slug}: ${c.label}`).join("; ") },
        glazeType: { type: "string", enum: GLAZE_KEYS },
        maxPriceVnd: { type: "integer", description: "Giá tối đa (VNĐ)" },
        keyword: { type: "string" },
      },
    },
    eager_input_streaming: true,
  },
  {
    name: "inspectB2BQuotesAndCapacity",
    description:
      "Kiểm tra trạng thái yêu cầu báo giá sỉ (ví dụ RFQ-UET-2026-5000), các xưởng đang chào giá và tính phương án ghép công suất nhiều xưởng. Giá chào chỉ hiển thị cho người tạo yêu cầu và Ban quản lý.",
    input_schema: {
      type: "object",
      properties: {
        requestCode: { type: "string", description: "Mã yêu cầu báo giá" },
        requiredQuantity: { type: "integer", description: "Số lượng cần nếu muốn ước tính công suất làng" },
        deadlineDays: { type: "integer", description: "Thời hạn (ngày)" },
      },
    },
    eager_input_streaming: true,
  },
  {
    name: "getCommunityAnnouncements",
    description: "Đọc bản tin mới nhất của Ban quản lý: giá nguyên vật liệu, lịch cúp điện, chính sách hỗ trợ, sự kiện.",
    input_schema: {
      type: "object",
      properties: {
        category: { type: "string", enum: Object.keys(NEWS_CATEGORIES) },
        limit: { type: "integer", minimum: 1, maximum: 10 },
      },
    },
    eager_input_streaming: true,
  },
];

/* ------------------------------------------------------------------ Thực thi */

async function queryWorkshopsAndMap(input: z.infer<typeof toolSchemas.queryWorkshopsAndMap>): Promise<ToolOutput> {
  let rows = await listWorkshops({ openNow: input.onlyOpenForVisit, glaze: input.glazeSpecialty });
  if (input.keyword) {
    const k = input.keyword.toLowerCase();
    rows = rows.filter((w) => `${w.workshopName} ${w.artisanName}`.toLowerCase().includes(k));
  }
  const data = rows.map((w) => ({
    workshop: w.workshopName,
    artisan: `${w.artisanTitle} ${w.artisanName}`,
    status: w.openState.label,
    isOpenNow: w.openState.isOpenNow,
    hours: w.openingHours,
    experience: w.experienceOffered ? `${w.experiencePriceVnd.toLocaleString("vi-VN")} ₫/người` : "Không có",
    specialties: w.specialties.map((s) => GLAZES[s].label),
    latitude: w.latitude,
    longitude: w.longitude,
    address: w.address,
    monthlyCapacity: w.maxMonthlyCapacity,
  }));
  return {
    data,
    cards: rows.slice(0, 4).map((w) => ({
      title: w.workshopName,
      subtitle: `${w.openState.label} · ${w.latitude.toFixed(4)}, ${w.longitude.toFixed(4)}`,
      href: `/map?focus=${w.slug}`,
    })),
  };
}

async function verifyBatchByCode(input: z.infer<typeof toolSchemas.verifyBatchByCode>): Promise<ToolOutput> {
  const batch = input.batchCode
    ? await prisma.productBatch.findUnique({ where: { batchCode: input.batchCode.toUpperCase() }, include: { artisan: true } })
    : input.productKeyword
      ? (
          await prisma.product.findFirst({
            where: { ...buildProductWhere({ q: input.productKeyword }), currentBatchId: { not: null } },
            include: { currentBatch: { include: { artisan: true } } },
          })
        )?.currentBatch ?? null
      : null;
  if (!batch) return { data: { found: false, message: "Không tìm thấy lô phù hợp." }, cards: [] };
  const stages = asStages(batch.productionStages);
  return {
    data: {
      found: true,
      batchCode: batch.batchCode,
      title: batch.batchTitle,
      workshop: batch.artisan.workshopName,
      verifiedWorkshop: batch.artisan.verificationStatus === "APPROVED",
      status: batch.status === "COMPLETED" ? "Đã hoàn tất, nhật ký đã khóa" : "Đang sản xuất",
      clayOrigin: batch.clayOrigin,
      kiln: batch.kilnType,
      peakTempC: batch.peakTempC,
      quantity: batch.quantityProduced,
      scanCount: batch.scanCount,
      stages: stages.map((s) => ({ date: s.occurredAt.slice(0, 10), title: s.title, temperatureC: s.temperatureC ?? undefined })),
    },
    cards: [{ title: `Truy xuất ${batch.batchCode}`, subtitle: batch.batchTitle, href: `/trace/${batch.batchCode}` }],
  };
}

async function searchExhibitionCatalog(input: z.infer<typeof toolSchemas.searchExhibitionCatalog>): Promise<ToolOutput> {
  const rows = await prisma.product.findMany({
    where: buildProductWhere({ q: input.keyword, category: input.category, glaze: input.glazeType, maxPrice: input.maxPriceVnd }),
    take: 6,
    orderBy: { createdAt: "desc" },
    include: { artisan: { select: { workshopName: true } }, currentBatch: { select: { batchCode: true } } },
  });
  return {
    data: {
      glazeGuide: input.glazeType ? GLAZES[input.glazeType as GlazeType] : undefined,
      products: rows.map((p) => ({
        name: p.name,
        workshop: p.artisan.workshopName,
        glaze: GLAZES[p.glazeType].label,
        category: categoryLabel(p.category),
        priceVnd: p.priceVnd,
        uniquePiece: p.isUniquePiece,
        batchCode: p.currentBatch?.batchCode,
      })),
    },
    cards: rows.slice(0, 4).map((p) => ({
      title: p.name,
      subtitle: `${p.artisan.workshopName} · ${p.priceVnd.toLocaleString("vi-VN")} ₫`,
      href: `/products/${p.slug}`,
    })),
  };
}

async function inspectB2BQuotesAndCapacity(input: z.infer<typeof toolSchemas.inspectB2BQuotesAndCapacity>, ctx: Ctx): Promise<ToolOutput> {
  const capacity = await prisma.artisanProfile.aggregate({
    where: { verificationStatus: "APPROVED", acceptsWholesale: true },
    _sum: { maxMonthlyCapacity: true },
    _count: true,
  });
  const villageCapacity = {
    workshopsAcceptingWholesale: capacity._count,
    totalMonthlyCapacity: capacity._sum.maxMonthlyCapacity ?? 0,
    canFulfil:
      input.requiredQuantity && input.deadlineDays
        ? (capacity._sum.maxMonthlyCapacity ?? 0) * (input.deadlineDays / 30) >= input.requiredQuantity
        : undefined,
  };
  if (!input.requestCode) return { data: { villageCapacity }, cards: [] };

  const quote = await prisma.quoteRequest.findUnique({
    where: { requestCode: input.requestCode.toUpperCase() },
    include: { bids: { where: { status: { not: "WITHDRAWN" } }, include: { artisan: { select: { workshopName: true, ratingAvg: true } } } } },
  });
  if (!quote) return { data: { found: false, villageCapacity }, cards: [] };

  // Đấu giá kín: chỉ người tạo yêu cầu và BQL xem được giá chào
  const canSeePrices = !!ctx.user && (ctx.user.role === "ADMIN" || ctx.user.id === quote.buyerId);
  const pending = quote.bids.filter((b) => b.status === "PENDING");
  const suggestion = canSeePrices
    ? suggestAllocation(quote.quantity, quote.deadlineDays, pending.map((b) => ({
        bidId: b.id,
        workshopName: b.artisan.workshopName,
        offeredPricePerUnit: b.offeredPricePerUnit,
        committedQuantity: b.committedQuantity,
        estimatedDays: b.estimatedDays,
        ratingAvg: b.artisan.ratingAvg,
      })))
    : undefined;

  return {
    data: {
      found: true,
      requestCode: quote.requestCode,
      title: quote.title,
      organization: quote.organizationName,
      quantity: quote.quantity,
      status: QUOTE_STATUS[quote.status].label,
      version: quote.version,
      biddingWorkshops: quote.bids.map((b) => ({
        workshop: b.artisan.workshopName,
        committedQuantity: b.committedQuantity,
        estimatedDays: b.estimatedDays,
        status: b.status,
        ...(canSeePrices ? { pricePerUnit: b.offeredPricePerUnit } : {}),
      })),
      pricesHidden: !canSeePrices,
      allocationSuggestion: suggestion,
      villageCapacity,
    },
    cards: [{ title: quote.requestCode, subtitle: `${QUOTE_STATUS[quote.status].label} · ${quote.bids.length} chào giá`, href: `/b2b-quotes/${quote.requestCode}` }],
  };
}

async function getCommunityAnnouncements(input: z.infer<typeof toolSchemas.getCommunityAnnouncements>): Promise<ToolOutput> {
  const rows = await prisma.communityNews.findMany({
    where: { isPublished: true, ...(input.category ? { category: input.category } : {}) },
    orderBy: [{ isUrgent: "desc" }, { publishedAt: "desc" }],
    take: input.limit ?? 4,
  });
  return {
    data: rows.map((n) => ({ title: n.title, category: NEWS_CATEGORIES[n.category], urgent: n.isUrgent, date: n.publishedAt.toISOString().slice(0, 10), summary: n.excerpt })),
    cards: rows.slice(0, 3).map((n) => ({ title: n.title, subtitle: NEWS_CATEGORIES[n.category], href: `/news/${n.slug}` })),
  };
}

/** Kiểm tra đầu vào bằng Zod rồi chạy công cụ. Đầu vào sai trả lỗi để mô hình tự sửa. */
export async function runTool(name: string, rawInput: unknown, ctx: Ctx): Promise<ToolOutput & { error?: string }> {
  if (!(name in toolSchemas)) return { data: null, cards: [], error: `Công cụ không tồn tại: ${name}` };
  const parsed = toolSchemas[name as ToolName].safeParse(rawInput ?? {});
  if (!parsed.success) return { data: null, cards: [], error: `INVALID_INPUT: ${parsed.error.message}` };
  switch (name as ToolName) {
    case "queryWorkshopsAndMap":
      return queryWorkshopsAndMap(parsed.data as z.infer<typeof toolSchemas.queryWorkshopsAndMap>);
    case "verifyBatchByCode":
      return verifyBatchByCode(parsed.data as z.infer<typeof toolSchemas.verifyBatchByCode>);
    case "searchExhibitionCatalog":
      return searchExhibitionCatalog(parsed.data as z.infer<typeof toolSchemas.searchExhibitionCatalog>);
    case "inspectB2BQuotesAndCapacity":
      return inspectB2BQuotesAndCapacity(parsed.data as z.infer<typeof toolSchemas.inspectB2BQuotesAndCapacity>, ctx);
    case "getCommunityAnnouncements":
      return getCommunityAnnouncements(parsed.data as z.infer<typeof toolSchemas.getCommunityAnnouncements>);
  }
}
