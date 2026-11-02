<div align="center">

# vCraft

**Tinh hoa làng nghề, muôn phương lan tỏa**

Nền tảng *Triển lãm số · Truy xuất nguồn gốc · Điều phối đơn sỉ* cho làng gốm Bát Tràng

Bài tập lớn INT3306 – Phát triển ứng dụng web · Học kỳ Fall 2026

</div>

> 🚧 **Trạng thái:** đang phát triển theo [lộ trình 8 tuần](docs/ROADMAP.md).
> README này mô tả sản phẩm ở trạng thái hoàn thiện. Các lệnh cài đặt chạy được từ cuối Tuần 2, khi khung dự án đã dựng xong.

---

## 1. Giới thiệu

vCraft là nền tảng web dành cho **Ban quản lý (BQL) làng gốm Bát Tràng** (Gia Lâm, Hà Nội). vCraft không phải một trang bán lẻ. Nó là một **"Triển lãm số"**: mỗi hộ gia đình, nghệ nhân có không gian riêng để kể câu chuyện làm nghề, trưng bày sản phẩm độc bản và **công khai nhật ký sản xuất của từng lô hàng** qua mã QR.

Với đơn hàng lớn, vCraft là một **sàn báo giá kín**. Khách sỉ gửi một yêu cầu, hệ thống mời các hộ phù hợp vào chào giá, khách chốt và hệ thống **chia đơn cho nhiều hộ cùng làm**.

| | |
|---|---|
| Làng nghề | Gốm sứ Bát Tràng. Muốn đổi sang nghề khác thì chỉ cần đổi dữ liệu, xem [PRODUCT.md, mục 2](docs/PRODUCT.md) |
| Vai trò | Khách hàng (Buyer/Tourist) · Nghệ nhân (Artisan) · Quản trị viên BQL (Admin) |
| Kiến trúc | React SPA ⇄ REST API JSON (Express) ⇄ Prisma ORM ⇄ PostgreSQL |

## 2. Tính năng chính

### Khách hàng (Buyer / Tourist)
- Duyệt sản phẩm theo **phân loại** hoặc theo **hộ gia đình**. Có lọc, sắp xếp, và tìm kiếm không dấu kèm gợi ý tức thì.
- **Bản đồ làng nghề** tương tác: mỗi xưởng là một ghim, màu ghim cho biết xưởng *đang mở cửa đón khách* hay không. Bấm ghim để xem popup thông tin nhanh và chỉ đường.
- **Quét QR** trên sản phẩm để mở trang kể lại hành trình của cả lô hàng, từ ngày nhào đất.
- **Yêu cầu báo giá sỉ** (ví dụ: 5.000 cốc in logo Trường ĐH Công nghệ trong 30 ngày): so sánh các chào giá, chốt một hoặc nhiều hộ (có **gợi ý phân bổ tối ưu chi phí**), theo dõi tiến độ đến khi nhận hàng.

### Nghệ nhân / Hộ gia đình (Artisan)
- Hồ sơ xưởng: lịch sử gia đình, ảnh xưởng, chứng nhận chất lượng, giờ mở cửa, vị trí trên bản đồ.
- Đăng sản phẩm với nhiều ảnh (kéo thả, sắp xếp) và gắn sản phẩm vào **lô sản xuất**.
- **Nhật ký sản xuất**: thêm từng mốc công đoạn (chọn đất → tạo dáng → vẽ → tráng men → nung → thành phẩm) kèm ảnh minh chứng. Hệ thống tự sinh **tem QR** cho lô để in.
- Hộp **cơ hội báo giá**: chào giá, sửa hoặc rút khi còn hạn, nhận đơn, cập nhật tiến độ, giao hàng.

### Quản trị viên: Ban quản lý / Hội làng nghề (Admin)
- Kiểm duyệt hồ sơ đăng ký hộ nghề (đối chiếu minh chứng), cấp huy hiệu *Hộ nghề xác thực*, tạm khóa tài khoản vi phạm.
- Quản lý tin tức cộng đồng: giá nguyên vật liệu, lịch cúp điện, chính sách hỗ trợ. Có thể ghim tin khẩn.
- Bảng điều phối đơn sỉ toàn làng và bảng thống kê.

## 3. Điểm nhấn kỹ thuật

| Yêu cầu đề bài | Cách vCraft giải quyết |
|---|---|
| 4.1 Nhật ký sản xuất & truy xuất nguồn gốc | Mỗi lô (`Batch`) chứa một mảng mốc (`ProductionStage`), mỗi mốc có ảnh minh chứng. Backend sinh QR (PNG/SVG) trỏ tới link ngắn `/q/{mã-lô}`, link này chuyển hướng 302 tới trang `/truy-xuat/{mã-lô}`. Lô hoàn tất thì nhật ký bị khóa. Mọi sản phẩm cùng lô dùng chung một QR. |
| 4.2 Luồng báo giá & điều phối đơn | Máy trạng thái `DRAFT → SENT → BIDDING → ACCEPTED → IN_PRODUCTION → DELIVERED` (thêm `CANCELLED`, `EXPIRED`). Mọi chuyển trạng thái đi qua một `QuoteStateMachine` duy nhất, chạy trong transaction, dùng **khóa lạc quan theo `version`**: nếu hai thao tác tranh chấp, thao tác sau nhận `409 Conflict`. |
| 4.3 Bản đồ số làng nghề | Leaflet + OpenStreetMap, gom cụm ghim, popup thông tin. Trạng thái mở cửa tính ở server theo múi giờ `Asia/Ho_Chi_Minh`. Nghệ nhân chọn vị trí xưởng bằng cách kéo ghim, địa chỉ tự điền. |
| 4.4 Giao diện & đa phương tiện | Upload nhiều ảnh. Backend dùng `sharp` để kiểm tra, tự xoay ảnh, xóa EXIF/GPS, sinh 3 kích thước WebP và một ảnh mờ (LQIP). Frontend dùng `srcset` và lazy-load. |

## 4. Công nghệ

| Lớp | Công nghệ |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router (library mode), TanStack Query, React Hook Form + Zod, Tailwind CSS, Radix UI, react-leaflet, TipTap |
| Backend | Node.js 22 LTS, Express 5, TypeScript, Prisma ORM, Zod, JWT, bcrypt, multer + sharp, qrcode, helmet, express-rate-limit, pino, node-cron |
| CSDL | PostgreSQL 16. Có thể chuyển sang MySQL 8 chỉ bằng cách đổi `provider` trong Prisma |
| Kiểm thử | Vitest, Supertest, Playwright |
| Hạ tầng | pnpm workspaces, Docker Compose, Nginx, GitHub Actions |

Lý do chọn từng công nghệ và các mẫu thiết kế đã dùng: xem [PRD, mục 7](docs/PRD.md).

## 5. Kiến trúc

```mermaid
flowchart LR
  subgraph Client["Trình duyệt / Điện thoại"]
    SPA["React SPA<br/>React Router · TanStack Query"]
  end
  subgraph Server["Máy chủ"]
    NGINX["Nginx<br/>file tĩnh · SPA fallback · cache /media"]
    API["Express REST API /api/v1<br/>Route → Controller → Service → Repository"]
    JOBS["node-cron<br/>đóng hạn báo giá"]
  end
  DB[("PostgreSQL")]
  FS[("Kho ảnh<br/>local / S3")]
  OSM["OpenStreetMap tiles"]

  SPA -- "fetch · JSON" --> NGINX
  NGINX -- "/api, /q" --> API
  API -- "Prisma ORM" --> DB
  API -- "sharp" --> FS
  NGINX -- "/media" --> FS
  JOBS --> DB
  SPA -. "tile bản đồ" .-> OSM
```

## 6. Cấu trúc thư mục

```text
vcraft/
├── apps/
│   ├── web/                        # Frontend: React SPA
│   │   └── src/
│   │       ├── app/                # router, providers, layouts
│   │       ├── pages/              # component cấp route (mỏng, chỉ ghép feature)
│   │       ├── features/           # chia theo nghiệp vụ
│   │       │   ├── auth/  catalog/  workshops/  map/  traceability/
│   │       │   ├── quotes/  orders/  news/  notifications/  admin/
│   │       │   └── quotes/
│   │       │       ├── api.ts          # gọi REST bằng fetch
│   │       │       ├── hooks.ts        # TanStack Query hooks
│   │       │       └── components/     # UI riêng của nghiệp vụ
│   │       ├── components/ui/      # design system dùng chung
│   │       ├── lib/                # http client, formatters, slugify
│   │       └── styles/             # design tokens
│   └── api/                        # Backend: Express
│       ├── prisma/                 # schema.prisma, migrations, seed
│       └── src/
│           ├── modules/            # mỗi module: routes · controller · service · repository · schema
│           │   ├── auth/  workshops/  products/  batches/  media/
│           │   └── quotes/  orders/  news/  notifications/  admin/
│           ├── core/               # state-machine, storage, image, qr, events, crypto
│           ├── middlewares/        # auth, rbac, validate, upload, rate-limit, error
│           ├── jobs/               # tác vụ định kỳ
│           └── config/
├── packages/
│   └── shared/                     # Zod schema, enum, kiểu dữ liệu dùng chung FE ⇄ BE
├── docs/                           # PRODUCT · PRD · ROADMAP
├── docker-compose.yml
└── README.md
```

## 7. Cài đặt và chạy

**Yêu cầu:** Node.js ≥ 22, pnpm ≥ 9, Docker Desktop.

```bash
git clone <repo-url> vcraft && cd vcraft
pnpm install

cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

docker compose up -d db        # PostgreSQL ở cổng 5432
pnpm db:migrate                # tạo bảng
pnpm db:seed                   # dữ liệu mẫu: 15 xưởng, 120 sản phẩm, 20 lô, 6 yêu cầu báo giá

pnpm dev                       # web: http://localhost:5173 · api: http://localhost:4000
```

Chạy toàn bộ bằng Docker: `docker compose up --build`, sau đó mở http://localhost:8080.

**Quét QR bằng điện thoại khi chạy local:** đặt `APP_URL` thành một địa chỉ điện thoại truy cập được, ví dụ IP LAN `http://192.168.1.10:8080` hoặc đường hầm `cloudflared tunnel --url http://localhost:8080`. QR được sinh theo yêu cầu từ `APP_URL` nên chỉ cần khởi động lại API, không phải sinh lại dữ liệu.

### Biến môi trường chính

| Biến | Ví dụ | Ý nghĩa |
|---|---|---|
| `DATABASE_URL` | `postgresql://vcraft:vcraft@localhost:5432/vcraft` | Chuỗi kết nối CSDL |
| `APP_URL` | `http://localhost:8080` | Địa chỉ công khai, dùng để sinh QR và link trong email |
| `CORS_ORIGIN` | `http://localhost:5173` | Origin frontend được phép gọi API |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | chuỗi ngẫu nhiên ≥ 32 ký tự | Khóa ký token |
| `ACCESS_TOKEN_TTL` / `REFRESH_TOKEN_TTL` | `15m` / `7d` | Thời hạn token |
| `DATA_ENCRYPTION_KEY` | 32 byte, mã hóa base64 | Khóa AES-256-GCM để mã hóa số CCCD trong hồ sơ đăng ký |
| `STORAGE_DRIVER` | `local` hoặc `s3` | Nơi lưu ảnh |
| `UPLOAD_DIR` | `./storage` | Thư mục ảnh khi dùng `local` |
| `SMTP_URL` | `smtp://...` | Gửi email (tùy chọn) |
| `VITE_API_URL` | `/api/v1` | Base URL API cho frontend |

### Tài khoản demo (sau khi seed)

Mật khẩu chung: `Vcraft@2026`. Chỉ dùng cho môi trường demo.

| Vai trò | Email | Ghi chú |
|---|---|---|
| Admin | `admin@vcraft.test` | Ban quản lý làng nghề |
| Nghệ nhân | `ongtu@vcraft.test` | Xưởng gốm Ông Tư, chuyên men lam vẽ tay |
| Nghệ nhân | `minhhai@vcraft.test` | Xưởng gốm Minh Hải, chuyên men rạn |
| Nghệ nhân (chờ duyệt) | `moidangky@vcraft.test` | Dùng để demo kiểm duyệt |
| Khách sỉ | `lan.uet@vcraft.test` | Có sẵn một yêu cầu báo giá đang ở trạng thái `BIDDING` với 4 chào giá |
| Khách lẻ | `minh@vcraft.test` | |
