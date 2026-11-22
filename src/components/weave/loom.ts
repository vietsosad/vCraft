/**
 * Khung cửi số của khu khách hàng "Tấm dệt".
 * Hoa văn thổ cẩm là lưới ô vuông (mỗi ô là một điểm sợi nổi), nên mọi hoa văn ở đây được sinh từ lưới
 * rồi xuất thành SVG nét sắc (crispEdges). Hoa văn là hình học tự vẽ, không chép mẫu của một dân tộc cụ thể.
 */

export type Grid = boolean[][];
/** Tám nấc nhuộm củ nâu: n8 nhúng nhiều lần nhất (đậm nhất) … n1 nhạt nhất. Giá trị màu nằm trong src/styles/weave.css. */
export type Hue = "n8" | "n7" | "n6" | "n5" | "n4" | "n3" | "n2" | "n1";

const make = (w: number, h: number, on: (x: number, y: number) => boolean): Grid =>
  Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => on(x, y)));

/** Các hoa văn nền (ô lặp) */
export const MOTIF = {
  /** trám: các hình thoi lồng nhau */
  tram: make(12, 12, (x, y) => {
    const d = Math.abs(x - 5.5) + Math.abs(y - 5.5);
    return Math.floor(d) % 3 === 0;
  }),
  /** sao tám cánh: chữ thập và hai đường chéo */
  sao: make(12, 12, (x, y) => {
    const dx = Math.abs(x - 5.5), dy = Math.abs(y - 5.5);
    return ((dx < 1 || dy < 1) && Math.max(dx, dy) < 4.6) || (Math.abs(dx - dy) < 0.6 && dx < 3.6) || (dx + dy > 9.4);
  }),
  /** răng cưa: hàng tam giác nhọn */
  rangcua: make(8, 8, (x, y) => y >= 7 - Math.min(x, 7 - x) * 2 || y === 0),
  /** móc câu: đường xoắn vuông */
  moc: [
    "11111110",
    "10000010",
    "10111010",
    "10101010",
    "10100010",
    "10111110",
    "10000000",
    "11111111",
  ].map((r) => [...r].map((c) => c === "1")),
  /** ô cờ đôi */
  oco: make(8, 8, (x, y) => (Math.floor(x / 2) + Math.floor(y / 2)) % 2 === 0),
  /** sóng: đường gãy khúc */
  song: make(12, 6, (x, y) => {
    const t = x % 12;
    const lvl = t < 6 ? t : 11 - t;
    return y === lvl || (y === 5 && t % 4 === 0);
  }),
} satisfies Record<string, Grid>;

export type MotifName = keyof typeof MOTIF;

/** Lưới → chuỗi đường SVG gồm các ô vuông 1×1 */
function cells(grid: Grid) {
  let d = "";
  grid.forEach((row, y) => row.forEach((on, x) => {
    if (on) d += `M${x} ${y}h1v1h-1z`;
  }));
  return d;
}

/** Ô lặp hoa văn thành url(data:image/svg+xml) dùng cho background-image */
export function motifUrl(name: MotifName, color: string, cell = 4) {
  const g = MOTIF[name];
  const w = g[0]!.length, h = g.length;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w * cell}" height="${h * cell}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges"><path fill="${color}" d="${cells(g)}"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Biên dải: hai hàng răng cưa so le hai màu, cao 5 ô */
export function edgeUrl(a: string, b: string, cell = 3) {
  const w = 10, h = 5;
  const top = make(w, h, (x, y) => y <= 4 - Math.min(x % 10, 9 - (x % 10)) && y < 4);
  const dots = make(w, h, (x, y) => y === 4 && x % 2 === 0);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w * cell}" height="${h * cell}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges"><path fill="${a}" d="${cells(top)}"/><path fill="${b}" d="${cells(dots)}"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Hạt men trắng: hàng chấm ở mỗi đường biên, như hàng hạt trắng đắp quanh miệng bình men nâu. */
export const HAT_TRANG = "#f6f1e6";
const RANG_DAM = "#2a1d0c"; // răng cưa trên dải đậm: nâu đen, tông trên tông
const RANG_NHAT = "#644b26"; // răng cưa trên dải nhạt: nâu men đậm

/** Mỗi nấc nâu: chữ sáng hay tối (ở chế độ sáng), hoa văn riêng, biên răng cưa hai màu. */
export const HUES: Record<Hue, { name: string; ink: "light" | "dark"; motif: MotifName; edge: [string, string] }> = {
  n8: { name: "nâu tám nước", ink: "light", motif: "tram", edge: [RANG_DAM, HAT_TRANG] },
  n7: { name: "nâu bảy nước", ink: "light", motif: "rangcua", edge: [RANG_DAM, HAT_TRANG] },
  n6: { name: "nâu sáu nước", ink: "light", motif: "sao", edge: [RANG_DAM, HAT_TRANG] },
  n5: { name: "nâu năm nước", ink: "light", motif: "moc", edge: [RANG_DAM, HAT_TRANG] },
  n4: { name: "nâu bốn nước", ink: "dark", motif: "oco", edge: [RANG_NHAT, HAT_TRANG] },
  n3: { name: "nâu ba nước", ink: "dark", motif: "song", edge: [RANG_NHAT, HAT_TRANG] },
  n2: { name: "nâu hai nước", ink: "dark", motif: "tram", edge: [RANG_NHAT, HAT_TRANG] },
  n1: { name: "nâu một nước", ink: "dark", motif: "oco", edge: [RANG_NHAT, HAT_TRANG] },
};

/** Nấc nâu của từng mục, theo thứ tự điều hướng: sọc biên nhạt dần từ trái sang phải. */
export const ROUTE_HUE: Record<string, Hue> = {
  "/account": "n8",
  "/account/quotes": "n7",
  "/account/bookings": "n6",
  "/account/favorites": "n5",
  "/account/traces": "n4",
  "/account/reviews": "n3",
  "/account/notifications": "n2",
  "/account/profile": "n1",
};

/** Biến CSS cho một dải: hoa văn tông-trên-tông và biên hai màu */
export function bandVars(hue: Hue, motif?: MotifName): Record<string, string> {
  const h = HUES[hue];
  const tone = h.ink === "light" ? "rgba(255,248,232,0.1)" : "rgba(42,29,12,0.09)";
  return {
    "--motif": motifUrl(motif ?? h.motif, tone),
    "--edge": edgeUrl(h.edge[0], h.edge[1]),
  };
}

/* ---------------- Chữ cái pixel dệt (5×7) cho huy hiệu ---------------- */

const FONT: Record<string, string> = {
  A: ".111.1...11...1111111...11...11...1", B: "1111.1...11...11111.1...11...11111.",
  C: ".111.1...11....1....1....1...1.111.", D: "1111.1...11...11...11...11...11111.",
  E: "111111....1....1111.1....1....11111", F: "111111....1....1111.1....1....1....",
  G: ".111.1...11....1.1111...11...1.1111", H: "1...11...11...1111111...11...11...1",
  I: ".111...1....1....1....1....1...111.", J: "..111...1....1....1....1.1..1..11..",
  K: "1...11..1.1.1..11...1.1..1..1.1...1", L: "1....1....1....1....1....1....11111",
  M: "1...111.111.1.11.1.11...11...11...1", N: "1...11...111..11.1.11..111...11...1",
  O: ".111.1...11...11...11...11...1.111.", P: "1111.1...11...11111.1....1....1....",
  Q: ".111.1...11...11...11.1.11..1..11.1", R: "1111.1...11...11111.1.1..1..1.1...1",
  S: ".11111....1.....111.....1....11111.", T: "11111..1....1....1....1....1....1..",
  U: "1...11...11...11...11...11...1.111.", V: "1...11...11...11...11...1.1.1...1..",
  W: "1...11...11...11.1.11.1.11.1.1.1.1.", X: "1...11...1.1.1...1...1.1.1...11...1",
  Y: "1...11...1.1.1...1....1....1....1..", Z: "11111....1...1...1...1...1....11111",
};

/** Bỏ dấu tiếng Việt để lấy chữ cái gốc cho huy hiệu ("Ông Tư" → "OT") */
export function initials(name: string, max = 2) {
  const words = name
    .replace(/^(xưởng gốm|xưởng|gốm sứ|gốm|lò gốm|lò)\s+/i, "")
    .split(/\s+/)
    .filter(Boolean);
  const pick = words.length > max ? words.slice(-max) : words;
  return pick
    .map((w) => w.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "D")[0]!.toUpperCase())
    .filter((c) => FONT[c])
    .join("")
    .slice(0, max);
}

/** Huy hiệu dệt: chữ cái pixel giữa khung viền dệt; trả về chuỗi đường SVG cho hai lớp (khung, chữ) */
export function badgePaths(letters: string) {
  const chars = [...letters].slice(0, 2);
  const gw = chars.length * 6 - 1;
  const W = Math.max(13, gw + 6), H = 13;
  const ox = Math.floor((W - gw) / 2), oy = 3;
  const glyph: Grid = make(W, H, () => false);
  chars.forEach((c, i) => {
    const bits = FONT[c] ?? FONT.O!;
    for (let k = 0; k < 35; k++) if (bits[k] === "1") glyph[oy + Math.floor(k / 5)]![ox + i * 6 + (k % 5)] = true;
  });
  // khung: viền ngoài và hàng chấm răng cưa ở trên dưới
  const frame = make(W, H, (x, y) => x === 0 || y === 0 || x === W - 1 || y === H - 1 || ((y === 1 || y === H - 2) && x % 2 === 1));
  return { w: W, h: H, frame: cells(frame), glyph: cells(glyph) };
}
