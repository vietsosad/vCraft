import path from "node:path";
import fs from "node:fs/promises";
import { safeResolve } from "@/lib/services/storage";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";

const ROOT = path.join(process.cwd(), "storage", "private");

/** GET /api/media/private/... – ảnh minh chứng hộ nghề, chỉ Ban quản lý được xem. */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return new Response("Forbidden", { status: 403 });
  const { path: parts } = await params;
  const full = safeResolve(ROOT, parts.join("/"));
  if (!full) return new Response("Not found", { status: 404 });
  try {
    const data = await fs.readFile(full);
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": "image/webp", "Cache-Control": "private, no-store" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
