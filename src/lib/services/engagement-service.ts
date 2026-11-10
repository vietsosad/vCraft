import "server-only";
import type { BookingStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { AppError, ConflictError, ForbiddenError, NotFoundError } from "@/lib/errors";
import { parseRange, hhmm, vietnamNow } from "@/lib/opening-hours";
import { nextSequence } from "./codes";
import { notify, notifyArtisans } from "./notification-service";
import { audit } from "./audit";
import type { SessionUser } from "@/lib/auth/session";
import type { BookingCreateInput, ReviewInput } from "@/lib/validators/engagement";

/* =========================================================================
 * Yêu thích
 * ========================================================================= */

/** Bật/tắt yêu thích một sản phẩm hoặc một xưởng. Trả về trạng thái mới. */
export async function toggleFavorite(userId: string, target: { productId?: string; artisanId?: string }) {
  const where = target.productId
    ? { userId_productId: { userId, productId: target.productId } }
    : { userId_artisanId: { userId, artisanId: target.artisanId! } };
  const existing = await prisma.favorite.findUnique({ where });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return { favorited: false };
  }
  if (target.productId) {
    const p = await prisma.product.findFirst({ where: { id: target.productId, isPublished: true }, select: { id: true } });
    if (!p) throw new NotFoundError("Không tìm thấy tác phẩm.");
  } else {
    const a = await prisma.artisanProfile.findFirst({ where: { id: target.artisanId, verificationStatus: "APPROVED" }, select: { id: true } });
    if (!a) throw new NotFoundError("Không tìm thấy xưởng.");
  }
  await prisma.favorite.create({ data: { userId, productId: target.productId ?? null, artisanId: target.artisanId ?? null } });
  return { favorited: true };
}

export async function favoriteIds(userId: string) {
  const rows = await prisma.favorite.findMany({ where: { userId }, select: { productId: true, artisanId: true } });
  return {
    products: rows.flatMap((r) => (r.productId ? [r.productId] : [])),
    artisans: rows.flatMap((r) => (r.artisanId ? [r.artisanId] : [])),
  };
}

/* =========================================================================
 * Đánh giá
 * ========================================================================= */

async function refreshRating(artisanId: string) {
  const agg = await prisma.review.aggregate({ where: { artisanId }, _avg: { rating: true }, _count: { _all: true } });
  await prisma.artisanProfile.update({
    where: { id: artisanId },
    data: { ratingAvg: Math.round((agg._avg.rating ?? 0) * 10) / 10, ratingCount: agg._count._all },
  });
}

/**
 * Viết đánh giá. Chỉ được đánh giá khi:
 * - đơn sỉ của chính mình đã DELIVERED và xưởng đó có chào giá được chọn, hoặc
 * - buổi trải nghiệm của chính mình đã COMPLETED.
 * Mỗi đơn/buổi chỉ một đánh giá cho mỗi xưởng (ràng buộc unique trong CSDL).
 */
export async function createReview(user: SessionUser, input: ReviewInput) {
  let quoteRequestId: string | null = null;
  let bookingId: string | null = null;

  if (input.quoteCode) {
    const quote = await prisma.quoteRequest.findUnique({
      where: { requestCode: input.quoteCode },
      include: { bids: { where: { artisanId: input.artisanId, status: "ACCEPTED" }, select: { id: true } } },
    });
    if (!quote || quote.buyerId !== user.id) throw new NotFoundError("Không tìm thấy đơn hàng của bạn.");
    if (quote.status !== "DELIVERED") throw new AppError(409, "NOT_DELIVERED", "Bạn có thể đánh giá sau khi đơn hàng đã giao xong.");
    if (quote.bids.length === 0) throw new ForbiddenError("Xưởng này không tham gia sản xuất đơn của bạn.");
    quoteRequestId = quote.id;
  } else {
    const booking = await prisma.experienceBooking.findUnique({ where: { code: input.bookingCode! } });
    if (!booking || booking.userId !== user.id || booking.artisanId !== input.artisanId) throw new NotFoundError("Không tìm thấy buổi trải nghiệm của bạn.");
    if (booking.status !== "COMPLETED") throw new AppError(409, "NOT_COMPLETED", "Bạn có thể đánh giá sau khi buổi trải nghiệm đã diễn ra.");
    bookingId = booking.id;
  }

  const dup = await prisma.review.findFirst({
    where: quoteRequestId ? { quoteRequestId, artisanId: input.artisanId } : { bookingId },
    select: { id: true },
  });
  if (dup) throw new ConflictError("REVIEW_EXISTS", "Bạn đã đánh giá xưởng cho lần này rồi.");

  const review = await prisma.review.create({
    data: { artisanId: input.artisanId, authorId: user.id, quoteRequestId, bookingId, rating: input.rating, comment: input.comment },
  });
  await refreshRating(input.artisanId);
  await notifyArtisans([input.artisanId], {
    type: "REVIEW_RECEIVED",
    title: `Bạn nhận được đánh giá ${input.rating} sao`,
    body: input.comment.slice(0, 120),
    link: "/dashboard/artisan/reviews",
  });
  return review;
}

export async function replyReview(user: SessionUser & { artisanId: string }, reviewId: string, reply: string) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review || review.artisanId !== user.artisanId) throw new NotFoundError("Không tìm thấy đánh giá.");
  const updated = await prisma.review.update({ where: { id: reviewId }, data: { artisanReply: reply, repliedAt: new Date() } });
  await notify(review.authorId, { type: "REVIEW_REPLIED", title: "Nghệ nhân đã trả lời đánh giá của bạn", body: reply.slice(0, 120), link: "/account/reviews" });
  return updated;
}

/** Những lần khách có thể đánh giá nhưng chưa đánh giá. */
export async function pendingReviews(userId: string) {
  const [quotes, bookings, reviewed] = await Promise.all([
    prisma.quoteRequest.findMany({
      where: { buyerId: userId, status: "DELIVERED" },
      select: { requestCode: true, title: true, updatedAt: true, bids: { where: { status: "ACCEPTED" }, select: { artisan: { select: { id: true, workshopName: true, slug: true } } } } },
    }),
    prisma.experienceBooking.findMany({
      where: { userId, status: "COMPLETED", review: null },
      select: { code: true, visitDate: true, artisan: { select: { id: true, workshopName: true, slug: true } } },
    }),
    prisma.review.findMany({ where: { authorId: userId, quoteRequestId: { not: null } }, select: { quoteRequestId: true, artisanId: true, quoteRequest: { select: { requestCode: true } } } }),
  ]);
  const done = new Set(reviewed.map((r) => `${r.quoteRequest?.requestCode}:${r.artisanId}`));
  const fromQuotes = quotes.flatMap((q) =>
    q.bids
      .filter((b) => !done.has(`${q.requestCode}:${b.artisan.id}`))
      .map((b) => ({ kind: "quote" as const, ref: q.requestCode, title: q.title, date: q.updatedAt, artisan: b.artisan })),
  );
  const fromBookings = bookings.map((b) => ({ kind: "booking" as const, ref: b.code, title: "Buổi trải nghiệm nặn gốm", date: b.visitDate, artisan: b.artisan }));
  return [...fromQuotes, ...fromBookings];
}

/* =========================================================================
 * Đặt lịch trải nghiệm
 * ========================================================================= */

const SLOT_MINUTES = 120;

/** Ngày "YYYY-MM-DD" → Date (UTC nửa đêm, khớp cột @db.Date). */
function toDateOnly(iso: string) {
  return new Date(`${iso}T00:00:00.000Z`);
}

function todayVn() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
}

/** Các khung giờ 2 tiếng trong giờ mở cửa, kèm số chỗ còn trống. */
export async function availability(slug: string, isoDate: string) {
  const artisan = await prisma.artisanProfile.findFirst({
    where: { slug, verificationStatus: "APPROVED", user: { status: "ACTIVE" } },
    select: { id: true, openingHours: true, openDays: true, isOpenForVisit: true, experienceOffered: true, experienceCapacity: true, experiencePriceVnd: true },
  });
  if (!artisan) throw new NotFoundError("Không tìm thấy xưởng.");
  if (!artisan.experienceOffered) return { offered: false as const, slots: [], pricePerGuest: 0, capacity: 0, reason: "Xưởng chưa mở lớp trải nghiệm." };

  const date = toDateOnly(isoDate);
  const day = date.getUTCDay();
  const today = todayVn();
  if (isoDate < today) return { offered: true as const, slots: [], pricePerGuest: artisan.experiencePriceVnd, capacity: artisan.experienceCapacity, reason: "Ngày này đã qua." };
  if (!artisan.isOpenForVisit || !artisan.openDays.includes(day)) {
    return { offered: true as const, slots: [], pricePerGuest: artisan.experiencePriceVnd, capacity: artisan.experienceCapacity, reason: "Xưởng nghỉ vào ngày này." };
  }

  const [start, end] = parseRange(artisan.openingHours);
  const taken = await prisma.experienceBooking.groupBy({
    by: ["slot"],
    where: { artisanId: artisan.id, visitDate: date, status: { in: ["PENDING", "CONFIRMED"] } },
    _sum: { guests: true },
  });
  const nowMin = isoDate === today ? vietnamNow().minutes + 60 : -1;
  const slots = [];
  for (let m = start; m + SLOT_MINUTES <= end; m += SLOT_MINUTES) {
    const slot = hhmm(m);
    const used = taken.find((t) => t.slot === slot)?._sum.guests ?? 0;
    slots.push({ slot, endsAt: hhmm(m + SLOT_MINUTES), remaining: Math.max(0, artisan.experienceCapacity - used), past: m < nowMin });
  }
  return { offered: true as const, slots, pricePerGuest: artisan.experiencePriceVnd, capacity: artisan.experienceCapacity, reason: null };
}

/** Đặt lịch. Kiểm tra lại chỗ trống trong giao dịch Serializable để hai người không đặt quá sức chứa. */
export async function createBooking(user: SessionUser, input: BookingCreateInput) {
  if (user.role !== "BUYER") throw new ForbiddenError("Chỉ tài khoản khách hàng mới đặt lịch trải nghiệm.");
  const avail = await availability(input.artisanSlug, input.visitDate);
  if (!avail.offered) throw new AppError(409, "NO_EXPERIENCE", avail.reason ?? "Xưởng chưa mở lớp trải nghiệm.");
  const slot = avail.slots.find((s) => s.slot === input.slot);
  if (!slot || slot.past) throw new AppError(409, "SLOT_UNAVAILABLE", avail.reason ?? "Khung giờ này không còn nhận khách.");

  const artisan = await prisma.artisanProfile.findUniqueOrThrow({ where: { slug: input.artisanSlug }, select: { id: true, workshopName: true, experienceCapacity: true, experiencePriceVnd: true } });
  const date = toDateOnly(input.visitDate);

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const booking = await prisma.$transaction(
        async (tx) => {
          const used = await tx.experienceBooking.aggregate({
            where: { artisanId: artisan.id, visitDate: date, slot: input.slot, status: { in: ["PENDING", "CONFIRMED"] } },
            _sum: { guests: true },
          });
          const remaining = artisan.experienceCapacity - (used._sum.guests ?? 0);
          if (input.guests > remaining) {
            throw new AppError(409, "SLOT_FULL", remaining > 0 ? `Khung ${input.slot} chỉ còn ${remaining} chỗ.` : `Khung ${input.slot} đã kín chỗ, bạn chọn giờ khác nhé.`);
          }
          const seq = await nextSequence(tx, `booking-${input.visitDate.slice(0, 4)}`);
          return tx.experienceBooking.create({
            data: {
              code: `TN-${input.visitDate.slice(0, 4)}-${String(seq).padStart(4, "0")}`,
              artisanId: artisan.id,
              userId: user.id,
              visitDate: date,
              slot: input.slot,
              guests: input.guests,
              contactName: input.contactName,
              contactPhone: input.contactPhone,
              note: input.note || null,
              totalVnd: artisan.experiencePriceVnd * input.guests,
            },
          });
        },
        { isolationLevel: "Serializable" },
      );
      await notifyArtisans([artisan.id], {
        type: "BOOKING_REQUESTED",
        title: `Lịch trải nghiệm mới: ${input.guests} khách, ${input.slot} ngày ${input.visitDate.split("-").reverse().join("/")}`,
        body: `${input.contactName} · ${input.contactPhone}`,
        link: "/dashboard/artisan/bookings",
      });
      return booking;
    } catch (err) {
      if ((err as { code?: string }).code === "P2034" && attempt < 2) continue;
      throw err;
    }
  }
  throw new AppError(409, "RETRY", "Có nhiều người đặt cùng lúc, vui lòng thử lại.");
}

const BOOKING_FLOW: Record<string, { from: BookingStatus[]; to: BookingStatus; by: "artisan" | "buyer" }> = {
  confirm: { from: ["PENDING"], to: "CONFIRMED", by: "artisan" },
  decline: { from: ["PENDING", "CONFIRMED"], to: "DECLINED", by: "artisan" },
  complete: { from: ["CONFIRMED"], to: "COMPLETED", by: "artisan" },
  cancel: { from: ["PENDING", "CONFIRMED"], to: "CANCELLED", by: "buyer" },
};

const BOOKING_MESSAGE: Record<string, string> = {
  confirm: "Xưởng đã xác nhận lịch trải nghiệm của bạn",
  decline: "Xưởng không nhận được lịch trải nghiệm này",
  complete: "Cảm ơn bạn đã ghé xưởng – hãy để lại đánh giá",
  cancel: "Khách đã hủy lịch trải nghiệm",
};

/** Chuyển trạng thái lịch hẹn với khóa lạc quan theo cột version. */
export async function actOnBooking(user: SessionUser, code: string, action: keyof typeof BOOKING_FLOW, version: number, note?: string) {
  const booking = await prisma.experienceBooking.findUnique({ where: { code }, include: { artisan: { select: { workshopName: true, userId: true } } } });
  if (!booking) throw new NotFoundError("Không tìm thấy lịch hẹn.");
  const rule = BOOKING_FLOW[action];
  const isOwnerArtisan = user.role === "ARTISAN" && user.artisanId === booking.artisanId;
  const isBuyer = user.id === booking.userId;
  if ((rule.by === "artisan" && !isOwnerArtisan) || (rule.by === "buyer" && !isBuyer)) throw new ForbiddenError();
  if (!rule.from.includes(booking.status)) throw new AppError(409, "BOOKING_STATE", "Lịch hẹn đã đổi trạng thái, vui lòng tải lại.");
  if (action === "complete" && booking.visitDate.toISOString().slice(0, 10) > todayVn()) {
    throw new AppError(409, "NOT_YET", "Chỉ đánh dấu đã diễn ra từ ngày hẹn trở đi.");
  }

  const res = await prisma.experienceBooking.updateMany({
    where: { id: booking.id, version, status: booking.status },
    data: { status: rule.to, version: { increment: 1 }, ...(rule.by === "artisan" && note ? { artisanNote: note } : {}) },
  });
  if (res.count === 0) throw new ConflictError("BOOKING_VERSION_CONFLICT", "Lịch hẹn vừa được cập nhật ở nơi khác, vui lòng tải lại.");

  const visit = booking.visitDate.toISOString().slice(0, 10).split("-").reverse().join("/");
  if (rule.by === "artisan") {
    await notify(booking.userId, {
      type: `BOOKING_${rule.to}`,
      title: BOOKING_MESSAGE[action],
      body: `${booking.artisan.workshopName} · ${booking.slot} ngày ${visit}${note ? ` · ${note}` : ""}`,
      link: "/account/bookings",
    });
  } else {
    await notify(booking.artisan.userId, { type: "BOOKING_CANCELLED", title: BOOKING_MESSAGE[action], body: `${booking.contactName} · ${booking.slot} ngày ${visit}`, link: "/dashboard/artisan/bookings" });
  }
  await audit(user.id, `booking.${action}`, "ExperienceBooking", booking.id, { code });
  return prisma.experienceBooking.findUniqueOrThrow({ where: { id: booking.id } });
}
