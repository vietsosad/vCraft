import "server-only";
import { prisma } from "@/lib/db";

/** Một điểm dữ liệu theo ngày (giờ Việt Nam). */
export type DayPoint = { day: string; value: number };

/** Điền đủ các ngày trống bằng 0 để biểu đồ không bị "nhảy cóc". */
function fillDays(rows: { day: string; value: number }[], days: number): DayPoint[] {
  const map = new Map(rows.map((r) => [r.day, r.value]));
  const out: DayPoint[] = [];
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
  for (let i = days - 1; i >= 0; i--) {
    const day = fmt.format(new Date(Date.now() - i * 86_400_000));
    out.push({ day, value: map.get(day) ?? 0 });
  }
  return out;
}

const vnDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });

/** Lượt quét theo ngày (giờ Việt Nam). Gom nhóm trong mã thay vì SQL thô để không phụ thuộc hệ CSDL. */
async function scansByDay(days: number, artisanId?: string): Promise<DayPoint[]> {
  const since = new Date(Date.now() - days * 86_400_000);
  const rows = await prisma.scanEvent.findMany({
    where: { createdAt: { gte: since }, ...(artisanId ? { batch: { artisanId } } : {}) },
    select: { createdAt: true },
  });
  const counts = new Map<string, number>();
  for (const r of rows) {
    const k = vnDay.format(r.createdAt);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return fillDays([...counts].map(([day, value]) => ({ day, value })), days);
}

/** Số liệu cho khu làm việc của nghệ nhân. */
export async function artisanStats(artisanId: string) {
  const [scans, batches, bids, bookings, profile, products, favorites] = await Promise.all([
    scansByDay(30, artisanId),
    prisma.productBatch.findMany({ where: { artisanId }, select: { batchCode: true, batchTitle: true, scanCount: true, status: true }, orderBy: { scanCount: "desc" } }),
    prisma.quoteBid.findMany({ where: { artisanId }, select: { status: true, offeredPricePerUnit: true, allocatedQuantity: true } }),
    prisma.experienceBooking.groupBy({ by: ["status"], where: { artisanId }, _count: { _all: true }, _sum: { guests: true, totalVnd: true } }),
    prisma.artisanProfile.findUniqueOrThrow({ where: { id: artisanId }, select: { ratingAvg: true, ratingCount: true, maxMonthlyCapacity: true } }),
    prisma.product.count({ where: { artisanId, isPublished: true } }),
    prisma.favorite.count({ where: { OR: [{ artisanId }, { product: { artisanId } }] } }),
  ]);
  const accepted = bids.filter((b) => b.status === "ACCEPTED");
  const decided = bids.filter((b) => b.status === "ACCEPTED" || b.status === "REJECTED");
  const bookingCount = (s: string) => bookings.find((b) => b.status === s)?._count._all ?? 0;
  const guestsServed = bookings.find((b) => b.status === "COMPLETED")?._sum.guests ?? 0;
  return {
    scans,
    scansTotal: batches.reduce((s, b) => s + b.scanCount, 0),
    scans30: scans.reduce((s, d) => s + d.value, 0),
    topBatches: batches.slice(0, 5),
    bids: { total: bids.length, accepted: accepted.length, winRate: decided.length ? accepted.length / decided.length : null },
    wholesaleRevenue: accepted.reduce((s, b) => s + b.offeredPricePerUnit * (b.allocatedQuantity ?? 0), 0),
    bookings: {
      pending: bookingCount("PENDING"),
      confirmed: bookingCount("CONFIRMED"),
      completed: bookingCount("COMPLETED"),
      declined: bookingCount("DECLINED") + bookingCount("CANCELLED"),
      guestsServed,
      revenue: bookings.find((b) => b.status === "COMPLETED")?._sum.totalVnd ?? 0,
    },
    rating: { avg: profile.ratingAvg, count: profile.ratingCount },
    products,
    favorites,
  };
}

/** Số liệu toàn làng cho Ban quản lý. */
export async function villageStats() {
  const weeks = 8;
  const since = new Date(Date.now() - weeks * 7 * 86_400_000);
  const [scans, quotesByStatus, accepted, workshops, regs, bookings, topWorkshops] = await Promise.all([
    scansByDay(30),
    prisma.quoteRequest.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.quoteBid.findMany({ where: { status: "ACCEPTED" }, select: { offeredPricePerUnit: true, allocatedQuantity: true } }),
    prisma.artisanProfile.groupBy({ by: ["verificationStatus"], _count: { _all: true } }),
    prisma.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true, role: true } }),
    prisma.experienceBooking.groupBy({ by: ["status"], _count: { _all: true }, _sum: { guests: true } }),
    prisma.quoteBid.groupBy({ by: ["artisanId"], where: { status: "ACCEPTED" }, _sum: { allocatedQuantity: true }, orderBy: { _sum: { allocatedQuantity: "desc" } }, take: 5 }),
  ]);
  const names = await prisma.artisanProfile.findMany({ where: { id: { in: topWorkshops.map((t) => t.artisanId) } }, select: { id: true, workshopName: true } });

  // Tuần đăng ký: 8 cột, mỗi cột tách theo vai trò
  const weekKeys: string[] = [];
  const monday = (d: Date) => {
    const x = new Date(d);
    const day = (x.getUTCDay() + 6) % 7;
    x.setUTCDate(x.getUTCDate() - day);
    return x.toISOString().slice(0, 10);
  };
  for (let i = weeks - 1; i >= 0; i--) weekKeys.push(monday(new Date(Date.now() - i * 7 * 86_400_000)));
  const weekOf = (d: Date) => monday(new Date(`${vnDay.format(d)}T00:00:00Z`));
  const registrations = weekKeys.map((week) => ({
    week,
    BUYER: regs.filter((r) => r.role === "BUYER" && weekOf(r.createdAt) === week).length,
    ARTISAN: regs.filter((r) => r.role === "ARTISAN" && weekOf(r.createdAt) === week).length,
  }));

  return {
    scans,
    scans30: scans.reduce((s, d) => s + d.value, 0),
    quotesByStatus: Object.fromEntries(quotesByStatus.map((q) => [q.status, q._count._all])) as Record<string, number>,
    gmv: accepted.reduce((s, b) => s + b.offeredPricePerUnit * (b.allocatedQuantity ?? 0), 0),
    unitsAllocated: accepted.reduce((s, b) => s + (b.allocatedQuantity ?? 0), 0),
    workshops: Object.fromEntries(workshops.map((w) => [w.verificationStatus, w._count._all])) as Record<string, number>,
    registrations,
    bookings: Object.fromEntries(bookings.map((b) => [b.status, b._count._all])) as Record<string, number>,
    guests: bookings.reduce((s, b) => s + (b._sum.guests ?? 0), 0),
    topWorkshops: topWorkshops.map((t) => ({ name: names.find((n) => n.id === t.artisanId)?.workshopName ?? "—", units: t._sum.allocatedQuantity ?? 0 })),
  };
}

/* ---------------- Xuất CSV ---------------- */

function cell(v: unknown) {
  if (v === null || v === undefined) return "";
  const s = v instanceof Date ? v.toISOString() : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** CSV có BOM để Excel đọc đúng tiếng Việt. */
export function toCsv(headers: string[], rows: unknown[][]) {
  return "﻿" + [headers, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
}

export function csvResponse(filename: string, body: string) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
