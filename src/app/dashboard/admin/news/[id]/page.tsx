import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { asImage } from "@/lib/types";
import { NewsEditor } from "@/components/admin/news-editor";

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const n = await prisma.communityNews.findUnique({ where: { id: (await params).id } });
  if (!n) notFound();
  return (
    <div>
      <h2 className="mb-6 text-3xl">Sửa tin</h2>
      <NewsEditor id={n.id} initial={{ title: n.title, category: n.category, excerpt: n.excerpt, content: n.content, coverImage: asImage(n.coverImage), isUrgent: n.isUrgent, isPublished: n.isPublished }} />
    </div>
  );
}
