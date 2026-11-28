# Kế hoạch tinh gọn giao diện và typography vCraft

Ngày lập: 28/11/2026. Trạng thái: đã triển khai trên nhánh `feature/tinh-gon-giao-dien` (28/11/2026); kết quả kiểm tra và việc còn lại ở mục 8.

## 1. Mục tiêu và giới hạn

Giúp người dùng đọc dễ hơn, nhận ra việc cần làm nhanh hơn và thao tác thuận tiện hơn ở các trang bên trong. Giữ bản sắc gốm Bát Tràng và sự phân biệt giữa ba vai trò.

**Giữ nguyên giao diện trang chủ `/` đã được chủ dự án đồng ý.** Bao gồm bố cục, phông chữ, màu sắc, hình ảnh, hoa văn, header/footer, hiệu ứng và trải nghiệm trên điện thoại. Các thay đổi ở thành phần dùng chung phải được giới hạn theo phạm vi hoặc có biến thể riêng để trang chủ giữ cách hiển thị hiện tại.

Trong phạm vi:

- Khu khách hàng `/account/**`.
- Khu nghệ nhân `/dashboard/artisan/**` và Ban quản lý `/dashboard/admin/**`.
- Đăng nhập, đăng ký, quên/đặt lại mật khẩu.
- Các trang công khai ngoài trang chủ: sản phẩm, nghệ nhân, bản đồ, tin tức, báo giá sỉ, quét QR và truy xuất.
- Các màn thông báo, lỗi và không có quyền truy cập liên quan đến những luồng trên.

Không mở rộng tính năng, thay đổi API, cơ sở dữ liệu, phân quyền hoặc quy tắc báo giá. Kế hoạch này là một đợt cải thiện UI sau khi nền tảng đã hoạt động ổn định.

## 2. Cơ sở đánh giá hiện tại

Các nhận định sau dựa trên mã nguồn và tài liệu thiết kế, chưa phải kết quả kiểm tra giao diện trực tiếp trên trình duyệt. Giai đoạn đầu phải chụp màn hình và xác nhận mức độ ảnh hưởng trước khi sửa.

| Quan sát từ mã nguồn | Ảnh hưởng cần xác minh | Nguồn |
|---|---|---|
| `h1`, `h2` mặc định dùng Phudu, in hoa, line-height khoảng 1; `h3` dùng Alegreya | Tiêu đề ở màn thao tác có thể quá mạnh, thiếu nhất quán và chật khi xuống dòng tiếng Việt | `src/app/globals.css` |
| Root nạp Phudu, Alegreya, Be Vietnam Pro, JetBrains Mono; khu khách hàng nạp thêm Chakra Petch | Nhiều giọng chữ cùng xuất hiện trong một tác vụ; cần phân định rõ vai trò từng font | `src/app/layout.tsx`, `src/app/account/layout.tsx` |
| `PageHeader`, `Stat`, `EmptyState`, `Dialog` dùng các kiểu display/serif khác nhau | Sửa từng trang riêng lẻ dễ tiếp tục tạo ra nhiều biến thể | `src/components/ui/primitives.tsx`, `src/components/ui/dialog.tsx` |
| Khu khách hàng có nền vân dệt, tám nấc nâu, biên răng cưa, đường khâu và số lớn | Nhiều lớp trang trí có thể cạnh tranh với dữ liệu và nút thao tác | `src/styles/weave.css`, `src/components/weave/*`, `src/app/account/page.tsx` |
| Sidebar, thẻ số liệu và các khối thông báo của dashboard dùng nhiều mảng màu đậm | Mức nhấn giữa điều hướng, dữ liệu và việc cần xử lý có thể chưa rõ | `src/components/layout/zone-shell.tsx`, các trang tổng quan dashboard |
| Có nhãn 10–11px, nhãn menu di động khoảng 0.64rem; ô nhập mặc định 15px | Khó đọc trên điện thoại; cần kiểm tra dấu tiếng Việt và hiện tượng tự zoom ô nhập trên iOS | `weave-shell.tsx`, `quote-room.tsx`, `stepper.tsx`, `form.tsx` |
| Layout công khai và nhiều component được dùng chung với trang chủ | Thay font, token màu hoặc tắt chuyển động toàn cục có thể làm thay đổi trang chủ | `src/app/(site)/layout.tsx`, `src/components/exhibition/*`, `src/components/motion/*` |

Tài liệu liên quan: [DESIGN.md](../DESIGN.md), [hướng thiết kế khu khách hàng](../.impeccable/surfaces/src-app-account-page-tsx.md), [hướng thiết kế ban đầu](../.impeccable/surfaces/src-app-page-tsx.md).

Khu khách hàng đã có lựa chọn riêng về “Tấm dệt” và bảng nâu men. Đợt này tinh giản trong hướng đó; không tự thay bằng sidebar và lưới thẻ đại trà. Phòng báo giá đang có yêu cầu trình diễn huy hiệu `Record vN · Optimistic Lock` và thanh sáu trạng thái: giữ đầy đủ, chỉ điều chỉnh mức nhấn và khả năng đọc. Mọi thay đổi lớn hơn cần được ghi rõ trong tài liệu thiết kế trước khi thực hiện.

## 3. Hướng thiết kế đích

### 3.1. Chữ phục vụ tác vụ

Dùng **Be Vietnam Pro làm font chính của các màn thao tác**, gồm tiêu đề chức năng, menu, biểu mẫu, bảng, nút và thông báo. Tận dụng font hiện có, không thêm font mới trong đợt này.

| Vai trò chữ ngoài trang chủ | Cỡ dự kiến | Weight / line-height | Quy tắc |
|---|---|---|---|
| Tiêu đề trang chức năng | 24–32px | 600–700 / 1.25–1.35 | Viết hoa đầu câu; một `h1` mỗi trang |
| Tiêu đề nhóm | 18–22px | 600 / 1.35–1.45 | Phân biệt bằng cỡ và khoảng cách |
| Tiêu đề mục nhỏ | 16–18px | 600 / 1.4–1.5 | Cùng họ chữ với nội dung |
| Nội dung | 15–16px | 400 / 1.55–1.7 | Ưu tiên 16px trên điện thoại |
| Menu, nút, nhãn trường | 14–16px | 500–600 / 1.4–1.5 | Ô nhập tối thiểu 16px trên điện thoại |
| Mô tả phụ, thời gian, badge | 12–14px | 400–600 / 1.45–1.6 | Thông tin quyết định thao tác tối thiểu 14px |
| Số liệu tổng quan | 28–36px | 600–700 / 1.15–1.25 | Dùng `tabular-nums`, đồng bộ đơn vị |
| Mã lô, mã yêu cầu | 13–14px | 400–500 / 1.45–1.6 | JetBrains Mono, cho phép sao chép/ngắt dòng phù hợp |

Các cỡ trên là đích ban đầu; chốt sau khi thử nội dung thật ở bước 2.

- Phudu giữ nguyên ở trang chủ; ngoài trang chủ chỉ giữ ở dấu hiệu nhận diện có chủ đích, không dùng làm mặc định cho tiêu đề công việc.
- Alegreya dành cho trích dẫn, câu chuyện nghệ nhân hoặc nội dung biên tập. Tên sản phẩm/xưởng trong bảng và danh sách thao tác dùng sans.
- Chakra Petch có thể giữ ở tên “Tấm dệt” và một điểm nhấn nhận diện; menu, số liệu và nội dung tác vụ chuyển về sans. Không thay hướng nhận diện của toàn khu.
- Mỗi vùng thao tác chỉ có một font nội dung; mono là ngoại lệ cho mã. Không phối nhiều font để tạo cấp bậc.
- Giảm chữ in hoa, chữ nghiêng và tracking rộng ở nhãn nhỏ. Dùng các weight thực sự đã nạp, ưu tiên 400/500/600/700.
- Thử chuỗi có dấu như “Đơn sỉ đang chờ xử lý”, “Nguyễn Thị Hương”, “Xưởng gốm Bát Tràng”, cùng tên dài và giá trị tiền lớn. Không cắt dấu hoặc chồng dòng.

### 3.2. Giảm nhiễu thị giác

- Nền nội dung là màu ngà/sứ hoặc nền tối tương ứng; màu đặc tập trung ở nhận diện khu, trạng thái và hành động chính.
- Mỗi nhóm tác vụ có một nút chính nổi bật. Nút phụ dùng outline/ghost; hành động nguy hiểm được tách rõ.
- Dùng khoảng trắng và đường phân cách nhẹ để nhóm dữ liệu. Tránh nhiều lớp khung, viền, bóng và hoa văn quanh cùng một nội dung.
- Hoa văn không nằm sau đoạn chữ dài, bảng so sánh hoặc ô nhập. Giữ hoa văn ở mép/dải nhận diện với độ tương phản thấp.
- Badge có nhãn rõ ràng; giữ ký hiệu trạng thái hiện có. Không phân biệt trạng thái chỉ bằng màu.
- Chuyển động ở màn thao tác ngắn, khoảng 120–200ms. Không dùng tilt, parallax hoặc hiệu ứng chờ cuộn mới hiện dữ liệu quan trọng.
- Giữ hỗ trợ sáng/tối và giảm chuyển động. Điều chỉnh ngoài trang chủ bằng phạm vi riêng.

### 3.3. Bố cục và điều hướng

- Một khung nội dung nhất quán trong mỗi khu: tiêu đề → mô tả ngắn → hành động → dữ liệu.
- Khoảng cách theo thang 4/8/12/16/24/32px; lề điện thoại tối thiểu 16px; nhóm nội dung cách nhau 24–32px.
- Form thông thường rộng khoảng 640–720px; đoạn đọc dài khoảng 60–75 ký tự mỗi dòng. Bảng dữ liệu và bản đồ được dùng khung rộng hơn.
- Khu khách hàng giữ dải điều hướng và bảng nâu men; dùng nền các mục ít tương phản hơn, nhấn rõ mục đang mở, bỏ thay đổi chiều cao gây xê dịch nếu xác nhận có vấn đề.
- Khu nghệ nhân/Ban quản lý giữ shell hiện tại; giảm độ đậm của nền sidebar/thẻ số liệu khi cần, thống nhất thứ bậc tiêu đề.
- Trên điện thoại ưu tiên tối đa năm mục tổng cộng ở thanh đáy, gồm “Khác”. Rà lại shell dashboard hiện dùng sáu cột; đưa mục ít dùng vào “Khác”, vẫn truy cập đủ chức năng và badge.
- Form dài chia theo nhóm có tiêu đề và mô tả; bộ lọc ít dùng có thể thu gọn. Thông tin cần để ra quyết định và lỗi nhập liệu luôn dễ thấy.

## 4. Thứ tự triển khai và đầu ra

Ước lượng 7–10 ngày công cho một người, tùy kết quả rà soát. Đây là ước lượng cho đợt UI, không thay lịch sản phẩm hiện tại. Thực hiện tuần tự theo các mốc dưới đây.

### Bước 1 — Ghi nhận hiện trạng và bảo vệ trang chủ · 0,5–1 ngày

- [x] Chụp ảnh trước thay đổi ở 360, 390, 768 và 1440px, cả sáng/tối; dùng dữ liệu seed ổn định và tài khoản đủ ba vai trò.
- [x] Lưu bộ ảnh trang chủ gồm đầu trang, các phần giữa, cuối trang và menu di động. Ghi cả trạng thái hiệu ứng để so sánh đúng thời điểm.
- [x] Lập danh sách component dùng chung với trang chủ: header/footer, card triển lãm, nút, typography, motion và token.
- [x] Rà màn đại diện: tổng quan khách hàng, tạo yêu cầu, phòng báo giá, danh sách lô, form sản phẩm, điều phối quản trị, đăng nhập, danh mục và chi tiết sản phẩm.
- [x] Với mỗi vấn đề, ghi ảnh, route, mức ảnh hưởng và cách sửa dự kiến; phân biệt lỗi đọc/thao tác với trang trí thuần túy.

**Đầu ra:** bộ ảnh hiện trạng và danh sách vấn đề theo ưu tiên; xác định ranh giới CSS trước khi sửa.

### Bước 2 — Chuẩn hóa typography và thành phần cơ bản · 1–1,5 ngày

- [x] Tạo phạm vi giao diện thao tác, ví dụ `.ui-operate`, tại shell của `/account`, dashboard và auth; phạm vi cho trang công khai bên trong phải loại trừ `/` rõ ràng.
- [x] Định nghĩa token typography, khoảng cách, nền và viền theo phạm vi. Giữ nguyên token gốc của trang chủ; không thay trực tiếp mọi `h1/h2/h3` toàn ứng dụng.
- [x] Nếu cần biến thể cho `PageHeader`, `Stat`, `EmptyState`, `Dialog`, button, form hoặc card, giữ mặc định cũ cho nơi đang dùng trên trang chủ.
- [x] Thử mẫu gồm tiêu đề dài, form có lỗi, bảng, badge và trạng thái rỗng ở cả hai theme. Kiểm tra CSS layer và utility class để quy tắc mới thực sự có hiệu lực.
- [x] Thử điều hướng `/` → trang bên trong → `/`, cả tải lại trực tiếp và điều hướng client, để phát hiện CSS bị lưu và ảnh hưởng ngược trang chủ.

**Đầu ra:** bộ quy tắc chữ và component nhất quán, có màn mẫu trước/sau để đối chiếu.

### Bước 3 — Tinh gọn khu khách hàng · 1,5–2 ngày

- [x] Giữ bản sắc nâu men và cấu trúc dải “Tấm dệt”; giảm vân nền, đường khâu và biên răng cưa lặp lại quanh vùng làm việc.
- [x] Thu nhỏ số liệu trang tổng quan; ưu tiên “Việc chờ bạn”, đơn đang chạy và lịch sắp tới. Các phần đã lưu/lịch sử dùng nhịp trình bày nhẹ hơn.
- [x] Tăng độ đọc của menu di động, đồng nhất kích thước mục và trạng thái đang chọn.
- [x] Chuẩn hóa danh sách đơn, lịch hẹn, đánh giá, thông báo và hồ sơ theo cùng hệ chữ/khoảng cách.
- [x] Với quote wizard và quote room: tách rõ tóm tắt yêu cầu, tiến độ, chào giá và hành động tiếp theo; làm gọn metadata kỹ thuật.
- [x] Giữ huy hiệu phiên bản và sáu trạng thái theo yêu cầu hiện có; thông báo xung đột dữ liệu vẫn rõ ràng, không ảnh hưởng logic khóa lạc quan.
- [ ] Kiểm tra dữ liệu rỗng, nhiều đơn, tên xưởng dài, nhiều chào giá, lỗi biểu mẫu và trạng thái hết hạn.

**Tệp trọng tâm:** `src/styles/weave.css`, `src/components/weave/*`, `src/app/account/**`, `src/components/quotes/*`, `src/components/account/*`.

**Đầu ra:** một khu khách hàng dễ đọc hơn, vẫn nhận diện được “Tấm dệt” và thao tác đầy đủ.

### Bước 4 — Đồng bộ khu nghệ nhân và Ban quản lý · 1–1,5 ngày

- [x] Áp dụng typography mới vào `ZoneShell`, tiêu đề, thống kê, danh sách và biểu mẫu.
- [x] Thẻ số liệu dùng nền nhẹ; giữ màu nhấn theo vai trò. Cảnh báo cần xử lý nổi bật hơn số liệu thường.
- [x] Bảng có thứ bậc rõ: tên/mã chính → thông tin phụ → trạng thái → hành động. Trên điện thoại dùng thẻ hoặc vùng cuộn ngang có chủ đích.
- [x] Chỉnh form sản phẩm, hồ sơ xưởng, quản lý lô và news editor; thống nhất nhãn, trợ giúp, lỗi và vị trí nút lưu.
- [x] Kiểm tra thanh điều hướng đáy, menu “Khác”, badge thông báo và vùng an toàn điện thoại.
- [x] Giữ đủ dữ liệu so sánh trong điều phối; tránh thu gọn làm mất thông tin cần chốt đơn.

**Tệp trọng tâm:** `src/components/layout/zone-shell.tsx`, `src/components/layout/zones.ts`, `src/app/dashboard/**`, `src/components/artisan/*`, `src/components/admin/*`, `src/components/charts/*`.

**Đầu ra:** dashboard hai vai trò có cùng quy tắc đọc và thao tác, phân biệt bằng điểm nhấn màu.

### Bước 5 — Auth và các trang công khai ngoài trang chủ · 1–1,5 ngày

- [x] Auth: giảm sức nặng của mảng trang trí; ưu tiên form, tăng khoảng thở và độ rõ của nhãn/lỗi, giữ khác biệt giữa các cổng vai trò.
- [x] Danh mục sản phẩm/nghệ nhân: làm gọn bộ lọc, thống nhất card và khoảng cách; giữ dữ liệu lọc, số kết quả và thao tác xóa lọc dễ thấy.
- [x] Chi tiết sản phẩm/xưởng/tin tức: tách giọng kể chuyện với giá, lịch, trạng thái và thao tác; cân lại độ dài dòng.
- [x] Bản đồ: giảm chồng lớp bộ lọc, popup và thông tin xưởng; giữ thao tác bản đồ và danh sách dễ tiếp cận trên điện thoại.
- [x] Truy xuất/QR: ưu tiên mã lô, nguồn gốc và các công đoạn; không làm thay đổi bản in tem hoặc chức năng quét.
- [x] Rà thông báo, forbidden/not-found/error để đồng nhất chữ và hành động khôi phục.
- [x] Component triển lãm dùng trên trang chủ phải có biến thể riêng khi thay đổi. Header/footer chung giữ diện mạo trang chủ hiện tại.

**Tệp trọng tâm:** `src/components/auth/*`, `src/app/(auth)/**`, `src/app/(site)/**` ngoài `page.tsx` trang chủ, `src/components/exhibition/*`, `src/components/map/*`, `src/components/trace/*`, `src/components/news/*`.

**Đầu ra:** các trang còn lại đồng bộ với hệ chữ mới và không tác động trang chủ.

### Bước 6 — Kiểm tra, đối chiếu và cập nhật tài liệu · 1–2 ngày

- [x] So ảnh trước/sau của trang chủ ở cùng viewport, theme và dữ liệu. Chờ font/ảnh tải xong, cố định thời điểm animation và che dữ liệu động khi cần. Mọi khác biệt ngoài nhiễu render phải được giải thích hoặc hoàn tác.
- [x] So ảnh các màn đại diện đã sửa; thử trực tiếp bằng bàn phím, chuột và điện thoại.
- [x] Kiểm tra font tải chậm/fallback, dấu tiếng Việt, tên dài, số tiền lớn và zoom 200%.
- [x] Chạy kiểm tra kỹ thuật ở mục 6; ghi rõ lỗi tồn tại trước đợt UI nếu có.
- [x] Cập nhật `DESIGN.md` và tài liệu `.impeccable/surfaces` tương ứng với hướng đã thực hiện; giữ nguyên hướng trang chủ. Đồng bộ `.impeccable/design.json` nếu token liên quan thay đổi.
- [x] Ghi những route đã kiểm tra và vấn đề còn lại; sửa các lỗi cản trở đọc, nhập liệu hoặc điều hướng trước khi kết thúc.

**Đầu ra:** ảnh trước/sau, kết quả kiểm tra và tài liệu thiết kế thống nhất với mã nguồn.

## 5. Tiêu chí nghiệm thu

- [x] Trang chủ giữ nguyên diện mạo và tương tác trên desktop/mobile, sáng/tối, kể cả sau khi đi qua trang đã sửa.
- [x] Các màn thao tác dùng Be Vietnam Pro nhất quán; font nhận diện/nội dung kể chuyện chỉ xuất hiện đúng vai trò.
- [x] Không còn nhãn menu hoặc thông tin cần ra quyết định ở cỡ 10–11px; ô nhập trên điện thoại tối thiểu 16px.
- [x] Tiêu đề tiếng Việt không mất dấu, đè dòng hoặc tràn khung ở 360px và khi zoom 200%.
- [x] Mỗi nhóm tác vụ có hành động chính rõ; trạng thái, lỗi và việc chờ xử lý dễ phân biệt hơn trang trí.
- [x] Chữ thường đạt tương phản tối thiểu 4.5:1, chữ lớn 3:1; thành phần điều khiển/focus đủ rõ ở cả sáng và tối. Đo trên màu nền thực tế sau khi áp opacity/hoa văn.
- [x] Vùng chạm của nút/menu chính đạt tối thiểu 44×44px; focus không bị che, thứ tự Tab hợp lý, dialog/menu dùng được bằng bàn phím.
- [x] Trang không tràn ngang ở 360px; bảng rộng có vùng cuộn riêng. Thanh đáy và bàn phím ảo không che nút lưu hoặc lỗi.
- [x] Dữ liệu quan trọng hiện ngay; chế độ giảm chuyển động hoạt động; các animation trang chủ được giữ nguyên.
- [ ] Trạng thái rỗng, tải và lỗi có cách trình bày đồng nhất; không tự bổ sung luồng nghiệp vụ mới.
- [ ] Các luồng đăng nhập, tạo/so/chốt báo giá, quản lý sản phẩm/lô, đặt lịch, quét QR và duyệt hồ sơ vẫn hoạt động theo quyền hiện tại.

## 6. Cách kiểm tra kỹ thuật

Khi triển khai UI, chạy từ thư mục gốc:

```powershell
npm run typecheck
npx eslint src
npm test
npm run build
```

`package.json` hiện đặt `lint` là `next lint`; dùng ESLint CLI trực tiếp cho đợt này thay vì dựa vào script đó. Chỉ điều chỉnh script trong thay đổi riêng nếu cần.

Kiểm tra ảnh có thể dùng Playwright đã có trong devDependencies; lưu baseline trước khi sửa. Ưu tiên vài màn đại diện và kiểm tra hồi quy trang chủ; không viết test chi tiết chỉ để xác nhận class CSS. Với môi trường có DB, tài khoản và biến môi trường đầy đủ, chạy các luồng nghiệp vụ theo checklist trên. Nếu thiếu điều kiện, ghi rõ phần chưa kiểm chứng.

## 7. Thứ tự ưu tiên khi cần chia nhỏ

| Mức | Việc | Điều kiện kết thúc |
|---|---|---|
| P0 | Baseline trang chủ, ranh giới CSS, hệ chữ và component chung | Trang chủ không bị ảnh hưởng; màn mẫu có typography đúng |
| P1 | Khu khách hàng, phòng báo giá, form và điều hướng di động | Luồng đọc/nhập/so sánh thông tin rõ ràng, không mất chức năng |
| P1 | Dashboard nghệ nhân và Ban quản lý | Bảng, số liệu, trạng thái và hành động thống nhất |
| P2 | Auth, các trang công khai còn lại, tinh chỉnh trang trí | Hoàn tất phạm vi ngoài trang chủ và tài liệu thiết kế |

Mỗi đợt sửa phải kèm kiểm tra trang chủ, ảnh trước/sau và smoke test luồng bị tác động. Nếu cần rút ngắn thời gian, dời phần trang trí P2 sang đợt sau; không bỏ việc bảo vệ trang chủ hoặc sửa lỗi khả năng đọc.

## 8. Kết quả triển khai (28/11/2026)

### Đã làm

- **Phạm vi thao tác `.ui-operate`** (`src/styles/operate.css`, nạp ở `src/app/layout.tsx`): gắn ở khung Tấm dệt, `ZoneShell`, `<main>` của khu xác thực, `<main>` của khu công khai qua `SiteMain` (bỏ qua đường dẫn `/`), và `MissingTile` (404, 403, lỗi). Tiêu đề Be Vietnam Pro chữ thường theo thang cố định (h1 24 → 28px, h2 18 → 20px, h3 17px, số tổng quan 28 → 32px); `.font-display`, `.title-*`, `.font-serif` đổi nghĩa trong phạm vi; lối thoát `.dau-hieu` (dấu hiệu nhận diện) và `.giong-ke` (giọng kể Alegreya); sàn cỡ chữ 12px; ô nhập 16px trên điện thoại; nội dung không ẩn chờ cuộn, không nghiêng 3D, không parallax.
- **Thành phần cơ bản:** `PageHeader` (h1 thao tác), `Stat` (nền nhẹ, vạch màu vai trò), `EmptyState`, `Dialog`, `Field` (lỗi và gợi ý 14px), `Stepper` (nhãn 12-13px, bỏ vòng nhấp nháy), `MoneyInput` (số Be Vietnam Pro), `ImageUploader` (bỏ chữ 10-11px). Không sửa trực tiếp thành phần nào trang chủ đang dùng; thẻ tác phẩm, thẻ xưởng, chuông, menu tài khoản đổi qua phạm vi.
- **Khu khách hàng:** Chakra Petch chỉ còn ở tên "Tấm dệt"; trang tổng quan giữ ba dải nhuộm cho việc đang chạy, bốn dải nhẹ cho lịch sử; răng cưa từ 7 xuống 3 đường; vân nền mờ một nửa, không hoa văn sau chữ, bỏ vân rạn; đường khâu chỉ còn ở việc gấp; sọc biên cùng nền, mục đang mở nổi bằng màu dải và vạch vàng; thanh đáy năm ô bằng nhau, nhãn 13px; bỏ dệt vào, con thoi, cuộn bắt dải. Phòng báo giá: tiêu đề → mã, trạng thái, huy hiệu Record → tóm tắt → 6 trạng thái → "Việc tiếp theo của bạn"; bảng chào giá viết hoa đầu câu, giá là số dạng bảng; cảnh báo 409 nền đặc. Phiếu yêu cầu: mỗi bước có tiêu đề và lời dẫn.
- **Nghệ nhân và Ban quản lý:** một `h1` mỗi trang (trước đó nhiều trang dùng `h2` 30px làm tiêu đề trang); tiêu đề nhóm Be Vietnam Pro; ô số liệu nền nhẹ, bỏ khung ghép lồng; đầu cột bảng viết hoa đầu câu; mono chỉ còn ở mã; danh sách lô trên điện thoại thành thẻ; thanh đáy 4 mục + "Khác" (có số đếm cộng dồn), nhãn 12px; nhãn trục biểu đồ 12px; tên khu trên thanh bên giữ Phudu làm dấu hiệu.
- **Xác thực và trang công khai:** bức ghép bên trái trang đăng nhập gọn còn ảnh + một viên hoa văn + viên tên cổng, cột biểu mẫu rộng hơn; tiêu đề trang công khai 28-32px Be Vietnam Pro; câu chuyện tác phẩm, khẩu hiệu và lời khách của xưởng, bài bản tin giữ Alegreya (`.giong-ke`); giá và thông số tách khỏi giọng kể. Bản đồ giữ nguyên bố cục (bộ lọc đã nằm ngoài bản đồ trên điện thoại).

### Thành phần dùng chung với trang chủ (bước 1)

Đầu trang, chân trang, `ConciergeDrawer`, `SmoothScroll`, `DemoBar`, `MotionRuntime`, `Button`/`ButtonLink`, `SectionHeading`, `VImage`, `ProductCard`, `ArtisanCard`, `GlazeExplorer`, `MosaicHero`, `HistoryJourney`, `MuralBand`, `JourneyRail`, `ornaments`, `RevealText`, `Logo`, `NotificationBell`, `UserMenu`, token và kiểu `h1/h2/h3` gốc trong `globals.css`. Tất cả giữ nguyên mặc định; khác biệt ngoài trang chủ đi qua `.ui-operate`.

### Kiểm tra

| Hạng mục | Kết quả |
|---|---|
| Trang chủ: dấu vân kiểu dáng (computed style và kích thước của khoảng 1.570 phần tử), 360/390/768/1440px × sáng/tối, so với mốc trước khi sửa | 0 khác biệt ở cả 8 tổ hợp; mốc đo lại hai lần trước khi sửa cũng 0 khác biệt |
| Điều hướng client `/products` → `/` | 0 khác biệt so với mốc |
| `/` → Tấm dệt → `/`, `/` → dashboard → `/` | Chỉ khác lớp mờ chờ tải của 6 ảnh (ảnh đã có trong bộ nhớ đệm); không khác kiểu chữ, màu, kích thước |
| Tương phản chữ, 40 route × sáng/tối, đổi chế độ bằng nút trên trang | 0 chỗ dưới 4.5:1 (3:1 cho chữ lớn); không tính nút đang tắt và chữ đè lên ảnh |
| Tràn ngang ở 360px và 720px (tương đương zoom 200%), 47 route của bốn vai trò | Không tràn |
| Bàn phím: 30 lần Tab ở `/account`, `/dashboard/artisan`, `/login` | Mọi phần tử nhận focus có viền; thẻ có liên kết phủ cả thẻ hiện viền 2px quanh thẻ |
| Biểu mẫu | Lỗi 14px, tiếng Việt; ô nhập 16px trên điện thoại |
| `npm run typecheck`, `npx eslint src`, `npm run build` | Sạch |
| `npm test` | 27/27. Chạy từ đường dẫn `D:\vCraft`; Vitest 5 trên Windows báo lỗi runner khi thư mục làm việc viết ổ đĩa chữ thường (`d:\vCraft`) – lỗi môi trường, có cả trên mã trước đợt này |

### Lỗi có sẵn đã sửa trong đợt

- Ô chọn phân loại, dòng men, chuyên mục để trống hiện lỗi tiếng Anh "Invalid enum value…" (phiếu yêu cầu, sản phẩm, lô, bản tin).
- Danh sách sản phẩm của nghệ nhân tràn ngang ở 360px (rãnh lưới không co).
- Con dấu ở trang truy xuất thò ra mép phải ở 720px.
- Chữ "Hộ nghề xác thực" trên trang xưởng gần như không đọc được ở chế độ tối.
- Dòng phụ dưới tên khu trên thanh bên nghệ nhân 3.6:1.

### Còn lại, chưa kiểm chứng

- Chưa chạy trọn các luồng nghiệp vụ (tạo/so/chốt báo giá, quản lý sản phẩm/lô, đặt lịch, quét QR, duyệt hồ sơ); đợt này chỉ kiểm tra hiển thị và kiểm lỗi biểu mẫu. Không đổi API, cơ sở dữ liệu, phân quyền hay quy tắc báo giá; chỉ đổi lời báo lỗi của ô chọn danh mục.
- Chưa có tài khoản khách trống để xem trạng thái rỗng của Tấm dệt; chưa thử chào giá hết hạn.
- Ảnh màn bên trong chụp ở 390 và 1440px chế độ sáng; trang chủ đủ 4 cỡ × 2 chế độ.
- Nhãn "Có nhật ký lô" trên thẻ tác phẩm (dùng chung trang chủ) đè lên ảnh nên không đo được bằng màu nền; giữ nguyên.
- Thanh bên nghệ nhân và Ban quản lý giữ nền men đậm theo vai trò vì là dấu hiệu khu; chỉ thẻ số liệu được làm nhẹ.
