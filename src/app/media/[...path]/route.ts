import path from "node:path";
import fs from "node:fs/promises";
import { safeResolve } from "@/lib/services/storage";

export const runtime = "nodejs";

const ROOT = path.join(process.cwd(), "storage", "uploads");

/**
 * GET /media/... – phục vụ ảnh đã tối ưu.
 * Tên file chứa mã băm nội dung nên cache được vĩnh viễn (immutable).
 */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  const full = safeResolve(ROOT, parts.join("/"));
  if (!full || !full.endsWith(".webp")) return new Response("Not found", { status: 404 });
  try {
    const data = await fs.readFile(full);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
