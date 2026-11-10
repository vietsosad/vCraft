"use client";

import Image from "next/image";
import { useRef, useState, type DragEvent } from "react";
import { ImagePlus, X, ArrowLeft, ArrowRight, Loader2, Camera } from "lucide-react";
import type { MediaImage } from "@/lib/types";
import { cn } from "@/lib/cn";

type Uploaded = MediaImage & { stats?: { originalBytes: number; bytes: number } };
type Pending = { id: string; name: string; progress: number; preview: string; error?: string };

const kb = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);

/**
 * Tải nhiều ảnh: kéo thả hoặc chọn file / chụp trực tiếp bằng camera điện thoại.
 * Dùng XMLHttpRequest để hiện thanh tiến trình (fetch không báo được tiến trình upload).
 * Sau khi server tối ưu bằng sharp, hiển thị dung lượng trước → sau để thấy rõ hiệu quả nén.
 */
export function ImageUploader({
  value,
  onChange,
  max = 12,
  purpose = "general",
  label = "Kéo thả ảnh vào đây hoặc bấm để chọn",
  privateMode = false,
}: {
  value: Uploaded[];
  onChange: (images: Uploaded[]) => void;
  max?: number;
  purpose?: string;
  label?: string;
  privateMode?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const latest = useRef(value);
  latest.current = value;

  function uploadOne(file: File): Promise<Uploaded[]> {
    const id = `${file.name}-${Date.now()}-${Math.random()}`;
    const preview = URL.createObjectURL(file);
    setPending((p) => [...p, { id, name: file.name, progress: 0, preview }]);
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      const form = new FormData();
      form.append("purpose", purpose);
      form.append("files", file);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setPending((p) => p.map((x) => (x.id === id ? { ...x, progress: Math.round((e.loaded / e.total) * 100) } : x)));
      };
      xhr.onload = () => {
        const json = JSON.parse(xhr.responseText || "{}");
        if (xhr.status >= 200 && xhr.status < 300) {
          setPending((p) => p.filter((x) => x.id !== id));
          URL.revokeObjectURL(preview);
          resolve(json.data as Uploaded[]);
        } else {
          setPending((p) => p.map((x) => (x.id === id ? { ...x, error: json?.error?.message ?? "Tải lên thất bại" } : x)));
          resolve([]);
        }
      };
      xhr.onerror = () => {
        setPending((p) => p.map((x) => (x.id === id ? { ...x, error: "Mất kết nối" } : x)));
        resolve([]);
      };
      xhr.open("POST", "/api/upload");
      xhr.send(form);
    });
  }

  async function handleFiles(list: FileList | null) {
    setError("");
    if (!list?.length) return;
    const files = Array.from(list);
    const room = max - latest.current.length - pending.filter((p) => !p.error).length;
    if (room <= 0) return setError(`Tối đa ${max} ảnh.`);
    const accepted = files.filter((f) => /^image\/(jpeg|png|webp)$/.test(f.type));
    if (accepted.length < files.length) setError("Chỉ nhận ảnh JPEG, PNG hoặc WebP.");
    const tooBig = accepted.filter((f) => f.size > 10 * 1024 * 1024);
    if (tooBig.length) setError(`Ảnh vượt 10 MB: ${tooBig.map((f) => f.name).join(", ")}`);
    const batch = accepted.filter((f) => f.size <= 10 * 1024 * 1024).slice(0, room);
    const results = await Promise.all(batch.map(uploadOne));
    onChange([...latest.current, ...results.flat()]);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    void handleFiles(e.dataTransfer.files);
  }

  function move(i: number, d: number) {
    const next = [...value];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn("flex flex-col items-center justify-center gap-2 rounded-[var(--radius-tile)] border-2 border-dashed px-4 py-7 text-center transition", dragOver ? "border-datnung bg-datnung/5" : "border-vua bg-su/60")}
      >
        <ImagePlus className="size-7 text-datnung" />
        <p className="text-sm">{label}</p>
        <p className="text-xs text-tro">JPEG, PNG, WebP · tối đa 10 MB/ảnh · {value.length}/{max} ảnh{privateMode ? " · lưu riêng tư, chỉ BQL xem" : ""}</p>
        <div className="mt-1 flex gap-2">
          <button type="button" onClick={() => inputRef.current?.click()} className="rounded-[4px] border border-muc/20 px-3.5 py-1.5 text-sm hover:bg-nga-dam">Chọn ảnh</button>
          <button type="button" onClick={() => cameraRef.current?.click()} className="inline-flex items-center gap-1 rounded-[4px] border border-muc/20 px-3.5 py-1.5 text-sm hover:bg-nga-dam sm:hidden">
            <Camera className="size-4" /> Chụp
          </button>
        </div>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => { void handleFiles(e.target.files); e.target.value = ""; }} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { void handleFiles(e.target.files); e.target.value = ""; }} />
      </div>
      {error && <p role="alert" className="mt-2 text-[13px] text-doson">{error}</p>}

      {(value.length > 0 || pending.length > 0) && (
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((img, i) => (
            <li key={img.src + i} className="group relative overflow-hidden rounded-md border border-vua bg-su">
              <div className="relative aspect-square">
                {privateMode ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.thumb ?? img.src} alt={img.alt} className="h-full w-full object-cover" />
                ) : (
                  <Image src={img.thumb ?? img.src} alt={img.alt} fill sizes="120px" className="object-cover" placeholder={img.blurDataURL ? "blur" : "empty"} blurDataURL={img.blurDataURL} />
                )}
                {i === 0 && <span className="absolute left-1 top-1 rounded bg-dem/80 px-1.5 py-0.5 text-[10px] text-giay">Ảnh chính</span>}
              </div>
              {img.stats && (
                <p className="truncate px-1.5 py-1 font-mono text-[10px] text-ngoc" title="Dung lượng gốc → sau khi tối ưu WebP">
                  {kb(img.stats.originalBytes)} → {kb(img.stats.bytes)}
                </p>
              )}
              <div className="absolute right-1 top-1 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                <button type="button" aria-label="Dời sang trái" onClick={() => move(i, -1)} className="grid size-6 place-items-center rounded bg-nga/90"><ArrowLeft className="size-3.5" /></button>
                <button type="button" aria-label="Dời sang phải" onClick={() => move(i, 1)} className="grid size-6 place-items-center rounded bg-nga/90"><ArrowRight className="size-3.5" /></button>
                <button type="button" aria-label="Xóa ảnh" onClick={() => onChange(value.filter((_, j) => j !== i))} className="grid size-6 place-items-center rounded bg-nga/90 text-datnung"><X className="size-3.5" /></button>
              </div>
            </li>
          ))}
          {pending.map((p) => (
            <li key={p.id} className="relative overflow-hidden rounded-md border border-vua bg-su">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.preview} alt="" className="aspect-square w-full object-cover opacity-50" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2 text-center">
                {p.error ? (
                  <>
                    <p className="text-[11px] text-doson">{p.error}</p>
                    <button type="button" onClick={() => setPending((x) => x.filter((y) => y.id !== p.id))} className="text-[11px] underline">Bỏ qua</button>
                  </>
                ) : (
                  <>
                    <Loader2 className="size-5 animate-spin text-datnung" />
                    <span className="font-mono text-[11px]">{p.progress < 100 ? `${p.progress}%` : "Đang tối ưu…"}</span>
                  </>
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-nga-sau"><div className="h-full bg-datnung transition-all" style={{ width: `${p.progress}%` }} /></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
