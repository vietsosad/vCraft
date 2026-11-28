import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { pendingReviews } from "@/lib/services/engagement-service";
import { workedWorkshops } from "@/lib/services/buyer-zone";
import { formatDate } from "@/lib/format";
import { ReviewForm } from "@/components/engagement/review-form";
import { Stars } from "@/components/engagement/stars";
import { Band, BandHead } from "@/components/weave/band";
import { WovenBadge } from "@/components/weave/woven";

export const metadata: Metadata = { title: "Đánh giá" };
export const dynamic = "force-dynamic";

export default async function AccountReviews() {
  const user = await pageRequireRole("/account/reviews", "BUYER");
  const [pending, mine, worked] = await Promise.all([
    pendingReviews(user.id),
    prisma.review.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      include: { artisan: { select: { workshopName: true, slug: true } }, quoteRequest: { select: { requestCode: true } }, booking: { select: { code: true } } },
    }),
    workedWorkshops(user.id),
  ]);

  return (
    <div data-hue="n3">
      <BandHead
        hue="n3"
        title={pending.length ? "xưởng chờ bạn đánh giá" : "Đánh giá"}
        description="Chỉ khách đã nhận hàng hoặc đã ghé xưởng mới được đánh giá, nên mỗi lời nhận xét đều có thật."
        count={pending.length}
      />
      {worked.length > 0 && (
        <Band hue="n3" weight="light" tone="quiet" label="Xưởng đã làm việc cùng">
          <ul className="flex flex-wrap gap-x-8 gap-y-4">
            {worked.map((w) => (
              <li key={w.id}>
                <Link href={`/artisans/${w.slug}`} className="group flex items-center gap-3">
                  <WovenBadge name={w.workshopName} size={50} faded={w.rating === null} />
                  <span className="leading-tight">
                    <span className="block font-semibold underline decoration-vua underline-offset-4 group-hover:decoration-current">{w.workshopName}</span>
                    <span className="soft block text-xs">{[w.visited && "đã ghé", w.ordered && "đã đặt", w.rating !== null ? `bạn chấm ${w.rating}/5` : "chưa đánh giá"].filter(Boolean).join(" · ")}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Band>
      )}
      <div className="account-container space-y-12 pb-16 pt-8">
        <section aria-label="Chờ bạn đánh giá">
          <h2 className="mb-4 flex items-baseline gap-2">Chờ bạn đánh giá <span className="nhan text-tro">{pending.length}</span></h2>
          {pending.length === 0 ? (
            <p className="text-lg text-tro">Không có đơn hàng hay buổi trải nghiệm nào đang chờ đánh giá.</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {pending.map((p) => (
                <article id={`review-${p.ref}-${p.artisan.id}`} key={`${p.ref}-${p.artisan.id}`} className="patch p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-lg leading-snug">{p.artisan.workshopName}</h3>
                      <p className="text-sm text-tro">{p.title}</p>
                      <p className="mt-1 text-xs text-tro">
                        {p.kind === "quote" ? "Đơn sỉ" : "Buổi trải nghiệm"} <span className="code">{p.ref}</span> · {formatDate(p.date)}
                      </p>
                    </div>
                    <WovenBadge name={p.artisan.workshopName} size={52} tone="ink" faded className="text-chu-nau" />
                  </div>
                  <div className="mt-4 border-t border-dashed border-muc/15 pt-4">
                    <ReviewForm
                      artisanId={p.artisan.id}
                      workshopName={p.artisan.workshopName}
                      quoteCode={p.kind === "quote" ? p.ref : undefined}
                      bookingCode={p.kind === "booking" ? p.ref : undefined}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section aria-label="Lời bạn đã viết">
          <h2 className="mb-4 flex items-baseline gap-2">Lời bạn đã viết <span className="nhan text-tro">{mine.length}</span></h2>
          {mine.length === 0 ? (
            <p className="text-lg text-tro">Bạn chưa viết đánh giá nào.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {mine.map((r) => (
                <li key={r.id}>
                  <article className="patch h-full p-6">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/artisans/${r.artisan.slug}#danh-gia`} className="text-lg font-semibold leading-snug hover:underline">{r.artisan.workshopName}</Link>
                      <WovenBadge name={r.artisan.workshopName} size={44} tone="ink" />
                    </div>
                    <div className="mt-1"><Stars value={r.rating} /></div>
                    <p className="mt-3 leading-relaxed">“{r.comment}”</p>
                    <p className="mt-3 text-xs text-tro">
                      {formatDate(r.createdAt)} ·{" "}
                      {r.quoteRequest ? <>đơn sỉ <span className="code">{r.quoteRequest.requestCode}</span></> : <>trải nghiệm <span className="code">{r.booking?.code}</span></>}
                    </p>
                    {r.artisanReply && (
                      <div className="mt-4 bg-chu-nau/8 p-4 text-sm">
                        <p className="nhan text-chu-nau">Nghệ nhân trả lời</p>
                        <p className="mt-1">{r.artisanReply}</p>
                      </div>
                    )}
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
