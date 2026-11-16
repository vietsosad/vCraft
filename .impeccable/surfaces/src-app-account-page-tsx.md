---
version: 1
slug: "src-app-account-page-tsx"
primary_target: "src/app/account/page.tsx"
related_targets: ["src/app/account/layout.tsx"]
---

Scope: khu khách hàng /account (tổng quan, đơn sỉ, lịch trải nghiệm, đã lưu, sổ truy xuất, đánh giá, thư, hồ sơ). Mode: Operate.
Audience: chị Lan (khách sỉ, máy tính văn phòng, quay lại nhiều lần trong vài tuần) và Minh (khách tham quan, điện thoại, ngoài trời). Job: biết ngay việc gì đang chờ mình (chào giá cần so, buổi nặn gốm sắp tới, thư mới), làm tiếp việc đó, và giữ lại những gì mình đã gắn bó với làng.
Constraints: thế giới "Con đường gốm sứ" (DESIGN.md) giữ nguyên; phải hòa với trang đăng nhập (bức ghép ảnh thật + viên hoa văn trên mạch vữa) mà chủ dự án rất thích; không dùng chung khung thanh bên với khu nghệ nhân và Ban quản lý; 44px vùng bấm, chế độ tối, giảm chuyển động.
User decisions (16/11/2026): làm khu khách hàng trước, dồn toàn bộ công sức; giao diện + tính năng. Phiên tiếp nối không hỏi thêm: hướng "Tủ chè" là lá bài dẫn của vòng gieo (hai lá còn lại: "Sổ cái", "Bến thuyền") — nêu lại cho chủ dự án khi bàn giao.
Build path: code-led (không có công cụ tạo ảnh).
Features mới: sổ truy xuất (lượt quét QR gắn tài khoản), hộp triện các xưởng đã làm việc, vé trải nghiệm có thêm vào lịch (.ics) và chỉ đường, phiếu đơn sỉ có đường tiến độ và lọc theo trạng thái.

## Direction contract
THESIS: Khu khách hàng là cái tủ chè gia truyền ở gian giữa nhà: mọi thứ khách giữ với làng nằm trong các ngăn của một món đồ gỗ sơn then — tác phẩm đã lưu đứng trên kệ, đơn sỉ là ngăn kéo kéo ra với phiếu đặt hàng, lịch là tấm vé, thư là phong bì, xưởng đã làm việc để lại con triện. Từ chối khung thanh bên + lưới thẻ dùng chung cho ba khu.
OWN-WORLD: bức ghép của cổng đăng nhập hóa thành đồ gỗ: mạch là sơn then nâu đen có chỉ vàng rơm; ngăn lõm sâu lót giấy ngà, kệ là thanh sơn then viền vàng; cánh tủ chính là bốn viên hoa văn của cổng khách hàng (hoa văn, lam, sen, rạn); quai đồng vàng rơm; biển tên men lam; dấu son cho số đếm. Phudu khắc trên khung tên đồng, Alegreya cho tên xưởng và tác phẩm, mono cho mã.
STORY: mở tủ thấy ngay việc đang chạy và việc chờ mình quyết, thấy những gì đã sưu tầm, rồi bấm vào đúng ngăn để so chào giá, thêm buổi nặn gốm vào lịch, đóng dấu đánh giá hoặc gửi yêu cầu mới.
FIRST VIEWPORT: hoành phi sơn then trên cùng (dấu vCraft, "Tủ chè của Lan", chuông, giao diện, tài khoản); ngay dưới là hàng mặt ngăn kéo có khung tên đồng và quai — ngăn đang mở bị kéo ra, men lam. Thân tủ: biển tên men lam "Chào Lan" kèm câu tóm việc và nút "Tạo yêu cầu báo giá" bên trái; kệ đã lưu với tác phẩm đứng thật ở giữa; vé buổi nặn gốm kế tiếp bên phải; hàng dưới là ngăn kéo đơn sỉ kéo ra, hộc thư, hộp triện; chân tủ quỳ dưới cùng. Tương tác đặc trưng: lần đầu mỗi phiên, cánh tủ (bốn viên hoa văn của cổng) xoay bản lề mở ra để lộ các ngăn; chuyển trang là kéo ngăn: mặt ngăn trượt ra và lòng ngăn trượt xuống.
FORM: cấu trúc 4 trên danh sách 7 (Tủ chè; 1 Gian trưng bày riêng, 2 Hộ chiếu làng nghề, 3 Bến thuyền, 5 Đình làng, 6 Sổ cái, 7 Các buồng lò); seed key 943f68a7.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
