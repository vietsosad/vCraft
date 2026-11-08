import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { asStages } from "@/lib/types";
import { BatchManager } from "@/components/artisan/batch-manager";

export const dynamic = "force-dynamic";

export default async function BatchDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const user = await pageRequireRole(`/dashboard/artisan/batches/${code}`, "ARTISAN");
  const batch = await prisma.productBatch.findUnique({
    where: { batchCode: code },
    include: { quoteRequest: { select: { requestCode: true, organizationName: true } }, artisan: { select: { workshopName: true } } },
  });
  // Lô của xưởng khác: trả 404 thay vì lộ sự tồn tại (chống IDOR)
  if (!batch || batch.artisanId !== user.artisanId) notFound();

  return (
    <BatchManager
      // Gắn lại component khi số mốc thay đổi để biểu mẫu tự gợi ý công đoạn kế tiếp
      key={`${asStages(batch.productionStages).length}-${batch.status}`}
      batch={{
        batchCode: batch.batchCode,
        batchTitle: batch.batchTitle,
        status: batch.status,
        lockedAt: batch.lockedAt?.toISOString() ?? null,
        quantityProduced: batch.quantityProduced,
        scanCount: batch.scanCount,
        qrCodeDataUrl: batch.qrCodeDataUrl,
        workshopName: batch.artisan.workshopName,
        quote: batch.quoteRequest,
        stages: asStages(batch.productionStages),
      }}
    />
  );
}
