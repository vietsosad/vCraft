import type { QuoteStatus } from "@prisma/client";

/** Chặng của một đơn sỉ theo máy trạng thái báo giá – dùng được cả phía server lẫn trình duyệt. */

/** Việc khách cần làm tiếp với một đơn sỉ, hoặc null nếu đang chờ phía xưởng/BQL. */
export type QuoteNextStep = { label: string; urgent: boolean } | null;

export function quoteNextStep(q: { status: QuoteStatus; bids: number; batchesOpen: number; batches: number }): QuoteNextStep {
  switch (q.status) {
    case "DRAFT_REQUEST":
      return { label: "Gửi yêu cầu cho các xưởng", urgent: true };
    case "ARTISANS_BIDDING":
      return q.bids > 0 ? { label: `So sánh ${q.bids} chào giá và chốt`, urgent: true } : null;
    case "BUYER_ACCEPTED":
      return { label: "Phát lệnh sản xuất", urgent: false };
    case "IN_PRODUCTION":
      return q.batches > 0 && q.batchesOpen === 0 ? { label: "Xác nhận đã nhận hàng", urgent: true } : null;
    default:
      return null;
  }
}

/** Năm chặng của một đơn sỉ, theo đúng máy trạng thái (bỏ bản nháp). */
export const ORDER_LEGS: { status: QuoteStatus; label: string }[] = [
  { status: "SENT_TO_ARTISANS", label: "Gửi xưởng" },
  { status: "ARTISANS_BIDDING", label: "Chào giá" },
  { status: "BUYER_ACCEPTED", label: "Chốt" },
  { status: "IN_PRODUCTION", label: "Đang làm" },
  { status: "DELIVERED", label: "Đã giao" },
];

export function legIndex(status: QuoteStatus) {
  if (status === "DRAFT_REQUEST") return -1;
  if (status === "CANCELLED") return -2;
  return ORDER_LEGS.findIndex((l) => l.status === status);
}
