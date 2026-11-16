---
name: vCraft
description: Triển lãm số làng gốm Bát Tràng, dựng như một con đường gốm sứ ghép từ những viên men gắn chung một lưới mạch vữa.
colors:
  nga: "#f7f2e8"
  nga-dam: "#efe7d6"
  nga-sau: "#e4d9c3"
  su: "#fffdf8"
  vua: "#d9cdb7"
  muc: "#1c1a17"
  tro: "#655e54"
  lam: "#1f4e9a"
  lam-dam: "#163a73"
  lam-sang: "#2b5fb4"
  lam-nhat: "#dfe7f4"
  lam-nen: "#1f4e9a"
  datnung: "#a34a23"
  datnung-dam: "#84391a"
  datnung-nhat: "#f4e2d7"
  datnung-nen: "#8f3f1d"
  ngoc: "#3b6f5e"
  ngoc-sang: "#5e8f7b"
  ngoc-nhat: "#dcebe3"
  ngoc-nen: "#2f5c4d"
  vangrom: "#c8962e"
  vangrom-dam: "#84600f"
  doson: "#b3261e"
  doson-dam: "#8e1d17"
  lua: "#ee8a43"
  on: "#fffdf8"
  giay: "#fffdf8"
  dem: "#0f1b38"
  then: "#1e1511"
  then-2: "#2b1f19"
  chi: "#c9a24e"
  chi-nhat: "#f3dc9f"
  seal-ink: "#b3261e"
  chart-1: "#1f4e9a"
  chart-2: "#a34a23"
  chart-3: "#00866a"
  chart-4: "#b8861a"
typography:
  display:
    fontFamily: "Phudu, Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 6.4vw, 5.4rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.005em"
  headline:
    fontFamily: "Phudu, Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3.2rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.005em"
  title:
    fontFamily: "Phudu, Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 2.4vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.02
  numeral:
    fontFamily: "Phudu, Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "2.6rem"
    fontWeight: 800
    lineHeight: 1
    fontFeature: "\"tnum\", \"lnum\""
  narrative:
    fontFamily: "Alegreya, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.005em"
  body:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.02em"
  code:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.8em"
    fontWeight: 400
    letterSpacing: "0.02em"
    fontFeature: "\"tnum\""
rounded:
  hairline: "2px"
  badge: "4px"
  tile: "6px"
  card: "8px"
  mosaic: "10px"
  sheet: "14px"
  cabinet: "12px"
spacing:
  grout: "6px"
  grid-cell: "72px"
  gutter-mobile: "16px"
  gutter-desktop: "32px"
  container-site: "1440px"
  container-zone: "72rem"
  sidebar: "272px"
components:
  button-primary:
    backgroundColor: "{colors.lam}"
    textColor: "{colors.on}"
    typography: "{typography.body}"
    rounded: "{rounded.tile}"
    padding: "0 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.lam-sang}"
    textColor: "{colors.on}"
  button-earth:
    backgroundColor: "{colors.datnung}"
    textColor: "{colors.on}"
    rounded: "{rounded.tile}"
    padding: "0 20px"
    height: "44px"
  button-earth-hover:
    backgroundColor: "{colors.datnung-dam}"
  button-celadon:
    backgroundColor: "{colors.ngoc}"
    textColor: "{colors.on}"
    rounded: "{rounded.tile}"
    padding: "0 20px"
    height: "44px"
  button-danger:
    backgroundColor: "{colors.doson}"
    textColor: "{colors.on}"
    rounded: "{rounded.tile}"
    padding: "0 20px"
    height: "44px"
  button-danger-hover:
    backgroundColor: "{colors.doson-dam}"
  button-outline:
    backgroundColor: "{colors.su}"
    textColor: "{colors.muc}"
    rounded: "{rounded.tile}"
    padding: "0 20px"
    height: "44px"
  button-ghost:
    textColor: "{colors.muc}"
    rounded: "{rounded.tile}"
    padding: "0 20px"
    height: "44px"
  button-ghost-hover:
    backgroundColor: "{colors.nga-dam}"
  button-sm:
    height: "36px"
    padding: "0 12px"
  button-lg:
    height: "52px"
    padding: "0 28px"
  input:
    backgroundColor: "{colors.su}"
    textColor: "{colors.muc}"
    rounded: "{rounded.tile}"
    padding: "10px 14px"
  badge-lam:
    backgroundColor: "{colors.lam-nhat}"
    textColor: "{colors.lam}"
    typography: "{typography.label}"
    rounded: "{rounded.badge}"
    padding: "2px 8px"
  badge-datnung:
    backgroundColor: "{colors.datnung-nhat}"
    textColor: "{colors.datnung}"
    rounded: "{rounded.badge}"
    padding: "2px 8px"
  badge-ngoc:
    backgroundColor: "{colors.ngoc-nhat}"
    textColor: "{colors.ngoc}"
    rounded: "{rounded.badge}"
    padding: "2px 8px"
  card:
    backgroundColor: "{colors.su}"
    textColor: "{colors.muc}"
    rounded: "{rounded.card}"
  stat-tile-lam:
    backgroundColor: "{colors.lam-nen}"
    textColor: "{colors.giay}"
    typography: "{typography.numeral}"
    rounded: "{rounded.tile}"
    padding: "20px"
  dialog:
    backgroundColor: "{colors.nga}"
    textColor: "{colors.muc}"
    rounded: "{rounded.mosaic}"
    width: "min(92vw, 520px)"
  zone-tab:
    backgroundColor: "{colors.su}"
    textColor: "{colors.tro}"
    height: "56px"
  drawer-face:
    backgroundColor: "{colors.then-2}"
    textColor: "{colors.giay}"
    rounded: "{rounded.badge}"
    padding: "12px 6px 9px"
    height: "78px"
  drawer-face-current:
    backgroundColor: "{colors.lam-nen}"
    textColor: "{colors.giay}"
  brass-label:
    backgroundColor: "{colors.nga}"
    textColor: "{colors.muc}"
    rounded: "{rounded.hairline}"
    padding: "3px 9px 2px"
  seal-count:
    backgroundColor: "{colors.seal-ink}"
    textColor: "{colors.on}"
    rounded: "{rounded.badge}"
    padding: "0 5px"
    height: "24px"
  cab-cell:
    backgroundColor: "{colors.nga}"
    textColor: "{colors.muc}"
    rounded: "{rounded.badge}"
  order-slip:
    backgroundColor: "{colors.su}"
    textColor: "{colors.muc}"
    rounded: "{rounded.badge}"
  visit-ticket:
    backgroundColor: "{colors.su}"
    textColor: "{colors.muc}"
  wax-seal:
    backgroundColor: "{colors.seal-ink}"
    textColor: "{colors.on}"
    rounded: "{rounded.badge}"
    size: "30px"
---

# Design System: vCraft

## Overview

**Creative North Star: "Con đường gốm sứ"**

vCraft là con đường ghép gốm ven sông Hồng: mỗi xưởng, mỗi tác phẩm, mỗi lô hàng là một viên gốm men được gắn vào cùng một lưới mạch vữa của làng. Nền là men ngà, có lưới mạch vữa xám ấm kẻ ngang dọc nhìn thấy được; những mảng lớn được tráng men thành viên gốm (men lam Bát Tràng, men ngọc, đất nung), xen giữa là viên hoa văn mây sóng lam vẽ tay, viên men rạn và viên sen. Xác thực được đóng bằng triện son. Hệ thống từ chối mô-típ "chợ thủ công nền kem, chữ có chân, điểm nhấn đất nung" quen thuộc: ở đây màu men chiếm trọn mảng, không chỉ làm điểm nhấn.

Mật độ chia hai giọng. Khu triển lãm công khai (thuyết phục) dùng bức ghép lớn, biển hiệu Phudu chữ hoa và ảnh tác phẩm thật làm viên gốm. Ba khu làm việc theo vai trò (khách hàng, nghệ nhân, Ban quản lý) gọn và chăm chú hơn: mỗi khu có thanh bên một màu men chiếm trọn chiều cao, vùng làm việc nền ngà, thẻ sứ trắng, và trên điện thoại là thanh tab dưới đáy bấm bằng một tay. Chế độ tối "lò đêm" đổi nền thành than ấm của lòng lò đã tắt lửa; men vẫn sáng trên nền lò.

Khu khách hàng (`/account`) có thế giới con riêng là **Tủ chè**: bức ghép của cổng đăng nhập hóa thành món đồ gỗ sơn then ở gian giữa nhà. Mạch vữa thành gỗ sơn then nâu đen có chỉ vàng; mỗi khối nội dung là một ngăn lõm lót giấy ngà; điều hướng là hàng mặt ngăn kéo có khung tên và quai; cánh tủ chính là bốn viên hoa văn của cổng (hoa văn, lam, sen, rạn). Đồ khách giữ với làng là đồ giấy và đồ trưng trong tủ: đơn sỉ là phiếu đặt hàng có cuống xé, lịch hẹn là tấm vé, thông báo là lá thư đóng dấu son, xưởng đã làm việc để lại con triện, tác phẩm đã lưu đứng trên kệ. Tủ chè chỉ thuộc khu khách hàng; khu nghệ nhân và Ban quản lý vẫn dùng khung thanh bên chung (`zone-shell`) và sẽ có bản sắc riêng sau, không mượn Tủ chè.

Chuyển động kể đúng một câu chuyện vật liệu: viên gốm được "gắn" vào mạch vữa (hơi lệch, hơi xoay rồi ăn khớp), bóng men lướt theo con trỏ khi rê lên viên, kim đồng hồ lò có quán tính và giảm chấn thật. Mọi chuyển động đều có đường thay thế khi người dùng giảm chuyển động.

**Key Characteristics:**
- Nền men ngà với lưới mạch vữa 72px nhìn thấy được; các khối gắn vào bức ghép cách nhau đúng một mạch vữa 6px.
- Màu men là mảng, không phải viền: lam, đất nung, men ngọc phủ trọn viên biển hiệu, thanh bên, ô số liệu.
- Góc viên gốm 4-8px; không có khối bo tròn lớn kiểu viên thuốc.
- Bốn giọng chữ có vai rõ ràng: Phudu chữ hoa cho biển hiệu, Alegreya cho tên và lời kể, Be Vietnam Pro cho chữ làm việc, JetBrains Mono cho mã lô.
- Trạng thái được mang bằng cả hình dấu lẫn màu.
- Triện son là con dấu duy nhất của sự xác thực.
- Khu khách hàng là Tủ chè: gỗ sơn then, chỉ vàng phẳng, ngăn lõm lót giấy, dấu son phẳng; không lan sang khu khác.

## Colors

Bảng màu men gốm Bát Tràng trên nền men ngà: ba men màu chính chiếm mảng lớn, hai màu son và vàng rơm dành cho dấu và điểm sáng, cùng thang trung tính ấm như đất sét đã nung.

### Primary
- **Men lam Bát Tràng** (`lam`): màu chủ đạo. Nút chính, viên biển hiệu mở màn, thanh bên khu khách hàng, vòng focus, vùng chọn chữ, hoa văn mây sóng. Biến thể `lam-sang` cho hover, `lam-dam` cho chữ đậm trên nền sáng, `lam-nhat` cho nền nhãn, `lam-nen` cho mảng lớn luôn đậm.

### Secondary
- **Đất nung** (`datnung`): nút thứ hai (earth), thanh bên khu nghệ nhân (`datnung-nen` với chấm hạt đất), vạch chỉ mục đang xem trên điều hướng công khai, con trỏ nhập liệu, viền focus của ô nhập, nhiệt độ lò vượt 1.200°C.

### Tertiary
- **Men ngọc** (`ngoc`): nút celadon, trạng thái thành công, viên "xưởng đang mở cửa", thanh trạng thái khu Ban quản lý. `ngoc-nen` là mảng ngọc đậm.
- **Vàng rơm** (`vangrom`): sao đánh giá và nhãn tông vàng; chữ trên nền nhạt dùng `vangrom-dam` để đủ tương phản.
- **Đỏ son** (`doson`): triện xác thực của Ban quản lý, lỗi, hành động nguy hiểm. Không dùng làm màu trang trí.
- **Lửa** (`lua`): huy hiệu đếm số trên thanh bên men của khung khu làm việc chung. Khu khách hàng không còn dùng: số đếm ở đó là dấu son của Tủ chè.

### Neutral
- **Men ngà** (`nga`): nền trang và nền hộp thoại. `nga-dam` cho hover của nút ma, nền khối trống vân men rạn, đầu bảng; `nga-sau` cho rãnh thanh đo và khung xương tải.
- **Sứ trắng** (`su`): mặt thẻ, mặt ô nhập, viên thông tin trong bức ghép.
- **Mạch vữa** (`vua`): mọi đường kẻ, viền thẻ, lưới nền, khe giữa các viên trong bức ghép, thanh cuộn.
- **Mực tàu** (`muc`): chữ chính, kim đồng hồ lò.
- **Tro** (`tro`): chữ phụ, mô tả, nhãn nhóm.
- **Chữ trên men** (`on`): chữ đặt trên nút và khối men màu; đổi sang tối trong chế độ lò đêm vì men màu chuyển sang tông sáng.
- **Giấy** (`giay`): chữ luôn sáng, đặt trên viên `*-nen`, trên ảnh và trên nền đêm; không đổi theo chế độ.
- **Đêm** (`dem`): nền luôn tối (thanh bên Ban quản lý, lớp phủ sau hộp thoại, liên kết bỏ qua điều hướng).

### Biểu đồ
- `chart-1` lam, `chart-2` đất nung, `chart-3` ngọc lục, `chart-4` vàng đồng: bộ bốn màu đã qua kiểm tra độ sáng, mù màu và tương phản trên nền sứ; có bộ riêng cho chế độ tối. Chữ trong biểu đồ luôn dùng màu chữ, không dùng màu dữ liệu.

### Tủ chè (khu khách hàng)
Bảng màu con của Tủ chè, chỉ dùng trong `/account`; nền giấy và chữ vẫn dùng `nga`, `su`, `muc`, `tro` của thế giới chung.
- **Sơn then** (`then`, tối `#241a15`): gỗ thân tủ, hoành phi, nóc tủ, hàng ngăn dưới đáy điện thoại, nền khung tên và quai. Luôn mang vân sơn mài `/textures/lacquer.svg` (ô 480×240px); chữ trên sơn then là `giay`.
- **Mặt ngăn** (`then-2`, tối `#33261f`): sáng hơn `then` một nấc; mặt ngăn kéo, thanh kệ, khung tranh, thành hộp ngăn kéo, thanh đứng và thanh ngang của cánh tủ.
- **Chỉ vàng** (`chi`, tối `#d6b263`): nét vẽ vàng của sơn mài. Viền trong 1px (đặc hoặc pha 28-85% tùy độ gần mắt), dải hồi văn, nét quai, chốt cửa, nét chân quỳ. Tên tủ trên hoành phi, chữ khắc dưới khung tranh và tên trên bảng hiệu xưởng dùng `chi-nhat` (`#f3dc9f`, giữ nguyên ở chế độ tối), chỉ đặt trên sơn then.
- **Mực son** (`seal-ink`, tối `#e8746a`): mực của con dấu trong Tủ chè: dấu đếm việc trên mặt ngăn, dấu thư chưa mở, triện xưởng. Cùng giá trị với `doson` khi sáng; khi tối sẫm hơn `doson` một chút để chữ `on` trên dấu vẫn đọc được.
- Bóng trong Tủ chè đổi sang màu gỗ ấm `rgb(20 12 8)` thay cho màu mực của thế giới chung.

### Chế độ tối "lò đêm"
Đặt qua `:root[data-theme="dark"]`, giữ nguyên tên token: `nga` thành than ấm `#120f0d`, `su` thành `#1d1713`, `vua` thành tro nung `#3b3028`, `muc` thành ngà sáng `#f1e7d7`; các men màu chuyển sang tông sáng (`lam` `#94b4ee`, `datnung` `#ec9a72`, `ngoc` `#8fc7b1`) còn `*-nen` giữ đậm để chữ `giay` vẫn đọc được. Chế độ được đặt trước khi vẽ trang bằng script khởi động, đọc `localStorage` rồi tới `prefers-color-scheme`.

### Named Rules
**Quy tắc Men phủ mảng.** Men màu xuất hiện dưới dạng viên gốm phủ kín (biển hiệu, thanh bên, ô số liệu, nút), không làm đường viền mảnh hay chữ nhấn rải rác. Một màn hình có một men chủ, các men khác là viên điểm xuyết.

**Quy tắc Triện son.** `doson` thuộc về con dấu xác thực, lỗi và hành động phá hủy. Không có vai trò nào khác. Trong Tủ chè, mực son (`seal-ink`) còn mang số việc đang chờ và thư chưa mở, nhưng luôn ở hình con dấu (xem Quy tắc Dấu son phẳng).

**Quy tắc Chữ trên men.** Trên khối men đổi theo chế độ thì dùng `on`; trên viên `*-nen`, ảnh hoặc nền `dem` thì dùng `giay`. Không đặt `muc` lên men đậm.

**Quy tắc Chỉ vàng.** Trong Tủ chè, vàng `chi` là nét vẽ vàng của sơn mài: viền trong 1px, dải hồi văn, quai và chốt vẽ nét phẳng. Không giả ánh kim đồng bằng dải chuyển màu nhiều điểm dừng hay vệt phản chiếu, không phủ `chi` thành mảng nền. Chỉ vàng là nét trang trí bản địa của đồ sơn then, nên Quy tắc Men phủ mảng (dành cho men gốm) không cấm nó.

**Quy tắc Dấu son phẳng.** Mọi dấu son trong Tủ chè là con dấu in phẳng: hình vuông bo 4px, nghiêng -6° tới -8°, viền trong hai nét (`seal-ink` rồi `on`), chữ Phudu 800. Thư đã mở chỉ còn viền son 45% không nền. Không vẽ giọt sáp nổi khối.

## Typography

**Display Font:** Phudu (với Be Vietnam Pro, system-ui)
**Narrative Font:** Alegreya (với Georgia), có nghiêng
**Body Font:** Be Vietnam Pro (với system-ui), các độ đậm 400/500/600/700
**Label/Mono Font:** JetBrains Mono (với ui-monospace)

**Character:** Phudu chữ hoa khít là tấm biển ghép gốm đặt ở đầu mỗi khu, dấu tiếng Việt vẫn chắc ở cỡ lớn; Alegreya là giọng người kể, dành cho tên tác phẩm, tên xưởng, lời nghệ nhân; Be Vietnam Pro làm phần việc. Cả bốn họ chữ đều tải bộ con chữ `vietnamese`.

### Hierarchy
- **Display** (800, `clamp(2.6rem, 6.4vw, 5.4rem)`, 0.95, chữ hoa): tiêu đề lớn nhất của khu triển lãm. Viên biển hiệu mở màn dùng cỡ riêng `clamp(2.5rem, 4.6vw, 4.2rem)` để vừa trong viên.
- **Headline** (800, `clamp(2rem, 4vw, 3.2rem)`, 1, chữ hoa): tiêu đề mục (SectionHeading), tiêu đề trang lỗi. Mọi `h1`, `h2` mặc định là Phudu chữ hoa 800.
- **Title** (700, `clamp(1.5rem, 2.4vw, 2rem)`, 1.02, chữ hoa): tiêu đề trang trong khu làm việc (PageHeader).
- **Numeral** (Phudu 800, 2.6rem, 1): số lớn trên ô số liệu, số xưởng đang mở, nhiệt độ lò; dùng số dạng bảng (`tabular-nums lining-nums`).
- **Narrative** (Alegreya 700, khoảng 1.125-1.5rem, 1.2): `h3`, tên tác phẩm, tên xưởng, tiêu đề hộp thoại, tiêu đề khối trống. Trong văn bản dài, `h2` cũng chuyển sang Alegreya 1.6rem.
- **Body** (400, 16px, 1.6): chữ làm việc. Văn bản dài giới hạn 68ch; tiêu đề cân dòng (`text-wrap: balance`), đoạn văn `pretty`.
- **Label** (600, 0.8rem, 0.02em, chữ thường, màu `tro`): nhãn nhóm cho legend, cột chân trang, tiêu đề thẻ. Đầu cột bảng là ngoại lệ duy nhất dùng chữ hoa nhỏ giãn chữ.
- **Code** (JetBrains Mono, 0.8em, 0.02em, số dạng bảng): mã lô, mã yêu cầu báo giá.

### Tủ chè
- **Khung tên** (Phudu 700, 12px, 1.15, chữ hoa, 0.05em; 10px trên ngăn dưới đáy điện thoại): nhãn của mỗi mặt ngăn, cắt bằng dấu ba chấm khi dài.
- **Tên tủ trên hoành phi** (Phudu, 1.45rem) kèm dòng "của [tên]" Alegreya nghiêng 0.95rem.
- **Đầu lòng ngăn** (`title-lg` Phudu chữ hoa), ngay dưới là dải hồi văn vàng rộng 144px rồi lời dẫn chữ `tro` tối đa `max-w-2xl`.
- **Tên nhóm trong ngăn** (Alegreya 700, 1.35rem, chữ thường) kèm số đếm Be Vietnam Pro 600 màu `tro`: đứng một mình như một tiêu đề, không làm dòng mồi.
- **Đồ giấy:** tên đơn, tên xưởng, tên tác phẩm dùng Alegreya 700 (1.02-1.45rem); mã đơn, mã lô dùng mono màu `lam`; ngày trên cuống vé là Phudu 2.6-3.2rem số dạng bảng.

### Named Rules
**Quy tắc Biển hiệu.** Phudu chỉ dùng chữ hoa và chỉ cho tiêu đề, số lớn và chữ trên triện; không bao giờ cho đoạn văn.

**Quy tắc Không dòng mồi.** Tiêu đề đứng một mình. Nhãn nhóm không được đặt làm dòng chữ nhỏ phía trên tiêu đề.

## Layout

Mô hình không gian là lưới ghép gốm. Nền khu công khai mang lưới mạch vữa kẻ 1px màu `vua`, ô 72px. Một bức ghép là lưới CSS có khe 6px và đệm 6px trên nền `vua`, góc ngoài 10px, nên khe giữa các viên chính là mạch vữa. Bức ghép mở màn dùng 12 cột × 6 hàng trên máy tính (hàng `clamp(56px, 6.2vw, 92px)`, viên biển hiệu chiếm 6 cột × 5 hàng ở giữa, cả bức nằm gọn trong màn hình đầu) và gập về 6 cột với hàng tối thiểu 64px trên điện thoại, các viên trang trí nhỏ bị ẩn.

Khung chứa: khu công khai rộng tối đa 1440px, lề 16px (điện thoại) tới 24px; khu làm việc là lưới hai cột `272px` thanh bên + vùng làm việc, nội dung tối đa `max-w-6xl` với lề 16px/32px. Đầu trang dính cao 64px (72px từ `md`), nền ngà mờ 88% có làm mờ phía sau. Mọi thanh dính bù chiều cao thanh demo qua `--demo-h`.

Điện thoại trong khu làm việc: thanh tab cố định dưới đáy, ô bấm cao 56px, năm tab cộng nút "Thêm" mở ngăn kéo dưới dạng bức ghép 3 cột. Mục tiêu bấm tối thiểu 44px (nút cỡ vừa, mục thanh bên `min-h-11`). Điểm ngắt dùng mặc định Tailwind: `sm` 640px, `md` 768px, `lg` 1024px (thanh bên xuất hiện).

Khi in: ẩn đầu trang, chân trang, điều hướng; nền trắng chữ đen; mọi phần tử chờ hiệu ứng hiện ngay.

**Tủ chè (khu khách hàng).** Không có thanh bên. Nền trang vẫn là lưới mạch vữa. Hoành phi sơn then dính trên cùng, cao 64px, nội dung trong `max-w-6xl` với lề 16px/24px. Từ 1024px, nóc tủ là một hàng tám mặt ngăn kéo (khe 8px) dưới dải hồi văn, góc trên 12px. Trang tổng quan là thân tủ: lưới sơn then khe 10px, đệm 10px, 1 cột trên điện thoại, 6 cột từ 768px, 12 cột từ 1280px; mỗi ngăn lõm chiếm một số cột, biển tên men lam giữ góc trên trái, dưới cùng là chân quỳ cao 18px có diềm hồi văn lật ngược. Mỗi trang con là lòng một ngăn kéo: giấy ngà với thành gỗ 6px ba phía (bốn phía dưới 1024px vì không còn hàng mặt ngăn phía trên), đệm 16px/32px/40px theo cỡ màn hình.

Dưới 1024px, hàng mặt ngăn xuống đáy màn hình: năm ngăn và ngăn "Khác", cao 58px, chừa vùng an toàn; "Khác" mở tấm sơn then trồi từ dưới lên (góc trên 14px) với lưới 2 cột mặt ngăn cao 84px. Nội dung chừa 128px phía dưới cho hàng ngăn.

## Elevation & Depth

Hệ thống lai: độ sâu chủ yếu đến từ vật liệu của viên gốm (gờ sáng ở mép trên, gờ tối ở mép dưới như lớp men đọng) chồng lên một bóng đổ mềm ấm màu mực. Bóng đổ không bao giờ cứng hay lệch; chúng tan ra và có độ lan âm để viên trông như nằm sát mặt vữa. Hover nâng viên lên 2px và đổi sang bóng nhấc. Chế độ tối đổi màu bóng sang đen đậm hơn.

### Shadow Vocabulary
- **Mềm** (`--shadow-soft`: `0 1px 2px rgb(28 26 23 / 0.05), 0 8px 22px -14px rgb(28 26 23 / 0.28)`): mặc định cho thẻ, viên gốm, nút men, mục đang chọn trên thanh bên.
- **Nhấc** (`--shadow-lift`: `0 2px 4px rgb(28 26 23 / 0.06), 0 22px 44px -22px rgb(28 26 23 / 0.45)`): viên đang hover, hộp thoại, thông báo nổi, tooltip biểu đồ, popup bản đồ.
- **Gờ viên gốm** (`inset 0 1px 0 rgb(255 255 255 / 0.28), inset 0 -2px 0 rgb(0 0 0 / 0.08)`): luôn đi kèm bóng mềm trên mọi viên.
- **Nút men** (`inset 0 1px 0 rgb(255 255 255/0.22), inset 0 -2px 0 rgb(0 0 0/0.12)` + bóng mềm; khi ấn đổi thành `inset 0 2px 3px rgb(0 0 0/0.2)` và lún 1px).

### Named Rules
**Quy tắc Viên nằm trên vữa.** Bóng đổ luôn mềm, ấm và có độ lan âm; không dùng bóng lệch cứng. Độ sâu đến từ gờ men trước, bóng sau.

**Quy tắc Bóng men.** Viên tương tác được thì phản hồi hover bằng vệt sáng lướt theo con trỏ (hòa trộn `soft-light`) và nhấc 2px; khi giảm chuyển động thì không nhấc.

### Tủ chè
Độ sâu của Tủ chè là độ sâu đồ gỗ, ánh sáng từ trên xuống, bóng màu gỗ `rgb(20 12 8)`: ngăn lõm vào thân tủ, mặt ngăn nhô ra, đồ đứng trên kệ đổ bóng xuống mặt kệ. Mọi bóng vẫn mềm và có độ lan âm như thế giới chung.
- **Ngăn lõm** (`inset 0 0 0 1px chi 75%, inset 0 0 0 3px rgb(20 12 8/0.3), inset 0 16px 20px -14px rgb(20 12 8/0.55), inset 0 -12px 16px -16px rgb(20 12 8/0.45)`): lớp phủ trên mọi ngăn của thân tủ, nằm trên cả cánh tủ và nội dung.
- **Mặt ngăn** (`inset 0 0 0 1px chi 50%, inset 0 0 0 5px rgb(0 0 0/0.16), inset 0 1px 0 rgb(255 255 255/0.1), 0 1px 0 rgb(0 0 0/0.55)`): khung chỉ vàng và mép gỗ; ngăn đang mở thay bằng chỉ vàng 85% và bóng rơi `0 18px 20px -12px rgb(10 6 4/0.8)`.
- **Thanh kệ** (`inset 0 1px 0 chi 85%, inset 0 -2px 0 rgb(0 0 0/0.35), 0 9px 12px -6px rgb(20 12 8/0.5)`) và **đồ trên kệ** (`drop-shadow(0 9px 6px rgb(20 12 8/0.3))`, khi rê `drop-shadow(0 16px 10px rgb(20 12 8/0.26))` và nhấc 5px), kèm vệt tiếp đất hình bầu dục ngay dưới đáy ảnh tách nền.
- **Đồ giấy:** phiếu `0 1px 0 rgb(28 18 12/0.08), 0 12px 22px -16px rgb(28 18 12/0.55)`; vé dùng `drop-shadow` hai lớp để bóng ôm theo khuyết; thư chưa mở nổi hơn thư đã mở.
- **Hộp ngăn kéo:** thành gỗ bằng bóng trong 6px `then-2`, bóng gỗ đổ vào lòng từ mép trên, bóng rơi `0 30px 40px -34px rgb(20 12 8/0.7)`.

**Quy tắc Ngăn lõm.** Khối nội dung trong Tủ chè lõm vào gỗ, không nổi lên khỏi gỗ: bóng đổ vào lòng ngăn từ mép trên. Chỉ mặt ngăn kéo, đồ trên kệ và đồ giấy mới nổi.

## Shapes

Ngôn ngữ hình khối là viên gốm vuông vức với góc bo nhẹ. Viên gốm, nút, ô nhập, mục điều hướng: 6px (`--radius-tile`). Nhãn trạng thái và huy hiệu đếm: 4px (3px trên tab điện thoại). Thẻ, thông báo nổi, popup bản đồ: 8px. Bức ghép và hộp thoại: 10px. Ngăn kéo dưới đáy điện thoại chỉ bo hai góc trên 14px. Các vạch chỉ mục và thanh tiến trình dùng 2px hoặc bo tròn hoàn toàn khi là rãnh mảnh.

Hình lặp lại: lưới mạch vữa; viên hoa văn mây sóng lam (ô 64px), viên sen (96px), viên men rạn (vết rạn mực trên nền `#e6d9bf`, ô 240px), viên đất nung có chấm hạt 7px, viên ngọc và viên lam có vệt sáng hướng tâm ở góc trên trái; vạch phân cách sóng nước lam cao 14px; khối trống phủ vân men rạn rất mờ (360px). Triện son là hình vuông bo 2.5px, viền trong, nghiêng -3° tới -6°. Dấu trạng thái là bốn hình 7-8px: tròn, thoi, vuông, vòng.

Tủ chè dùng góc nhỏ hơn của đồ gỗ: 4px cho mặt ngăn, ngăn lõm, phiếu, thư và dấu son; 2-3px cho khung tên, khung tranh, cánh tủ và thanh kệ; 12px cho hai góc trên của nóc tủ (`cabinet`); 8px cho đáy hộp ngăn kéo. Hình lặp lại: dải hồi văn móc vuông 20×12px nét `chi`, lặp kiểu `round` để dải luôn dừng ở trọn một móc; hàng lỗ xé (chấm 8×13px) và đường xé đứt ở cuống phiếu; vé có cuống 104px (84px bản gọn) với hai khuyết tròn bán kính 10px ở đường xé; lỗ bấm tròn 14px trên cuống vé đã dùng; chân quỳ cong ở hai đầu chân tủ.

## Components

### Buttons
Viên gốm men ấn được: chắc tay, có gờ men và lún khi ấn.
- **Shape:** góc viên gốm (6px), chữ 600, không xuống dòng.
- **Primary:** men lam, chữ `on`, cao 44px đệm ngang 20px; hover sang `lam-sang`. Cỡ nhỏ 36px/12px, cỡ lớn 52px/28px.
- **Earth / Celadon / Danger:** cùng hình, men đất nung (hover `datnung-dam`), men ngọc (hover sáng thêm 10%), đỏ son (hover `doson-dam`).
- **Outline:** nền sứ 60% với viền mực 20%, hover viền 45% và nền sứ đặc; lún 1px khi ấn.
- **Ghost:** trong suốt, hover nền `nga-dam`. Dùng cho "Hủy" trong hộp thoại xác nhận và nút biểu tượng 40px ở đầu trang.
- **Hover / Focus:** chuyển màu, bóng và vị trí trong 200ms; focus là vòng `lam` 2px cách 2px. Khi tải, hiện vòng quay và khóa nút.
- **Trên viên men đậm:** nút chính đổi thành nền `giay` chữ lam đậm, nút phụ là nền giấy 12% có viền trong giấy 30%.

### Chips
- **Style:** nhãn trạng thái nền nhạt của men (`lam-nhat`, `datnung-nhat`, `ngoc-nhat`, vàng rơm 15%, tro 10%, son 10%) với chữ cùng men và viền trong 25-35%; tông mực là nền `muc` chữ `nga`. Chữ 12px 600, góc 4px.
- **State:** dấu hình đi trước chữ: ● đang chạy, ◆ cần xử lý, ■ đã xong, ○ đã đóng.

### Cards / Containers
- **Corner Style:** 8px.
- **Background:** sứ trắng `su`.
- **Shadow Strategy:** bóng mềm (xem Elevation & Depth).
- **Border:** 1px `vua`.
- **Internal Padding:** 20px cho ô số liệu; thẻ tự đặt theo nội dung.
- **Ô số liệu (Stat):** một viên gốm (`.tile`) tông sứ, lam, đất nung hoặc ngọc; nhãn 14px, số Phudu 2.6rem, gợi ý 12px.
- **Khối trống (EmptyState):** viền đứt `vua` trên nền sứ 60%, một bức ghép nhỏ ba viên (hoa văn, men rạn, lam mang biểu tượng), tiêu đề Alegreya 2xl.

### Inputs / Fields
- **Style:** nền sứ 80%, viền 1px `vua`, góc 6px, đệm 10px/14px, chữ 15px; nhãn 14px 500 phía trên, dấu bắt buộc màu đất nung.
- **Focus:** viền chuyển `datnung`, nền sứ đặc, vầng sáng đất nung 15% rộng 2px.
- **Error / Disabled:** viền và vầng sáng `doson`, thông báo lỗi 13px màu son có `role="alert"`; vô hiệu thì mờ 60%. Ô chọn dùng mũi tên vẽ bằng SVG; hộp kiểm dùng `accent-color` đất nung.

### Navigation
- **Khu công khai:** mục 15px 500, mực 65% khi chờ và mực đặc khi đang xem; một viên đất nung nhỏ 5px trượt theo mục đang xem ở mép dưới đầu trang (lò xo, có chuyển động liên tục giữa các trang). Nút "Đăng ký" là nút lam; khi đã đăng nhập, lối vào khu làm việc là một viên mang men của khu.
- **Khu làm việc (nghệ nhân, Ban quản lý):** thanh bên phủ men của vai trò (nghệ nhân `tile-dat`, Ban quản lý nền `dem`; khu khách hàng đã chuyển sang hàng mặt ngăn của Tủ chè), mục 14.5px cao tối thiểu 44px; mục đang chọn là một viên trượt bằng lò xo (giấy trên lam/đất nung, ngọc đậm trên đêm).
- **Điện thoại:** thanh tab dưới đáy nền sứ 95% làm mờ, vạch 3px màu men của khu trượt trên tab đang chọn, ngăn kéo "Thêm" trồi lên trong 380ms.

### Dialog và thông báo nổi
- **Hộp thoại:** phần tử `<dialog>` gốc, nền ngà, góc 10px, viền `vua`, bóng nhấc, rộng `min(92vw, 520px)`; lớp phủ `dem` 45% làm mờ 2px; trồi lên 14px trong 320ms. Tiêu đề Alegreya 2xl, chân hộp thoại có đường kẻ `vua`.
- **Thông báo nổi:** thẻ sứ góc 8px, viền theo loại (ngọc, son, lam), vạch thời gian 3px co dần ở mép dưới (4,5 giây, lỗi 7 giây).

### Tủ chè – khu khách hàng (Signature)
Món đồ gỗ chứa mọi thứ khách giữ với làng. Thành phần nằm trong `src/components/cabinet/` và `src/styles/cabinet.css`; chỉ dùng trong `/account`.
- **Hoành phi:** đầu trang sơn then, chỉ vàng 55% ở mép dưới; dấu vCraft trong khung chỉ vàng nghiêng -6° khi rê chuột; nút giao diện, chuông, tài khoản viết chữ `giay`, viền nút tài khoản chỉ vàng 45% (80% khi rê).
- **Mặt ngăn kéo (điều hướng):** sơn then `then-2` có khung tên và quai. Nghỉ: khung chỉ vàng 50%. Rê chuột: lún 2px và vòng quai đung đưa. Ngăn đang mở (`aria-current="page"`): men `lam-nen` có vệt sáng góc trên trái, bị kéo ra 8px và phóng 1.04, chỉ vàng 85%; trên hàng đáy điện thoại thì nhô lên 6px, không phóng.
- **Khung tên:** thẻ giấy ngà cài trong khung sơn then viền chỉ vàng, đệm 3px.
- **Quai:** đế và vòng treo vẽ nét `chi` phẳng (18×21px, 14×17px trên điện thoại).
- **Dấu son đếm:** dấu vuông 24px ở góc trên phải mặt ngăn, nghiêng -8°, hiện "9+" khi quá chín; có nhãn đọc đầy đủ số việc.
- **Ngăn lõm:** ô của thân tủ, lót giấy ngà hoặc sứ với vân giấy dó 300px, hoặc là biển tên men lam giữ lời chào và việc chờ.
- **Kệ và đồ trên kệ:** thanh kệ sơn then cao 13px viền chỉ vàng trên; tác phẩm có ảnh tách nền đứng thẳng trên kệ với vệt tiếp đất, tác phẩm chưa có đứng trong khung tranh viền chỉ vàng có chữ khắc tên xưởng; ô trống là khung viền đứt mời thêm tác phẩm.
- **Cánh tủ:** mỗi ngăn trên trang tổng quan có hai cánh là hai viên hoa văn của cổng đăng nhập (`tile-hoavan`, `tile-lam`, `tile-sen`, `tile-ran`) trong khung thanh đứng, thanh ngang sơn then 9px với chỉ vàng, chốt chỉ vàng 10px ở mép gặp nhau. Chỉ đóng lần đầu mỗi phiên ở `/account` (script đặt trước khi vẽ, lưu `sessionStorage`).
- **Hộp ngăn kéo:** lòng trang con, giấy ngà với thành gỗ; đầu ngăn gồm tiêu đề, dải hồi văn, lời dẫn và thao tác chính.
- **Phiếu đặt hàng (đơn sỉ):** tờ giấy góc 4px có hàng lỗ xé và đường xé đứt ở cuống trái; mã đơn mono lam, tên đơn Alegreya, thanh tiến độ năm chặng; cột phải ngăn bằng đường đứt ghi số chào giá (Phudu), xưởng, giá trị và việc cần làm tiếp (đất nung nếu gấp). Rê chuột nhấc 2px.
- **Thanh tiến độ năm chặng:** ô 10px góc 2px; ô đặc lam là đã qua, ô gạch chéo lam có viền là chặng hiện tại, ô mực 10% là chưa tới; đơn hủy là dòng chữ gạch ngang. Hình mang nghĩa, không chỉ màu.
- **Vé trải nghiệm:** cuống ngày tháng (men lam chữ `giay` khi đã xác nhận, `lam-nhat` khi chờ, `nga-sau` khi đã qua), đường xé đứt có hai khuyết; dòng trạng thái có dấu hình; vé còn hiệu lực có "Thêm vào lịch" (.ics) và "Chỉ đường"; vé đã dùng có lỗ bấm trên cuống.
- **Thư:** mỗi thông báo là một tờ giấy góc 4px; thư chưa mở mang dấu son đặc 30px và chữ đậm, thư đã mở chỉ còn viền son mờ và chữ nhạt; nhóm theo ngày.
- **Triện xưởng:** con dấu vuông hai nét, hai chữ khắc Phudu, mực `seal-ink` loang qua bộ lọc nhiễu SVG (mép nhòe, lòng nét ăn mực không đều); mỗi dấu nghiêng một góc riêng (-5° tới 6°); triện mờ 50% là xưởng còn chờ khách đóng dấu đánh giá.
- **Chân tủ:** chân quỳ cong sơn then hai đầu, nét chỉ vàng theo đường cong.

**Chuyển động của Tủ chè** (đều dùng `ease-out-expo`):
- **Mở cánh tủ:** lần đầu mỗi phiên ở `/account`, chờ hai khung hình rồi dừng 300ms cho thấy tủ đóng, sau đó từng cặp cánh xoay bản lề ±100° trong 0.85s, trễ lần lượt 0-330ms giữa các ngăn. Cánh được dọn khi mọi hoạt ảnh thật sự xong (không đoán bằng đồng hồ), có lưới an toàn 7 giây khi tab bị ẩn.
- **Kéo ngăn:** mỗi lần chuyển sang trang con (trừ `/account`), lòng ngăn trượt ra trong 0.75s: cắt từ trên xuống, trượt 16px, từ mờ 35% lên đặc.
- **Mặt ngăn:** chuyển vị trí và bóng trong 0.6s; vòng quai đung đưa 16° → -9° → 4° → 0 trong 1.1s khi rê chuột.
- **Đồ trên kệ:** nhấc 5px và bóng giãn trong 0.5s. Ngăn "Khác" trồi lên trong 420ms, các ngăn con hiện cách nhau 35ms.
- **Giảm chuyển động:** không có cánh tủ, không kéo ngăn, ngăn đang mở không bị kéo ra, đồ trên kệ không nhấc.
- **Khi in:** bỏ nền sơn then và bóng, chữ đen.

**Ảnh tách nền (nguồn gốc bắt buộc).** Tác phẩm đứng trên kệ dùng ảnh WebP đã tách nền trong `public/seed/cutout/`. Mỗi ảnh tách nền bằng mô hình phông nền + GrabCut rồi duyệt tay, và phải có tệp `.webp.json` đi kèm ghi nguồn gốc ảnh gốc (nguồn, tác giả, giấy phép), ảnh dẫn xuất từ đâu và cách xử lý. Chỉ ảnh có tên trong danh mục `src/lib/cutouts.ts` mới đứng trên kệ; ảnh chụp trên nền rối giữ nguyên trong khung tranh. Vân `lacquer.svg` và `paper.svg` trong `public/textures/` là vân vẽ bằng SVG.

### Bức ghép mở màn (Signature)
Viên biển hiệu lam ở giữa giữ tiêu đề Phudu và hai lối vào; quanh nó là ảnh tác phẩm thật làm viên, viên men hoa văn, viên "xưởng đang mở" với vòng sáng nhịp, viên QR mời truy xuất và viên triện xác thực. Các viên gắn vào lưới theo hiệu ứng `tile-set` (0.85s, `cubic-bezier(0.16, 1, 0.3, 1)`), độ trễ tăng 85ms tỏa ra từ viên biển hiệu, mỗi viên có độ lệch và góc xoay riêng.

### Đồng hồ lò và dòng thời gian lô (Signature)
Mặt số sứ cung 240°, vạch mực, cung `chart-2` chỉ phủ vùng trên 1.200°C; kim mực bám nhiệt độ bằng mô hình lò xo có giảm chấn (vươn tới, hơi vọt qua rồi dừng), nhảy thẳng khi giảm chuyển động. Bản thanh ngang dính trên điện thoại. Dòng thời gian các công đoạn có rãnh `nga-sau` 3px, công đoạn đã qua đánh số trên viên `datnung-nen`.

### Các chi tiết chuyển động khác
- Thanh bước: mỗi bước là viên 32px góc 6px, mạch nối được tráng men dần (700ms, trễ 90ms mỗi bước), bước hiện tại có vòng sáng nhịp.
- Trang lỗi "viên gốm bị thiếu": bức ghép 5×3 thiếu đúng một viên, ô trống viền đứt mang mã lỗi.
- Nút lưu: sáu mảnh men bắn ra theo sáu hướng.
- Đổi sáng/tối: lớp men mới lan ra thành vòng tròn từ chính nút bấm (View Transition, 520ms).
- Phần tử `[data-reveal]` gắn vào khi cuộn tới; chỉ ẩn chờ khi `html.js` đã được đặt, và tự hiện sau 2,5 giây nếu quan sát viên lỗi.

### Chuyển động khi cuộn (khu công khai)
- **Cuộn mượt:** Lenis (`lerp` 0.09) chỉ ở khu công khai; tắt khi giảm chuyển động, cảm ứng giữ cuộn gốc, hộp thoại và bản đồ dùng `data-lenis-prevent`.
- **Tách lớp bức ghép:** viên trong bức ghép mở màn có `data-parallax` + `data-parallax-anchor="top"`, bay lên nhanh hơn viên biển hiệu theo `scrollY` (0.04–0.26); chỉ từ 768px trở lên. Parallax dùng thuộc tính `translate`, không đụng `transform` của `tile-set`.
- **Xuôi dòng sông Cái (`HistoryJourney`):** đoạn cuộn dính, 9 chặng trượt ngang như cuộn tranh, cuộn 1:1 không thêm lò xo (Lenis đã làm mượt). "Một ngày trên sông là sáu thế kỷ của làng": nền đổi màu liền mạch theo thời khắc, bắt đầu và kết thúc bằng đúng `nga` của trang nên không có đường cắt.
  - Kịch bản màu: `nga` (nhổ neo) → `#1f4a40` men ngọc (trước bình minh, Lý–Trần) → `#7a3519` đất (bình minh) → `#1b458f` men lam (buổi sáng, đi qua `#24524a` để không pha thành tím) → `#efe7d6` men trắng (giữa trưa, chữ tối) → `#7a5512` hổ phách (xế chiều) → `#1b1815` than (đêm) → `#163a73` (rạng đông, 2010) → `nga` (sáng nay).
  - Mỗi chặng giữ màu của mình ở 30% đầu và cuối mỗi quãng, chỉ chuyển ở 40% giữa; màu chữ đổi nhanh đúng lúc nền vượt ngưỡng sáng/tối để luôn đọc được.
  - Mặt trống đồng Đông Sơn (`DrumFace`) là mặt trời: mọc bên trái, lên đỉnh, lặn bên phải, khuất về đêm (trăng khuyết hiện), mọc lại lúc rạng đông.
  - Sông: ba lớp sóng (`WaveLayer`) trôi liên tục với tốc độ khác nhau; thuyền nan (`Sampan`) dập dềnh, chạy dọc theo tiến độ và dừng đúng trên nhãn chặng đang xem.
  - Hiện vật nằm trong khung vòm (`.arch`, hốc khám thờ/cửa lò bầu); khi tới giữa màn hình khung lớn dần, thẳng lại, ảnh bên trong trôi ngược nhẹ, năm viết bằng Phudu viền nét theo màu nhấn của chặng.
  - Dưới 900px hoặc giảm chuyển động: các chặng xếp dọc, nền vẫn đổi màu theo cuộn.
- **Con đường gốm sứ (`MuralBand`):** hai hàng ảnh thật của bức tranh ghép gốm ven sông Hồng trôi ngược chiều nhau theo `--p` (`data-progress="through"`), trên nền `dem`.
- **Chuyển tiếp giữa các khúc:** `.fade-edges` làm mép khúc có vân/nền khác mờ dần vào `nga` (110px); khúc ca dao dùng `.kiln-door` mở từ ô bo tròn ra tràn màn hình theo cuộn.
- **Thanh chỉ chặng (`JourneyRail`):** từ 1280px, mỗi khúc có `[data-chapter]` là một viên nhỏ ở mép phải; viên đang xem sáng lên, rê chuột hiện tên, bấm để cuộn tới.
- **Sóng nước sống:** viên `tile-hoavan.flow` trôi hoa văn 64px mỗi 14 giây.
- **Chữ hiện từng từ:** `RevealText` (`data-reveal="words"`), mỗi từ trồi lên khỏi khe có lề cho dấu tiếng Việt chồng, trễ 55ms mỗi từ; câu nguyên vẹn nằm trong `sr-only`.
- **Ảnh mở bằng mặt nạ:** `data-reveal="mask"` – lớp con cắt từ dưới lên (1,1s), ảnh thu từ 1,15 về 1.
- **Nét tự vẽ:** `WaveRule` (sóng nước) và `[data-progress]` cấp biến `--p` 0→1; sáu công đoạn (`.fire-steps`) thắp màu lửa lần lượt theo `--p`.
- **Dải chữ chạy:** tên các làng gốm Việt Nam (`VillageMarquee`, 60s một vòng, dừng khi rê chuột).
- **Nghiêng 3D:** viên tác phẩm `[data-tilt]` nghiêng tối đa ±3,5° theo con trỏ.
- **Khúc nghỉ ca dao:** "Ước gì anh lấy được nàng / Để anh mua gạch Bát Tràng về xây" trên nền tường than trôi chậm và mặt trống đồng mờ, mở kiểu cửa lò.
- **Màu tối chung `dem`:** chàm đậm `#0f1b38` (cùng họ với men lam) cho chân trang, khúc nghỉ, dải tranh, thanh bên Ban quản lý.

## Do's and Don'ts

### Do:
- **Do** đặt nội dung chính của khu công khai trên nền `nga` với lưới mạch vữa, và gom các khối liên quan vào bức ghép khe 6px nền `vua`.
- **Do** dùng góc 6px cho viên, nút, ô nhập; 8px cho thẻ; 10px cho bức ghép và hộp thoại.
- **Do** mang trạng thái bằng cả hình dấu (tròn, thoi, vuông, vòng) lẫn màu.
- **Do** dùng triện son `doson` cho mọi dấu hiệu "đã được Ban quản lý xác thực".
- **Do** giữ mỗi khu làm việc trong men của nó: khách hàng lam, nghệ nhân đất nung, Ban quản lý đêm với điểm ngọc.
- **Do** dùng `on` cho chữ trên men đổi theo chế độ và `giay` cho chữ trên viên `*-nen`, ảnh, nền đêm.
- **Do** cho mọi chuyển động một đường thay thế khi `prefers-reduced-motion: reduce`.
- **Do** dùng `--chart-1..4` cho mọi chuỗi dữ liệu, cột rộng tối đa 24px, đầu cột bo 4px, kèm bảng số liệu.
- **Do** giữ mục tiêu bấm từ 44px trở lên, 56px cho tab điện thoại.
- **Do** giữ Tủ chè trong khu khách hàng; khu nghệ nhân và Ban quản lý dùng khung chung cho tới khi có bản sắc riêng.
- **Do** vẽ đồ đồng và vàng của Tủ chè bằng nét `chi` phẳng 1px trên sơn then.
- **Do** dùng `seal-ink` cho mọi dấu son trong Tủ chè (đếm việc, thư chưa mở, triện xưởng), ở hình con dấu vuông 4px nghiêng.
- **Do** chỉ đặt tác phẩm đứng trên kệ khi ảnh tách nền đã được duyệt tay, có tên trong `cutouts.ts` và có tệp `.webp.json` ghi nguồn gốc; còn lại dùng khung tranh viền chỉ vàng.
- **Do** để ngăn nội dung lõm vào gỗ với bóng đổ vào từ mép trên; chỉ mặt ngăn, đồ trên kệ và đồ giấy mới nổi lên.

### Don't:
- **Don't** dựng giao diện kiểu chợ thủ công nền kem, chữ có chân và một điểm nhấn đất nung; men màu phải phủ mảng.
- **Don't** đặt dòng chữ nhỏ (kicker) phía trên tiêu đề; `.label` chỉ dùng cho nhãn nhóm.
- **Don't** dùng Phudu cho đoạn văn hoặc ở chữ thường.
- **Don't** dùng bóng đổ cứng, lệch; bóng luôn mềm với độ lan âm.
- **Don't** bo góc lớn kiểu viên thuốc cho nút hay thẻ.
- **Don't** dùng `doson` để trang trí.
- **Don't** viết màu dữ liệu lên chữ trong biểu đồ.
- **Don't** giả ánh kim đồng bằng dải chuyển màu nhiều điểm dừng hay vệt phản chiếu.
- **Don't** vẽ dấu sáp dạng giọt nổi khối; dấu son là con dấu in phẳng.
- **Don't** đưa ảnh tách nền tự động chưa duyệt, hoặc thiếu tệp nguồn gốc, lên kệ.
- **Don't** đem khung Tủ chè (hoành phi, mặt ngăn, thân tủ) sang khu nghệ nhân hay Ban quản lý.
