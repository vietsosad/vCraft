import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { todayStartVn } from "@/lib/services/buyer-zone";
import { listWorkshops } from "@/lib/services/catalog-service";
import { BookingActions } from "@/components/engagement/booking-actions";
import { LangHead, LIEN_KET, NUT, OpenWorkshopRow, PotteryWheel, VisitCard, hoaDau, soChu } from "@/components/lang/pieces";
import { ArrowGo } from "@/components/lang/glyphs";

export const metadata: Metadata = { title: "Bàn xoay – lịch nặn gốm" };
export const dynamic = "force-dynamic";

const MONTH = (d: Date) => `Tháng ${d.getUTCMonth() + 1}, ${d.getUTCFullYear()}`;
const nhom = "mb-4 flex flex-wrap items-baseline gap-x-3 font-serif text-[1.6rem] font-bold leading-tight giong-ke";

export default async function AccountBookings() {
  const user = await pageRequireRole("/account/bookings", "BUYER");
  const [rows, workshops] = await Promise.all([
    prisma.experienceBooking.findMany({
      where: { userId: user.id },
      orderBy: [{ visitDate: "desc" }, { slot: "desc" }],
      include: {
        artisan: { select: { workshopName: true, slug: true, address: true, phone: true, latitude: true, longitude: true } },
        review: { select: { id: true } },
      },
    }),
    listWorkshops({ experience: true }),
  ]);
  const today = todayStartVn();
  const upcoming = rows.filter((r) => r.visitDate >= today && (r.status === "PENDING" || r.status === "CONFIRMED")).reverse();
  const past = rows.filter((r) => !upcoming.includes(r));
  const months = new Map<string, typeof upcoming>();
  for (const b of upcoming) months.set(MONTH(b.visitDate), [...(months.get(MONTH(b.visitDate)) ?? []), b]);
  const classes = [...workshops].sort((a, b) => Number(b.openState.isOpenNow) - Number(a.openState.isOpenNow)).slice(0, 3);
  const pending = upcoming.filter((b) => b.status === "PENDING").length;

  return (
    <>
      <LangHead
        icon="banxoay"
        title={upcoming.length ? "buổi nặn gốm sắp tới" : "Bàn xoay"}
        count={upcoming.length}
        lead={
          <p>
            {pending > 0 ? `${hoaDau(soChu(pending))} buổi đang chờ xưởng xác nhận. ` : ""}
            Lưu buổi hẹn vào lịch của bạn, mở chỉ đường tới xưởng, hoặc đổi ý trước giờ hẹn.
          </p>
        }
        actions={<Link href="/map" className={NUT.lam}><MapPin className="size-4" aria-hidden /> Đặt buổi mới</Link>}
      />

      <div className="mx-auto max-w-7xl space-y-12 px-4 pb-16 pt-9 md:px-6">
        {upcoming.length > 0 ? (
          [...months.entries()].map(([m, list]) => (
            <section key={m} aria-labelledby={`thang-${m}`}>
              <h2 id={`thang-${m}`} className={nhom}>{m} <span className="font-sans text-sm font-semibold text-tro">{list.length} buổi</span></h2>
              <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {list.map((b, i) => (
                  <li key={b.id} className="gan-vien" style={{ animationDelay: `${i * 80}ms` }}>
                    <VisitCard b={b} actions={<BookingActions code={b.code} version={b.version} status={b.status} as="buyer" size="md" />} />
                  </li>
                ))}
              </ul>
            </section>
          ))
        ) : (
          <section className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]" aria-labelledby="ban-xoay-cho">
            <div className="grid place-items-center rounded-[12px] bg-nga-dam p-3">
              <PotteryWheel id="lang-ban-xoay-trang" className="w-full max-w-[280px]" />
            </div>
            <div>
              <h2 id="ban-xoay-cho" className="font-serif text-[1.9rem] font-bold leading-tight giong-ke">Bàn xoay đang chờ đôi tay bạn</h2>
              <p className="mt-2 max-w-xl text-tro">Mỗi buổi hai tiếng, nghệ nhân cầm tay chỉ việc từ lúc nhào đất đến khi vuốt xong hình; món bạn nặn được xưởng tráng men, nung và giữ lại cho bạn.</p>
              {classes.length > 0 && (
                <ul className="mt-5 grid grid-cols-1 gap-2.5">
                  {classes.map((w, i) => (
                    <OpenWorkshopRow key={w.slug} delay={i * 100} w={{ slug: w.slug, workshopName: w.workshopName, artisanName: w.artisanName, artisanTitle: w.artisanTitle, openLabel: w.openState.label, isOpenNow: w.openState.isOpenNow }} />
                  ))}
                </ul>
              )}
              <Link href="/artisans" className={`mt-3 ${LIEN_KET}`}>Xem mọi xưởng trong làng <ArrowGo className="size-4" /></Link>
            </div>
          </section>
        )}

        {past.length > 0 && (
          <section aria-labelledby="da-qua">
            <h2 id="da-qua" className={nhom}>Đã qua hoặc đã đóng <span className="font-sans text-sm font-semibold text-tro">{past.length} buổi</span></h2>
            <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {past.map((b) => (
                <li key={b.id}>
                  <VisitCard
                    b={b}
                    past
                    actions={b.status === "COMPLETED" && !b.review ? <Link href={`/account/reviews#review-${b.code}-${b.artisanId}`} className={`text-sm ${LIEN_KET}`}>Viết đánh giá <ArrowGo className="size-4" /></Link> : undefined}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
