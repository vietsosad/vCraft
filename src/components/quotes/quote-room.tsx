"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Lock, Sparkles, Zap, RefreshCw, Factory, CheckCircle2, AlertTriangle, History, PackageCheck, Ban } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { GLAZES, QUOTE_STATUS, categoryLabel } from "@/lib/constants";
import { formatDate, formatNumber, formatVnd, timeAgo } from "@/lib/format";
import { asStages, asStrings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge, Card, EmptyState } from "@/components/ui/primitives";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { QuoteFlow, QuoteStatusBadge } from "./quote-status";
import { BidForm } from "./bid-form";
import type { QuoteView } from "./types";
import { cn } from "@/lib/cn";

type Selection = Record<string, number>; // bidId → số lượng

type ConflictResult = { label: string; status: number; message: string };

/**
 * Phòng đấu thầu của một yêu cầu báo giá. Dữ liệu được làm mới bằng fetch mỗi 15 giây
 * (chào giá mới xuất hiện không cần tải lại trang). Mọi thao tác gửi kèm `version` đang hiển thị
 * để server áp dụng khóa lạc quan.
 */
export function QuoteRoom({ initial }: { initial: QuoteView }) {
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

  return (
    <div className="space-y-8">
      {/* Đầu trang */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-cobalt">{q.requestCode}</span>
            <QuoteStatusBadge status={q.status} />
            <span className="inline-flex items-center gap-1 rounded-full bg-cobalt px-2.5 py-0.5 font-mono text-[11px] text-kaolin" title="Khóa lạc quan: mọi thao tác phải gửi kèm phiên bản này">
              <Lock className="size-3" /> Record v{q.version} · Optimistic Lock
            </span>
          </div>
          <h1 className="mt-3 text-3xl md:text-4xl">{q.title}</h1>
          <p className="mt-2 text-sm text-ash">
            {q.organizationName} · {formatNumber(q.quantity)} sản phẩm · {GLAZES[q.preferredGlaze].label} · {categoryLabel(q.category)} · cần trong {q.deadlineDays} ngày
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={() => refresh().then(() => toast({ kind: "info", title: "Đã tải dữ liệu mới nhất" }))}><RefreshCw className="size-4" /> Làm mới</Button>
          {canCancel && <Button variant="outline" size="sm" onClick={() => setCancelOpen(true)}><Ban className="size-4" /> Hủy yêu cầu</Button>}
        </div>
      </div>

      <Card className="p-5"><QuoteFlow status={q.status} /></Card>

      {conflict && (
        <div role="alert" className="flex gap-3 rounded-[var(--radius-tile)] border border-terracotta/50 bg-terracotta/5 p-4 text-sm">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-terracotta" />
          <div>
            <p className="font-semibold text-terracotta">409 Conflict – dữ liệu đã thay đổi</p>
            <p className="mt-1">{conflict}</p>
            <p className="mt-1 text-ash">Bảng đã được tải lại với dữ liệu mới nhất (v{q.version}).</p>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          {/* Người mua / BQL: bảng so sánh và chốt */}
          {canManage && q.status === "DRAFT_REQUEST" && (
            <Card className="p-6">
              <h2 className="text-2xl">Bản nháp</h2>
              <p className="mt-2 text-sm text-ash">Gửi yêu cầu để hệ thống ghép và mời các xưởng phù hợp.</p>
              <Button className="mt-4" variant="cobalt" onClick={() => setConfirm("send")}>Gửi tới các xưởng</Button>
            </Card>
          )}

          {canManage && ["SENT_TO_ARTISANS", "ARTISANS_BIDDING"].includes(q.status) && (
            <section>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl">So sánh chào giá ({pendingBids.length})</h2>
                  <p className="text-sm text-ash">Chọn một hoặc nhiều xưởng, tổng phân bổ phải đúng {formatNumber(q.quantity)} sản phẩm.</p>
                </div>
                <Button variant="outline" size="sm" onClick={suggest} disabled={!pendingBids.length}><Sparkles className="size-4" /> Gợi ý phân bổ tối ưu</Button>
              </div>
              {pendingBids.length === 0 ? (
                <EmptyState title="Đang chờ các xưởng chào giá" description={`Đã mời ${q.invitations.length} xưởng. Trang sẽ tự cập nhật khi có chào giá mới.`} />
              ) : (
                <div className="overflow-x-auto rounded-[var(--radius-tile)] border border-line bg-white/80">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead className="bg-bisque/70 text-left text-xs uppercase tracking-wider text-ash">
                      <tr>
                        <th className="px-3 py-3">Xưởng</th><th className="px-3 py-3 text-right">Đơn giá</th><th className="px-3 py-3 text-right">Nhận làm</th>
                        <th className="px-3 py-3 text-right">Số ngày</th><th className="px-3 py-3 text-right">Uy tín</th><th className="px-3 py-3">Phân bổ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {pendingBids.map((b) => {
                        const late = b.estimatedDays > q.deadlineDays;
                        const qty = selection[b.id] ?? 0;
                        return (
                          <tr key={b.id} className={cn(qty > 0 && "bg-celadon-soft/40")}>
                            <td className="px-3 py-3">
                              <Link href={`/artisans/${b.artisan.slug}`} className="font-medium hover:text-terracotta">{b.artisan.workshopName}</Link>
                              <p className="line-clamp-2 max-w-xs text-xs text-ash">{b.proposalNote}</p>
                              <p className="font-mono text-[10px] text-ash">bid v{b.version} · {timeAgo(b.updatedAt)}</p>
                            </td>
                            <td className={cn("px-3 py-3 text-right font-mono tabular", b.offeredPricePerUnit <= q.targetBudgetPerUnit ? "text-celadon" : "text-terracotta")}>{formatVnd(b.offeredPricePerUnit)}</td>
                            <td className="px-3 py-3 text-right font-mono tabular">{formatNumber(b.committedQuantity)}</td>
                            <td className={cn("px-3 py-3 text-right font-mono", late && "text-terracotta")}>{b.estimatedDays}{late && " ⚠"}</td>
                            <td className="px-3 py-3 text-right font-mono">{b.artisan.ratingAvg.toFixed(1)}</td>
                            <td className="px-3 py-3">
                              <label className="sr-only" htmlFor={`alloc-${b.id}`}>Số lượng phân bổ cho {b.artisan.workshopName}</label>
                              <input
                                id={`alloc-${b.id}`}
                                inputMode="numeric"
                                value={qty ? qty.toLocaleString("vi-VN") : ""}
                                placeholder="0"
                                onChange={(e) => {
                                  const n = Math.min(Number(e.target.value.replace(/\D/g, "") || 0), b.committedQuantity);
                                  setSelection((s) => ({ ...s, [b.id]: n }));
                                }}
                                className="w-24 rounded border border-line px-2 py-1.5 text-right font-mono"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-bisque/40 px-4 py-3">
                    <p className="text-sm">
                      Đã phân bổ <strong className={cn("font-mono", totalSelected === q.quantity ? "text-celadon" : "text-terracotta")}>{formatNumber(totalSelected)}</strong> / {formatNumber(q.quantity)}
                      {totalSelected > 0 && <> · Thành tiền <strong className="font-mono">{formatVnd(totalCost)}</strong></>}
                      {totalSelected !== q.quantity && totalSelected > 0 && <span className="text-terracotta"> · {totalSelected < q.quantity ? `thiếu ${formatNumber(q.quantity - totalSelected)}` : `thừa ${formatNumber(totalSelected - q.quantity)}`}</span>}
                    </p>
                    <Button variant="cobalt" disabled={totalSelected !== q.quantity || q.status !== "ARTISANS_BIDDING"} onClick={() => setConfirm("accept")}>
                      <Lock className="size-4" /> Chấp nhận & phân bổ đơn hàng
                    </Button>
                  </div>
                </div>
              )}

              {/* Demo xung đột đồng thời */}
              {q.status === "ARTISANS_BIDDING" && pendingBids.length > 0 && (
                <div className="mt-6 rounded-[var(--radius-tile)] border border-dashed border-cobalt/40 bg-cobalt/[0.04] p-5">
                  <p className="flex items-center gap-2 font-semibold text-cobalt"><Zap className="size-4" /> Mô phỏng xung đột đồng thời (409 Conflict Demo)</p>
                  <p className="mt-1 text-sm text-ash">
                    Gửi hai yêu cầu chốt <em>cùng lúc</em> với cùng phiên bản v{q.version}, giống hai người bấm chốt ở hai cửa sổ. Giao dịch Serializable và điều kiện{" "}
                    <code className="font-mono text-xs">updateMany(where: {"{"} version: {q.version} {"}"})</code> bảo đảm chỉ một yêu cầu thắng.
                  </p>
                  <Button className="mt-3" size="sm" variant="outline" onClick={simulateConflict} loading={busy}>Gửi 2 yêu cầu chốt đồng thời</Button>
                  {demoResults && (
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {demoResults.map((r) => (
                        <div key={r.label} className={cn("rounded-md border p-3 text-sm", r.status === 200 ? "border-celadon/40 bg-celadon-soft/50" : "border-terracotta/40 bg-terracotta/5")}>
                          <p className="font-mono text-xs">{r.label} → HTTP {r.status}</p>
                          <p className="mt-1">{r.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Nghệ nhân: chào giá */}
          {q.viewer.isArtisan && (
            <section>
              <h2 className="mb-2 text-2xl">Chào giá của xưởng bạn</h2>
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
                <h2 className="text-2xl">Phân bổ sản xuất</h2>
                {canManage && q.status === "BUYER_ACCEPTED" && <Button variant="primary" onClick={() => setConfirm("start")}><Factory className="size-4" /> Phát lệnh sản xuất</Button>}
                {canManage && q.status === "IN_PRODUCTION" && <Button variant="celadon" onClick={() => setConfirm("deliver")}><PackageCheck className="size-4" /> Xác nhận đã nhận đủ hàng</Button>}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {q.allocatedBatches.map((b) => {
                  const n = asStages(b.productionStages).length;
                  return (
                    <Link key={b.id} href={`/trace/${b.batchCode}`} className="rounded-[var(--radius-tile)] border border-line bg-white/80 p-4 hover:border-terracotta/40">
                      <div className="flex items-center justify-between">
                        <p className="font-mono text-xs text-cobalt">{b.batchCode}</p>
                        <Badge tone={b.status === "COMPLETED" ? "celadon" : "gold"}>{b.status === "COMPLETED" ? "Hoàn tất" : "Đang làm"}</Badge>
                      </div>
                      <p className="mt-1 font-display text-xl">{b.artisan.workshopName}</p>
                      <p className="text-sm text-ash">{formatNumber(b.allocatedQuantity ?? 0)} sản phẩm · {n}/6 công đoạn</p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded bg-bisque-deep"><div className="h-full bg-gradient-to-r from-terracotta to-ember" style={{ width: `${Math.min(100, (n / 6) * 100)}%` }} /></div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* BQL và người mua: chào giá đã xử lý */}
          {canManage && q.bids.some((b) => b.status !== "PENDING") && (
            <section>
              <h3 className="mb-3 text-xl">Kết quả chào giá</h3>
              <ul className="divide-y divide-line rounded-[var(--radius-tile)] border border-line bg-white/70 text-sm">
                {q.bids.filter((b) => b.status !== "PENDING").map((b) => (
                  <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                    <span>{b.artisan.workshopName}</span>
                    <span className="font-mono text-xs">{formatVnd(b.offeredPricePerUnit)} × {formatNumber(b.allocatedQuantity ?? b.committedQuantity)}</span>
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
            <p className="eyebrow mb-3 !text-cobalt">Chi tiết yêu cầu</p>
            <p className="whitespace-pre-line leading-relaxed">{q.specifications}</p>
            <dl className="mt-4 space-y-2 border-t border-line pt-4">
              <div className="flex justify-between gap-3"><dt className="text-ash">Ngân sách</dt><dd className="font-mono">{formatVnd(q.targetBudgetPerUnit)}/sp</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-ash">Giao tới</dt><dd className="text-right">{q.deliveryAddress}</dd></div>
              {q.biddingClosesAt && <div className="flex justify-between gap-3"><dt className="text-ash">Hạn chào giá</dt><dd>{formatDate(q.biddingClosesAt, true)}</dd></div>}
              <div className="flex justify-between gap-3"><dt className="text-ash">Xưởng được mời</dt><dd>{q.invitations.length}</dd></div>
            </dl>
            {q.cancelReason && <p className="mt-3 rounded bg-ash/10 p-2 text-ash">Lý do hủy: {q.cancelReason}</p>}
          </Card>

          <Card className="p-5">
            <p className="eyebrow mb-4 flex items-center gap-1.5 !text-cobalt"><History className="size-3.5" /> Lịch sử trạng thái</p>
            <ol className="relative space-y-4 border-l border-line pl-5">
              {q.history.map((h) => (
                <li key={h.id} className="relative">
                  <span className="absolute -left-[25px] top-1 grid size-3 place-items-center rounded-full bg-cobalt ring-4 ring-kaolin" />
                  <p className="text-sm font-medium">{QUOTE_STATUS[h.toStatus].label}</p>
                  <p className="text-xs text-ash">{h.actor ? `${h.actor.name}` : "Hệ thống"} · {formatDate(h.createdAt, true)}</p>
                  {h.note && <p className="text-xs text-ash">{h.note}</p>}
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
            <p className="text-ash">Sau khi chốt, các chào giá bị khóa và không thay đổi được. Hệ thống tạo lô sản xuất có mã QR cho từng xưởng.</p>
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

      {q.status === "DELIVERED" && (
        <p className="flex items-center gap-2 rounded-[var(--radius-tile)] bg-celadon-soft p-4 text-celadon"><CheckCircle2 className="size-5" /> Đơn hàng đã hoàn tất và giao đủ.</p>
      )}
    </div>
  );
}
