import { withApi, ok } from "@/lib/http";
import { destroySession } from "@/lib/auth/session";

/** POST /api/auth/logout – thu hồi phiên hiện tại. */
export const POST = withApi(async () => {
  await destroySession();
  return ok({ loggedOut: true });
});
