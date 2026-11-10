import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { pendingReviews } from "@/lib/services/engagement-service";
import { formatDate } from "@/lib/format";
import { Card, EmptyState, PageHeader } from "@/components/ui/primitives";
import { ReviewForm } from "@/components/engagement/review-form";
import { Stars } from "@/components/engagement/stars";

export const metadata: Metadata = { title: "Đánh giá" };
export const dynamic = "force-dynamic";

export default async function AccountReviews() {
  const user = await pageRequireRole("/account/reviews", "BUYER");
  const [pending, mine] = await Promise.all([
    pendingReviews(user.id),
    prisma.review.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      include: { artisan: { select: { workshopName: true, slug: true } }, quoteRequest: { select: { requestCode: true } }, booking: { select: { code: true } } },
    }),
  ]);

  return (
    <>
      <PageHeader title="Đánh giá" description="Chỉ khách đã nhận hàng hoặc đã ghé xưởng mới được đánh giá, nên mỗi lời nhận xét đều có thật." />
      <div className="space-y-12">
        <section>
          <h2 className="label mb-4">Chờ bạn đánh giá ({pending.length})</h2>
          {pending.length === 0 ? (
            <p className="text-sm text-tro">Không có đơn hàng hay buổi trải nghiệm nào đang chờ đánh giá.</p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {pending.map((p, i) => (
                <Card key={`${p.ref}-${p.artisan.id}`} data-reveal style={{ ["--d" as string]: `${i * 60}ms` }} className="p-5">
                  <p className="text-xs text-tro">
                    {p.kind === "quote" ? "Đơn sỉ" : "Trải nghiệm"} <span className="code">{p.ref}</span> · {formatDate(p.date)}
                  </p>
                  <p className="mt-1 font-serif text-xl font-bold">{p.artisan.workshopName}</p>
                  <p className="mb-4 text-sm text-tro">{p.title}</p>
                  <ReviewForm
                    artisanId={p.artisan.id}
                    workshopName={p.artisan.workshopName}
                    quoteCode={p.kind === "quote" ? p.ref : undefined}
                    bookingCode={p.kind === "booking" ? p.ref : undefined}
                  />
                </Card>
              ))}
            </div>
          )}
        </section>
        <section>
          <h2 className="label mb-4">Đánh giá của bạn ({mine.length})</h2>
          {mine.length === 0 ? (
            <EmptyState icon={<Star />} title="Bạn chưa viết đánh giá nào" />
          ) : (
            <ul className="space-y-3">
              {mine.map((r) => (
                <li key={r.id}>
                  <Card className="p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Link href={`/artisans/${r.artisan.slug}#danh-gia`} className="font-serif text-xl font-bold hover:text-lam">{r.artisan.workshopName}</Link>
                      <Stars value={r.rating} />
                    </div>
                    <p className="mt-2">{r.comment}</p>
                    <p className="mt-2 text-xs text-tro">
                      {formatDate(r.createdAt)} ·{" "}
                      {r.quoteRequest ? (
                        <>đơn sỉ <span className="code">{r.quoteRequest.requestCode}</span></>
                      ) : (
                        <>trải nghiệm <span className="code">{r.booking?.code}</span></>
                      )}
                    </p>
                    {r.artisanReply && (
                      <div className="mt-3 rounded-[var(--radius-tile)] bg-datnung-nhat p-3 text-sm">
                        <p className="font-semibold text-datnung">Nghệ nhân trả lời</p>
                        <p className="mt-0.5">{r.artisanReply}</p>
                      </div>
                    )}
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
