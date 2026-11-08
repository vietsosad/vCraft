import { withApi, ok, parseBody, assertSameOrigin } from "@/lib/http";
import { registerArtisanSchema } from "@/lib/validators/auth";
import { registerArtisan } from "@/lib/services/auth-service";
import { createSession } from "@/lib/auth/session";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** POST /api/auth/register-artisan – gửi hồ sơ hộ nghề (trạng thái chờ BQL duyệt). */
export const POST = withApi(async (req) => {
  assertSameOrigin(req);
  rateLimit(`register:${clientIp(req)}`, 10, 60 * 60 * 1000);
  const input = await parseBody(req, registerArtisanSchema);
  const user = await registerArtisan(input);
  await createSession(user.id);
  return ok({ id: user.id, status: user.status, slug: user.artisanProfile?.slug }, { status: 201 });
});
