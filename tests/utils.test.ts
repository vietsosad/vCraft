import { describe, expect, it } from "vitest";
import { toSearchText, slugify, normalizePhone, cleanText } from "@/lib/text";
import { getOpenState } from "@/lib/opening-hours";
import { encrypt, decrypt, maskNationalId } from "@/lib/crypto";

describe("Xử lý văn bản tiếng Việt", () => {
  it("tìm kiếm không dấu", () => {
    expect(toSearchText("Bình Hút Lộc Men Rạn")).toBe("binh hut loc men ran");
    expect(toSearchText("Đĩa men lam – Đỗ Thị Hoa")).toBe("dia men lam do thi hoa");
  });
  it("sinh slug", () => {
    expect(slugify("Xưởng gốm Ông Tư")).toBe("xuong-gom-ong-tu");
  });
  it("chuẩn hóa NFC và khoảng trắng", () => {
    // "Gốm" gõ theo dạng tổ hợp (o + dấu mũ + dấu sắc rời) phải về cùng một chuỗi NFC
    const decomposed = "  Gốm   Bát   Tràng ";
    expect(cleanText(decomposed)).toBe("Gốm Bát Tràng");
    expect(cleanText(decomposed).length).toBe("Gốm Bát Tràng".length);
  });
  it("chuẩn hóa số điện thoại", () => {
    expect(normalizePhone("0912 345 678")).toBe("+84912345678");
    expect(normalizePhone("+84 912345678")).toBe("+84912345678");
    expect(normalizePhone("12345")).toBeNull();
  });
});

describe("Trạng thái mở cửa theo giờ Việt Nam", () => {
  const w = { isOpenForVisit: true, openingHours: "08:00-17:00", openDays: [1, 2, 3, 4, 5, 6] };
  it("mở trong giờ làm việc", () => {
    // 2026-11-10 là thứ Ba; 03:00 UTC = 10:00 giờ Việt Nam
    expect(getOpenState(w, new Date("2026-11-10T03:00:00Z")).isOpenNow).toBe(true);
  });
  it("đóng ngoài giờ", () => {
    expect(getOpenState(w, new Date("2026-11-10T12:00:00Z")).isOpenNow).toBe(false); // 19:00
  });
  it("đóng vào Chủ nhật nếu không có trong lịch", () => {
    const s = getOpenState(w, new Date("2026-11-08T03:00:00Z")); // Chủ nhật 10:00
    expect(s.isOpenNow).toBe(false);
    expect(s.label).toContain("sáng mai");
  });
  it("tắt nhận khách thì luôn đóng", () => {
    expect(getOpenState({ ...w, isOpenForVisit: false }, new Date("2026-11-10T03:00:00Z")).isOpenNow).toBe(false);
  });
});

describe("Mã hóa dữ liệu nhạy cảm", () => {
  it("AES-256-GCM giải mã đúng và che bớt CCCD", () => {
    process.env.DATA_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
    const enc = encrypt("001203004567");
    expect(enc).not.toContain("001203004567");
    expect(decrypt(enc)).toBe("001203004567");
    expect(maskNationalId("001203004567")).toBe("0012****4567");
  });
});
