import { withApi, ok, parseBody, assertSameOrigin } from "@/lib/http";
import { forgotPasswordSchema } from "@/lib/validators/engagement";
import { requestPasswordReset } from "@/lib/services/account-service";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** POST /api/auth/forgot – luôn trả cùng một câu trả lời để không lộ email nào đã đăng ký. */
export const POST = withApi(async (req) => {
  assertSameOrigin(req);
  rateLimit(`forgot:${clientIp(req)}`, 5, 15 * 60 * 1000);
  const { email } = await parseBody(req, forgotPasswordSchema);
  const appUrl = (process.env.APP_URL ?? new URL(req.url).origin).replace(/\/$/, "");
  const { demoLink } = await requestPasswordReset(email, appUrl);
  return ok({ sent: true, demoLink });
});
