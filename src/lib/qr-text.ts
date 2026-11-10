/** Rút mã lô từ nội dung QR: chấp nhận link /q/MÃ, /trace/MÃ, /truy-xuat/MÃ hoặc chính mã lô. */
export function extractBatchCode(text: string): string | null {
  const t = text.trim();
  const m = t.match(/\/(?:q|trace|truy-xuat)\/([A-Za-z0-9-]+)/) ?? t.match(/^(BT-\d{4}-[A-Z]+-\d+)$/i);
  return m ? m[1].toUpperCase() : null;
}
