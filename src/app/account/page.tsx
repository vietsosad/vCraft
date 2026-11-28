import type { Metadata } from "next";
import Link from "next/link";
import { FilePlus2, QrCode } from "lucide-react";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { pendingReviews } from "@/lib/services/engagement-service";
import { listWorkshops } from "@/lib/services/catalog-service";
import { buyerQuotes, todayStartVn, tracedBatches } from "@/lib/services/buyer-zone";
import { formatVnd } from "@/lib/format";
import { asImages } from "@/lib/types";
import { VillageScene } from "@/components/lang/village-scene";
import { VillageRoad, type Station } from "@/components/lang/village-road";
import {
  CONG_DOAN, KilnDial, LetterCard, OpenWorkshopRow, OrderCard, Passport, PotteryWheel, Shelf, TaskList, VisitCard,
  hoaDau, soChu, stageOf, visitWhen, type Task,
} from "@/components/lang/pieces";
import { ArrowGo } from "@/components/lang/glyphs";

export const metadata: Metadata = { title: "Việc chờ bạn" };
export const dynamic = "force-dynamic";

const nutChinh = "inline-flex min-h-[52px] items-center gap-2.5 rounded-[6px] bg-lam px-7 text-base font-semibold text-on shadow-[inset_0_1px_0_rgb(255_255_255/0.22),inset_0_-2px_0_rgb(0_0_0/0.12),var(--shadow-soft)] transition hover:bg-lam-sang active:translate-y-px";
const nutPhu = "inline-flex min-h-[52px] items-center gap-2.5 rounded-[6px] border border-muc/20 bg-su/75 px-7 text-base font-semibold text-muc backdrop-blur-sm transition hover:border-muc/45 hover:bg-su active:translate-y-px";
const tieuDe = "font-serif text-[1.75rem] font-bold leading-tight giong-ke md:text-[1.9rem]";
const lienKet = "inline-flex min-h-11 items-center gap-1.5 font-semibold text-lam hover:underline underline-offset-4";

/** Đường làng: một buổi dạo làng gốm, sáu điểm dừng là sáu việc của khách với làng. */
export default async function VillageHome() {
  const user = await pageRequireRole("/account", "BUYER");
  const today = todayStartVn();
  const [quotes, visits, lastVisit, favorites, favCount, favWorkshops, toReview, letters, unread, traced, tracedTotal, workshops] = await Promise.all([
    buyerQuotes(user.id),
    prisma.experienceBooking.findMany({
      where: { userId: user.id, status: { in: ["PENDING", "CONFIRMED"] }, visitDate: { gte: today } },
      orderBy: [{ visitDate: "asc" }, { slot: "asc" }],
      take: 2,
      include: { artisan: { select: { workshopName: true, slug: true, address: true, latitude: true, longitude: true, phone: true } } },
    }),
    prisma.experienceBooking.findFirst({
      where: { userId: user.id, status: "COMPLETED" },
      orderBy: [{ visitDate: "desc" }],
      include: { artisan: { select: { workshopName: true } } },
    }),
    prisma.favorite.findMany({
      where: { userId: user.id, product: { isPublished: true } },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { product: { select: { slug: true, name: true, images: true, priceVnd: true } } },
    }),
    prisma.favorite.count({ where: { userId: user.id, product: { isPublished: true } } }),
    prisma.favorite.findMany({
      where: { userId: user.id, artisanId: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { artisan: { select: { slug: true, workshopName: true } } },
    }),
    pendingReviews(user.id),
    prisma.notification.findMany({ where: { userId: user.id }, orderBy: [{ readAt: { sort: "asc", nulls: "first" } }, { createdAt: "desc" }], take: 3 }),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
    tracedBatches(user.id, 6),
    prisma.scanEvent.groupBy({ by: ["batchId"], where: { userId: user.id } }).then((r) => r.length),
    listWorkshops(),
  ]);

  const firstName = user.name.trim().split(/\s+/).at(-1) ?? user.name;
  const running = quotes.filter((q) => q.status !== "DELIVERED" && q.status !== "CANCELLED");
  const delivered = quotes.filter((q) => q.status === "DELIVERED");
  // gấp trước, rồi tới đơn có việc cho bạn; cùng mức thì mẻ đã đi xa hơn (nhiều công sức hơn) đứng trước
  const byUrgency = [...running].sort((a, b) =>
    Number(Boolean(b.next?.urgent)) - Number(Boolean(a.next?.urgent)) || Number(Boolean(b.next)) - Number(Boolean(a.next)) || stageOf(b.status) - stageOf(a.status));
  const featured = byUrgency[0];
  const shownRunning = byUrgency.slice(0, 3);
  const shownOrders = [...shownRunning, ...delivered.slice(0, 4 - shownRunning.length)];
  const nextVisit = visits[0];
  const openNow = workshops.filter((w) => w.openState.isOpenNow);
  const classes = workshops.filter((w) => w.experienceOffered).sort((a, b) => Number(b.openState.isOpenNow) - Number(a.openState.isOpenNow));
  const classesOpen = classes.filter((w) => w.openState.isOpenNow).length;

  // Việc chờ bạn: mỗi đơn có việc cần bạn làm, mỗi xưởng đang chờ lời đánh giá
  const tasks: Task[] = [
    ...byUrgency.flatMap((q) => (q.next ? [{ key: q.id, href: `/account/quotes/${q.code}`, title: q.next.label, detail: q.title, urgent: q.next.urgent, code: q.code }] : [])),
    ...toReview.map((r) => ({
      key: `${r.kind}-${r.ref}-${r.artisan.id}`,
      href: `/account/reviews#review-${r.ref}-${r.artisan.id}`,
      title: `Đánh giá ${r.artisan.workshopName}`,
      detail: r.title,
      urgent: false,
    })),
  ];
  const urgentCount = tasks.filter((t) => t.urgent).length;

  // Lời kể của bến làng, ghép từ việc thật
  const drafts = running.filter((q) => q.status === "DRAFT_REQUEST").length;
  const bidsToCompare = running.filter((q) => q.status === "ARTISANS_BIDDING" && q.next).reduce((s, q) => s + q.bids, 0);
  const toStart = running.filter((q) => q.status === "BUYER_ACCEPTED").length;
  const toConfirm = running.filter((q) => q.status === "IN_PRODUCTION" && q.next).length;
  const parts = [
    drafts && `${soChu(drafts)} bản nháp chưa gửi`,
    bidsToCompare && `${soChu(bidsToCompare)} chào giá cần so`,
    toStart && `${soChu(toStart)} đơn chờ lệnh sản xuất`,
    toConfirm && `${soChu(toConfirm)} đơn chờ bạn xác nhận nhận hàng`,
    toReview.length && `${soChu(toReview.length)} xưởng mong lời đánh giá`,
  ].filter(Boolean) as string[];
  const lead = tasks.length
    ? `${hoaDau(soChu(tasks.length))} việc chờ bạn trên đường làng hôm nay: ${parts.join(", ")}.${nextVisit ? ` Buổi nặn gốm kế tiếp: ${visitWhen(nextVisit.visitDate, nextVisit.slot)}.` : ""}`
    : nextVisit
      ? `Hôm nay không có việc nào chờ bạn. Buổi nặn gốm kế tiếp: ${visitWhen(nextVisit.visitDate, nextVisit.slot)} tại ${nextVisit.artisan.workshopName}.`
      : "Hôm nay không có việc nào chờ bạn. Cứ thong thả dạo làng: ghé xưởng đang mở lớp, hay lật đáy một món gốm để quét tem.";
  const compareQuote = running.find((q) => q.status === "ARTISANS_BIDDING" && q.bids > 0);

  const stations: Station[] = [
    { label: "Cổng làng", icon: "cong", sub: tasks.length ? `${tasks.length} việc chờ bạn` : "Không có việc chờ", count: urgentCount },
    { label: "Lò đơn sỉ", icon: "lo", sub: running.length ? `${running.length} đơn đang chạy` : "Chưa có đơn đang chạy", count: running.filter((q) => q.next).length },
    { label: "Bàn xoay", icon: "banxoay", sub: nextVisit ? `Hẹn ${nextVisit.visitDate.getUTCDate()}/${nextVisit.visitDate.getUTCMonth() + 1}` : classesOpen ? `${classesOpen} xưởng mở lớp` : "Hẹn buổi nặn gốm" },
    { label: "Kệ trưng bày", icon: "ke", sub: favCount ? `${favCount} tác phẩm đã lưu` : "Chưa bày món nào" },
    { label: "Nhà triện", icon: "trien", sub: tracedTotal ? `${tracedTotal} lô đã kiểm chứng` : "Chưa có triện nào" },
    { label: "Bến thư", icon: "thu", sub: unread ? `${unread} thư chưa đọc` : "Đã đọc hết thư", count: unread },
  ];

  const panels = [
    /* ---------- 1. Cổng làng: việc chờ bạn ---------- */
    <div key="cong" className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <div>
        <h2 className="flex items-baseline gap-3.5">
          <span className="font-display text-[4.2rem] leading-none text-lam dau-hieu">{tasks.length}</span>
          <span className={tieuDe}>{tasks.length ? "việc chờ bạn ở cổng làng" : "việc nào chờ bạn hôm nay"}</span>
        </h2>
        <p className="mt-3 max-w-md text-tro">
          {urgentCount > 0
            ? `Việc có dấu thoi đang giữ chân các xưởng, nên làm trước.${toReview.length ? " Việc dấu tròn là lời cảm ơn bạn còn nợ những người thợ." : ""}`
            : tasks.length
              ? "Không việc nào gấp. Những việc dấu tròn là lời cảm ơn bạn còn nợ những người thợ."
              : "Các xưởng đang làm phần của họ. Khi có chào giá mới hay việc cần bạn quyết, nó sẽ đứng ở cổng làng này."}
        </p>
        <Link href="/account/quotes" className={`mt-3 ${lienKet}`}>Mở lò đơn sỉ <ArrowGo className="size-4" /></Link>
      </div>
      {tasks.length ? (
        <div>
          <TaskList tasks={tasks.slice(0, 6)} />
          {tasks.length > 6 && <Link href="/account/quotes?ngan=can-ban" className={`mt-2 ${lienKet}`}>Còn {tasks.length - 6} việc nữa <ArrowGo className="size-4" /></Link>}
        </div>
      ) : (
        <div className="viec flex-col items-start gap-2 p-6">
          <p className="font-serif text-[1.3rem] font-bold giong-ke">Cổng làng thong thả</p>
          <p className="text-tro">Muốn đặt gốm số lượng lớn cho sự kiện? Gửi một yêu cầu, các xưởng có sở trường sẽ chào giá kín để bạn so.</p>
          <Link href="/account/quotes/new" className={`mt-1 ${lienKet}`}>Tạo yêu cầu báo giá <ArrowGo className="size-4" /></Link>
        </div>
      )}
    </div>,

    /* ---------- 2. Lò đơn sỉ ---------- */
    <div key="lo" className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
      {featured ? <KilnDial q={featured} /> : (
        <div className="ke-then flex flex-col items-center gap-3 rounded-[12px] p-8 text-center shadow-lift">
          <p className="font-serif text-[1.4rem] font-bold text-[#fffdf8] giong-ke">Lò đang nghỉ lửa</p>
          <p className="max-w-xs text-sm text-[#e6d9bf]">Chưa có đơn nào đang chạy. Một yêu cầu mới sẽ nhóm lửa lò này.</p>
          <Link href="/account/quotes/new" className="mt-1 inline-flex min-h-11 items-center gap-2 rounded-[6px] bg-[#f3dc9f] px-5 font-semibold text-[#1e1511] hover:bg-[#f7e6b8]">Tạo yêu cầu báo giá</Link>
        </div>
      )}
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className={tieuDe}>
            {running.length ? `${hoaDau(soChu(running.length))} mẻ đang chạy` : "Chưa có mẻ nào đang chạy"}
            {delivered.length ? `, ${soChu(delivered.length)} mẻ đã ra lò` : ""}
          </h2>
          <Link href="/account/quotes/new" className="inline-flex min-h-11 items-center gap-2 rounded-[6px] bg-datnung px-5 text-[15px] font-semibold text-on shadow-[inset_0_1px_0_rgb(255_255_255/0.22),inset_0_-2px_0_rgb(0_0_0/0.12)] hover:bg-datnung-dam">
            <FilePlus2 className="size-4" aria-hidden /> Tạo yêu cầu báo giá
          </Link>
        </div>
        {shownOrders.length > 0 && (
          <>
            <ol className="mt-4 grid grid-cols-6 gap-1.5 px-[17px] text-[12px] text-tro sm:text-[13px]" aria-hidden>
              {CONG_DOAN.map((c) => <li key={c} className="truncate">{c}</li>)}
            </ol>
            <ul className="mt-2 grid grid-cols-1 gap-2.5">
              {shownOrders.map((q, i) => <li key={q.id} className="gan-vien" style={{ animationDelay: `${i * 85}ms` }}><OrderCard q={q} compact /></li>)}
            </ul>
          </>
        )}
        {quotes.length > 0 && <Link href="/account/quotes?ngan=tat-ca" className={`mt-3 ${lienKet}`}>Xem cả {quotes.length} yêu cầu <ArrowGo className="size-4" /></Link>}
      </div>
    </div>,

    /* ---------- 3. Bàn xoay ---------- */
    <div key="banxoay" className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <div className="grid place-items-center rounded-[12px] bg-nga-dam p-3">
        <PotteryWheel id="lang-ban-xoay" className="w-full max-w-[300px]" />
      </div>
      <div>
        {nextVisit ? (
          <>
            <h2 className={tieuDe}>Bàn xoay hẹn bạn {visitWhen(nextVisit.visitDate, nextVisit.slot)}</h2>
            <div className="mt-4"><VisitCard b={nextVisit} /></div>
            {visits[1] && <p className="mt-3 text-sm text-tro">Sau đó: <span className="font-semibold text-muc">{visits[1].artisan.workshopName}</span>, {visitWhen(visits[1].visitDate, visits[1].slot)}.</p>}
          </>
        ) : (
          <>
            <h2 className={tieuDe}>Bàn xoay đang chờ đôi tay bạn</h2>
            <p className="mt-2 text-tro">
              Chưa có buổi nặn gốm nào sắp tới.
              {classesOpen
                ? ` Lúc này ${soChu(classesOpen)} xưởng còn mở lớp, mỗi buổi hai tiếng, nghệ nhân cầm tay chỉ việc.`
                : " Các xưởng mở lớp theo giờ của làng; đặt trước để giữ chỗ."}
            </p>
            {classes.length > 0 && (
              <ul className="mt-4 grid grid-cols-1 gap-2.5">
                {classes.slice(0, 2).map((w, i) => (
                  <OpenWorkshopRow key={w.slug} delay={i * 100} w={{ slug: w.slug, workshopName: w.workshopName, artisanName: w.artisanName, artisanTitle: w.artisanTitle, openLabel: w.openState.label, isOpenNow: w.openState.isOpenNow }} />
                ))}
              </ul>
            )}
          </>
        )}
        {lastVisit && <p className="mt-3 text-sm text-tro">Buổi gần nhất của bạn: {visitWhen(lastVisit.visitDate, lastVisit.slot)} tại {lastVisit.artisan.workshopName}, {lastVisit.guests} khách.</p>}
        <Link href="/account/bookings" className={`mt-2 ${lienKet}`}>Mở lịch nặn gốm <ArrowGo className="size-4" /></Link>
      </div>
    </div>,

    /* ---------- 4. Kệ trưng bày ---------- */
    <div key="ke">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className={tieuDe}>{favCount ? `${hoaDau(soChu(favCount))} món bạn đã bày lên kệ` : "Kệ của bạn còn trống"}</h2>
        <Link href={favCount ? "/account/favorites" : "/products"} className={lienKet}>{favCount ? "Mở kệ trưng bày" : "Vào phòng triển lãm"} <ArrowGo className="size-4" /></Link>
      </div>
      {favorites.length > 0 ? (
        <div className="mt-4">
          <Shelf items={favorites.flatMap(({ id, product }) => (product ? [{ key: id, href: `/products/${product.slug}`, name: product.name, image: asImages(product.images)[0], note: formatVnd(product.priceVnd) }] : []))} />
        </div>
      ) : (
        <p className="mt-2 max-w-xl text-tro">Trong phòng triển lãm, bấm trái tim trên tác phẩm bạn thương: món đó sẽ đứng trên kệ sơn then này.</p>
      )}
      {favWorkshops.length > 0 && (
        <p className="mt-4 text-sm text-tro">
          Xưởng bạn muốn quay lại:{" "}
          {favWorkshops.flatMap(({ id, artisan }, i) => (artisan ? [<span key={id}>{i > 0 && ", "}<Link href={`/artisans/${artisan.slug}`} className="font-semibold text-lam hover:underline">{artisan.workshopName}</Link></span>] : []))}.
        </p>
      )}
    </div>,

    /* ---------- 5. Nhà triện: hộ chiếu làng nghề ---------- */
    <Passport
      key="trien"
      stamps={traced}
      empty={Math.max(0, (traced.length < 3 ? 3 : Math.ceil(traced.length / 3) * 3) - traced.length)}
      left={
        <>
          <h2 className="font-serif text-[1.9rem] font-bold leading-tight giong-ke">
            {tracedTotal ? `Hộ chiếu làng nghề: ${firstName} đã kiểm chứng ${tracedTotal} lô gốm` : `Hộ chiếu làng nghề của ${firstName} còn trắng trang`}
          </h2>
          <p className="chu-so mt-3 max-w-md">Mỗi lần lật đáy món gốm và quét tem QR khi đã đăng nhập, Ban quản lý làng đóng một con triện vào sổ này: lô nào, của xưởng nào, ra lò ngày nào. Bấm vào triện để xem hành trình của lô.</p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link href="/scan" className="inline-flex min-h-11 items-center gap-2 rounded-[6px] bg-doson px-5 font-semibold text-on hover:bg-doson-dam"><QrCode className="size-4" aria-hidden /> Quét tem mới</Link>
            {tracedTotal > 0 && <Link href="/account/traces" className="inline-flex min-h-11 items-center rounded-[6px] px-5 font-semibold shadow-[inset_0_0_0_1px_rgb(28_26_23/0.3)]">Mở sổ truy xuất</Link>}
          </div>
        </>
      }
    />,

    /* ---------- 6. Bến thư ---------- */
    <div key="thu">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className={tieuDe}>{unread ? `${hoaDau(soChu(unread))} lá thư từ làng chưa đọc` : "Thư từ làng"}</h2>
        <Link href="/account/notifications" className={lienKet}>Mở bến thư <ArrowGo className="size-4" /></Link>
      </div>
      {letters.length ? (
        <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {letters.map((n, i) => <li key={n.id} className="gan-vien" style={{ animationDelay: `${i * 90}ms` }}><LetterCard n={n} /></li>)}
        </ul>
      ) : (
        <p className="mt-2 text-tro">Chưa có thư nào. Lời mời chào giá, lịch hẹn được xác nhận và tin từ Ban quản lý sẽ cập bến ở đây.</p>
      )}
    </div>,
  ];

  return (
    <>
      <VillageScene
        heading={<h1 className="chu-troi font-display text-[clamp(2.2rem,4.3vw,3.9rem)] leading-[0.98] text-[var(--hero-ink)] dau-hieu">Chào {firstName},<br /> làng gốm đang đợi bạn</h1>}
        lead={<p className="chu-troi font-serif giong-ke">{lead}</p>}
        actions={
          <>
            <a href="#duong-lang" className={nutChinh}>Đi dọc đường làng</a>
            {compareQuote ? (
              <Link href={`/account/quotes/${compareQuote.code}`} className={nutPhu}>So {soChu(compareQuote.bids)} chào giá</Link>
            ) : (
              <Link href="/account/quotes/new" className={nutPhu}><FilePlus2 className="size-4" aria-hidden /> Tạo yêu cầu báo giá</Link>
            )}
          </>
        }
        aside={
          <Link href="/map" className="flex items-center gap-3 rounded-[10px] border border-vua bg-su/90 py-3 pl-3 pr-4 text-muc shadow-soft backdrop-blur-sm transition hover:shadow-lift">
            <span className="tile tile-ngoc grid size-11 place-items-center text-giay">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 21h18M5 21V11l7-6 7 6v10" /><path d="M10 21v-5h4v5" /></svg>
            </span>
            <span className="flex flex-col leading-snug">
              <strong className="text-[15px]">{openNow.length ? `${openNow.length} xưởng đang mở cửa đón khách` : "Các xưởng đã đóng cửa nghỉ"}</strong>
              <span className="text-[13px] text-tro">{workshops.length} xưởng trong làng · xem bản đồ</span>
            </span>
          </Link>
        }
      />

      <section id="duong-lang" className="grout scroll-mt-24 py-14 md:py-[72px]" aria-labelledby="duong-lang-tieu-de">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
            <h2 id="duong-lang-tieu-de" className="max-w-[16ch] font-display text-[clamp(2rem,4vw,3.2rem)] leading-none dau-hieu">Đường làng hôm nay</h2>
            <p className="max-w-xl font-serif text-[1.2rem] leading-[1.5] text-tro giong-ke">Mỗi điểm dừng là một việc của bạn với làng. Chọn một điểm, người lữ khách đội nón lá sẽ theo con đường gạch đi tới đó.</p>
          </div>
          <VillageRoad stations={stations} panels={panels} />
        </div>
      </section>
    </>
  );
}
