"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck2, Minus, Plus, Users, Loader2 } from "lucide-react";
import { api, ApiError, zodFieldErrors } from "@/lib/api-client";
import { bookingCreateSchema } from "@/lib/validators/engagement";
import { formatVnd } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Button, ButtonLink } from "@/components/ui/button";

type Slot = { slot: string; endsAt: string; remaining: number; past: boolean };
type Avail = { offered: boolean; slots: Slot[]; pricePerGuest: number; capacity: number; reason: string | null };

const DOW = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

/** 14 ngày tới theo giờ Việt Nam. */
function nextDays(n: number) {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
  const today = new Date(`${fmt.format(new Date())}T00:00:00Z`);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today.getTime() + i * 86_400_000);
    return { iso: d.toISOString().slice(0, 10), dow: d.getUTCDay(), date: d.getUTCDate(), month: d.getUTCMonth() + 1 };
  });
}

/**
 * Đặt lịch nặn gốm tại xưởng: chọn ngày → khung giờ còn chỗ → số khách → thông tin liên hệ.
 * Chỗ trống được kiểm tra lại ở server trong giao dịch Serializable (hai người không đặt quá sức chứa).
 */
export function BookingWidget({
  artisanSlug,
  workshopName,
  openDays,
  access,
  defaults,
}: {
  artisanSlug: string;
  workshopName: string;
  openDays: number[];
  access: "guest" | "buyer" | "other";
  defaults: { contactName: string; contactPhone: string };
}) {
  const days = useMemo(() => nextDays(14), []);
  // Sau 15 giờ (giờ Việt Nam) các khung hôm nay gần như đã qua: mặc định chọn ngày mở cửa kế tiếp
  const lateToday = Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", hour12: false }).format(new Date())) >= 15;
  const firstOpen = days.find((d, i) => openDays.includes(d.dow) && !(i === 0 && lateToday))?.iso ?? days[0].iso;
  const [date, setDate] = useState(firstOpen);
  const [avail, setAvail] = useState<Avail | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slot, setSlot] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [form, setForm] = useState({ ...defaults, note: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ code: string } | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoadingSlots(true);
    setSlot(null);
    api<Avail>(`/api/workshops/${artisanSlug}/availability?date=${date}`, { signal: ctrl.signal })
      .then(setAvail)
      .catch(() => undefined)
      .finally(() => setLoadingSlots(false));
    return () => ctrl.abort();
  }, [artisanSlug, date, done]);

  const chosen = avail?.slots.find((s) => s.slot === slot);
  const maxGuests = chosen ? Math.min(chosen.remaining, 40) : 40;
  useEffect(() => {
    if (guests > maxGuests) setGuests(Math.max(1, maxGuests));
  }, [maxGuests, guests]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    const parsed = bookingCreateSchema.safeParse({ artisanSlug, visitDate: date, slot: slot ?? "", guests, ...form });
    if (!parsed.success) return setErrors(zodFieldErrors(parsed.error.issues));
    setErrors({});
    setSubmitting(true);
    try {
      const res = await api<{ code: string }>("/api/bookings", { body: parsed.data });
      setDone(res);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors);
        setFormError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="space-y-4 text-center">
        <div className="mx-auto grid w-fit grid-cols-3 gap-1 rounded-[8px] bg-vua p-1" aria-hidden>
          {["tile-lam", "tile-ran", "tile-dat", "tile-sen", "tile-ngoc", "tile-hoavan"].map((t, i) => (
            <motion.span key={t} initial={{ opacity: 0, y: 10, rotate: -8 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }} className={cn("tile size-9 rounded-[4px]", t)} />
          ))}
        </div>
        <p className="font-serif text-2xl font-bold">Đã gửi lịch hẹn {done.code}</p>
        <p className="text-sm text-tro">{workshopName} sẽ xác nhận trong ngày. Bạn nhận thông báo ngay khi xưởng trả lời.</p>
        <div className="flex justify-center gap-2">
          <ButtonLink href="/account/bookings">Xem lịch của tôi</ButtonLink>
          <Button variant="ghost" onClick={() => setDone(null)}>Đặt thêm</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <fieldset className="min-w-0">
        <legend className="label mb-2">Chọn ngày</legend>
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]">
          {days.map((d) => {
            const closed = !openDays.includes(d.dow);
            const active = d.iso === date;
            return (
              <button
                key={d.iso}
                type="button"
                disabled={closed}
                onClick={() => setDate(d.iso)}
                aria-pressed={active}
                aria-label={`${DOW[d.dow]} ${d.date}/${d.month}${closed ? ", xưởng nghỉ" : ""}`}
                className={cn(
                  "tile flex w-14 shrink-0 flex-col items-center py-2 transition duration-200",
                  active ? "tile-lam text-giay" : closed ? "bg-nga-dam text-tro/50 line-through shadow-none" : "bg-su hover:-translate-y-0.5",
                )}
              >
                <span className="text-[11px] font-semibold">{DOW[d.dow]}</span>
                <span className="font-display text-xl leading-tight">{d.date}</span>
                <span className="text-[10px] opacity-75">th{d.month}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="min-w-0">
        <legend className="label mb-2">Khung giờ (2 tiếng)</legend>
        {loadingSlots ? (
          <div className="flex items-center gap-2 py-6 text-sm text-tro"><Loader2 className="size-4 animate-spin" /> Đang xem chỗ trống…</div>
        ) : !avail || avail.slots.length === 0 ? (
          <p className="rounded-[var(--radius-tile)] bg-nga-dam p-4 text-sm text-tro">{avail?.reason ?? "Không có khung giờ nào."}</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {avail.slots.map((s, i) => {
              const full = s.remaining === 0 || s.past;
              const active = slot === s.slot;
              const ratio = 1 - s.remaining / (avail.capacity || 1);
              return (
                <motion.button
                  key={s.slot}
                  type="button"
                  disabled={full}
                  onClick={() => setSlot(s.slot)}
                  aria-pressed={active}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  className={cn("tile glaze p-3 text-left", active ? "tile-lam text-giay" : full ? "bg-nga-dam text-tro/60 shadow-none" : "bg-su")}
                >
                  <span className="block font-display text-lg leading-none">{s.slot}</span>
                  <span className="mt-1 block text-[11px] opacity-80">đến {s.endsAt}</span>
                  <span className="mt-2 block h-1 overflow-hidden rounded-full bg-current/15">
                    <span className="block h-full rounded-full bg-current" style={{ width: `${Math.round(ratio * 100)}%` }} />
                  </span>
                  <span className="mt-1 block text-[11px] font-semibold">{s.past ? "Đã qua" : full ? "Kín chỗ" : `Còn ${s.remaining} chỗ`}</span>
                </motion.button>
              );
            })}
          </div>
        )}
        {errors.slot && <p role="alert" className="mt-1 text-[13px] text-doson">{errors.slot}</p>}
      </fieldset>

      <AnimatePresence initial={false}>
        {slot && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between rounded-[var(--radius-tile)] border border-vua bg-su p-3">
                <span className="flex items-center gap-2 text-sm font-medium"><Users className="size-4 text-tro" /> Số khách</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} className="grid size-11 place-items-center rounded-[var(--radius-tile)] bg-nga-dam hover:bg-nga-sau" aria-label="Bớt một khách"><Minus className="size-4" /></button>
                  <output className="w-8 text-center font-display text-2xl" aria-live="polite">{guests}</output>
                  <button type="button" onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))} className="grid size-11 place-items-center rounded-[var(--radius-tile)] bg-nga-dam hover:bg-nga-sau" aria-label="Thêm một khách"><Plus className="size-4" /></button>
                </div>
              </div>
              {access === "buyer" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Người liên hệ" htmlFor="contactName" error={errors.contactName} required>
                    <Input id="contactName" autoComplete="name" value={form.contactName} invalid={!!errors.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
                  </Field>
                  <Field label="Số điện thoại" htmlFor="contactPhone" error={errors.contactPhone} required>
                    <Input id="contactPhone" type="tel" inputMode="tel" autoComplete="tel" value={form.contactPhone} invalid={!!errors.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} placeholder="0912 345 678" />
                  </Field>
                  <Field label="Ghi chú cho xưởng" htmlFor="note" className="sm:col-span-2">
                    <Textarea id="note" rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Đoàn có trẻ nhỏ, muốn vẽ men lam…" />
                  </Field>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {formError && <p role="alert" className="rounded-[var(--radius-tile)] border border-doson/35 bg-doson/8 px-3.5 py-3 text-sm text-doson">{formError}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-vua pt-4">
        <div>
          <p className="text-xs text-tro">Tạm tính · trả tại xưởng</p>
          <p className="font-display text-2xl">{formatVnd((avail?.pricePerGuest ?? 0) * guests)}</p>
        </div>
        {access === "buyer" ? (
          <Button type="submit" size="lg" loading={submitting} disabled={!slot}>
            <CalendarCheck2 className="size-4" /> Đặt lịch
          </Button>
        ) : access === "guest" ? (
          <ButtonLink href={`/login?next=${encodeURIComponent(`/artisans/${artisanSlug}#dat-lich`)}`} size="lg">Đăng nhập để đặt lịch</ButtonLink>
        ) : (
          <p className="max-w-56 text-right text-xs text-tro">Đặt lịch dành cho tài khoản khách hàng. <Link href="/login" className="underline">Cổng khách hàng</Link></p>
        )}
      </div>
    </form>
  );
}
