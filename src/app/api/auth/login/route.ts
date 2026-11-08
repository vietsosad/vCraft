import { withApi, ok, parseBody, assertSameOrigin } from "@/lib/http";
import { loginSchema } from "@/lib/validators/auth";
import { authenticate } from "@/lib/services/auth-service";
import { createSession } from "@/lib/auth/session";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** POST /api/auth/login – đăng nhập, tạo phiên phía server. */
export const POST = withApi(async (req) => {
  assertSameOrigin(req);
  const input = await parseBody(req, loginSchema);
  rateLimit(`login:${clientIp(req)}:${input.email}`, 10, 15 * 60 * 1000);
  const user = await authenticate(input);
  await createSession(user.id);
  return ok({ id: user.id, name: user.name, role: user.role, status: user.status });
});
