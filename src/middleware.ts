import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware chạy trước mọi request tới khu vực cần đăng nhập.
 * Chỉ kiểm tra nhanh sự tồn tại của cookie phiên để chuyển hướng sớm tới /login?next=…;
 * việc xác thực phiên và kiểm tra vai trò thật sự diễn ra ở server (getCurrentUser, requireRole).
 */
export function middleware(req: NextRequest) {
  const hasSession = req.cookies.has("vcraft_session");
  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/b2b-quotes/new", "/notifications"],
};
