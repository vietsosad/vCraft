import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const CACHE_DIR = path.join(process.cwd(), "storage", "tiles");
const UPSTREAMS = (process.env.MAP_TILE_UPSTREAMS ?? "https://tile.openstreetmap.org,https://tile.openstreetmap.de")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/**
 * GET /tiles/:z/:x/:y.png – proxy tile bản đồ có bộ đệm trên đĩa.
 * - Trình duyệt chỉ tải ảnh từ chính vCraft (CSP giữ img-src 'self').
 * - Thử lần lượt nhiều nguồn OSM (một số mạng chặn tile.openstreetmap.org).
 * - Tile đã xem được lưu lại nên bản đồ vẫn hiện khi mất mạng lúc demo.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ z: string; x: string; y: string }> }) {
  const { z, x, y } = await params;
  const zi = Number(z), xi = Number(x), yi = Number.parseInt(y, 10);
  const max = 2 ** zi;
  if (![zi, xi, yi].every(Number.isInteger) || zi < 0 || zi > 19 || xi < 0 || yi < 0 || xi >= max || yi >= max) {
    return new Response("Bad tile", { status: 400 });
  }
  const file = path.join(CACHE_DIR, String(zi), String(xi), `${yi}.png`);
  const headers = { "Content-Type": "image/png", "Cache-Control": "public, max-age=604800" };

  const cached = await fs.readFile(file).catch(() => null);
  if (cached) return new Response(new Uint8Array(cached), { headers });

  for (const base of UPSTREAMS) {
    try {
      const res = await fetch(`${base}/${zi}/${xi}/${yi}.png`, {
        headers: { "User-Agent": "vCraftStudentProject/1.0 (educational demo)" },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok || !res.headers.get("content-type")?.startsWith("image/")) continue;
      const data = Buffer.from(await res.arrayBuffer());
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, data);
      return new Response(new Uint8Array(data), { headers });
    } catch {
      /* thử nguồn tiếp theo */
    }
  }
  return new Response("Tile unavailable", { status: 502 });
}
