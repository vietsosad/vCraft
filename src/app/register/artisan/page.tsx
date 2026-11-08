"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { api, ApiError, zodFieldErrors } from "@/lib/api-client";
import { artisanAccountStep, artisanProofStep, artisanWorkshopStep } from "@/lib/validators/auth";
import { GLAZES, GLAZE_KEYS } from "@/lib/constants";
import { slugify } from "@/lib/text";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { EmailField } from "@/components/auth/email-field";
import { PasswordMeter } from "@/components/auth/password-meter";
import { LocationPicker } from "@/components/map/location-picker";
import { ImageUploader } from "@/components/media/image-uploader";
import { useToast } from "@/components/ui/toast";
import type { MediaImage } from "@/lib/types";
import { cn } from "@/lib/cn";

const STEPS = ["Tài khoản", "Xưởng & vị trí", "Minh chứng"];
const DRAFT_KEY = "vcraft:artisan-draft";

type FormState = {
  name: string; email: string; phone: string; password: string;
  workshopName: string; clanName: string; establishedYear: string; address: string; latitude: number; longitude: number; specialties: string[];
  nationalId: string; proofNote: string; proofDocuments: MediaImage[];
};

const INITIAL: FormState = {
  name: "", email: "", phone: "", password: "",
  workshopName: "", clanName: "", establishedYear: "", address: "", latitude: 20.9762, longitude: 105.9135, specialties: [],
  nationalId: "", proofNote: "", proofDocuments: [],
};

/**
 * Đăng ký hộ nghề 3 bước. Mỗi bước kiểm tra bằng đúng schema Zod mà server dùng.
 * Bản nháp (trừ mật khẩu và CCCD) được tự lưu để quay lại không mất dữ liệu.
 */
export default function RegisterArtisanPage() {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) setForm((f) => ({ ...f, ...JSON.parse(raw) }));
    } catch { /* không có bản nháp */ }
  }, []);
  useEffect(() => {
    // Không lưu mật khẩu và số CCCD vào trình duyệt
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, nationalId, ...safe } = form;
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(safe)); } catch { /* bộ nhớ bị chặn */ }
  }, [form]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));
  const schemas = [artisanAccountStep, artisanWorkshopStep, artisanProofStep];

  function validate(i: number) {
    const r = schemas[i].safeParse(form);
    if (r.success) { setErrors({}); return true; }
    setErrors(zodFieldErrors(r.error.issues));
    return false;
  }

  async function submit() {
    if (!validate(2)) return;
    setLoading(true);
    try {
      await api("/api/auth/register-artisan", { body: { ...form, establishedYear: Number(form.establishedYear) } });
      localStorage.removeItem(DRAFT_KEY);
      toast({ kind: "success", title: "Đã gửi hồ sơ hộ nghề", description: "Ban quản lý sẽ đối chiếu và duyệt trong 1–2 ngày làm việc." });
      router.push("/dashboard/artisan");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        const fe = err.fieldErrors;
        setErrors(fe);
        if (fe.email || fe.password || fe.name || fe.phone) setStep(0);
        toast({ kind: "error", title: err.message });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="eyebrow">Hộ gia đình · Nghệ nhân</p>
      <h1 className="mt-3 text-4xl md:text-5xl">Đăng ký hộ nghề</h1>
      <p className="mt-2 text-ash">Ban quản lý sẽ đối chiếu với danh sách hộ làm nghề trong làng trước khi cấp huy hiệu xác thực, để tránh hàng nhái trà trộn.</p>

      <div className="my-8"><Stepper steps={STEPS} current={step} /></div>

      <div className="rounded-[var(--radius-tile)] border border-line bg-white/70 p-6 shadow-soft">
        {step === 0 && (
          <div className="space-y-4">
            <Field label="Họ và tên chủ hộ / nghệ nhân" htmlFor="name" error={errors.name} required>
              <Input id="name" autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} invalid={!!errors.name} />
            </Field>
            <EmailField value={form.email} onChange={(v) => set("email", v)} error={errors.email} onError={(m) => setErrors((e) => ({ ...e, email: m ?? "" }))} />
            <Field label="Số điện thoại" htmlFor="phone" error={errors.phone} required>
              <Input id="phone" type="tel" inputMode="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} invalid={!!errors.phone} placeholder="0912 345 678" />
            </Field>
            <Field label="Mật khẩu" htmlFor="password" error={errors.password} required>
              <Input id="password" type="password" autoComplete="new-password" value={form.password} onChange={(e) => set("password", e.target.value)} invalid={!!errors.password} />
            </Field>
            <PasswordMeter value={form.password} />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <Field label="Tên xưởng" htmlFor="workshopName" error={errors.workshopName} required hint={form.workshopName ? <>Địa chỉ trang: <span className="font-mono">/artisans/{slugify(form.workshopName)}</span></> : undefined}>
              <Input id="workshopName" value={form.workshopName} onChange={(e) => set("workshopName", e.target.value)} invalid={!!errors.workshopName} placeholder="Xưởng gốm …" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Dòng họ" htmlFor="clanName" error={errors.clanName} required>
                <Input id="clanName" value={form.clanName} onChange={(e) => set("clanName", e.target.value)} invalid={!!errors.clanName} placeholder="Nguyễn" />
              </Field>
              <Field label="Năm thành lập" htmlFor="establishedYear" error={errors.establishedYear} required>
                <Input id="establishedYear" inputMode="numeric" value={form.establishedYear} onChange={(e) => set("establishedYear", e.target.value.replace(/\D/g, "").slice(0, 4))} invalid={!!errors.establishedYear} placeholder="1985" />
              </Field>
            </div>
            <fieldset>
              <legend className="mb-2 text-sm font-medium">Dòng men sở trường <span className="text-terracotta">*</span></legend>
              <div className="flex flex-wrap gap-2">
                {GLAZE_KEYS.map((g) => {
                  const on = form.specialties.includes(g);
                  return (
                    <button key={g} type="button" aria-pressed={on} onClick={() => set("specialties", on ? form.specialties.filter((x) => x !== g) : [...form.specialties, g])}
                      className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm", on ? "border-ink bg-ink text-kaolin" : "border-line bg-white")}>
                      <span className="size-2.5 rounded-full" style={{ background: GLAZES[g].color }} /> {GLAZES[g].label}
                    </button>
                  );
                })}
              </div>
              {errors.specialties && <p role="alert" className="mt-1.5 text-[13px] text-[#b3261e]">{errors.specialties}</p>}
            </fieldset>
            <div>
              <p className="mb-2 text-sm font-medium">Vị trí xưởng trên bản đồ <span className="text-terracotta">*</span></p>
              <p className="mb-2 text-xs text-ash">Kéo ghim đỏ hoặc bấm vào bản đồ – địa chỉ sẽ tự điền.</p>
              <LocationPicker lat={form.latitude} lng={form.longitude} onChange={(v) => setForm((f) => ({ ...f, latitude: v.latitude, longitude: v.longitude, address: v.address ?? f.address }))} />
              {(errors.latitude || errors.longitude) && <p role="alert" className="mt-1.5 text-[13px] text-[#b3261e]">{errors.latitude || errors.longitude}</p>}
            </div>
            <Field label="Địa chỉ" htmlFor="address" error={errors.address} required hint="Tự điền theo ghim, có thể sửa lại cho chính xác">
              <Input id="address" value={form.address} onChange={(e) => set("address", e.target.value)} invalid={!!errors.address} />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="flex gap-2 rounded-md bg-celadon-soft/60 p-3 text-sm text-celadon">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" />
              Số CCCD được mã hóa AES-256 trước khi lưu, ảnh minh chứng lưu ở vùng riêng tư và chỉ Ban quản lý xem được.
            </p>
            <Field label="Số căn cước công dân" htmlFor="nationalId" error={errors.nationalId} required>
              <Input id="nationalId" inputMode="numeric" autoComplete="off" value={form.nationalId} onChange={(e) => set("nationalId", e.target.value.replace(/\D/g, "").slice(0, 12))} invalid={!!errors.nationalId} placeholder="12 chữ số" />
            </Field>
            <div>
              <p className="mb-2 text-sm font-medium">Ảnh minh chứng <span className="text-terracotta">*</span></p>
              <ImageUploader value={form.proofDocuments} onChange={(v) => set("proofDocuments", v)} max={4} purpose="proof" privateMode label="Giấy xác nhận của thôn / Hội làng nghề, ảnh xưởng" />
              {errors.proofDocuments && <p role="alert" className="mt-1.5 text-[13px] text-[#b3261e]">{errors.proofDocuments}</p>}
            </div>
            <Field label="Giới thiệu ngắn về xưởng" htmlFor="proofNote" hint="Không bắt buộc – sẽ thành câu chuyện ban đầu trên trang xưởng">
              <Textarea id="proofNote" value={form.proofNote} onChange={(e) => set("proofNote", e.target.value)} maxLength={500} />
            </Field>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0}><ArrowLeft className="size-4" /> Quay lại</Button>
          {step < 2 ? (
            <Button onClick={() => validate(step) && setStep((s) => s + 1)}>Tiếp tục <ArrowRight className="size-4" /></Button>
          ) : (
            <Button onClick={submit} loading={loading}>Gửi hồ sơ cho Ban quản lý</Button>
          )}
        </div>
      </div>
    </div>
  );
}
