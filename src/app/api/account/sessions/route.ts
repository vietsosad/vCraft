import { withApi, ok } from "@/lib/http";
import { requireUser } from "@/lib/auth/guards";
import { listSessions } from "@/lib/services/account-service";

/** GET /api/account/sessions – các thiết bị đang đăng nhập. */
export const GET = withApi(async () => {
  const user = await requireUser();
  return ok(await listSessions(user.id));
});
