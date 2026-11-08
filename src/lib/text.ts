/**
 * Chuẩn hóa văn bản tiếng Việt để tìm kiếm không dấu:
 * NFC → bỏ dấu → đ→d → chữ thường → gộp khoảng trắng.
 * Lưu vào cột `searchText` nên tìm kiếm chạy được trên mọi CSDL (không cần unaccent của PostgreSQL).
 */
export function toSearchText(...parts: (string | null | undefined)[]): string {
  return parts
    .filter(Boolean)
    .join(" ")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Sinh slug từ tiếng Việt: "Bình Hút Lộc Men Rạn" → "binh-hut-loc-men-ran" */
export function slugify(value: string): string {
  return toSearchText(value).replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);
}

/** Chuẩn hóa chuỗi người dùng nhập: Unicode NFC và cắt khoảng trắng thừa. */
export function cleanText(value: string): string {
  return value.normalize("NFC").replace(/\s+/g, " ").trim();
}

/** Chuẩn hóa số điện thoại Việt Nam về dạng +84xxxxxxxxx. Trả null nếu không hợp lệ. */
export function normalizePhone(value: string): string | null {
  const digits = value.replace(/[^\d+]/g, "");
  const local = digits.startsWith("+84") ? `0${digits.slice(3)}` : digits.startsWith("84") ? `0${digits.slice(2)}` : digits;
  if (!/^0\d{9}$/.test(local)) return null;
  return `+84${local.slice(1)}`;
}
