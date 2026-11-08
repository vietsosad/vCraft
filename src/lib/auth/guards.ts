import "server-only";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { getCurrentUser, type SessionUser } from "./session";

/** Dùng trong route handler: bắt buộc đăng nhập. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

/** Dùng trong route handler: bắt buộc đúng vai trò (RBAC). */
export async function requireRole(...roles: UserRole[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new ForbiddenError();
  return user;
}

/**
 * Bắt buộc là nghệ nhân. Với các thao tác công khai (đăng sản phẩm, chào giá)
 * còn yêu cầu hồ sơ đã được BQL duyệt – chống hàng nhái trà trộn.
 */
export async function requireArtisan(opts: { verified?: boolean } = {}) {
  const user = await requireRole("ARTISAN");
  if (!user.artisanId) throw new ForbiddenError("Tài khoản chưa có hồ sơ xưởng.");
  if (opts.verified && !user.artisanVerified) {
    throw new ForbiddenError("Hồ sơ xưởng đang chờ Ban quản lý duyệt, chưa thể thực hiện thao tác này.");
  }
  return user as SessionUser & { artisanId: string };
}

/** Dùng trong trang (server component): chưa đăng nhập thì chuyển tới /login?next=… */
export async function pageRequireRole(path: string, ...roles: UserRole[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(path)}`);
  if (roles.length && !roles.includes(user.role)) redirect(`/forbidden?from=${encodeURIComponent(path)}`);
  return user;
}
