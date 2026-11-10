<div align="center">

# vCraft

**Tinh hoa làng nghề, muôn phương lan tỏa**

Triển lãm số · Truy xuất nguồn gốc bằng QR · Bản đồ làng nghề · Sàn báo giá sỉ · Trợ lý AI cho làng gốm Bát Tràng

Bài tập lớn INT3306 – Phát triển ứng dụng web · Học kỳ Fall 2026

</div>

---

## 1. Giới thiệu

vCraft là nền tảng web của **Ban quản lý (BQL) làng gốm Bát Tràng**. Mỗi hộ nghề có gian trưng bày riêng để kể câu chuyện gia đình, trưng bày tác phẩm và **công khai nhật ký sản xuất từng lô hàng qua mã QR**. Với đơn hàng lớn, vCraft là **phòng đấu thầu kín**: khách sỉ gửi một yêu cầu, hệ thống mời đúng các xưởng phù hợp, các xưởng chào giá, khách chốt và **chia đơn cho nhiều hộ cùng làm**.

| | |
|---|---|
| Làng nghề | Gốm sứ Bát Tràng (Gia Lâm, Hà Nội) |
| Vai trò | Khách / du khách · Khách sỉ · Nghệ nhân (hộ nghề) · Ban quản lý (Admin) |
| Kiến trúc | Next.js 15 (App Router) full-stack: Server Components + REST Route Handlers (JSON) · Prisma ORM · PostgreSQL |

## 2. Tính năng theo vai trò

Ba vai trò làm việc ở **ba khu riêng**, mỗi khu có cổng đăng nhập, thanh bên, màu men và trang chủ riêng. Tài khoản đăng nhập nhầm cổng sẽ được chỉ sang cổng đúng thay vì tạo phiên.

| Khu | Cổng đăng nhập | Địa chỉ | Màu men |
|---|---|---|---|
| Khách hàng (khách lẻ, khách sỉ, du khách) | `/login` | `/account` | Lam Bát Tràng |
| Nghệ nhân / hộ nghề | `/login/artisan` | `/dashboard/artisan` | Đất nung |
| Ban quản lý | `/login/admin` | `/dashboard/admin` | Men ngọc trên nền mực |

**Khu công khai (ai cũng xem được)**
- Phòng triển lãm: lọc theo phân loại, dòng men, hộ gia đình, khoảng giá, độc bản, có truy xuất. Mọi thao tác gọi `GET /api/products` và cập nhật lưới tại chỗ, bộ lọc nằm trên URL.
- Tìm kiếm không dấu kèm gợi ý tức thì ("binh hut loc" ra "Bình hút lộc").
- Bản đồ làng nghề chia đôi màn hình: ghim SVG hình bình gốm, vòng sóng men ngọc khi xưởng **đang mở cửa** (tính theo giờ Việt Nam), popup kiểu vé tham quan, chỉ đường, điểm di sản.
- Quét QR: link ngắn `/q/{mã-lô}` chuyển tới trang truy xuất `/trace/{mã-lô}` có "mạch lửa lò nung" và **đồng hồ nhiệt lò** (kim chạy có quán tính theo công đoạn đang xem). Trang `/scan` quét tem bằng camera ngay trên web (BarcodeDetector hoặc jsQR), tải ảnh tem hoặc nhập mã tay.
- Gian trưng bày xưởng: câu chuyện, ảnh xưởng, **đặt lịch nặn gốm**, **đánh giá thật** của khách, tác phẩm.
- Trợ lý AI "Sứ giả Tinh hoa Bát Tràng" trả lời bằng dữ liệu sống của làng.
- Chế độ sáng/tối (nhớ lựa chọn, đổi bằng hiệu ứng lan vòng tròn).

**Khách hàng – `/account`**
- Tổng quan: đơn sỉ đang chạy, lịch nặn gốm sắp tới, tác phẩm đã lưu, việc chờ đánh giá, thông báo mới.
- Đơn đặt sỉ: tạo yêu cầu 4 bước (nháp tự lưu), phòng đấu thầu so sánh chào giá, **gợi ý phân bổ tối ưu chi phí**, chốt nhiều xưởng, theo dõi lô, nút **"Mô phỏng xung đột đồng thời"** (một yêu cầu thành công, yêu cầu kia nhận `409`).
- **Lịch trải nghiệm**: chọn ngày mở cửa → khung 2 tiếng còn chỗ → số khách; chỗ trống được kiểm tra lại trong giao dịch Serializable nên hai người không đặt quá sức chứa. Hủy lịch, nhận thông báo khi xưởng xác nhận.
- **Đã lưu**: tác phẩm và xưởng yêu thích (cập nhật lạc quan).
- **Đánh giá**: chỉ đánh giá được sau đơn sỉ đã giao (xưởng trúng thầu) hoặc buổi trải nghiệm đã diễn ra, mỗi lần một đánh giá.
- Hồ sơ & bảo mật: sửa thông tin, đổi mật khẩu (đăng xuất mọi thiết bị khác), xem thiết bị đang đăng nhập.

**Nghệ nhân – `/dashboard/artisan`**
- Đăng ký 3 bước: kéo ghim trên bản đồ để chọn vị trí (địa chỉ tự điền), tải minh chứng ở vùng riêng tư, số CCCD được mã hóa.
- Hồ sơ xưởng, công tắc "đang nhận khách" (bản đồ cập nhật ngay), sản phẩm nhiều ảnh.
- Lô sản xuất: mã lô và QR tự sinh, thêm mốc theo mẫu 6 công đoạn kèm ảnh, hoàn tất thì **khóa nhật ký**, in tem QR khổ A4.
- Cơ hội báo giá: lý do được mời, chào giá kín, sửa giá theo `version`, rút chào giá.
- **Lịch trải nghiệm**: xác nhận / từ chối / đánh dấu đã diễn ra (khóa lạc quan theo `version`, không cho "hoàn tất" trước ngày hẹn).
- **Đánh giá**: điểm trung bình, phân bố sao, trả lời từng đánh giá.
- **Thống kê**: lượt quét QR 30 ngày, tỉ lệ trúng chào giá, doanh thu sỉ, khách đã đón; xuất CSV lô, chào giá, lịch hẹn.
- Trên điện thoại có thanh tab dưới đáy, vùng bấm 56px để thao tác một tay.

**Ban quản lý – `/dashboard/admin`**
- Toàn cảnh làng: lượt quét QR mỗi ngày, đăng ký mới theo tuần, yêu cầu báo giá theo trạng thái, xưởng nhận nhiều đơn sỉ nhất.
- Kiểm duyệt hộ nghề (xem minh chứng riêng tư, CCCD đã che), cấp huy hiệu *Hộ nghề xác thực*, tạm khóa tài khoản.
- Điều phối đơn sỉ toàn làng: phòng báo giá riêng trong khu, xem mọi chào giá, mời thêm xưởng.
- Đăng tin cộng đồng; tin khẩn hiện banner và gửi thông báo tới mọi hộ.
- **Báo cáo & xuất CSV** (UTF-8 có BOM, mở thẳng bằng Excel): yêu cầu báo giá, hộ nghề, lô, lịch trải nghiệm, nhật ký.
- **Nhật ký hoạt động** lọc theo loại hành động, phân trang.

**Mọi tài khoản**: quên mật khẩu (`/forgot-password`, mã dùng một lần, hết hạn 30 phút, chỉ lưu bản băm; ở chế độ demo đường dẫn hiện ngay trên màn hình vì chưa nối dịch vụ email).

## 3. Bốn yêu cầu kỹ thuật của đề bài

| Yêu cầu | Cài đặt |
|---|---|
| **4.1 Nhật ký sản xuất & QR** | `ProductBatch.productionStages` là mảng mốc (thời điểm, mô tả, nhiệt độ, ảnh). QR sinh ở backend bằng `qrcode` (mức sửa lỗi H). Mọi sản phẩm cùng lô dùng chung QR. Lô hoàn tất thì khóa, sửa hay xóa mốc trả `409 BATCH_LOCKED`. → `src/lib/services/batch-service.ts`, `src/app/(site)/trace/[batchCode]`, `src/components/trace/*` |
| **4.2 Máy trạng thái báo giá & khóa bản ghi** | `DRAFT_REQUEST → SENT_TO_ARTISANS → ARTISANS_BIDDING → BUYER_ACCEPTED → IN_PRODUCTION → DELIVERED` (thêm `CANCELLED`). Bảng chuyển trạng thái ở `quote-machine.ts`. Mọi chuyển trạng thái chạy trong **giao dịch Serializable** (tự thử lại khi gặp P2034), dùng `updateMany(where: { status, version })` (khóa lạc quan); lệch phiên bản thì trả `409`. → `src/lib/services/quotation-service.ts` |
| **4.3 Bản đồ số** | `react-leaflet` nạp qua `next/dynamic({ ssr: false })` trong lớp bọc client, ghim `L.divIcon` SVG, popup, bộ lọc. Tile đi qua proxy nội bộ `/tiles` có bộ đệm đĩa. → `src/components/map/*` |
| **4.4 Đa phương tiện** | `POST /api/upload` xử lý song song nhiều ảnh bằng `sharp`: kiểm tra định dạng thật, tự xoay EXIF, xóa metadata/GPS, resize 1200px WebP q82, thêm bản thu nhỏ 480px và ảnh mờ 16px. Giao diện hiện dung lượng trước → sau. → `src/lib/services/media-service.ts` |

## 4. Công nghệ

| Lớp | Công nghệ |
|---|---|
| Khung | Next.js 15 (App Router), React 19, TypeScript strict |
| Giao diện | Tailwind CSS 4, Framer Motion, Lucide; font Phudu (biển hiệu) · Alegreya (tên, lời kể) · Be Vietnam Pro (nội dung) · JetBrains Mono (mã lô). Thiết kế xem `DESIGN.md` |
| Biểu đồ | SVG viết tay, bảng màu đã kiểm tra mù màu và tương phản cho cả chế độ sáng/tối |
| Dữ liệu | PostgreSQL 16, Prisma ORM 6 |
| Bản đồ | Leaflet + react-leaflet, dữ liệu OpenStreetMap |
| Ảnh, QR | sharp, qrcode |
| Bảo mật | bcryptjs, phiên server (token băm SHA-256), AES-256-GCM, Zod |
| AI | `@anthropic-ai/sdk` (Claude, vòng lặp tool-use có streaming) và bộ trả lời cục bộ |
| Kiểm thử | Vitest, Playwright |

## 5. Cấu trúc thư mục

```text
prisma/                 schema.prisma, migrations, seed.ts (dữ liệu mẫu Bát Tràng)
public/seed/            62 ảnh tư liệu đã tối ưu + manifest.json (ghi công)
scripts/                fetch-seed-images.ts – tải lại ảnh mẫu từ Wikimedia Commons
src/
  app/                  trang (Server Components) và REST API (app/api/**/route.ts)
    api/                auth, products, workshops, quotes, bids, bookings, reviews, favorites, account, me/*, admin/*, upload, chat
    (site)/             khu công khai: trang chủ, triển lãm, xưởng, bản đồ, truy xuất, quét QR, bản tin
    (auth)/             ba cổng đăng nhập, đăng ký, quên/đặt lại mật khẩu
    account/            khu khách hàng
    dashboard/artisan   khu nghệ nhân
    dashboard/admin     khu Ban quản lý
  components/           ui · layout (zone-shell) · motion · charts · engagement · exhibition · map · trace · quotes · artisan · admin · ai
  lib/
    services/           nghiệp vụ: quotation, batch, catalog, product, admin, media, storage, qr, allocation…
    validators/         schema Zod dùng chung cho biểu mẫu và API
    auth/               phiên, mật khẩu, guard phân quyền
    ai/                 công cụ Prisma cho trợ lý và bộ trả lời cục bộ
  middleware.ts         chuyển hướng sớm khu vực cần đăng nhập
tests/                  unit test máy trạng thái, phân bổ, xử lý văn bản, giờ mở cửa, mã hóa
docs/                   PRODUCT · PRD · ROADMAP
```

## 6. Cài đặt và chạy

Yêu cầu: Node.js ≥ 20, Docker Desktop.

```bash
npm install
cp .env.example .env              # sửa DATA_ENCRYPTION_KEY
npm run db:up                     # PostgreSQL ở cổng 5434
npx prisma migrate deploy         # tạo bảng
npm run db:seed                   # dữ liệu mẫu: 7 xưởng, 32 tác phẩm, 9 lô, 5 yêu cầu báo giá
npm run dev                       # http://localhost:3000
```

Bản production: `npm run build && npm start`.

**Quét QR bằng điện thoại:** đặt `APP_URL` thành địa chỉ điện thoại truy cập được, ví dụ `http://192.168.1.10:3000` (cùng wifi) hoặc URL của `cloudflared tunnel --url http://localhost:3000`, rồi chạy lại `npm run db:seed` để QR của các lô mẫu dùng địa chỉ mới.

### Tài khoản demo

Mật khẩu chung `Vcraft@2026`. Khi `DEMO_MODE=true`, thanh demo trên cùng cho phép đổi vai trò bằng một cú bấm và đưa thẳng tới khu của vai trò đó.

| Vai trò | Cổng | Email | Dùng để demo |
|---|---|---|---|
| Ban quản lý | `/login/admin` | `admin@vcraft.test` | Duyệt hồ sơ, điều phối, đăng tin, báo cáo CSV |
| Khách sỉ | `/login` | `lan.uet@vcraft.test` | `RFQ-UET-2026-5000` (5.000 cốc, 4 chào giá); lịch nặn gốm đã xác nhận; 2 việc chờ đánh giá |
| Khách du lịch | `/login` | `minh@vcraft.test` | Đơn Tết đang sản xuất; lịch 12 khách đang chờ Ông Tư xác nhận |
| Nghệ nhân | `/login/artisan` | `ongtu@vcraft.test` | Lô `BT-2026-LAM-006` đang làm; mời `RFQ-2026-0005`; lịch hẹn chờ xác nhận |
| Nghệ nhân | `/login/artisan` | `hungphat@vcraft.test` | Xưởng sỉ công suất lớn |
| Nghệ nhân chờ duyệt | `/login/artisan` | `moidangky@vcraft.test` | Hồ sơ trong hàng đợi kiểm duyệt |

Các xưởng và nghệ nhân trong dữ liệu mẫu là **hư cấu**, đặt tại tọa độ thật quanh làng. Các điểm di sản công cộng (Bảo tàng Gốm, Lò bầu cổ, Đình, Chợ gốm) dùng tên thật.

### Trợ lý AI

- Có `ANTHROPIC_API_KEY`: dùng Claude (`claude-opus-5-5`) với 5 công cụ truy vấn Prisma (`queryWorkshopsAndMap`, `verifyBatchByCode`, `searchExhibitionCatalog`, `inspectB2BQuotesAndCapacity`, `getCommunityAnnouncements`), có bật fallback phía server khi mô hình từ chối.
- Không có khóa hoặc mất mạng: tự chuyển sang bộ trả lời cục bộ, phân tích câu hỏi tiếng Việt, gọi **cùng các công cụ** đó và trả lời bằng số liệu thật.
- Giá chào thầu là thông tin kín: trợ lý chỉ nêu giá cho người tạo yêu cầu và Ban quản lý.

## 7. Lệnh

| Lệnh | Tác dụng |
|---|---|
| `npm run dev` / `build` / `start` | Phát triển / build / chạy production |
| `npm run typecheck` · `npm run lint` | Kiểm tra kiểu · ESLint |
| `npm test` | Unit test (Vitest) |
| `npm run db:seed` | Nạp lại dữ liệu mẫu (xóa sạch trước, chạy lại bao nhiêu lần cũng được) |
| `npm run db:reset` | Xóa CSDL, migrate lại và seed |
| `npm run images:fetch` | Tải lại ảnh mẫu từ Wikimedia Commons |

## 8. Ánh xạ barem

| Tiêu chí | Ở đâu trong sản phẩm |
|---|---|
| Chức năng (0,35) | Đủ 3 vai trò ở 3 khu riêng, 4 yêu cầu kỹ thuật. Thêm: đặt lịch nặn gốm, đánh giá có kiểm chứng, yêu thích, thống kê và xuất CSV, nhật ký hoạt động, quên mật khẩu, quét QR bằng camera, chế độ tối, gợi ý phân bổ, demo xung đột 409, in tem QR, thông báo, trợ lý AI |
| Thiết kế logic (0,1) | Ba cổng đăng nhập theo vai trò, biểu mẫu nhiều bước có thanh bước, dòng thời gian trạng thái, hộp thoại xác nhận, trạng thái rỗng có hướng dẫn, thanh tab một tay cho nghệ nhân |
| Giao diện (0,2) | Thế giới "Con đường gốm sứ" (`DESIGN.md`): lưới mạch vữa, viên men lam/ngọc/đất nung, bức ghép tự gắn viên ở trang chủ, bóng men theo con trỏ, đồng hồ nhiệt lò, chế độ sáng/tối, ảnh thật, responsive từ 360px, tôn trọng `prefers-reduced-motion` |
| Hiệu năng / AJAX (0,1) | Lọc, gợi ý, chào giá, chốt, thông báo (hỏi lại mỗi 20 giây), bản đồ, upload, chat streaming đều dùng `fetch` + JSON, không tải lại trang |
| Phong cách lập trình (0,05) | Route Handler mỏng → service → Prisma. Mẫu State, Strategy (`StorageProvider`), Singleton (Prisma), Chain (middleware) |
| Nhập liệu (0,05) | Schema Zod dùng chung, kiểm tra email bất đồng bộ, định dạng tiền, chuẩn hóa NFC và số điện thoại, tự điền địa chỉ từ ghim |
| An ninh (0,05) | bcrypt, phiên server có cookie `httpOnly`, khóa tạm sau 5 lần sai, RBAC cộng kiểm tra sở hữu, CSP, kiểm tra Origin, AES-GCM, kiểm tra ảnh bằng magic bytes |
| URL (0,05) | Slug tiếng Việt, alias `/san-pham`, `/ban-do`, `/truy-xuat/:code`, link ngắn `/q/:code`, 301 cho URL cũ, `?next=` an toàn |
| CSDL OOP (0,05) | Prisma, không dùng SQL thô, tìm kiếm qua cột `searchText` chuẩn hóa (độc lập CSDL), mã tuần tự qua bảng `Counter` |

## 9. Ghi công

Bản đồ © OpenStreetMap contributors. Ảnh tư liệu từ Wikimedia Commons (CC BY-SA / CC BY / CC0), danh sách đầy đủ ở trang `/credits`.
