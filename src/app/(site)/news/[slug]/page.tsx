import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { asImage } from "@/lib/types";
import { NEWS_CATEGORIES } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { VImage } from "@/components/ui/vimage";
import { NewsBody } from "@/components/news/news-body";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const n = await prisma.communityNews.findUnique({ where: { slug: (await params).slug } });
  return n ? { title: n.title, description: n.excerpt } : { title: "Không tìm thấy tin" };
}

export default async function NewsDetailPage({ params }: Props) {
  const n = await prisma.communityNews.findFirst({ where: { slug: (await params).slug, isPublished: true }, include: { author: { select: { name: true, organization: true } } } });
  if (!n) notFound();
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/news" className="text-sm text-tro hover:text-muc">← Bản tin làng</Link>
      <p className={`mt-8 text-sm font-semibold ${n.isUrgent ? "text-doson" : "text-tro"}`}>{n.isUrgent && "Khẩn · "}{NEWS_CATEGORIES[n.category]} · {formatDate(n.publishedAt)}</p>
      <h1 className="mt-3 font-serif text-4xl font-bold normal-case leading-tight md:text-5xl">{n.title}</h1>
      <p className="mt-4 text-lg text-tro">{n.excerpt}</p>
      <VImage image={asImage(n.coverImage)} ratio="16/9" priority sizes="(max-width: 768px) 100vw, 768px" className="tile mt-8" />
      <div className="mt-8"><NewsBody content={n.content} /></div>
      <p className="mt-10 border-t border-vua pt-4 text-sm text-tro">{n.author.name} · {n.author.organization}</p>
    </article>
  );
}
