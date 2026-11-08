/**
 * Tải ảnh mẫu (giấy phép mở) từ Wikimedia Commons, tối ưu bằng sharp
 * và ghi vào public/seed cùng manifest.json chứa kích thước, ảnh mờ LQIP và thông tin ghi công.
 *
 * Chạy: npm run images:fetch   (chỉ cần chạy lại khi đổi scripts/seed-images.json)
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

type SeedImage = { id: string; title: string; alt: string };
type ManifestEntry = {
  src: string;
  width: number;
  height: number;
  blurDataURL: string;
  alt: string;
  credit: { title: string; author: string; license: string; url: string };
};

const USER_AGENT = "vCraftStudentProject/1.0 (educational demo)";
const OUT_DIR = path.join(process.cwd(), "public", "seed");
const MAX_WIDTH = 1400;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Gọi fetch, tự chờ và thử lại khi Wikimedia giới hạn tốc độ (429 hoặc phản hồi không phải JSON/ảnh). */
async function politeFetch(url: string, expect: "json" | "binary"): Promise<Response> {
  for (let attempt = 1; attempt <= 6; attempt++) {
    await sleep(1200);
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    const type = res.headers.get("content-type") ?? "";
    const ok = res.ok && (expect === "json" ? type.includes("json") : type.startsWith("image/"));
    if (ok) return res;
    console.warn(`  bị giới hạn (${res.status}), chờ ${attempt * 5}s rồi thử lại...`);
    await sleep(attempt * 5000);
  }
  throw new Error(`Không tải được ${url}`);
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

async function fetchInfo(title: string) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo" +
    "&iiprop=url|extmetadata&iiextmetadatafilter=LicenseShortName|Artist" +
    `&iiurlwidth=${MAX_WIDTH}&titles=${encodeURIComponent(title)}`;
  const res = await politeFetch(url, "json");
  const data = await res.json();
  const page = Object.values(data.query.pages)[0] as {
    imageinfo?: { thumburl: string; descriptionurl: string; extmetadata?: Record<string, { value: string }> }[];
  };
  const info = page.imageinfo?.[0];
  if (!info) throw new Error(`Không tìm thấy ảnh ${title}`);
  return info;
}

async function main() {
  const list: SeedImage[] = JSON.parse(await fs.readFile(path.join(process.cwd(), "scripts", "seed-images.json"), "utf8"));
  await fs.mkdir(OUT_DIR, { recursive: true });
  const manifestPath = path.join(OUT_DIR, "manifest.json");
  const manifest: Record<string, ManifestEntry> = await fs
    .readFile(manifestPath, "utf8")
    .then((raw) => JSON.parse(raw))
    .catch(() => ({}));

  for (const item of list) {
    if (manifest[item.id]) continue; // đã có từ lần chạy trước
    const info = await fetchInfo(item.title);
    const res = await politeFetch(info.thumburl, "binary");
    const input = Buffer.from(await res.arrayBuffer());

    const pipeline = sharp(input).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true });
    const { data, info: out } = await pipeline.webp({ quality: 72 }).toBuffer({ resolveWithObject: true });
    await fs.writeFile(path.join(OUT_DIR, `${item.id}.webp`), data);
    const blur = await sharp(input).rotate().resize(16, 16, { fit: "inside" }).webp({ quality: 40 }).toBuffer();

    manifest[item.id] = {
      src: `/seed/${item.id}.webp`,
      width: out.width,
      height: out.height,
      blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
      alt: item.alt,
      credit: {
        title: item.title.replace(/^File:/, ""),
        author: stripHtml(info.extmetadata?.Artist?.value ?? "Không rõ"),
        license: info.extmetadata?.LicenseShortName?.value ?? "",
        url: info.descriptionurl,
      },
    };
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`✓ ${item.id} (${Math.round(data.length / 1024)} KB)`);
  }

  console.log(`Đã ghi ${Object.keys(manifest).length} ảnh vào public/seed`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
