import type { QuoteStatus } from "@prisma/client";

/**
 * Máy trạng thái báo giá (State pattern dạng bảng chuyển trạng thái).
 *
 *   DRAFT_REQUEST → SENT_TO_ARTISANS → ARTISANS_BIDDING → BUYER_ACCEPTED → IN_PRODUCTION → DELIVERED
 *         └───────────────┴──────────────────┴──→ CANCELLED
 *
 * Mọi thay đổi trạng thái trong hệ thống đều phải đi qua bảng này.
 */
export type QuoteEvent = "send" | "receiveBid" | "accept" | "startProduction" | "deliver" | "cancel";

export const QUOTE_TRANSITIONS: Record<QuoteStatus, Partial<Record<QuoteEvent, QuoteStatus>>> = {
  DRAFT_REQUEST: { send: "SENT_TO_ARTISANS", cancel: "CANCELLED" },
  SENT_TO_ARTISANS: { receiveBid: "ARTISANS_BIDDING", cancel: "CANCELLED" },
  ARTISANS_BIDDING: { accept: "BUYER_ACCEPTED", cancel: "CANCELLED" },
  BUYER_ACCEPTED: { startProduction: "IN_PRODUCTION" },
  IN_PRODUCTION: { deliver: "DELIVERED" },
  DELIVERED: {},
  CANCELLED: {},
};

export const EVENT_LABEL: Record<QuoteEvent, string> = {
  send: "gửi tới các xưởng",
  receiveBid: "nhận chào giá",
  accept: "chốt phân bổ",
  startProduction: "phát lệnh sản xuất",
  deliver: "xác nhận giao hàng",
  cancel: "hủy yêu cầu",
};

/** Trạng thái tiếp theo, hoặc null nếu sự kiện không hợp lệ ở trạng thái hiện tại. */
export function nextStatus(current: QuoteStatus, event: QuoteEvent): QuoteStatus | null {
  return QUOTE_TRANSITIONS[current][event] ?? null;
}

export function canTransition(current: QuoteStatus, event: QuoteEvent): boolean {
  return nextStatus(current, event) !== null;
}

/** Các trạng thái mà hộ nghề còn được gửi / sửa / rút chào giá. */
export const BIDDING_OPEN: QuoteStatus[] = ["SENT_TO_ARTISANS", "ARTISANS_BIDDING"];
