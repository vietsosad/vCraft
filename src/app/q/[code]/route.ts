import { NextResponse } from "next/server";
import { recordScan } from "@/lib/services/batch-service";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";

/**
 * GET /q/:code – link ngắn in trên tem QR.
 * Đếm lượt quét rồi chuyển hướng 302 tới trang truy xuất. Vì đích do server quyết định,
 * tem đã in vẫn dùng được kể cả khi sau này đổi cấu trúc URL của trang truy xuất.
 */
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const user = await getCurrentUser().catch(() => null);
  const found = await recordScan(code, user?.id);
  const target = new URL(found ? `/trace/${encodeURIComponent(code)}` : "/trace/not-found", req.url);
  return NextResponse.redirect(target, 302);
}
