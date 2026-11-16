/**
 * Ảnh tác phẩm đã tách nền (public/seed/cutout, mỗi ảnh có tệp .json ghi nguồn gốc và cách xử lý).
 * Chỉ những ảnh chụp trên phông đồng màu, tách sạch và đã duyệt tay mới có mặt ở đây;
 * ảnh còn lại vẫn hiện trong khung tranh trên kệ.
 */
const CUTOUTS = new Set([
  "chu-dau-jar.webp",
  "lam-big-plate.webp",
  "lam-tea-bowl-2.webp",
  "ngoc-bowl.webp",
  "ngoc-jar.webp",
]);

/** Đường dẫn ảnh tách nền của một ảnh /seed/..., hoặc null nếu chưa có. */
export function cutoutFor(src: string | null | undefined) {
  if (!src || !src.startsWith("/seed/")) return null;
  const name = src.slice("/seed/".length);
  return CUTOUTS.has(name) ? `/seed/cutout/${name}` : null;
}
