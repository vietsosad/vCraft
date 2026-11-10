import "server-only";
import type { GlazeType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { toSearchText } from "@/lib/text";
import { asImages } from "@/lib/types";
import { getOpenState } from "@/lib/opening-hours";
import type { ProductQuery } from "@/lib/validators/catalog";

/** Chỉ hiển thị công khai sản phẩm của hộ đã được BQL duyệt và chưa bị khóa. */
const VISIBLE_ARTISAN = { verificationStatus: "APPROVED" as const, user: { status: "ACTIVE" as const } };

export function buildProductWhere(q: Partial<ProductQuery>): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { isPublished: true, artisan: VISIBLE_ARTISAN };
  if (q.q) {
    const terms = toSearchText(q.q).split(" ").filter(Boolean);
    where.AND = terms.map((t) => ({ searchText: { contains: t } }));
  }
  if (q.category) where.category = q.category;
  if (q.glaze) where.glazeType = q.glaze as GlazeType;
  if (q.artisan) where.artisan = { ...VISIBLE_ARTISAN, slug: q.artisan };
  if (q.minPrice || q.maxPrice) where.priceVnd = { gte: q.minPrice, lte: q.maxPrice };
  if (q.unique) where.isUniquePiece = true;
  if (q.traceable) where.currentBatchId = { not: null };
  return where;
}

const ORDER: Record<ProductQuery["sort"], Prisma.ProductOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  price_asc: { priceVnd: "asc" },
  price_desc: { priceVnd: "desc" },
};

export async function listProducts(q: ProductQuery) {
  const where = buildProductWhere(q);
  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: ORDER[q.sort],
      skip: (q.page - 1) * q.pageSize,
      take: q.pageSize,
      select: {
        id: true, slug: true, name: true, category: true, glazeType: true, priceVnd: true, isUniquePiece: true,
        images: true, currentBatch: { select: { batchCode: true } },
        artisan: { select: { slug: true, workshopName: true } },
      },
    }),
  ]);
  return {
    items: rows.map((p) => ({ ...p, image: asImages(p.images)[0] ?? null, images: undefined })),
    total,
    page: q.page,
    pageSize: q.pageSize,
    pageCount: Math.max(1, Math.ceil(total / q.pageSize)),
  };
}

/** Gợi ý tìm kiếm tức thì: sản phẩm và xưởng khớp từ khóa không dấu. */
export async function suggest(term: string) {
  const terms = toSearchText(term).split(" ").filter(Boolean);
  if (!terms.length) return { products: [], artisans: [] };
  const [products, artisans] = await Promise.all([
    prisma.product.findMany({
      where: { isPublished: true, artisan: VISIBLE_ARTISAN, AND: terms.map((t) => ({ searchText: { contains: t } })) },
      take: 6,
      select: { slug: true, name: true, priceVnd: true, images: true },
    }),
    prisma.artisanProfile.findMany({
      where: { ...VISIBLE_ARTISAN, AND: terms.map((t) => ({ searchText: { contains: t } })) },
      take: 3,
      select: { slug: true, workshopName: true, artisanName: true },
    }),
  ]);
  return {
    products: products.map((p) => ({ slug: p.slug, name: p.name, priceVnd: p.priceVnd, thumb: asImages(p.images)[0] ?? null })),
    artisans,
  };
}

/** Danh sách xưởng cho bản đồ và trang nghệ nhân, kèm trạng thái mở cửa tính theo giờ Việt Nam. */
export async function listWorkshops(filter: { openNow?: boolean; experience?: boolean; wholesale?: boolean; glaze?: string } = {}) {
  const rows = await prisma.artisanProfile.findMany({
    where: {
      ...VISIBLE_ARTISAN,
      ...(filter.experience ? { experienceOffered: true } : {}),
      ...(filter.wholesale ? { acceptsWholesale: true } : {}),
      ...(filter.glaze ? { specialties: { has: filter.glaze as GlazeType } } : {}),
    },
    orderBy: { establishedYear: "asc" },
    select: {
      id: true, slug: true, workshopName: true, artisanName: true, artisanTitle: true, tagline: true, address: true,
      latitude: true, longitude: true, isOpenForVisit: true, openingHours: true, openDays: true,
      experienceOffered: true, experiencePriceVnd: true, acceptsWholesale: true, maxMonthlyCapacity: true,
      specialties: true, coverImage: true, establishedYear: true, generation: true, ratingAvg: true, ratingCount: true,
      _count: { select: { products: { where: { isPublished: true } } } },
    },
  });
  const now = new Date();
  const items = rows.map((w) => ({ ...w, openState: getOpenState(w, now) }));
  return filter.openNow ? items.filter((w) => w.openState.isOpenNow) : items;
}
