import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware chạy trước mọi request tới khu cần đăng nhập.
 * Chỉ kiểm tra nhanh cookie phiên để chuyển sớm tới đúng cổng đăng nhập của khu:
 * /dashboard/admin → /login/admin, /dashboard/artisan → /login/artisan, /account → /login.
 * Việc xác thực phiên và kiểm tra vai trò thật sự diễn ra ở server (getCurrentUser, requireRole).
 */
export function middleware(req: NextRequest) {
  if (req.cookies.has("vcraft_session")) return NextResponse.next();
  const { pathname, search } = req.nextUrl;
  const url = req.nextUrl.clone();
  url.pathname = pathname.startsWith("/dashboard/admin")
    ? "/login/admin"
    : pathname.startsWith("/dashboard/artisan")
      ? "/login/artisan"
      : "/login";
  url.search = `?next=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*", "/account"],
};
