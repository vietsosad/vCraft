import type { CSSProperties } from "react";

/**
 * Khung cửi số của khu khách hàng "Tấm dệt".
 * Hoa văn thổ cẩm là lưới ô vuông (mỗi ô là một điểm sợi nổi), nên mọi hoa văn ở đây được sinh từ lưới
 * rồi xuất thành SVG nét sắc (crispEdges). Hoa văn là hình học tự vẽ, không chép mẫu của một dân tộc cụ thể.
 */

type Grid = boolean[][];
/** Mã hoa văn của các mục trong Tấm dệt. */
export type Hue = "n8" | "n7" | "n6" | "n5" | "n4" | "n3" | "n2" | "n1";

const make = (w: number, h: number, on: (x: number, y: number) => boolean): Grid =>
  Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => on(x, y)));

/** Các hoa văn nền (ô lặp) */
const MOTIF = {
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

type MotifName = keyof typeof MOTIF;

/** Lưới → chuỗi đường SVG gồm các ô vuông 1×1 */
function cells(grid: Grid) {
  let d = "";
  grid.forEach((row, y) => row.forEach((on, x) => {
    if (on) d += `M${x} ${y}h1v1h-1z`;
  }));
  return d;
}

/** Ô lặp hoa văn thành url(data:image/svg+xml) dùng cho background-image */
function motifUrl(name: MotifName, color: string, cell = 4) {
  const g = MOTIF[name];
  const w = g[0]!.length, h = g.length;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w * cell}" height="${h * cell}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges"><path fill="${color}" d="${cells(g)}"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const motifByHue: Record<Hue, MotifName> = {
  n8: "tram",
  n7: "rangcua",
  n6: "sao",
  n5: "moc",
  n4: "oco",
  n3: "song",
  n2: "tram",
  n1: "oco",
};

export function bandVars(hue: Hue, tone: "light" | "dark" = "light"): CSSProperties & { "--motif": string } {
  const color = tone === "dark" ? "rgba(255,248,232,0.1)" : "rgba(96,70,44,0.09)";
  return { "--motif": motifUrl(motifByHue[hue], color) };
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
