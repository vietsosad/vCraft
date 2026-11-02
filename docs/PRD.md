# vCraft: Tài liệu đặc tả yêu cầu sản phẩm (PRD)

| | |
|---|---|
| Sản phẩm | vCraft, nền tảng Triển lãm số và Điều phối đơn cho làng gốm Bát Tràng |
| Học phần | INT3306 Phát triển ứng dụng web, Fall 2026 |
| Phiên bản | 1.0, ngày 02/11/2026 |
| Trạng thái | Đã chốt phạm vi P0. P1 và P2 có thể điều chỉnh theo tiến độ |
| Liên quan | [Mô tả sản phẩm](PRODUCT.md) · [Lộ trình](ROADMAP.md) · [README](../README.md) |

**Mục lục**

1. [Tổng quan](#1-tổng-quan)
2. [Truy vết yêu cầu đề bài](#2-truy-vết-yêu-cầu-đề-bài)
3. [Vai trò và phân quyền](#3-vai-trò-và-phân-quyền)
4. [Yêu cầu chức năng](#4-yêu-cầu-chức-năng)
5. [Đặc tả nghiệp vụ chi tiết](#5-đặc-tả-nghiệp-vụ-chi-tiết)
6. [Yêu cầu phi chức năng](#6-yêu-cầu-phi-chức-năng)
7. [Kiến trúc và lựa chọn công nghệ](#7-kiến-trúc-và-lựa-chọn-công-nghệ)
8. [Mô hình dữ liệu](#8-mô-hình-dữ-liệu)
9. [Thiết kế API](#9-thiết-kế-api)
10. [Định tuyến URL](#10-định-tuyến-url)
11. [Ánh xạ barem chấm điểm](#11-ánh-xạ-barem-chấm-điểm)
12. [Rủi ro và phương án](#12-rủi-ro-và-phương-án)
13. [Tiêu chí nghiệm thu](#13-tiêu-chí-nghiệm-thu)

---

## 1. Tổng quan

### 1.1 Mục đích tài liệu
Tài liệu này là **nguồn sự thật duy nhất** về việc vCraft phải làm gì. Mọi issue trên bảng công việc đều dẫn chiếu về một mã yêu cầu ở đây (ví dụ `QUO-08`). Khi có thay đổi phạm vi, cập nhật tài liệu này trước rồi mới sửa code.

### 1.2 Mục tiêu

| Mã | Mục tiêu | Đo bằng |
|---|---|---|
| G1 | Đáp ứng 100% chức năng đề bài cho 3 vai trò | Bảng truy vết ở mục 2: mọi dòng đều có yêu cầu P0 đạt |
| G2 | Truy xuất nguồn gốc dùng được ngoài đời thật | Quét QR bằng điện thoại thật ra đúng trang truy xuất trong dưới 3 giây |
| G3 | Luồng báo giá đúng và an toàn khi có tranh chấp | Test đồng thời: 2 yêu cầu chốt cùng lúc thì đúng 1 thành công |
| G4 | Giao diện đẹp, có bản sắc, nhanh với nhiều ảnh | Lighthouse Performance ≥ 90 trên máy tính. Tổng ảnh trang danh sách ≤ 1 MB |
| G5 | Đạt trọn 9 tiêu chí barem | Checklist ở [ROADMAP, Phụ lục A](ROADMAP.md) tick đủ |

### 1.3 Không phải mục tiêu
Thanh toán trực tuyến, kết nối vận chuyển, chat thời gian thực, ứng dụng di động riêng, giỏ hàng bán lẻ. Xem [PRODUCT, mục 11](PRODUCT.md).

### 1.4 Thuật ngữ

| Thuật ngữ | Nghĩa |
|---|---|
| Hộ nghề / Xưởng (`Workshop`) | Một hộ gia đình hoặc nghệ nhân làm gốm. Mỗi tài khoản nghệ nhân sở hữu đúng một xưởng |
| Lô (`Batch`) | Một mẻ sản xuất có mã duy nhất, ví dụ `BT26-00042`. Mọi sản phẩm cùng lô dùng chung QR |
| Mốc / Công đoạn (`ProductionStage`) | Một mục trong nhật ký lô: thời điểm, công đoạn, mô tả, ảnh minh chứng |
| Mẫu công đoạn (`StageTemplate`) | Danh sách công đoạn chuẩn của nghề, dùng để gợi ý khi thêm mốc |
| Yêu cầu báo giá (`QuoteRequest`, RFQ) | Nhu cầu mua sỉ của khách, ví dụ `RFQ26-0007` |
| Lời mời (`QuoteInvitation`) | Bản ghi "hộ X được mời chào giá cho RFQ Y" |
| Chào giá (`Bid`) | Đề nghị của một hộ: đơn giá, số lượng nhận làm, số ngày hoàn thành |
| Đơn (`Order`) và Phân bổ (`OrderAllocation`) | Đơn sinh ra khi khách chốt. Mỗi phân bổ là phần việc của một hộ trong đơn |
| Hộ nghề xác thực | Hộ đã được Admin duyệt hồ sơ, có huy hiệu con dấu |

### 1.5 Mức ưu tiên
- **P0, bắt buộc:** đề bài yêu cầu trực tiếp. Thiếu là mất điểm chức năng.
- **P1, nên có:** tăng điểm chức năng, thiết kế, hiệu năng. Chỉ làm sau khi P0 của module đã xong.
- **P2, có thì tốt:** chỉ làm khi dư thời gian. Là phần đầu tiên bị cắt nếu trễ.

---

## 2. Truy vết yêu cầu đề bài

| Mã | Yêu cầu trong đề bài | Đáp ứng bởi |
|---|---|---|
| YC-01 | Nghệ nhân quản lý hồ sơ xưởng: lịch sử gia đình, ảnh xưởng, chứng nhận chất lượng | WS-01 đến WS-04 |
| YC-02 | Nghệ nhân đăng sản phẩm, có giá bán **và** nhật ký sản xuất | PRD-01 đến PRD-03, TRC-01 đến TRC-04 |
| YC-03 | Nghệ nhân nhận và chào giá các yêu cầu báo giá | QUO-03 đến QUO-05, ORD-02 đến ORD-04 |
| YC-04 | Khách xem danh mục sản phẩm theo hộ gia đình hoặc theo phân loại | CAT-01 đến CAT-05 |
| YC-05 | Khách xem bản đồ làng nghề để biết xưởng nào đang mở cửa | MAP-01 đến MAP-05 |
| YC-06 | Khách tạo yêu cầu báo giá. Hệ thống gửi tới các hộ phù hợp để chào giá | QUO-01, QUO-02, mục 5.3 |
| YC-07 | Admin kiểm duyệt và cấp tài khoản hộ, tránh hàng nhái trà trộn | AUTH-02, ADM-01, ADM-02 |
| YC-08 | Admin quản lý tin tức cộng đồng: giá nguyên vật liệu, lịch cúp điện, chính sách | NEWS-01 đến NEWS-04 |
| YC-09 | Lưu vòng đời của lô: một mảng mốc thời gian kèm ảnh minh chứng | TRC-01 đến TRC-04, mục 5.5 |
| YC-10 | Tự sinh QR cho mỗi lô. Quét ra landing page kể chuyện. Cùng lô thì cùng QR | TRC-05 đến TRC-07 |
| YC-11 | Máy trạng thái báo giá: Draft → Sent → Bidding → Accepted → In Production → Delivered | QUO-\*, ORD-\*, mục 5.1 |
| YC-12 | Logic khóa bản ghi và cập nhật trạng thái phức tạp | QUO-08, mục 5.2 |
| YC-13 | BQL phân bổ đơn lớn cho nhiều hộ cùng thực hiện | QUO-07, ORD-01, ORD-05, ADM-06, mục 5.4 |
| YC-14 | Tích hợp API bản đồ. Ghim theo tọa độ. Bấm ghim xem popup | MAP-01 đến MAP-03, mục 5.6 |
| YC-15 | Giao diện đẹp, tập trung vào hình ảnh | [PRODUCT, mục 9 và 10](PRODUCT.md), USA-01 đến USA-03 |
| YC-16 | Upload nhiều ảnh, tối ưu và resize ảnh ở backend | MED-01 đến MED-06, mục 5.7 |

---

## 3. Vai trò và phân quyền

Mỗi tài khoản có đúng một vai trò: `BUYER`, `ARTISAN` hoặc `ADMIN`. Nghệ nhân mới đăng ký có `status = PENDING` cho đến khi được duyệt.

| Chức năng | Khách vãng lai | Khách hàng | Nghệ nhân chờ duyệt | Nghệ nhân đã duyệt | Admin |
|---|:-:|:-:|:-:|:-:|:-:|
| Xem sản phẩm, xưởng, bản đồ, tin tức, trang truy xuất | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tạo và quản lý yêu cầu báo giá | – | ✅ của mình | – | – | Xem tất cả, hủy |
| Sửa hồ sơ xưởng | – | – | ✅ bản nháp | ✅ của mình | ✅ |
| Đăng sản phẩm công khai | – | – | Chỉ lưu nháp | ✅ của mình | Ẩn / hiện |
| Lô sản xuất và nhật ký | – | – | – | ✅ của mình | Chỉ xem |
| Chào giá | – | – | – | ✅ khi được mời | Chỉ xem |
| Cập nhật tiến độ phân bổ | – | – | – | ✅ của mình | Chỉ xem |
| Xác nhận đã nhận hàng | – | ✅ đơn của mình | – | – | – |
| Duyệt hộ nghề, khóa tài khoản | – | – | – | – | ✅ |
| Tin tức, danh mục, mẫu công đoạn | – | – | – | – | ✅ |
| Mời thêm hộ vào yêu cầu báo giá | – | – | – | – | ✅ |

**Quy tắc sở hữu:** nghệ nhân chỉ thao tác được trên bản ghi có `workshopId` trùng xưởng của mình. Khách chỉ thao tác được trên RFQ có `buyerId` của mình. Kiểm tra này nằm ở tầng service, không chỉ ở giao diện (xem SEC-03). **Đấu giá kín:** nghệ nhân không bao giờ thấy chào giá của hộ khác.
