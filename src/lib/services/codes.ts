import type { Prisma, PrismaClient } from "@prisma/client";

type Db = PrismaClient | Prisma.TransactionClient;

/**
 * Sinh mã tuần tự an toàn khi nhiều người tạo cùng lúc:
 * `upsert … value: { increment: 1 }` là thao tác nguyên tử trên mọi CSDL Prisma hỗ trợ.
 * Ví dụ: nextSequence(db, "batch-2026") → 7
 */
export async function nextSequence(db: Db, key: string): Promise<number> {
  const counter = await db.counter.upsert({
    where: { key },
    create: { key, value: 1 },
    update: { value: { increment: 1 } },
  });
  return counter.value;
}

const GLAZE_CODE: Record<string, string> = {
  MEN_RAN_CO: "RAN",
  MEN_LAM_CO: "LAM",
  MEN_NGOC: "NGC",
  MEN_HOA_BIEN: "HB",
  MEN_TRANG_NGA: "TN",
};

/** Mã lô: BT-2026-LAM-014 */
export async function nextBatchCode(db: Db, glaze: string): Promise<string> {
  const year = new Date().getFullYear();
  const seq = await nextSequence(db, `batch-${year}`);
  return `BT-${year}-${GLAZE_CODE[glaze] ?? "GOM"}-${String(seq).padStart(3, "0")}`;
}

/** Mã yêu cầu báo giá: RFQ-2026-0007 */
export async function nextQuoteCode(db: Db): Promise<string> {
  const year = new Date().getFullYear();
  const seq = await nextSequence(db, `rfq-${year}`);
  return `RFQ-${year}-${String(seq).padStart(4, "0")}`;
}
