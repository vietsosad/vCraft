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
  nau: "#5c4321"
  chu-nau: "#6b4a1e"
  nghe: "#d9a548"
  mun: "#1f170d"
  nau-n8: "#46321a"
  nau-n7: "#55401f"
  nau-n6: "#644b26"
  nau-n5: "#72572d"
  nau-n4: "#c2a674"
  nau-n3: "#d1ba8e"
  nau-n2: "#dfcfab"
  nau-n1: "#ebe1c9"
  chu-nau-dam: "#2a1d0c"
  hat-trang: "#f6f1e6"
  vai: "#ece4d4"
  vai-2: "#fdfcf8"
  soi-trang: "#fbfaf5"
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
  weave-display:
    fontFamily: "Chakra Petch, Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "clamp(2.3rem, 5vw, 3.6rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.012em"
  weave-numeral:
    fontFamily: "Chakra Petch, Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "clamp(3rem, 7vw, 4.6rem)"
    fontWeight: 700
    lineHeight: 0.88
    letterSpacing: "-0.03em"
    fontFeature: "\"tnum\", \"lnum\""
  weave-label:
    fontFamily: "Chakra Petch, Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "0.74rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.09em"
rounded:
  hairline: "2px"
  badge: "4px"
  tile: "6px"
  card: "8px"
  mosaic: "10px"
  sheet: "14px"
  weave: "3px"
spacing:
  grout: "6px"
  grid-cell: "72px"
  gutter-mobile: "16px"
  gutter-desktop: "32px"
  container-site: "1440px"
  container-zone: "72rem"
  sidebar: "272px"
  band-edge: "15px"
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
  weave-band:
    backgroundColor: "{colors.nau-n8}"
    textColor: "{colors.soi-trang}"
    padding: "1.6rem 0"
  weave-band-heavy:
    padding: "clamp(2.2rem, 5vw, 3.6rem) 0"
  weave-band-light:
    padding: "1.1rem 0"
  weave-band-pale:
    backgroundColor: "{colors.nau-n2}"
    textColor: "{colors.chu-nau-dam}"
  button-moc:
    backgroundColor: "{colors.soi-trang}"
    textColor: "{colors.mun}"
    rounded: "{rounded.weave}"
    padding: "0 1.1rem"
    height: "44px"
  button-moc-hover:
    backgroundColor: "{colors.nghe}"
    textColor: "{colors.mun}"
  button-soi:
    textColor: "{colors.soi-trang}"
    rounded: "{rounded.weave}"
    padding: "0 1.1rem"
    height: "44px"
  patch:
    backgroundColor: "{colors.vai-2}"
    textColor: "{colors.muc}"
    rounded: "{rounded.weave}"
  selvage-header:
    backgroundColor: "{colors.mun}"
    textColor: "{colors.soi-trang}"
    height: "64px"
  selvage-segment:
    backgroundColor: "{colors.nau-n8}"
    textColor: "{colors.soi-trang}"
    typography: "{typography.weave-label}"
    padding: "0.55rem 0.75rem 0.6rem"
    height: "3.4rem"
  selvage-count:
    backgroundColor: "{colors.soi-trang}"
    textColor: "{colors.mun}"
    padding: "0 0.3rem"
    height: "1.45rem"
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

Khu khách hàng (`/account`) có thế giới riêng là **Tấm dệt**: một tấm thổ cẩm dài trên khung cửi, tách hẳn khỏi bức ghép gốm của trang chủ và cổng đăng nhập (không mạch vữa, không Phudu, không viên men). Bảng màu lấy từ gốm men nâu cổ có hoa văn khắc nổi phủ men trắng rạn: nền ngà có vân dệt (tối: nâu đen); mỗi tính năng là một dải vải nhuộm củ nâu chạy hết bề ngang (tám nấc từ đậm tới nhạt, cùng một thùng nhuộm), có hoa văn pixel tông-trên-tông riêng và biên răng cưa điểm hạt trắng như hàng hạt quanh miệng bình, các dải nối nhau từ trên xuống. Nội dung đọc nằm trên miếng trắng sứ có vân rạn rất mờ, khâu đính bằng đường chỉ chạy, nổi lên trên nền nâu. Điều hướng là sọc biên tám nấc nâu, nhạt dần từ trái sang phải. Việc gấp dệt dày, việc đã xong dệt mảnh; tiến độ đơn là đoạn vải đã dệt kín, chặng chưa tới chỉ còn sợi dọc; xưởng hiện bằng huy hiệu chữ pixel dệt. Hoa văn là hình học tự vẽ trên lưới ô vuông, không chép mẫu của một dân tộc cụ thể. Tấm dệt chỉ thuộc khu khách hàng; khu nghệ nhân và Ban quản lý vẫn dùng khung thanh bên chung (`zone-shell`) và sẽ có bản sắc riêng sau, không mượn Tấm dệt.

Chuyển động kể đúng một câu chuyện vật liệu: viên gốm được "gắn" vào mạch vữa (hơi lệch, hơi xoay rồi ăn khớp), bóng men lướt theo con trỏ khi rê lên viên, kim đồng hồ lò có quán tính và giảm chấn thật. Mọi chuyển động đều có đường thay thế khi người dùng giảm chuyển động.

**Key Characteristics:**
- Nền men ngà với lưới mạch vữa 72px nhìn thấy được; các khối gắn vào bức ghép cách nhau đúng một mạch vữa 6px.
- Màu men là mảng, không phải viền: lam, đất nung, men ngọc phủ trọn viên biển hiệu, thanh bên, ô số liệu.
- Góc viên gốm 4-8px; không có khối bo tròn lớn kiểu viên thuốc.
- Bốn giọng chữ có vai rõ ràng: Phudu chữ hoa cho biển hiệu, Alegreya cho tên và lời kể, Be Vietnam Pro cho chữ làm việc, JetBrains Mono cho mã lô.
- Trạng thái được mang bằng cả hình dấu lẫn màu.
- Triện son là con dấu duy nhất của sự xác thực.
- Khu khách hàng là Tấm dệt: dải nâu men cổ hết bề ngang (một thùng nhuộm, tám nấc), biên răng cưa điểm hạt trắng, miếng trắng sứ vân rạn khâu chỉ, sọc biên tám nấc nâu, chữ Chakra Petch; không lan sang khu khác.

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
- **Lửa** (`lua`): huy hiệu đếm số trên thanh bên men của khung khu làm việc chung. Khu khách hàng không dùng: số đếm ở đó là ô vải trắng trên sọc biên.

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

### Tấm dệt (khu khách hàng)
Ngả màu men nâu cổ và men trắng tinh khiết, chỉ dùng trong `/account`. Nguồn là một mảnh gốm men nâu có hoa văn hoa lá khắc nổi phủ men trắng rạn và hàng hạt trắng đắp quanh miệng: nền nâu vàng trầm, chỗ khắc sâu nâu đậm, hoa văn trắng ngà nổi lên. Lịch sử: ngày 22/11/2026 bản cầu vồng tám màu (chàm, đỏ, vàng, lá, trời, sen) bị chê rối mắt nên chuyển sang một thùng chàm; cùng ngày người dùng chọn lại bảng men nâu này. Chữ `muc` và `tro` của thế giới chung vẫn dùng trên miếng trắng sứ.

Cả tấm là tám nấc nhuộm củ nâu, đặt tên theo số lần nhúng, từ `n8` đậm nhất tới `n1` nhạt nhất, đi theo thứ tự điều hướng (bảng `ROUTE_HUE` trong `src/components/weave/loom.ts`), nên sọc biên nhạt dần từ trái sang phải. Các mục phân biệt bằng độ đậm và hoa văn, không bằng màu khác:
- `n8` Việc của tôi (hoa văn trám), `n7` Đơn sỉ và phòng báo giá (răng cưa), `n6` Lịch hẹn (sao tám cánh), `n5` Đã lưu (móc câu): nâu men đậm, chữ ngà `#fbf8f0`.
- `n4` Truy xuất (ô cờ), `n3` Đánh giá (sóng), `n2` Thư (trám), `n1` Hồ sơ (ô cờ): nâu vàng nhạt, chữ nâu đen `#2a1d0c`.
- Ở chế độ sáng, thang bỏ qua vùng giữa (nâu vàng trung tính như `#9a7a46` của mảnh gốm), nơi cả chữ ngà lẫn chữ nâu đen đều dưới 4.5:1. Ở chế độ tối, cả tám nấc dồn về vùng nâu tối (`#3a2a16` tới `#705434`), chữ ngà `#f4ede0`, để không có mảng sáng chói giữa đêm.
- Giá trị tám nấc khai báo trong `src/styles/weave.css` (biến `--n1`…`--n8`), không qua `@theme`. `--band-deep` là màu chỉ khâu, đoạn tiến độ đã dệt và răng cưa việc gấp: bằng chính nấc với dải đậm, `#644b26` với dải nhạt, `#c2a674` ở chế độ tối, để luôn nhìn rõ trên miếng vải.
- Biên mỗi dải: răng cưa tông trên tông (nâu đen `#2a1d0c` trên dải đậm, nâu men `#644b26` trên dải nhạt) và một hàng hạt trắng `#f6f1e6` (`hat-trang`). Biên vải đầu trang: răng cưa nâu men và hạt trắng trên nền nâu đen. Dấu vCraft trên biên vải dùng tông đất nung.

Màu dùng chung trong khu:
- **Nâu men** (`nau`, cố định): nút đặc và khối trên miếng vải (lọc đơn đang chọn, cuống ngày của lịch còn hiệu lực, nút tạo đơn đầu tiên). Mọi `lam` của thành phần dùng chung bên trong khu được nhuộm lại thành nâu: sáng `lam` `#5c4321`, `lam-sang` `#6e5129`, `lam-dam` `#3f2d14`, `lam-nhat` `#efe6d4`, `lam-nen` `#4a3519`; tối `lam` `#d6b57a`, `lam-sang` `#e2c48e`, `lam-dam` `#ecd3a6`, `lam-nhat` `#2a2117`. Huy hiệu Record và nút chính của phòng báo giá vì thế mang màu nâu men.
- **Chữ nâu** (`chu-nau`, tối `#e2c48e`): mã đơn, mã lô, số chào giá, việc cần làm tiếp, liên kết trên miếng vải, dấu "đã xác nhận", vòng focus trên nền sáng. Token này sáng lên ở chế độ tối; không dùng `nau` cố định cho chữ trên miếng vải.
- **Vàng mật ong** (`nghe`, `#d9a548`): điểm nhấn nhỏ cùng họ màu. Chữ "Tấm dệt", vùng chọn (chữ `mun`), hover nút vải mộc, nhãn "Mới" của thư chưa mở, nút "Viết đánh giá", chấm "đang mở cửa" của xưởng đã lưu. Nhãn vàng luôn dùng chữ nâu đen.
- **Nâu đen** (`mun`, tối `#0e0a05`): biên vải trên cùng, nền thanh sọc biên dưới đáy điện thoại.

Nền và chữ:
- **Nền ngà** (`vai`, tối `#120d08`): nền cả khu, mang vân dệt hai lớp sợi 1px (ngang mỗi 3px, dọc mỗi 4px) ở 5% nâu.
- **Trắng sứ** (`vai-2`, tối `#1e1710`): mặt miếng vải khâu; trong khu, `su` của thành phần dùng chung trỏ về token này. Ở chế độ sáng, miếng vải và thẻ phủ vân men rạn `crackle-faint.svg` (ô 360px) dưới một lớp trắng 50%, như men trắng rạn trên hoa văn khắc nổi. Ở chế độ tối, bỏ vân rạn; miếng vải và thẻ có viền sợi 1px vàng ngà 12% và bóng đậm để tách khỏi dải nâu tối.
- **Sợi trắng** (`soi-trang`): chữ trên dải nâu đậm, mặt nút vải mộc, ô số đếm trên sọc biên. Là giá trị viết thẳng trong mã, không đổi theo chế độ. Chữ phụ trên dải dùng màu chữ của dải ở 78% (80% trên dải nhạt, 84% ở chế độ tối), đường kẻ trên dải ở 22-24%.

### Chế độ tối "lò đêm"
Đặt qua `:root[data-theme="dark"]`, giữ nguyên tên token: `nga` thành than ấm `#120f0d`, `su` thành `#1d1713`, `vua` thành tro nung `#3b3028`, `muc` thành ngà sáng `#f1e7d7`; các men màu chuyển sang tông sáng (`lam` `#94b4ee`, `datnung` `#ec9a72`, `ngoc` `#8fc7b1`) còn `*-nen` giữ đậm để chữ `giay` vẫn đọc được. Chế độ được đặt trước khi vẽ trang bằng script khởi động, đọc `localStorage` rồi tới `prefers-color-scheme`.

### Named Rules
**Quy tắc Men phủ mảng.** Men màu xuất hiện dưới dạng viên gốm phủ kín (biển hiệu, thanh bên, ô số liệu, nút), không làm đường viền mảnh hay chữ nhấn rải rác. Một màn hình có một men chủ, các men khác là viên điểm xuyết.

**Quy tắc Triện son.** `doson` thuộc về con dấu xác thực, lỗi và hành động phá hủy. Không có vai trò nào khác.

**Quy tắc Chữ trên men.** Trên khối men đổi theo chế độ thì dùng `on`; trên viên `*-nen`, ảnh hoặc nền `dem` thì dùng `giay`. Không đặt `muc` lên men đậm.

**Quy tắc Một thùng nâu.** Trong Tấm dệt, mọi dải là một nấc nâu đặc phủ hết bề ngang, và mỗi mục giữ đúng nấc của nó ở đoạn sọc biên, dải đầu trang và dải trên trang tổng quan. Không đưa thêm màu nhuộm khác (chàm, đỏ, xanh lá, hồng…) vào dải, chữ hay nhãn; muốn phân biệt thì đổi độ đậm hoặc hoa văn.

**Quy tắc Men trắng nổi.** Nội dung đọc luôn nằm trên miếng trắng sứ (tối: nâu trầm), không đặt khối chữ dài thẳng lên dải trừ phần đầu dải. Màu nhấn duy nhất ngoài nâu là vàng mật ong cùng họ; không thêm màu nhấn thứ hai.

**Quy tắc Chữ nâu đổi theo chế độ.** Chữ màu trên miếng vải dùng `chu-nau`, không dùng nấc dải hay `nau` cố định; mọi chữ trong khu phải đạt 4.5:1 ở cả hai chế độ, kể cả khi đổi chế độ bằng nút trong lúc đang xem.

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

### Tấm dệt
**Display Font:** Chakra Petch 500/600/700 (với Be Vietnam Pro), tải ở `src/app/account/layout.tsx` thành biến `--font-chakra`, bộ con chữ `vietnamese`.
- **Tiêu đề** (`weave-display`, chữ thường): `h1`, `h2` và `.hieu` trong khu. Góc cắt như sợi dệt, đối lập với chữ hoa Phudu của trang chủ. Lời chào trang tổng quan lớn hơn (`clamp(2.7rem, 6.5vw, 4.6rem)`); tiêu đề dải 1.8rem; tiêu đề nhóm 1.2-1.5rem. `h3` trở lại Be Vietnam Pro 650; `font-serif` của thành phần dùng chung đổi sang Chakra Petch.
- **Số** (`weave-numeral`, `.so`): số dạng bảng, khít dòng 0.88. Số lớn của dải 3-4.6rem; ngày của lịch hẹn kế tiếp tới 8.5rem; ngày trên cuống miếng lịch 3.1rem.
- **Nhãn** (`weave-label`, `.nhan`, chữ hoa giãn 0.09em): tên đoạn sọc biên, số đếm cạnh tiêu đề nhóm, nhãn ngày tháng, nhãn "Mới"/"Đã mở", tên trường `dt`.
- **Chữ làm việc** Be Vietnam Pro; mã đơn, mã lô mono trong màu của mục.
- **Chữ pixel dệt:** bảng chữ 5×7 ô (A-Z, bỏ dấu tiếng Việt) trong `loom.ts`, chỉ dùng cho huy hiệu xưởng: hai chữ cái đầu, khung viền 13 ô có hàng chấm răng cưa.

### Named Rules
**Quy tắc Biển hiệu.** Phudu chỉ dùng chữ hoa và chỉ cho tiêu đề, số lớn và chữ trên triện; không bao giờ cho đoạn văn.

**Quy tắc Không dòng mồi.** Tiêu đề đứng một mình. Nhãn nhóm không được đặt làm dòng chữ nhỏ phía trên tiêu đề.

**Quy tắc Số dệt vào tên.** Trong Tấm dệt, con số là một phần của tiêu đề ("3 việc chờ bạn", "2 Đơn sỉ"): số Chakra Petch lớn đứng ngay trước chữ, cùng dòng chân. Số bằng không thì không hiện, thao tác chính thay chỗ. Không dựng hàng ô số liệu.

**Quy tắc Chakra chữ thường.** Chakra Petch viết chữ thường cho tiêu đề và số; chữ hoa giãn chỉ dành cho nhãn `.nhan` ngắn, đứng cạnh hoặc dưới tiêu đề.

## Layout

Mô hình không gian là lưới ghép gốm. Nền khu công khai mang lưới mạch vữa kẻ 1px màu `vua`, ô 72px. Một bức ghép là lưới CSS có khe 6px và đệm 6px trên nền `vua`, góc ngoài 10px, nên khe giữa các viên chính là mạch vữa. Bức ghép mở màn dùng 12 cột × 6 hàng trên máy tính (hàng `clamp(56px, 6.2vw, 92px)`, viên biển hiệu chiếm 6 cột × 5 hàng ở giữa, cả bức nằm gọn trong màn hình đầu) và gập về 6 cột với hàng tối thiểu 64px trên điện thoại, các viên trang trí nhỏ bị ẩn.

Khung chứa: khu công khai rộng tối đa 1440px, lề 16px (điện thoại) tới 24px; khu làm việc là lưới hai cột `272px` thanh bên + vùng làm việc, nội dung tối đa `max-w-6xl` với lề 16px/32px. Đầu trang dính cao 64px (72px từ `md`), nền ngà mờ 88% có làm mờ phía sau. Mọi thanh dính bù chiều cao thanh demo qua `--demo-h`.

Điện thoại trong khu làm việc: thanh tab cố định dưới đáy, ô bấm cao 56px, năm tab cộng nút "Thêm" mở ngăn kéo dưới dạng bức ghép 3 cột. Mục tiêu bấm tối thiểu 44px (nút cỡ vừa, mục thanh bên `min-h-11`). Điểm ngắt dùng mặc định Tailwind: `sm` 640px, `md` 768px, `lg` 1024px (thanh bên xuất hiện).

Khi in: ẩn đầu trang, chân trang, điều hướng; nền trắng chữ đen; mọi phần tử chờ hiệu ứng hiện ngay.

**Tấm dệt (khu khách hàng).** Không có thanh bên, không lưới thẻ. Trang là các dải xếp chồng chạy hết bề ngang màn hình; nội dung trong mỗi dải nằm trong cột `max-w-6xl` với lề 16px/32px. Thứ tự từ trên xuống:
- **Biên vải trên** nâu đen dính đầu trang (cao 64px + dải răng cưa 15px nâu men, hạt trắng): dấu vCraft trong ô vải trắng, "Tấm dệt" và "của [tên]", lối về trang triển lãm, giao diện, chuông, tài khoản.
- **Sọc biên** (từ 1024px): lưới 8 cột bằng nhau, mỗi đoạn một nấc nâu của mục, biểu tượng trên, nhãn dưới.
- **Các dải.** Trang tổng quan xếp bảy dải nhạt dần từ trên xuống: `n8` (lời chào, việc chờ bạn) → `n7` (đơn sỉ) → `n6` (lịch hẹn) → `n5` (đã lưu) → `n4` (truy xuất) → `n3` (xưởng đã làm cùng) → `n2` (thư), kết thúc bằng tua vải. Trang con mở bằng dải đầu trang dày của mục rồi tới nội dung trên nền sợi bông. Dải chỉ có biên răng cưa ở mép dưới khi xếp chồng, nên giữa hai dải luôn là một đường biên vải.
- **Miếng vải** đặt trên dải hoặc trên nền sợi bông, xếp danh sách một cột khe 10-12px; lưới 2-3 cột chỉ cho miếng truy xuất gọn và tác phẩm bày (3 cột, 6 từ 768px).

Dưới 1024px: sọc biên xuống đáy màn hình thành thanh 5 ô trên nền nâu đen (bốn mục chính và "Khác", ô Khác nấc `n4`), ô cao 3.6rem, ô đang mở dệt dài lên 4.1rem; chừa vùng an toàn và 96px phía dưới nội dung. "Khác" mở tấm nâu đen trồi từ dưới lên, mép trên là dải răng cưa, mỗi mục còn lại (và lối về trang triển lãm) là một dải nấc nâu của mục cao 56px. Trên trang tổng quan, cuộn bắt từng dải (`scroll-snap` gần), dải dày cao gần trọn màn hình trừ đầu trang và thanh dưới.

**Quy tắc Hai mép dày, giữa lặng.** Hoa văn của dải đậm đủ ở hai mép và lặng xuống 28% sau cột nội dung (mặt nạ chuyển từ `50% ± 41rem` vào `50% ± 34rem`), để chữ trên dải luôn đọc được mà tấm vải vẫn đầy hoa văn ở lề.

**Quy tắc Một đường biên vải.** Vùng được chia bằng biên răng cưa của dải và đường chỉ khâu của miếng vải, không bằng khung thẻ, đường kẻ xám hay thanh bên.

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

### Tấm dệt
Độ sâu của Tấm dệt là độ dày của vải: dải nằm phẳng, miếng vải khâu nổi lên một lớp vải, bóng mềm màu nâu đen `rgb(42 29 12)` có độ lan âm như thế giới chung. Không gờ men, không vệt sáng men.
- **Miếng vải** (`0 1px 0 rgb(42 29 12/0.1), 0 12px 22px -18px rgb(42 29 12/0.5)`); khi là liên kết thì rê chuột nhấc 2px và đổi sang `0 1px 0 rgb(42 29 12/0.1), 0 20px 30px -20px rgb(42 29 12/0.55)`.
- **Miếng vải dệt mảnh** chỉ còn `0 1px 0 rgb(42 29 12/0.08)`.
- **Nút vải mộc** (`inset 0 -3px 0 rgb(42 29 12/0.14), 0 6px 14px -10px rgb(0 0 0/0.6)`), lún 1px khi ấn.
- **Thanh sọc biên dưới đáy** (`0 -10px 24px -14px rgb(0 0 0/0.6)`).
- **Tác phẩm bày trên vải:** ảnh tách nền `drop-shadow(0 10px 8px rgb(0 0 0/0.25))` cùng vệt tiếp đất bầu dục đen 40% ngay dưới đáy.

**Quy tắc Gấp dệt dày, xong dệt mảnh.** Độ nặng thị giác đi theo độ gấp của việc. Dải có việc chờ khách dệt dày (đệm `clamp(2.2rem, 5vw, 3.6rem)`), dải bình thường 1.6rem, dải không còn việc dệt mảnh (1.1rem). Miếng vải của việc gấp có dải răng cưa màu dải ở mép trên và đường chỉ đôi 3px; việc đã xong hay đã hủy dệt mảnh: chỉ khâu 35%, gần như không bóng.

## Shapes

Ngôn ngữ hình khối là viên gốm vuông vức với góc bo nhẹ. Viên gốm, nút, ô nhập, mục điều hướng: 6px (`--radius-tile`). Nhãn trạng thái và huy hiệu đếm: 4px (3px trên tab điện thoại). Thẻ, thông báo nổi, popup bản đồ: 8px. Bức ghép và hộp thoại: 10px. Ngăn kéo dưới đáy điện thoại chỉ bo hai góc trên 14px. Các vạch chỉ mục và thanh tiến trình dùng 2px hoặc bo tròn hoàn toàn khi là rãnh mảnh.

Hình lặp lại: lưới mạch vữa; viên hoa văn mây sóng lam (ô 64px), viên sen (96px), viên men rạn (vết rạn mực trên nền `#e6d9bf`, ô 240px), viên đất nung có chấm hạt 7px, viên ngọc và viên lam có vệt sáng hướng tâm ở góc trên trái; vạch phân cách sóng nước lam cao 14px; khối trống phủ vân men rạn rất mờ (360px). Triện son là hình vuông bo 2.5px, viền trong, nghiêng -3° tới -6°. Dấu trạng thái là bốn hình 7-8px: tròn, thoi, vuông, vòng.

Tấm dệt dùng góc vải 3px (`weave`) cho miếng vải, nút, liên kết dạng nút, khung ảnh; 2px cho đường chỉ khâu và ảnh trong miếng vải; dải và đoạn sọc biên vuông góc. Thẻ bo 8px có viền mảnh của thế giới chung, khi nằm trong khu, bị nhuộm lại thành miếng vải 3px. Hình lặp lại: biên răng cưa (lưới 10×5 ô ở 3px, lát 30×15px, hai màu so le, lật dọc ở mép dưới); hoa văn tông-trên-tông (ô 4px, 10% ngà trên dải chữ sáng, 9% nâu đen trên dải chữ tối); đường chỉ chạy đứt 1.5px cách mép 5px; dải răng cưa 9px của việc gấp; sợi dọc 1px mỗi 4px của chặng chưa dệt; tua vải bốn sợi (nâu `n8`, `n5`, ngà, `n3`) mờ dần ở cuối tấm; con thoi gỗ 56×14px.

**Quy tắc Hoa văn tự dệt.** Mọi hoa văn (trám, sao tám cánh, răng cưa, móc câu, ô cờ đôi, sóng), biên và chữ huy hiệu đều sinh từ lưới ô vuông trong `src/components/weave/loom.ts` và xuất thành SVG nét sắc (`crispEdges`). Đây là hình học tự vẽ, không chép mẫu của một dân tộc cụ thể, không dùng ảnh vải thật làm nền.

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
- **Khu làm việc (nghệ nhân, Ban quản lý):** thanh bên phủ men của vai trò (nghệ nhân `tile-dat`, Ban quản lý nền `dem`; khu khách hàng dùng sọc biên của Tấm dệt), mục 14.5px cao tối thiểu 44px; mục đang chọn là một viên trượt bằng lò xo (giấy trên lam/đất nung, ngọc đậm trên đêm).
- **Điện thoại:** thanh tab dưới đáy nền sứ 95% làm mờ, vạch 3px màu men của khu trượt trên tab đang chọn, ngăn kéo "Thêm" trồi lên trong 380ms.

### Dialog và thông báo nổi
- **Hộp thoại:** phần tử `<dialog>` gốc, nền ngà, góc 10px, viền `vua`, bóng nhấc, rộng `min(92vw, 520px)`; lớp phủ `dem` 45% làm mờ 2px; trồi lên 14px trong 320ms. Tiêu đề Alegreya 2xl, chân hộp thoại có đường kẻ `vua`.
- **Thông báo nổi:** thẻ sứ góc 8px, viền theo loại (ngọc, son, lam), vạch thời gian 3px co dần ở mép dưới (4,5 giây, lỗi 7 giây).

### Tấm dệt – khu khách hàng (Signature)
Tấm thổ cẩm chứa mọi việc khách có với làng. Thành phần nằm trong `src/components/weave/` và `src/styles/weave.css`, gốc khu là lớp `.det`; chỉ dùng trong `/account`.
- **Biên vải trên:** nền nâu đen, chữ sợi trắng; dấu vCraft trong ô vải trắng 3px nghiêng -3° khi rê; nút trên biên là chữ trắng 75-85% với nền trắng 10% khi rê. Mép dưới là dải răng cưa nâu men điểm hạt trắng.
- **Sọc biên (điều hướng):** mỗi đoạn là màu đặc của mục. Nghỉ: màu trơn. Rê chuột: hoa văn của mục hiện lên (0.3s). Đang mở (`aria-current="page"`): hoa văn hiện và, trên máy tính, đoạn dệt dài xuống thêm `1.1rem + 15px` kết bằng biên răng cưa, phủ lên mép dải bên dưới; trên thanh đáy điện thoại, đoạn cao lên từ 3.6rem tới 4.1rem. Số đếm là ô vải trắng 1.45rem ở góc trên phải, chữ Chakra 700, viền 2px màu đoạn, "9+" khi quá chín, có nhãn đọc đầy đủ.
- **Dải (`Band`):** thẻ `section`/`header`/`div` có `data-hue`, độ dày `heavy`/`normal`/`light`, biên trên/dưới/cả hai/không. Liên kết trên dải gạch chân màu đường kẻ của dải, đậm dần khi rê.
- **Dải đầu trang (`BandHead`):** dải dày, tiêu đề lớn với số việc dệt liền phía trước (ẩn khi bằng không), lời dẫn chữ phụ của dải, hàng thao tác.
- **Nút vải mộc / nút viền sợi:** chỉ dùng trên dải. Vải mộc: nền sợi trắng chữ nâu đen 650, cao tối thiểu 44px, góc 3px; rê chuyển nền vàng mật ong. Viền sợi: trong suốt, viền trong 1.5px màu chữ của dải, rê nền trắng 10%. Cả hai lún 1px khi ấn.
- **Miếng vải khâu (`.patch`):** mặt vải mộc góc 3px, đường chỉ chạy màu `--band-deep` 70%. Biến thể dày (`.dense`) cho việc gấp, mảnh (`.thin`) cho việc xong; `.lift` hoặc thẻ liên kết thì nhấc khi rê. Thành phần dùng chung có `data-card` (Card, bảng chào giá của phòng báo giá, khung bước của phiếu yêu cầu) tự thành miếng vải; `data-badge` trên dải được đặt nền sợi trắng; phần đầu đặt trong `.on-band` thì chữ và nút viền đổi theo màu dải.
- **Miếng đơn sỉ (`OrderPatch`):** tên đơn, mã mono `chu-nau`, số lượng, men, ngân sách, tiến độ dệt; cột phải ngăn bằng đường đứt ghi số chào giá (số Chakra 2.4rem `chu-nau`), xưởng nhận làm, giá trị đã chốt và việc cần làm tiếp (`chu-nau` nếu có việc, tro nếu đang chờ xưởng; việc gấp nhận ra bằng miếng vải dệt dày, không bằng màu). Bản gọn một dòng cho trang tổng quan.
- **Tiến độ dệt (`WeaveTrack`):** năm chặng thành năm ô cao 0.8rem: đã qua dệt kín màu `--band-deep` với hoa văn răng cưa 22%, chặng đang làm dệt nửa trên, chặng chưa tới chỉ còn sợi dọc; nhãn chặng 0.72rem, chặng hiện tại đậm. Đơn hủy là dòng chữ gạch ngang. Hình mang nghĩa, không chỉ màu.
- **Miếng lịch hẹn (`VisitPatch`):** cuống ngày bên trái (nền `nau` chữ sợi trắng khi còn hiệu lực, mực 8% chữ tro khi đã qua), xưởng, trạng thái có dấu hình (`chu-nau` khi đã xác nhận), giờ, số khách, địa chỉ, lời nhắn của xưởng; lịch còn hiệu lực có "Thêm vào lịch" (.ics) và "Chỉ đường".
- **Miếng truy xuất (`TracePatch`):** ảnh lô, tên, mã mono `chu-nau`, men, xưởng (kèm "Hộ nghề xác thực"), công đoạn, nhiệt độ nung, trạng thái khóa nhật ký; ảnh phóng 1.05 khi rê.
- **Thư (`LetterList`):** mỗi thông báo là một miếng vải, nhóm theo ngày; thư chưa mở mang nhãn dệt "Mới" nền vàng mật ong chữ nâu đen và chữ đậm, thư đã mở mờ 80% với nhãn "Đã mở".
- **Huy hiệu dệt (`WovenBadge`):** hai chữ cái pixel của xưởng giữa khung răng cưa (khung 55%), theo màu chữ của dải hoặc màu mực; mờ 45% là xưởng còn chờ khách đánh giá. Huy hiệu là dấu nhận diện, không phải con dấu xác thực.
- **Tác phẩm bày trên vải (`LaidPiece`):** tác phẩm có ảnh tách nền đứng thẳng trên dải lá với bóng tiếp đất; tác phẩm chưa có thì là miếng ảnh khâu đính (miếng vải đệm 7px). Rê chuột nhấc 6px.
- **Phòng báo giá (`QuoteRoom variant="weave"`):** đầu phòng dệt trong một dải nâu `n7` dày: tiêu đề, mã phiếu, nhãn trạng thái, **huy hiệu "Record vN · Optimistic Lock"** (nền `lam`, chữ `on`, mono 11px, biểu tượng khóa, góc 4px) và **thanh 6 trạng thái** đặt trên miếng vải ngay trong dải. Huy hiệu và thanh 6 trạng thái là yêu cầu của đề bài: bắt buộc giữ, luôn nhìn thấy trong màn hình đầu, không được ẩn, gập hay chuyển xuống dưới. Phần còn lại (bảng chào giá, xung đột 409, lịch sử) nằm dưới dải trên nền sợi bông.
- **Tua vải và con thoi:** tua vải 46px kết thúc trang tổng quan; con thoi gỗ chạy qua mép dưới mỗi dải một lần khi dải dệt xong.

**Chuyển động của Tấm dệt:**
- **Dệt vào:** mỗi dải (`data-reveal="weave"`) khi cuộn tới thì lớp hoa văn hiện từ trên xuống theo 9 bậc trong 0.9s như từng hàng sợi được dệt; con thoi chạy ngang mép dưới trong 1.05s (`ease-out-expo`, trễ 0.55s) rồi biến mất.
- **Chuyển trang:** mỗi lần đổi mục, tấm vải hiện từ mờ và trượt lên 10px trong 0.5s (`ease-out-expo`).
- **Sọc biên:** hoa văn hiện trong 0.3s khi rê hoặc khi đang mở.
- **Miếng vải và nút:** miếng vải nhấc 2px trong 0.45s; nút vải mộc đổi nền và lún trong 0.2s; mũi tên của việc trượt 4px trong 0.5s; tác phẩm bày nhấc 6px trong 0.5s.
- **Tấm "Khác":** trồi lên trong 0.42s (`cubic-bezier(0.16, 1, 0.3, 1)`), nền mờ đen 55%; mỗi dải con trượt vào từ trái 16px, cách nhau 40ms.
- **Giảm chuyển động:** hoa văn hiện ngay không dệt, không con thoi, không trượt trang, sọc biên không chuyển; các chuyển tiếp còn lại theo luật chung.
- **Khi in:** bỏ màu dải, sọc biên và biên vải; ẩn hoa văn, biên răng cưa, tua vải; chữ đen.

**Ảnh tách nền (nguồn gốc bắt buộc).** Tác phẩm đứng thẳng trên vải dùng ảnh WebP đã tách nền trong `public/seed/cutout/`. Mỗi ảnh tách nền bằng mô hình phông nền + GrabCut rồi duyệt tay, và phải có tệp `.webp.json` đi kèm ghi nguồn gốc ảnh gốc (nguồn, tác giả, giấy phép), ảnh dẫn xuất từ đâu và cách xử lý. Chỉ ảnh có tên trong danh mục `src/lib/cutouts.ts` mới được đứng trên vải; ảnh chụp trên nền rối giữ nguyên trong miếng ảnh khâu.

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
- **Do** giữ mỗi khu làm việc trong thế giới của nó: khách hàng là Tấm dệt, nghệ nhân đất nung, Ban quản lý đêm với điểm ngọc.
- **Do** dùng `on` cho chữ trên men đổi theo chế độ và `giay` cho chữ trên viên `*-nen`, ảnh, nền đêm.
- **Do** cho mọi chuyển động một đường thay thế khi `prefers-reduced-motion: reduce`.
- **Do** dùng `--chart-1..4` cho mọi chuỗi dữ liệu, cột rộng tối đa 24px, đầu cột bo 4px, kèm bảng số liệu.
- **Do** giữ mục tiêu bấm từ 44px trở lên, 56px cho tab điện thoại.
- **Do** giữ Tấm dệt trong khu khách hàng; khu nghệ nhân và Ban quản lý dùng khung chung cho tới khi có bản sắc riêng.
- **Do** cho mỗi mục của Tấm dệt đúng một màu nhuộm theo `ROUTE_HUE` và dùng nó cho sọc biên, dải, chỉ khâu, mã và số của mục.
- **Do** đặt nội dung đọc trên miếng vải mộc khâu chỉ góc 3px; để dải dệt dày khi có việc chờ khách và dệt mảnh khi không còn việc.
- **Do** dệt con số vào tiêu đề bằng Chakra Petch và ẩn số khi bằng không.
- **Do** sinh mọi hoa văn, biên và chữ huy hiệu từ lưới ô vuông trong `loom.ts`.
- **Do** giữ huy hiệu "Record vN · Optimistic Lock" và thanh 6 trạng thái trong dải đầu của phòng báo giá, luôn nhìn thấy.
- **Do** chỉ cho tác phẩm đứng thẳng trên vải khi ảnh tách nền đã được duyệt tay, có tên trong `cutouts.ts` và có tệp `.webp.json` ghi nguồn gốc; còn lại dùng miếng ảnh khâu.

### Don't:
- **Don't** dựng giao diện kiểu chợ thủ công nền kem, chữ có chân và một điểm nhấn đất nung; men màu phải phủ mảng.
- **Don't** đặt dòng chữ nhỏ (kicker) phía trên tiêu đề; `.label` chỉ dùng cho nhãn nhóm.
- **Don't** dùng Phudu cho đoạn văn hoặc ở chữ thường.
- **Don't** dùng bóng đổ cứng, lệch; bóng luôn mềm với độ lan âm.
- **Don't** bo góc lớn kiểu viên thuốc cho nút hay thẻ.
- **Don't** dùng `doson` để trang trí.
- **Don't** viết màu dữ liệu lên chữ trong biểu đồ.
- **Don't** đưa ảnh tách nền tự động chưa duyệt, hoặc thiếu tệp nguồn gốc, lên vải.
- **Don't** đem bức ghép, mạch vữa, viên men hay Phudu vào Tấm dệt, hay đem dải dệt và sọc biên sang khu nghệ nhân, Ban quản lý.
- **Don't** dựng ô số liệu xếp hàng hay thẻ bo tròn viền mảnh trong Tấm dệt; số dệt vào tiêu đề, nội dung nằm trên miếng vải.
- **Don't** chép hoa văn của một dân tộc cụ thể hay dùng ảnh vải thổ cẩm thật làm nền.
- **Don't** để hoa văn đậm sau cột chữ; giữa dải luôn lặng.
