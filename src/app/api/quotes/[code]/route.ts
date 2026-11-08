import { withApi, ok } from "@/lib/http";
import { getCurrentUser } from "@/lib/auth/session";
import { UnauthorizedError } from "@/lib/errors";
import { getQuoteForUser } from "@/lib/services/quotation-service";

/** GET /api/quotes/:code – chi tiết theo vai trò (hộ nghề chỉ thấy chào giá của mình). */
export const GET = withApi<{ params: Promise<{ code: string }> }>(async (_req, { params }) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return ok(await getQuoteForUser(user, (await params).code));
});
