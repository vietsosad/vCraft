import { withApi, ok, parseBody, assertSameOrigin } from "@/lib/http";
import { registerBuyerSchema } from "@/lib/validators/auth";
import { registerBuyer } from "@/lib/services/auth-service";
import { createSession } from "@/lib/auth/session";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** POST /api/auth/register – đăng ký khách hàng và tự đăng nhập. */
export const POST = withApi(async (req) => {
  assertSameOrigin(req);
  rateLimit(`register:${clientIp(req)}`, 10, 60 * 60 * 1000);
  const input = await parseBody(req, registerBuyerSchema);
  const user = await registerBuyer(input);
  await createSession(user.id);
  return ok({ id: user.id, name: user.name, role: user.role }, { status: 201 });
});
