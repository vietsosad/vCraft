import { withApi } from "@/lib/http";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { SLOT_MINUTES } from "@/lib/services/engagement-service";
import { formatVnd } from "@/lib/format";

export const runtime = "nodejs";

/** Thoát ký tự theo RFC 5545 (dấu phẩy, chấm phẩy, xuống dòng). */
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** Gập dòng dài hơn 75 byte (UTF-8) – lịch Apple/Google từ chối dòng quá dài. */
function fold(line: string) {
  const out: string[] = [];
  let cur = "";
  let bytes = 0;
  for (const ch of line) {
    const b = Buffer.byteLength(ch);
    if (bytes + b > 73) {
      out.push(cur);
      cur = " ";
      bytes = 1;
    }
    cur += ch;
    bytes += b;
  }
  out.push(cur);
  return out.join("\r\n");
}

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/**
 * GET /api/bookings/:code/ics – tải buổi trải nghiệm về lịch điện thoại/máy tính.
 * Chỉ người đặt (hoặc xưởng nhận khách) tải được. Giờ Việt Nam UTC+7, không đổi giờ mùa hè.
 */
export const GET = withApi<{ params: Promise<{ code: string }> }>(async (req, { params }) => {
  const user = await requireUser();
  const code = (await params).code;
  const b = await prisma.experienceBooking.findUnique({
    where: { code },
    include: { artisan: { select: { userId: true, workshopName: true, address: true, latitude: true, longitude: true, phone: true } } },
  });
  if (!b) throw new NotFoundError("Không tìm thấy lịch này.");
  if (b.userId !== user.id && b.artisan.userId !== user.id) throw new ForbiddenError();

  const [h, m] = b.slot.split(":").map(Number);
  const start = new Date(b.visitDate.getTime() + ((h! - 7) * 60 + m!) * 60_000);
  const end = new Date(start.getTime() + SLOT_MINUTES * 60_000);
  const origin = new URL(req.url).origin;
  const desc = [
    `Mã lịch ${b.code} · ${b.guests} khách · ${formatVnd(b.totalVnd)}`,
    b.status === "CONFIRMED" ? "Xưởng đã xác nhận." : "Đang chờ xưởng xác nhận.",
    b.artisan.phone ? `Điện thoại xưởng: ${b.artisan.phone}` : "",
    b.note ? `Ghi chú: ${b.note}` : "",
  ].filter(Boolean).join("\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//vCraft//Lang gom Bat Trang//VI",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${b.code}@vcraft`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(`Nặn gốm tại ${b.artisan.workshopName}`)}`,
    `LOCATION:${esc(b.artisan.address)}`,
    `GEO:${b.artisan.latitude};${b.artisan.longitude}`,
    `DESCRIPTION:${esc(desc)}`,
    `URL:${origin}/account/bookings`,
    `STATUS:${b.status === "CONFIRMED" ? "CONFIRMED" : b.status === "PENDING" ? "TENTATIVE" : "CANCELLED"}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "TRIGGER:-PT2H",
    `DESCRIPTION:${esc(`Còn 2 giờ nữa tới buổi nặn gốm tại ${b.artisan.workshopName}`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return new Response(lines.map(fold).join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="vcraft-${b.code}.ics"`,
      "Cache-Control": "private, no-store",
    },
  });
});
