# Product

<!-- impeccable:product-schema 1 -->

> Bản ghi product truth cho các vòng thiết kế. Rút gọn từ [docs/PRODUCT.md](docs/PRODUCT.md) và [docs/PRD.md](docs/PRD.md), hai tài liệu chủ dự án đã duyệt. Chi tiết đầy đủ nằm ở đó; khi hai nơi lệch nhau, sửa cả hai.

## Platform

web

## Users

- **Khách hàng (vai trò BUYER)**, hai kiểu chính:
  - *Khách sỉ* như chị Lan, chuyên viên hành chính một trường đại học: cần 5.000 cốc in logo trong một tháng, ngân sách có hạn, sợ một xưởng làm không kịp và giá thiếu minh bạch. Việc của chị: gửi một yêu cầu báo giá, so các chào giá trên cùng mặt bằng, chốt một hoặc nhiều xưởng, theo dõi tiến độ từng phần đơn, nhận hàng và đánh giá.
  - *Khách tham quan* như Minh, sinh viên đi xe buýt xuống Bát Tràng cuối tuần: muốn đặt một buổi nặn gốm, lưu những món và xưởng mình thích, quét tem QR xem nguồn gốc ngay tại quầy, để lại đánh giá sau buổi trải nghiệm.
- **Nghệ nhân / hộ nghề (ARTISAN)**: bác Tư 62 tuổi dùng Android 6 inch, con gái Hà 30 tuổi lo phần online. Ghi nhật ký lô, đăng sản phẩm, chào giá, đón khách trải nghiệm.
- **Ban quản lý làng (ADMIN)**: anh Hùng, cán bộ Hội làng nghề. Duyệt hộ, đăng tin, điều phối đơn lớn, khóa tài khoản vi phạm.

## Product Purpose

vCraft là triển lãm số của một làng nghề, do chính Ban quản lý làng vận hành, thí điểm với gốm Bát Tràng. Nó trả lời ba câu hỏi: món này có thật do làng làm không (QR truy xuất lô + huy hiệu hộ nghề xác thực), đến làng thì ghé xưởng nào (bản đồ xưởng đang mở cửa, đặt lịch trải nghiệm), và cần số lượng lớn thì đặt ai (sàn báo giá kín, chia đơn cho nhiều hộ).

Đây là bài tập lớn: thành công là chạy trọn kịch bản demo 15 phút không lỗi bằng dữ liệu seed và một điện thoại thật để quét QR, đạt mọi yêu cầu P0 trong PRD.

## Positioning

"Mỗi món đồ có một câu chuyện, và bạn có thể kiểm chứng nó." Không phải sàn thương mại điện tử: không có giỏ hàng bán lẻ, không thanh toán trực tuyến. Giá trị khác biệt là nhật ký sản xuất có ảnh thật cho từng lô (bị khóa khi lô hoàn tất), con dấu xác thực của Ban quản lý, và báo giá kín có gợi ý phân bổ nhiều xưởng.

## Operating Context

- Khách sỉ làm việc trên máy tính văn phòng, quay lại nhiều lần trong vài tuần để xem chào giá, chốt, theo dõi tiến độ và xác nhận nhận hàng từng phần.
- Khách tham quan dùng điện thoại ngoài trời, tại xưởng: đặt lịch, xem lịch sắp tới, quét QR dưới đáy bình.
- Từ ngữ của làng: mẻ, lò, men, mộc, lô, công đoạn, ra lò, chào giá, chốt, chia đơn.
- Khu khách hàng nằm ở `/account` (tổng quan, báo giá, lịch trải nghiệm, đã lưu, đánh giá, thông báo, tài khoản); cổng đăng nhập riêng cho từng vai trò.

## Capabilities and Constraints

- Khách hàng: tạo yêu cầu báo giá 3 bước có tự lưu nháp; so sánh chào giá, gợi ý phân bổ, chốt nhiều xưởng (khóa phiên bản, báo khi xưởng vừa đổi giá); theo dõi từng phần đơn gắn với lô sản xuất; xác nhận nhận hàng; đặt / hủy lịch trải nghiệm; yêu thích sản phẩm và xưởng; đánh giá sau buổi trải nghiệm hoặc đơn đã giao; thông báo trong ứng dụng; hồ sơ, đổi mật khẩu, phiên đăng nhập, quên mật khẩu; quét QR bằng camera.
- Ngoài phạm vi: thanh toán, vận chuyển, chat thời gian thực, ứng dụng native, giỏ hàng bán lẻ.
- Kỹ thuật: Next.js App Router, React 19, TypeScript strict, Tailwind v4, Prisma + PostgreSQL. Không dùng SQL thô. Giao diện tiếng Việt.
- Hệ thống không khóa vào nghề gốm: đặc thù nghề nằm trong dữ liệu seed (danh mục, mẫu công đoạn).

## Brand Commitments

- Tên **vCraft** (chữ v gợi Việt, village, động tác vuốt gốm). Slogan: *Tinh hoa làng nghề, muôn phương lan tỏa.*
- Con dấu (triện) đất nung là chữ ký của Ban quản lý trên huy hiệu xác thực và tem QR.
- Ảnh thật là nhân vật chính: bàn tay, nét vẽ, bề mặt men; không ảnh stock nước ngoài.
- Giọng văn: xưng "bạn", câu ngắn, ấm, dùng từ của làng nghề; không viết lỗi kỹ thuật kiểu "Error 409" hay "Không có dữ liệu".
- Chủ dự án đã chốt thế giới hình ảnh "Con đường gốm sứ" (ghi trong DESIGN.md) và đặc biệt thích trang đăng nhập; các khu theo vai trò phải có bản sắc riêng, không dùng chung một khung.

## Evidence on Hand

- Ảnh Wikimedia Commons có ghi nguồn trong `public/seed/*.webp` (sidecar `*.webp.json`), danh sách ở `scripts/seed-images.json`.
- Dữ liệu seed: các hộ, sản phẩm, lô có nhật ký, yêu cầu báo giá, lịch trải nghiệm, đánh giá, tin tức.
- Không có khách hàng thật, lời chứng thực, số liệu vận hành hay báo chí. Không được bịa.

## Product Principles

1. Ảnh là nhân vật chính; chữ dẫn chuyện cho ảnh.
2. Luôn cho biết người dùng đang ở bước nào: stepper cho biểu mẫu nhiều bước, dòng thời gian trạng thái cho báo giá, đơn và lịch.
3. Không làm mất dữ liệu: tự lưu nháp, hỏi xác nhận trước thao tác không hoàn tác được.
4. Phản hồi tức thì: không tải lại trang, skeleton khi tải, toast khi xong.
5. Nghệ nhân dùng được bằng một tay trên điện thoại.

## Accessibility & Inclusion

WCAG 2.1 AA: vùng bấm tối thiểu 44 px, chữ nội dung tối thiểu 16 px, tôn trọng `prefers-reduced-motion`, chế độ tối. Người dùng lớn tuổi (nghệ nhân) cần chữ to, nút lớn, thông báo rõ.
