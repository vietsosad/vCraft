/**
 * Tính trạng thái mở cửa theo giờ Việt Nam (Asia/Ho_Chi_Minh), không phụ thuộc đồng hồ máy khách.
 */
export type OpenState = {
  isOpenNow: boolean;
  label: string;
};

type HoursInput = {
  isOpenForVisit: boolean;
  openingHours: string; // "08:00-17:00"
  openDays: number[]; // 0 = CN
};

const DAY_NAMES = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

/** Giờ hiện tại ở Việt Nam dưới dạng { day, minutes }. */
export function vietnamNow(now = new Date()): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  const hour = Number(get("hour")) % 24;
  return { day, minutes: hour * 60 + Number(get("minute")) };
}

function parseRange(range: string): [number, number] {
  const [start, end] = range.split("-").map((t) => {
    const [h, m] = t.trim().split(":").map(Number);
    return h * 60 + (m || 0);
  });
  return [start, end];
}

function hhmm(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

export function getOpenState(input: HoursInput, now = new Date()): OpenState {
  if (!input.isOpenForVisit) return { isOpenNow: false, label: "Không nhận khách tham quan" };
  const [start, end] = parseRange(input.openingHours);
  const { day, minutes } = vietnamNow(now);
  const openToday = input.openDays.includes(day);

  if (openToday && minutes >= start && minutes < end) {
    return { isOpenNow: true, label: `Đang mở · đóng lúc ${hhmm(end)}` };
  }
  if (openToday && minutes < start) {
    return { isOpenNow: false, label: `Đóng cửa · mở lúc ${hhmm(start)} hôm nay` };
  }
  for (let i = 1; i <= 7; i++) {
    const next = (day + i) % 7;
    if (input.openDays.includes(next)) {
      const when = i === 1 ? "sáng mai" : DAY_NAMES[next];
      return { isOpenNow: false, label: `Đóng cửa · mở lại ${hhmm(start)} ${when}` };
    }
  }
  return { isOpenNow: false, label: "Tạm đóng cửa" };
}
