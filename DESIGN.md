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
  then-3: "#4a3428"
  chi: "#c9a24e"
  chi-nhat: "#f3dc9f"
  giay-do: "#fbf4e4"
  giay-do-vien: "#e4d2ad"
  son: "#b3261e"
  troi: "#f6ead4"
  song: "#cddbf0"
  duong: "#e4d9c3"
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
  operate-h1:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.011em"
  operate-h2:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.011em"
  operate-h3:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.45
  operate-stat:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.015em"
    fontFeature: "\"tnum\", \"lnum\""
  operate-meta:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
  lang-hero:
    fontFamily: "Phudu, Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "clamp(2.2rem, 4.3vw, 3.9rem)"
    fontWeight: 800
    lineHeight: 0.98
  lang-story:
    fontFamily: "Alegreya, Georgia, serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.15
    fontFeature: "\"lnum\""
rounded:
  hairline: "2px"
  badge: "4px"
  tile: "6px"
  card: "8px"
  mosaic: "10px"
  sheet: "14px"
  station: "10px"
spacing:
  grout: "6px"
  grid-cell: "72px"
  gutter-mobile: "16px"
  gutter-desktop: "32px"
  container-site: "1440px"
  container-zone: "72rem"
  sidebar: "272px"
  road-viewbox: "1200x380"
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
  stat:
    backgroundColor: "{colors.su}"
    textColor: "{colors.muc}"
    typography: "{typography.operate-stat}"
    rounded: "{rounded.card}"
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
  lang-station:
    backgroundColor: "{colors.su}"
    textColor: "{colors.muc}"
    rounded: "{rounded.station}"
    padding: "10px 8px"
    width: "150px"
  lang-task-row:
    backgroundColor: "{colors.su}"
    textColor: "{colors.muc}"
    rounded: "{rounded.card}"
    padding: "14px 16px"
  lang-kiln-band:
    backgroundColor: "{colors.then}"
    textColor: "{colors.giay}"
    padding: "32px 0 56px"
  lang-shelf:
    backgroundColor: "{colors.then}"
    textColor: "{colors.giay}"
    rounded: "{rounded.sheet}"
  lang-stamp:
    backgroundColor: "{colors.son}"
    textColor: "{colors.giay}"
    rounded: "{rounded.badge}"
  lang-letter:
    backgroundColor: "{colors.giay-do}"
    textColor: "{colors.muc}"
    rounded: "{rounded.card}"
    padding: "14px 16px"
  lang-step-button:
    backgroundColor: "{colors.su}"
    textColor: "{colors.muc}"
    rounded: "{rounded.tile}"
    height: "44px"
    width: "44px"
  optimistic-lock-badge:
    backgroundColor: "{colors.lam}"
    textColor: "{colors.on}"
    typography: "{typography.code}"
    rounded: "{rounded.badge}"
    padding: "2px 10px"
---

# Design System: vCraft

## Overview

**Creative North Star: "Con đường gốm sứ"**

vCraft là con đường ghép gốm ven sông Hồng: mỗi xưởng, mỗi tác phẩm, mỗi lô hàng là một viên gốm men được gắn vào cùng một lưới mạch vữa của làng. Nền là men ngà, có lưới mạch vữa xám ấm kẻ ngang dọc nhìn thấy được; những mảng lớn được tráng men thành viên gốm (men lam Bát Tràng, men ngọc, đất nung), xen giữa là viên hoa văn mây sóng lam vẽ tay, viên men rạn và viên sen. Xác thực được đóng bằng triện son. Hệ thống từ chối mô-típ "chợ thủ công nền kem, chữ có chân, điểm nhấn đất nung" quen thuộc: ở đây màu men chiếm trọn mảng, không chỉ làm điểm nhấn.

Mật độ chia hai giọng. Khu triển lãm công khai (thuyết phục) dùng bức ghép lớn, biển hiệu Phudu chữ hoa và ảnh tác phẩm thật làm viên gốm. Hai khu làm việc nghệ nhân và Ban quản lý gọn và chăm chú hơn: mỗi khu có thanh bên một màu men chiếm trọn chiều cao, vùng làm việc nền ngà, thẻ sứ trắng, và trên điện thoại là thanh tab dưới đáy bấm bằng một tay. Khu khách hàng không dùng khung này mà có thế giới riêng (xem dưới). Chế độ tối "lò đêm" đổi nền thành than ấm của lòng lò đã tắt lửa; men vẫn sáng trên nền lò.

Khu khách hàng (`/account`) có thế giới riêng là **Đường làng**: một buổi dạo làng gốm Bát Tràng. Trang chủ của khu là bến sông lúc bình minh vẽ bằng SVG (mặt trời trống đồng, đê, nhà ngói, lò bầu tỏa khói, đình, sông sóng mây, thuyền chở gốm thật, khóm tre), chế độ tối thành đêm hội đèn (sao, trăng, đèn lồng, cửa sổ sáng). Dưới bến là một con đường gạch uốn lượn qua sáu điểm dừng, mỗi điểm là một việc của khách với làng: Cổng làng (việc chờ bạn), Lò đơn sỉ, Bàn xoay (buổi nặn gốm), Kệ trưng bày (đã lưu), Nhà triện (hộ chiếu làng nghề) và Bến thư. Chọn một điểm thì người lữ khách đội nón lá xách đèn lồng đi theo con đường tới đó và nội dung của điểm mở ra. Mỗi điểm có một vật thể riêng: đồng hồ lò, bình xoay trên bàn xoay, kệ sơn then viền chỉ vàng, sổ hộ chiếu đóng triện son, thư giấy dó. Phòng báo giá là lò bậc thang sáu khoang, khoang hiện tại bén lửa. Bảng màu là của chung (men lam chủ đạo, đất nung, men ngọc, ngà, son), thêm vài màu cảnh (trời, sông, sơn then, chỉ vàng, giấy dó) chỉ sống trong `src/styles/lang.css`. Bản thiết kế gốc là canvas "Lối vào làng gốm – giao diện khách hàng" được duyệt ngày 28/11/2026; nó thay Tấm dệt (thổ cẩm men nâu) của các đợt trước. Khu nghệ nhân và Ban quản lý vẫn dùng khung thanh bên chung (`zone-shell`), không mượn Đường làng.

Chuyển động kể đúng một câu chuyện vật liệu: viên gốm được "gắn" vào mạch vữa (hơi lệch, hơi xoay rồi ăn khớp), bóng men lướt theo con trỏ khi rê lên viên, kim đồng hồ lò có quán tính và giảm chấn thật. Mọi chuyển động đều có đường thay thế khi người dùng giảm chuyển động.

**Key Characteristics:**
- Nền men ngà với lưới mạch vữa 72px nhìn thấy được; các khối gắn vào bức ghép cách nhau đúng một mạch vữa 6px.
- Màu men là mảng, không phải viền: lam, đất nung, men ngọc phủ trọn viên biển hiệu, thanh bên, ô số liệu.
- Góc viên gốm 4-8px; không có khối bo tròn lớn kiểu viên thuốc.
- Bốn giọng chữ có vai rõ ràng: Phudu chữ hoa cho biển hiệu, Alegreya cho tên và lời kể, Be Vietnam Pro cho chữ làm việc, JetBrains Mono cho mã lô.
- Trạng thái được mang bằng cả hình dấu lẫn màu.
- Triện son là con dấu duy nhất của sự xác thực.
- Khu khách hàng là Đường làng: bến sông vẽ tay đổi ngày/đêm theo chế độ, con đường gạch sáu điểm dừng có người lữ khách đi theo, mỗi điểm một vật thể làng nghề; không lan sang khu khác.

## Colors

Bảng màu men gốm Bát Tràng trên nền men ngà: ba men màu chính chiếm mảng lớn, hai màu son và vàng rơm dành cho dấu và điểm sáng, cùng thang trung tính ấm như đất sét đã nung.

### Primary
- **Men lam Bát Tràng** (`lam`): màu chủ đạo. Nút chính, viên biển hiệu mở màn, vòng focus, vùng chọn chữ, hoa văn mây sóng. Biến thể `lam-sang` cho hover, `lam-dam` cho chữ đậm trên nền sáng, `lam-nhat` cho nền nhãn, `lam-nen` cho mảng lớn luôn đậm.

### Secondary
- **Đất nung** (`datnung`): nút thứ hai (earth), thanh bên khu nghệ nhân (`datnung-nen` với chấm hạt đất), vạch chỉ mục đang xem trên điều hướng công khai, con trỏ nhập liệu, viền focus của ô nhập, nhiệt độ lò vượt 1.200°C.

### Tertiary
- **Men ngọc** (`ngoc`): nút celadon, trạng thái thành công, viên "xưởng đang mở cửa", thanh trạng thái khu Ban quản lý. `ngoc-nen` là mảng ngọc đậm.
- **Vàng rơm** (`vangrom`): sao đánh giá và nhãn tông vàng; chữ trên nền nhạt dùng `vangrom-dam` để đủ tương phản.
- **Đỏ son** (`doson`): triện xác thực của Ban quản lý, lỗi, hành động nguy hiểm. Không dùng làm màu trang trí.
- **Lửa** (`lua`): huy hiệu đếm số trên thanh bên men của khung khu làm việc chung; trong Đường làng là viên công đoạn đang làm và ngọn lửa của khoang lò hiện tại.

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

### Đường làng (khu khách hàng)
Dùng nguyên bảng màu chung; men lam là men chủ của khu (nút chính, điểm dừng đang chọn, vạch điều hướng, viên biểu tượng đầu trang), đất nung cho "Tạo yêu cầu báo giá" và chặng đã qua, men ngọc cho "đang mở cửa" và chào giá đang được chia, son cho triện. Màu riêng của cảnh khai báo thành biến trên `.lang` trong `src/styles/lang.css` (không qua `@theme`), có bộ thứ hai dưới `:root[data-theme="dark"] .lang`:
- **Trời và cảnh:** `--sky-top` `#f6ead4` → `--sky-mid` `#f7f2e8` → `--sky-low` `#dbe6f5` (tối: `#050817` → `#0f1b38` → `#1d3463`); đồi `#c3d3c8`/`#9cb8a8`; mái ngói `#7a4632`/`#5a3323`; tường `#ecdfc6`; sông `#cddbf0`/`#9db5de`, sóng mây lam; khói, lửa lò `#ee8a43`, tre `#3b6f5e`. Ở chế độ tối mái và tường chìm xuống, cửa sổ sáng `#ffc96b`, đèn lồng và sao hiện (`--lantern`, `--stars` chuyển 0 → 1).
- **Chữ trên cảnh:** `--hero-ink` (`#1c1a17`, tối `#fffdf8`) và `--hero-soft` (`#4a443c`, tối `#ddd2bd`), kèm quầng màu trời (`.chu-troi`) để chữ đè lên mái nhà vẫn đọc được.
- **Sơn then:** `--then` `#1e1511` (tối `#17100c`), `--then-3` `#4a3428`; chỉ vàng `--chi` `#c9a24e`, `--chi-nhat` `#f3dc9f`. Dùng cho kệ trưng bày, đồng hồ lò, dải lò bậc thang của phòng báo giá. Chữ trên sơn then là giấy `#fffdf8`, chữ phụ `#e6d9bf`, chữ nhấn `#f3dc9f`.
- **Giấy dó:** `--giay-do` `#fbf4e4` (tối `#261e18`), viền `#e4d2ad`, chữ `--muc-do` `#5c5246` (tối `#c9bba6`): mặt thư ở Bến thư và lời khách đã viết.
- **Sổ hộ chiếu:** trang `#f3e6c8`/`#f6ebd2` (tối `#2b231c`/`#30271f`), chữ `.chu-so` `#4f463c` (tối `#cdbfa9`).
- **Son:** `--son` `#b3261e` (tối `#c9362c`): triện của lô đã kiểm chứng và dấu "Mới" của thư chưa đọc. Chữ trên son luôn là giấy.

### Chế độ tối "lò đêm"
Đặt qua `:root[data-theme="dark"]`, giữ nguyên tên token: `nga` thành than ấm `#120f0d`, `su` thành `#1d1713`, `vua` thành tro nung `#3b3028`, `muc` thành ngà sáng `#f1e7d7`; các men màu chuyển sang tông sáng (`lam` `#94b4ee`, `datnung` `#ec9a72`, `ngoc` `#8fc7b1`) còn `*-nen` giữ đậm để chữ `giay` vẫn đọc được. Chế độ được đặt trước khi vẽ trang bằng script khởi động, đọc `localStorage` rồi tới `prefers-color-scheme`.

### Named Rules
**Quy tắc Men phủ mảng.** Men màu xuất hiện dưới dạng viên gốm phủ kín (biển hiệu, thanh bên, ô số liệu, nút), không làm đường viền mảnh hay chữ nhấn rải rác. Một màn hình có một men chủ, các men khác là viên điểm xuyết.

**Quy tắc Triện son.** `doson` thuộc về con dấu xác thực, lỗi và hành động phá hủy. Không có vai trò nào khác.

**Quy tắc Chữ trên men.** Trên khối men đổi theo chế độ thì dùng `on`; trên viên `*-nen`, ảnh hoặc nền `dem` thì dùng `giay`. Không đặt `muc` lên men đậm.

**Quy tắc Cảnh là của làng.** Màu cảnh (trời, sông, mái, sơn then, giấy dó) chỉ ở cảnh và vật thể của Đường làng; mọi chữ và thành phần thao tác dùng token chung. Không thêm men màu mới.

**Quy tắc Ngày và đêm cùng đọc được.** Mỗi màu cảnh có cặp sáng/tối khai báo trong `lang.css`; mọi chữ trong khu đạt 4.5:1 ở cả hai chế độ, kể cả khi đổi chế độ bằng nút trong lúc đang xem (kiểm bằng `contrast2.mjs`, 0 chỗ chưa đạt ngày 28/11/2026).

## Typography

**Display Font:** Phudu (với Be Vietnam Pro, system-ui)
**Narrative Font:** Alegreya (với Georgia), có nghiêng
**Body Font:** Be Vietnam Pro (với system-ui), các độ đậm 400/500/600/700
**Label/Mono Font:** JetBrains Mono (với ui-monospace)

**Character:** Phudu chữ hoa khít là tấm biển ghép gốm đặt ở đầu mỗi khu, dấu tiếng Việt vẫn chắc ở cỡ lớn; Alegreya là giọng người kể, dành cho tên tác phẩm, tên xưởng, lời nghệ nhân; Be Vietnam Pro làm phần việc. Cả bốn họ chữ đều tải bộ con chữ `vietnamese`.

### Hierarchy
- **Display** (800, `clamp(2.6rem, 6.4vw, 5.4rem)`, 0.95, chữ hoa): tiêu đề lớn nhất của khu triển lãm. Viên biển hiệu mở màn dùng cỡ riêng `clamp(2.5rem, 4.6vw, 4.2rem)` để vừa trong viên.
- **Headline** (800, `clamp(2rem, 4vw, 3.2rem)`, 1, chữ hoa): tiêu đề mục (SectionHeading), tiêu đề trang lỗi. Mọi `h1`, `h2` mặc định là Phudu chữ hoa 800.
- **Title** (700, `clamp(1.5rem, 2.4vw, 2rem)`, 1.02, chữ hoa): lớp `.title-md` của thế giới chung. Ngoài trang chủ, lớp này nhường cho thang chữ thao tác (xem dưới).
- **Numeral** (Phudu 800, 2.6rem, 1): số lớn của trang chủ (số xưởng đang mở, nhiệt độ lò); dùng số dạng bảng (`tabular-nums lining-nums`). Ô số liệu trong khu làm việc dùng `operate-stat`.
- **Narrative** (Alegreya 700, khoảng 1.125-1.5rem, 1.2): trên trang chủ là `h3`, tên tác phẩm, tên xưởng. Ngoài trang chủ chỉ còn ở giọng kể (`.giong-ke`): câu chuyện tác phẩm, khẩu hiệu và lời khách của xưởng, bài bản tin.
- **Body** (400, 16px, 1.6): chữ làm việc. Văn bản dài giới hạn 68ch; tiêu đề cân dòng (`text-wrap: balance`), đoạn văn `pretty`.
- **Label** (600, 0.8rem, 0.02em, chữ thường, màu `tro`): nhãn nhóm cho legend, cột chân trang, tiêu đề thẻ. Trong phạm vi thao tác là 14px, không giãn; đầu cột bảng cũng viết hoa đầu câu 13px 600.
- **Code** (JetBrains Mono, 0.8em, 0.02em, số dạng bảng): mã lô, mã yêu cầu báo giá.

### Phạm vi thao tác (`.ui-operate`)
Từ đợt tinh gọn 28/11/2026 (`docs/UI_TYPOGRAPHY_PLAN.md`), mọi màn ngoài trang chủ đọc theo một thang chữ riêng, khai báo trong `src/styles/operate.css` và chỉ có hiệu lực dưới lớp `.ui-operate`. Lớp này gắn ở: khung Đường làng (`/account`), khung khu làm việc (`ZoneShell`), `<main>` của khu xác thực, `<main>` của khu công khai trừ trang chủ (`SiteMain` kiểm tra đường dẫn khác `/`), và trang lỗi/không có quyền (`MissingTile`). Trang chủ không mang lớp này nên giữ nguyên Phudu chữ hoa, Alegreya, mọi hoa văn và hiệu ứng; đầu trang và chân trang công khai cũng nằm ngoài phạm vi.
- **Một họ chữ:** Be Vietnam Pro cho tiêu đề, menu, biểu mẫu, bảng, nút, thông báo; chỉ dùng weight đã nạp (400/500/600/700). JetBrains Mono chỉ cho mã lô, mã yêu cầu, mã CCCD che, tọa độ; giá, số lượng, ngày là số dạng bảng của Be Vietnam Pro.
- **Thang cố định** (một nấc đổi ở 768px): `h1` 24 → 28px 700/1.3; `h2` 18 → 20px 600/1.4; `h3` 17px 600/1.45; số tổng quan (`.op-stat`) 28 → 32px 700; mô tả phụ 13px; nhãn trường, menu, nút 14-15px; lỗi và gợi ý của trường 14px; ô nhập 16px trên điện thoại (iOS không tự phóng to), 15px từ 768px.
- **Sàn cỡ chữ 12px:** trong phạm vi, mọi lớp `text-[9px]` tới `text-[11.5px]` (kể cả trong thẻ tác phẩm, chuông, menu tài khoản dùng chung với trang chủ) được nâng lên 12px.
- **Lớp của thế giới chung đổi nghĩa:** `.font-display`, `.title-xl/lg/md` thành tiêu đề Be Vietnam Pro chữ thường (`title-xl` 32px, `title-lg` theo `h1`, `title-md` theo `h2`); `.font-serif` thành Be Vietnam Pro trừ khi nằm trong `.giong-ke`; `.label` 14px; `.code` tối thiểu 13px.
- **Lối thoát có chủ đích:** `.dau-hieu` giữ Phudu chữ hoa cho dấu hiệu nhận diện (tên khu trên thanh bên, tên cổng ở trang đăng nhập, mã lỗi trong ô gạch thiếu); `.giong-ke` giữ Alegreya cho giọng kể.
- **Chuyển động trong phạm vi:** nội dung không ẩn chờ cuộn (`data-reveal` hiện ngay, chữ trồi từng từ và ảnh mở mặt nạ đứng yên), không nghiêng 3D, không trôi parallax, không vệt sáng lướt trên thẻ; chuyển trang 0.2s; chuyển trạng thái 150-200ms. Thẻ `.tile.bg-su` chỉ còn một viền mảnh `vua`.

### Đường làng
- **Biển hiệu** (Phudu 800 chữ hoa, `.font-display.dau-hieu`): lời chào trên bến sông (`lang-hero`, `clamp(2.2rem, 4.3vw, 3.9rem)`, ngắt dòng ngay sau dấu phẩy), tiêu đề trang con (`clamp(2rem, 4.4vw, 3.2rem)`, số việc đứng trước tiêu đề màu lam), "Đường làng hôm nay", số lớn của Cổng làng, ngày trên cuống vé buổi nặn, số trong Thẻ du khách.
- **Giọng kể** (Alegreya 700, `.font-serif.giong-ke`, `lang-story`): tiêu đề của từng điểm dừng (1.75 → 1.9rem), tên điểm dừng trên bản đồ, tên xưởng, tên tác phẩm trên kệ, tiêu đề thư, lời chào giá của xưởng, lời đánh giá, tiêu đề phòng báo giá. Số trong giọng kể là số thẳng hàng (`lining-nums`) để "5.000" không đọc thành "5.ooo".
- **Chữ thao tác** Be Vietnam Pro theo phạm vi `.ui-operate`: mô tả, nhãn, nút, biểu mẫu; mã đơn, mã lô JetBrains Mono màu lam.

### Named Rules
**Quy tắc Biển hiệu.** Phudu chỉ dùng chữ hoa và chỉ cho tiêu đề, số lớn và chữ trên triện; không bao giờ cho đoạn văn.

**Quy tắc Không dòng mồi.** Tiêu đề đứng một mình. Nhãn nhóm không được đặt làm dòng chữ nhỏ phía trên tiêu đề.

**Quy tắc Số nằm trong câu.** Trong Đường làng, con số là một phần của câu kể hoặc tiêu đề ("Bốn việc chờ bạn…", "3 mẻ đang chạy trong lò"): đến mười thì viết bằng chữ trong câu kể (`soChu`), trên tiêu đề trang con thì số đứng trước tên. Số bằng không thì không hiện, lời mời thay chỗ. Không dựng hàng ô số liệu.

**Quy tắc Một dấu hiệu.** Ngoài trang chủ, chữ của thế giới (Phudu) chỉ xuất hiện ở dấu hiệu nhận diện có chủ đích, gắn `.dau-hieu`; mỗi vùng thao tác chỉ có một họ chữ nội dung, mono là ngoại lệ cho mã. Không phối nhiều họ chữ để tạo cấp bậc.

**Quy tắc Trang chủ đứng yên.** Mọi thay đổi ở thành phần dùng chung với trang chủ đi qua phạm vi `.ui-operate` (hoặc biến thể riêng), không sửa mặc định. Trước khi kết thúc một đợt sửa, so dấu vân kiểu dáng của trang chủ (computed style và kích thước của mọi phần tử, 4 cỡ màn hình, sáng/tối) với mốc trước khi sửa: phải bằng 0 khác biệt.

## Layout

Mô hình không gian là lưới ghép gốm. Nền khu công khai mang lưới mạch vữa kẻ 1px màu `vua`, ô 72px. Một bức ghép là lưới CSS có khe 6px và đệm 6px trên nền `vua`, góc ngoài 10px, nên khe giữa các viên chính là mạch vữa. Bức ghép mở màn dùng 12 cột × 6 hàng trên máy tính (hàng `clamp(56px, 6.2vw, 92px)`, viên biển hiệu chiếm 6 cột × 5 hàng ở giữa, cả bức nằm gọn trong màn hình đầu) và gập về 6 cột với hàng tối thiểu 64px trên điện thoại, các viên trang trí nhỏ bị ẩn.

Khung chứa: khu công khai rộng tối đa 1440px, lề 16px (điện thoại) tới 24px; khu làm việc là lưới hai cột `272px` thanh bên + vùng làm việc, nội dung tối đa `max-w-6xl` với lề 16px/32px. Đầu trang dính cao 64px (72px từ `md`), nền ngà mờ 88% có làm mờ phía sau. Mọi thanh dính bù chiều cao thanh demo qua `--demo-h`.

Điện thoại trong khu làm việc: thanh tab cố định dưới đáy, ô bấm cao 56px, năm tab cộng nút "Thêm" mở ngăn kéo dưới dạng bức ghép 3 cột. Mục tiêu bấm tối thiểu 44px (nút cỡ vừa, mục thanh bên `min-h-11`). Điểm ngắt dùng mặc định Tailwind: `sm` 640px, `md` 768px, `lg` 1024px (thanh bên xuất hiện).

Khi in: ẩn đầu trang, chân trang, điều hướng; nền trắng chữ đen; mọi phần tử chờ hiệu ứng hiện ngay.

**Đường làng (khu khách hàng).** Không thanh bên. Nội dung trong cột `max-w-7xl` lề 16px/24px. Thứ tự từ trên xuống:
- **Đầu trang dính** nền ngà 92% làm mờ, cao 68px: dấu vCraft, "Đường làng của [tên]", sáu điểm dừng (từ 1280px; 1024–1279px là dải cuộn ngang bên dưới gồm cả tám mục), lối về trang triển lãm (biểu tượng, hiện chữ từ 1536px), đổi chế độ, chuông, tài khoản. Mép dưới là dải hồi văn lam 30%.
- **Trang chủ của khu:** bến sông cao 620px (chữ đè lên trời ở bên trái, thẻ "xưởng đang mở cửa" bên phải); trên điện thoại tranh thành khối 300px và chữ nằm dưới. Tiếp theo là mục "Đường làng hôm nay" trên nền lưới mạch vữa (`.grout`): bản đồ 1200×380 trong thẻ sứ, rồi nội dung của điểm dừng đang chọn (thường hai cột 0.8 : 1.2 từ 1024px).
- **Trang con:** đầu trang là dải trời làng thu nhỏ (`LangHead`: mái ngói, lò bầu tỏa khói, đèn lồng khi tối) với viên biểu tượng lam 64px, tiêu đề, lời dẫn giọng kể và thao tác bên phải, mép dưới hồi văn. Nội dung bên dưới trên nền ngà.
- **Chân trang:** dải 12 viên men (6 trên điện thoại) trên mạch vữa, rồi nền đêm với khẩu hiệu và ghi nguồn ảnh.

Dưới 1024px: thanh đáy năm ô (bốn điểm dừng hay dùng và "Khác") nền sứ 95% làm mờ, ô cao 58px, chừa vùng an toàn; "Khác" mở tấm trồi lên từ dưới (0.38s) với các mục còn lại và lối về trang triển lãm. Trên điện thoại con đường thành dải điểm dừng cuộn ngang bắt từng ô; khoang lò xếp ba khoang một hàng.

**Quy tắc Mỗi điểm dừng một vật thể.** Nội dung của một điểm dừng mở bằng vật thể của nó (đồng hồ lò, bàn xoay, kệ, sổ hộ chiếu, thư), rồi mới tới danh sách. Không dựng lưới thẻ giống nhau cho mọi điểm.

**Quy tắc Danh sách co theo cột.** Lưới danh sách luôn khai báo cột (`grid-cols-1` = `minmax(0, 1fr)`); lưới không khai báo cột sẽ nở theo chữ một dòng bị cắt (`truncate`) và tràn ngang trên điện thoại.

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

### Đường làng
Độ sâu đến từ cảnh: các lớp tranh (trời, đồi, nhà, sông, thuyền) xê dịch theo con trỏ với độ xa gần khác nhau; trong thao tác vẫn là bóng mềm và bóng nhấc của thế giới chung.
- **Điểm dừng** có gờ men (`inset 0 1px 0 rgb(255 255 255/.28), inset 0 -2px 0 rgb(0 0 0/.08)`) + bóng mềm; rê chuột nhấc 4px và bóng nhấc; đang chọn có vòng lam 24% rộng 3px.
- **Hàng việc** (`.viec`) nhấc 2px khi rê, viền ngả lam 35%; ô được trỏ tới bằng liên kết (`:target`, ví dụ `#review-…`) sáng vòng lam.
- **Sổ hộ chiếu** mở đôi trong phối cảnh 1600px: hai trang nghiêng ±4° quanh gáy, bóng trong ở gáy sách.
- **Tác phẩm trên kệ:** ảnh tách nền `drop-shadow(0 10px 8px rgb(0 0 0/.35))` cùng vệt tiếp đất bầu dục đen 50%; khung ảnh giấy dó bóng `0 10px 18px -10px rgb(0 0 0/.8)`.
- **Người lữ khách** nằm trên một lớp SVG phủ trên các tấm biển, nên luôn đứng trước biển, không khuất sau.

## Shapes

Ngôn ngữ hình khối là viên gốm vuông vức với góc bo nhẹ. Viên gốm, nút, ô nhập, mục điều hướng: 6px (`--radius-tile`). Nhãn trạng thái và huy hiệu đếm: 4px (3px trên tab điện thoại). Thẻ, thông báo nổi, popup bản đồ: 8px. Bức ghép và hộp thoại: 10px. Ngăn kéo dưới đáy điện thoại chỉ bo hai góc trên 14px. Các vạch chỉ mục và thanh tiến trình dùng 2px hoặc bo tròn hoàn toàn khi là rãnh mảnh.

Hình lặp lại: lưới mạch vữa; viên hoa văn mây sóng lam (ô 64px), viên sen (96px), viên men rạn (vết rạn mực trên nền `#e6d9bf`, ô 240px), viên đất nung có chấm hạt 7px, viên ngọc và viên lam có vệt sáng hướng tâm ở góc trên trái; vạch phân cách sóng nước lam cao 14px; khối trống phủ vân men rạn rất mờ (360px). Triện son là hình vuông bo 2.5px, viền trong, nghiêng -3° tới -6°. Dấu trạng thái là bốn hình 7-8px: tròn, thoi, vuông, vòng.

Đường làng: điểm dừng bo 10px, hàng việc và thư 8px, vé buổi nặn và chào giá 10px, kệ 14px, đồng hồ lò và thẻ du khách 12px, triện 4px nghiêng -6° với viền trong giấy 2px. Hình lặp lại: hồi văn chữ triện (`HoiVan`, ô 24×12) dưới đầu trang và đầu trang con; sóng mây lam trên sông và dưới bản đồ; con đường gạch ba lớp (nền `--road` 30px, gạch đất nung đứt 12/5 22%, đường chỉ vữa đứt 3/7); mười viên chia đơn (`.vien`); sáu viên công đoạn (`.o`).

**Quy tắc Tranh tự vẽ.** Cảnh làng, lò, bàn xoay, kệ, sổ và biểu tượng điểm dừng đều là SVG tự vẽ trong `src/components/lang/`; ảnh thật chỉ là ảnh tác phẩm (tách nền có nguồn gốc) và ảnh xưởng.

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
- **Ô số liệu (Stat):** nền nhẹ (sứ, hoặc nền nhạt của men vai trò khi là việc cần xử lý: `lam-nhat`, `datnung-nhat`, `ngoc-nhat`), viền 1px `vua`, góc 8px, vạch 3px màu vai trò ở mép trên; nhãn 14px `tro` → số `operate-stat` (con số mang màu vai trò khi có tone) → gợi ý 13px. Các ô xếp lưới khe 12px, không lồng trong bức ghép.
- **Khối trống (EmptyState):** viền đứt `vua` trên nền sứ 60%, một bức ghép nhỏ ba viên (hoa văn, men rạn, lam mang biểu tượng), tiêu đề 18px 600, lời dẫn 15px.

### Inputs / Fields
- **Style:** nền sứ 80%, viền 1px `vua`, góc 6px, đệm 10px/14px, chữ 16px trên điện thoại và 15px từ 768px; nhãn 14px 500 phía trên, dấu bắt buộc màu đất nung. Ô số tiền dùng số dạng bảng của Be Vietnam Pro, không mono.
- **Focus:** viền chuyển `datnung`, nền sứ đặc, vầng sáng đất nung 15% rộng 2px.
- **Error / Disabled:** viền và vầng sáng `doson`, thông báo lỗi 14px màu son có `role="alert"`, luôn bằng tiếng Việt và nói cách sửa (kể cả ô chọn danh mục: "Chọn một phân loại.", "Chọn một dòng men."); gợi ý 14px `tro`; vô hiệu thì mờ 60%. Ô chọn dùng mũi tên vẽ bằng SVG; hộp kiểm dùng `accent-color` đất nung.
- **Biểu mẫu dài:** rộng khoảng 640-720px, chia nhóm có tiêu đề `h2` và một dòng dẫn (phiếu yêu cầu báo giá: mỗi bước một tiêu đề và lời dẫn), nút lưu ở cuối bên phải.

### Navigation
- **Khu công khai:** mục 15px 500, mực 65% khi chờ và mực đặc khi đang xem; một viên đất nung nhỏ 5px trượt theo mục đang xem ở mép dưới đầu trang (lò xo, có chuyển động liên tục giữa các trang). Nút "Đăng ký" là nút lam; khi đã đăng nhập, lối vào khu làm việc là một viên mang men của khu.
- **Khu làm việc (nghệ nhân, Ban quản lý):** thanh bên phủ men của vai trò (nghệ nhân `tile-dat`, Ban quản lý nền `dem`; khu khách hàng dùng đầu trang và thanh đáy của Đường làng), tên khu Phudu là dấu hiệu (`.dau-hieu`), dòng phụ 13px giấy 70-85%, mục 14.5px cao tối thiểu 44px, số đếm 12px; mục đang chọn là một viên trượt bằng lò xo (giấy trên lam/đất nung, ngọc đậm trên đêm). Mỗi trang có đúng một `h1`.
- **Điện thoại:** tối đa năm ô kể cả "Khác" (bốn mục hay dùng nhất trong `zones.ts` `tabs`), nền sứ 95% làm mờ, nhãn 12px, số đếm 12px; vạch 3px màu men của khu trượt trên tab đang chọn, nhãn đang chọn đậm. Ô "Khác" cộng dồn số việc của các mục không có ô riêng; ngăn kéo "Khác" trồi lên trong 380ms, mỗi ô mang số đếm của mục.
- **Bảng trên điện thoại:** bảng nhiều cột chuyển thành thẻ (danh sách lô của nghệ nhân: mã → tên → men, số lượng → tiến độ, trạng thái); bảng còn lại cuộn ngang trong khung riêng.

### Dialog và thông báo nổi
- **Hộp thoại:** phần tử `<dialog>` gốc, nền ngà, góc 10px, viền `vua`, bóng nhấc, rộng `min(92vw, 520px)`; lớp phủ `dem` 45% làm mờ 2px; trồi lên 14px trong 320ms. Tiêu đề Be Vietnam Pro 20px 600, nội dung 15px, chân hộp thoại có đường kẻ `vua`.
- **Thông báo nổi:** thẻ sứ góc 8px, viền theo loại (ngọc, son, lam), vạch thời gian 3px co dần ở mép dưới (4,5 giây, lỗi 7 giây).

### Đường làng – khu khách hàng (Signature)
Thành phần nằm trong `src/components/lang/` (`lang-shell`, `village-scene`, `village-road`, `pieces`, `glyphs`, `lang-press`, `words`) và `src/styles/lang.css`; gốc khu là lớp `.lang` (cùng `.ui-operate`), chỉ dùng trong `/account`.
- **Khung (`LangShell`):** đầu trang dính như mục Layout; mục đang mở có vạch lam 3px trượt theo khi đổi trang (`NavMarker`, dải cuộn ngang tự cuộn mục mới vào giữa); số đếm là ô đất nung 18px chữ `on` 12px, "9+" khi quá chín, nhãn đọc ghi rõ loại việc. Trên điện thoại tên đọc của ô bắt đầu bằng tên mục rồi mới tới số việc.
- **Bến sông (`VillageScene`):** SVG 1440×640 `xMidYMax slice`; mặt trời là mặt trống đồng quay chậm (đêm: trăng), đàn chim bay ngang, khói lò, sông trôi hai lớp sóng mây, thuyền chở hai món gốm tách nền dập dềnh, thuyền xa trôi qua, tre đung đưa. Lời chào lấy tên gọi của khách; lời kể ghép từ việc thật (bản nháp chưa gửi, chào giá cần so, đơn chờ lệnh sản xuất, đơn chờ xác nhận nhận hàng, xưởng mong lời đánh giá, buổi nặn kế tiếp). Hai thao tác: "Đi dọc đường làng" và một thao tác theo ngữ cảnh ("So bốn chào giá" hoặc "Tạo yêu cầu báo giá").
- **Đường làng (`VillageRoad`):** sáu nút điểm dừng (`aria-pressed`, `aria-controls="diem-dung"`), mỗi nút có biểu tượng nét 2.2 (`TramIcon`), tên giọng kể, dòng phụ là số liệu thật, ô đếm khi có việc gấp. ← → đi sang điểm bên cạnh, Home/End về đầu/cuối. Người lữ khách đi theo đúng con đường (đo `getPointAtLength`, 0.5–1.5s, nảy bước), quay mặt theo hướng đi, dừng chân lệch 96 đơn vị cạnh biển.
- **Cổng làng:** số việc lớn Phudu lam + câu kể; danh sách việc (`TaskList`): viên đất nung dấu thoi cho việc gấp, viên ngọc dấu tròn cho lời đánh giá còn nợ.
- **Lò đơn sỉ:** đồng hồ lò (`KilnDial`) trên sơn then, cung 240° chia sáu chặng, kim lắc về đúng chặng của đơn gấp nhất (cùng mức thì đơn đã đi xa hơn); danh sách đơn (`OrderCard`) với dải sáu viên công đoạn (`StageTrack`: Đất thô, Nhào đất, Vuốt hình, Vẽ men, Vào lò, Ra lò) thẳng hàng với nhãn phía trên.
- **Bàn xoay:** bình men lam xoay trên bàn (`PotteryWheel`, hoa văn trôi dưới lớp bóng hình trụ); vé buổi nặn (`VisitCard`: cuống ngày lam bên trái, xưởng, trạng thái có dấu hình, giờ, số khách, tiền, "Thêm vào lịch" .ics, "Chỉ đường"); khi chưa có buổi hẹn là các xưởng có lớp (`OpenWorkshopRow`), xưởng đang mở xếp trước.
- **Kệ trưng bày (`Shelf`):** kệ sơn then, mỗi hàng một tấm ván chỉ vàng ngay dưới chân tác phẩm (ván vẽ bằng nền lặp của `.ke-hang`, nên kệ nhiều tầng trên điện thoại vẫn đúng món nào tên nấy); tác phẩm có ảnh tách nền đứng thẳng, còn lại là khung ảnh giấy dó; trái tim bỏ lưu ở góc.
- **Hộ chiếu làng nghề (`Passport`, `Stamp`, `TraceCard`):** sổ mở đôi, trang phải là các triện son (mã lô + tên xưởng) đóng xuống lần lượt, ô trống viền đứt "chỗ cho triện tiếp theo"; trang Hộ chiếu có thêm từng trang sổ (ảnh lô, men, xưởng xác thực, công đoạn, nhiệt độ nung, ngày khóa nhật ký).
- **Bến thư (`LetterCard`):** thư giấy dó nhóm theo ngày, thư chưa đọc có dấu son "Mới" và tiêu đề đậm; mở thư là đánh dấu đã đọc (`NotificationLink`).
- **Đầu trang con (`LangHead`), lời mời (`Invite`), ấn xưởng (`Seal`):** ấn là viên men lam vuông mang chữ tắt của xưởng; viên để mộc (nền ngà, viền lam đứt) là xưởng bạn chưa đánh giá. Ấn là dấu nhận diện, không phải triện xác thực.
- **Thẻ du khách (Hồ sơ):** đầu thẻ men lam ("Thẻ du khách · làng gốm Bát Tràng", tên, tổ chức, ấn giấy chữ lam), dải hồi văn, liên hệ, ba số: buổi nặn đã đi, con triện, mẻ đã ra lò. Danh sách thiết bị đăng nhập hiện năm mục đầu, phần còn lại mở bằng "Xem cả … thiết bị".
- **Phòng báo giá (`QuoteRoom variant="lang"`):** dải lò bậc thang sơn then với tàn lửa bay lên: đường dẫn vị trí → tiêu đề giọng kể → mã phiếu vàng, nhãn trạng thái nền chỉ vàng, **huy hiệu "Record vN · Optimistic Lock"** (nền `lam`, chữ `on`, mono 12px, biểu tượng khóa) → tóm tắt → **sáu khoang lò = sáu trạng thái** (khoang đã qua đỏ lửa, khoang hiện tại có ngọn lửa lập lòe và `aria-current="step"`, khoang chưa tới nguội; mỗi khoang ghi tên trạng thái và công đoạn; đơn đã giao thì cả sáu đã nung, đơn hủy thì lò tắt) → dòng "Việc tiếp theo của bạn" hoặc lời chờ. Huy hiệu và sáu khoang là yêu cầu của đề bài: luôn nằm trong màn hình đầu, không được ẩn hay gập. Bên dưới: thẻ chào giá (tên xưởng giọng kể, đơn giá ngọc khi trong ngân sách và đất nung khi vượt, nhận làm, số ngày, cảnh báo trễ hạn có biểu tượng và chữ, uy tín, lời chào giá, phiên bản chào giá), nút −/+ theo bước tròn một phần mười số lượng (5.000 → 500), ô gõ số tự chặn ở mức xưởng nhận làm; thẻ đang được chia có viền men ngọc; thanh mười viên gốm (viên lam, chia thừa thì đất nung) với tổng, thành tiền, thiếu/thừa và nút "Chấp nhận & phân bổ đơn hàng" (chỉ mở khi chia đúng số lượng, xuống dòng và trải hết thẻ trên điện thoại nhỏ); mô phỏng xung đột 409; chi tiết yêu cầu và lịch sử trạng thái ở cột phải.

**Chuyển động của Đường làng** (mọi chuyển động tắt khi giảm chuyển động; kim đồng hồ lò đứng sẵn ở chặng):
- **Chuyển trang:** trang mới hiện từ mờ trong 0.2s (`lang-page`); trong lúc tải, lữ khách đi đi lại lại trên một quãng đường gạch với dòng "Đang đi tới điểm dừng…" (`loading.tsx`, `role="status"`).
- **Gợn nước khi nhấn** (`LangPress`): hai vòng lam loang ra tại điểm bấm trong 0.52s, không chặn điều hướng.
- **Nội dung điểm dừng:** khối trồi 14px trong 0.55s (`hien`); hàng việc, đơn, thư, tác phẩm gắn vào lần lượt cách nhau 70–110ms (`gan-vien`); triện đóng xuống cách nhau 220ms (`dong-dau`).
- **Phòng báo giá:** tàn lửa bay 6s, ngọn lửa khoang hiện tại lập lòe 1.4s, viên chia đơn gắn vào khi lấp đầy.

**Ảnh tách nền (nguồn gốc bắt buộc).** Tác phẩm đứng thẳng trên kệ và trên thuyền dùng ảnh WebP đã tách nền trong `public/seed/cutout/`. Mỗi ảnh tách nền bằng mô hình phông nền + GrabCut rồi duyệt tay, và phải có tệp `.webp.json` đi kèm ghi nguồn gốc ảnh gốc (nguồn, tác giả, giấy phép), ảnh dẫn xuất từ đâu và cách xử lý. Chỉ ảnh có tên trong danh mục `src/lib/cutouts.ts` mới được đứng trên kệ; còn lại nằm trong khung ảnh.

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
- **Do** giữ mỗi khu làm việc trong thế giới của nó: khách hàng là Đường làng, nghệ nhân đất nung, Ban quản lý đêm với điểm ngọc.
- **Do** dùng `on` cho chữ trên men đổi theo chế độ và `giay` cho chữ trên viên `*-nen`, ảnh, nền đêm.
- **Do** cho mọi chuyển động một đường thay thế khi `prefers-reduced-motion: reduce`.
- **Do** dùng `--chart-1..4` cho mọi chuỗi dữ liệu, cột rộng tối đa 24px, đầu cột bo 4px, kèm bảng số liệu.
- **Do** giữ mục tiêu bấm từ 44px trở lên, 56px cho tab điện thoại.
- **Do** giữ Đường làng trong khu khách hàng; khu nghệ nhân và Ban quản lý dùng khung chung cho tới khi có bản sắc riêng.
- **Do** mở mỗi điểm dừng bằng vật thể của nó và kể số liệu thật bằng câu ("Bốn việc chờ bạn…"), ẩn số khi bằng không và thay bằng lời mời.
- **Do** khai báo màu cảnh mới thành cặp sáng/tối trên `.lang` trong `lang.css`, và chạy lại kiểm tra tương phản ở cả hai chế độ.
- **Do** khai báo cột cho mọi lưới danh sách (`grid-cols-1`) để chữ cắt một dòng không làm tràn ngang.
- **Do** gắn `.ui-operate` cho mọi khung màn hình mới ngoài trang chủ, dùng `h1`/`h2`/`h3` trần hoặc `.op-h1/.op-h2/.op-stat` thay cho cỡ chữ đặt tay.
- **Do** gắn `.dau-hieu` cho dấu hiệu nhận diện cần giữ chữ của thế giới, `.giong-ke` cho khối giọng kể cần giữ Alegreya.
- **Do** so dấu vân kiểu dáng của trang chủ với mốc trước mỗi đợt sửa thành phần dùng chung.
- **Do** giữ huy hiệu "Record vN · Optimistic Lock" và sáu khoang lò (sáu trạng thái) trong dải đầu của phòng báo giá, luôn nhìn thấy.
- **Do** chỉ cho tác phẩm đứng thẳng trên kệ khi ảnh tách nền đã được duyệt tay, có tên trong `cutouts.ts` và có tệp `.webp.json` ghi nguồn gốc; còn lại dùng khung ảnh.

### Don't:
- **Don't** dựng giao diện kiểu chợ thủ công nền kem, chữ có chân và một điểm nhấn đất nung; men màu phải phủ mảng.
- **Don't** đặt dòng chữ nhỏ (kicker) phía trên tiêu đề; `.label` chỉ dùng cho nhãn nhóm.
- **Don't** dùng Phudu cho đoạn văn hoặc ở chữ thường.
- **Don't** dùng bóng đổ cứng, lệch; bóng luôn mềm với độ lan âm.
- **Don't** bo góc lớn kiểu viên thuốc cho nút hay thẻ.
- **Don't** dùng `doson` để trang trí.
- **Don't** viết màu dữ liệu lên chữ trong biểu đồ.
- **Don't** đưa ảnh tách nền tự động chưa duyệt, hoặc thiếu tệp nguồn gốc, lên kệ.
- **Don't** đem cảnh làng, con đường hay vật thể của Đường làng sang khu nghệ nhân, Ban quản lý.
- **Don't** để người lữ khách hay vật trang trí che chữ thao tác; chữ đè lên tranh phải có quầng màu trời (`.chu-troi`).
- **Don't** đặt chữ nhỏ hơn 12px, chữ hoa giãn hay chữ nghiêng cho nhãn, menu và thông tin cần để quyết định ngoài trang chủ; đừng dùng mono cho giá, số lượng, ngày.
- **Don't** để nội dung quan trọng ẩn chờ cuộn, nghiêng 3D hay trôi parallax ở màn thao tác.
- **Don't** chép tranh, hoa văn hay ảnh của người khác làm cảnh làng; cảnh và biểu tượng là SVG tự vẽ.
- **Don't** dùng `align-items: center` của `.viec` cho thẻ lưới có cột ảnh; cột ảnh phải kéo hết chiều cao (`items-stretch`).
