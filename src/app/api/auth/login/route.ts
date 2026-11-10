import { withApi, ok, parseBody, assertSameOrigin } from "@/lib/http";
import { loginSchema, type Portal } from "@/lib/validators/auth";
import { authenticate } from "@/lib/services/auth-service";
import { createSession } from "@/lib/auth/session";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { AppError } from "@/lib/errors";

const PORTAL_ROLE = { customer: "BUYER", artisan: "ARTISAN", admin: "ADMIN" } as const;
const ROLE_PORTAL: Record<string, { portal: Portal; label: string; href: string }> = {
  BUYER: { portal: "customer", label: "tài khoản khách hàng", href: "/login" },
  ARTISAN: { portal: "artisan", label: "tài khoản nghệ nhân", href: "/login/artisan" },
  ADMIN: { portal: "admin", label: "tài khoản Ban quản lý", href: "/login/admin" },
};
const PORTAL_NAME: Record<Portal, string> = { customer: "Cổng khách hàng", artisan: "Cổng nghệ nhân", admin: "Cổng Ban quản lý" };

/**
 * POST /api/auth/login – đăng nhập qua một trong ba cổng riêng.
 * Mỗi cổng chỉ nhận đúng vai trò của nó; sai cổng thì báo cổng đúng thay vì tạo phiên.
 */
export const POST = withApi(async (req) => {
  assertSameOrigin(req);
  const input = await parseBody(req, loginSchema);
  rateLimit(`login:${clientIp(req)}:${input.email}`, 10, 15 * 60 * 1000);
  const user = await authenticate(input);
  if (user.role !== PORTAL_ROLE[input.portal]) {
    const right = ROLE_PORTAL[user.role];
    throw new AppError(
      403,
      "WRONG_PORTAL",
      `Đây là ${right.label}. Vui lòng đăng nhập tại ${PORTAL_NAME[right.portal]}.`,
      { portal: right.portal, href: right.href },
    );
  }
  await createSession(user.id);
  return ok({ id: user.id, name: user.name, role: user.role, status: user.status });
});
