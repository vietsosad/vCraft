import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { asImages } from "@/lib/types";
import { ProductForm } from "@/components/artisan/product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await pageRequireRole(`/dashboard/artisan/products/${id}`, "ARTISAN");
  // Điều kiện artisanId bảo đảm chỉ mở được sản phẩm của chính xưởng mình
  const [p, batches] = await Promise.all([
    prisma.product.findFirst({ where: { id, artisanId: user.artisanId! } }),
    prisma.productBatch.findMany({ where: { artisanId: user.artisanId! }, select: { id: true, batchCode: true, batchTitle: true }, orderBy: { createdAt: "desc" } }),
  ]);
  if (!p) notFound();
  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-6 text-3xl">Sửa sản phẩm</h2>
      <ProductForm
        id={p.id}
        batches={batches}
        verified={user.artisanVerified}
        initial={{
          name: p.name, category: p.category, glazeType: p.glazeType, priceVnd: p.priceVnd, dimensions: p.dimensions, firingTempC: p.firingTempC,
          glazeThickness: p.glazeThickness, story: p.story, images: asImages(p.images), isUniquePiece: p.isUniquePiece, stock: p.stock,
          isPublished: p.isPublished, currentBatchId: p.currentBatchId,
        }}
      />
    </div>
  );
}
