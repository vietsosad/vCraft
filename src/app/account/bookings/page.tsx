import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { todayStartVn } from "@/lib/services/buyer-zone";
import { BookingActions } from "@/components/engagement/booking-actions";
import { BandHead } from "@/components/weave/band";
import { VisitPatch } from "@/components/weave/goods";

export const metadata: Metadata = { title: "Lịch hẹn nặn gốm" };
export const dynamic = "force-dynamic";

const MONTH = (d: Date) => `Tháng ${d.getUTCMonth() + 1}, ${d.getUTCFullYear()}`;

export default async function AccountBookings() {
  const user = await pageRequireRole("/account/bookings", "BUYER");
  const rows = await prisma.experienceBooking.findMany({
    where: { userId: user.id },
    orderBy: [{ visitDate: "desc" }, { slot: "asc" }],
    include: {
      artisan: { select: { workshopName: true, slug: true, address: true, phone: true, latitude: true, longitude: true } },
      review: { select: { id: true } },
    },
  });
  const today = todayStartVn();
  const upcoming = rows.filter((r) => r.visitDate >= today && (r.status === "PENDING" || r.status === "CONFIRMED")).reverse();
  const past = rows.filter((r) => !upcoming.includes(r));
  const months = new Map<string, typeof upcoming>();
  for (const b of upcoming) months.set(MONTH(b.visitDate), [...(months.get(MONTH(b.visitDate)) ?? []), b]);

  return (
    <div data-hue="n6">
      <BandHead
        hue="n6"
        title={upcoming.length ? "buổi hẹn sắp tới" : "Lịch hẹn"}
        description="Các buổi nặn gốm, vẽ men bạn đã đặt tại xưởng. Xưởng xác nhận trong ngày; bạn có thể thêm buổi hẹn vào lịch điện thoại và mở đường đi tới xưởng."
        count={upcoming.length}
        actions={<Link href="/map" className="btn-moc"><MapPin className="size-4" aria-hidden /> Đặt buổi mới</Link>}
      />
      <div className="mx-auto max-w-6xl space-y-12 px-4 pb-16 pt-10 md:px-8">
        {rows.length === 0 ? (
          <div className="patch max-w-2xl p-7">
            <h2>Chưa có buổi hẹn nào</h2>
            <p className="mt-2 text-tro">Vào gian trưng bày của một xưởng có lớp trải nghiệm, chọn ngày và khung giờ.</p>
            <Link href="/artisans" className="mt-5 inline-flex min-h-11 items-center gap-2 bg-nau px-5 font-semibold text-[#fbfaf5]"><CalendarDays className="size-4" aria-hidden /> Xem các xưởng</Link>
          </div>
        ) : (
          <>
            {upcoming.length === 0 ? (
              <p className="text-lg text-tro">Không có buổi nào sắp tới.</p>
            ) : (
              [...months.entries()].map(([m, list]) => (
                <section key={m} aria-label={m}>
                  <h2 className="mb-4 flex items-baseline gap-2">{m} <span className="nhan text-tro">{list.length} buổi</span></h2>
                  <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {list.map((b) => (
                      <li key={b.id}><VisitPatch b={b} actions={<BookingActions code={b.code} version={b.version} status={b.status} as="buyer" />} /></li>
                    ))}
                  </ul>
                </section>
              ))
            )}
            {past.length > 0 && (
              <section aria-label="Đã qua">
                <h2 className="mb-4 flex items-baseline gap-2">Đã qua hoặc đã đóng <span className="nhan text-tro">{past.length} buổi</span></h2>
                <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {past.map((b) => (
                    <li key={b.id}>
                      <VisitPatch
                        b={b}
                        actions={b.status === "COMPLETED" && !b.review ? <Link href="/account/reviews" className="inline-flex min-h-10 items-center bg-nghe px-4 text-sm font-semibold text-[#2a1d0c]">Viết đánh giá</Link> : undefined}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
