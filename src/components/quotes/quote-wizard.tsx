"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Send, Save } from "lucide-react";
import { api, ApiError, zodFieldErrors } from "@/lib/api-client";
import { quoteCreateSchema } from "@/lib/validators/quote";
import { CATEGORIES, GLAZES, GLAZE_KEYS, categoryLabel } from "@/lib/constants";
import { formatDate, formatNumber, formatVnd } from "@/lib/format";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { MoneyInput } from "@/components/ui/money-input";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { ImageUploader } from "@/components/media/image-uploader";
import { useToast } from "@/components/ui/toast";
import type { MediaImage } from "@/lib/types";

const STEPS = ["Nhu cầu", "Yêu cầu riêng", "Thời hạn & giao hàng", "Xem lại"];
const DRAFT_KEY = "vcraft:quote-draft";
const STEP_FIELDS: string[][] = [
  ["organizationName", "title", "category", "preferredGlaze", "quantity"],
  ["specifications", "targetBudgetPerUnit", "referenceImages"],
  ["deadlineDays", "biddingDays", "deliveryAddress"],
  [],
];

type Form = {
  organizationName: string; title: string; category: string; preferredGlaze: string; quantity: number | "";
  specifications: string; targetBudgetPerUnit: number | ""; referenceImages: MediaImage[];
  deadlineDays: number | ""; biddingDays: number | ""; deliveryAddress: string;
};

/**
 * Biểu mẫu nhiều bước tạo yêu cầu báo giá. Kiểm tra từng bước bằng schema dùng chung với server,
 * điền sẵn từ hồ sơ người mua và trang sản phẩm, tự tính tổng ngân sách và ngày hết hạn chào giá.
 */
export function QuoteWizard({ defaults }: { defaults: Partial<Form> }) {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<"send" | "draft" | null>(null);
  const [form, setForm] = useState<Form>({
    organizationName: "", title: "", category: "", preferredGlaze: "", quantity: "",
    specifications: "", targetBudgetPerUnit: "", referenceImages: [],
    deadlineDays: 30, biddingDays: 5, deliveryAddress: "",
    ...Object.fromEntries(Object.entries(defaults).filter(([, v]) => v)),
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw && !defaults.title) setForm((f) => ({ ...f, ...JSON.parse(raw) }));
    } catch { /* không có bản nháp */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)); } catch { /* bộ nhớ bị chặn */ }
  }, [form]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const totalBudget = typeof form.quantity === "number" && typeof form.targetBudgetPerUnit === "number" ? form.quantity * form.targetBudgetPerUnit : 0;
  const closesAt = useMemo(() => (typeof form.biddingDays === "number" ? new Date(Date.now() + form.biddingDays * 86400000) : null), [form.biddingDays]);

  function validateStep(i: number) {
    const r = quoteCreateSchema.safeParse(form);
    const all = r.success ? {} : zodFieldErrors(r.error.issues);
    const relevant = Object.fromEntries(Object.entries(all).filter(([k]) => STEP_FIELDS[i].includes(k)));
    setErrors(relevant);
    return Object.keys(relevant).length === 0;
  }

  async function submit(send: boolean) {
    const r = quoteCreateSchema.safeParse(form);
    if (!r.success) {
      const errs = zodFieldErrors(r.error.issues);
      setErrors(errs);
      const firstStep = STEP_FIELDS.findIndex((fs) => fs.some((f) => errs[f]));
      if (firstStep >= 0) setStep(firstStep);
      return;
    }
    setLoading(send ? "send" : "draft");
    try {
      const res = await api<{ requestCode: string; invited: number }>("/api/quotes", { body: { ...r.data, send } });
      localStorage.removeItem(DRAFT_KEY);
      toast({
        kind: "success",
        title: send ? `Đã gửi tới ${res.invited} xưởng phù hợp` : "Đã lưu bản nháp",
        description: res.requestCode,
      });
      router.push(`/account/quotes/${res.requestCode}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors);
        toast({ kind: "error", title: err.message });
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-8">
      <Stepper steps={STEPS} current={step} tone="cobalt" />
      <div className="mt-8 rounded-[var(--radius-tile)] border border-vua bg-su/70 p-6 shadow-soft">
        {step === 0 && (
          <div className="space-y-4">
            <Field label="Tổ chức đặt hàng" htmlFor="organizationName" error={errors.organizationName} required hint="Tự điền từ hồ sơ tài khoản">
              <Input id="organizationName" value={form.organizationName} onChange={(e) => set("organizationName", e.target.value)} invalid={!!errors.organizationName} />
            </Field>
            <Field label="Tiêu đề yêu cầu" htmlFor="title" error={errors.title} required>
              <Input id="title" value={form.title} onChange={(e) => set("title", e.target.value)} invalid={!!errors.title} placeholder="Ví dụ: 5.000 cốc sứ in logo cho lễ kỷ niệm" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phân loại" htmlFor="category" error={errors.category} required>
                <Select id="category" value={form.category} onChange={(e) => set("category", e.target.value)} invalid={!!errors.category}>
                  <option value="">Chọn phân loại</option>
                  {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
                </Select>
              </Field>
              <Field label="Dòng men mong muốn" htmlFor="preferredGlaze" error={errors.preferredGlaze} required>
                <Select id="preferredGlaze" value={form.preferredGlaze} onChange={(e) => set("preferredGlaze", e.target.value)} invalid={!!errors.preferredGlaze}>
                  <option value="">Chọn dòng men</option>
                  {GLAZE_KEYS.map((g) => <option key={g} value={g}>{GLAZES[g].label}</option>)}
                </Select>
              </Field>
            </div>
            {form.preferredGlaze && <p className="rounded-md bg-nga-dam p-3 text-xs text-tro">{GLAZES[form.preferredGlaze as keyof typeof GLAZES].description}</p>}
            <Field label="Số lượng" htmlFor="quantity" error={errors.quantity} required hint="Tối thiểu 50 sản phẩm">
              <MoneyInput id="quantity" value={form.quantity} onChange={(v) => set("quantity", v)} invalid={!!errors.quantity} suffix="sp" placeholder="5.000" />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <Field label="Mô tả yêu cầu" htmlFor="specifications" error={errors.specifications} required hint={`${form.specifications.length}/4000 ký tự`}>
              <Textarea id="specifications" rows={6} value={form.specifications} onChange={(e) => set("specifications", e.target.value)} invalid={!!errors.specifications} maxLength={4000}
                placeholder="Dung tích, kích thước, màu logo, cách in (decal nung / vẽ tay), quy cách đóng gói…" />
            </Field>
            <Field label="Ngân sách dự kiến mỗi sản phẩm" htmlFor="targetBudgetPerUnit" error={errors.targetBudgetPerUnit} required
              hint={totalBudget ? <>Tổng ngân sách dự kiến: <strong className="font-mono">{formatVnd(totalBudget)}</strong></> : undefined}>
              <MoneyInput id="targetBudgetPerUnit" value={form.targetBudgetPerUnit} onChange={(v) => set("targetBudgetPerUnit", v)} invalid={!!errors.targetBudgetPerUnit} placeholder="48.000" />
            </Field>
            <div>
              <p className="mb-2 text-sm font-medium">Logo, ảnh mẫu tham khảo</p>
              <ImageUploader value={form.referenceImages} onChange={(v) => set("referenceImages", v)} max={6} purpose="quote" label="Tải logo hoặc ảnh mẫu (không bắt buộc)" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Thời hạn giao hàng (ngày)" htmlFor="deadlineDays" error={errors.deadlineDays} required hint="Tối thiểu 7 ngày">
                <Input id="deadlineDays" type="number" min={7} max={365} value={form.deadlineDays} onChange={(e) => set("deadlineDays", e.target.value ? Number(e.target.value) : "")} invalid={!!errors.deadlineDays} />
              </Field>
              <Field label="Hạn nhận chào giá (ngày)" htmlFor="biddingDays" error={errors.biddingDays} required hint={closesAt ? `Đóng lúc ${formatDate(closesAt, true)}` : undefined}>
                <Input id="biddingDays" type="number" min={1} max={30} value={form.biddingDays} onChange={(e) => set("biddingDays", e.target.value ? Number(e.target.value) : "")} invalid={!!errors.biddingDays} />
              </Field>
            </div>
            <Field label="Địa chỉ giao hàng" htmlFor="deliveryAddress" error={errors.deliveryAddress} required>
              <Input id="deliveryAddress" autoComplete="street-address" value={form.deliveryAddress} onChange={(e) => set("deliveryAddress", e.target.value)} invalid={!!errors.deliveryAddress} placeholder="144 Xuân Thủy, Cầu Giấy, Hà Nội" />
            </Field>
          </div>
        )}

        {step === 3 && (
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            {[
              ["Tổ chức", form.organizationName],
              ["Tiêu đề", form.title],
              ["Phân loại", categoryLabel(form.category)],
              ["Dòng men", form.preferredGlaze ? GLAZES[form.preferredGlaze as keyof typeof GLAZES].label : ""],
              ["Số lượng", typeof form.quantity === "number" ? `${formatNumber(form.quantity)} sản phẩm` : ""],
              ["Ngân sách", typeof form.targetBudgetPerUnit === "number" ? `${formatVnd(form.targetBudgetPerUnit)}/sp · tổng ${formatVnd(totalBudget)}` : ""],
              ["Thời hạn", `${form.deadlineDays} ngày · nhận chào giá ${form.biddingDays} ngày`],
              ["Giao tới", form.deliveryAddress],
            ].map(([k, v]) => (
              <div key={k} className="border-b border-vua pb-2"><dt className="text-xs text-tro">{k}</dt><dd className="mt-0.5">{v || <span className="text-doson">Chưa nhập</span>}</dd></div>
            ))}
            <div className="sm:col-span-2"><dt className="text-xs text-tro">Mô tả</dt><dd className="mt-0.5 whitespace-pre-line">{form.specifications}</dd></div>
          </dl>
        )}

        <div className="mt-6 flex flex-wrap justify-between gap-2">
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0}><ArrowLeft className="size-4" /> Quay lại</Button>
          <div className="flex gap-2">
            {step === 3 && <Button variant="outline" onClick={() => submit(false)} loading={loading === "draft"}><Save className="size-4" /> Lưu nháp</Button>}
            {step < 3 ? (
              <Button variant="cobalt" onClick={() => validateStep(step) && setStep((s) => s + 1)}>Tiếp tục <ArrowRight className="size-4" /></Button>
            ) : (
              <Button variant="cobalt" onClick={() => submit(true)} loading={loading === "send"}><Send className="size-4" /> Gửi tới các xưởng</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
