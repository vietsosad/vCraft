import "server-only";
import { Prisma, type QuoteStatus, type GlazeType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { AppError, BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "@/lib/errors";
import type { SessionUser } from "@/lib/auth/session";
import type { AcceptInput, BidInput, QuoteCreateInput } from "@/lib/validators/quote";
import { QUOTE_STATUS } from "@/lib/constants";
import { formatVnd } from "@/lib/format";
import { BIDDING_OPEN, EVENT_LABEL, nextStatus, type QuoteEvent } from "./quote-machine";
import { matchArtisans, suggestAllocation } from "./allocation";
import { nextBatchCode, nextQuoteCode } from "./codes";
import { qrDataUrl } from "./qr";
import { notify, notifyAdmins, notifyArtisans } from "./notification-service";
import { audit } from "./audit";

type Tx = Prisma.TransactionClient;

/**
 * Chạy khối lệnh trong giao dịch Serializable, tự thử lại tối đa 3 lần
 * khi PostgreSQL báo xung đột ghi hoặc deadlock (Prisma mã P2034).
 */
export async function runSerializable<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await prisma.$transaction(fn, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 15000,
      });
    } catch (err) {
      const retryable = err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2034";
      if (!retryable || attempt >= 3) throw err;
      await new Promise((r) => setTimeout(r, 40 * attempt));
    }
  }
}

/**
 * Chuyển trạng thái có điều kiện – trái tim của cơ chế khóa lạc quan.
 * `updateMany` chỉ cập nhật khi status VÀ version khớp với giá trị người gọi đã đọc;
 * nếu bản ghi đã bị tiến trình khác thay đổi thì count = 0 → ném 409 Conflict.
 */
async function transition(
  tx: Tx,
  quote: { id: string; status: QuoteStatus; version: number },
  event: QuoteEvent,
  actorId: string | null,
  note?: string,
): Promise<QuoteStatus> {
  const to = nextStatus(quote.status, event);
  if (!to) {
    throw new BadRequestError(
      `Không thể ${EVENT_LABEL[event]} khi yêu cầu đang ở trạng thái "${QUOTE_STATUS[quote.status].label}".`,
      { from: quote.status, event },
      "INVALID_TRANSITION",
    );
  }
  const updated = await tx.quoteRequest.updateMany({
    where: { id: quote.id, status: quote.status, version: quote.version },
    data: { status: to, version: { increment: 1 } },
  });
  if (updated.count === 0) {
    const current = await tx.quoteRequest.findUnique({ where: { id: quote.id }, select: { version: true, status: true } });
    throw new ConflictError(
      "QUOTE_VERSION_CONFLICT",
      `Yêu cầu đã được cập nhật bởi một thao tác khác (phiên bản v${quote.version} → v${current?.version}). Vui lòng tải lại dữ liệu mới nhất.`,
      { expectedVersion: quote.version, currentVersion: current?.version, currentStatus: current?.status },
    );
  }
  await tx.quoteStatusHistory.create({
    data: { quoteRequestId: quote.id, fromStatus: quote.status, toStatus: to, actorId, note },
  });
  return to;
}

async function getQuoteOrThrow(db: Tx | typeof prisma, code: string) {
  const quote = await db.quoteRequest.findUnique({ where: { requestCode: code } });
  if (!quote) throw new NotFoundError("Không tìm thấy yêu cầu báo giá.");
  return quote;
}

/**
 * So khớp phiên bản người dùng đã thấy với phiên bản hiện tại trong CSDL.
 * Kiểm tra trước để báo 409 rõ ràng; `updateMany` có điều kiện trong `transition` vẫn chặn
 * khoảng hở giữa lúc đọc và lúc ghi.
 */
function assertVersion(quote: { version: number; status: QuoteStatus }, expectedVersion: number) {
  if (quote.version !== expectedVersion) {
    throw new ConflictError(
      "QUOTE_VERSION_CONFLICT",
      `Yêu cầu đã được cập nhật bởi một thao tác khác (bạn đang xem v${expectedVersion}, hiện tại là v${quote.version} – "${QUOTE_STATUS[quote.status].label}"). Vui lòng tải lại dữ liệu mới nhất.`,
      { expectedVersion, currentVersion: quote.version, currentStatus: quote.status },
    );
  }
}

function assertBuyerOwns(user: SessionUser, quote: { buyerId: string }) {
  if (user.role === "ADMIN") return;
  if (quote.buyerId !== user.id) throw new ForbiddenError("Bạn không phải người tạo yêu cầu này.");
}

/* ------------------------------------------------------------------ Tạo và gửi */

export async function createQuote(buyer: SessionUser, input: QuoteCreateInput, sendNow: boolean) {
  const quote = await prisma.$transaction(async (tx) => {
    const requestCode = await nextQuoteCode(tx);
    const created = await tx.quoteRequest.create({
      data: {
        requestCode,
        buyerId: buyer.id,
        organizationName: input.organizationName,
        title: input.title,
        category: input.category,
        preferredGlaze: input.preferredGlaze as GlazeType,
        quantity: input.quantity,
        targetBudgetPerUnit: input.targetBudgetPerUnit,
        deadlineDays: input.deadlineDays,
        biddingClosesAt: new Date(Date.now() + input.biddingDays * 24 * 3600 * 1000),
        specifications: input.specifications,
        deliveryAddress: input.deliveryAddress,
        referenceImages: input.referenceImages,
      },
    });
    await tx.quoteStatusHistory.create({
      data: { quoteRequestId: created.id, toStatus: "DRAFT_REQUEST", actorId: buyer.id, note: "Tạo yêu cầu" },
    });
    return created;
  });
  if (sendNow) return sendQuote(buyer, quote.requestCode, quote.version);
  return { quote, invited: 0 };
}

/** DRAFT → SENT: ghép hộ phù hợp, tạo lời mời và thông báo cho các hộ. */
export async function sendQuote(user: SessionUser, code: string, expectedVersion: number) {
  const result = await runSerializable(async (tx) => {
    const quote = await getQuoteOrThrow(tx, code);
    assertBuyerOwns(user, quote);
    assertVersion(quote, expectedVersion);
    await transition(tx, quote, "send", user.id);

    const artisans = await tx.artisanProfile.findMany({
      where: { verificationStatus: "APPROVED", user: { status: "ACTIVE" } },
      select: { id: true, workshopName: true, specialties: true, maxMonthlyCapacity: true, ratingAvg: true, acceptsWholesale: true },
    });
    const matches = matchArtisans(
      quote,
      artisans.map((a) => ({ ...a, verified: true })),
    );
    if (matches.length) {
      await tx.quoteInvitation.createMany({
        data: matches.map((m) => ({
          quoteRequestId: quote.id,
          artisanId: m.artisanId,
          matchScore: m.score,
          matchReasons: m.reasons,
        })),
        skipDuplicates: true,
      });
    }
    return { quote, matches };
  });

  await notifyArtisans(
    result.matches.map((m) => m.artisanId),
    {
      type: "QUOTE_INVITED",
      title: "Bạn được mời chào giá đơn sỉ",
      body: `${result.quote.title} – ${result.quote.quantity.toLocaleString("vi-VN")} sản phẩm.`,
      link: `/dashboard/artisan/quotes/${result.quote.requestCode}`,
    },
  );
  const quote = await getQuoteOrThrow(prisma, code);
  return { quote, invited: result.matches.length };
}

/* ------------------------------------------------------------------ Chào giá */

export async function submitBid(user: SessionUser & { artisanId: string }, code: string, input: BidInput) {
  const bid = await runSerializable(async (tx) => {
    const quote = await getQuoteOrThrow(tx, code);
    if (!BIDDING_OPEN.includes(quote.status)) {
      throw new ConflictError("QUOTE_LOCKED", "Yêu cầu này đã đóng nhận chào giá.");
    }
    if (quote.biddingClosesAt && quote.biddingClosesAt < new Date()) {
      throw new ConflictError("BIDDING_CLOSED", "Đã quá hạn nhận chào giá.");
    }
    const invited = await tx.quoteInvitation.findUnique({
      where: { quoteRequestId_artisanId: { quoteRequestId: quote.id, artisanId: user.artisanId } },
    });
    if (!invited) throw new ForbiddenError("Xưởng của bạn chưa được mời chào giá cho yêu cầu này.");
    if (input.committedQuantity > quote.quantity) {
      throw new BadRequestError("Số lượng nhận làm không được vượt số lượng khách yêu cầu.", {
        committedQuantity: [`Tối đa ${quote.quantity.toLocaleString("vi-VN")} sản phẩm.`],
      }, "VALIDATION_ERROR");
    }

    const existing = await tx.quoteBid.findUnique({
      where: { quoteRequestId_artisanId: { quoteRequestId: quote.id, artisanId: user.artisanId } },
    });
    if (existing && existing.status !== "WITHDRAWN") {
      throw new ConflictError("BID_EXISTS", "Xưởng đã gửi chào giá cho yêu cầu này. Hãy sửa chào giá hiện có.", { bidId: existing.id });
    }
    const saved = existing
      ? await tx.quoteBid.update({
          where: { id: existing.id },
          data: { ...input, status: "PENDING", version: { increment: 1 } },
        })
      : await tx.quoteBid.create({ data: { ...input, quoteRequestId: quote.id, artisanId: user.artisanId } });

    // Chào giá đầu tiên đưa yêu cầu sang ARTISANS_BIDDING. Bước này idempotent:
    // nếu hộ khác vừa chuyển trạng thái trước thì bỏ qua, không báo lỗi oan.
    if (quote.status === "SENT_TO_ARTISANS") {
      const moved = await tx.quoteRequest.updateMany({
        where: { id: quote.id, status: "SENT_TO_ARTISANS" },
        data: { status: "ARTISANS_BIDDING", version: { increment: 1 } },
      });
      if (moved.count === 1) {
        await tx.quoteStatusHistory.create({
          data: { quoteRequestId: quote.id, fromStatus: "SENT_TO_ARTISANS", toStatus: "ARTISANS_BIDDING", actorId: user.id, note: "Nhận chào giá đầu tiên" },
        });
      }
    }
    return { saved, quote };
  });

  await notify(bid.quote.buyerId, {
    type: "BID_RECEIVED",
    title: "Có chào giá mới",
    body: `Một xưởng vừa chào ${formatVnd(input.offeredPricePerUnit)}/sp cho ${input.committedQuantity.toLocaleString("vi-VN")} sản phẩm.`,
    link: `/b2b-quotes/${code}`,
  });
  return bid.saved;
}

/** Sửa chào giá: chỉ khi còn PENDING và version khớp (khóa lạc quan trên từng chào giá). */
export async function updateBid(user: SessionUser & { artisanId: string }, bidId: string, input: BidInput & { version: number }) {
  const { version, ...data } = input;
  return runSerializable(async (tx) => {
    const bid = await tx.quoteBid.findUnique({ where: { id: bidId }, include: { quoteRequest: true } });
    if (!bid || bid.artisanId !== user.artisanId) throw new NotFoundError("Không tìm thấy chào giá.");
    if (!BIDDING_OPEN.includes(bid.quoteRequest.status)) {
      throw new ConflictError("QUOTE_LOCKED", "Yêu cầu đã được chốt, không thể sửa chào giá nữa.");
    }
    if (data.committedQuantity > bid.quoteRequest.quantity) {
      throw new BadRequestError("Số lượng vượt yêu cầu.", { committedQuantity: [`Tối đa ${bid.quoteRequest.quantity}`] }, "VALIDATION_ERROR");
    }
    const updated = await tx.quoteBid.updateMany({
      where: { id: bidId, version, status: "PENDING" },
      data: { ...data, version: { increment: 1 } },
    });
    if (updated.count === 0) {
      throw new ConflictError("BID_VERSION_CONFLICT", "Chào giá đã thay đổi ở nơi khác hoặc đã bị khóa. Vui lòng tải lại.");
    }
    return tx.quoteBid.findUniqueOrThrow({ where: { id: bidId } });
  });
}

export async function withdrawBid(user: SessionUser & { artisanId: string }, bidId: string, version: number) {
  return runSerializable(async (tx) => {
    const bid = await tx.quoteBid.findUnique({ where: { id: bidId }, include: { quoteRequest: true } });
    if (!bid || bid.artisanId !== user.artisanId) throw new NotFoundError("Không tìm thấy chào giá.");
    if (!BIDDING_OPEN.includes(bid.quoteRequest.status)) {
      throw new ConflictError("QUOTE_LOCKED", "Yêu cầu đã được chốt, không thể rút chào giá.");
    }
    const updated = await tx.quoteBid.updateMany({
      where: { id: bidId, version, status: "PENDING" },
      data: { status: "WITHDRAWN", version: { increment: 1 } },
    });
    if (updated.count === 0) throw new ConflictError("BID_VERSION_CONFLICT", "Chào giá đã thay đổi. Vui lòng tải lại.");
  });
}

/* ------------------------------------------------------------------ Chốt phân bổ */

/**
 * BIDDING → BUYER_ACCEPTED, thực hiện nguyên tử trong một giao dịch Serializable:
 * 1. Kiểm tra version của yêu cầu và của TỪNG chào giá khách đã thấy.
 * 2. Tổng số lượng chọn phải bằng số lượng yêu cầu; mỗi phần ≤ số lượng hộ nhận làm.
 * 3. Chuyển trạng thái yêu cầu (khóa lạc quan), đánh dấu chào giá ACCEPTED / REJECTED.
 * 4. Tự sinh lô sản xuất có mã QR cho từng hộ trúng thầu.
 */
export async function acceptBids(user: SessionUser, code: string, input: AcceptInput) {
  const result = await runSerializable(async (tx) => {
    const quote = await getQuoteOrThrow(tx, code);
    assertBuyerOwns(user, quote);
    assertVersion(quote, input.expectedVersion);

    const ids = input.selections.map((s) => s.bidId);
    if (new Set(ids).size !== ids.length) throw new BadRequestError("Mỗi chào giá chỉ được chọn một lần.");

    const bids = await tx.quoteBid.findMany({
      where: { quoteRequestId: quote.id },
      include: { artisan: { select: { id: true, workshopName: true, userId: true } } },
    });
    const byId = new Map(bids.map((b) => [b.id, b]));

    let total = 0;
    for (const sel of input.selections) {
      const bid = byId.get(sel.bidId);
      if (!bid) throw new BadRequestError("Chào giá không thuộc yêu cầu này.");
      if (bid.status !== "PENDING") {
        throw new ConflictError("BID_NOT_AVAILABLE", `Chào giá của ${bid.artisan.workshopName} không còn hiệu lực.`);
      }
      if (bid.version !== sel.bidVersion) {
        throw new ConflictError(
          "BID_VERSION_CONFLICT",
          `${bid.artisan.workshopName} vừa cập nhật chào giá (hiện là ${formatVnd(bid.offeredPricePerUnit)}/sp, ${bid.committedQuantity.toLocaleString("vi-VN")} sp). Vui lòng xem lại trước khi chốt.`,
          { bidId: bid.id, expectedVersion: sel.bidVersion, currentVersion: bid.version },
        );
      }
      if (sel.quantity > bid.committedQuantity) {
        throw new BadRequestError(`${bid.artisan.workshopName} chỉ nhận tối đa ${bid.committedQuantity.toLocaleString("vi-VN")} sản phẩm.`);
      }
      total += sel.quantity;
    }
    if (total !== quote.quantity) {
      throw new AppError(422, "QUANTITY_MISMATCH", `Tổng phân bổ ${total.toLocaleString("vi-VN")} chưa khớp số lượng yêu cầu ${quote.quantity.toLocaleString("vi-VN")}.`);
    }

    await transition(tx, quote, "accept", user.id,
      `Chốt ${input.selections.length} xưởng`);

    const batches: { batchCode: string; workshopName: string; quantity: number }[] = [];
    for (const sel of input.selections) {
      const bid = byId.get(sel.bidId)!;
      const locked = await tx.quoteBid.updateMany({
        where: { id: bid.id, version: sel.bidVersion, status: "PENDING" },
        data: { status: "ACCEPTED", allocatedQuantity: sel.quantity, version: { increment: 1 } },
      });
      if (locked.count === 0) throw new ConflictError("BID_VERSION_CONFLICT", `Chào giá của ${bid.artisan.workshopName} vừa thay đổi.`);

      const batchCode = await nextBatchCode(tx, quote.preferredGlaze);
      await tx.productBatch.create({
        data: {
          batchCode,
          artisanId: bid.artisanId,
          batchTitle: `${quote.title} – phần của ${bid.artisan.workshopName}`,
          glazeType: quote.preferredGlaze,
          quantityProduced: sel.quantity,
          allocatedQuantity: sel.quantity,
          quoteRequestId: quote.id,
          qrCodeDataUrl: await qrDataUrl(batchCode),
          productionStages: [],
        },
      });
      batches.push({ batchCode, workshopName: bid.artisan.workshopName, quantity: sel.quantity });
    }
    await tx.quoteBid.updateMany({
      where: { quoteRequestId: quote.id, id: { notIn: ids }, status: "PENDING" },
      data: { status: "REJECTED", version: { increment: 1 } },
    });
    await audit(user.id, "QUOTE_ACCEPTED", "QuoteRequest", quote.id, { selections: input.selections }, tx);

    return { quote, bids, ids, batches };
  });

  const winners = result.bids.filter((b) => result.ids.includes(b.id));
  const losers = result.bids.filter((b) => !result.ids.includes(b.id) && b.status === "PENDING");
  await notify(winners.map((b) => b.artisan.userId), {
    type: "BID_ACCEPTED",
    title: "Chào giá của bạn đã được chốt",
    body: `${result.quote.title}. Lô sản xuất có mã QR đã được tạo sẵn để ghi nhật ký.`,
    link: `/dashboard/artisan/batches`,
  });
  await notify(losers.map((b) => b.artisan.userId), {
    type: "BID_REJECTED",
    title: "Yêu cầu báo giá đã chốt với xưởng khác",
    body: result.quote.title,
    link: `/dashboard/artisan/quotes/${code}`,
  });
  await notifyAdmins({
    type: "QUOTE_ACCEPTED",
    title: "Đơn sỉ vừa được chốt phân bổ",
    body: `${result.quote.requestCode}: ${result.batches.map((b) => `${b.workshopName} ${b.quantity.toLocaleString("vi-VN")}`).join(", ")}`,
    link: `/dashboard/admin/coordination`,
  });
  return result.batches;
}

/* ------------------------------------------------------------------ Sản xuất, giao hàng, hủy */

/** BUYER_ACCEPTED → IN_PRODUCTION: BQL hoặc khách phát lệnh sản xuất. */
export async function startProduction(user: SessionUser, code: string, expectedVersion: number) {
  const quote = await runSerializable(async (tx) => {
    const q = await getQuoteOrThrow(tx, code);
    assertBuyerOwns(user, q);
    assertVersion(q, expectedVersion);
    await transition(tx, q, "startProduction", user.id);
    return q;
  });
  const batches = await prisma.productBatch.findMany({ where: { quoteRequestId: quote.id }, select: { artisanId: true } });
  await notifyArtisans(batches.map((b) => b.artisanId), {
    type: "PRODUCTION_STARTED",
    title: "Đơn sỉ đã vào sản xuất",
    body: `${quote.title}. Hãy cập nhật nhật ký lô để khách theo dõi tiến độ.`,
    link: `/dashboard/artisan/batches`,
  });
  await notify(quote.buyerId, { type: "PRODUCTION_STARTED", title: "Đơn hàng đã vào sản xuất", body: quote.title, link: `/b2b-quotes/${code}` });
}

/**
 * Tự chuyển sang IN_PRODUCTION khi hộ trúng thầu ghi mốc đầu tiên cho lô của đơn.
 * Idempotent: nếu đã chuyển rồi thì không làm gì.
 */
export async function autoStartProductionFromBatch(quoteRequestId: string, actorId: string) {
  await prisma.$transaction(async (tx) => {
    const moved = await tx.quoteRequest.updateMany({
      where: { id: quoteRequestId, status: "BUYER_ACCEPTED" },
      data: { status: "IN_PRODUCTION", version: { increment: 1 } },
    });
    if (moved.count === 1) {
      await tx.quoteStatusHistory.create({
        data: { quoteRequestId, fromStatus: "BUYER_ACCEPTED", toStatus: "IN_PRODUCTION", actorId, note: "Xưởng ghi mốc sản xuất đầu tiên" },
      });
    }
  });
}

/** IN_PRODUCTION → DELIVERED: khách xác nhận đã nhận đủ hàng. Mọi lô của đơn phải hoàn tất. */
export async function markDelivered(user: SessionUser, code: string, expectedVersion: number) {
  const quote = await runSerializable(async (tx) => {
    const q = await getQuoteOrThrow(tx, code);
    assertBuyerOwns(user, q);
    const pending = await tx.productBatch.count({ where: { quoteRequestId: q.id, status: { not: "COMPLETED" } } });
    if (pending > 0) {
      throw new ConflictError("BATCHES_NOT_COMPLETED", `Còn ${pending} lô sản xuất chưa hoàn tất nhật ký, chưa thể xác nhận giao hàng.`);
    }
    assertVersion(q, expectedVersion);
    await transition(tx, q, "deliver", user.id);
    return q;
  });
  const batches = await prisma.productBatch.findMany({ where: { quoteRequestId: quote.id }, select: { artisanId: true } });
  await notifyArtisans(batches.map((b) => b.artisanId), {
    type: "ORDER_DELIVERED",
    title: "Khách đã xác nhận nhận hàng",
    body: quote.title,
    link: `/dashboard/artisan/quotes/${code}`,
  });
}

export async function cancelQuote(user: SessionUser, code: string, expectedVersion: number, reason?: string) {
  if (!reason || reason.length < 5) throw new BadRequestError("Vui lòng nêu lý do hủy (ít nhất 5 ký tự).");
  const result = await runSerializable(async (tx) => {
    const q = await getQuoteOrThrow(tx, code);
    assertBuyerOwns(user, q);
    assertVersion(q, expectedVersion);
    await transition(tx, q, "cancel", user.id, reason);
    await tx.quoteRequest.update({ where: { id: q.id }, data: { cancelReason: reason } });
    await tx.quoteBid.updateMany({ where: { quoteRequestId: q.id, status: "PENDING" }, data: { status: "REJECTED" } });
    const invited = await tx.quoteInvitation.findMany({ where: { quoteRequestId: q.id }, select: { artisanId: true } });
    return { q, invited };
  });
  await notifyArtisans(result.invited.map((i) => i.artisanId), {
    type: "QUOTE_CANCELLED",
    title: "Yêu cầu báo giá đã bị hủy",
    body: `${result.q.title}. Lý do: ${reason}`,
  });
}

/** Admin (BQL) mời thêm hộ vào yêu cầu đang mở – điều phối thủ công. */
export async function inviteArtisans(admin: SessionUser, code: string, artisanIds: string[]) {
  const quote = await getQuoteOrThrow(prisma, code);
  if (!BIDDING_OPEN.includes(quote.status)) throw new ConflictError("QUOTE_LOCKED", "Chỉ mời thêm khi yêu cầu còn nhận chào giá.");
  await prisma.quoteInvitation.createMany({
    data: artisanIds.map((artisanId) => ({
      quoteRequestId: quote.id,
      artisanId,
      matchScore: 0,
      matchReasons: ["Ban quản lý mời trực tiếp"],
      invitedBy: "ADMIN",
    })),
    skipDuplicates: true,
  });
  await audit(admin.id, "QUOTE_INVITE", "QuoteRequest", quote.id, { artisanIds });
  await notifyArtisans(artisanIds, {
    type: "QUOTE_INVITED",
    title: "Ban quản lý mời bạn chào giá",
    body: quote.title,
    link: `/dashboard/artisan/quotes/${code}`,
  });
}

/* ------------------------------------------------------------------ Truy vấn */

/** Chi tiết yêu cầu theo vai trò: hộ nghề chỉ thấy chào giá của chính mình (đấu giá kín). */
export async function getQuoteForUser(user: SessionUser | null, code: string) {
  const quote = await prisma.quoteRequest.findUnique({
    where: { requestCode: code },
    include: {
      buyer: { select: { name: true, organization: true } },
      bids: {
        include: { artisan: { select: { id: true, slug: true, workshopName: true, ratingAvg: true, maxMonthlyCapacity: true, coverImage: true } } },
        orderBy: { offeredPricePerUnit: "asc" },
      },
      invitations: { include: { artisan: { select: { id: true, workshopName: true, slug: true } } } },
      allocatedBatches: {
        select: { id: true, batchCode: true, batchTitle: true, status: true, allocatedQuantity: true, productionStages: true, artisan: { select: { workshopName: true, slug: true } } },
      },
      history: { include: { actor: { select: { name: true, role: true } } }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!quote) throw new NotFoundError("Không tìm thấy yêu cầu báo giá.");

  const isOwner = user?.id === quote.buyerId;
  const isAdmin = user?.role === "ADMIN";
  const isArtisan = user?.role === "ARTISAN" && !!user.artisanId;
  const invitation = isArtisan ? quote.invitations.find((i) => i.artisanId === user!.artisanId) : undefined;

  if (!isOwner && !isAdmin && !invitation) throw new ForbiddenError("Bạn không có quyền xem yêu cầu này.");

  return {
    ...quote,
    bids: isOwner || isAdmin ? quote.bids : quote.bids.filter((b) => b.artisanId === user!.artisanId),
    viewer: { isOwner, isAdmin, isArtisan, invitation: invitation ?? null },
  };
}

export async function getAllocationSuggestion(user: SessionUser, code: string) {
  const quote = await prisma.quoteRequest.findUnique({
    where: { requestCode: code },
    include: { bids: { where: { status: "PENDING" }, include: { artisan: { select: { workshopName: true, ratingAvg: true } } } } },
  });
  if (!quote) throw new NotFoundError();
  assertBuyerOwns(user, quote);
  const suggestion = suggestAllocation(
    quote.quantity,
    quote.deadlineDays,
    quote.bids.map((b) => ({
      bidId: b.id,
      workshopName: b.artisan.workshopName,
      offeredPricePerUnit: b.offeredPricePerUnit,
      committedQuantity: b.committedQuantity,
      estimatedDays: b.estimatedDays,
      ratingAvg: b.artisan.ratingAvg,
    })),
  );
  const versions = Object.fromEntries(quote.bids.map((b) => [b.id, b.version]));
  return { ...suggestion, selections: suggestion.selections.map((s) => ({ ...s, bidVersion: versions[s.bidId] })) };
}
