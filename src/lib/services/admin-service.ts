import "server-only";
import { prisma } from "@/lib/db";
import { BadRequestError, ConflictError, NotFoundError } from "@/lib/errors";
import { decrypt, maskNationalId } from "@/lib/crypto";
import { slugify } from "@/lib/text";
import type { SessionUser } from "@/lib/auth/session";
import type { NewsInput } from "@/lib/validators/news";
import { revokeAllSessions } from "@/lib/auth/session";
import { audit } from "./audit";
import { notify } from "./notification-service";

/** Hồ sơ đăng ký kèm số CCCD đã giải mã và che bớt – chỉ Admin gọi được. */
export async function getApplication(id: string) {
  const profile = await prisma.artisanProfile.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true, phone: true, status: true, createdAt: true } } },
  });
  if (!profile) throw new NotFoundError("Không tìm thấy hồ sơ.");
  const { nationalIdEnc, ...rest } = profile;
  let nationalIdMasked: string | null = null;
  if (nationalIdEnc) {
    try {
      nationalIdMasked = maskNationalId(decrypt(nationalIdEnc));
    } catch {
      nationalIdMasked = "Không giải mã được";
    }
  }
  return { ...rest, nationalIdMasked };
}

/** Duyệt hộ nghề: kích hoạt tài khoản, gắn huy hiệu xác thực, thông báo cho chủ xưởng. */
export async function approveArtisan(admin: SessionUser, id: string, note?: string) {
  const profile = await prisma.artisanProfile.findUnique({ where: { id } });
  if (!profile) throw new NotFoundError("Không tìm thấy hồ sơ.");
  if (profile.verificationStatus === "APPROVED") throw new ConflictError("ALREADY_APPROVED", "Hồ sơ đã được duyệt trước đó.");
  await prisma.$transaction(async (tx) => {
    await tx.artisanProfile.update({
      where: { id },
      data: { verificationStatus: "APPROVED", verifiedAt: new Date(), verificationNote: note ?? null },
    });
    await tx.user.update({ where: { id: profile.userId }, data: { status: "ACTIVE" } });
    await audit(admin.id, "ARTISAN_APPROVED", "ArtisanProfile", id, { note: note ?? null }, tx);
    await notify(
      profile.userId,
      {
        type: "APPLICATION_APPROVED",
        title: "Hồ sơ xưởng đã được duyệt",
        body: "Chúc mừng! Xưởng của bạn đã có huy hiệu Hộ nghề xác thực và có thể đăng sản phẩm, nhận đơn sỉ.",
        link: "/dashboard/artisan",
      },
      tx,
    );
  });
}

export async function rejectArtisan(admin: SessionUser, id: string, reason: string) {
  if (reason.trim().length < 10) throw new BadRequestError("Lý do từ chối cần ít nhất 10 ký tự để hộ nghề biết cách bổ sung.");
  const profile = await prisma.artisanProfile.findUnique({ where: { id } });
  if (!profile) throw new NotFoundError("Không tìm thấy hồ sơ.");
  await prisma.artisanProfile.update({ where: { id }, data: { verificationStatus: "REJECTED", verificationNote: reason } });
  await audit(admin.id, "ARTISAN_REJECTED", "ArtisanProfile", id, { reason });
  await notify(profile.userId, {
    type: "APPLICATION_REJECTED",
    title: "Hồ sơ xưởng cần bổ sung",
    body: `Ban quản lý chưa duyệt hồ sơ. Lý do: ${reason}`,
    link: "/dashboard/artisan",
  });
}

/** Tạm khóa tài khoản: thu hồi mọi phiên, sản phẩm của xưởng tự ẩn khỏi trang công khai. */
export async function setUserSuspended(admin: SessionUser, userId: string, suspended: boolean, reason?: string) {
  if (admin.id === userId) throw new BadRequestError("Không thể tự khóa tài khoản của mình.");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError("Không tìm thấy người dùng.");
  await prisma.user.update({ where: { id: userId }, data: { status: suspended ? "SUSPENDED" : "ACTIVE" } });
  if (suspended) await revokeAllSessions(userId);
  await audit(admin.id, suspended ? "USER_SUSPENDED" : "USER_REACTIVATED", "User", userId, { reason: reason ?? null });
}

async function uniqueNewsSlug(title: string, excludeId?: string) {
  const base = slugify(title).slice(0, 70) || "tin-tuc";
  for (let i = 0; i < 50; i++) {
    const slug = i === 0 ? base : `${base}-${i + 1}`;
    const found = await prisma.communityNews.findUnique({ where: { slug }, select: { id: true } });
    if (!found || found.id === excludeId) return slug;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/** Nội dung tin chỉ là văn bản thuần (xuống dòng, gạch đầu dòng); React tự escape khi hiển thị nên an toàn XSS. */
export async function createNews(admin: SessionUser, input: NewsInput) {
  const news = await prisma.communityNews.create({
    data: { ...input, coverImage: input.coverImage ?? undefined, authorId: admin.id, slug: await uniqueNewsSlug(input.title) },
  });
  await audit(admin.id, "NEWS_CREATED", "CommunityNews", news.id, { title: news.title });
  if (news.isUrgent && news.isPublished) {
    const artisans = await prisma.user.findMany({ where: { role: "ARTISAN", status: "ACTIVE" }, select: { id: true } });
    await notify(artisans.map((a) => a.id), {
      type: "NEWS_URGENT",
      title: "Thông báo khẩn từ Ban quản lý",
      body: news.title,
      link: `/news/${news.slug}`,
    });
  }
  return news;
}

export async function updateNews(admin: SessionUser, id: string, input: NewsInput) {
  const existing = await prisma.communityNews.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Không tìm thấy tin.");
  const slug = existing.title === input.title ? existing.slug : await uniqueNewsSlug(input.title, id);
  const news = await prisma.communityNews.update({
    where: { id },
    data: { ...input, coverImage: input.coverImage ?? undefined, slug },
  });
  await audit(admin.id, "NEWS_UPDATED", "CommunityNews", id, { title: news.title });
  return news;
}

export async function deleteNews(admin: SessionUser, id: string) {
  await prisma.communityNews.delete({ where: { id } });
  await audit(admin.id, "NEWS_DELETED", "CommunityNews", id);
}

/** Số liệu tổng quan cho bảng điều khiển BQL. */
export async function getStats() {
  const [artisans, pending, products, batches, scans, quotesByStatus, accepted] = await Promise.all([
    prisma.artisanProfile.count({ where: { verificationStatus: "APPROVED" } }),
    prisma.artisanProfile.count({ where: { verificationStatus: "PENDING" } }),
    prisma.product.count({ where: { isPublished: true } }),
    prisma.productBatch.count(),
    prisma.productBatch.aggregate({ _sum: { scanCount: true } }),
    prisma.quoteRequest.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.quoteBid.findMany({ where: { status: "ACCEPTED" }, select: { allocatedQuantity: true, offeredPricePerUnit: true } }),
  ]);
  return {
    artisans,
    pending,
    products,
    batches,
    scans: scans._sum.scanCount ?? 0,
    quotesByStatus: Object.fromEntries(quotesByStatus.map((q) => [q.status, q._count._all])),
    orderValue: accepted.reduce((s, b) => s + (b.allocatedQuantity ?? 0) * b.offeredPricePerUnit, 0),
  };
}
