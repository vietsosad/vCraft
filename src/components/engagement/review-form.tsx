"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api, ApiError, zodFieldErrors } from "@/lib/api-client";
import { reviewSchema, reviewReplySchema } from "@/lib/validators/engagement";
import { Field, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { StarInput } from "./stars";

/** Khách viết đánh giá cho một xưởng sau đơn sỉ đã giao hoặc buổi trải nghiệm đã xong. */
export function ReviewForm({ artisanId, quoteCode, bookingCode, workshopName }: { artisanId: string; quoteCode?: string; bookingCode?: string; workshopName: string }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = reviewSchema.safeParse({ artisanId, quoteCode, bookingCode, rating, comment });
    if (!parsed.success) return setErrors(zodFieldErrors(parsed.error.issues));
    setErrors({});
    setLoading(true);
    try {
      await api("/api/reviews", { body: parsed.data });
      toast({ kind: "success", title: `Cảm ơn bạn đã đánh giá ${workshopName}`, description: "Đánh giá đã hiện trên gian trưng bày của xưởng." });
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors);
        toast({ kind: "error", title: err.message });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <StarInput value={rating} onChange={setRating} name={`rating-${quoteCode ?? bookingCode}`} />
        {errors.rating && <p role="alert" className="mt-1 text-[13px] text-doson">{errors.rating}</p>}
      </div>
      <Field label="Nhận xét" htmlFor={`comment-${quoteCode ?? bookingCode}`} error={errors.comment} required>
        <Textarea
          id={`comment-${quoteCode ?? bookingCode}`}
          rows={3}
          value={comment}
          invalid={!!errors.comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Men có đều không, giao có đúng hẹn không, nghệ nhân hướng dẫn thế nào…"
        />
      </Field>
      <Button type="submit" loading={loading}>Gửi đánh giá</Button>
    </form>
  );
}

/** Nghệ nhân trả lời một đánh giá. */
export function ReplyForm({ reviewId }: { reviewId: string }) {
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = reviewReplySchema.safeParse({ reply });
    if (!parsed.success) return setError(parsed.error.issues[0].message);
    setLoading(true);
    try {
      await api(`/api/reviews/${reviewId}`, { method: "PATCH", body: parsed.data });
      toast({ kind: "success", title: "Đã gửi lời đáp" });
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast({ kind: "error", title: err instanceof ApiError ? err.message : "Không gửi được" });
    } finally {
      setLoading(false);
    }
  }

  if (!open) return <Button variant="outline" size="sm" onClick={() => setOpen(true)}>Trả lời</Button>;
  return (
    <form onSubmit={onSubmit} noValidate className="animate-rise space-y-3">
      <Textarea rows={2} value={reply} onChange={(e) => setReply(e.target.value)} invalid={!!error} aria-label="Lời đáp" placeholder="Cảm ơn bạn đã ghé xưởng…" />
      {error && <p role="alert" className="text-[13px] text-doson">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" variant="earth" loading={loading}>Gửi lời đáp</Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>Hủy</Button>
      </div>
    </form>
  );
}
