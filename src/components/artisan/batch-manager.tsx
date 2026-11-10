"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Download, ExternalLink, Lock, Printer, Trash2, Plus, Flame } from "lucide-react";
import { api, ApiError, zodFieldErrors } from "@/lib/api-client";
import { stageInputSchema } from "@/lib/validators/batch";
import { STAGE_TEMPLATES, REQUIRED_STAGE_KEYS } from "@/lib/constants";
import { formatDate, formatNumber } from "@/lib/format";
import type { MediaImage, ProductionStage } from "@/lib/types";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/primitives";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { ConfirmDialog } from "@/components/ui/dialog";
import { ImageUploader } from "@/components/media/image-uploader";
import { VImage } from "@/components/ui/vimage";
import { useToast } from "@/components/ui/toast";

type BatchView = {
  batchCode: string; batchTitle: string; status: "IN_PROGRESS" | "COMPLETED"; lockedAt: string | null; quantityProduced: number;
  scanCount: number; qrCodeDataUrl: string; workshopName: string; quote: { requestCode: string; organizationName: string } | null; stages: ProductionStage[];
};

/** Giờ địa phương dạng yyyy-MM-ddTHH:mm cho ô datetime-local. */
function localNow() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

/**
 * Quản lý nhật ký một lô: gợi ý công đoạn tiếp theo theo mẫu nghề gốm, bắt buộc ảnh minh chứng,
 * hoàn tất lô để khóa nhật ký, tải mã QR (SVG/PNG) và in tem dán sản phẩm.
 */
export function BatchManager({ batch }: { batch: BatchView }) {
  const router = useRouter();
  const toast = useToast();
  const locked = batch.status === "COMPLETED";
  const doneKeys = useMemo(() => new Set(batch.stages.map((s) => s.key)), [batch.stages]);
  const nextTemplate = STAGE_TEMPLATES.find((t) => !doneKeys.has(t.key));

  const [form, setForm] = useState({
    key: nextTemplate?.key ?? "",
    title: locked ? "" : nextTemplate?.title ?? "",
    description: locked ? "" : nextTemplate?.hint ?? "",
    occurredAt: localNow(),
    temperatureC: (nextTemplate?.temperatureC ?? "") as number | "",
    images: [] as MediaImage[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmComplete, setConfirmComplete] = useState(false);
  const [completing, setCompleting] = useState(false);

  function applyTemplate(key: string) {
    const t = STAGE_TEMPLATES.find((x) => x.key === key);
    setForm((f) => ({ ...f, key, title: t?.title ?? f.title, description: t?.hint ?? f.description, temperatureC: t?.temperatureC ?? "" }));
  }

  async function addStage() {
    const payload = { ...form, key: form.key || undefined, occurredAt: new Date(form.occurredAt).toISOString(), temperatureC: form.temperatureC === "" ? null : form.temperatureC };
    const parsed = stageInputSchema.safeParse(payload);
    if (!parsed.success) return setErrors(zodFieldErrors(parsed.error.issues));
    setErrors({});
    setSaving(true);
    try {
      await api(`/api/me/batches/${batch.batchCode}/stages`, { body: parsed.data });
      toast({ kind: "success", title: locked ? "Đã thêm ghi chú bổ sung" : "Đã ghi công đoạn vào nhật ký", description: "Trang truy xuất QR đã cập nhật." });
      setForm({ key: "", title: "", description: "", occurredAt: localNow(), temperatureC: "", images: [] });
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) toast({ kind: "error", title: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function removeStage(id: string) {
    try {
      await api(`/api/me/batches/${batch.batchCode}/stages/${id}`, { method: "DELETE" });
      toast({ kind: "success", title: "Đã xóa mốc" });
      router.refresh();
    } catch (err) {
      toast({ kind: "error", title: err instanceof ApiError ? `${err.status} · ${err.message}` : "Có lỗi" });
    }
  }

  async function complete() {
    setCompleting(true);
    try {
      await api(`/api/me/batches/${batch.batchCode}/complete`, { method: "POST" });
      toast({ kind: "success", title: "Đã hoàn tất và khóa nhật ký lô" });
      router.refresh();
    } catch (err) {
      toast({ kind: "error", title: err instanceof ApiError ? err.message : "Có lỗi" });
    } finally {
      setCompleting(false);
      setConfirmComplete(false);
    }
  }

  const missing = REQUIRED_STAGE_KEYS.filter((k) => !doneKeys.has(k));

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
      <div className="space-y-8">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-datnung">{batch.batchCode}</span>
            <Badge tone={locked ? "celadon" : "gold"}>{locked ? <><Lock className="size-3" /> Đã khóa {batch.lockedAt ? formatDate(batch.lockedAt) : ""}</> : "Đang sản xuất"}</Badge>
            {batch.quote && <Badge tone="cobalt">Đơn {batch.quote.requestCode}</Badge>}
          </div>
          <h2 className="mt-2 text-3xl">{batch.batchTitle}</h2>
          <p className="text-sm text-tro">{formatNumber(batch.quantityProduced)} sản phẩm · {formatNumber(batch.scanCount)} lượt quét QR</p>
        </div>

        <section>
          <h3 className="mb-4 text-2xl">Nhật ký ({batch.stages.length} mốc)</h3>
          {batch.stages.length === 0 ? (
            <p className="rounded-[var(--radius-tile)] border border-dashed border-vua p-6 text-center text-sm text-tro">Mỗi mẻ gốm là một câu chuyện. Hãy ghi lại công đoạn đầu tiên.</p>
          ) : (
            <ol className="relative space-y-4 border-l-2 border-datnung/30 pl-6">
              {batch.stages.map((s) => (
                <li key={s.id} className="relative">
                  <span className="absolute -left-[33px] top-1 grid size-4 place-items-center rounded-full bg-datnung ring-4 ring-nga" />
                  <div className="rounded-[var(--radius-tile)] border border-vua bg-su/80 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-mono text-xs text-tro">{formatDate(s.occurredAt, true)}{s.temperatureC ? ` · ${formatNumber(s.temperatureC)}°C` : ""}</p>
                        <p className="font-serif text-xl">{s.title}</p>
                      </div>
                      {!locked && (
                        <button onClick={() => removeStage(s.id)} className="text-tro hover:text-datnung" aria-label={`Xóa mốc ${s.title}`}><Trash2 className="size-4" /></button>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muc/75">{s.description}</p>
                    <div className="mt-3 flex gap-2">
                      {s.images.slice(0, 4).map((img, i) => <VImage key={img.src + i} image={img} ratio="1/1" sizes="80px" className="w-20 rounded" />)}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <Card className="space-y-4 p-6">
          <h3 className="flex items-center gap-2 text-2xl"><Plus className="size-5 text-datnung" /> {locked ? "Thêm ghi chú bổ sung" : "Ghi công đoạn mới"}</h3>
          {locked && <p className="text-sm text-tro">Nhật ký đã khóa: không sửa hay xóa được mốc cũ. Ghi chú bổ sung được đánh dấu riêng với thời điểm ghi nhận.</p>}
          {!locked && (
            <Field label="Công đoạn" htmlFor="stage-key" hint={nextTemplate ? `Gợi ý tiếp theo: ${nextTemplate.title}` : "Đã đủ 6 công đoạn chuẩn"}>
              <Select id="stage-key" value={form.key} onChange={(e) => applyTemplate(e.target.value)}>
                <option value="">Công đoạn khác (tự đặt tên)</option>
                {STAGE_TEMPLATES.map((t, i) => <option key={t.key} value={t.key}>{i + 1}. {t.title}{doneKeys.has(t.key) ? " ✓" : ""}</option>)}
              </Select>
            </Field>
          )}
          <Field label="Tiêu đề" htmlFor="stage-title" error={errors.title} required>
            <Input id="stage-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} invalid={!!errors.title} />
          </Field>
          <Field label="Mô tả" htmlFor="stage-desc" error={errors.description} required>
            <Textarea id="stage-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} invalid={!!errors.description} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Thời điểm" htmlFor="stage-time" error={errors.occurredAt} required>
              <Input id="stage-time" type="datetime-local" max={localNow()} value={form.occurredAt} onChange={(e) => setForm({ ...form, occurredAt: e.target.value })} invalid={!!errors.occurredAt} />
            </Field>
            <Field label="Nhiệt độ (°C)" htmlFor="stage-temp" error={errors.temperatureC} hint="Chỉ nhập với công đoạn nung">
              <div className="relative">
                <Flame className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-vangrom" />
                <Input id="stage-temp" type="number" className="pl-9" value={form.temperatureC} onChange={(e) => setForm({ ...form, temperatureC: e.target.value ? Number(e.target.value) : "" })} />
              </div>
            </Field>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Ảnh minh chứng <span className="text-datnung">*</span></p>
            <ImageUploader value={form.images} onChange={(images) => setForm({ ...form, images })} max={6} purpose="stage" label="Chụp hoặc chọn ảnh công đoạn (tối đa 6)" />
            {errors.images && <p role="alert" className="mt-1.5 text-[13px] text-doson">{errors.images}</p>}
          </div>
          <div className="flex justify-end"><Button onClick={addStage} loading={saving}>{locked ? "Thêm ghi chú" : "Lưu vào nhật ký"}</Button></div>
        </Card>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
        <Card className="p-5 text-center">
          <p className="label">Mã QR của lô</p>
          <Image src={batch.qrCodeDataUrl} alt={`QR ${batch.batchCode}`} width={200} height={200} unoptimized className="mx-auto mt-3" />
          <p className="font-mono text-sm">{batch.batchCode}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <a href={`/api/me/batches/${batch.batchCode}/qr?format=svg`} className="inline-flex items-center justify-center gap-1 rounded border border-muc/20 py-2 text-xs hover:bg-nga-dam"><Download className="size-3.5" /> SVG</a>
            <a href={`/api/me/batches/${batch.batchCode}/qr?format=png`} className="inline-flex items-center justify-center gap-1 rounded border border-muc/20 py-2 text-xs hover:bg-nga-dam"><Download className="size-3.5" /> PNG</a>
          </div>
          <div className="mt-2 grid gap-2">
            <ButtonLink href={`/dashboard/artisan/batches/${batch.batchCode}/labels`} variant="outline" size="sm"><Printer className="size-4" /> In tem dán sản phẩm</ButtonLink>
            <Link href={`/trace/${batch.batchCode}`} target="_blank" className="inline-flex items-center justify-center gap-1 text-sm text-datnung">Xem trang truy xuất <ExternalLink className="size-3.5" /></Link>
          </div>
        </Card>
        {!locked && (
          <Card className="p-5">
            <p className="font-medium">Hoàn tất lô</p>
            <p className="mt-1 text-sm text-tro">Cần có mốc “Nung hoàn thiện” và “Ra lò, kiểm định”. Sau khi hoàn tất, nhật ký bị khóa vĩnh viễn.</p>
            {missing.length > 0 && <p className="mt-2 text-xs text-datnung">Còn thiếu: {missing.map((k) => STAGE_TEMPLATES.find((t) => t.key === k)?.title).join(", ")}</p>}
            <Button className="mt-3 w-full" variant="celadon" disabled={missing.length > 0} onClick={() => setConfirmComplete(true)}><Lock className="size-4" /> Hoàn tất & khóa nhật ký</Button>
          </Card>
        )}
      </aside>

      <ConfirmDialog open={confirmComplete} onClose={() => setConfirmComplete(false)} onConfirm={complete} loading={completing} title="Khóa nhật ký lô?" confirmLabel="Hoàn tất & khóa">
        Sau khi khóa, không thể sửa hoặc xóa các mốc đã ghi. Khách quét QR sẽ thấy dấu “Nhật ký đã khóa”.
      </ConfirmDialog>
    </div>
  );
}
