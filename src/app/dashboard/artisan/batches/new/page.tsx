"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError, zodFieldErrors } from "@/lib/api-client";
import { batchCreateSchema } from "@/lib/validators/batch";
import { GLAZES, GLAZE_KEYS } from "@/lib/constants";
import { Field, Input, Select } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";

export default function NewBatchPage() {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({
    batchTitle: "",
    glazeType: "MEN_LAM_CO",
    quantityProduced: "",
    clayOrigin: "Đất sét Trúc Thôn và đất sét trắng Đông Triều",
    kilnType: "Lò gas kiểm soát nhiệt độ tự động",
    peakTempC: "1300",
    firingDurationHr: "18",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  async function submit() {
    const parsed = batchCreateSchema.safeParse(form);
    if (!parsed.success) return setErrors(zodFieldErrors(parsed.error.issues));
    setLoading(true);
    try {
      const batch = await api<{ batchCode: string }>("/api/me/batches", { body: parsed.data });
      toast({ kind: "success", title: `Đã mở lô ${batch.batchCode}`, description: "Mã QR đã được sinh sẵn. Hãy ghi công đoạn đầu tiên." });
      router.push(`/dashboard/artisan/batches/${batch.batchCode}`);
    } catch (err) {
      if (err instanceof ApiError) { setErrors(err.fieldErrors); toast({ kind: "error", title: err.message }); }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto max-w-2xl space-y-4 p-6">
      <h2 className="text-3xl">Mở lô sản xuất mới</h2>
      <p className="text-sm text-tro">Mã lô dạng <span className="font-mono">BT-{new Date().getFullYear()}-LAM-009</span> và mã QR được hệ thống tự sinh.</p>
      <Field label="Tên lô" htmlFor="batchTitle" error={errors.batchTitle} required>
        <Input id="batchTitle" value={form.batchTitle} onChange={set("batchTitle")} invalid={!!errors.batchTitle} placeholder="Bình men lam vẽ sen – mẻ tháng 11" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Dòng men" htmlFor="glazeType" error={errors.glazeType} required>
          <Select id="glazeType" value={form.glazeType} onChange={set("glazeType")}>
            {GLAZE_KEYS.map((g) => <option key={g} value={g}>{GLAZES[g].label}</option>)}
          </Select>
        </Field>
        <Field label="Số lượng dự kiến" htmlFor="quantityProduced" error={errors.quantityProduced} required>
          <Input id="quantityProduced" type="number" min={1} value={form.quantityProduced} onChange={set("quantityProduced")} invalid={!!errors.quantityProduced} />
        </Field>
      </div>
      <Field label="Nguồn đất" htmlFor="clayOrigin" error={errors.clayOrigin} required>
        <Input id="clayOrigin" value={form.clayOrigin} onChange={set("clayOrigin")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Loại lò" htmlFor="kilnType" error={errors.kilnType} required className="sm:col-span-3">
          <Input id="kilnType" value={form.kilnType} onChange={set("kilnType")} />
        </Field>
        <Field label="Đỉnh nhiệt (°C)" htmlFor="peakTempC" error={errors.peakTempC} required>
          <Input id="peakTempC" type="number" value={form.peakTempC} onChange={set("peakTempC")} invalid={!!errors.peakTempC} />
        </Field>
        <Field label="Thời gian nung (giờ)" htmlFor="firingDurationHr" error={errors.firingDurationHr} required>
          <Input id="firingDurationHr" type="number" value={form.firingDurationHr} onChange={set("firingDurationHr")} invalid={!!errors.firingDurationHr} />
        </Field>
      </div>
      <div className="flex justify-end"><Button onClick={submit} loading={loading}>Mở lô & sinh mã QR</Button></div>
    </Card>
  );
}
