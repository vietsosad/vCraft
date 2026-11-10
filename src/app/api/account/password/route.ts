import { withApi, ok, parseBody, assertSameOrigin } from "@/lib/http";
import { requireUser } from "@/lib/auth/guards";
import { changePasswordSchema } from "@/lib/validators/engagement";
import { changePassword } from "@/lib/services/account-service";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** POST /api/account/password – đổi mật khẩu và đăng xuất mọi thiết bị khác. */
export const POST = withApi(async (req) => {
  assertSameOrigin(req);
  const user = await requireUser();
  rateLimit(`pw:${clientIp(req)}:${user.id}`, 5, 15 * 60 * 1000);
  const input = await parseBody(req, changePasswordSchema);
  return ok(await changePassword(user.id, input.currentPassword, input.newPassword));
});
