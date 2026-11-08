const vnd = new Intl.NumberFormat("vi-VN");

/** 1250000 → "1.250.000 ₫" */
export function formatVnd(value: number): string {
  return `${vnd.format(value)} ₫`;
}

export function formatNumber(value: number): string {
  return vnd.format(value);
}

/** Định dạng ngày theo giờ Việt Nam. */
export function formatDate(value: Date | string, withTime = false): string {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(value));
}

/** "3 phút trước", "2 ngày trước"… */
export function timeAgo(value: Date | string): string {
  const diff = (Date.now() - new Date(value).getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat("vi", { numeric: "auto" });
  if (diff < 60) return "vừa xong";
  if (diff < 3600) return rtf.format(-Math.round(diff / 60), "minute");
  if (diff < 86400) return rtf.format(-Math.round(diff / 3600), "hour");
  return rtf.format(-Math.round(diff / 86400), "day");
}

/** 20.9740024 → "20.9740° N" */
export function formatCoord(lat: number, lng: number): string {
  return `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
}
