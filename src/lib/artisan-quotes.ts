import type { BidStatus, QuoteStatus } from "@prisma/client";

export type ArtisanQuoteTab = "all" | "pending" | "active" | "history";

export type ArtisanQuoteBucket = "pending" | "active" | "history";

/**
 * Phân nhóm một lời mời báo giá của nghệ nhân theo trạng thái xử lý hiện tại:
 * - `pending`: yêu cầu đang mở chào giá và xưởng chưa gửi chào giá (hoặc đã rút và vẫn còn hạn)
 * - `active`: xưởng đã trúng thầu và đơn đang ở giai đoạn chuẩn bị / sản xuất
 * - `history`: đã gửi chào giá chờ duyệt, đã giao, hủy, hết hạn hoặc không trúng
 */
export function classifyArtisanQuote(
  quoteStatus: QuoteStatus,
  bid?: { status: BidStatus } | null,
): ArtisanQuoteBucket {
  if (bid?.status === "ACCEPTED" && (quoteStatus === "BUYER_ACCEPTED" || quoteStatus === "IN_PRODUCTION")) {
    return "active";
  }
  const openForBid = quoteStatus === "SENT_TO_ARTISANS" || quoteStatus === "ARTISANS_BIDDING";
  if (openForBid && (!bid || bid.status === "WITHDRAWN")) {
    return "pending";
  }
  return "history";
}

export function normalizeQuoteTab(raw?: string): ArtisanQuoteTab {
  if (raw === "pending" || raw === "active" || raw === "history") return raw;
  return "all";
}
