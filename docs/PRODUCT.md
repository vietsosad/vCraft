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

## 5. Chân dung người dùng

### P1. Bác Tư, 62 tuổi, nghệ nhân đời thứ 4, chủ "Xưởng gốm Ông Tư"
- **Bối cảnh:** làm gốm men lam vẽ tay, bán qua khách quen và thương lái. Con gái là Hà lo phần online.
- **Thiết bị:** điện thoại Android màn hình 6 inch, dùng Zalo và Facebook ở mức cơ bản.
- **Mong muốn:** được khách biết đến vì tay nghề, nhận thêm đơn lớn vào mùa Tết.
- **Lo ngại:** thao tác rắc rối, mất thời gian khi đang làm ở lò.
- **vCraft phải:** cho phép thêm một mốc nhật ký trong tối đa 3 lần chạm, chụp ảnh thẳng từ camera. Chữ to, nút lớn, thông báo rõ ràng.

### P2. Hà, 30 tuổi, thế hệ trẻ quản lý gian hàng của gia đình
- **Mong muốn:** hồ sơ xưởng đẹp, đăng sản phẩm nhanh, không bỏ lỡ cơ hội báo giá.
- **Cần:** upload nhiều ảnh một lúc, sắp xếp ảnh, nhân bản sản phẩm, được báo ngay khi có lời mời chào giá.

### P3. Chị Lan, 38 tuổi, chuyên viên Phòng Hành chính, Trường ĐH Công nghệ (khách sỉ)
- **Nhiệm vụ:** đặt 5.000 cốc sứ in logo làm quà cho sự kiện của trường, cần trong một tháng, ngân sách có hạn.
- **Lo ngại:** một xưởng không làm kịp, giá thiếu minh bạch, chất lượng mỗi nơi một kiểu.
- **vCraft phải:** gửi một yêu cầu tới nhiều xưởng, cho so sánh trên cùng mặt bằng, cho chia đơn và theo dõi tiến độ từng xưởng.

### P4. Minh, 21 tuổi, sinh viên, khách tham quan cuối tuần
- **Bối cảnh:** đi xe buýt xuống Bát Tràng, muốn trải nghiệm nặn gốm và mua quà "đúng gốm làng".
- **vCraft phải:** có bản đồ chạy mượt trên điện thoại, cho biết xưởng nào đang mở, cho quét QR xem nguồn gốc ngay tại quầy.

### P5. Anh Hùng, 45 tuổi, cán bộ Hội làng nghề (Admin)
- **Nhiệm vụ:** xác nhận ai thật sự là hộ làm nghề, đưa thông báo tới các hộ, nắm tình hình các đơn lớn.
- **vCraft phải:** có hàng đợi duyệt rõ ràng kèm minh chứng, cho đăng tin nhanh, ghim tin khẩn, có bảng điều phối.

## 6. Giá trị mang lại

| Bên | Trước vCraft | Với vCraft |
|---|---|---|
| Hộ nghề | Bán qua trung gian, không chứng minh được tay nghề | Có gian trưng bày riêng, nhật ký sản xuất làm bằng chứng, nhận đơn sỉ trực tiếp |
| Khách lẻ | Nghi ngờ nguồn gốc | Quét QR thấy cả hành trình, biết hàng do hộ được BQL xác thực làm |
| Khách sỉ | Gọi từng nơi, so sánh thủ công | Một yêu cầu, nhiều báo giá, chia đơn, theo dõi tập trung |
| BQL | Quản lý bằng giấy tờ và nhóm chat | Kiểm soát danh sách hộ, kênh thông báo chính thức, bảng điều phối và số liệu |

## 7. Hành trình người dùng chính

### Hành trình A. Minh khám phá làng (khách du lịch, trên điện thoại)
1. Đến Bát Tràng, mở vCraft, vào **Bản đồ**.
2. Bật bộ lọc "Đang mở cửa" và "Có trải nghiệm nặn gốm". Ghim xám (xưởng đang đóng) mờ đi.
3. Chạm ghim *Xưởng gốm Ông Tư*. Popup hiện ảnh, giờ mở cửa hôm nay và nút **Chỉ đường**.
4. Tại xưởng, Minh mua một chiếc bình, lật đáy bình và **quét tem QR**.
5. Trang truy xuất mở ra: *"Ngày 1: chọn đất… Ngày 9: vẽ sen… Ngày 14: ra lò"*, kèm ảnh thật của chính mẻ gốm đó. Đây là **khoảnh khắc ấn tượng** của sản phẩm.

### Hành trình B. Bác Tư và Hà đưa xưởng lên vCraft (nghệ nhân)
1. Hà đăng ký tài khoản nghệ nhân qua 3 bước: tài khoản → thông tin xưởng và **kéo ghim vị trí trên bản đồ** (địa chỉ tự điền) → tải minh chứng.
2. Trạng thái "Chờ duyệt". Khi BQL duyệt, Hà nhận thông báo và huy hiệu *Hộ nghề xác thực* xuất hiện.
3. Hà hoàn thiện hồ sơ xưởng: câu chuyện 4 đời làm gốm, 12 ảnh xưởng, 2 chứng nhận.
4. Bác Tư mở **lô mới** "Bình men lam vẽ sen, mẻ tháng 11". Ở mỗi công đoạn, bác chụp ảnh bằng điện thoại và bấm **Thêm mốc**. Hệ thống gợi ý sẵn công đoạn tiếp theo.
5. Ra lò thì bấm **Hoàn tất lô**, nhật ký bị khóa. Hà **in tem QR** để dán lên sản phẩm.
6. Hà đăng sản phẩm và gắn vào lô. Trang sản phẩm tự có mục "Xem hành trình ra đời".
7. Chuông báo: *"Bạn được mời chào giá: 5.000 cốc in logo"*. Hà chào giá nhận làm 2.000 cốc, giao trong 25 ngày.

### Hành trình C. Chị Lan đặt 5.000 cốc (khách sỉ)
1. Tạo **Yêu cầu báo giá** qua 3 bước: nhu cầu → yêu cầu riêng (tải file logo) → thời hạn và địa chỉ giao. Bản nháp được tự lưu.
2. Bấm **Gửi**. Hệ thống tìm được 6 hộ có sở trường "Cốc, chén" và đủ năng lực, rồi gửi lời mời.
3. Ba ngày sau có 4 chào giá. **Bảng so sánh** hiện đơn giá, số lượng nhận làm, thời gian hoàn thành và đánh giá của từng hộ.
4. Bấm **Gợi ý phân bổ**: Hộ A 2.000 cốc + Hộ B 3.000 cốc, tổng chi phí thấp nhất mà vẫn kịp hạn. Chị Lan xác nhận chốt.
5. Theo dõi tiến độ từng hộ. Mỗi phần đơn gắn với một lô sản xuất nên chị xem được cả nhật ký.
6. Nhận hàng, xác nhận từng phần, đơn chuyển sang **Đã giao**. Chị đánh giá từng hộ.

### Hành trình D. Anh Hùng vận hành làng (BQL)
1. Mở hàng đợi **Hồ sơ chờ duyệt**, đối chiếu minh chứng với danh sách hội viên, rồi duyệt hoặc từ chối kèm lý do.
2. Đăng tin *"Lịch cúp điện thôn 3 ngày 20/11"* và **ghim khẩn**. Tin hiện trên bảng điều khiển của mọi nghệ nhân.
3. Xem **bảng điều phối**: một yêu cầu báo giá mới có 1 chào giá, anh **mời thêm hộ**.
4. Nhận phản ánh một hộ bán hàng nhập, anh **tạm khóa** tài khoản đó. Toàn bộ sản phẩm của hộ bị ẩn ngay.

## 8. Sơ đồ trang

```text
vCraft
├── Công khai
│   ├── /                          Trang chủ
│   ├── /san-pham                  Danh sách sản phẩm (lọc, tìm kiếm)
│   │   └── /san-pham/:slug        Chi tiết sản phẩm
│   ├── /danh-muc/:slug            Sản phẩm theo phân loại
│   ├── /xuong                     Các hộ nghề
│   │   └── /xuong/:slug           Gian trưng bày của hộ
│   ├── /ban-do                    Bản đồ làng nghề
│   ├── /truy-xuat/:maLo           Câu chuyện của lô sản phẩm (đích đến của QR)
│   ├── /tin-tuc                   Bản tin làng
│   │   └── /tin-tuc/:slug
│   └── /dang-nhap · /dang-ky · /dang-ky/nghe-nhan · /quen-mat-khau
├── Khách hàng (cần đăng nhập)
│   ├── /bao-gia                   Yêu cầu báo giá của tôi
│   │   ├── /bao-gia/tao-moi
│   │   └── /bao-gia/:ma           So sánh chào giá, chốt, theo dõi
│   ├── /don-hang/:ma
│   └── /tai-khoan
├── Nghệ nhân: /nghe-nhan/...
│   └── tong-quan · ho-so-xuong · san-pham · lo-san-xuat · co-hoi-bao-gia · don-hang
└── Quản trị: /quan-tri/...
    └── tong-quan · ho-nghe · nguoi-dung · dieu-phoi · tin-tuc · danh-muc · cong-doan · nhat-ky
```

Danh sách URL đầy đủ và quyền truy cập từng trang: xem [PRD, mục 10](PRD.md).
