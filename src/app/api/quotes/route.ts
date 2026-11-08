import { z } from "zod";
import { withApi, ok, assertSameOrigin } from "@/lib/http";
import { BadRequestError } from "@/lib/errors";
import { prisma } from "@/lib/db";
import { requireRole, requireUser } from "@/lib/auth/guards";
import { quoteCreateSchema } from "@/lib/validators/quote";
import { createQuote } from "@/lib/services/quotation-service";
import type { Prisma } from "@prisma/client";

/**
 * GET /api/quotes – danh sách yêu cầu theo vai trò:
 * khách thấy yêu cầu của mình, nghệ nhân thấy yêu cầu được mời, BQL thấy tất cả.
 */
export const GET = withApi(async () => {
  const user = await requireUser();
  const where: Prisma.QuoteRequestWhereInput =
    user.role === "ADMIN"
      ? {}
      : user.role === "ARTISAN"
        ? { invitations: { some: { artisanId: user.artisanId ?? "" } } }
        : { buyerId: user.id };
  const quotes = await prisma.quoteRequest.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true, requestCode: true, title: true, organizationName: true, quantity: true, status: true, version: true,
      preferredGlaze: true, targetBudgetPerUnit: true, deadlineDays: true, biddingClosesAt: true, createdAt: true,
      _count: { select: { bids: { where: { status: { not: "WITHDRAWN" } } }, invitations: true } },
      bids: user.role === "ARTISAN" ? { where: { artisanId: user.artisanId ?? "" }, select: { id: true, status: true, offeredPricePerUnit: true } } : false,
    },
  });
  return ok(quotes);
});

/** POST /api/quotes – khách sỉ tạo yêu cầu báo giá (lưu nháp hoặc gửi ngay). */
export const POST = withApi(async (req) => {
  assertSameOrigin(req);
  const user = await requireRole("BUYER", "ADMIN");
  // Đọc body một lần để lấy cả cờ `send` lẫn dữ liệu yêu cầu
  const body = await req.json().catch(() => {
    throw new BadRequestError("Body phải là JSON hợp lệ.");
  });
  const { send } = z.object({ send: z.boolean().default(true) }).parse(body);
  const input = quoteCreateSchema.parse(body);
  const result = await createQuote(user, input, send);
  return ok({ requestCode: result.quote.requestCode, status: result.quote.status, invited: result.invited }, { status: 201 });
});
