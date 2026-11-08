import "server-only";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Lớp lưu trữ trừu tượng (Strategy pattern).
 * Hiện có LocalStorage ghi vào thư mục `storage/`; muốn dùng S3 chỉ cần thêm một lớp
 * cài đặt cùng interface và chọn theo biến môi trường STORAGE_DRIVER.
 */
export interface StorageProvider {
  put(key: string, data: Buffer): Promise<void>;
  get(key: string): Promise<Buffer | null>;
  publicUrl(key: string): string;
}

export type Visibility = "public" | "private";

const ROOT = path.join(process.cwd(), "storage");

/** Chặn path traversal: key chỉ gồm ký tự an toàn và không thoát khỏi thư mục gốc. */
export function safeResolve(base: string, key: string): string | null {
  if (!/^[a-zA-Z0-9/_.-]+$/.test(key) || key.includes("..")) return null;
  const full = path.resolve(base, key);
  return full.startsWith(path.resolve(base) + path.sep) ? full : null;
}

class LocalStorage implements StorageProvider {
  constructor(
    private readonly base: string,
    private readonly urlPrefix: string,
  ) {}

  async put(key: string, data: Buffer) {
    const full = safeResolve(this.base, key);
    if (!full) throw new Error("Khóa lưu trữ không hợp lệ");
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, data);
  }

  async get(key: string) {
    const full = safeResolve(this.base, key);
    if (!full) return null;
    return fs.readFile(full).catch(() => null);
  }

  publicUrl(key: string) {
    return `${this.urlPrefix}/${key}`;
  }
}

const providers: Record<Visibility, StorageProvider> = {
  public: new LocalStorage(path.join(ROOT, "uploads"), "/media"),
  private: new LocalStorage(path.join(ROOT, "private"), "/api/media/private"),
};

export function getStorage(visibility: Visibility): StorageProvider {
  return providers[visibility];
}
