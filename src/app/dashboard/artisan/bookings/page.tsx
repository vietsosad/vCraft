import type { Metadata } from "next";
import { CalendarDays, Download, Phone, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { formatVnd } from "@/lib/format";
import { EmptyState, PageHeader } from "@/components/ui/primitives";
import { BookingActions, BookingStatusBadge } from "@/components/engagement/booking-actions";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Lịch trải nghiệm" };
export const dynamic = "force-dynamic";

const DOW = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

/** Lịch khách đặt nặn gốm tại xưởng, nhóm theo ngày. Nghệ nhân xác nhận/từ chối/hoàn tất bằng một chạm. */
export default async function ArtisanBookings() {
  const user = await pageRequireRole("/dashboard/artisan/bookings", "ARTISAN");
  const artisanId = user.artisanId!;
  const [profile, rows] = await Promise.all([
    prisma.artisanProfile.findUniqueOrThrow({ where: { id: artisanId }, select: { experienceOffered: true, experienceCapacity: true, experiencePriceVnd: true, openingHours: true } }),
    prisma.experienceBooking.findMany({ where: { artisanId }, orderBy: [{ visitDate: "asc" }, { slot: "asc" }] }),
  ]);
  const today = new Date(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date()) + "T00:00:00Z");
  const upcoming = rows.filter((r) => r.visitDate >= today && (r.status === "PENDING" || r.status === "CONFIRMED"));
  const history = rows.filter((r) => !upcoming.includes(r)).reverse();
  const days = new Map<string, typeof rows>();
  for (const r of upcoming) {
    const k = r.visitDate.toISOString().slice(0, 10);
    days.set(k, [...(days.get(k) ?? []), r]);
  }
  const pending = upcoming.filter((r) => r.status === "PENDING").length;

  return (
    <>
      <PageHeader
        title="Lịch trải nghiệm"
        description={
          profile.experienceOffered
            ? `Lớp nặn gốm ${formatVnd(profile.experiencePriceVnd)}/khách, tối đa ${profile.experienceCapacity} khách mỗi khung 2 tiếng trong giờ mở cửa ${profile.openingHours}.`
            : "Xưởng chưa mở lớp trải nghiệm. Bật trong Hồ sơ xưởng để khách đặt lịch."
        }
        actions={<a href="/api/me/reports/bookings" download className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-tile)] border border-muc/20 bg-su/60 px-5 text-[15px] font-semibold hover:border-muc/45"><Download className="size-4" /> Xuất CSV</a>}
      />
      {pending > 0 && (
        <p className="mb-6 rounded-[var(--radius-tile)] bg-vangrom/15 px-4 py-3 text-sm">
          <strong>{pending} lịch hẹn</strong> đang chờ bạn xác nhận. Khách nhận thông báo ngay khi bạn trả lời.
        </p>
      )}
      {upcoming.length === 0 ? (
        <EmptyState icon={<CalendarDays />} title="Chưa có lịch hẹn sắp tới" description="Khi khách đặt buổi nặn gốm từ gian trưng bày của xưởng, lịch sẽ hiện ở đây." />
      ) : (
        <div className="space-y-8">
          {[...days.entries()].map(([day, list], di) => {
            const d = new Date(`${day}T00:00:00Z`);
            const guests = list.reduce((s, b) => s + b.guests, 0);
            return (
              <section key={day} data-reveal style={{ ["--d" as string]: `${di * 60}ms` }}>
                <h2 className="mb-3 flex items-baseline gap-3">
                  <span className="font-display text-2xl">{DOW[d.getUTCDay()]} {d.getUTCDate()}/{d.getUTCMonth() + 1}</span>
                  <span className="text-sm text-tro">{list.length} lịch · {guests} khách</span>
                </h2>
                <ul className="space-y-2">
                  {list.map((b) => (
                    <li key={b.id} className="tile flex flex-col gap-3 bg-su p-4 md:flex-row md:items-center">
                      <div className={cn("tile grid h-16 w-20 shrink-0 place-items-center text-center leading-none", b.status === "CONFIRMED" ? "tile-dat text-giay" : "bg-datnung-nhat text-datnung")}>
                        <span className="font-display text-2xl">{b.slot}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{b.contactName}</p>
                          <BookingStatusBadge status={b.status} />
                        </div>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-tro">
                          <span className="inline-flex items-center gap-1"><Users className="size-3.5" aria-hidden /> {b.guests} khách</span>
                          <a href={`tel:${b.contactPhone}`} className="inline-flex items-center gap-1 hover:text-muc"><Phone className="size-3.5" aria-hidden /> {b.contactPhone}</a>
                          <span>{formatVnd(b.totalVnd)}</span>
                          <span className="code">{b.code}</span>
                        </p>
                        {b.note && <p className="mt-1 text-sm">“{b.note}”</p>}
                      </div>
                      <BookingActions code={b.code} version={b.version} status={b.status} as="artisan" />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
      {history.length > 0 && (
        <section className="mt-12">
          <h2 className="label mb-3">Đã qua hoặc đã đóng ({history.length})</h2>
          <div className="relative overflow-x-auto rounded-[8px] border border-vua bg-su">
            <table className="w-full min-w-[620px] text-sm">
              <thead className="bg-nga-dam text-left text-xs font-semibold text-tro">
                <tr><th className="px-4 py-2.5">Ngày</th><th className="px-4 py-2.5">Khách</th><th className="px-4 py-2.5 text-right">Số khách</th><th className="px-4 py-2.5">Trạng thái</th></tr>
              </thead>
              <tbody className="divide-y divide-vua">
                {history.map((b) => (
                  <tr key={b.id}>
                    <td className="px-4 py-2.5 tabular">{b.visitDate.toISOString().slice(0, 10).split("-").reverse().join("/")} · {b.slot}</td>
                    <td className="px-4 py-2.5">{b.contactName}</td>
                    <td className="px-4 py-2.5 text-right tabular">{b.guests}</td>
                    <td className="px-4 py-2.5"><BookingStatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
