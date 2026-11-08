import QRCode from "qrcode";

/** URL ngắn in trên tem: {APP_URL}/q/{mã-lô}. Server quyết định đích chuyển hướng. */
export function traceShortUrl(batchCode: string): string {
  const base = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}/q/${encodeURIComponent(batchCode)}`;
}

const QR_OPTIONS = {
  errorCorrectionLevel: "H" as const, // chịu được ~30% hư hại, đủ để in trên tem nhỏ dán đáy gốm
  margin: 1,
  color: { dark: "#181615", light: "#F9F6F0" },
};

/** QR dạng data URL (PNG) – lưu cùng lô để hiển thị nhanh. */
export function qrDataUrl(batchCode: string, width = 512): Promise<string> {
  return QRCode.toDataURL(traceShortUrl(batchCode), { ...QR_OPTIONS, width });
}

/** QR dạng SVG – dùng để in tem sắc nét ở mọi kích thước. */
export function qrSvg(batchCode: string): Promise<string> {
  return QRCode.toString(traceShortUrl(batchCode), { ...QR_OPTIONS, type: "svg" });
}

export function qrPng(batchCode: string, width = 1024): Promise<Buffer> {
  return QRCode.toBuffer(traceShortUrl(batchCode), { ...QR_OPTIONS, width });
}
