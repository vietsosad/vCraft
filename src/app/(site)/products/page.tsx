import type { Metadata } from "next";
import { RevealText } from "@/components/motion/reveal-text";
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { productQuerySchema } from "@/lib/validators/catalog";
import { listProducts } from "@/lib/services/catalog-service";
import { ProductExplorer } from "@/components/exhibition/product-explorer";
import { getCurrentUser } from "@/lib/auth/session";
import { favoriteIds } from "@/lib/services/engagement-service";

export const metadata: Metadata = {
  title: "Phòng triển lãm",
  description: "Tác phẩm gốm Bát Tràng theo phân loại, dòng men và hộ nghề – có tem truy xuất nguồn gốc.",
};

/** Trang đầu được render ở server (nhanh, thân thiện SEO); các lần lọc sau do client gọi API. */
export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const raw = await searchParams;
  const parsed = productQuerySchema.safeParse(raw);
  const query = parsed.success ? parsed.data : productQuerySchema.parse({});
  const [result, artisans] = await Promise.all([
    listProducts(query),
    prisma.artisanProfile.findMany({
      where: { verificationStatus: "APPROVED", user: { status: "ACTIVE" } },
      select: { slug: true, workshopName: true },
      orderBy: { workshopName: "asc" },
    }),
  ]);
  const user = await getCurrentUser();
  const favs = user?.role === "BUYER" ? (await favoriteIds(user.id)).products : [];

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 md:px-6">
      <RevealText as="h1" text="Tác phẩm của làng" className="title-lg block" />
      <p className="mt-3 max-w-2xl text-tro">
        Duyệt theo phân loại hoặc theo hộ gia đình. Tác phẩm gắn nhãn <span className="font-semibold text-ngoc">Có nhật ký lô</span> có nhật ký sản xuất
        đầy đủ từ ngày ngâm đất.
      </p>
      <div className="mt-10">
        <Suspense>
          <ProductExplorer
            initialItems={result.items}
            initialMeta={{ total: result.total, page: result.page, pageSize: result.pageSize, pageCount: result.pageCount }}
            artisans={artisans}
            favoriteIds={favs}
            canFav={!user ? "guest" : user.role === "BUYER"}
          />
        </Suspense>
      </div>
    </div>
  );
}
