import type { Metadata } from "next";
import { CalendarDays, MapPin } from "lucide-react";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { todayStartVn } from "@/lib/services/cabinet-service";
import { ButtonLink } from "@/components/ui/button";
import { BookingActions } from "@/components/engagement/booking-actions";
import { DrawerHead, ShelfTitle } from "@/components/cabinet/drawer-head";
import { VisitTicket } from "@/components/cabinet/paper-goods";

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

  // Nhóm vé sắp tới theo tháng: lật ngăn như lật xấp vé
  const months = new Map<string, typeof upcoming>();
  for (const b of upcoming) months.set(MONTH(b.visitDate), [...(months.get(MONTH(b.visitDate)) ?? []), b]);

  return (
    <>
      <DrawerHead
        title="Lịch hẹn"
        description="Các buổi nặn gốm, vẽ men bạn đã đặt tại xưởng. Xưởng xác nhận trong ngày; bạn có thể thêm buổi hẹn vào lịch điện thoại và mở đường đi tới xưởng."
        actions={<ButtonLink href="/map" variant="outline"><MapPin className="size-4" aria-hidden /> Đặt buổi mới</ButtonLink>}
      />
      {rows.length === 0 ? (
        <div className="slip paper max-w-2xl p-6">
          <h2 className="font-serif text-2xl font-bold normal-case tracking-normal">Chưa có tấm vé nào</h2>
          <p className="mt-2 text-tro">Vào gian trưng bày của một xưởng có lớp trải nghiệm, chọn ngày và khung giờ. Tấm vé sẽ nằm trong ngăn này.</p>
          <ButtonLink href="/artisans" className="mt-5"><CalendarDays className="size-4" aria-hidden /> Xem các xưởng</ButtonLink>
        </div>
      ) : (
        <div className="space-y-12">
          <section aria-label="Sắp tới">
            {upcoming.length === 0 ? (
              <>
                <ShelfTitle count={0}>Sắp tới</ShelfTitle>
                <p className="font-serif text-lg text-tro">Không có buổi nào sắp tới.</p>
              </>
            ) : (
              [...months.entries()].map(([m, list]) => (
                <div key={m} className="mb-8 last:mb-0">
                  <ShelfTitle count={list.length}>{m}</ShelfTitle>
                  <ul className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    {list.map((b, i) => (
                      <li key={b.id} data-reveal style={{ ["--d" as string]: `${i * 60}ms` }}>
                        <VisitTicket b={b} actions={<BookingActions code={b.code} version={b.version} status={b.status} as="buyer" />} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </section>
          {past.length > 0 && (
            <section aria-label="Đã qua">
              <ShelfTitle count={past.length}>Vé đã dùng hoặc đã đóng</ShelfTitle>
              <ul className="grid grid-cols-1 gap-4 opacity-95 xl:grid-cols-2">
                {past.map((b, i) => (
                  <li key={b.id} data-reveal style={{ ["--d" as string]: `${Math.min(i, 6) * 50}ms` }}>
                    <VisitTicket
                      b={b}
                      actions={
                        b.status === "COMPLETED" && !b.review ? (
                          <ButtonLink href="/account/reviews" size="sm" variant="earth">Đóng dấu đánh giá</ButtonLink>
                        ) : undefined
                      }
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </>
  );
}
