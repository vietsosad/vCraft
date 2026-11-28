"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Lock, Sparkles, Zap, RefreshCw, Factory, CheckCircle2, AlertTriangle, History, PackageCheck, Ban, ArrowDown } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { GLAZES, QUOTE_FLOW, QUOTE_STATUS, categoryLabel } from "@/lib/constants";
import { formatDate, formatNumber, formatVnd, timeAgo } from "@/lib/format";
import { asStages, asStrings } from "@/lib/types";
import { quoteNextStep } from "@/lib/order-legs";
import { Button } from "@/components/ui/button";
import { Badge, Card, EmptyState, StatusMark } from "@/components/ui/primitives";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { CONG_DOAN, hoaDau, soChu } from "@/components/lang/words";
import { QUOTE_MARK, QuoteFlow, QuoteStatusBadge } from "./quote-status";
import { BidForm } from "./bid-form";
import type { QuoteView } from "./types";
import { cn } from "@/lib/cn";

type Selection = Record<string, number>; // bidId → số lượng

type ConflictResult = { label: string; status: number; message: string };

/** Tàn lửa bay lên trong lò (vị trí %, độ trễ giây, độ dạt ngang px). */
const TAN: [number, number, number][] = [
  [6, 0, 30], [14, 2.1, -18], [23, 4, 24], [31, 1.2, -30], [42, 3.3, 16], [50, 0.6, -22],
  [58, 5.1, 28], [67, 2.7, -16], [75, 1.6, 20], [84, 4.5, -26], [92, 0.3, 18], [97, 3.8, -12],
];

/** Bước chia tròn (1, 2, 5 × 10ⁿ) gần một phần mười số lượng: 5.000 → 500, 1.200 → 100. */
function niceStep(n: number) {
  if (n <= 1) return 1;
  const p = 10 ** Math.floor(Math.log10(n));
  const m = n / p;
  return (m >= 5 ? 5 : m >= 2 ? 2 : 1) * p;
}

/**
 * Phòng đấu thầu của một yêu cầu báo giá. Dữ liệu được làm mới bằng fetch mỗi 15 giây
 * (chào giá mới xuất hiện không cần tải lại trang). Mọi thao tác gửi kèm `version` đang hiển thị
 * để server áp dụng khóa lạc quan.
 *
 * variant "lang" (khu khách hàng "Đường làng"): đầu phòng là lò bậc thang sáu khoang – mỗi khoang một trạng thái,
 * khoang hiện tại bén lửa; chào giá là các thẻ có nút chia theo bước và thanh mười viên gốm.
 */
export function QuoteRoom({ initial, variant, head }: { initial: QuoteView; variant?: "lang"; head?: ReactNode }) {
  const toast = useToast();
  const [q, setQ] = useState(initial);
  const [selection, setSelection] = useState<Selection>({});
  const [confirm, setConfirm] = useState<null | "accept" | "start" | "deliver" | "send">(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [conflict, setConflict] = useState<string | null>(null);
  const [demoResults, setDemoResults] = useState<ConflictResult[] | null>(null);

  const refresh = useCallback(async () => {
    const data = await api<QuoteView>(`/api/quotes/${q.requestCode}`);
    setQ(data);
    return data;
  }, [q.requestCode]);

  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === "visible") refresh().catch(() => {});
    }, 15000);
    return () => clearInterval(t);
  }, [refresh]);

  const canManage = q.viewer.isOwner || q.viewer.isAdmin;
  const pendingBids = q.bids.filter((b) => b.status === "PENDING");
  const totalSelected = Object.values(selection).reduce((s, n) => s + (n || 0), 0);
  const totalCost = q.bids.reduce((s, b) => s + (selection[b.id] ?? 0) * b.offeredPricePerUnit, 0);
  const myBid = q.viewer.isArtisan ? q.bids[0] : undefined;
  const canCancel = canManage && ["DRAFT_REQUEST", "SENT_TO_ARTISANS", "ARTISANS_BIDDING"].includes(q.status);

  const selectionsPayload = useMemo(
    () =>
      Object.entries(selection)
        .filter(([, n]) => n > 0)
        .map(([bidId, quantity]) => ({ bidId, quantity, bidVersion: q.bids.find((b) => b.id === bidId)!.version })),
    [selection, q.bids],
  );

  async function handleError(err: unknown) {
    if (err instanceof ApiError && err.status === 409) {
      setConflict(err.message);
      toast({ kind: "error", title: "Xung đột dữ liệu (409)", description: err.message });
      await refresh();
      setSelection({});
    } else {
      toast({ kind: "error", title: err instanceof ApiError ? err.message : "Có lỗi xảy ra" });
    }
  }

  async function suggest() {
    try {
      const s = await api<{ selections: { bidId: string; quantity: number }[]; totalCost: number; shortfall: number; excludedLate: string[] }>(`/api/quotes/${q.requestCode}/suggestion`);
      setSelection(Object.fromEntries(s.selections.map((x) => [x.bidId, x.quantity])));
      toast({
        kind: s.shortfall ? "info" : "success",
        title: s.shortfall ? `Gợi ý còn thiếu ${formatNumber(s.shortfall)} sản phẩm` : `Gợi ý tối ưu chi phí: ${formatVnd(s.totalCost)}`,
        description: s.excludedLate.length ? `Đã loại do không kịp hạn: ${s.excludedLate.join(", ")}` : "Đơn giá thấp nhất trước, vẫn kịp thời hạn.",
      });
    } catch (err) {
      await handleError(err);
    }
  }

  async function run(action: "accept" | "start" | "deliver" | "send") {
    setBusy(true);
    setConflict(null);
    try {
      if (action === "accept") {
        const res = await api<{ batches: { batchCode: string; workshopName: string }[] }>(`/api/quotes/${q.requestCode}/accept`, {
          body: { expectedVersion: q.version, selections: selectionsPayload },
        });
        toast({ kind: "success", title: "Đã chốt phân bổ đơn hàng", description: `Tạo ${res.batches.length} lô sản xuất có mã QR: ${res.batches.map((b) => b.batchCode).join(", ")}` });
        setSelection({});
      } else {
        const path = action === "start" ? "start-production" : action;
        await api(`/api/quotes/${q.requestCode}/${path}`, { body: { expectedVersion: q.version } });
        toast({ kind: "success", title: action === "start" ? "Đã phát lệnh sản xuất" : action === "send" ? "Đã gửi tới các xưởng" : "Đã xác nhận nhận hàng" });
      }
      await refresh();
    } catch (err) {
      await handleError(err);
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  }

  /**
   * Mô phỏng xung đột đồng thời: gửi HAI yêu cầu chốt cùng lúc với cùng một version.
   * Giao dịch Serializable + updateMany có điều kiện version đảm bảo đúng một yêu cầu thành công.
   */
  async function simulateConflict() {
    if (totalSelected !== q.quantity) {
      toast({ kind: "info", title: "Hãy chọn phân bổ đủ số lượng trước", description: "Bấm “Gợi ý phân bổ” để điền nhanh." });
      return;
    }
    setBusy(true);
    setDemoResults(null);
    const body = JSON.stringify({ expectedVersion: q.version, selections: selectionsPayload });
    const fire = (label: string) =>
      fetch(`/api/quotes/${q.requestCode}/accept`, { method: "POST", headers: { "Content-Type": "application/json" }, body })
        .then(async (r) => ({ label, status: r.status, message: (await r.json())?.error?.message ?? "Chốt thành công" }));
    const results = await Promise.all([fire("Cửa sổ 1"), fire("Cửa sổ 2")]);
    setDemoResults(results);
    setSelection({});
    await refresh();
    setBusy(false);
  }

  async function cancel() {
    setBusy(true);
    try {
      await api(`/api/quotes/${q.requestCode}/cancel`, { body: { expectedVersion: q.version, reason: cancelReason } });
      toast({ kind: "success", title: "Đã hủy yêu cầu" });
      setCancelOpen(false);
      await refresh();
    } catch (err) {
      await handleError(err);
    } finally {
      setBusy(false);
    }
  }

  // Việc người đặt cần làm tiếp, cùng quy tắc với danh sách đơn sỉ của khu khách hàng
  const batchesOpen = q.allocatedBatches.filter((b) => b.status !== "COMPLETED").length;
  const nextStep = quoteNextStep({ status: q.status, bids: q.bids.length, batchesOpen, batches: q.allocatedBatches.length });

  const L = variant === "lang";
  const h2c = L ? "font-serif text-[1.65rem] font-bold leading-tight giong-ke" : undefined;
  const step = niceStep(q.quantity / 10);
  const setQty = (bidId: string, max: number, n: number) => setSelection((s) => ({ ...s, [bidId]: Math.max(0, Math.min(max, n)) }));
  const doRefresh = () => refresh().then(() => toast({ kind: "info", title: "Đã tải dữ liệu mới nhất" }));

  /* Huy hiệu phiên bản bản ghi: đề bài yêu cầu hiển thị để chứng minh khóa lạc quan trước hội đồng */
  const lockBadge = (
    <span className="inline-flex items-center gap-1 rounded-[4px] bg-lam px-2.5 py-0.5 font-mono text-xs text-on" title="Khóa lạc quan: mọi thao tác phải gửi kèm phiên bản này">
      <Lock className="size-3" aria-hidden /> Record v{q.version} · Optimistic Lock
    </span>
  );
  const summary = (
    <>
      {q.organizationName} · <span className={cn("tabular font-semibold", L ? "text-[#fffdf8]" : "text-muc")}>{formatNumber(q.quantity)}</span> sản phẩm · {GLAZES[q.preferredGlaze].label} · {categoryLabel(q.category)} · cần trong {q.deadlineDays} ngày
    </>
  );

  /* ---------------- Mặc định (khu nghệ nhân, Ban quản lý): đầu phòng và thanh 6 trạng thái ---------------- */
  const header = (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-3xl">
        <h1>{q.title}</h1>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm text-lam">{q.requestCode}</span>
          <QuoteStatusBadge status={q.status} />
          {lockBadge}
        </div>
        <p className="mt-2.5 text-[15px] text-tro">{summary}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" onClick={doRefresh}><RefreshCw className="size-4" /> Làm mới</Button>
        {canCancel && <Button variant="outline" size="sm" onClick={() => setCancelOpen(true)}><Ban className="size-4" /> Hủy yêu cầu</Button>}
      </div>
    </div>
  );
  const flow = (
    <Card className="p-5 sm:px-7">
      <QuoteFlow status={q.status} />
      {q.viewer.isOwner && nextStep && (
        <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-vua pt-3.5 text-[15px]">
          <span className="text-tro">Việc tiếp theo của bạn:</span>
          <span className="font-semibold">{nextStep.label}</span>
          {q.status === "ARTISANS_BIDDING" && (
            <a href="#chao-gia" className="inline-flex min-h-11 items-center gap-1 px-1 text-sm font-semibold text-lam underline underline-offset-4">
              Tới bảng chào giá <ArrowDown className="size-4" aria-hidden />
            </a>
          )}
        </p>
      )}
    </Card>
  );

  /* ---------------- "Đường làng": lò bậc thang sáu khoang ---------------- */
  const cur = q.status === "CANCELLED" ? -1 : QUOTE_STATUS[q.status].step;
  const delivered = q.status === "DELIVERED";
  const waitLine =
    q.status === "CANCELLED" ? `Lò đã tắt: yêu cầu bị hủy.${q.cancelReason ? ` Lý do: ${q.cancelReason}` : ""}`
      : delivered ? "Mẻ gốm đã ra lò và giao đủ cho bạn."
        : q.status === "IN_PRODUCTION" ? `Lò đang cháy đều: ${soChu(q.allocatedBatches.length - batchesOpen)}/${soChu(q.allocatedBatches.length)} lô đã khóa nhật ký sản xuất.`
          : `Đang chờ các xưởng chào giá: đã mời ${soChu(q.invitations.length)} xưởng, trang tự cập nhật mỗi 15 giây.`;
  const langTop = (
    <section className="lo-bac relative overflow-hidden pb-14 pt-6 md:pt-8" aria-labelledby="phong-bao-gia">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {cur >= 0 && !delivered && TAN.map(([left, delay, dx]) => (
          <span key={left} className="tan" style={{ left: `${left}%`, animationDelay: `${delay}s`, ["--dx" as string]: `${dx}px` } as CSSProperties} />
        ))}
      </div>
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        {head}
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 max-w-4xl">
            <h1 id="phong-bao-gia" className="hien max-w-[28ch] text-balance font-serif text-[clamp(1.9rem,3.4vw,2.6rem)] font-extrabold leading-[1.15] giong-ke">{q.title}</h1>
            <div className="hien mt-3.5 flex flex-wrap items-center gap-2" style={{ animationDelay: ".08s" }}>
              <span className="code text-sm text-[#f3dc9f]">{q.requestCode}</span>
              <span className="inline-flex items-center gap-1.5 rounded-[4px] bg-[#f3dc9f] px-2 py-0.5 text-xs font-semibold text-[#1e1511]">
                <StatusMark mark={QUOTE_MARK[q.status]} /> {QUOTE_STATUS[q.status].label}
              </span>
              {lockBadge}
            </div>
            <p className="hien mt-3 text-[15px] text-[#e6d9bf]" style={{ animationDelay: ".14s" }}>{summary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={doRefresh} className="!text-[#f3dc9f] hover:!bg-white/10"><RefreshCw className="size-4" /> Làm mới</Button>
            {canCancel && (
              <Button variant="outline" onClick={() => setCancelOpen(true)} className="!border-white/25 !bg-transparent !text-[#fffdf8] hover:!border-white/50 hover:!bg-white/10">
                <Ban className="size-4" /> Hủy yêu cầu
              </Button>
            )}
          </div>
        </div>

        <ol className="lo-bac-hang mt-10 flex items-end gap-3" aria-label="Sáu trạng thái của đơn">
          {QUOTE_FLOW.map((s, i) => {
            const state = delivered || i < cur ? "da" : i === cur ? "nay" : "sau";
            return (
              <li key={s} className={cn("khoang", state)} style={{ transform: `translateY(${-i * 7}px)` }} aria-current={state === "nay" ? "step" : undefined}>
                <span className="vom">
                  <span className="mieng" />
                  {state === "nay" && (
                    <svg className="lua-khoang absolute bottom-1 left-1/2 -ml-[15px]" viewBox="0 0 40 48" width="30" height="36" aria-hidden>
                      <path d="M20 46 C 6 40 8 26 16 18 C 16 26 22 28 22 20 C 22 12 28 8 30 2 C 34 14 36 24 34 32 C 33 40 28 46 20 46 Z" fill="#ffd28a" />
                      <path d="M20 46 C 13 42 14 34 19 29 C 20 34 24 34 24 30 C 27 34 28 40 26 43 C 24 46 22 46 20 46 Z" fill="#ee8a43" />
                    </svg>
                  )}
                </span>
                <span className="ten-khoang">{QUOTE_STATUS[s].label}</span>
                <span className="cong-doan">{CONG_DOAN[i]}</span>
                <span className="sr-only">{state === "da" ? "(đã qua)" : state === "nay" ? "(trạng thái hiện tại)" : "(chưa tới)"}</span>
              </li>
            );
          })}
        </ol>

        <p className="hien mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[10px] border border-white/[0.12] bg-white/[0.06] px-[18px] py-3 text-[15px]" style={{ animationDelay: ".2s" }}>
          {q.viewer.isOwner && nextStep ? (
            <>
              <span className="text-[#d9cdb7]">Việc tiếp theo của bạn:</span>
              <strong className="font-semibold">{nextStep.label}</strong>
              {q.status === "ARTISANS_BIDDING" && (
                <a href="#chao-gia" className="inline-flex min-h-11 items-center gap-1 font-semibold text-[#f3dc9f] underline-offset-4 hover:underline">
                  Tới bảng chào giá <ArrowDown className="size-4" aria-hidden />
                </a>
              )}
            </>
          ) : (
            <span className="py-2.5 text-[#e6d9bf]">{waitLine}</span>
          )}
        </p>
      </div>
    </section>
  );

  /* ---------------- So sánh chào giá ---------------- */
  const conflictDemo = q.status === "ARTISANS_BIDDING" && pendingBids.length > 0 && (
    <div className={cn("mt-6 border border-dashed border-lam/40 bg-lam/[0.04] p-5", L ? "rounded-[10px]" : "rounded-[var(--radius-tile)]")}>
      <p className="flex items-center gap-2 font-semibold text-lam"><Zap className="size-4" aria-hidden /> Mô phỏng xung đột đồng thời (409 Conflict Demo)</p>
      <p className="mt-1 text-sm text-tro">
        Gửi hai yêu cầu chốt <strong className="font-semibold text-muc">cùng lúc</strong> với cùng phiên bản v{q.version}, giống hai người bấm chốt ở hai cửa sổ. Giao dịch Serializable và điều kiện{" "}
        <code className="font-mono text-xs">updateMany(where: {"{"} version: {q.version} {"}"})</code> bảo đảm chỉ một yêu cầu thắng.
      </p>
      <Button className="mt-3" size={L ? "md" : "sm"} variant="outline" onClick={simulateConflict} loading={busy}>Gửi 2 yêu cầu chốt đồng thời</Button>
      {demoResults && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2" aria-live="polite">
          {demoResults.map((r) => (
            <div key={r.label} className={cn("rounded-md border p-3 text-sm", r.status === 200 ? "border-ngoc/40 bg-ngoc-nhat/50" : "border-datnung/40 bg-datnung/5")}>
              <p className="font-mono text-[13px]">{r.label} → HTTP {r.status}</p>
              <p className="mt-1">{r.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const gapNote = totalSelected !== q.quantity && totalSelected > 0 && (
    <span className="text-datnung"> · {totalSelected < q.quantity ? `còn thiếu ${formatNumber(q.quantity - totalSelected)}` : `thừa ${formatNumber(totalSelected - q.quantity)}`}</span>
  );
  const acceptButton = (
    <Button
      variant="cobalt"
      size={L ? "lg" : "md"}
      disabled={totalSelected !== q.quantity || q.status !== "ARTISANS_BIDDING"}
      onClick={() => setConfirm("accept")}
      className={cn(L && "!h-auto min-h-[52px] w-full py-2.5 !whitespace-normal sm:w-auto")}
    >
      <Lock className="size-4" /> Chấp nhận & phân bổ đơn hàng
    </Button>
  );

  const tableBids = (
    <div data-card="" className="relative overflow-x-auto rounded-[var(--radius-tile)] border border-vua bg-su/80">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-nga-dam/70 text-left text-[13px] font-semibold text-tro">
          <tr>
            <th className="px-3 py-3">Xưởng</th><th className="px-3 py-3 text-right">Đơn giá</th><th className="px-3 py-3 text-right">Nhận làm</th>
            <th className="px-3 py-3 text-right">Số ngày</th><th className="px-3 py-3 text-right">Uy tín</th><th className="px-3 py-3">Phân bổ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-vua">
          {pendingBids.map((b) => {
            const late = b.estimatedDays > q.deadlineDays;
            const qty = selection[b.id] ?? 0;
            return (
              <tr key={b.id} className={cn(qty > 0 && "bg-ngoc-nhat/40")}>
                <td className="px-3 py-3">
                  <Link href={`/artisans/${b.artisan.slug}`} className="font-medium hover:text-datnung">{b.artisan.workshopName}</Link>
                  <p className="line-clamp-2 max-w-xs text-[13px] text-tro">{b.proposalNote}</p>
                  <p className="mt-0.5 text-xs text-tro">Cập nhật {timeAgo(b.updatedAt)} · bản v{b.version}</p>
                </td>
                <td className={cn("whitespace-nowrap px-3 py-3 text-right font-semibold tabular", b.offeredPricePerUnit <= q.targetBudgetPerUnit ? "text-ngoc" : "text-datnung")}>{formatVnd(b.offeredPricePerUnit)}</td>
                <td className="px-3 py-3 text-right tabular">{formatNumber(b.committedQuantity)}</td>
                <td className={cn("px-3 py-3 text-right tabular", late && "font-semibold text-datnung")}>
                  <span className="inline-flex items-center gap-1">{late && <AlertTriangle className="size-3.5" aria-hidden />}{b.estimatedDays}</span>
                  {late && <span className="sr-only"> (quá hạn cần giao)</span>}
                </td>
                <td className="px-3 py-3 text-right tabular">{b.artisan.ratingAvg > 0 ? b.artisan.ratingAvg.toFixed(1) : <span className="text-tro" title="Xưởng chưa có đánh giá">–</span>}</td>
                <td className="px-3 py-3">
                  <label className="sr-only" htmlFor={`alloc-${b.id}`}>Số lượng phân bổ cho {b.artisan.workshopName}</label>
                  <input
                    id={`alloc-${b.id}`}
                    inputMode="numeric"
                    value={qty ? qty.toLocaleString("vi-VN") : ""}
                    placeholder="0"
                    onChange={(e) => setQty(b.id, b.committedQuantity, Number(e.target.value.replace(/\D/g, "") || 0))}
                    className="w-24 rounded border border-vua bg-su px-2 py-1.5 text-right tabular"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-vua bg-nga-dam/40 px-4 py-3">
        <p className="text-sm">
          Đã phân bổ <strong className={cn("tabular", totalSelected === q.quantity ? "text-ngoc" : "text-datnung")}>{formatNumber(totalSelected)}</strong> / {formatNumber(q.quantity)}
          {totalSelected > 0 && <> · Thành tiền <strong className="tabular">{formatVnd(totalCost)}</strong></>}
          {gapNote}
        </p>
        {acceptButton}
      </div>
    </div>
  );

  // Mười viên gốm, mỗi viên một phần mười số lượng cần đặt; chia thừa thì viên chuyển màu đất nung
  const filled = Math.min(10, Math.round((totalSelected / Math.max(1, q.quantity)) * 10));
  const over = totalSelected > q.quantity;
  const langBids = (
    <>
      <ul className="grid grid-cols-1 gap-3.5">
        {pendingBids.map((b) => {
          const late = b.estimatedDays > q.deadlineDays;
          const within = b.offeredPricePerUnit <= q.targetBudgetPerUnit;
          const qty = selection[b.id] ?? 0;
          const name = b.artisan.workshopName;
          return (
            <li key={b.id} className={cn("chao rounded-[10px] border border-vua bg-su px-5 py-[18px] shadow-soft sm:px-6", qty > 0 && "chon")}>
              <div className="grid grid-cols-1 items-center gap-x-6 gap-y-4 md:grid-cols-[minmax(0,1fr)_auto]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
                    <h3 className="font-serif text-[1.35rem] font-bold leading-snug giong-ke">
                      <Link href={`/artisans/${b.artisan.slug}`} className="hover:underline">{name}</Link>
                    </h3>
                    <span className={cn("tabular text-[1.15rem] font-bold", within ? "text-ngoc" : "text-datnung")}>{formatVnd(b.offeredPricePerUnit)}/sp</span>
                  </div>
                  <p className="mt-1 text-sm text-tro">
                    Nhận làm <span className="tabular">{formatNumber(b.committedQuantity)}</span> sp ·{" "}
                    <span className={cn(late && "font-semibold text-datnung")}>
                      {late && <AlertTriangle className="mr-1 inline size-3.5 align-[-2px]" aria-hidden />}xong trong {b.estimatedDays} ngày{late && ", quá hạn cần giao"}
                    </span>{" "}
                    · {within ? "trong ngân sách" : "vượt ngân sách"} · {b.artisan.ratingAvg > 0 ? `uy tín ${b.artisan.ratingAvg.toFixed(1)}/5` : "chưa có đánh giá"}
                  </p>
                  {b.proposalNote && <p className="mt-2 font-serif text-[1.05rem] leading-[1.45] giong-ke">“{b.proposalNote}”</p>}
                  <p className="mt-1.5 text-[13px] text-tro">Cập nhật {timeAgo(b.updatedAt)} · bản chào giá v{b.version}</p>
                </div>
                <div className="flex flex-col items-start gap-1.5 md:items-end">
                  <div className="flex items-center gap-2">
                    <button type="button" className="nut-buoc" onClick={() => setQty(b.id, b.committedQuantity, qty - step)} disabled={qty <= 0} aria-label={`Bớt ${formatNumber(step)} sản phẩm cho ${name}`}>−</button>
                    <label className="sr-only" htmlFor={`alloc-${b.id}`}>Số lượng phân bổ cho {name}</label>
                    <input
                      id={`alloc-${b.id}`}
                      inputMode="numeric"
                      value={qty ? qty.toLocaleString("vi-VN") : ""}
                      placeholder="0"
                      onChange={(e) => setQty(b.id, b.committedQuantity, Number(e.target.value.replace(/\D/g, "") || 0))}
                      className="h-11 w-[6.5rem] rounded-[6px] border border-vua bg-nga px-2 text-center text-[1.1rem] font-bold tabular"
                    />
                    <button type="button" className="nut-buoc" onClick={() => setQty(b.id, b.committedQuantity, qty + step)} disabled={qty >= b.committedQuantity} aria-label={`Thêm ${formatNumber(step)} sản phẩm cho ${name}`}>+</button>
                  </div>
                  <span className="text-[13px] text-tro">{qty > 0 ? `thành tiền ${formatVnd(qty * b.offeredPricePerUnit)}` : `chưa chia · tối đa ${formatNumber(b.committedQuantity)}`}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 rounded-[12px] border border-vua bg-su px-5 py-[18px] shadow-lift sm:px-6">
        <div className="grid grid-cols-10 gap-[5px] rounded-[8px] bg-vua p-[5px]" role="img" aria-label={`Đã chia ${formatNumber(totalSelected)} trên ${formatNumber(q.quantity)} sản phẩm`}>
          {Array.from({ length: 10 }, (_, i) => <span key={i} className={cn("vien", i < filled && "day", i < filled && over && "thua")} />)}
        </div>
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[15px]" aria-live="polite">
            Đã chia <strong className={cn("tabular", totalSelected === q.quantity ? "text-ngoc" : "text-datnung")}>{formatNumber(totalSelected)}</strong> / {formatNumber(q.quantity)} sản phẩm
            {totalSelected > 0 && <> · thành tiền <strong className="tabular">{formatVnd(totalCost)}</strong></>}
            {gapNote}
          </p>
          {acceptButton}
        </div>
      </div>
    </>
  );

  const rest = (
    <>
      {conflict && (
        <div role="alert" className="flex gap-3 rounded-[var(--radius-tile)] border border-datnung/50 bg-datnung-nhat p-4 text-[15px]">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-datnung" aria-hidden />
          <div>
            <p className="font-semibold text-datnung">409 Conflict – dữ liệu đã thay đổi</p>
            <p className="mt-1">{conflict}</p>
            <p className="mt-1 text-tro">Bảng đã được tải lại với dữ liệu mới nhất (v{q.version}).</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-8">
          {/* Người mua / BQL: bảng so sánh và chốt */}
          {canManage && q.status === "DRAFT_REQUEST" && (
            <Card className="p-6">
              <h2 className={h2c}>Bản nháp</h2>
              <p className="mt-1.5 text-tro">Gửi yêu cầu để hệ thống ghép và mời các xưởng phù hợp.</p>
              <Button className="mt-4" variant="cobalt" onClick={() => setConfirm("send")}>Gửi tới các xưởng</Button>
            </Card>
          )}

          {canManage && ["SENT_TO_ARTISANS", "ARTISANS_BIDDING"].includes(q.status) && (
            <section id="chao-gia" className="scroll-mt-28">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  {L ? (
                    <>
                      <h2 className={h2c}>{pendingBids.length ? `${hoaDau(soChu(pendingBids.length))} xưởng chào giá kín` : "Đang chờ các xưởng chào giá"}</h2>
                      {pendingBids.length > 0 && (
                        <p className="mt-1 max-w-2xl text-tro">Chia {formatNumber(q.quantity)} sản phẩm cho một hay nhiều xưởng: mỗi lần bấm là {formatNumber(step)} sản phẩm, không quá số xưởng nhận làm; gõ số để chia lẻ.</p>
                      )}
                    </>
                  ) : (
                    <>
                      <h2>So sánh chào giá ({pendingBids.length})</h2>
                      <p className="mt-0.5 text-sm text-tro">Chọn một hoặc nhiều xưởng, tổng phân bổ phải đúng {formatNumber(q.quantity)} sản phẩm.</p>
                    </>
                  )}
                </div>
                <Button variant="outline" size={L ? "md" : "sm"} onClick={suggest} disabled={!pendingBids.length}><Sparkles className="size-4" /> Gợi ý phân bổ tối ưu</Button>
              </div>
              {pendingBids.length === 0 ? (
                <EmptyState title="Đang chờ các xưởng chào giá" description={`Đã mời ${q.invitations.length} xưởng. Trang sẽ tự cập nhật khi có chào giá mới.`} />
              ) : L ? langBids : tableBids}
              {conflictDemo}
            </section>
          )}

          {/* Nghệ nhân: chào giá */}
          {q.viewer.isArtisan && (
            <section>
              <h2 className="mb-2">Chào giá của xưởng bạn</h2>
              {q.viewer.invitation && (
                <ul className="mb-4 flex flex-wrap gap-1.5">
                  {asStrings(q.viewer.invitation.matchReasons).map((r) => <li key={r}><Badge tone="cobalt">{r}</Badge></li>)}
                </ul>
              )}
              <BidForm quote={q} bid={myBid} onSaved={refresh} />
            </section>
          )}

          {/* Sau khi chốt: tiến độ lô sản xuất */}
          {q.allocatedBatches.length > 0 && (
            <section>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <h2 className={h2c}>{L ? "Các lô đang trong lò" : "Phân bổ sản xuất"}</h2>
                {canManage && q.status === "BUYER_ACCEPTED" && <Button variant="primary" onClick={() => setConfirm("start")}><Factory className="size-4" /> Phát lệnh sản xuất</Button>}
                {canManage && q.status === "IN_PRODUCTION" && <Button variant="celadon" onClick={() => setConfirm("deliver")}><PackageCheck className="size-4" /> Xác nhận đã nhận đủ hàng</Button>}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {q.allocatedBatches.map((b) => {
                  const n = asStages(b.productionStages).length;
                  const done = b.status === "COMPLETED";
                  return L ? (
                    <Link key={b.id} href={`/trace/${b.batchCode}`} className="viec flex-col items-stretch gap-2">
                      <span className="flex items-center justify-between gap-2">
                        <span className="code text-[13px] text-lam">{b.batchCode}</span>
                        <Badge tone={done ? "celadon" : "gold"}>{done ? "Đã ra lò" : "Đang trong lò"}</Badge>
                      </span>
                      <span className="font-serif text-[1.25rem] font-bold leading-snug giong-ke">{b.artisan.workshopName}</span>
                      <span className="text-sm text-tro"><span className="tabular">{formatNumber(b.allocatedQuantity ?? 0)}</span> sản phẩm · {Math.min(n, 6)}/6 công đoạn đã ghi</span>
                      <span className="grid grid-cols-6 gap-1.5" role="img" aria-label={`${Math.min(n, 6)} trên 6 công đoạn đã ghi`}>
                        {Array.from({ length: 6 }, (_, i) => <span key={i} title={CONG_DOAN[i]} className={cn("o", i < n ? "da" : i === n && !done ? "nay" : "")} />)}
                      </span>
                    </Link>
                  ) : (
                    <Link key={b.id} href={`/trace/${b.batchCode}`} className="rounded-[var(--radius-tile)] border border-vua bg-su/80 p-4 hover:border-datnung/40">
                      <div className="flex items-center justify-between">
                        <p className="code text-[13px] text-lam">{b.batchCode}</p>
                        <Badge tone={done ? "celadon" : "gold"}>{done ? "Hoàn tất" : "Đang làm"}</Badge>
                      </div>
                      <p className="mt-1 text-lg font-semibold">{b.artisan.workshopName}</p>
                      <p className="text-sm text-tro">{formatNumber(b.allocatedQuantity ?? 0)} sản phẩm · {n}/6 công đoạn</p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded bg-nga-sau"><div className="h-full bg-datnung" style={{ width: `${Math.min(100, (n / 6) * 100)}%` }} /></div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* BQL và người mua: chào giá đã xử lý */}
          {canManage && q.bids.some((b) => b.status !== "PENDING") && (
            <section>
              <h2 className={cn("mb-3", h2c)}>Kết quả chào giá</h2>
              <ul className={cn("divide-y divide-vua border border-vua bg-su/70 text-sm", L ? "rounded-[10px]" : "rounded-[var(--radius-tile)]")}>
                {q.bids.filter((b) => b.status !== "PENDING").map((b) => (
                  <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                    <span className={cn(L && "font-semibold")}>{b.artisan.workshopName}</span>
                    <span className="tabular text-[13px]">{formatVnd(b.offeredPricePerUnit)} × {formatNumber(b.allocatedQuantity ?? b.committedQuantity)}</span>
                    <Badge tone={b.status === "ACCEPTED" ? "celadon" : "ash"}>{b.status === "ACCEPTED" ? "Trúng thầu" : b.status === "WITHDRAWN" ? "Đã rút" : "Không chọn"}</Badge>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Cột phải */}
        <aside className="space-y-5">
          <Card className="p-5 text-sm">
            {L ? <h2 className="mb-2.5 font-serif text-[1.3rem] font-bold giong-ke">Chi tiết yêu cầu</h2> : <p className="label mb-3 !text-lam">Chi tiết yêu cầu</p>}
            <p className={cn("whitespace-pre-line leading-relaxed", L && "text-[15px] leading-[1.6]")}>{q.specifications}</p>
            <dl className="mt-4 space-y-2 border-t border-vua pt-4">
              <div className="flex justify-between gap-3"><dt className="text-tro">Ngân sách</dt><dd className="tabular font-medium">{formatVnd(q.targetBudgetPerUnit)}/sp</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-tro">Giao tới</dt><dd className="text-right">{q.deliveryAddress}</dd></div>
              {q.biddingClosesAt && <div className="flex justify-between gap-3"><dt className="text-tro">Hạn chào giá</dt><dd>{formatDate(q.biddingClosesAt, true)}</dd></div>}
              <div className="flex justify-between gap-3"><dt className="text-tro">Xưởng được mời</dt><dd>{q.invitations.length}</dd></div>
            </dl>
            {q.cancelReason && <p className="mt-3 rounded bg-tro/10 p-2 text-tro">Lý do hủy: {q.cancelReason}</p>}
          </Card>

          <Card className="p-5">
            {L ? (
              <h2 className="mb-3.5 font-serif text-[1.3rem] font-bold giong-ke">Lịch sử trạng thái</h2>
            ) : (
              <p className="label mb-4 flex items-center gap-1.5 !text-lam"><History className="size-4" /> Lịch sử trạng thái</p>
            )}
            <ol className="relative space-y-4 border-l-2 border-vua pl-5">
              {q.history.map((h) => (
                <li key={h.id} className="relative">
                  <span className={cn("absolute -left-[27px] top-1 grid size-3 place-items-center rounded-full ring-4 ring-su", h.toStatus === "DELIVERED" || h.toStatus === "BUYER_ACCEPTED" ? "bg-ngoc" : h.toStatus === "CANCELLED" ? "bg-tro" : "bg-lam")} />
                  <p className="text-sm font-semibold">{QUOTE_STATUS[h.toStatus].label}</p>
                  <p className="text-[13px] text-tro">{h.actor ? `${h.actor.name}` : "Hệ thống"} · {formatDate(h.createdAt, true)}</p>
                  {h.note && <p className="text-[13px] text-tro">{h.note}</p>}
                </li>
              ))}
            </ol>
          </Card>
        </aside>
      </div>

      <ConfirmDialog
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm && run(confirm)}
        loading={busy}
        title={confirm === "accept" ? "Chốt phân bổ đơn hàng?" : confirm === "start" ? "Phát lệnh sản xuất?" : confirm === "send" ? "Gửi yêu cầu tới các xưởng?" : "Xác nhận đã nhận hàng?"}
        confirmLabel={confirm === "accept" ? "Chốt phân bổ" : "Xác nhận"}
      >
        {confirm === "accept" ? (
          <div className="space-y-2">
            <p>Chốt {selectionsPayload.length} xưởng cho {formatNumber(q.quantity)} sản phẩm, tổng {formatVnd(totalCost)}:</p>
            <ul className="list-disc pl-5">
              {selectionsPayload.map((s) => <li key={s.bidId}>{q.bids.find((b) => b.id === s.bidId)?.artisan.workshopName}: {formatNumber(s.quantity)} sp</li>)}
            </ul>
            <p className="text-tro">Sau khi chốt, các chào giá bị khóa và không thay đổi được. Hệ thống tạo lô sản xuất có mã QR cho từng xưởng.</p>
          </div>
        ) : confirm === "deliver" ? (
          <p>Xác nhận đã nhận đủ hàng từ mọi xưởng. Thao tác này kết thúc đơn hàng.</p>
        ) : (
          <p>Phiên bản bản ghi hiện tại v{q.version} sẽ được kiểm tra trước khi chuyển trạng thái.</p>
        )}
      </ConfirmDialog>

      <Dialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Hủy yêu cầu báo giá"
        footer={<><Button variant="ghost" onClick={() => setCancelOpen(false)}>Đóng</Button><Button variant="danger" onClick={cancel} loading={busy} disabled={cancelReason.trim().length < 5}>Hủy yêu cầu</Button></>}
      >
        <label htmlFor="cancel-reason" className="mb-1.5 block font-medium">Lý do hủy (gửi tới các xưởng đã được mời)</label>
        <Textarea id="cancel-reason" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Ví dụ: thay đổi kế hoạch sự kiện" />
      </Dialog>

      {delivered && (
        <p className="flex items-center gap-2 rounded-[var(--radius-tile)] bg-ngoc-nhat p-4 text-ngoc"><CheckCircle2 className="size-5" aria-hidden /> Đơn hàng đã hoàn tất và giao đủ.</p>
      )}
    </>
  );

  if (L) {
    return (
      <div>
        {langTop}
        <div className="mx-auto max-w-7xl space-y-8 px-4 pb-16 pt-10 md:px-6">{rest}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {header}
      {flow}
      {rest}
    </div>
  );
}
