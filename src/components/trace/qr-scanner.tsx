"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Camera, CameraOff, ImageUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { extractBatchCode } from "@/lib/qr-text";

type Detector = { detect: (src: CanvasImageSource) => Promise<{ rawValue: string }[]> };


/**
 * Quét QR ngay trên web: dùng BarcodeDetector của trình duyệt nếu có (Chrome/Android),
 * nếu không thì giải mã từng khung hình bằng jsQR. Không gửi hình ảnh đi đâu cả.
 */
export function QrScanner() {
  const router = useRouter();
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const raf = useRef(0);
  const [state, setState] = useState<"idle" | "starting" | "scanning" | "denied" | "unsupported">("idle");
  const [found, setFound] = useState<string | null>(null);
  const [manual, setManual] = useState("");
  const [error, setError] = useState("");

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  }, []);
  useEffect(() => stop, [stop]);

  const go = useCallback(
    (text: string) => {
      const code = extractBatchCode(text);
      if (!code) {
        setError("Mã QR này không phải tem truy xuất của vCraft.");
        return false;
      }
      setFound(code);
      stop();
      if (navigator.vibrate) navigator.vibrate(60);
      setTimeout(() => router.push(`/trace/${code}`), 650);
      return true;
    },
    [router, stop],
  );

  async function start() {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia) return setState("unsupported");
    setState("starting");
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      const v = video.current!;
      v.srcObject = stream.current;
      await v.play();
      setState("scanning");
      const native = "BarcodeDetector" in window ? (new (window as unknown as { BarcodeDetector: new (o: object) => Detector }).BarcodeDetector({ formats: ["qr_code"] })) : null;
      const jsQR = native ? null : (await import("jsqr")).default;
      const ctx = canvas.current!.getContext("2d", { willReadFrequently: true })!;
      const loop = async () => {
        if (!stream.current) return;
        if (v.readyState === v.HAVE_ENOUGH_DATA) {
          try {
            if (native) {
              const codes = await native.detect(v);
              if (codes[0] && go(codes[0].rawValue)) return;
            } else if (jsQR) {
              const w = (canvas.current!.width = Math.min(640, v.videoWidth));
              const h = (canvas.current!.height = Math.round((v.videoHeight / v.videoWidth) * w));
              ctx.drawImage(v, 0, 0, w, h);
              const res = jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: "dontInvert" });
              if (res && go(res.data)) return;
            }
          } catch {
            /* khung hình lỗi, bỏ qua */
          }
        }
        raf.current = requestAnimationFrame(loop);
      };
      loop();
    } catch {
      setState("denied");
    }
  }

  async function fromFile(file: File) {
    setError("");
    const bmp = await createImageBitmap(file);
    const c = canvas.current!;
    const scale = Math.min(1, 1024 / Math.max(bmp.width, bmp.height));
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    ctx.drawImage(bmp, 0, 0, c.width, c.height);
    const jsQR = (await import("jsqr")).default;
    const res = jsQR(ctx.getImageData(0, 0, c.width, c.height).data, c.width, c.height);
    if (!res) setError("Không đọc được mã QR trong ảnh. Thử chụp gần và đủ sáng hơn.");
    else go(res.data);
  }

  function submitManual(e: FormEvent) {
    e.preventDefault();
    if (!go(manual)) setError("Mã lô có dạng BT-2026-RAN-001, in ngay dưới tem QR.");
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="tile relative aspect-square bg-dem sm:aspect-[4/3]">
        <video ref={video} playsInline muted className="absolute inset-0 h-full w-full object-cover" />
        <canvas ref={canvas} className="hidden" />
        {/* Khung ngắm: bốn góc viên gốm, vạch quét chạy lên xuống */}
        <div className="pointer-events-none absolute inset-[14%] rounded-[10px]">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
            <path d="M2 16V6a4 4 0 0 1 4-4h10M84 2h10a4 4 0 0 1 4 4v10M98 84v10a4 4 0 0 1-4 4H84M16 98H6a4 4 0 0 1-4-4V84" fill="none" stroke="#f5c9a6" strokeWidth="1.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 4 }} />
          </svg>
          {state === "scanning" && !found && <span className="absolute inset-x-3 h-[2px] animate-[scanline_2.2s_ease-in-out_infinite] rounded-full bg-[#f5c9a6] shadow-[0_0_12px_#f5c9a6]" />}
        </div>
        {state !== "scanning" && !found && (
          <div className="absolute inset-0 grid place-items-center p-6 text-center text-giay">
            <div>
              {state === "denied" ? <CameraOff className="mx-auto size-10" aria-hidden /> : <Camera className="mx-auto size-10" aria-hidden />}
              <p className="mt-3 text-sm text-giay/85">
                {state === "denied"
                  ? "Chưa được cấp quyền dùng camera. Bạn có thể tải ảnh tem QR hoặc nhập mã lô."
                  : state === "unsupported"
                    ? "Trình duyệt này không mở được camera. Hãy tải ảnh tem hoặc nhập mã lô."
                    : "Hướng camera vào tem QR dán dưới đáy sản phẩm."}
              </p>
              {(state === "idle" || state === "starting") && (
                <Button className="mt-4" onClick={start} loading={state === "starting"}><Camera className="size-4" /> Bật camera</Button>
              )}
            </div>
          </div>
        )}
        {found && (
          <div className="absolute inset-0 grid animate-rise place-items-center bg-ngoc-nen/85 p-6 text-center text-giay">
            <div>
              <p className="font-display text-3xl">Đã đọc tem</p>
              <p className="code mt-2 text-base">{found}</p>
              <p className="mt-1 text-sm text-giay/85">Đang mở hành trình của lô…</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-5">
        <div className="tile bg-su p-5">
          <p className="font-semibold">Không quét được?</p>
          <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-[var(--radius-tile)] border border-dashed border-vua p-4 text-sm transition hover:border-lam">
            <ImageUp className="size-5 text-lam" aria-hidden />
            <span>Chọn ảnh chụp tem QR từ máy</span>
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && fromFile(e.target.files[0])} />
          </label>
          <form onSubmit={submitManual} className="mt-4 flex gap-2">
            <Input aria-label="Mã lô" value={manual} onChange={(e) => setManual(e.target.value)} placeholder="BT-2026-RAN-001" className="font-mono uppercase" />
            <Button type="submit" variant="outline" aria-label="Tra cứu mã lô"><Search className="size-4" /></Button>
          </form>
          {error && <p role="alert" className="mt-3 text-sm text-doson">{error}</p>}
        </div>
        <p className="text-sm text-tro">
          Mỗi lô gốm của hộ nghề đã xác thực có một tem QR dùng chung. Quét tem để xem nhật ký từng công đoạn có ảnh chụp tại xưởng, nhiệt độ
          nung và người làm ra nó. Ảnh camera chỉ xử lý ngay trên máy bạn, không gửi lên máy chủ.
        </p>
      </div>
    </div>
  );
}
