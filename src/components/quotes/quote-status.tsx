import type { QuoteStatus } from "@prisma/client";
import { QUOTE_FLOW, QUOTE_STATUS } from "@/lib/constants";
import { Badge } from "@/components/ui/primitives";
import { Stepper } from "@/components/ui/stepper";

/** Hình dấu theo nhóm trạng thái: ○ nháp/đã hủy, ◆ đang chờ chào giá, ● đang chạy, ■ đã xong. */
const MARK: Record<QuoteStatus, "dot" | "diamond" | "square" | "ring"> = {
  DRAFT_REQUEST: "ring",
  SENT_TO_ARTISANS: "diamond",
  ARTISANS_BIDDING: "diamond",
  BUYER_ACCEPTED: "dot",
  IN_PRODUCTION: "dot",
  DELIVERED: "square",
  CANCELLED: "ring",
};

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  return <Badge tone={QUOTE_STATUS[status].tone} mark={MARK[status]}>{QUOTE_STATUS[status].label}</Badge>;
}

/** Thanh tiến trình 6 trạng thái của máy trạng thái báo giá. */
export function QuoteFlow({ status }: { status: QuoteStatus }) {
  if (status === "CANCELLED") return <p className="rounded-[var(--radius-tile)] bg-tro/10 p-3 text-sm text-tro">Yêu cầu đã bị hủy.</p>;
  return <Stepper steps={QUOTE_FLOW.map((s) => QUOTE_STATUS[s].label)} current={QUOTE_STATUS[status].step === 5 ? 6 : QUOTE_STATUS[status].step} tone="cobalt" />;
}
