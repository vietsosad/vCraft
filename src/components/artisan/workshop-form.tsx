"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { api, ApiError, zodFieldErrors } from "@/lib/api-client";
import { workshopUpdateSchema, type WorkshopUpdateInput } from "@/lib/validators/catalog";
import { GLAZES, GLAZE_KEYS } from "@/lib/constants";
import { Field, Input, Textarea, Checkbox } from "@/components/ui/form";
import { MoneyInput } from "@/components/ui/money-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/primitives";
import { ImageUploader } from "@/components/media/image-uploader";
import { LocationPicker } from "@/components/map/location-picker";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";

const DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

type Form = Omit<WorkshopUpdateInput, "experiencePriceVnd" | "maxMonthlyCapacity"> & { experiencePriceVnd: number | ""; maxMonthlyCapacity: number | "" };

/** Hồ sơ xưởng: câu chuyện gia đình, ảnh xưởng, chứng nhận, giờ mở cửa, vị trí trên bản đồ. */
export function WorkshopForm({ initial }: { initial: Form }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<Form>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [open, close] = form.openingHours.split("-");
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    const parsed = workshopUpdateSchema.safeParse(form);
    if (!parsed.success) return setErrors(zodFieldErrors(parsed.error.issues));
    setErrors({});
    setSaving(true);
    try {
      await api("/api/me/workshop", { method: "PATCH", body: parsed.data });
      toast({ kind: "success", title: "Đã lưu hồ sơ xưởng" });
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) { setErrors(err.fieldErrors); toast({ kind: "error", title: err.message }); }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="space-y-4 p-6">
        <h3 className="text-2xl">Giới thiệu</h3>
        <Field label="Tên xưởng" htmlFor="workshopName" error={errors.workshopName} required>
          <Input id="workshopName" value={form.workshopName} onChange={(e) => set("workshopName", e.target.value)} invalid={!!errors.workshopName} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nghệ nhân chính" htmlFor="artisanName" error={errors.artisanName} required>
            <Input id="artisanName" value={form.artisanName} onChange={(e) => set("artisanName", e.target.value)} />
          </Field>
          <Field label="Danh hiệu" htmlFor="artisanTitle" error={errors.artisanTitle} required>
            <Input id="artisanTitle" value={form.artisanTitle} onChange={(e) => set("artisanTitle", e.target.value)} />
          </Field>
        </div>
        <Field label="Câu khẩu hiệu" htmlFor="tagline" error={errors.tagline}>
          <Input id="tagline" value={form.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} maxLength={160} />
        </Field>
        <Field label="Câu chuyện gia đình" htmlFor="familyHistory" error={errors.familyHistory} required hint={`${form.familyHistory.length} ký tự`}>
          <Textarea id="familyHistory" rows={7} value={form.familyHistory} onChange={(e) => set("familyHistory", e.target.value)} invalid={!!errors.familyHistory} />
        </Field>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Dòng men sở trường</legend>
          <div className="flex flex-wrap gap-2">
            {GLAZE_KEYS.map((g) => {
              const on = form.specialties.includes(g);
              return (
                <button key={g} type="button" aria-pressed={on} onClick={() => set("specialties", on ? form.specialties.filter((x) => x !== g) : [...form.specialties, g])}
                  className={cn("inline-flex items-center gap-1.5 rounded-[4px] border px-3 py-1.5 text-sm", on ? "border-muc bg-dem text-giay" : "border-vua bg-su")}>
                  <span className="size-2.5 rounded-full" style={{ background: GLAZES[g].color }} /> {GLAZES[g].label}
                </button>
              );
            })}
          </div>
          {errors.specialties && <p className="mt-1 text-[13px] text-doson">{errors.specialties}</p>}
        </fieldset>
        <div>
          <p className="mb-2 text-sm font-medium">Chứng nhận chất lượng</p>
          <ul className="space-y-2">
            {form.certifications.map((c, i) => (
              <li key={i} className="grid grid-cols-[1fr_1fr_80px_auto] gap-2">
                <Input aria-label="Tên chứng nhận" value={c.name} onChange={(e) => set("certifications", form.certifications.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder="Tên chứng nhận" />
                <Input aria-label="Nơi cấp" value={c.issuer} onChange={(e) => set("certifications", form.certifications.map((x, j) => (j === i ? { ...x, issuer: e.target.value } : x)))} placeholder="Nơi cấp" />
                <Input aria-label="Năm" type="number" value={c.year} onChange={(e) => set("certifications", form.certifications.map((x, j) => (j === i ? { ...x, year: Number(e.target.value) } : x)))} />
                <button type="button" aria-label="Xóa chứng nhận" onClick={() => set("certifications", form.certifications.filter((_, j) => j !== i))} className="text-tro hover:text-datnung"><X className="size-4" /></button>
              </li>
            ))}
          </ul>
          <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => set("certifications", [...form.certifications, { name: "", issuer: "", year: new Date().getFullYear() }])}><Plus className="size-4" /> Thêm chứng nhận</Button>
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="space-y-4 p-6">
          <h3 className="text-2xl">Đón khách & đơn sỉ</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Mở cửa" htmlFor="open"><Input id="open" type="time" value={open} onChange={(e) => set("openingHours", `${e.target.value}-${close}`)} /></Field>
            <Field label="Đóng cửa" htmlFor="close" error={errors.openingHours}><Input id="close" type="time" value={close} onChange={(e) => set("openingHours", `${open}-${e.target.value}`)} /></Field>
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Ngày mở cửa</legend>
            <div className="flex gap-1.5">
              {DAYS.map((d, i) => {
                const on = form.openDays.includes(i);
                return <button key={d} type="button" aria-pressed={on} onClick={() => set("openDays", on ? form.openDays.filter((x) => x !== i) : [...form.openDays, i].sort())} className={cn("size-10 rounded-full border text-sm", on ? "border-ngoc bg-ngoc text-on" : "border-vua bg-su")}>{d}</button>;
              })}
            </div>
          </fieldset>
          <Checkbox label="Nhận khách tham quan" checked={form.isOpenForVisit} onChange={(e) => set("isOpenForVisit", e.target.checked)} />
          <Checkbox label="Có dịch vụ trải nghiệm chuốt gốm" checked={form.experienceOffered} onChange={(e) => set("experienceOffered", e.target.checked)} />
          {form.experienceOffered && (
            <Field label="Giá trải nghiệm / người" htmlFor="exp"><MoneyInput id="exp" value={form.experiencePriceVnd} onChange={(v) => set("experiencePriceVnd", v)} /></Field>
          )}
          <Checkbox label="Nhận đơn sỉ" checked={form.acceptsWholesale} onChange={(e) => set("acceptsWholesale", e.target.checked)} />
          <Field label="Công suất mỗi tháng" htmlFor="cap" hint="Dùng để hệ thống ghép đơn sỉ phù hợp"><MoneyInput id="cap" value={form.maxMonthlyCapacity} onChange={(v) => set("maxMonthlyCapacity", v)} suffix="sp" /></Field>
        </Card>
        <Card className="space-y-3 p-6">
          <h3 className="text-2xl">Vị trí</h3>
          <LocationPicker lat={form.latitude} lng={form.longitude} onChange={(v) => setForm((f) => ({ ...f, latitude: v.latitude, longitude: v.longitude, address: v.address ?? f.address }))} />
          <Field label="Địa chỉ" htmlFor="address" error={errors.address} required><Input id="address" value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
        </Card>
        <Card className="space-y-3 p-6">
          <h3 className="text-2xl">Ảnh xưởng</h3>
          <p className="text-xs text-tro">Ảnh đầu tiên là ảnh bìa trên trang xưởng và bản đồ.</p>
          <ImageUploader value={form.workshopImages} onChange={(v) => set("workshopImages", v)} max={30} purpose="workshop" />
        </Card>
      </div>

      <div className="sticky bottom-4 z-20 flex justify-end lg:col-span-2">
        <Button size="lg" onClick={save} loading={saving} className="shadow-lift">Lưu hồ sơ xưởng</Button>
      </div>
    </div>
  );
}
