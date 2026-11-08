"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { api, ApiError, zodFieldErrors } from "@/lib/api-client";
import { newsInputSchema } from "@/lib/validators/news";
import { NEWS_CATEGORIES } from "@/lib/constants";
import type { MediaImage } from "@/lib/types";
import { Field, Input, Select, Textarea, Checkbox } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/primitives";
import { ConfirmDialog } from "@/components/ui/dialog";
import { ImageUploader } from "@/components/media/image-uploader";
import { useToast } from "@/components/ui/toast";

type NewsForm = { title: string; category: string; excerpt: string; content: string; coverImage: MediaImage | null; isUrgent: boolean; isPublished: boolean };

/**
 * Soạn tin cộng đồng. Nội dung là văn bản thuần (dòng trống tách đoạn, "- " là gạch đầu dòng);
 * khi hiển thị React tự escape nên không thể chèn mã độc (XSS).
 */
export function NewsEditor({ id, initial }: { id?: string; initial?: NewsForm }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<NewsForm>(initial ?? { title: "", category: "SU_KIEN", excerpt: "", content: "", coverImage: null, isUrgent: false, isPublished: true });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const set = <K extends keyof NewsForm>(k: K, v: NewsForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    const parsed = newsInputSchema.safeParse(form);
    if (!parsed.success) return setErrors(zodFieldErrors(parsed.error.issues));
    setSaving(true);
    try {
      if (id) await api(`/api/admin/news/${id}`, { method: "PATCH", body: parsed.data });
      else await api("/api/admin/news", { body: parsed.data });
      toast({ kind: "success", title: id ? "Đã cập nhật tin" : "Đã đăng tin", description: form.isUrgent ? "Tin khẩn đã được gửi thông báo tới các hộ nghề." : undefined });
      router.push("/dashboard/admin/news");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) { setErrors(err.fieldErrors); toast({ kind: "error", title: err.message }); }
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    await api(`/api/admin/news/${id}`, { method: "DELETE" });
    toast({ kind: "success", title: "Đã xóa tin" });
    router.push("/dashboard/admin/news");
    router.refresh();
  }

  return (
    <Card className="mx-auto max-w-3xl space-y-4 p-6">
      <Field label="Tiêu đề" htmlFor="title" error={errors.title} required>
        <Input id="title" value={form.title} onChange={(e) => set("title", e.target.value)} invalid={!!errors.title} />
      </Field>
      <Field label="Chuyên mục" htmlFor="category" required>
        <Select id="category" value={form.category} onChange={(e) => set("category", e.target.value)}>
          {Object.entries(NEWS_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
      </Field>
      <Field label="Tóm tắt" htmlFor="excerpt" error={errors.excerpt} required hint={`${form.excerpt.length}/300`}>
        <Textarea id="excerpt" rows={2} maxLength={300} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} invalid={!!errors.excerpt} />
      </Field>
      <Field label="Nội dung" htmlFor="content" error={errors.content} required hint="Dòng trống để tách đoạn, bắt đầu dòng bằng “- ” để tạo gạch đầu dòng">
        <Textarea id="content" rows={10} value={form.content} onChange={(e) => set("content", e.target.value)} invalid={!!errors.content} />
      </Field>
      <div>
        <p className="mb-2 text-sm font-medium">Ảnh bìa</p>
        <ImageUploader value={form.coverImage ? [form.coverImage] : []} onChange={(v) => set("coverImage", v[0] ?? null)} max={1} purpose="news" />
      </div>
      <div className="flex flex-wrap gap-6">
        <Checkbox label="Tin khẩn" description="Ghim banner trên trang chủ, gửi thông báo tới mọi hộ nghề" checked={form.isUrgent} onChange={(e) => set("isUrgent", e.target.checked)} />
        <Checkbox label="Đăng công khai" checked={form.isPublished} onChange={(e) => set("isPublished", e.target.checked)} />
      </div>
      <div className="flex justify-between border-t border-line pt-4">
        {id ? <Button variant="ghost" className="text-terracotta" onClick={() => setConfirmDelete(true)}><Trash2 className="size-4" /> Xóa tin</Button> : <span />}
        <Button variant="cobalt" onClick={save} loading={saving}>{id ? "Lưu thay đổi" : "Đăng tin"}</Button>
      </div>
      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={remove} title="Xóa tin này?" danger confirmLabel="Xóa">Tin sẽ bị gỡ khỏi bản tin làng.</ConfirmDialog>
    </Card>
  );
}
