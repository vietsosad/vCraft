import "server-only";
import type { GlazeType } from "@prisma/client";
import { GLAZES, GLAZE_KEYS } from "@/lib/constants";
import { toSearchText } from "@/lib/text";
import { formatVnd } from "@/lib/format";
import { runTool, TOOL_LABEL, type Card, type ToolName } from "./tools";
import type { SessionUser } from "@/lib/auth/session";

/**
 * Bộ trả lời dự phòng chạy hoàn toàn trên CSDL (không cần API key):
 * phân tích ý định câu hỏi tiếng Việt bằng từ khóa, gọi CÙNG các công cụ Prisma như khi có Claude,
 * rồi ghép câu trả lời. Nhờ vậy trợ lý vẫn trả lời đúng số liệu khi phòng thi mất mạng.
 */
export type FallbackEvent =
  | { type: "tool"; name: ToolName; label: string }
  | { type: "text"; delta: string }
  | { type: "cards"; items: Card[] };

const GLAZE_WORDS: Record<GlazeType, string[]> = {
  MEN_RAN_CO: ["men ran", "ran co"],
  MEN_LAM_CO: ["men lam", "lam co", "xanh lam"],
  MEN_NGOC: ["men ngoc", "ngoc"],
  MEN_HOA_BIEN: ["hoa bien"],
  MEN_TRANG_NGA: ["trang nga", "men trang"],
};

function detectGlazes(q: string): GlazeType[] {
  return GLAZE_KEYS.filter((g) => GLAZE_WORDS[g].some((w) => q.includes(w)));
}

export async function* answerLocally(question: string, user: SessionUser | null): AsyncGenerator<FallbackEvent> {
  const q = toSearchText(question);
  const batchCode = question.toUpperCase().match(/BT-\d{4}-[A-Z]+-\d+/)?.[0];
  const quoteCode = question.toUpperCase().match(/RFQ-[A-Z0-9-]+/)?.[0];
  const glazes = detectGlazes(q);
  // Lưu ý: toSearchText đã đổi "5.000" thành "5 000" và "ĐH" thành "dh"
  const wantsQuote = !!quoteCode || /bao gia|don hang|don si|dat si|chao thau|chao gia|dau thau|\b5 ?000\b|dai hoc cong nghe|dh cong nghe|\buet\b/.test(q);
  const wantsWorkshop = /xuong|mo cua|tham quan|ghe|toa do|ban do|trai nghiem|nghe nhan/.test(q);
  const wantsTrace = !!batchCode || /nguon goc|truy xuat|ma lo|qr/.test(q);
  const wantsNews = /tin|thong bao|cup dien|gia dat|chinh sach|ban quan ly|bql/.test(q);
  const wantsCatalog = /san pham|mua|qua tang|binh|am chen|bat|dia|gia bao nhieu|goi y/.test(q) || (glazes.length > 0 && !wantsWorkshop);

  let answered = false;
  const say = (text: string): FallbackEvent => ({ type: "text", delta: text });

  if (wantsQuote) {
    answered = true;
    yield { type: "tool", name: "inspectB2BQuotesAndCapacity", label: TOOL_LABEL.inspectB2BQuotesAndCapacity };
    const res = await runTool("inspectB2BQuotesAndCapacity", { requestCode: quoteCode ?? "RFQ-UET-2026-5000" }, { user });
    const d = res.data as {
      found?: boolean; requestCode?: string; title?: string; status?: string; version?: number; quantity?: number;
      biddingWorkshops?: { workshop: string; committedQuantity: number; estimatedDays: number; status: string; pricePerUnit?: number }[];
      pricesHidden?: boolean; allocationSuggestion?: { selections: { workshopName: string; quantity: number }[]; totalCost: number; shortfall: number };
      villageCapacity: { workshopsAcceptingWholesale: number; totalMonthlyCapacity: number };
    };
    if (d.found) {
      yield say(`**${d.requestCode}** – ${d.title}\nTrạng thái hiện tại: **${d.status}** (phiên bản bản ghi v${d.version}).\n\n`);
      const bids = d.biddingWorkshops ?? [];
      if (bids.length) {
        const decided = bids.some((b) => b.status === "ACCEPTED");
        const tag: Record<string, string> = { ACCEPTED: " – **trúng thầu**", REJECTED: " – không được chọn" };
        yield say(decided ? `Kết quả chào giá của ${bids.length} xưởng:\n` : `Có ${bids.length} xưởng đang tham gia chào giá:\n`);
        for (const b of bids) {
          yield say(`- ${b.workshop}: nhận ${b.committedQuantity.toLocaleString("vi-VN")} sp trong ${b.estimatedDays} ngày${b.pricePerUnit ? `, ${formatVnd(b.pricePerUnit)}/sp` : ""}${tag[b.status] ?? ""}\n`);
        }
        if (d.pricesHidden) yield say("\n_Giá chào được giữ kín, chỉ người tạo yêu cầu và Ban quản lý xem được._\n");
        if (d.allocationSuggestion && d.allocationSuggestion.selections.length) {
          const s = d.allocationSuggestion;
          yield say(`\nPhương án ghép công suất tối ưu chi phí: ${s.selections.map((x) => `${x.workshopName} ${x.quantity.toLocaleString("vi-VN")}`).join(" + ")}, tổng ${formatVnd(s.totalCost)}${s.shortfall ? `, còn thiếu ${s.shortfall.toLocaleString("vi-VN")} sp` : ""}.\n`);
        }
      } else {
        yield say("Chưa có xưởng nào chào giá.\n");
      }
    } else {
      yield say(`Hiện có ${d.villageCapacity.workshopsAcceptingWholesale} xưởng nhận đơn sỉ với tổng công suất khoảng ${d.villageCapacity.totalMonthlyCapacity.toLocaleString("vi-VN")} sản phẩm/tháng.\n`);
    }
    yield { type: "cards", items: res.cards };
    yield say("\n");
  }

  if (wantsWorkshop) {
    answered = true;
    const glaze = glazes[0];
    yield { type: "tool", name: "queryWorkshopsAndMap", label: TOOL_LABEL.queryWorkshopsAndMap };
    const onlyOpen = /mo cua|hom nay|bay gio|dang mo/.test(q);
    const res = await runTool("queryWorkshopsAndMap", { onlyOpenForVisit: onlyOpen || undefined, glazeSpecialty: glaze }, { user });
    const rows = res.data as { workshop: string; artisan: string; status: string; latitude: number; longitude: number; experience: string; specialties: string[] }[];
    if (rows.length) {
      yield say(`${onlyOpen ? "Các xưởng đang mở cửa" : "Các xưởng phù hợp"}${glaze ? ` làm ${GLAZES[glaze].label.toLowerCase()}` : ""}:\n`);
      for (const w of rows.slice(0, 4)) {
        yield say(`- **${w.workshop}** (${w.artisan}) – ${w.status}. Tọa độ ${w.latitude.toFixed(5)}, ${w.longitude.toFixed(5)}. Trải nghiệm: ${w.experience}.\n`);
      }
    } else {
      yield say(`Hiện không có xưởng${glaze ? ` ${GLAZES[glaze].label.toLowerCase()}` : ""} nào đang mở cửa. Bạn có thể xem giờ mở cửa trên bản đồ làng.\n`);
    }
    yield { type: "cards", items: res.cards };
    yield say("\n");
  }

  if (wantsTrace) {
    answered = true;
    yield { type: "tool", name: "verifyBatchByCode", label: TOOL_LABEL.verifyBatchByCode };
    const res = await runTool("verifyBatchByCode", { batchCode: batchCode ?? "BT-2026-RAN-001" }, { user });
    const d = res.data as { found: boolean; batchCode?: string; title?: string; workshop?: string; status?: string; clayOrigin?: string; peakTempC?: number; stages?: { date: string; title: string }[] };
    if (d.found) {
      yield say(`Lô **${d.batchCode}** – ${d.title}, do ${d.workshop} sản xuất. ${d.status}. Đất: ${d.clayOrigin}. Nhiệt độ nung đỉnh ${d.peakTempC}°C.\n`);
      for (const s of d.stages ?? []) yield say(`- ${s.date}: ${s.title}\n`);
    } else {
      yield say("Không tìm thấy lô với mã này. Mã lô có dạng BT-2026-RAN-001, in ngay dưới mã QR.\n");
    }
    yield { type: "cards", items: res.cards };
    yield say("\n");
  }

  if (wantsNews) {
    answered = true;
    yield { type: "tool", name: "getCommunityAnnouncements", label: TOOL_LABEL.getCommunityAnnouncements };
    const category = /cup dien/.test(q) ? "LICH_CUP_DIEN" : /gia dat|nguyen lieu/.test(q) ? "NGUYEN_LIEU" : undefined;
    const res = await runTool("getCommunityAnnouncements", { category, limit: 3 }, { user });
    const rows = res.data as { title: string; date: string; summary: string; urgent: boolean }[];
    yield say("Bản tin mới nhất từ Ban quản lý:\n");
    for (const n of rows) yield say(`- ${n.urgent ? "**[Khẩn]** " : ""}${n.title} (${n.date}): ${n.summary}\n`);
    yield { type: "cards", items: res.cards };
    yield say("\n");
  }

  if (wantsCatalog || (!answered && glazes.length)) {
    answered = true;
    const glaze = glazes[0];
    if (glazes.length >= 2) {
      yield say(glazes.map((g) => `**${GLAZES[g].label}**: ${GLAZES[g].description} Hợp với: ${GLAZES[g].usage}.`).join("\n\n") + "\n\n");
    }
    yield { type: "tool", name: "searchExhibitionCatalog", label: TOOL_LABEL.searchExhibitionCatalog };
    const maxPrice = Number(q.match(/duoi (\d+)/)?.[1] ?? 0) * (/(trieu|tr)\b/.test(q) ? 1_000_000 : /(nghin|k)\b/.test(q) ? 1000 : 1);
    const res = await runTool("searchExhibitionCatalog", { glazeType: glaze, maxPriceVnd: maxPrice || undefined }, { user });
    const d = res.data as { products: { name: string; workshop: string; priceVnd: number }[] };
    if (glaze && glazes.length < 2) yield say(`**${GLAZES[glaze].label}**: ${GLAZES[glaze].description}\n\n`);
    yield say("Một số tác phẩm đang trưng bày:\n");
    for (const p of d.products.slice(0, 4)) yield say(`- ${p.name} – ${p.workshop}, ${formatVnd(p.priceVnd)}\n`);
    yield { type: "cards", items: res.cards };
  }

  if (!answered) {
    yield say(
      "Mình là Sứ giả Tinh hoa Bát Tràng. Bạn có thể hỏi mình về:\n- Xưởng nào đang mở cửa đón khách và tọa độ\n- Nguồn gốc một lô gốm theo mã QR (ví dụ BT-2026-RAN-001)\n- Khác biệt giữa men rạn, men lam, men ngọc, men hỏa biến, men trắng ngà\n- Tình trạng đơn sỉ 5.000 cốc của Trường ĐH Công nghệ\n- Bản tin của Ban quản lý (giá đất, lịch cúp điện)\n",
    );
  }
}
