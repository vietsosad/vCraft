import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bell, CalendarDays, ClipboardList, FilePlus2, FileText, Heart, MapPin, QrCode, Star, Store } from "lucide-react";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { pendingReviews } from "@/lib/services/engagement-service";
import { buyerQuotes, todayStartVn, tracedBatches, workedWorkshops } from "@/lib/services/buyer-zone";
import { timeAgo } from "@/lib/format";
import { asImages } from "@/lib/types";
import { LaidPiece, OrderPatch, TracePatch, VisitPatch } from "@/components/weave/goods";
import { NotificationLink } from "@/components/account/notification-link";
import { WovenBadge } from "@/components/weave/woven";
import { bandVars } from "@/components/weave/loom";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Việc của tôi" };
export const dynamic = "force-dynamic";

export default async function WeaveHome() {
  const user = await pageRequireRole("/account", "BUYER");
  const today = todayStartVn();
  const [quotes, nextVisit, favorites, favCount, favWorkshops, favWorkshopCount, toReview, letters, unread, worked, traced, tracedTotal] = await Promise.all([
    buyerQuotes(user.id),
    prisma.experienceBooking.findFirst({
      where: { userId: user.id, status: { in: ["PENDING", "CONFIRMED"] }, visitDate: { gte: today } },
      orderBy: [{ visitDate: "asc" }, { slot: "asc" }],
      include: { artisan: { select: { workshopName: true, slug: true, address: true, latitude: true, longitude: true, phone: true } } },
    }),
    prisma.favorite.findMany({
      where: { userId: user.id, product: { isPublished: true } },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { product: { select: { slug: true, name: true, images: true } } },
    }),
    prisma.favorite.count({ where: { userId: user.id, product: { isPublished: true } } }),
    prisma.favorite.findMany({
      where: { userId: user.id, artisanId: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { artisan: { select: { id: true, slug: true, workshopName: true } } },
    }),
    prisma.favorite.count({ where: { userId: user.id, artisanId: { not: null } } }),
    pendingReviews(user.id),
    prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
    workedWorkshops(user.id),
    tracedBatches(user.id, 3),
    prisma.scanEvent.groupBy({ by: ["batchId"], where: { userId: user.id } }).then((rows) => rows.length),
  ]);

  const firstName = user.name.trim().split(/\s+/).at(-1);
  const running = quotes.filter((q) => q.status !== "DELIVERED" && q.status !== "CANCELLED");
  const waiting = running.filter((q) => q.next);
  const shown = [...running].sort((a, b) => Number(Boolean(b.next?.urgent)) - Number(Boolean(a.next?.urgent))).slice(0, 3);
  const tasks = [
    ...waiting.flatMap((q) => q.next ? [{
      key: q.id, href: `/account/quotes/${q.code}`, title: q.next.label, detail: q.title, icon: FileText, priority: q.next.urgent,
    }] : []),
    ...toReview.map((r) => ({
      key: `${r.kind}-${r.ref}-${r.artisan.id}`,
      href: `/account/reviews#review-${r.ref}-${r.artisan.id}`,
      title: `Đánh giá ${r.artisan.workshopName}`, detail: r.title, icon: Star, priority: false,
    })),
  ].sort((a, b) => Number(b.priority) - Number(a.priority));
  const taskPreview = tasks.slice(0, 4);
  const moreTasks = tasks.slice(taskPreview.length);
  const savedProducts = favorites.flatMap(({ product }) => product ? [product] : []);
  const savedWorkshops = favWorkshops.flatMap(({ artisan }) => artisan ? [artisan] : []);

  return (
    <div className="account-container det-home">
      <header className="account-hero" style={bandVars("n8", "dark")}>
        <div className="account-hero-content">
          <div className="account-hero-rule" aria-hidden><span /></div>
          <h1 className="giong-ke">{firstName ? `Chào ${firstName},` : "Chào bạn,"}</h1>
          {user.organization && <p className="account-hero-organization">{user.organization}</p>}
          <div className="account-hero-summary">
            <a href="#viec-cho-ban">{tasks.length ? `${tasks.length} việc chờ bạn` : "Không có việc chờ"}</a>
            <span aria-hidden>·</span>
            <Link href="/account/notifications">{unread ? `${unread} thư chưa đọc` : "Thư đã đọc hết"}</Link>
          </div>
          <div className="account-hero-actions">
            <Link href="/account/quotes/new" className="btn-moc" aria-label="Tạo yêu cầu báo giá"><FilePlus2 className="size-4 shrink-0" aria-hidden /> Yêu cầu báo giá</Link>
            <Link href="/scan" className="btn-soi"><QrCode className="size-4 shrink-0" aria-hidden /> Quét tem QR</Link>
          </div>
        </div>
        <figure className="account-hero-photo">
          <Image src="/seed/hands-trim.webp" alt="" fill priority sizes="(max-width: 671px) 100vw, (max-width: 1400px) 47vw, 630px" />
          <figcaption><span aria-hidden /> Trên bàn xoay Bát Tràng</figcaption>
        </figure>
      </header>

      <div className="account-home-grid">
        <section className="account-panel account-tasks" id="viec-cho-ban" aria-labelledby="account-tasks-title">
          <div className="account-panel-head">
            <div>
              <span className="account-panel-icon"><ClipboardList className="size-[18px]" aria-hidden /></span>
              <h2 id="account-tasks-title">Việc chờ bạn</h2>
              {tasks.length > 0 && <span className="account-panel-count">{tasks.length}</span>}
            </div>
          </div>
          {tasks.length > 0 ? (
            <>
              <ul className="account-task-list">
                {taskPreview.map((task) => (
                  <li key={task.key}>
                    <Link href={task.href} className="account-task">
                      <span className={cn("account-task-icon", task.priority && "account-task-priority")}><task.icon className="size-[17px]" aria-hidden /></span>
                      <span className="min-w-0">
                        <span className="account-task-title">{task.title}</span>
                        <span className="account-task-detail">{task.detail}</span>
                      </span>
                      <ArrowRight className="account-task-arrow size-4" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
              {moreTasks.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-x-4">
                  {moreTasks.some((task) => task.icon === FileText) && <Link href="/account/quotes?ngan=can-ban" className="account-link">Các đơn cần xử lý <ArrowRight className="size-4" aria-hidden /></Link>}
                  {moreTasks.some((task) => task.icon === Star) && <Link href="/account/reviews" className="account-link">Các lượt chờ đánh giá <ArrowRight className="size-4" aria-hidden /></Link>}
                </div>
              )}
            </>
          ) : <p className="account-empty">Bạn đã xử lý hết việc cần làm.</p>}
        </section>

        <section className="account-panel account-orders" aria-labelledby="account-orders-title">
          <div className="account-panel-head">
            <div>
              <span className="account-panel-icon"><FileText className="size-[18px]" aria-hidden /></span>
              <h2 id="account-orders-title">Đơn sỉ đang mở</h2>
              {running.length > 0 && <span className="account-panel-count">{running.length}</span>}
            </div>
            <Link href="/account/quotes?ngan=tat-ca" className="account-link">Tất cả đơn sỉ <ArrowRight className="size-4" aria-hidden /></Link>
          </div>
          {shown.length > 0 ? (
            <ul className="grid grid-cols-1 gap-2.5">
              {shown.map((quote) => <li key={quote.id}><OrderPatch q={quote} compact /></li>)}
            </ul>
          ) : (
            <div className="account-empty">
              <p>Chưa có yêu cầu báo giá đang mở.</p>
              <Link href="/account/quotes/new" className="account-link mt-1">Tạo yêu cầu báo giá <ArrowRight className="size-4" aria-hidden /></Link>
            </div>
          )}
        </section>

        <section className="account-panel account-visit" aria-labelledby="account-visit-title">
          <div className="account-panel-head">
            <div>
              <span className="account-panel-icon"><CalendarDays className="size-[18px]" aria-hidden /></span>
              <h2 id="account-visit-title">Lịch hẹn</h2>
            </div>
            <Link href="/account/bookings" className="account-link">Xem lịch <ArrowRight className="size-4" aria-hidden /></Link>
          </div>
          {nextVisit ? (
            <VisitPatch b={nextVisit} />
          ) : (
            <div className="account-empty">
              <p>Chưa có buổi nặn gốm sắp tới.</p>
              <Link href="/map" className="account-link mt-1"><MapPin className="size-4" aria-hidden /> Tìm xưởng có lớp</Link>
            </div>
          )}
        </section>

        <section className="account-panel account-letters" aria-labelledby="account-letters-title">
          <div className="account-panel-head">
            <div>
              <span className="account-panel-icon"><Bell className="size-[18px]" aria-hidden /></span>
              <h2 id="account-letters-title">Thư gần đây</h2>
            </div>
            <Link href="/account/notifications" className="account-link">Hộp thư <ArrowRight className="size-4" aria-hidden /></Link>
          </div>
          {letters.length > 0 ? (
            <ul className="account-task-list">
              {letters.map((letter) => (
                <li key={letter.id}>
                  <NotificationLink id={letter.id} href={letter.link ?? "/account/notifications"} read={!!letter.readAt} className="account-letter-preview">
                    <span className={cn("account-letter-dot", !letter.readAt && "is-unread")} aria-hidden />
                    <span className="min-w-0">
                      <span className={cn("block leading-snug", !letter.readAt && "font-semibold")}>{letter.title}</span>
                      <span className="mt-0.5 block text-xs text-tro">{!letter.readAt && "Chưa đọc · "}{timeAgo(letter.createdAt)}</span>
                    </span>
                    <ArrowRight className="account-task-arrow size-4" aria-hidden />
                  </NotificationLink>
                </li>
              ))}
            </ul>
          ) : <p className="account-empty">Chưa có thư nào.</p>}
        </section>

        <section className="account-panel account-saved" aria-labelledby="account-saved-title">
          <div className="account-panel-head">
            <div>
              <span className="account-panel-icon"><Heart className="size-[18px]" aria-hidden /></span>
              <h2 id="account-saved-title">Đã lưu</h2>
            </div>
            <Link href="/account/favorites" className="account-link">Xem bộ sưu tập <ArrowRight className="size-4" aria-hidden /></Link>
          </div>
          {!savedProducts.length && !savedWorkshops.length ? (
            <div className="account-empty">
              <p>Bấm trái tim trên tác phẩm hoặc trang xưởng để lưu vào đây.</p>
              <Link href="/products" className="account-link mt-1">Xem tác phẩm <ArrowRight className="size-4" aria-hidden /></Link>
            </div>
          ) : (
            <>
              <p className="mb-3 text-sm text-tro">{favCount} tác phẩm · {favWorkshopCount} xưởng</p>
              {savedProducts.length > 0 && <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {savedProducts.map((product) => (
                  <li key={product.slug}>
                    <LaidPiece href={`/products/${product.slug}`} name={product.name} image={asImages(product.images)[0]} sizes="(max-width: 640px) 40vw, 160px" showName />
                  </li>
                ))}
              </ul>}
              {savedWorkshops.length > 0 && <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                {savedWorkshops.map((workshop) => (
                  <li key={workshop.id}>
                    <Link href={`/artisans/${workshop.slug}`} className="account-link"><Store className="size-4 shrink-0" aria-hidden /> {workshop.workshopName}</Link>
                  </li>
                ))}
              </ul>}
            </>
          )}
        </section>

        <section className="account-panel account-traces" aria-labelledby="account-traces-title">
          <div className="account-panel-head">
            <div>
              <span className="account-panel-icon"><QrCode className="size-[18px]" aria-hidden /></span>
              <h2 id="account-traces-title">Sổ truy xuất</h2>
            </div>
            <Link href="/account/traces" className="account-link">Mở sổ <ArrowRight className="size-4" aria-hidden /></Link>
          </div>
          {traced.length > 0 ? (
            <>
              <p className="mb-3 text-sm text-tro">{tracedTotal} lô đã quét</p>
              <ul className="grid grid-cols-1 gap-2.5">
                {traced.map((batch) => <li key={batch.code}><TracePatch t={batch} compact /></li>)}
              </ul>
            </>
          ) : <p className="account-empty">Quét tem QR trên món gốm để lưu lại nhật ký sản xuất tại đây.</p>}
        </section>
      </div>

      {worked.length > 0 && (
        <section className="account-panel mt-4" aria-labelledby="account-worked-title">
          <div className="account-panel-head">
            <div>
              <span className="account-panel-icon"><Store className="size-[18px]" aria-hidden /></span>
              <h2 id="account-worked-title">Xưởng đã làm việc cùng</h2>
              <span className="account-panel-count">{worked.length}</span>
            </div>
            <Link href="/account/reviews" className="account-link">Xem đánh giá <ArrowRight className="size-4" aria-hidden /></Link>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            {worked.slice(0, 4).map((workshop) => (
              <li key={workshop.id} className="min-w-0">
                <Link href={`/artisans/${workshop.slug}`} className="account-link">
                  <WovenBadge name={workshop.workshopName} size={40} tone="ink" faded={workshop.rating === null} />
                  <span>{workshop.workshopName}{workshop.rating !== null && <span className="ml-2 text-xs text-tro">{workshop.rating}/5</span>}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
