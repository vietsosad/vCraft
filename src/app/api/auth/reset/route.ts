import { withApi, ok, parseBody, assertSameOrigin } from "@/lib/http";
import { resetPasswordSchema } from "@/lib/validators/engagement";
import { resetPassword } from "@/lib/services/account-service";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** POST /api/auth/reset – đặt mật khẩu mới bằng mã một lần, thu hồi mọi phiên cũ. */
export const POST = withApi(async (req) => {
  assertSameOrigin(req);
  rateLimit(`reset:${clientIp(req)}`, 10, 15 * 60 * 1000);
  const input = await parseBody(req, resetPasswordSchema);
  return ok(await resetPassword(input.token, input.newPassword));
});
