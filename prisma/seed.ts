/**
 * Dữ liệu mẫu vCraft – làng gốm Bát Tràng.
 * - Các xưởng nghệ nhân là HƯ CẤU (tên người, tên xưởng), đặt tại tọa độ thực quanh làng Bát Tràng.
 * - Các điểm di sản công cộng (Bảo tàng Gốm, Lò bầu cổ, Đình làng, Chợ gốm) dùng tên thật.
 * - Ảnh tư liệu lấy từ Wikimedia Commons (CC BY-SA / CC0), xem public/seed/manifest.json.
 * Chạy lại nhiều lần vẫn cho cùng kết quả (xóa sạch rồi nạp lại).
 */
import { PrismaClient, type GlazeType, type QuoteStatus, type Prisma } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { hashPassword } from "../src/lib/auth/password";
import { encrypt } from "../src/lib/crypto";
import { qrDataUrl } from "../src/lib/services/qr";
import { toSearchText } from "../src/lib/text";
import { GLAZES, categoryLabel } from "../src/lib/constants";
import type { MediaImage, ProductionStage } from "../src/lib/types";

const prisma = new PrismaClient();

type ManifestEntry = MediaImage & { credit: NonNullable<MediaImage["credit"]> };
const manifest: Record<string, ManifestEntry> = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "public", "seed", "manifest.json"), "utf8"),
);
function img(id: string, alt?: string): MediaImage {
  const m = manifest[id];
  if (!m) throw new Error(`Thiếu ảnh seed: ${id}`);
  return { src: m.src, width: m.width, height: m.height, blurDataURL: m.blurDataURL, alt: alt ?? m.alt, credit: m.credit };
}

const daysAgo = (d: number, hour = 8) => {
  const t = new Date(Date.now() - d * 24 * 3600 * 1000);
  t.setHours(hour, 0, 0, 0);
  return t;
};

/* ---------------------------------------------------------------- Xưởng nghệ nhân (hư cấu) */

type WorkshopSeed = {
  key: string;
  email: string;
  name: string;
  slug: string;
  workshopName: string;
  artisanTitle: string;
  clanName: string;
  establishedYear: number;
  generation: number;
  tagline: string;
  familyHistory: string;
  address: string;
  latitude: number;
  longitude: number;
  openingHours: string;
  openDays: number[];
  isOpenForVisit: boolean;
  experienceOffered: boolean;
  experiencePriceVnd: number;
  acceptsWholesale: boolean;
  maxMonthlyCapacity: number;
  specialties: GlazeType[];
  ratingAvg: number;
  certifications: { name: string; issuer: string; year: number }[];
  cover: string;
  gallery: string[];
};

const WORKSHOPS: WorkshopSeed[] = [
  {
    key: "ongtu",
    email: "ongtu@vcraft.test",
    name: "Nguyễn Văn Tư",
    slug: "xuong-gom-ong-tu",
    workshopName: "Xưởng gốm Ông Tư",
    artisanTitle: "Nghệ nhân làng nghề",
    clanName: "Nguyễn",
    establishedYear: 1958,
    generation: 4,
    tagline: "Bốn đời giữ nét bút lam trên men trắng",
    familyHistory:
      "Ông nội của nghệ nhân Nguyễn Văn Tư dựng lò đầu tiên bên bờ sông Hồng năm 1958, chuyên đồ men lam vẽ tay cho các chợ phiên Kinh Bắc. Qua bốn thế hệ, gia đình vẫn giữ lối vẽ bút lông trực tiếp dưới men: một nét sen, một cánh cá chép phải đi liền tay, không tô lại. Ngày nay con gái ông là chị Hà lo phần trưng bày trực tuyến, còn ông vẫn ngồi bàn vẽ mỗi sáng.",
    address: "Số 127 đường Bát Tràng, xã Bát Tràng, Gia Lâm, Hà Nội",
    latitude: 20.9740024,
    longitude: 105.9154763,
    openingHours: "07:30-17:30",
    openDays: [0, 1, 2, 3, 4, 5, 6],
    isOpenForVisit: true,
    experienceOffered: true,
    experiencePriceVnd: 50000,
    acceptsWholesale: true,
    maxMonthlyCapacity: 2500,
    specialties: ["MEN_LAM_CO", "MEN_RAN_CO", "MEN_TRANG_NGA"],
    ratingAvg: 4.8,
    certifications: [
      { name: "Sản phẩm OCOP 4 sao – Bộ ấm chén men lam", issuer: "UBND TP Hà Nội", year: 2023 },
      { name: "Hội viên Hội Gốm sứ Bát Tràng", issuer: "Hội Gốm sứ Bát Tràng", year: 2015 },
    ],
    cover: "artisan-wheel",
    gallery: ["artisan-wheel", "artisan-paint", "shop-display", "drying-greenware", "shop-blue-white"],
  },
  {
    key: "thuanphong",
    email: "thuanphong@vcraft.test",
    name: "Lê Văn Thuận",
    slug: "thuan-phong-duong",
    workshopName: "Thuận Phong Đường",
    artisanTitle: "Nghệ nhân Ưu tú",
    clanName: "Lê",
    establishedYear: 1930,
    generation: 5,
    tagline: "Để lửa quyết định màu men",
    familyHistory:
      "Thuận Phong Đường là “bảo tàng sống” của dòng họ Lê, nơi năm thế hệ nối nhau thử nghiệm men rạn cổ và men hỏa biến. Nghệ nhân Lê Văn Thuận dành hơn hai mươi năm để làm chủ môi trường nung khử: cùng một mẻ men, chỉ cần lửa đổi hướng là bề mặt chuyển từ nâu đất sang xanh rêu. Vì thế mỗi tác phẩm của xưởng đều là độc bản, kèm nhật ký lò ghi lại nhiệt độ từng giờ.",
    address: "Trung tâm làng cổ Bát Tràng, Gia Lâm, Hà Nội",
    latitude: 20.97521,
    longitude: 105.91365,
    openingHours: "08:00-17:00",
    openDays: [0, 1, 2, 3, 4, 5, 6],
    isOpenForVisit: true,
    experienceOffered: true,
    experiencePriceVnd: 60000,
    acceptsWholesale: true,
    maxMonthlyCapacity: 900,
    specialties: ["MEN_HOA_BIEN", "MEN_RAN_CO", "MEN_LAM_CO"],
    ratingAvg: 4.9,
    certifications: [
      { name: "Danh hiệu Nghệ nhân Ưu tú (hư cấu cho dữ liệu demo)", issuer: "Hội đồng xét tặng", year: 2019 },
      { name: "Giải Vàng Hội chợ Làng nghề", issuer: "Hiệp hội Làng nghề Việt Nam", year: 2022 },
    ],
    cover: "hands-wheel",
    gallery: ["hands-wheel", "hands-trim", "crackle-lime-3", "kiln-loading", "crackle-lime-4"],
  },
  {
    key: "minhhai",
    email: "minhhai@vcraft.test",
    name: "Phạm Minh Hải",
    slug: "gom-minh-hai",
    workshopName: "Gốm Minh Hải",
    artisanTitle: "Chủ xưởng",
    clanName: "Phạm",
    establishedYear: 1985,
    generation: 3,
    tagline: "Đồ thờ men rạn và chum vẽ lam khổ lớn",
    familyHistory:
      "Gốm Minh Hải nổi tiếng với chum, chóe và đồ thờ khổ lớn. Xưởng có hai lò gas 6 m³ cùng đội thợ vẽ gần hai mươi người, nhận cả hàng độc bản lẫn đơn sỉ vài nghìn sản phẩm. Ông Phạm Minh Hải tiếp quản xưởng từ cha năm 2005 và là một trong những hộ đầu tiên dán tem truy xuất cho từng lô hàng.",
    address: "Phố Bát Tràng, xã Bát Tràng, Gia Lâm, Hà Nội",
    latitude: 20.9730711,
    longitude: 105.9144251,
    openingHours: "08:00-17:00",
    openDays: [1, 2, 3, 4, 5, 6],
    isOpenForVisit: true,
    experienceOffered: true,
    experiencePriceVnd: 45000,
    acceptsWholesale: true,
    maxMonthlyCapacity: 4000,
    specialties: ["MEN_RAN_CO", "MEN_TRANG_NGA", "MEN_LAM_CO"],
    ratingAvg: 4.6,
    certifications: [{ name: "Chứng nhận an toàn chì – cadimi cho đồ gia dụng", issuer: "Viện Vật liệu xây dựng", year: 2024 }],
    cover: "workshop-floor",
    gallery: ["workshop-floor", "big-jars", "workshop-molds", "shop-vases"],
  },
  {
    key: "hungphat",
    email: "hungphat@vcraft.test",
    name: "Vũ Đức Hưng",
    slug: "gom-su-hung-phat",
    workshopName: "Gốm sứ Hưng Phát",
    artisanTitle: "Giám đốc xưởng",
    clanName: "Vũ",
    establishedYear: 1996,
    generation: 2,
    tagline: "Xưởng chủ lực cho đơn quà tặng in logo",
    familyHistory:
      "Đặt tại thôn Giang Cao, Hưng Phát là xưởng sản xuất hàng loạt lớn nhất trong mạng lưới vCraft với dây chuyền đổ khuôn, lò con thoi và máy in decal. Xưởng chuyên cốc sứ, ấm chén trắng ngà in logo cho trường đại học và doanh nghiệp, nhận chia sản lượng với các hộ trong làng khi đơn vượt công suất.",
    address: "Số 51 đường Giang Cao, xã Bát Tràng, Gia Lâm, Hà Nội",
    latitude: 20.9854,
    longitude: 105.9082,
    openingHours: "07:00-17:00",
    openDays: [1, 2, 3, 4, 5, 6],
    isOpenForVisit: false,
    experienceOffered: false,
    experiencePriceVnd: 0,
    acceptsWholesale: true,
    maxMonthlyCapacity: 8000,
    specialties: ["MEN_TRANG_NGA", "MEN_LAM_CO"],
    ratingAvg: 4.5,
    certifications: [{ name: "ISO 9001:2015", issuer: "Tổ chức chứng nhận (dữ liệu demo)", year: 2021 }],
    cover: "glazing-cups",
    gallery: ["glazing-cups", "workshop-molds", "cups-batch", "shop-white"],
  },
  {
    key: "trangia",
    email: "trangia@vcraft.test",
    name: "Trần Văn Khải",
    slug: "men-ngoc-tran-gia",
    workshopName: "Men Ngọc Trần Gia",
    artisanTitle: "Nghệ nhân Hà Nội",
    clanName: "Trần",
    establishedYear: 1972,
    generation: 3,
    tagline: "Phục dựng sắc ngọc thời Lý – Trần",
    familyHistory:
      "Ba thế hệ họ Trần theo đuổi một màu men: sắc xanh ngọc của gốm thời Lý. Nghệ nhân Trần Văn Khải nghiên cứu các mảnh gốm khảo cổ để tìm lại tỷ lệ oxit sắt trong men, rồi nung thử hàng trăm mẻ cho đến khi đạt độ trong sâu như ngọc. Xưởng nằm trong khu công nghiệp làng nghề và mở cửa cho khách xem trưng bày mỗi ngày.",
    address: "Lô A2 khu công nghiệp làng nghề Bát Tràng, Gia Lâm, Hà Nội",
    latitude: 20.9789,
    longitude: 105.9168,
    openingHours: "08:00-16:30",
    openDays: [0, 1, 2, 3, 4, 5, 6],
    isOpenForVisit: true,
    experienceOffered: true,
    experiencePriceVnd: 80000,
    acceptsWholesale: true,
    maxMonthlyCapacity: 1500,
    specialties: ["MEN_NGOC", "MEN_RAN_CO"],
    ratingAvg: 4.7,
    certifications: [{ name: "Bằng khen bảo tồn nghề truyền thống (dữ liệu demo)", issuer: "Sở Văn hóa", year: 2020 }],
    cover: "artisan-paint",
    gallery: ["artisan-paint", "ngoc-jar", "ngoc-dish", "shop-table"],
  },
  {
    key: "banxoay",
    email: "banxoay@vcraft.test",
    name: "Đỗ Thị Hoa",
    slug: "ban-xoay-pho-co",
    workshopName: "Bàn Xoay Phố Cổ",
    artisanTitle: "Thợ cả",
    clanName: "Đỗ",
    establishedYear: 2008,
    generation: 2,
    tagline: "Tự tay nặn chiếc bát đầu tiên của bạn",
    familyHistory:
      "Bàn Xoay Phố Cổ là xưởng trải nghiệm do chị Đỗ Thị Hoa mở ngay đầu phố gốm. Du khách được hướng dẫn chuốt gốm trên bàn xoay 30 đến 60 phút, tô tượng, rồi nhận sản phẩm sau khi nung. Xưởng vẫn nhận đơn ấm chén trắng ngà và men lam cỡ vừa cho các hộ lớn trong làng.",
    address: "Phố Bát Tràng, xã Bát Tràng, Gia Lâm, Hà Nội",
    latitude: 20.9774726,
    longitude: 105.9129201,
    openingHours: "08:00-17:00",
    openDays: [0, 1, 2, 3, 4, 5, 6],
    isOpenForVisit: true,
    experienceOffered: true,
    experiencePriceVnd: 40000,
    acceptsWholesale: true,
    maxMonthlyCapacity: 1500,
    specialties: ["MEN_TRANG_NGA", "MEN_LAM_CO"],
    ratingAvg: 4.6,
    certifications: [],
    cover: "bisque-pieces",
    gallery: ["bisque-pieces", "hands-trim", "bisque-teapots", "bicycle-pottery"],
  },
  {
    key: "ngoclan",
    email: "ngoclan@vcraft.test",
    name: "Hoàng Thị Lan Anh",
    slug: "gom-ngoc-lan",
    workshopName: "Gốm Ngọc Lan",
    artisanTitle: "Chủ xưởng",
    clanName: "Hoàng",
    establishedYear: 1990,
    generation: 2,
    tagline: "Men ngọc cho bàn ăn hiện đại",
    familyHistory:
      "Gốm Ngọc Lan đưa men ngọc truyền thống vào đồ ăn hằng ngày: bát, đĩa, khay mứt dáng tối giản hợp không gian hiện đại. Xưởng nghỉ Chủ nhật để bảo trì lò.",
    address: "Xóm 1 đường Giang Cao, xã Bát Tràng, Gia Lâm, Hà Nội",
    latitude: 20.9811,
    longitude: 105.9105,
    openingHours: "08:00-17:00",
    openDays: [1, 2, 3, 4, 5, 6],
    isOpenForVisit: true,
    experienceOffered: false,
    experiencePriceVnd: 0,
    acceptsWholesale: true,
    maxMonthlyCapacity: 2000,
    specialties: ["MEN_NGOC", "MEN_TRANG_NGA"],
    ratingAvg: 4.4,
    certifications: [],
    cover: "shop-white",
    gallery: ["shop-white", "ngoc-bowls-2"],
  },
];

/* ---------------------------------------------------------------- Sản phẩm */

type ProductSeed = {
  artisan: string;
  name: string;
  category: string;
  glaze: GlazeType;
  price: number;
  dimensions: string;
  image: string;
  extra?: string[];
  unique?: boolean;
  batch?: string;
  story: string;
};

const PRODUCTS: ProductSeed[] = [
  { artisan: "ongtu", name: "Lọ hoa men lam vẽ mẫu đơn bốn tai", category: "binh-lo-hoa", glaze: "MEN_LAM_CO", price: 2800000, dimensions: "Cao 32 cm × Ø 24 cm", image: "lam-jar-peony", unique: true, batch: "BT-2026-LAM-004", story: "Dây mẫu đơn quấn quanh thân bình được vẽ liền một hơi bằng bút lông, bốn tai nhỏ đắp tay ở vai bình. Men lam lên sắc trầm nhờ nung đủ 18 giờ." },
  { artisan: "ongtu", name: "Đĩa men lam vẽ cá chép", category: "bat-dia", glaze: "MEN_LAM_CO", price: 1200000, dimensions: "Ø 30 cm", image: "lam-fish-plate", batch: "BT-2026-LAM-006", story: "Cá chép vượt sóng – mô-típ cầu may mắn quen thuộc của gốm Bát Tràng, vẽ bằng ba sắc độ lam đậm nhạt." },
  { artisan: "ongtu", name: "Bát trà men lam dây hoa", category: "am-chen", glaze: "MEN_LAM_CO", price: 350000, dimensions: "Ø 11 cm × cao 7 cm", image: "lam-tea-bowl", batch: "BT-2026-LAM-004", story: "Bát trà thành mỏng, vành vẽ dây hoa cúc, lòng bát để trơn giúp nhìn rõ màu nước trà." },
  { artisan: "ongtu", name: "Hũ trà men lam hoa cúc", category: "am-chen", glaze: "MEN_LAM_CO", price: 650000, dimensions: "Cao 14 cm", image: "lam-jar-small", batch: "BT-2026-LAM-004", story: "Hũ đựng trà có nắp kín, hoa cúc bốn cánh vẽ đối xứng – dáng hũ cổ được phục chế theo mẫu thế kỷ XV." },
  { artisan: "ongtu", name: "Chóe men lam phong cảnh linh vật", category: "do-tho", glaze: "MEN_LAM_CO", price: 6500000, dimensions: "Cao 45 cm", image: "storage-jar", unique: true, story: "Chóe vẽ phong cảnh làng quê cùng nghê, lân – một tác phẩm thờ tự cần gần một tháng vẽ tay." },
  { artisan: "ongtu", name: "Đèn dầu sứ vẽ rồng", category: "trang-tri", glaze: "MEN_LAM_CO", price: 480000, dimensions: "Cao 26 cm", image: "blue-lamp", story: "Đèn dầu sứ trắng vẽ rồng mây men lam, bóng đèn thủy tinh – món đồ hoài niệm cho góc đọc sách." },
  { artisan: "ongtu", name: "Đĩa men lam hoa sen lớn", category: "bat-dia", glaze: "MEN_LAM_CO", price: 1650000, dimensions: "Ø 36 cm", image: "lam-big-plate", extra: ["lam-big-plate-side"], story: "Đĩa trưng bày cỡ lớn, tâm đĩa là bông sen nở, vành đĩa là băng hoa văn cánh sen cách điệu." },
  { artisan: "ongtu", name: "Đĩa men lam dây hoa", category: "bat-dia", glaze: "MEN_LAM_CO", price: 520000, dimensions: "Ø 22 cm", image: "lam-dish", story: "Đĩa ăn hằng ngày vẽ dây hoa men lam, men bóng dễ vệ sinh, an toàn với máy rửa bát." },

  { artisan: "thuanphong", name: "Bình hút lộc men rạn đắp nổi hoa sen", category: "do-tho", glaze: "MEN_RAN_CO", price: 4500000, dimensions: "Cao 30 cm × Ø 26 cm", image: "crackle-lime-3", extra: ["crackle-lime-5"], unique: true, batch: "BT-2026-RAN-001", story: "Bình hút lộc men rạn cổ, quai rồng đắp nổi, vân rạn được đánh bằng mực tàu sau khi ra lò. Mạng rạn trên mỗi chiếc là duy nhất." },
  { artisan: "thuanphong", name: "Bình vôi men hỏa biến quai rồng", category: "trang-tri", glaze: "MEN_HOA_BIEN", price: 3200000, dimensions: "Cao 22 cm", image: "crackle-lime-1", unique: true, batch: "BT-2026-HB-002", story: "Lớp men xanh rêu chảy loang tự nhiên trong lò khử – không pha màu, lửa tự vẽ lên thân bình." },
  { artisan: "thuanphong", name: "Bộ bình vôi men rạn tứ quý", category: "trang-tri", glaze: "MEN_RAN_CO", price: 5800000, dimensions: "Bộ 4 chiếc, cao 12–20 cm", image: "crackle-lime-4", story: "Bộ bốn bình vôi kích cỡ khác nhau tượng trưng tứ quý, men rạn ngà vàng." },
  { artisan: "thuanphong", name: "Lư hương men rạn vẽ lam", category: "do-tho", glaze: "MEN_RAN_CO", price: 2400000, dimensions: "Cao 18 cm × Ø 20 cm", image: "incense-burner", batch: "BT-2026-RAN-001", story: "Lư hương dáng trụ, men rạn vàng ngà kết hợp nét vẽ lam – phong cách đồ thờ thời Nguyễn." },
  { artisan: "thuanphong", name: "Ống bút men rạn vân mây", category: "trang-tri", glaze: "MEN_RAN_CO", price: 900000, dimensions: "Cao 16 cm", image: "paper-tube", story: "Ống bút vẽ mây lam trên nền men rạn – quà tặng cho người yêu thư pháp." },
  { artisan: "thuanphong", name: "Bình men rạn xám tro", category: "binh-lo-hoa", glaze: "MEN_HOA_BIEN", price: 2700000, dimensions: "Cao 24 cm", image: "crackle-lime-6", unique: true, batch: "BT-2026-HB-002", story: "Sắc xám tro trầm mặc do nung khử, vết rạn mảnh như tơ – tác phẩm của mẻ hỏa biến tháng 9." },

  { artisan: "minhhai", name: "Chum men lam khổ lớn", category: "do-tho", glaze: "MEN_LAM_CO", price: 7800000, dimensions: "Cao 70 cm", image: "big-jars", unique: true, story: "Chum đại vẽ phong cảnh sơn thủy, nung trong lò gas 6 m³ của xưởng." },
  { artisan: "minhhai", name: "Bình men lam hoa dây cổ", category: "binh-lo-hoa", glaze: "MEN_LAM_CO", price: 2200000, dimensions: "Cao 34 cm", image: "chu-dau-jar", story: "Dáng bình phục chế theo mẫu gốm cổ, hoa dây vẽ kín thân." },
  { artisan: "minhhai", name: "Cây đèn thờ men lam", category: "do-tho", glaze: "MEN_LAM_CO", price: 3600000, dimensions: "Cao 62 cm", image: "lamp-stand-2", story: "Cây đèn thờ nhiều tầng, vẽ rồng mây và cánh sen." },
  { artisan: "minhhai", name: "Chân đèn men lam (phục chế)", category: "do-tho", glaze: "MEN_LAM_CO", price: 2900000, dimensions: "Cao 48 cm", image: "lamp-stand", story: "Phục chế chân đèn gốm thế kỷ XV với lớp men lam xám đặc trưng." },

  { artisan: "hungphat", name: "Cốc sứ trắng ngà in logo theo yêu cầu", category: "coc-qua-tang", glaze: "MEN_TRANG_NGA", price: 45000, dimensions: "Dung tích 300 ml", image: "cups-batch", extra: ["glazing-cups"], batch: "BT-2026-UET-5000", story: "Cốc sứ men trắng ngà, in logo bằng decal nung ở 800°C nên không phai khi rửa. Nhận đơn từ 300 chiếc." },
  { artisan: "hungphat", name: "Bộ ấm chén trắng ngà", category: "am-chen", glaze: "MEN_TRANG_NGA", price: 850000, dimensions: "1 ấm, 6 chén", image: "shop-white", story: "Bộ ấm chén dáng tròn, men trắng ngà giữ nhiệt tốt – mẫu quà tặng doanh nghiệp bán chạy." },
  { artisan: "hungphat", name: "Bộ bát đĩa men lam gia dụng", category: "bat-dia", glaze: "MEN_LAM_CO", price: 1500000, dimensions: "Bộ 22 món", image: "shop-blue-white", story: "Bộ bát đĩa men lam in hoa văn truyền thống cho gia đình 6 người." },

  { artisan: "trangia", name: "Đĩa men ngọc khắc hoa sen", category: "bat-dia", glaze: "MEN_NGOC", price: 1800000, dimensions: "Ø 24 cm", image: "ngoc-dish", batch: "BT-2026-NGC-005", story: "Hoa sen khắc chìm dưới lớp men ngọc dày, ánh sáng đọng lại ở nét khắc tạo chiều sâu." },
  { artisan: "trangia", name: "Đôi bát men ngọc thời Lý (phục chế)", category: "am-chen", glaze: "MEN_NGOC", price: 1100000, dimensions: "Ø 15 cm", image: "ngoc-bowls", batch: "BT-2026-NGC-005", story: "Phục chế đôi bát men ngọc thời Lý, chân đế mộc để lộ xương đất." },
  { artisan: "trangia", name: "Bát men ngọc in hoa cúc", category: "bat-dia", glaze: "MEN_NGOC", price: 680000, dimensions: "Ø 16 cm", image: "ngoc-bowl", story: "Lòng bát in khuôn hoa cúc nổi, men ngọc đọng xanh ở chỗ trũng." },
  { artisan: "trangia", name: "Đĩa men ngọc cánh sen", category: "bat-dia", glaze: "MEN_NGOC", price: 950000, dimensions: "Ø 20 cm", image: "ngoc-plate", story: "Viền đĩa uốn cánh sen, men ngọc mỏng nhẹ." },
  { artisan: "trangia", name: "Hũ men ngọc đắp nổi dây lá", category: "binh-lo-hoa", glaze: "MEN_NGOC", price: 3900000, dimensions: "Cao 20 cm", image: "ngoc-jar", unique: true, batch: "BT-2026-NGC-005", story: "Dây lá đắp nổi quanh vai hũ, sắc ngọc xanh lơ – tác phẩm trưng bày độc bản." },

  { artisan: "banxoay", name: "Bát trà men lam vẽ tay", category: "am-chen", glaze: "MEN_LAM_CO", price: 220000, dimensions: "Ø 10 cm", image: "lam-tea-bowl-2", story: "Bát trà nhỏ do thợ của xưởng trải nghiệm vẽ tay – mỗi chiếc một nét." },
  { artisan: "banxoay", name: "Bình rót men lam cánh sen", category: "binh-lo-hoa", glaze: "MEN_LAM_CO", price: 1350000, dimensions: "Cao 18 cm", image: "lam-kendi", story: "Bình rót dáng kendi, thân vẽ cánh sen và hoa cúc dây." },
  { artisan: "banxoay", name: "Hũ men lam hoa cúc nhỏ", category: "trang-tri", glaze: "MEN_LAM_CO", price: 420000, dimensions: "Cao 10 cm", image: "lam-jar-small-2", story: "Hũ nhỏ đựng muối, đường hoặc làm vật trang trí bàn trà." },
  { artisan: "banxoay", name: "Bát men lam dáng chuông", category: "bat-dia", glaze: "MEN_LAM_CO", price: 380000, dimensions: "Ø 14 cm", image: "lam-bowl", story: "Bát dáng chuông miệng loe, vẽ dây hoa quanh thân." },

  { artisan: "ngoclan", name: "Bộ bát men ngọc gia dụng", category: "bat-dia", glaze: "MEN_NGOC", price: 1250000, dimensions: "Bộ 6 bát", image: "ngoc-bowls-2", story: "Bộ bát men ngọc dáng tối giản, hợp bàn ăn hiện đại." },
  { artisan: "ngoclan", name: "Bình men lam dáng trứng", category: "binh-lo-hoa", glaze: "MEN_LAM_CO", price: 1450000, dimensions: "Cao 22 cm", image: "lam-jar-small", extra: ["smoking-vase"], story: "Bình dáng trứng vẽ hoa dây, men lam tươi." },
];

/* ---------------------------------------------------------------- Lô sản xuất */

function stage(
  key: string,
  title: string,
  description: string,
  daysBefore: number,
  images: string[],
  temperatureC: number | null = null,
): ProductionStage {
  return {
    id: randomUUID(),
    key,
    title,
    description,
    occurredAt: daysAgo(daysBefore, 9).toISOString(),
    temperatureC,
    images: images.map((i) => img(i)),
    recordedAt: daysAgo(daysBefore, 18).toISOString(),
  };
}

function sixStages(startDaysAgo: number, finalImage: string, glazeNote: string): ProductionStage[] {
  const d = startDaysAgo;
  return [
    stage("xu-ly-dat", "Xử lý đất qua 4 bể", "Đất sét Trúc Thôn và đất sét trắng Đông Triều ngâm với nước sông Hồng tại bể đánh, qua bể lắng lọc tạp chất, phơi 3 ngày ở bể phơi rồi ủ lên men tại bể ủ để khử oxit sắt.", d, ["clay-heap", "clay-processing"]),
    stage("chuot-tao-hinh", "Chuốt tạo hình trên bàn xoay", "Đất luyện dẻo nặn thành dây cỡ cổ tay, đặt vào tâm bàn xoay. Nghệ nhân vừa đạp bàn xoay vừa vuốt định hình cốt gốm, không dùng khuôn.", d - 30, ["artisan-wheel", "hands-wheel"]),
    stage("phoi-so-nung", "Phơi, sửa hàng và sơ nung", "Hong khô tự nhiên 7 ngày, sửa hàng phơ, cắt gọt chân đế, đắp nổi họa tiết rồi sơ nung (biscuit) để định hình cốt gốm mộc.", d - 40, ["drying-greenware", "bisque-teapots"], 850),
    stage("ve-trang-men", "Vẽ hoa văn và tráng men", `Vẽ hoa văn dưới men bằng bút lông, sau đó ${glazeNote} với độ dày lớp men khoảng 0,3 mm.`, d - 48, ["artisan-paint", "glazing-cups"]),
    stage("nung-hoan-thien", "Nung hoàn thiện 18 giờ", "Nung liên tục 18 giờ qua ba giai đoạn: tăng nhiệt từ từ, giữ đỉnh 1.300°C để men chảy hoàn toàn, rồi hạ nhiệt chậm trước khi ra lò.", d - 55, ["kiln-loading", "workshop-saggars"], 1300),
    stage("ra-lo-kiem-dinh", "Ra lò, kiểm định và cấp tem QR", "Để nguội trong lò 12 giờ, gõ kiểm tra tiếng vang trong trẻo, loại sản phẩm nứt, cong vênh. Ban quản lý làng nghề kiểm tra và cấp tem truy xuất cho cả lô.", d - 58, [finalImage, "shop-display"]),
  ];
}

type BatchSeed = {
  code: string;
  artisan: string;
  title: string;
  glaze: GlazeType;
  quantity: number;
  stages: ProductionStage[];
  completed: boolean;
  scanCount: number;
  cover: string;
  kilnType?: string;
};

const BATCHES: BatchSeed[] = [
  {
    code: "BT-2026-RAN-001",
    artisan: "thuanphong",
    title: "Bình hút lộc men rạn đắp nổi hoa sen cổ",
    glaze: "MEN_RAN_CO",
    quantity: 24,
    completed: true,
    scanCount: 312,
    cover: "crackle-lime-3",
    kilnType: "Lò gas kết hợp củi thông, nung khử",
    stages: (() => {
      const s = sixStages(120, "crackle-lime-3", "tráng men rạn bằng kỹ thuật kìm men");
      s[5].description += " Sau khi nguội, vân rạn được đánh bằng mực tàu để nổi mạng lưới lục giác tự nhiên.";
      return s;
    })(),
  },
  {
    code: "BT-2026-HB-002",
    artisan: "thuanphong",
    title: "Bộ trà đạo men hỏa biến Thuận Phong Đường",
    glaze: "MEN_HOA_BIEN",
    quantity: 12,
    completed: true,
    scanCount: 147,
    cover: "crackle-lime-1",
    kilnType: "Lò gas nung khử, kiểm soát lửa thủ công",
    stages: sixStages(100, "crackle-lime-1", "tráng men hỏa biến (oxit sắt, đồng, mangan) bằng kỹ thuật dội men"),
  },
  {
    code: "BT-2026-LAM-004",
    artisan: "ongtu",
    title: "Lọ hoa men lam vẽ mẫu đơn – mẻ tháng 10",
    glaze: "MEN_LAM_CO",
    quantity: 30,
    completed: true,
    scanCount: 89,
    cover: "lam-jar-peony",
    stages: sixStages(90, "lam-jar-peony", "phủ men bóng bằng kỹ thuật quay men"),
  },
  {
    code: "BT-2026-NGC-005",
    artisan: "trangia",
    title: "Men ngọc phục chế thời Lý – mẻ thu 2026",
    glaze: "MEN_NGOC",
    quantity: 40,
    completed: true,
    scanCount: 64,
    cover: "ngoc-jar",
    stages: sixStages(85, "ngoc-dish", "tráng men ngọc pha oxit sắt bằng kỹ thuật nhúng"),
  },
  {
    code: "BT-2026-UET-5000",
    artisan: "hungphat",
    title: "Lô cốc mẫu trắng ngà in logo Trường ĐH Công nghệ",
    glaze: "MEN_TRANG_NGA",
    quantity: 200,
    completed: false,
    scanCount: 21,
    cover: "cups-batch",
    kilnType: "Lò con thoi gas, nung decal 800°C",
    stages: sixStages(16, "cups-batch", "nhúng men trắng ngà").slice(0, 4).map((s, i) => ({
      ...s,
      occurredAt: daysAgo(16 - i * 4, 9).toISOString(),
    })),
  },
  {
    code: "BT-2026-LAM-006",
    artisan: "ongtu",
    title: "Đĩa men lam vẽ cá chép – mẻ tháng 11",
    glaze: "MEN_LAM_CO",
    quantity: 40,
    completed: false,
    scanCount: 5,
    cover: "lam-fish-plate",
    stages: sixStages(20, "lam-fish-plate", "phủ men bóng").slice(0, 3).map((s, i) => ({
      ...s,
      occurredAt: daysAgo(20 - i * 6, 9).toISOString(),
    })),
  },
];

/* ---------------------------------------------------------------- Điểm di sản (tên thật) */

const HERITAGE = [
  {
    slug: "bao-tang-gom-bat-trang",
    name: "Trung tâm Tinh hoa Làng nghề Việt (Bảo tàng Gốm Bát Tràng)",
    kind: "MUSEUM" as const,
    description: "Công trình 7 khối xoáy ốc gạch gốm đỏ lấy cảm hứng từ bàn xoay vuốt gốm, trưng bày gốm cổ của các dòng họ làng và có không gian thực hành bàn xoay.",
    address: "Thôn 5, xã Bát Tràng, Gia Lâm, Hà Nội",
    latitude: 20.97685,
    longitude: 105.91214,
    openingHours: "08:00-17:30",
    ticketInfo: "Vé tham khảo khoảng 50.000 ₫/người lớn – kiểm tra lại tại quầy",
    image: "shop-display",
  },
  {
    slug: "lo-bau-co",
    name: "Lò bầu cổ",
    kind: "KILN" as const,
    description: "Lò nung bằng củi kiểu bầu nhiều khoang hiếm hoi còn lại trong làng, cho thấy cách xếp bao nung truyền thống.",
    address: "Xóm 3, xã Bát Tràng, Gia Lâm, Hà Nội",
    latitude: 20.9746,
    longitude: 105.9118,
    openingHours: "08:00-17:00",
    ticketInfo: "Tham quan tự do, nên hỏi chủ nhà trước khi vào",
    image: "kiln-bw",
  },
  {
    slug: "dinh-bat-trang",
    name: "Đình Bát Tràng",
    kind: "TEMPLE" as const,
    description: "Đình làng hướng ra sông Hồng, nơi thờ Thành hoàng và tổ chức lễ hội truyền thống của làng gốm.",
    address: "Ven đê sông Hồng, xã Bát Tràng, Gia Lâm, Hà Nội",
    latitude: 20.9761,
    longitude: 105.9112,
    openingHours: "07:00-18:00",
    ticketInfo: "Miễn phí",
    image: "village-alley",
  },
  {
    slug: "cho-gom-bat-trang",
    name: "Chợ gốm Bát Tràng",
    kind: "MARKET" as const,
    description: "Khu chợ với hàng trăm gian hàng gốm sứ, nơi du khách có thể so sánh và mua trực tiếp từ các hộ.",
    address: "Trung tâm xã Bát Tràng, Gia Lâm, Hà Nội",
    latitude: 20.9771,
    longitude: 105.9104,
    openingHours: "07:30-18:00",
    ticketInfo: "Miễn phí vào cửa",
    image: "market-hall",
  },
];

/* ---------------------------------------------------------------- Tin tức */

const NEWS = [
  {
    title: "Lịch cắt điện bảo trì trạm biến áp Giang Cao ngày 20/11",
    category: "LICH_CUP_DIEN" as const,
    isUrgent: true,
    days: 1,
    cover: "kiln-loading",
    excerpt: "Các hộ có lò điện và lò gas dùng quạt điện tại thôn Giang Cao chủ động xếp lịch nung, tránh mẻ lò dở dang từ 7h30 đến 16h30.",
    content:
      "Điện lực Gia Lâm thông báo cắt điện để bảo trì trạm biến áp Giang Cao vào ngày 20/11, từ 7h30 đến 16h30.\n\nKhu vực ảnh hưởng: toàn bộ thôn Giang Cao và một phần thôn 3, thôn 5.\n\nBan quản lý đề nghị các hộ:\n- Không châm lò mới sau 18h ngày 19/11 nếu mẻ nung kéo dài quá 12 giờ.\n- Kiểm tra máy phát dự phòng cho quạt cấp khí lò gas.\n- Thông báo cho khách đặt hàng nếu tiến độ bị ảnh hưởng.\n\nMọi thắc mắc liên hệ văn phòng BQL làng nghề.",
  },
  {
    title: "Giá đất sét Trúc Thôn tăng 8% trong quý IV",
    category: "NGUYEN_LIEU" as const,
    isUrgent: false,
    days: 4,
    cover: "clay-heap",
    excerpt: "Do mùa mưa kéo dài, chi phí khai thác và vận chuyển đất sét Trúc Thôn tăng. BQL khuyến nghị các hộ đặt nguyên liệu theo nhóm để được giá tốt.",
    content:
      "Theo khảo sát của Ban quản lý, giá đất sét Trúc Thôn đã qua sơ chế tăng khoảng 8% so với quý trước; đất sét trắng Đông Triều tăng 5%.\n\nNguyên nhân chính là mưa kéo dài làm gián đoạn khai thác và chi phí vận chuyển đường thủy tăng.\n\nBQL đang tổ chức đặt hàng chung theo nhóm 10 hộ trở lên để thương lượng giá. Hộ quan tâm đăng ký tại văn phòng trước ngày 30/11.",
  },
  {
    title: "Áp dụng tem truy xuất QR cho toàn bộ sản phẩm mang tên Bát Tràng",
    category: "CHINH_SACH" as const,
    isUrgent: false,
    days: 7,
    cover: "shop-display",
    excerpt: "Từ năm 2027, sản phẩm bày bán dưới tên làng gốm Bát Tràng trên vCraft phải có tem truy xuất lô do Ban quản lý cấp, nhằm chống hàng nhập trà trộn.",
    content:
      "Nhằm bảo vệ thương hiệu làng nghề, Ban quản lý thống nhất áp dụng tem truy xuất QR cho sản phẩm bày bán dưới tên làng gốm Bát Tràng trên nền tảng vCraft.\n\nMỗi lô sản phẩm cần có nhật ký tối thiểu các công đoạn: nung hoàn thiện, ra lò và kiểm định. Khi lô hoàn tất, nhật ký được khóa và không thể sửa.\n\nKhách hàng quét tem sẽ thấy toàn bộ hành trình làm ra sản phẩm cùng xác nhận của Ban quản lý.",
  },
  {
    title: "Hỗ trợ 30% chi phí chuyển đổi lò than sang lò gas",
    category: "CHINH_SACH" as const,
    isUrgent: false,
    days: 12,
    cover: "workshop-saggars",
    excerpt: "Chương trình hỗ trợ giảm ô nhiễm làng nghề dành cho các hộ còn dùng lò than, hồ sơ nhận đến hết tháng 12.",
    content:
      "Chương trình hỗ trợ 30% chi phí chuyển đổi lò than sang lò gas tiếp tục nhận hồ sơ đến hết tháng 12.\n\nĐiều kiện: hộ có hồ sơ được xác thực trên vCraft, cam kết không tái sử dụng lò than sau chuyển đổi.\n\nHồ sơ gồm đơn đăng ký, báo giá lò mới và ảnh hiện trạng lò cũ.",
  },
  {
    title: "Lễ hội làng Bát Tràng và hội thi chuốt gốm bàn xoay",
    category: "SU_KIEN" as const,
    isUrgent: false,
    days: 15,
    cover: "hands-wheel",
    excerpt: "Hội thi chuốt gốm dành cho thợ trẻ dưới 30 tuổi, kết hợp chợ phiên gốm trước sân đình.",
    content:
      "Lễ hội làng năm nay có hội thi chuốt gốm bàn xoay dành cho thợ trẻ dưới 30 tuổi. Mỗi thí sinh có 20 phút để vuốt một chiếc bình theo mẫu.\n\nSong song là chợ phiên gốm trước sân đình với gian hàng của các hộ đã xác thực trên vCraft.",
  },
  {
    title: "Giá gas công nghiệp cho lò nung giảm nhẹ",
    category: "NGUYEN_LIEU" as const,
    isUrgent: false,
    days: 20,
    cover: "kiln-bw",
    excerpt: "Giá gas công nghiệp tháng này giảm khoảng 3%, thuận lợi cho các mẻ nung hàng Tết.",
    content: "Theo thông báo của nhà cung cấp, giá gas công nghiệp tháng này giảm khoảng 3%. BQL khuyến nghị các hộ cân đối lịch nung cho đơn hàng Tết.",
  },
];

/* ---------------------------------------------------------------- Chạy seed */

async function reset() {
  // Xóa theo thứ tự phụ thuộc
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.quoteStatusHistory.deleteMany();
  await prisma.quoteInvitation.deleteMany();
  await prisma.quoteBid.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productBatch.deleteMany();
  await prisma.quoteRequest.deleteMany();
  await prisma.communityNews.deleteMany();
  await prisma.heritageSite.deleteMany();
  await prisma.session.deleteMany();
  await prisma.artisanProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.counter.deleteMany();
}

async function main() {
  console.log("→ Xóa dữ liệu cũ");
  await reset();
  const passwordHash = await hashPassword("Vcraft@2026");

  console.log("→ Người dùng");
  const admin = await prisma.user.create({
    data: { email: "admin@vcraft.test", name: "Nguyễn Văn Hùng", role: "ADMIN", passwordHash, organization: "Ban quản lý làng nghề Bát Tràng", phone: "+84912000001" },
  });
  const lan = await prisma.user.create({
    data: { email: "lan.uet@vcraft.test", name: "Trần Thị Lan", role: "BUYER", passwordHash, organization: "Trường Đại học Công nghệ – ĐHQGHN", phone: "+84912000002" },
  });
  const minh = await prisma.user.create({
    data: { email: "minh@vcraft.test", name: "Lê Quang Minh", role: "BUYER", passwordHash, organization: "Công ty Du lịch Sông Hồng", phone: "+84912000003" },
  });

  console.log("→ Xưởng nghệ nhân");
  const artisanIds: Record<string, string> = {};
  const artisanUserIds: Record<string, string> = {};
  for (const w of WORKSHOPS) {
    const user = await prisma.user.create({
      data: {
        email: w.email,
        name: w.name,
        role: "ARTISAN",
        passwordHash,
        phone: "+8491" + String(Math.floor(1000000 + Math.random() * 8999999)),
        artisanProfile: {
          create: {
            slug: w.slug,
            workshopName: w.workshopName,
            artisanName: w.name,
            artisanTitle: w.artisanTitle,
            clanName: w.clanName,
            establishedYear: w.establishedYear,
            generation: w.generation,
            tagline: w.tagline,
            familyHistory: w.familyHistory,
            address: w.address,
            latitude: w.latitude,
            longitude: w.longitude,
            openingHours: w.openingHours,
            openDays: w.openDays,
            isOpenForVisit: w.isOpenForVisit,
            experienceOffered: w.experienceOffered,
            experiencePriceVnd: w.experiencePriceVnd,
            acceptsWholesale: w.acceptsWholesale,
            maxMonthlyCapacity: w.maxMonthlyCapacity,
            specialties: w.specialties,
            ratingAvg: w.ratingAvg,
            certifications: w.certifications,
            coverImage: img(w.cover),
            workshopImages: w.gallery.map((g) => img(g)),
            verificationStatus: "APPROVED",
            verifiedAt: daysAgo(200),
            nationalIdEnc: encrypt("0012" + String(Math.floor(10000000 + Math.random() * 89999999))),
            searchText: toSearchText(w.workshopName, w.name, w.clanName, w.tagline, ...w.specialties.map((s) => GLAZES[s].label)),
          },
        },
      },
      include: { artisanProfile: true },
    });
    artisanIds[w.key] = user.artisanProfile!.id;
    artisanUserIds[w.key] = user.id;
  }

  // Hồ sơ chờ duyệt – dùng để demo kiểm duyệt chống hàng nhái
  await prisma.user.create({
    data: {
      email: "moidangky@vcraft.test",
      name: "Hoàng Văn Nam",
      role: "ARTISAN",
      status: "PENDING",
      passwordHash,
      phone: "+84912000099",
      artisanProfile: {
        create: {
          slug: "gom-hoang-gia-moi",
          workshopName: "Gốm Hoàng Gia Mới",
          artisanName: "Hoàng Văn Nam",
          artisanTitle: "Thợ gốm",
          clanName: "Hoàng",
          establishedYear: 2019,
          familyHistory: "Xưởng nhỏ mới mở của gia đình họ Hoàng ở thôn 3, chuyên ấm chén men lam. Đính kèm giấy xác nhận của trưởng thôn.",
          address: "Thôn 3, xã Bát Tràng, Gia Lâm, Hà Nội",
          latitude: 20.9765,
          longitude: 105.9172,
          specialties: ["MEN_LAM_CO"],
          isOpenForVisit: false,
          verificationStatus: "PENDING",
          nationalIdEnc: encrypt("001203004567"),
          proofDocuments: [img("village-street", "Giấy xác nhận của thôn (ảnh minh họa)"), img("shop-blue-white", "Ảnh sản phẩm tại xưởng")],
          searchText: toSearchText("Gốm Hoàng Gia Mới Hoàng Văn Nam"),
        },
      },
    },
  });

  console.log("→ Lô sản xuất");
  const batchIds: Record<string, string> = {};
  for (const b of BATCHES) {
    const created = await prisma.productBatch.create({
      data: {
        batchCode: b.code,
        artisanId: artisanIds[b.artisan],
        batchTitle: b.title,
        glazeType: b.glaze,
        quantityProduced: b.quantity,
        qrCodeDataUrl: await qrDataUrl(b.code),
        productionStages: b.stages as unknown as Prisma.InputJsonValue,
        status: b.completed ? "COMPLETED" : "IN_PROGRESS",
        lockedAt: b.completed ? new Date(b.stages[b.stages.length - 1].occurredAt) : null,
        scanCount: b.scanCount,
        coverImage: img(b.cover),
        kilnType: b.kilnType ?? "Lò gas kiểm soát nhiệt độ tự động",
        peakTempC: b.glaze === "MEN_TRANG_NGA" ? 1280 : 1300,
        createdAt: new Date(b.stages[0].occurredAt),
      },
    });
    batchIds[b.code] = created.id;
  }

  console.log("→ Sản phẩm");
  for (const [i, p] of PRODUCTS.entries()) {
    const w = WORKSHOPS.find((x) => x.key === p.artisan)!;
    await prisma.product.create({
      data: {
        artisanId: artisanIds[p.artisan],
        name: p.name,
        slug: `${toSearchText(p.name).replace(/\s+/g, "-")}-${(i + 101).toString(36)}`,
        category: p.category,
        glazeType: p.glaze,
        priceVnd: p.price,
        dimensions: p.dimensions,
        firingTempC: p.glaze === "MEN_TRANG_NGA" ? 1280 : 1300,
        story: p.story,
        images: [img(p.image, p.name), ...(p.extra ?? []).map((e) => img(e))],
        isUniquePiece: !!p.unique,
        stock: p.unique ? 1 : 20 + (i % 5) * 10,
        currentBatchId: p.batch ? batchIds[p.batch] : null,
        searchText: toSearchText(p.name, w.workshopName, GLAZES[p.glaze].label, categoryLabel(p.category)),
        createdAt: daysAgo(60 - i),
      },
    });
  }

  console.log("→ Điểm di sản");
  for (const h of HERITAGE) {
    await prisma.heritageSite.create({ data: { ...h, image: img(h.image) } });
  }

  console.log("→ Yêu cầu báo giá");
  async function history(quoteId: string, steps: [QuoteStatus | null, QuoteStatus, number, string, string?][]) {
    for (const [from, to, d, actorId, note] of steps) {
      await prisma.quoteStatusHistory.create({
        data: { quoteRequestId: quoteId, fromStatus: from, toStatus: to, actorId, note, createdAt: daysAgo(d, 10) },
      });
    }
  }
  async function invite(quoteId: string, keys: string[], by: "SYSTEM" | "ADMIN" = "SYSTEM") {
    for (const k of keys) {
      await prisma.quoteInvitation.create({
        data: {
          quoteRequestId: quoteId,
          artisanId: artisanIds[k],
          matchScore: by === "ADMIN" ? 0 : 70 + Math.floor(Math.random() * 25),
          matchReasons: by === "ADMIN" ? ["Ban quản lý mời trực tiếp"] : ["Sở trường dòng men khách yêu cầu", "Có thể nhận một phần đơn để chia cùng các hộ khác"],
          invitedBy: by,
        },
      });
    }
  }

  // 1) Đơn 5.000 cốc ĐH Công nghệ – đang nhận chào giá, version 2 (dùng để demo khóa lạc quan)
  const uet = await prisma.quoteRequest.create({
    data: {
      requestCode: "RFQ-UET-2026-5000",
      buyerId: lan.id,
      organizationName: "Trường Đại học Công nghệ – ĐHQGHN",
      title: "Đặt 5.000 chiếc cốc sứ trắng ngà in logo Trường Đại học Công nghệ trong 1 tháng",
      category: "coc-qua-tang",
      preferredGlaze: "MEN_TRANG_NGA",
      quantity: 5000,
      targetBudgetPerUnit: 48000,
      deadlineDays: 30,
      biddingClosesAt: new Date(Date.now() + 4 * 24 * 3600 * 1000),
      specifications:
        "Cốc sứ dung tích 300–350 ml, men trắng ngà, in logo Trường ĐH Công nghệ hai màu (xanh lam và đỏ) bằng decal nung, không phai khi rửa bằng máy. Đóng hộp giấy kraft từng chiếc, có tem truy xuất lô. Giao làm 2 đợt tại 144 Xuân Thủy, Cầu Giấy.",
      deliveryAddress: "144 Xuân Thủy, Cầu Giấy, Hà Nội",
      referenceImages: [img("cups-batch", "Mẫu cốc tham khảo")],
      status: "ARTISANS_BIDDING",
      version: 2,
      createdAt: daysAgo(3),
    },
  });
  await history(uet.id, [
    [null, "DRAFT_REQUEST", 3, lan.id, "Tạo yêu cầu"],
    ["DRAFT_REQUEST", "SENT_TO_ARTISANS", 3, lan.id],
    ["SENT_TO_ARTISANS", "ARTISANS_BIDDING", 2, artisanUserIds.hungphat, "Nhận chào giá đầu tiên"],
  ]);
  await invite(uet.id, ["hungphat", "minhhai", "ongtu", "banxoay", "ngoclan"]);
  await invite(uet.id, ["thuanphong"], "ADMIN");
  const uetBids = [
    { k: "hungphat", price: 42000, qty: 3000, days: 18, note: "Xưởng có lò con thoi công suất 8.000 sp/tháng, in decal tại chỗ. Cam kết giao đợt 1 (1.500 cốc) sau 10 ngày." },
    { k: "minhhai", price: 44500, qty: 2000, days: 21, note: "Nhận 2.000 cốc, men trắng ngà an toàn chì – cadimi có chứng nhận. Đóng hộp kraft theo mẫu của trường." },
    { k: "banxoay", price: 46000, qty: 1500, days: 20, note: "Có thể nhận 1.500 cốc, vẽ tay thêm viền lam nếu nhà trường muốn phiên bản đặc biệt." },
    { k: "thuanphong", price: 52000, qty: 1000, days: 25, note: "Đề xuất 1.000 cốc phiên bản men rạn nhẹ cho khách mời VIP, mỗi chiếc có vân rạn riêng." },
  ];
  for (const b of uetBids) {
    await prisma.quoteBid.create({
      data: { quoteRequestId: uet.id, artisanId: artisanIds[b.k], offeredPricePerUnit: b.price, committedQuantity: b.qty, estimatedDays: b.days, proposalNote: b.note, createdAt: daysAgo(2, 14) },
    });
  }

  // 2) Đơn 1.200 bộ ấm chén quà Tết – đang sản xuất (đã chốt Ông Tư + Hưng Phát)
  const tet = await prisma.quoteRequest.create({
    data: {
      requestCode: "RFQ-2026-0002",
      buyerId: minh.id,
      organizationName: "Công ty Du lịch Sông Hồng",
      title: "1.200 bộ ấm chén men lam làm quà Tết cho đối tác",
      category: "am-chen",
      preferredGlaze: "MEN_LAM_CO",
      quantity: 1200,
      targetBudgetPerUnit: 420000,
      deadlineDays: 45,
      biddingClosesAt: daysAgo(20),
      specifications: "Bộ 1 ấm 6 chén men lam vẽ hoa sen, hộp gỗ lót lụa, in logo công ty ở đáy ấm.",
      deliveryAddress: "25 Hàng Bài, Hoàn Kiếm, Hà Nội",
      status: "IN_PRODUCTION",
      version: 5,
      createdAt: daysAgo(28),
    },
  });
  await history(tet.id, [
    [null, "DRAFT_REQUEST", 28, minh.id, "Tạo yêu cầu"],
    ["DRAFT_REQUEST", "SENT_TO_ARTISANS", 28, minh.id],
    ["SENT_TO_ARTISANS", "ARTISANS_BIDDING", 27, artisanUserIds.ongtu, "Nhận chào giá đầu tiên"],
    ["ARTISANS_BIDDING", "BUYER_ACCEPTED", 22, minh.id, "Chốt 2 xưởng"],
    ["BUYER_ACCEPTED", "IN_PRODUCTION", 20, admin.id],
  ]);
  await invite(tet.id, ["ongtu", "hungphat", "minhhai"]);
  const tetAlloc = [
    { k: "ongtu", price: 395000, qty: 700, alloc: 700, days: 35, code: "BT-2026-LAM-007" },
    { k: "hungphat", price: 380000, qty: 500, alloc: 500, days: 30, code: "BT-2026-LAM-008" },
  ];
  for (const a of tetAlloc) {
    await prisma.quoteBid.create({
      data: { quoteRequestId: tet.id, artisanId: artisanIds[a.k], offeredPricePerUnit: a.price, committedQuantity: a.qty, estimatedDays: a.days, proposalNote: "Nhận theo mẫu hoa sen của khách.", status: "ACCEPTED", allocatedQuantity: a.alloc, version: 2 },
    });
    await prisma.productBatch.create({
      data: {
        batchCode: a.code,
        artisanId: artisanIds[a.k],
        batchTitle: `1.200 bộ ấm chén quà Tết – phần của ${WORKSHOPS.find((w) => w.key === a.k)!.workshopName}`,
        glazeType: "MEN_LAM_CO",
        quantityProduced: a.alloc,
        allocatedQuantity: a.alloc,
        quoteRequestId: tet.id,
        qrCodeDataUrl: await qrDataUrl(a.code),
        productionStages: sixStages(19, "shop-white", "quay men").slice(0, a.k === "ongtu" ? 3 : 2).map((s, i) => ({ ...s, occurredAt: daysAgo(19 - i * 5).toISOString() })) as unknown as Prisma.InputJsonValue,
        coverImage: img("bisque-teapots"),
      },
    });
  }
  await prisma.quoteBid.create({
    data: { quoteRequestId: tet.id, artisanId: artisanIds.minhhai, offeredPricePerUnit: 430000, committedQuantity: 1200, estimatedDays: 40, proposalNote: "Nhận trọn đơn.", status: "REJECTED", version: 2 },
  });

  // 3) Đơn đã giao – 300 đĩa lưu niệm
  const delivered = await prisma.quoteRequest.create({
    data: {
      requestCode: "RFQ-2026-0003",
      buyerId: lan.id,
      organizationName: "Trường Đại học Công nghệ – ĐHQGHN",
      title: "300 đĩa men lam lưu niệm Hội nghị Khoa học Công nghệ",
      category: "bat-dia",
      preferredGlaze: "MEN_LAM_CO",
      quantity: 300,
      targetBudgetPerUnit: 250000,
      deadlineDays: 30,
      biddingClosesAt: daysAgo(70),
      specifications: "Đĩa Ø 20 cm vẽ biểu tượng hội nghị và hoa sen, kèm giá đỡ gỗ.",
      deliveryAddress: "144 Xuân Thủy, Cầu Giấy, Hà Nội",
      status: "DELIVERED",
      version: 6,
      createdAt: daysAgo(75),
    },
  });
  await history(delivered.id, [
    [null, "DRAFT_REQUEST", 75, lan.id, "Tạo yêu cầu"],
    ["DRAFT_REQUEST", "SENT_TO_ARTISANS", 75, lan.id],
    ["SENT_TO_ARTISANS", "ARTISANS_BIDDING", 74, artisanUserIds.minhhai],
    ["ARTISANS_BIDDING", "BUYER_ACCEPTED", 70, lan.id, "Chốt 1 xưởng"],
    ["BUYER_ACCEPTED", "IN_PRODUCTION", 69, admin.id],
    ["IN_PRODUCTION", "DELIVERED", 45, lan.id],
  ]);
  await invite(delivered.id, ["minhhai", "ongtu"]);
  await prisma.quoteBid.create({
    data: { quoteRequestId: delivered.id, artisanId: artisanIds.minhhai, offeredPricePerUnit: 235000, committedQuantity: 300, estimatedDays: 25, proposalNote: "Vẽ tay toàn bộ.", status: "ACCEPTED", allocatedQuantity: 300, version: 2 },
  });
  await prisma.productBatch.create({
    data: {
      batchCode: "BT-2026-LAM-003",
      artisanId: artisanIds.minhhai,
      batchTitle: "300 đĩa lưu niệm Hội nghị KHCN – Gốm Minh Hải",
      glazeType: "MEN_LAM_CO",
      quantityProduced: 300,
      allocatedQuantity: 300,
      quoteRequestId: delivered.id,
      qrCodeDataUrl: await qrDataUrl("BT-2026-LAM-003"),
      productionStages: sixStages(69, "lam-big-plate", "phủ men bóng") as unknown as Prisma.InputJsonValue,
      status: "COMPLETED",
      lockedAt: daysAgo(46),
      scanCount: 58,
      coverImage: img("lam-big-plate"),
    },
  });

  // 4) Bản nháp
  await prisma.quoteRequest.create({
    data: {
      requestCode: "RFQ-2026-0004",
      buyerId: lan.id,
      organizationName: "Trường Đại học Công nghệ – ĐHQGHN",
      title: "800 bát men ngọc cho nhà ăn sinh viên",
      category: "bat-dia",
      preferredGlaze: "MEN_NGOC",
      quantity: 800,
      targetBudgetPerUnit: 90000,
      deadlineDays: 40,
      specifications: "Bát Ø 15 cm men ngọc, chịu nhiệt, dùng được máy rửa bát công nghiệp.",
      deliveryAddress: "144 Xuân Thủy, Cầu Giấy, Hà Nội",
      status: "DRAFT_REQUEST",
      history: { create: { toStatus: "DRAFT_REQUEST", actorId: lan.id, note: "Tạo yêu cầu" } },
    },
  });

  // 5) Vừa gửi, chưa có chào giá – Ông Tư được mời (để demo nghệ nhân chào giá trực tiếp)
  const fresh = await prisma.quoteRequest.create({
    data: {
      requestCode: "RFQ-2026-0005",
      buyerId: lan.id,
      organizationName: "Trường Đại học Công nghệ – ĐHQGHN",
      title: "2.000 cốc men lam vẽ hoa sen cho Ngày hội việc làm",
      category: "coc-qua-tang",
      preferredGlaze: "MEN_LAM_CO",
      quantity: 2000,
      targetBudgetPerUnit: 60000,
      deadlineDays: 35,
      biddingClosesAt: new Date(Date.now() + 6 * 24 * 3600 * 1000),
      specifications: "Cốc 280 ml men lam vẽ hoa sen cách điệu, in chữ “UET Job Fair 2027” ở đáy cốc.",
      deliveryAddress: "144 Xuân Thủy, Cầu Giấy, Hà Nội",
      status: "SENT_TO_ARTISANS",
      version: 2,
      createdAt: daysAgo(0, 7),
    },
  });
  await history(fresh.id, [
    [null, "DRAFT_REQUEST", 0, lan.id, "Tạo yêu cầu"],
    ["DRAFT_REQUEST", "SENT_TO_ARTISANS", 0, lan.id],
  ]);
  await invite(fresh.id, ["ongtu", "hungphat", "banxoay", "minhhai"]);

  await prisma.counter.createMany({
    data: [
      { key: "batch-2026", value: 8 },
      { key: "rfq-2026", value: 5 },
    ],
  });

  console.log("→ Tin tức");
  for (const n of NEWS) {
    await prisma.communityNews.create({
      data: {
        authorId: admin.id,
        title: n.title,
        slug: toSearchText(n.title).replace(/\s+/g, "-").slice(0, 70),
        category: n.category,
        excerpt: n.excerpt,
        content: n.content,
        isUrgent: n.isUrgent,
        coverImage: img(n.cover),
        publishedAt: daysAgo(n.days),
      },
    });
  }

  console.log("→ Nhật ký thao tác");
  const profiles = await prisma.artisanProfile.findMany({ where: { verificationStatus: "APPROVED" }, select: { id: true, workshopName: true } });
  await prisma.auditLog.createMany({
    data: [
      ...profiles.slice(0, 4).map((p, i) => ({ actorId: admin.id, action: "ARTISAN_APPROVED", entity: "ArtisanProfile", entityId: p.id, meta: { workshop: p.workshopName }, createdAt: daysAgo(200 - i * 5) })),
      { actorId: admin.id, action: "NEWS_CREATED", entity: "CommunityNews", entityId: "seed", meta: { title: NEWS[0].title }, createdAt: daysAgo(1) },
      { actorId: minh.id, action: "QUOTE_ACCEPTED", entity: "QuoteRequest", entityId: tet.id, meta: {}, createdAt: daysAgo(22) },
      { actorId: admin.id, action: "QUOTE_INVITE", entity: "QuoteRequest", entityId: uet.id, meta: {}, createdAt: daysAgo(2) },
    ],
  });

  console.log("→ Thông báo mẫu");
  await prisma.notification.createMany({
    data: [
      { userId: lan.id, type: "BID_RECEIVED", title: "Có 4 chào giá cho đơn 5.000 cốc", body: "Hưng Phát, Minh Hải, Bàn Xoay Phố Cổ và Thuận Phong Đường đã chào giá.", link: "/b2b-quotes/RFQ-UET-2026-5000" },
      { userId: artisanUserIds.ongtu, type: "QUOTE_INVITED", title: "Bạn được mời chào giá đơn sỉ", body: "2.000 cốc men lam vẽ hoa sen cho Ngày hội việc làm.", link: "/dashboard/artisan/quotes/RFQ-2026-0005" },
      { userId: admin.id, type: "APPLICATION_SUBMITTED", title: "Hồ sơ hộ nghề mới chờ duyệt", body: "Gốm Hoàng Gia Mới (dòng họ Hoàng) vừa gửi hồ sơ đăng ký.", link: "/dashboard/admin/approvals" },
    ],
  });

  const counts = {
    users: await prisma.user.count(),
    workshops: await prisma.artisanProfile.count(),
    products: await prisma.product.count(),
    batches: await prisma.productBatch.count(),
    quotes: await prisma.quoteRequest.count(),
    bids: await prisma.quoteBid.count(),
  };
  console.log("✓ Seed xong:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
