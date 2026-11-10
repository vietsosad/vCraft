import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { PrintButton } from "@/components/trace/print-button";

/** Trang in tem QR khổ A4: lưới tem 40×50 mm, mỗi tem gồm QR, mã lô, tên xưởng và dấu BQL. */
export default async function LabelsPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const user = await pageRequireRole(`/dashboard/artisan/batches/${code}/labels`, "ARTISAN");
  const batch = await prisma.productBatch.findUnique({ where: { batchCode: code }, include: { artisan: { select: { workshopName: true } } } });
  if (!batch || batch.artisanId !== user.artisanId) notFound();
  const count = Math.min(batch.quantityProduced, 20);

  return (
    <div>
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-tro">Xem trước {count} tem cho lô {batch.batchCode}. Dùng giấy decal A4, in tỷ lệ 100%.</p>
        <PrintButton label="In tem" />
      </div>
      <div className="grid grid-cols-4 gap-[4mm] bg-su p-[8mm]" style={{ width: "210mm" }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex flex-col items-center justify-center border border-dashed border-muc/30 p-[2mm] text-center" style={{ width: "40mm", height: "50mm" }}>
            <Image src={batch.qrCodeDataUrl} alt="" width={110} height={110} unoptimized style={{ width: "30mm", height: "30mm" }} />
            <p className="mt-[1mm] font-mono text-[7pt] leading-tight">{batch.batchCode}</p>
            <p className="text-[6.5pt] leading-tight">{batch.artisan.workshopName}</p>
            <p className="mt-[0.5mm] border border-datnung px-[1mm] font-mono text-[5.5pt] uppercase text-datnung">BQL Bát Tràng xác thực</p>
          </div>
        ))}
      </div>
    </div>
  );
}
