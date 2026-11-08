/**
 * Tile bản đồ đi qua proxy nội bộ /tiles (xem src/app/tiles/[z]/[x]/[y]/route.ts):
 * dữ liệu OpenStreetMap, có bộ đệm đĩa, không phụ thuộc DNS của trình duyệt.
 * Có thể đổi sang nguồn khác bằng NEXT_PUBLIC_MAP_TILE_URL (nhớ thêm tên miền vào CSP img-src).
 */
export const TILE_URL = process.env.NEXT_PUBLIC_MAP_TILE_URL ?? "/tiles/{z}/{x}/{y}.png";

export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
