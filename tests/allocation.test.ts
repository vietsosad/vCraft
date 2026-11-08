import { describe, expect, it } from "vitest";
import { matchArtisans, suggestAllocation, type BidOption, type CandidateArtisan } from "@/lib/services/allocation";

const bids: BidOption[] = [
  { bidId: "a", workshopName: "Hưng Phát", offeredPricePerUnit: 42000, committedQuantity: 3000, estimatedDays: 18, ratingAvg: 4.5 },
  { bidId: "b", workshopName: "Minh Hải", offeredPricePerUnit: 44500, committedQuantity: 2000, estimatedDays: 21, ratingAvg: 4.6 },
  { bidId: "c", workshopName: "Bàn Xoay", offeredPricePerUnit: 46000, committedQuantity: 1500, estimatedDays: 20, ratingAvg: 4.6 },
  { bidId: "d", workshopName: "Thuận Phong", offeredPricePerUnit: 52000, committedQuantity: 1000, estimatedDays: 25, ratingAvg: 4.9 },
];

describe("Gợi ý phân bổ đơn 5.000 cốc", () => {
  it("chọn các xưởng rẻ nhất cho đến khi đủ số lượng", () => {
    const s = suggestAllocation(5000, 30, bids);
    expect(s.selections.map((x) => [x.workshopName, x.quantity])).toEqual([
      ["Hưng Phát", 3000],
      ["Minh Hải", 2000],
    ]);
    expect(s.totalQuantity).toBe(5000);
    expect(s.totalCost).toBe(3000 * 42000 + 2000 * 44500);
    expect(s.shortfall).toBe(0);
  });

  it("loại chào giá không kịp thời hạn", () => {
    const s = suggestAllocation(5000, 20, bids);
    expect(s.excludedLate).toEqual(["Minh Hải", "Thuận Phong"]);
    expect(s.selections.map((x) => x.workshopName)).toEqual(["Hưng Phát", "Bàn Xoay"]);
    expect(s.shortfall).toBe(500);
  });

  it("lấy một phần chào giá cuối cùng", () => {
    const s = suggestAllocation(3500, 30, bids);
    expect(s.selections).toHaveLength(2);
    expect(s.selections[1]).toMatchObject({ workshopName: "Minh Hải", quantity: 500 });
  });
});

describe("Ghép hộ phù hợp", () => {
  const base: Omit<CandidateArtisan, "id" | "workshopName"> = {
    specialties: ["MEN_TRANG_NGA"],
    maxMonthlyCapacity: 2000,
    ratingAvg: 4.5,
    acceptsWholesale: true,
    verified: true,
  };

  it("lọc hộ chưa duyệt, không nhận sỉ hoặc sai dòng men", () => {
    const res = matchArtisans({ preferredGlaze: "MEN_TRANG_NGA", quantity: 5000, deadlineDays: 30 }, [
      { ...base, id: "ok", workshopName: "A" },
      { ...base, id: "unverified", workshopName: "B", verified: false },
      { ...base, id: "noWholesale", workshopName: "C", acceptsWholesale: false },
      { ...base, id: "wrongGlaze", workshopName: "D", specialties: ["MEN_NGOC"] },
    ]);
    expect(res.map((r) => r.artisanId)).toEqual(["ok"]);
  });

  it("xưởng công suất lớn được xếp trước", () => {
    const res = matchArtisans({ preferredGlaze: "MEN_TRANG_NGA", quantity: 5000, deadlineDays: 30 }, [
      { ...base, id: "small", workshopName: "Nhỏ", maxMonthlyCapacity: 1000 },
      { ...base, id: "big", workshopName: "Lớn", maxMonthlyCapacity: 8000 },
    ]);
    expect(res[0].artisanId).toBe("big");
    expect(res[1].reasons.join(" ")).toContain("chia cùng các hộ khác");
  });
});
