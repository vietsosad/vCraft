---
version: 2
slug: "src-app-account-page-tsx"
primary_target: "src/app/account/page.tsx"
related_targets: ["src/app/account/layout.tsx", "src/app/account/**", "src/components/lang/**", "src/styles/lang.css", "src/components/quotes/quote-room.tsx"]
---

Scope: khu khách hàng /account (Đường làng: trang chủ của khu, lò đơn sỉ + phòng báo giá + phiếu yêu cầu, bàn xoay, kệ trưng bày, hộ chiếu làng nghề, đánh giá, bến thư, hồ sơ). Mode: Operate, có một lớp Experience ở bến sông và con đường.
Audience: chị Lan (khách sỉ, máy tính văn phòng, quay lại nhiều lần trong vài tuần) và Minh (khách tham quan, điện thoại, ngoài trời). Job: biết ngay việc gì đang chờ mình, làm tiếp việc đó, giữ lại những gì đã gắn bó với làng – và có cảm giác đang dạo một làng nghề cổ.
Constraints: thế giới riêng, khác trang chủ và cổng đăng nhập; hoạt ảnh, đồ họa 2D có chiều sâu, hoa văn, họa tiết; truyền thống pha hiện đại. Tính năng giữ nguyên. Phòng báo giá giữ huy hiệu "Record vN · Optimistic Lock" và sáu trạng thái luôn nhìn thấy (đề bài). 44px vùng bấm, sáng/tối, giảm chuyển động, tương phản 4.5:1 ở cả hai chế độ.
User decisions: 28/11/2026 dùng hệ thiết kế vCraft; duyệt canvas "Lối vào làng gốm – giao diện khách hàng" (artboard Main, Order, Mobile) và yêu cầu áp dụng vào dự án. Hướng này thay Tấm dệt (21–28/11/2026); lịch sử Tấm dệt nằm trong git.
Build path: code-led, SVG tự vẽ; ảnh thật chỉ là ảnh tác phẩm tách nền có nguồn gốc và ảnh xưởng.

## Direction contract
THESIS: Khu riêng của khách là một buổi dạo làng gốm Bát Tràng. Bến sông mở trang, rồi một con đường gạch qua sáu điểm dừng – mỗi điểm là một việc của khách với làng, mở ra bằng vật thể làng nghề của nó. Từ chối khung thanh bên + lưới thẻ và từ chối bức ghép của trang chủ.
OWN-WORLD: cảnh bến sông SVG (trời bình minh, mặt trời trống đồng, đê, nhà ngói, lò bầu tỏa khói, đình, sông sóng mây, thuyền chở gốm thật, khóm tre) đổi thành đêm hội đèn ở chế độ tối; dải hồi văn chữ triện; men lam là men chủ, đất nung, men ngọc, son; sơn then viền chỉ vàng cho kệ và lò; giấy dó cho thư; Phudu chữ hoa cho biển hiệu, Alegreya cho giọng kể, Be Vietnam Pro cho thao tác.
STORY: mở khu thấy lời chào trên bến sông và câu kể việc hôm nay; "Đi dọc đường làng" xuống bản đồ; bấm một điểm dừng, lữ khách đi tới đó, nội dung mở ra: Cổng làng (việc chờ bạn), Lò đơn sỉ (đồng hồ lò + đơn), Bàn xoay (bình xoay + buổi nặn), Kệ trưng bày, Nhà triện (sổ hộ chiếu đóng triện), Bến thư.
FIRST VIEWPORT: đầu trang ngà (vCraft, "Đường làng của Lan", sáu điểm dừng, chuông, tài khoản) với hồi văn; bến sông 620px, lời chào Phudu hai dòng ngắt sau dấu phẩy, câu kể việc thật, hai thao tác, thẻ "xưởng đang mở cửa"; thuyền chở gốm dập dềnh. Phòng báo giá: lò bậc thang sơn then, huy hiệu khóa lạc quan và sáu khoang trong màn đầu.
FINISH (28/11/2026): build sạch (tsc, eslint, next build), 27/27 unit test; tương phản 0 chỗ chưa đạt ở mọi khu, hai chế độ; không tràn ngang ở 360/720px; Tab thấy viền ở mọi điểm; trang chủ "/" không đổi (dấu vân kiểu dáng chỉ khác ở hai ô phụ thuộc giờ mở cửa); DESIGN.md và .impeccable/design.json đã ghi Đường làng.
