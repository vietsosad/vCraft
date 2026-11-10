import type { Metadata } from "next";
import { Star } from "lucide-react";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { formatDate } from "@/lib/format";
import { Card, EmptyState, PageHeader } from "@/components/ui/primitives";
import { Stars } from "@/components/engagement/stars";
import { ReplyForm } from "@/components/engagement/review-form";
import { BarList } from "@/components/charts/charts";

export const metadata: Metadata = { title: "Đánh giá của khách" };
export const dynamic = "force-dynamic";

export default async function ArtisanReviews() {
  const user = await pageRequireRole("/dashboard/artisan/reviews", "ARTISAN");
  const artisanId = user.artisanId!;
  const [profile, reviews] = await Promise.all([
    prisma.artisanProfile.findUniqueOrThrow({ where: { id: artisanId }, select: { ratingAvg: true, ratingCount: true } }),
    prisma.review.findMany({
      where: { artisanId },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true } }, quoteRequest: { select: { requestCode: true } }, booking: { select: { code: true, guests: true } } },
    }),
  ]);
  const dist = [5, 4, 3, 2, 1].map((s) => ({ label: `${s} sao`, value: reviews.filter((r) => r.rating === s).length }));

  return (
    <>
      <PageHeader title="Đánh giá của khách" description="Chỉ khách đã nhận hàng hoặc đã ghé xưởng mới đánh giá được. Một lời đáp chân thành giữ chân khách quay lại." />
      {reviews.length === 0 ? (
        <EmptyState icon={<Star />} title="Chưa có đánh giá nào" description="Sau buổi trải nghiệm đầu tiên hoặc đơn sỉ đầu tiên được giao, khách sẽ được mời đánh giá xưởng." />
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr]">
          <Card className="h-fit p-6 lg:sticky lg:top-24">
            <p className="font-display text-6xl leading-none">{profile.ratingAvg.toFixed(1)}</p>
            <Stars value={profile.ratingAvg} size="md" className="mt-2" />
            <p className="mt-1 text-sm text-tro">{profile.ratingCount} lượt đánh giá</p>
            <div className="mt-6">
              <BarList label="Phân bố số sao" color="var(--chart-4)" items={dist} />
            </div>
          </Card>
          <ul className="space-y-3">
            {reviews.map((r, i) => (
              <li key={r.id} data-reveal style={{ ["--d" as string]: `${i * 50}ms` }}>
                <Card className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{r.author.name}</p>
                    <Stars value={r.rating} />
                  </div>
                  <p className="mt-0.5 text-xs text-tro">
                    {formatDate(r.createdAt)} · {r.quoteRequest ? <>đơn sỉ <span className="code">{r.quoteRequest.requestCode}</span></> : <>trải nghiệm <span className="code">{r.booking?.code}</span>, {r.booking?.guests} khách</>}
                  </p>
                  <p className="mt-3">{r.comment}</p>
                  <div className="mt-4">
                    {r.artisanReply ? (
                      <div className="rounded-[var(--radius-tile)] bg-datnung-nhat p-3 text-sm">
                        <p className="font-semibold text-datnung">Lời đáp của xưởng</p>
                        <p className="mt-0.5">{r.artisanReply}</p>
                      </div>
                    ) : (
                      <ReplyForm reviewId={r.id} />
                    )}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
