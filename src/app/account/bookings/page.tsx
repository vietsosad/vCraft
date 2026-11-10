import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Phone } from "lucide-react";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { formatVnd } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/primitives";
import { BookingActions, BookingStatusBadge } from "@/components/engagement/booking-actions";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Lịch trải nghiệm" };
export const dynamic = "force-dynamic";

const DOW = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

type Row = Awaited<ReturnType<typeof load>>[number];

function load(userId: string) {
  return prisma.experienceBooking.findMany({
    where: { userId },
    orderBy: [{ visitDate: "desc" }, { slot: "asc" }],
    include: { artisan: { select: { workshopName: true, slug: true, address: true, phone: true } }, review: { select: { id: true } } },
  });
}

function BookingRow({ b, i }: { b: Row; i: number }) {
  return (
    <li data-reveal style={{ ["--d" as string]: `${i * 50}ms` }} className="tile flex flex-col gap-4 bg-su p-4 sm:flex-row sm:items-center">
      <div className={cn("tile grid size-20 shrink-0 place-items-center text-center leading-none", b.status === "CONFIRMED" ? "tile-lam text-giay" : "bg-lam-nhat text-lam")}>
        <span className="text-[10px] font-semibold">{DOW[b.visitDate.getUTCDay()]}</span>
        <span className="font-display text-3xl">{b.visitDate.getUTCDate()}</span>
        <span className="text-[10px] font-semibold">tháng {b.visitDate.getUTCMonth() + 1}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/artisans/${b.artisan.slug}`} className="font-serif text-xl font-bold hover:text-lam">{b.artisan.workshopName}</Link>
          <BookingStatusBadge status={b.status} />
        </div>
        <p className="mt-0.5 text-sm text-tro">
          <span className="code">{b.code}</span> · {b.slot} · {b.guests} khách · {formatVnd(b.totalVnd)}
        </p>
        <p className="text-sm text-tro">
          {b.artisan.address}
          {b.artisan.phone && (
            <>
              {" "}· <Phone className="inline size-3.5" aria-hidden /> {b.artisan.phone}
            </>
          )}
        </p>
        {b.artisanNote && <p className="mt-1 text-sm">Xưởng nhắn: “{b.artisanNote}”</p>}
      </div>
      <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
        <BookingActions code={b.code} version={b.version} status={b.status} as="buyer" />
        {b.status === "COMPLETED" && !b.review && <ButtonLink href="/account/reviews" size="sm" variant="earth">Viết đánh giá</ButtonLink>}
      </div>
    </li>
  );
}

export default async function AccountBookings() {
  const user = await pageRequireRole("/account/bookings", "BUYER");
  const rows = await load(user.id);
  const today = new Date(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date()) + "T00:00:00Z");
  const upcoming = rows.filter((r) => r.visitDate >= today && (r.status === "PENDING" || r.status === "CONFIRMED")).reverse();
  const past = rows.filter((r) => !upcoming.includes(r));

  return (
    <>
      <PageHeader
        title="Lịch trải nghiệm"
        description="Các buổi nặn gốm, vẽ men bạn đã đặt tại xưởng. Xưởng xác nhận trong ngày."
        actions={<ButtonLink href="/map" variant="outline"><CalendarDays className="size-4" /> Đặt buổi mới</ButtonLink>}
      />
      {rows.length === 0 ? (
        <EmptyState icon={<CalendarDays />} title="Chưa có lịch nào" description="Vào gian trưng bày của một xưởng có lớp trải nghiệm để chọn ngày và khung giờ." action={<ButtonLink href="/artisans">Xem các xưởng</ButtonLink>} />
      ) : (
        <div className="space-y-10">
          <section>
            <h2 className="label mb-3">Sắp tới ({upcoming.length})</h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-tro">Không có lịch nào sắp tới.</p>
            ) : (
              <ul className="space-y-2">{upcoming.map((b, i) => <BookingRow key={b.id} b={b} i={i} />)}</ul>
            )}
          </section>
          {past.length > 0 && (
            <section>
              <h2 className="label mb-3">Đã qua hoặc đã đóng ({past.length})</h2>
              <ul className="space-y-2">{past.map((b, i) => <BookingRow key={b.id} b={b} i={i} />)}</ul>
            </section>
          )}
        </div>
      )}
    </>
  );
}
