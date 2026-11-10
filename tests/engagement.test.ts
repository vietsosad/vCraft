import { describe, expect, it } from "vitest";
import { extractBatchCode } from "@/lib/qr-text";
import { parseRange, hhmm } from "@/lib/opening-hours";
import { bookingCreateSchema, changePasswordSchema, favoriteSchema, reviewSchema } from "@/lib/validators/engagement";
import { loginSchema } from "@/lib/validators/auth";

describe("Đọc mã lô từ nội dung tem QR", () => {
  it("nhận link ngắn, link truy xuất, đường dẫn tiếng Việt và mã trần", () => {
    expect(extractBatchCode("https://vcraft.vn/q/BT-2026-RAN-001")).toBe("BT-2026-RAN-001");
    expect(extractBatchCode("http://192.168.1.5:3000/trace/bt-2026-lam-004")).toBe("BT-2026-LAM-004");
    expect(extractBatchCode("/truy-xuat/BT-2026-NGC-005")).toBe("BT-2026-NGC-005");
    expect(extractBatchCode("  bt-2026-hb-002 ")).toBe("BT-2026-HB-002");
  });
  it("từ chối QR không phải tem vCraft", () => {
    expect(extractBatchCode("https://example.com/khuyen-mai")).toBeNull();
    expect(extractBatchCode("WIFI:S:xuong;T:WPA;P:123;;")).toBeNull();
  });
});

describe("Khung giờ trải nghiệm", () => {
  it("đổi giờ mở cửa sang phút và ngược lại", () => {
    expect(parseRange("07:30-17:30")).toEqual([450, 1050]);
    expect(hhmm(450)).toBe("07:30");
    expect(hhmm(13 * 60)).toBe("13:00");
  });
});

describe("Kiểm tra dữ liệu tiện ích", () => {
  it("đặt lịch: chuẩn hóa số điện thoại, giới hạn số khách", () => {
    const ok = bookingCreateSchema.safeParse({ artisanSlug: "xuong-gom-ong-tu", visitDate: "2026-11-12", slot: "09:00", guests: "4", contactName: "Trần Thị Lan", contactPhone: "0912 000 002" });
    expect(ok.success).toBe(true);
    if (ok.success) expect(ok.data.contactPhone).toBe("+84912000002");
    expect(bookingCreateSchema.safeParse({ artisanSlug: "x", visitDate: "12/11/2026", slot: "9h", guests: 0, contactName: "A", contactPhone: "123" }).success).toBe(false);
    expect(bookingCreateSchema.safeParse({ artisanSlug: "x", visitDate: "2026-11-12", slot: "09:00", guests: 41, contactName: "Trần Lan", contactPhone: "0912000002" }).success).toBe(false);
  });
  it("yêu thích: đúng một đích (sản phẩm hoặc xưởng)", () => {
    expect(favoriteSchema.safeParse({}).success).toBe(false);
    expect(favoriteSchema.safeParse({ productId: "ckv0000000000000000000001", artisanId: "ckv0000000000000000000002" }).success).toBe(false);
    expect(favoriteSchema.safeParse({ productId: "ckv0000000000000000000001" }).success).toBe(true);
  });
  it("đánh giá: 1–5 sao, gắn với đúng một đơn sỉ hoặc một buổi trải nghiệm", () => {
    const base = { artisanId: "ckv0000000000000000000001", rating: 5, comment: "Men lên rất đẹp, giao đúng hẹn." };
    expect(reviewSchema.safeParse({ ...base, quoteCode: "RFQ-2026-0003" }).success).toBe(true);
    expect(reviewSchema.safeParse({ ...base, rating: 6, quoteCode: "RFQ-2026-0003" }).success).toBe(false);
    expect(reviewSchema.safeParse(base).success).toBe(false);
  });
  it("đổi mật khẩu: mật khẩu mới phải mạnh, khớp và khác mật khẩu cũ", () => {
    expect(changePasswordSchema.safeParse({ currentPassword: "Vcraft@2026", newPassword: "Vcraft@2027", confirmPassword: "Vcraft@2027" }).success).toBe(true);
    expect(changePasswordSchema.safeParse({ currentPassword: "Vcraft@2026", newPassword: "Vcraft@2026", confirmPassword: "Vcraft@2026" }).success).toBe(false);
    expect(changePasswordSchema.safeParse({ currentPassword: "x", newPassword: "Vcraft@2027", confirmPassword: "Vcraft@2028" }).success).toBe(false);
  });
  it("đăng nhập: mặc định cổng khách hàng, chỉ nhận 3 cổng hợp lệ", () => {
    expect(loginSchema.parse({ email: "Lan@VCraft.test", password: "x" })).toMatchObject({ email: "lan@vcraft.test", portal: "customer" });
    expect(loginSchema.safeParse({ email: "a@b.vn", password: "x", portal: "root" }).success).toBe(false);
  });
});
