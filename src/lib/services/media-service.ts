import "server-only";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { BadRequestError, AppError } from "@/lib/errors";
import type { MediaImage } from "@/lib/types";
import { getStorage, type Visibility } from "./storage";

export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_FILES = 12;
const MAX_WIDTH = 1200;
const THUMB_WIDTH = 480;
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp"]);

/**
 * Xử lý một ảnh tải lên:
 * 1. Kiểm tra định dạng THẬT bằng nội dung file (sharp đọc magic bytes), không tin đuôi file.
 * 2. Tự xoay theo EXIF rồi xóa toàn bộ metadata (kể cả tọa độ GPS) khi mã hóa lại.
 * 3. Resize về tối đa 1200px, nén WebP chất lượng 82; sinh thêm bản thu nhỏ 480px.
 * 4. Sinh ảnh mờ 16×16 dạng base64 (blurDataURL) để hiển thị blur-up.
 */
export async function processImage(file: File, visibility: Visibility, alt = ""): Promise<MediaImage & { originalBytes: number; bytes: number }> {
  if (file.size > MAX_FILE_BYTES) {
    throw new AppError(413, "FILE_TOO_LARGE", `Ảnh "${file.name}" vượt quá 10 MB.`);
  }
  const input = Buffer.from(await file.arrayBuffer());

  let format: string | undefined;
  try {
    format = (await sharp(input).metadata()).format;
  } catch {
    format = undefined;
  }
  if (!format || !ALLOWED_FORMATS.has(format)) {
    throw new AppError(415, "UNSUPPORTED_MEDIA", `"${file.name}" không phải ảnh JPEG, PNG hoặc WebP hợp lệ.`);
  }

  const base = sharp(input, { failOn: "error" }).rotate();
  const [full, thumb, blur] = await Promise.all([
    base.clone().resize({ width: MAX_WIDTH, withoutEnlargement: true }).webp({ quality: 82, effort: 4 }).toBuffer({ resolveWithObject: true }),
    base.clone().resize({ width: THUMB_WIDTH, withoutEnlargement: true }).webp({ quality: 76 }).toBuffer(),
    base.clone().resize(16, 16, { fit: "inside" }).webp({ quality: 40 }).toBuffer(),
  ]);

  const hash = createHash("sha1").update(full.data).digest("hex").slice(0, 16);
  const now = new Date();
  const dir = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  const storage = getStorage(visibility);
  await storage.put(`${dir}/${hash}-${MAX_WIDTH}.webp`, full.data);
  await storage.put(`${dir}/${hash}-${THUMB_WIDTH}.webp`, thumb);

  return {
    src: storage.publicUrl(`${dir}/${hash}-${MAX_WIDTH}.webp`),
    thumb: storage.publicUrl(`${dir}/${hash}-${THUMB_WIDTH}.webp`),
    width: full.info.width,
    height: full.info.height,
    blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
    alt,
    originalBytes: file.size,
    bytes: full.data.length,
  };
}

/** Xử lý song song nhiều ảnh (tối đa 12). Một ảnh lỗi làm cả lô báo lỗi rõ tên file. */
export async function processImages(files: File[], visibility: Visibility) {
  if (files.length === 0) throw new BadRequestError("Chưa chọn ảnh nào.");
  if (files.length > MAX_FILES) throw new BadRequestError(`Tối đa ${MAX_FILES} ảnh mỗi lần tải.`);
  const altBase = (name: string) => name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").slice(0, 120);
  return Promise.all(files.map((f) => processImage(f, visibility, altBase(f.name))));
}
