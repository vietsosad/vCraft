import type { GlazeType, NewsCategory, QuoteStatus } from "@prisma/client";

/** 5 dòng men đặc trưng của Bát Tràng. */
export const GLAZES: Record<
  GlazeType,
  { label: string; short: string; color: string; description: string; usage: string }
> = {
  MEN_RAN_CO: {
    label: "Men rạn cổ",
    short: "Rạn",
    color: "#A8916A",
    description:
      "Tận dụng độ co giãn khác nhau giữa xương gốm và lớp men dày, sau khi ra lò được đánh vân bằng mực tàu hoặc nước củ nâu. Mỗi mạng rạn là duy nhất.",
    usage: "Đồ thờ, bình hút lộc, lộc bình, không gian nội thất gỗ cổ điển",
  },
  MEN_LAM_CO: {
    label: "Men lam cổ",
    short: "Lam",
    color: "#1D3557",
    description:
      "Oxit coban vẽ tay bằng bút lông dưới lớp men bóng. Sắc lam từ trầm đến tươi, nét vẽ sen, trúc, cá chép sắc sảo.",
    usage: "Ấm chén, bát đĩa, lọ hoa, bình phong thủy",
  },
  MEN_NGOC: {
    label: "Men ngọc",
    short: "Ngọc",
    color: "#7FA392",
    description:
      "Một lượng nhỏ oxit sắt trong nền men, nung ở nhiệt độ cao cho sắc xanh ngọc dịu, bóng sâu tựa ngọc.",
    usage: "Bộ đồ ăn cao cấp, quà tân gia, gạch trang trí",
  },
  MEN_HOA_BIEN: {
    label: "Men hỏa biến",
    short: "Hỏa biến",
    color: "#7B3F2A",
    description:
      "Hỗn hợp oxit kim loại cùng môi trường nung khử. Màu sắc do lửa quyết định, không pha màu nhân tạo, mỗi món một vẻ.",
    usage: "Tác phẩm sưu tầm, ấm chén thưởng trà",
  },
  MEN_TRANG_NGA: {
    label: "Men trắng ngà",
    short: "Trắng ngà",
    color: "#E9E1CF",
    description:
      "Trường thạch, thạch anh, cao lanh tinh khiết. Bề mặt trắng ngà cứng, giữ nhiệt tốt, làm nổi logo in hoặc vẽ.",
    usage: "Đơn sỉ: cốc sứ, đĩa lưu niệm, ấm chén in logo",
  },
};

export const GLAZE_KEYS = Object.keys(GLAZES) as GlazeType[];

export const CATEGORIES = [
  { slug: "binh-lo-hoa", label: "Bình & lọ hoa" },
  { slug: "am-chen", label: "Ấm chén & bộ trà" },
  { slug: "bat-dia", label: "Bát đĩa" },
  { slug: "do-tho", label: "Đồ thờ" },
  { slug: "coc-qua-tang", label: "Cốc & quà tặng" },
  { slug: "trang-tri", label: "Đồ trang trí" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];
export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug) as [CategorySlug, ...CategorySlug[]];

export function categoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

/** Nhãn hiển thị và thứ tự của 6 trạng thái chính trong luồng báo giá. */
export const QUOTE_STATUS: Record<QuoteStatus, { label: string; step: number; tone: string }> = {
  DRAFT_REQUEST: { label: "Bản nháp", step: 0, tone: "ash" },
  SENT_TO_ARTISANS: { label: "Đã gửi các xưởng", step: 1, tone: "cobalt" },
  ARTISANS_BIDDING: { label: "Đang nhận chào giá", step: 2, tone: "gold" },
  BUYER_ACCEPTED: { label: "Đã chốt phân bổ", step: 3, tone: "celadon" },
  IN_PRODUCTION: { label: "Đang sản xuất", step: 4, tone: "terracotta" },
  DELIVERED: { label: "Đã giao hàng", step: 5, tone: "celadon" },
  CANCELLED: { label: "Đã hủy", step: -1, tone: "ash" },
};

export const QUOTE_FLOW: QuoteStatus[] = [
  "DRAFT_REQUEST",
  "SENT_TO_ARTISANS",
  "ARTISANS_BIDDING",
  "BUYER_ACCEPTED",
  "IN_PRODUCTION",
  "DELIVERED",
];

export const NEWS_CATEGORIES: Record<NewsCategory, string> = {
  NGUYEN_LIEU: "Giá nguyên vật liệu",
  LICH_CUP_DIEN: "Lịch cúp điện",
  CHINH_SACH: "Chính sách hỗ trợ",
  SU_KIEN: "Sự kiện làng nghề",
};

/** Mẫu 6 công đoạn chuẩn của nghề gốm Bát Tràng – gợi ý khi nghệ nhân thêm mốc nhật ký. */
export const STAGE_TEMPLATES = [
  {
    key: "xu-ly-dat",
    title: "Xử lý đất qua 4 bể",
    hint: "Bể đánh ngâm đất sét Trúc Thôn và Đông Triều với nước sông Hồng, bể lắng lọc tạp chất, bể phơi, bể ủ.",
    temperatureC: null,
  },
  {
    key: "chuot-tao-hinh",
    title: "Chuốt tạo hình trên bàn xoay",
    hint: "Đất luyện dẻo nặn thành dây cỡ cổ tay, vuốt tay định hình cốt gốm.",
    temperatureC: null,
  },
  {
    key: "phoi-so-nung",
    title: "Phơi, sửa hàng và sơ nung",
    hint: "Hong khô, sửa hàng phơ, đắp nổi hoa văn rồi sơ nung (biscuit) khoảng 850°C.",
    temperatureC: 850,
  },
  {
    key: "ve-trang-men",
    title: "Vẽ hoa văn và tráng men",
    hint: "Vẽ dưới men bằng bút lông, tráng men (kìm men, quay men) dày khoảng 0,3 mm.",
    temperatureC: null,
  },
  {
    key: "nung-hoan-thien",
    title: "Nung hoàn thiện",
    hint: "Nung liên tục khoảng 18 giờ, đỉnh nhiệt 1.300°C.",
    temperatureC: 1300,
  },
  {
    key: "ra-lo-kiem-dinh",
    title: "Ra lò, kiểm định và cấp tem QR",
    hint: "Để nguội, đánh vân rạn (nếu có), gõ kiểm tra tiếng vang, BQL cấp tem truy xuất.",
    temperatureC: null,
  },
] as const;

/** Các công đoạn bắt buộc phải có trước khi được hoàn tất và khóa lô. */
export const REQUIRED_STAGE_KEYS = ["nung-hoan-thien", "ra-lo-kiem-dinh"];
