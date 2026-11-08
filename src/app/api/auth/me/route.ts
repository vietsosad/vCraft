import { withApi, ok } from "@/lib/http";
import { getCurrentUser } from "@/lib/auth/session";

/** GET /api/auth/me – người dùng hiện tại (null nếu chưa đăng nhập). */
export const GET = withApi(async () => ok(await getCurrentUser()));
