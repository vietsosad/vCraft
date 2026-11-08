import "server-only";
import type { GlazeType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { BadRequestError, NotFoundError } from "@/lib/errors";
import { slugify, toSearchText, cleanText } from "@/lib/text";
import { GLAZES, categoryLabel } from "@/lib/constants";
import type { ProductInput } from "@/lib/validators/catalog";
import type { SessionUser } from "@/lib/auth/session";

async function uniqueProductSlug(name: string, excludeId?: string) {
  const base = slugify(name) || "san-pham";
  for (let i = 0; i < 100; i++) {
    const slug = i === 0 ? base : `${base}-${i + 1}`;
    const found = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (!found || found.id === excludeId) return slug;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/** Lô gắn vào sản phẩm phải thuộc chính xưởng đó. */
async function assertOwnBatch(artisanId: string, batchId: string | null | undefined) {
  if (!batchId) return;
  const batch = await prisma.productBatch.findUnique({ where: { id: batchId }, select: { artisanId: true } });
  if (!batch || batch.artisanId !== artisanId) throw new BadRequestError("Lô sản xuất không thuộc xưởng của bạn.");
}

function toData(user: SessionUser & { artisanId: string }, input: ProductInput, workshopName: string) {
  const name = cleanText(input.name);
  return {
    ...input,
    name,
    glazeType: input.glazeType as GlazeType,
    stock: input.isUniquePiece ? 1 : input.stock,
    // Xưởng chưa được BQL duyệt chỉ được lưu bản nháp – chống hàng nhái lên sàn
    isPublished: user.artisanVerified ? input.isPublished : false,
    currentBatchId: input.currentBatchId || null,
    searchText: toSearchText(name, workshopName, GLAZES[input.glazeType as GlazeType].label, categoryLabel(input.category)),
  };
}

export async function listOwnProducts(artisanId: string) {
  return prisma.product.findMany({
    where: { artisanId },
    orderBy: { createdAt: "desc" },
    include: { currentBatch: { select: { batchCode: true } } },
  });
}

export async function getOwnProduct(artisanId: string, id: string) {
  const product = await prisma.product.findFirst({ where: { id, artisanId } });
  if (!product) throw new NotFoundError("Không tìm thấy sản phẩm của xưởng bạn.");
  return product;
}

export async function createProduct(user: SessionUser & { artisanId: string }, input: ProductInput) {
  await assertOwnBatch(user.artisanId, input.currentBatchId);
  const workshop = await prisma.artisanProfile.findUniqueOrThrow({ where: { id: user.artisanId }, select: { workshopName: true } });
  return prisma.product.create({
    data: { ...toData(user, input, workshop.workshopName), artisanId: user.artisanId, slug: await uniqueProductSlug(input.name) },
  });
}

export async function updateProduct(user: SessionUser & { artisanId: string }, id: string, input: ProductInput) {
  const existing = await getOwnProduct(user.artisanId, id);
  await assertOwnBatch(user.artisanId, input.currentBatchId);
  const workshop = await prisma.artisanProfile.findUniqueOrThrow({ where: { id: user.artisanId }, select: { workshopName: true } });
  const slug = existing.name === input.name ? existing.slug : await uniqueProductSlug(input.name, id);
  return prisma.product.update({ where: { id }, data: { ...toData(user, input, workshop.workshopName), slug } });
}

export async function deleteProduct(artisanId: string, id: string) {
  await getOwnProduct(artisanId, id);
  await prisma.product.delete({ where: { id } });
}
