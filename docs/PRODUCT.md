# vCraft: Mô tả sản phẩm

> *Tinh hoa làng nghề, muôn phương lan tỏa*

| | |
|---|---|
| Tài liệu | Mô tả sản phẩm (Product Brief) |
| Phiên bản | 1.0, ngày 02/11/2026 |
| Liên quan | [PRD](PRD.md) · [Lộ trình](ROADMAP.md) · [README](../README.md) |

---

## 1. Tóm tắt

vCraft là **triển lãm số của một làng nghề**, do chính Ban quản lý (BQL) làng vận hành.

Mỗi hộ làm gốm ở Bát Tràng có một "gian trưng bày" trực tuyến để kể câu chuyện gia đình, trưng bày sản phẩm độc bản và chứng minh nguồn gốc bằng **nhật ký sản xuất có ảnh thật cho từng lô hàng**. Khách chỉ cần quét QR là xem được.

Với khách đặt số lượng lớn, vCraft thay chuỗi gọi điện, nhắn Zalo, mặc cả bằng một **sàn báo giá kín**: gửi một yêu cầu, nhiều hộ chào giá, chốt minh bạch và chia đơn cho nhiều hộ cùng làm.

vCraft trả lời ba câu hỏi:

1. **"Món này có thật do làng làm không?"** QR truy xuất lô, cộng với huy hiệu hộ nghề do BQL xác thực.
2. **"Đến làng thì ghé xưởng nào?"** Bản đồ làng nghề cho biết xưởng nào đang mở cửa đón khách ngay lúc này.
3. **"Cần 5.000 cái cốc trong một tháng thì đặt ai?"** Gửi yêu cầu báo giá, hệ thống mời đúng hộ và chia đơn khi một hộ không đủ sức làm.

## 2. Vì sao chọn gốm Bát Tràng

- **Quy trình nhiều công đoạn và công đoạn nào cũng chụp được** (nhào đất, vuốt, vẽ, tráng men, nung). Nhờ vậy nhật ký sản xuất giàu hình ảnh, đúng tinh thần "image-centric" của đề bài.
- **Có đủ khách lẻ lẫn khách sỉ.** Làng cách trung tâm Hà Nội khoảng 15 km, nhiều xưởng mở cho khách trải nghiệm nặn gốm. Đồng thời có nhu cầu sỉ lớn: quà tặng doanh nghiệp, cốc in logo, đồ gia dụng. Cả ba vai trò và luồng báo giá đều được dùng trọn.
- **Chuyện gốm nhập trà trộn gắn mác Bát Tràng** là vấn đề thường được nhắc tới. Đây chính là lý do tồn tại của kiểm duyệt hộ nghề và truy xuất nguồn gốc.
- **Trùng ví dụ trong đề bài** (nhật ký gốm, cốc in logo Trường ĐH Công nghệ), nên giảng viên dễ đối chiếu.

**Hệ thống không bị khóa vào nghề gốm.** Mọi thứ đặc thù của nghề nằm trong dữ liệu: danh mục sản phẩm, *mẫu công đoạn* (stage template) và bảng màu thương hiệu. Muốn đổi sang lụa Vạn Phúc thì chỉ cần đổi seed, ví dụ mẫu công đoạn thành Ươm tơ → Nhuộm → Dệt → Hoàn thiện.

## 3. Bối cảnh và vấn đề

| Ai | Khó khăn hiện tại | Hệ quả |
|---|---|---|
| Hộ nghề | Bán qua thương lái, Facebook, Zalo. Không có nơi kể câu chuyện và thể hiện tay nghề | Bị ép giá. Sản phẩm thủ công bị đánh đồng với hàng công nghiệp |
| Khách lẻ, khách du lịch | Không phân biệt được gốm làng với gốm nhập. Không biết xưởng nào đang mở cho tham quan | Mất niềm tin. Chuyến tham quan rời rạc, dễ "đi lạc" vào cửa hàng bán hàng nhập |
| Khách sỉ | Phải gọi từng hộ. Báo giá không cùng mặt bằng để so. Một hộ không đủ năng lực cho đơn lớn | Tốn thời gian, rủi ro trễ hạn, chất lượng không đồng đều |
| Ban quản lý | Không kiểm soát được ai nhân danh làng. Thông báo chung trôi mất trong nhóm chat. Không nắm được bức tranh chung về đơn lớn | Uy tín làng bị ảnh hưởng, khó điều phối |

## 4. Giải pháp: bốn trụ cột

| Trụ cột | Nội dung | Phục vụ ai |
|---|---|---|
| **Triển lãm số** | Gian trưng bày của từng hộ: câu chuyện gia đình, ảnh xưởng, chứng nhận, sản phẩm độc bản. Duyệt theo hộ hoặc theo phân loại | Khách lẻ, khách du lịch, hộ nghề |
| **Truy xuất nguồn gốc** | Nhật ký sản xuất theo lô. Mỗi mốc có ngày và ảnh minh chứng. Mỗi lô có một QR. Nhật ký bị khóa khi lô hoàn tất | Mọi khách mua, hộ nghề |
| **Sàn báo giá và điều phối** | Yêu cầu báo giá được gửi tới đúng hộ. Các hộ chào giá kín. Khách chốt một hoặc nhiều hộ, sau đó theo dõi tiến độ từng phần đơn | Khách sỉ, hộ nghề, BQL |
| **Bản đồ và bản tin làng** | Bản đồ xưởng kèm trạng thái mở cửa. Bản tin về giá nguyên liệu, lịch cúp điện, chính sách hỗ trợ | Khách du lịch, hộ nghề, BQL |
