import type { QuoteStatus } from "@prisma/client";
import { QUOTE_STATUS } from "@/lib/constants";
import { formatNumber } from "@/lib/format";

/** Lời và số của "Đường làng" – dùng được cả phía server lẫn trình duyệt. */

const CHU_SO = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín", "mười"];
/** Số đếm viết bằng chữ cho câu kể (đến mười), lớn hơn thì viết số. */
export function soChu(n: number) {
  return CHU_SO[n] ?? formatNumber(n);
}
export function hoaDau(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Sáu công đoạn làm gốm: tên đất của sáu trạng thái đơn sỉ. */
export const CONG_DOAN = ["Đất thô", "Nhào đất", "Vuốt hình", "Vẽ men", "Vào lò", "Ra lò"] as const;

/** Chặng hiện tại (1–6); đơn đã giao tính là đã qua cả sáu (7); đơn hủy là 0. */
export function stageOf(status: QuoteStatus) {
  if (status === "CANCELLED") return 0;
  if (status === "DELIVERED") return 7;
  return QUOTE_STATUS[status].step + 1;
}
