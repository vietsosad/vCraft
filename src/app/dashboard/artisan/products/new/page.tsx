import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { ProductForm } from "@/components/artisan/product-form";

export default async function NewProductPage() {
  const user = await pageRequireRole("/dashboard/artisan/products/new", "ARTISAN");
  const batches = await prisma.productBatch.findMany({ where: { artisanId: user.artisanId! }, select: { id: true, batchCode: true, batchTitle: true }, orderBy: { createdAt: "desc" } });
  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-6 text-3xl">Thêm sản phẩm</h2>
      <ProductForm batches={batches} verified={user.artisanVerified} />
    </div>
  );
}
