import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { qrPng, qrSvg } from "@/lib/services/qr";

export const runtime = "nodejs";

/** GET /api/me/batches/:code/qr?format=svg|png – tải mã QR để in tem (chủ xưởng hoặc BQL). */
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const user = await getCurrentUser();
  const { code } = await params;
  const batch = await prisma.productBatch.findUnique({ where: { batchCode: code }, select: { artisanId: true } });
  if (!user || !batch || (user.role !== "ADMIN" && batch.artisanId !== user.artisanId)) {
    return new Response("Not found", { status: 404 });
  }
  const format = new URL(req.url).searchParams.get("format") === "png" ? "png" : "svg";
  const body = format === "png" ? new Uint8Array(await qrPng(code)) : await qrSvg(code);
  return new Response(body, {
    headers: {
      "Content-Type": format === "png" ? "image/png" : "image/svg+xml",
      "Content-Disposition": `attachment; filename="${code}.${format}"`,
    },
  });
}
