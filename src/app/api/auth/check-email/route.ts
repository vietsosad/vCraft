import { withApi, ok, parseQuery } from "@/lib/http";
import { z } from "zod";
import { emailSchema } from "@/lib/validators/auth";
import { isEmailTaken } from "@/lib/services/auth-service";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** GET /api/auth/check-email?email= – kiểm tra bất đồng bộ khi người dùng rời ô email. */
export const GET = withApi(async (req) => {
  rateLimit(`check-email:${clientIp(req)}`, 30, 60 * 1000);
  const { email } = parseQuery(req, z.object({ email: emailSchema }));
  return ok({ available: !(await isEmailTaken(email)) });
});
