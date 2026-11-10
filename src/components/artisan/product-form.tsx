"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { api, ApiError, zodFieldErrors } from "@/lib/api-client";
import { productInputSchema } from "@/lib/validators/catalog";
import { CATEGORIES, GLAZES, GLAZE_KEYS } from "@/lib/constants";
import { slugify } from "@/lib/text";
import type { MediaImage } from "@/lib/types";
import { Field, Input, Select, Textarea, Checkbox } from "@/components/ui/form";
import { MoneyInput } from "@/components/ui/money-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/primitives";
import { ConfirmDialog } from "@/components/ui/dialog";
import { ImageUploader } from "@/components/media/image-uploader";
import { useToast } from "@/components/ui/toast";

export type ProductFormValue = {
  name: string; category: string; glazeType: string; priceVnd: number | ""; dimensions: string; firingTempC: number | "";
  glazeThickness: string; story: string; images: MediaImage[]; isUniquePiece: boolean; stock: number | ""; isPublished: boolean; currentBatchId: string | null;
};

/** Biểu mẫu thêm / sửa sản phẩm: định dạng tiền, slug xem trước, gắn lô truy xuất, nhiều ảnh. */
export function ProductForm({ id, initial, batches, verified }: { id?: string; initial?: ProductFormValue; batches: { id: string; batchCode: string; batchTitle: string }[]; verified: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<ProductFormValue>(
    initial ?? { name: "", category: "", glazeType: "", priceVnd: "", dimensions: "", firingTempC: 1300, glazeThickness: "0.3mm", story: "", images: [], isUniquePiece: false, stock: 10, isPublished: verified, currentBatchId: null },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const set = <K extends keyof ProductFormValue>(k: K, v: ProductFormValue[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    const parsed = productInputSchema.safeParse(form);
    if (!parsed.success) return setErrors(zodFieldErrors(parsed.error.issues));
    setErrors({});
    setSaving(true);
    try {
      if (id) await api(`/api/me/products/${id}`, { method: "PATCH", body: parsed.data });
      else await api("/api/me/products", { body: parsed.data });
      toast({ kind: "success", title: id ? "Đã cập nhật sản phẩm" : "Đã thêm sản phẩm", description: verified ? undefined : "Lưu ở dạng nháp cho tới khi xưởng được BQL duyệt." });
      router.push("/dashboard/artisan/products");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) { setErrors(err.fieldErrors); toast({ kind: "error", title: err.message }); }
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    try {
      await api(`/api/me/products/${id}`, { method: "DELETE" });
      toast({ kind: "success", title: "Đã xóa sản phẩm" });
      router.push("/dashboard/artisan/products");
      router.refresh();
    } catch (err) {
      toast({ kind: "error", title: err instanceof ApiError ? err.message : "Có lỗi" });
    }
  }

  return (
    <Card className="space-y-5 p-6">
      <Field label="Tên sản phẩm" htmlFor="name" error={errors.name} required hint={form.name ? <>Đường dẫn: <span className="font-mono">/products/{slugify(form.name)}</span></> : undefined}>
        <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} invalid={!!errors.name} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phân loại" htmlFor="category" error={errors.category} required>
          <Select id="category" value={form.category} onChange={(e) => set("category", e.target.value)} invalid={!!errors.category}>
            <option value="">Chọn phân loại</option>
            {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
          </Select>
        </Field>
        <Field label="Dòng men" htmlFor="glazeType" error={errors.glazeType} required>
          <Select id="glazeType" value={form.glazeType} onChange={(e) => set("glazeType", e.target.value)} invalid={!!errors.glazeType}>
            <option value="">Chọn dòng men</option>
            {GLAZE_KEYS.map((g) => <option key={g} value={g}>{GLAZES[g].label}</option>)}
          </Select>
        </Field>
        <Field label="Giá bán" htmlFor="priceVnd" error={errors.priceVnd} required>
          <MoneyInput id="priceVnd" value={form.priceVnd} onChange={(v) => set("priceVnd", v)} invalid={!!errors.priceVnd} placeholder="1.250.000" />
        </Field>
        <Field label="Kích thước" htmlFor="dimensions" error={errors.dimensions} required>
          <Input id="dimensions" value={form.dimensions} onChange={(e) => set("dimensions", e.target.value)} invalid={!!errors.dimensions} placeholder="Cao 32 cm × Ø 24 cm" />
        </Field>
        <Field label="Nhiệt độ nung (°C)" htmlFor="firingTempC" error={errors.firingTempC}>
          <Input id="firingTempC" type="number" value={form.firingTempC} onChange={(e) => set("firingTempC", e.target.value ? Number(e.target.value) : "")} />
        </Field>
        <Field label="Độ dày lớp men" htmlFor="glazeThickness">
          <Input id="glazeThickness" value={form.glazeThickness} onChange={(e) => set("glazeThickness", e.target.value)} />
        </Field>
      </div>
      <Field label="Câu chuyện sản phẩm" htmlFor="story" error={errors.story} required>
        <Textarea id="story" rows={4} value={form.story} onChange={(e) => set("story", e.target.value)} invalid={!!errors.story} />
      </Field>
      <div>
        <p className="mb-2 text-sm font-medium">Ảnh sản phẩm <span className="text-datnung">*</span></p>
        <ImageUploader value={form.images} onChange={(v) => set("images", v)} max={12} purpose="product" />
        {errors.images && <p role="alert" className="mt-1.5 text-[13px] text-doson">{errors.images}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Gắn vào lô sản xuất (truy xuất QR)" htmlFor="batch" hint="Mọi sản phẩm cùng lô dùng chung mã QR của lô">
          <Select id="batch" value={form.currentBatchId ?? ""} onChange={(e) => set("currentBatchId", e.target.value || null)}>
            <option value="">Không gắn lô</option>
            {batches.map((b) => <option key={b.id} value={b.id}>{b.batchCode} – {b.batchTitle}</option>)}
          </Select>
        </Field>
        <Field label="Số lượng còn" htmlFor="stock" hint={form.isUniquePiece ? "Độc bản luôn là 1" : undefined}>
          <Input id="stock" type="number" min={0} disabled={form.isUniquePiece} value={form.isUniquePiece ? 1 : form.stock} onChange={(e) => set("stock", e.target.value ? Number(e.target.value) : "")} />
        </Field>
      </div>
      <div className="flex flex-wrap gap-6">
        <Checkbox label="Tác phẩm độc bản" description="Chỉ có một chiếc duy nhất" checked={form.isUniquePiece} onChange={(e) => set("isUniquePiece", e.target.checked)} />
        <Checkbox label="Hiển thị công khai" description={verified ? "Bỏ chọn để lưu nháp" : "Cần được BQL duyệt xưởng trước"} disabled={!verified} checked={form.isPublished && verified} onChange={(e) => set("isPublished", e.target.checked)} />
      </div>
      <div className="flex flex-wrap justify-between gap-2 border-t border-vua pt-5">
        {id ? <Button variant="ghost" onClick={() => setConfirmDelete(true)} className="text-datnung"><Trash2 className="size-4" /> Xóa</Button> : <span />}
        <Button onClick={save} loading={saving}>{id ? "Lưu thay đổi" : "Thêm sản phẩm"}</Button>
      </div>
      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={remove} title="Xóa sản phẩm?" danger confirmLabel="Xóa">
        Sản phẩm “{form.name}” sẽ bị xóa khỏi phòng triển lãm.
      </ConfirmDialog>
    </Card>
  );
}
