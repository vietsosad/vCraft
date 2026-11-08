/**
 * Thuật toán ghép hộ và gợi ý phân bổ – viết dạng hàm thuần để dễ kiểm thử.
 */

export type CandidateArtisan = {
  id: string;
  workshopName: string;
  specialties: string[];
  maxMonthlyCapacity: number;
  ratingAvg: number;
  acceptsWholesale: boolean;
  verified: boolean;
};

export type MatchResult = { artisanId: string; score: number; reasons: string[] };

/**
 * Ghép hộ phù hợp cho một yêu cầu báo giá.
 * Bước 1 – lọc cứng: đã được BQL duyệt, nhận đơn sỉ, có dòng men khách yêu cầu.
 * Bước 2 – chấm điểm 0–100: năng lực (50) + uy tín (35) + đa dạng dòng men (15).
 * Bước 3 – mời tối đa `limit` hộ điểm cao nhất.
 * Hộ không đủ sức làm cả đơn vẫn được mời – chính điều này cho phép chia đơn nhiều hộ.
 */
export function matchArtisans(
  quote: { preferredGlaze: string; quantity: number; deadlineDays: number },
  artisans: CandidateArtisan[],
  limit = 10,
): MatchResult[] {
  const months = Math.max(quote.deadlineDays / 30, 0.25);
  return artisans
    .filter((a) => a.verified && a.acceptsWholesale && a.specialties.includes(quote.preferredGlaze))
    .map((a) => {
      const capacityInTime = a.maxMonthlyCapacity * months;
      const capacityFit = Math.min(1, capacityInTime / quote.quantity);
      const score = Math.round(capacityFit * 50 + (a.ratingAvg / 5) * 35 + Math.min(a.specialties.length, 3) * 5);
      const reasons = [
        `Sở trường dòng men khách yêu cầu`,
        `Năng lực khoảng ${Math.round(capacityInTime).toLocaleString("vi-VN")} sản phẩm trong thời hạn`,
        capacityFit < 1 ? "Có thể nhận một phần đơn để chia cùng các hộ khác" : "Đủ sức nhận trọn đơn",
      ];
      return { artisanId: a.id, score, reasons };
    })
    .sort((x, y) => y.score - x.score)
    .slice(0, limit);
}

export type BidOption = {
  bidId: string;
  workshopName: string;
  offeredPricePerUnit: number;
  committedQuantity: number;
  estimatedDays: number;
  ratingAvg: number;
};

export type AllocationSuggestion = {
  selections: { bidId: string; workshopName: string; quantity: number; pricePerUnit: number; subtotal: number }[];
  totalQuantity: number;
  totalCost: number;
  shortfall: number;
  excludedLate: string[];
};

/**
 * Gợi ý phân bổ tối ưu chi phí:
 * 1. Loại chào giá có thời gian hoàn thành vượt thời hạn.
 * 2. Sắp xếp theo đơn giá tăng dần (bằng giá → uy tín cao → làm nhanh).
 * 3. Lấy lần lượt min(phần còn thiếu, số lượng hộ nhận) cho đến khi đủ.
 * Với chi phí tuyến tính và giới hạn số lượng mỗi hộ, cách tham lam này cho tổng chi phí nhỏ nhất.
 */
export function suggestAllocation(required: number, deadlineDays: number, bids: BidOption[]): AllocationSuggestion {
  const onTime = bids.filter((b) => b.estimatedDays <= deadlineDays);
  const excludedLate = bids.filter((b) => b.estimatedDays > deadlineDays).map((b) => b.workshopName);
  const sorted = [...onTime].sort(
    (a, b) => a.offeredPricePerUnit - b.offeredPricePerUnit || b.ratingAvg - a.ratingAvg || a.estimatedDays - b.estimatedDays,
  );

  let remaining = required;
  const selections: AllocationSuggestion["selections"] = [];
  for (const bid of sorted) {
    if (remaining <= 0) break;
    const quantity = Math.min(remaining, bid.committedQuantity);
    selections.push({
      bidId: bid.bidId,
      workshopName: bid.workshopName,
      quantity,
      pricePerUnit: bid.offeredPricePerUnit,
      subtotal: quantity * bid.offeredPricePerUnit,
    });
    remaining -= quantity;
  }
  const totalQuantity = required - Math.max(remaining, 0);
  return {
    selections,
    totalQuantity,
    totalCost: selections.reduce((s, x) => s + x.subtotal, 0),
    shortfall: Math.max(remaining, 0),
    excludedLate,
  };
}
