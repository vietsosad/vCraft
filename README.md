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

**Khách hàng / du khách**
- Phòng triển lãm: lọc theo phân loại, dòng men, hộ gia đình, khoảng giá, độc bản, có truy xuất. Mọi thao tác gọi `GET /api/products` và cập nhật lưới tại chỗ, bộ lọc nằm trên URL.
- Tìm kiếm không dấu kèm gợi ý tức thì ("binh hut loc" ra "Bình hút lộc").
- Bản đồ làng nghề chia đôi màn hình: ghim SVG hình bình gốm, vòng sóng men ngọc khi xưởng **đang mở cửa** (tính theo giờ Việt Nam), popup kiểu vé tham quan, chỉ đường, điểm di sản.
- Quét QR trên sản phẩm: link ngắn `/q/{mã-lô}` chuyển hướng 302 tới trang kể chuyện `/trace/{mã-lô}` với "mạch lửa lò nung".
- Trợ lý AI "Sứ giả Tinh hoa Bát Tràng" trả lời bằng dữ liệu sống của làng.

**Khách sỉ**
- Tạo yêu cầu báo giá qua 4 bước. Bản nháp tự lưu, thông tin tổ chức điền sẵn, tự tính tổng ngân sách.
- Phòng đấu thầu: so sánh chào giá, **gợi ý phân bổ tối ưu chi phí**, chốt một hoặc nhiều xưởng, theo dõi tiến độ từng lô, xác nhận nhận hàng.
- Nút **"Mô phỏng xung đột đồng thời"** gửi hai yêu cầu chốt cùng lúc để thấy đúng một yêu cầu thành công, yêu cầu kia nhận `409 Conflict`.

**Nghệ nhân / hộ nghề**
- Đăng ký 3 bước: kéo ghim trên bản đồ để chọn vị trí (địa chỉ tự điền), tải minh chứng ở vùng riêng tư, số CCCD được mã hóa.
- Hồ sơ xưởng, công tắc "đang nhận khách" (bản đồ cập nhật ngay), sản phẩm nhiều ảnh.
- Lô sản xuất: mã lô và QR tự sinh, thêm mốc theo mẫu 6 công đoạn kèm ảnh minh chứng, hoàn tất thì **khóa nhật ký**, in tem QR khổ A4.
- Hộp cơ hội báo giá: lý do được mời, chào giá kín, sửa giá theo `version`, rút chào giá.

**Ban quản lý**
- Kiểm duyệt hộ nghề (xem minh chứng riêng tư, CCCD đã che), cấp huy hiệu *Hộ nghề xác thực*, tạm khóa tài khoản.
- Bảng điều phối đơn sỉ toàn làng: xem mọi chào giá, mời thêm xưởng khi thiếu công suất, cảnh báo lô chậm.
- Đăng tin cộng đồng. Tin khẩn hiện banner và gửi thông báo tới mọi hộ.
- Thống kê và nhật ký thao tác.

## 3. Bốn yêu cầu kỹ thuật của đề bài

| Yêu cầu | Cài đặt |
|---|---|
| **4.1 Nhật ký sản xuất & QR** | `ProductBatch.productionStages` là mảng mốc (thời điểm, mô tả, nhiệt độ, ảnh). QR sinh ở backend bằng `qrcode` (mức sửa lỗi H). Mọi sản phẩm cùng lô dùng chung QR. Lô hoàn tất thì khóa, sửa hay xóa mốc trả `409 BATCH_LOCKED`. → `src/lib/services/batch-service.ts`, `src/app/trace/[batchCode]` |
| **4.2 Máy trạng thái báo giá & khóa bản ghi** | `DRAFT_REQUEST → SENT_TO_ARTISANS → ARTISANS_BIDDING → BUYER_ACCEPTED → IN_PRODUCTION → DELIVERED` (thêm `CANCELLED`). Bảng chuyển trạng thái ở `quote-machine.ts`. Mọi chuyển trạng thái chạy trong **giao dịch Serializable** (tự thử lại khi gặp P2034), dùng `updateMany(where: { status, version })` (khóa lạc quan); lệch phiên bản thì trả `409`. → `src/lib/services/quotation-service.ts` |
| **4.3 Bản đồ số** | `react-leaflet` nạp qua `next/dynamic({ ssr: false })` trong lớp bọc client, ghim `L.divIcon` SVG, popup, bộ lọc. Tile đi qua proxy nội bộ `/tiles` có bộ đệm đĩa. → `src/components/map/*` |
| **4.4 Đa phương tiện** | `POST /api/upload` xử lý song song nhiều ảnh bằng `sharp`: kiểm tra định dạng thật, tự xoay EXIF, xóa metadata/GPS, resize 1200px WebP q82, thêm bản thu nhỏ 480px và ảnh mờ 16px. Giao diện hiện dung lượng trước → sau. → `src/lib/services/media-service.ts` |

## 4. Công nghệ

| Lớp | Công nghệ |
|---|---|
| Khung | Next.js 15 (App Router), React 19, TypeScript strict |
| Giao diện | Tailwind CSS 4, Framer Motion, Lucide, font Cormorant Garamond · Plus Jakarta Sans · JetBrains Mono |
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
    api/                auth, products, workshops, quotes, bids, me/*, admin/*, upload, chat, geocode
    trace/  q/  map/    truy xuất QR, link ngắn, bản đồ
    dashboard/artisan   khu làm việc nghệ nhân
    dashboard/admin     khu điều phối Ban quản lý
  components/           ui · layout · exhibition · map · trace · quotes · artisan · admin · ai
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

Mật khẩu chung `Vcraft@2026`. Khi `DEMO_MODE=true`, thanh xanh trên cùng cho phép đổi vai trò bằng một cú bấm.

| Vai trò | Email | Dùng để demo |
|---|---|---|
| Ban quản lý | `admin@vcraft.test` | Duyệt hồ sơ, điều phối, đăng tin |
| Khách sỉ | `lan.uet@vcraft.test` | `RFQ-UET-2026-5000` (5.000 cốc, đang nhận 4 chào giá, v2) |
| Nghệ nhân | `ongtu@vcraft.test` | Lô `BT-2026-LAM-006` đang làm; được mời `RFQ-2026-0005` |
| Nghệ nhân | `hungphat@vcraft.test` | Xưởng sỉ công suất lớn |
| Nghệ nhân chờ duyệt | `moidangky@vcraft.test` | Hồ sơ trong hàng đợi kiểm duyệt |

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
| Chức năng (0,35) | Đủ 3 vai trò, 4 yêu cầu kỹ thuật. Thêm: gợi ý phân bổ, demo xung đột 409, in tem QR, đếm lượt quét, thông báo, trợ lý AI có công cụ CSDL |
| Thiết kế logic (0,1) | Biểu mẫu nhiều bước có thanh bước, dòng thời gian trạng thái, hộp thoại xác nhận, trạng thái rỗng có hướng dẫn, điều hướng theo vai trò |
| Giao diện (0,2) | Design system "Bát Tràng Digital Exhibition", ảnh thật, scrollytelling, responsive từ 360px |
| Hiệu năng / AJAX (0,1) | Lọc, gợi ý, chào giá, chốt, thông báo (hỏi lại mỗi 20 giây), bản đồ, upload, chat streaming đều dùng `fetch` + JSON, không tải lại trang |
| Phong cách lập trình (0,05) | Route Handler mỏng → service → Prisma. Mẫu State, Strategy (`StorageProvider`), Singleton (Prisma), Chain (middleware) |
| Nhập liệu (0,05) | Schema Zod dùng chung, kiểm tra email bất đồng bộ, định dạng tiền, chuẩn hóa NFC và số điện thoại, tự điền địa chỉ từ ghim |
| An ninh (0,05) | bcrypt, phiên server có cookie `httpOnly`, khóa tạm sau 5 lần sai, RBAC cộng kiểm tra sở hữu, CSP, kiểm tra Origin, AES-GCM, kiểm tra ảnh bằng magic bytes |
| URL (0,05) | Slug tiếng Việt, alias `/san-pham`, `/ban-do`, `/truy-xuat/:code`, link ngắn `/q/:code`, 301 cho URL cũ, `?next=` an toàn |
| CSDL OOP (0,05) | Prisma, không dùng SQL thô, tìm kiếm qua cột `searchText` chuẩn hóa (độc lập CSDL), mã tuần tự qua bảng `Counter` |

## 9. Ghi công

Bản đồ © OpenStreetMap contributors. Ảnh tư liệu từ Wikimedia Commons (CC BY-SA / CC BY / CC0), danh sách đầy đủ ở trang `/credits`.
