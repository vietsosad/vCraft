import { z } from "zod";
import { withApi, ok, parseQuery } from "@/lib/http";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** Cache kết quả theo tọa độ làm tròn để tôn trọng giới hạn 1 yêu cầu/giây của Nominatim. */
const cache = new Map<string, string>();

/**
 * GET /api/geocode?lat=&lng= – đổi tọa độ thành địa chỉ (reverse geocoding) để tự điền ô địa chỉ.
 * Gọi qua server nên trình duyệt chỉ kết nối tới chính vCraft (giữ CSP connect-src 'self').
 */
export const GET = withApi(async (req) => {
  rateLimit(`geocode:${clientIp(req)}`, 20, 60 * 1000);
  const { lat, lng } = parseQuery(req, z.object({ lat: z.coerce.number().min(-90).max(90), lng: z.coerce.number().min(-180).max(180) }));
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (cache.has(key)) return ok({ address: cache.get(key) });

  let address = "";
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=vi&lat=${lat}&lon=${lng}`,
      { headers: { "User-Agent": "vCraftStudentProject/1.0 (educational demo)" }, signal: AbortSignal.timeout(4000) },
    );
    const json = await res.json();
    const a = json.address ?? {};
    address = [a.house_number, a.road, a.hamlet ?? a.quarter ?? a.neighbourhood, a.village ?? a.suburb ?? "Bát Tràng", a.county ?? "Gia Lâm", a.city ?? "Hà Nội"]
      .filter(Boolean)
      .join(", ");
  } catch {
    address = "";
  }
  if (!address) address = `Gần ${key}, xã Bát Tràng, Gia Lâm, Hà Nội`;
  cache.set(key, address);
  return ok({ address });
});
