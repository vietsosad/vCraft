// Sinh vân men rạn (craquelure) dạng SVG lặp liền mạch cho viên "men rạn".
// Cách làm: rải điểm ngẫu nhiên có khoảng cách tối thiểu, nối mỗi điểm với 2–3 láng giềng gần nhất
// bằng đường gấp khúc rung nhẹ (vết rạn không bao giờ thẳng), độ dày nét thay đổi theo "đời" vết rạn.
// Vết rạn cắt qua mép được vẽ thêm một bản lệch đúng một ô để ghép mép không lộ đường nối.
// Hai tầng: vết rạn lớn đánh mực đậm, mạng rạn nhỏ dày và mảnh – giống men rạn cổ thật.
// Chạy: node scripts/make-crackle.mjs  → public/textures/crackle.svg, crackle-faint.svg
import fs from "node:fs";
import path from "node:path";

let seed = 20261110;
const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);

function net({ size, count, minDist, widths }) {
  const pts = [];
  let guard = 0;
  while (pts.length < count && guard++ < count * 200) {
    const p = [rand() * size, rand() * size];
    const ok = pts.every((q) => {
      const dx = Math.min(Math.abs(p[0] - q[0]), size - Math.abs(p[0] - q[0]));
      const dy = Math.min(Math.abs(p[1] - q[1]), size - Math.abs(p[1] - q[1]));
      return dx * dx + dy * dy > minDist * minDist;
    });
    if (ok) pts.push(p);
  }
  const edges = new Set();
  const segs = [];
  pts.forEach((p, i) => {
    const near = pts
      .map((q, j) => {
        let dx = q[0] - p[0];
        let dy = q[1] - p[1];
        if (dx > size / 2) dx -= size;
        if (dx < -size / 2) dx += size;
        if (dy > size / 2) dy -= size;
        if (dy < -size / 2) dy += size;
        return { j, dx, dy, d: Math.hypot(dx, dy) };
      })
      .filter((n) => n.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2 + (rand() < 0.45 ? 1 : 0));
    for (const n of near) {
      const key = i < n.j ? `${i}-${n.j}` : `${n.j}-${i}`;
      if (edges.has(key)) continue;
      edges.add(key);
      // đường gấp khúc 3–5 đoạn, lệch vuông góc ngẫu nhiên
      const steps = 3 + Math.floor(rand() * 3);
      const nx = -n.dy / (n.d || 1);
      const ny = n.dx / (n.d || 1);
      const line = [[p[0], p[1]]];
      for (let s = 1; s < steps; s++) {
        const t = s / steps;
        const off = (rand() - 0.5) * n.d * 0.22;
        line.push([p[0] + n.dx * t + nx * off, p[1] + n.dy * t + ny * off]);
      }
      line.push([p[0] + n.dx, p[1] + n.dy]);
      const w = widths[Math.floor(rand() * widths.length)];
      segs.push({ line, w });
    }
  });
  return segs;
}

/** Ghép các tầng vết rạn; chỉ vẽ bản sao lệch mép cho vết rạn thật sự cắt qua mép (file nhỏ, ghép liền). */
function build({ size, layers, color, name }) {
  const fmt = (v) => Math.round(v);
  let body = "";
  for (const layer of layers) {
    let g = "";
    for (const s of net({ size, ...layer })) {
      const xs = s.line.map((p) => p[0]);
      const ys = s.line.map((p) => p[1]);
      const offX = [0, ...(Math.min(...xs) < 0 ? [size] : []), ...(Math.max(...xs) > size ? [-size] : [])];
      const offY = [0, ...(Math.min(...ys) < 0 ? [size] : []), ...(Math.max(...ys) > size ? [-size] : [])];
      for (const ox of offX)
        for (const oy of offY) {
          const d = s.line.map(([x, y], k) => `${k ? "L" : "M"}${fmt(x + ox)} ${fmt(y + oy)}`).join("");
          g += `<path d="${d}" stroke-width="${s.w}"/>`;
        }
    }
    body += `<g stroke-opacity="${layer.opacity}">${g}</g>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><g fill="none" stroke="${color}" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
  const out = path.join("public", "textures", name);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, svg);
  console.log(name, `${(svg.length / 1024).toFixed(1)} KB`);
}

// Viên men rạn: vết rạn lớn đánh mực đậm + mạng rạn nhỏ dày, mảnh
build({
  size: 240,
  color: "#2a2117",
  name: "crackle.svg",
  layers: [
    { count: 260, minDist: 9, widths: [0.35, 0.5, 0.6], opacity: 0.38 },
    { count: 46, minDist: 30, widths: [1.1, 1.5, 2], opacity: 0.72 },
  ],
});
// Nền khối trống: cùng ngôn ngữ nhưng thưa và rất mờ
build({
  size: 360,
  color: "#6b5a44",
  name: "crackle-faint.svg",
  layers: [
    { count: 150, minDist: 18, widths: [0.45, 0.6], opacity: 0.16 },
    { count: 30, minDist: 50, widths: [0.9, 1.2], opacity: 0.26 },
  ],
});
