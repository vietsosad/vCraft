"use client";

import { useState } from "react";
import { api, ApiError, zodFieldErrors } from "@/lib/api-client";
import { bidSchema } from "@/lib/validators/quote";
import { formatDate, formatNumber, formatVnd } from "@/lib/format";
import { Field, Input, Textarea } from "@/components/ui/form";
import { MoneyInput } from "@/components/ui/money-input";
import { Button } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import type { QuoteView } from "./types";

const STATUS_LABEL = { PENDING: "Đang chờ khách chốt", ACCEPTED: "Trúng thầu", REJECTED: "Không được chọn", WITHDRAWN: "Đã rút" } as const;

/**
 * Biểu mẫu chào giá của nghệ nhân: tự tính thành tiền, cảnh báo nếu không kịp thời hạn.
 * Khi sửa gửi kèm `version` của chào giá – nếu đã bị khóa (khách vừa chốt) server trả 409.
 */
export function BidForm({ quote, bid, onSaved }: { quote: QuoteView; bid?: QuoteView["bids"][number]; onSaved: () => Promise<unknown> }) {
  const toast = useToast();
  const open = ["SENT_TO_ARTISANS", "ARTISANS_BIDDING"].includes(quote.status);
  const editable = open && (!bid || bid.status === "PENDING" || bid.status === "WITHDRAWN");
  const [editing, setEditing] = useState(!bid || bid.status === "WITHDRAWN");
  const [form, setForm] = useState({
    offeredPricePerUnit: (bid?.offeredPricePerUnit ?? "") as number | "",
    committedQuantity: (bid?.committedQuantity ?? "") as number | "",
    estimatedDays: (bid?.estimatedDays ?? "") as number | "",
    proposalNote: bid?.proposalNote ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const total = typeof form.offeredPricePerUnit === "number" && typeof form.committedQuantity === "number" ? form.offeredPricePerUnit * form.committedQuantity : 0;
  const finishDate = typeof form.estimatedDays === "number" ? new Date(Date.now() + form.estimatedDays * 86400000) : null;
  const late = typeof form.estimatedDays === "number" && form.estimatedDays > quote.deadlineDays;

  async function save() {
    const parsed = bidSchema.safeParse(form);
    if (!parsed.success) return setErrors(zodFieldErrors(parsed.error.issues));
    if (parsed.data.committedQuantity > quote.quantity) return setErrors({ committedQuantity: `Tối đa ${formatNumber(quote.quantity)} sản phẩm.` });
    setErrors({});
    setLoading(true);
    try {
      if (bid && bid.status === "PENDING") {
        await api(`/api/bids/${bid.id}`, { method: "PATCH", body: { ...parsed.data, version: bid.version } });
        toast({ kind: "success", title: "Đã cập nhật chào giá" });
      } else {
        await api(`/api/quotes/${quote.requestCode}/bids`, { body: parsed.data });
        toast({ kind: "success", title: "Đã gửi chào giá", description: "Khách hàng sẽ nhận thông báo ngay." });
      }
      setEditing(false);
      await onSaved();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors);
        toast({ kind: "error", title: err.status === 409 ? "Không lưu được (409)" : "Không lưu được", description: err.message });
        if (err.status === 409) await onSaved();
      }
    } finally {
      setLoading(false);
    }
  }

  async function withdraw() {
    if (!bid) return;
    setLoading(true);
    try {
      await api(`/api/bids/${bid.id}`, { method: "DELETE", body: { version: bid.version } });
      toast({ kind: "success", title: "Đã rút chào giá" });
      await onSaved();
    } catch (err) {
      toast({ kind: "error", title: err instanceof ApiError ? err.message : "Có lỗi" });
    } finally {
      setLoading(false);
    }
  }

  if (bid && !editing) {
    return (
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge tone={bid.status === "ACCEPTED" ? "celadon" : bid.status === "PENDING" ? "gold" : "ash"}>{STATUS_LABEL[bid.status]}</Badge>
          <span className="font-mono text-xs text-ash">bid v{bid.version}</span>
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <div><dt className="text-ash">Đơn giá</dt><dd className="font-mono">{formatVnd(bid.offeredPricePerUnit)}</dd></div>
          <div><dt className="text-ash">{bid.status === "ACCEPTED" ? "Được phân bổ" : "Nhận làm"}</dt><dd className="font-mono">{formatNumber(bid.allocatedQuantity ?? bid.committedQuantity)}</dd></div>
          <div><dt className="text-ash">Số ngày</dt><dd className="font-mono">{bid.estimatedDays}</dd></div>
        </dl>
        <p className="mt-3 text-sm text-ash">{bid.proposalNote}</p>
        {editable && bid.status === "PENDING" && (
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Sửa chào giá</Button>
            <Button size="sm" variant="ghost" onClick={withdraw} loading={loading}>Rút chào giá</Button>
          </div>
        )}
      </Card>
    );
  }

  if (!editable) return <Card className="p-5 text-sm text-ash">Yêu cầu này đã đóng nhận chào giá.</Card>;

  return (
    <Card className="space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Đơn giá" htmlFor="price" error={errors.offeredPricePerUnit} required hint={`Ngân sách khách: ${formatVnd(quote.targetBudgetPerUnit)}`}>
          <MoneyInput id="price" value={form.offeredPricePerUnit} onChange={(v) => setForm({ ...form, offeredPricePerUnit: v })} invalid={!!errors.offeredPricePerUnit} />
        </Field>
        <Field label="Số lượng nhận làm" htmlFor="qty" error={errors.committedQuantity} required hint={`Khách cần ${formatNumber(quote.quantity)}`}>
          <MoneyInput id="qty" value={form.committedQuantity} onChange={(v) => setForm({ ...form, committedQuantity: v })} invalid={!!errors.committedQuantity} suffix="sp" />
        </Field>
        <Field label="Số ngày hoàn thành" htmlFor="days" error={errors.estimatedDays} required hint={finishDate ? `Dự kiến xong ${formatDate(finishDate)}` : undefined}>
          <Input id="days" type="number" min={1} value={form.estimatedDays} onChange={(e) => setForm({ ...form, estimatedDays: e.target.value ? Number(e.target.value) : "" })} invalid={!!errors.estimatedDays} />
        </Field>
      </div>
      {late && <p className="rounded bg-kiln/10 p-2 text-sm text-[#9a5300]">⚠ Vượt thời hạn {quote.deadlineDays} ngày của khách – chào giá vẫn gửi được nhưng có thể bị loại khỏi gợi ý phân bổ.</p>}
      <Field label="Ghi chú đề xuất" htmlFor="note" error={errors.proposalNote} required>
        <Textarea id="note" value={form.proposalNote} onChange={(e) => setForm({ ...form, proposalNote: e.target.value })} invalid={!!errors.proposalNote} placeholder="Năng lực lò, cách in logo, lịch giao từng đợt…" />
      </Field>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm">Thành tiền: <strong className="font-mono">{formatVnd(total)}</strong></p>
        <div className="flex gap-2">
          {bid && bid.status === "PENDING" && <Button variant="ghost" onClick={() => setEditing(false)}>Hủy</Button>}
          <Button variant="cobalt" onClick={save} loading={loading}>{bid && bid.status === "PENDING" ? "Lưu thay đổi" : "Gửi chào giá"}</Button>
        </div>
      </div>
    </Card>
  );
}
