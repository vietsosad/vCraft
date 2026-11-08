import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

/** Băm SHA-256 dạng hex – dùng cho token phiên (không lưu token gốc trong CSDL). */
export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Sinh token ngẫu nhiên an toàn (256 bit, base64url). */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

function getKey(): Buffer {
  const raw = process.env.DATA_ENCRYPTION_KEY;
  if (!raw) throw new Error("Thiếu biến môi trường DATA_ENCRYPTION_KEY");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) throw new Error("DATA_ENCRYPTION_KEY phải là 32 byte mã hóa base64");
  return key;
}

/**
 * Mã hóa AES-256-GCM. Kết quả: `iv.tag.ciphertext` (base64url).
 * Dùng cho dữ liệu nhạy cảm như số CCCD trong hồ sơ đăng ký hộ nghề.
 */
export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((b) => b.toString("base64url")).join(".");
}

export function decrypt(payload: string): string {
  const [iv, tag, data] = payload.split(".").map((p) => Buffer.from(p, "base64url"));
  const decipher = createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

/** Che bớt số CCCD khi hiển thị: 001234567890 → 0012****7890 */
export function maskNationalId(value: string): string {
  if (value.length < 8) return "****";
  return `${value.slice(0, 4)}${"*".repeat(value.length - 8)}${value.slice(-4)}`;
}
