import bcrypt from "bcryptjs";

const COST = 12;

/** Băm mật khẩu bằng bcrypt (cost 12). Không bao giờ lưu mật khẩu gốc. */
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
