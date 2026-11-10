"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { MediaImage } from "@/lib/types";
import { VImage } from "@/components/ui/vimage";
import { cn } from "@/lib/cn";

/** Thư viện ảnh có ảnh thu nhỏ và lightbox toàn màn hình (phím ← → Esc). */
export function Gallery({ images, ratio = "4/5" }: { images: MediaImage[]; ratio?: string }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const current = images[index];

  const go = useCallback((d: number) => setIndex((i) => (i + d + images.length) % images.length), [images.length]);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [zoom, go]);

  if (!images.length) return <VImage image={null} ratio={ratio} />;

  return (
    <div>
      <button onClick={() => setZoom(true)} className="tile group relative block w-full bg-nga-sau" style={{ aspectRatio: ratio }} aria-label="Phóng to ảnh">
        <AnimatePresence initial={false}>
          <motion.div key={index} className="absolute inset-0" initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
            <VImage image={current} ratio="auto" priority={index === 0} sizes="(max-width: 1024px) 100vw, 55vw" className="h-full" imgClassName="h-full" />
          </motion.div>
        </AnimatePresence>
        <span className="absolute bottom-3 right-3 z-[3] grid size-10 place-items-center rounded-[var(--radius-tile)] bg-su/90 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
          <Expand className="size-4" />
        </span>
      </button>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.src + i}
              onClick={() => setIndex(i)}
              aria-label={`Ảnh ${i + 1}`}
              aria-current={i === index}
              className={cn("w-20 shrink-0 overflow-hidden rounded-[4px] ring-2 transition", i === index ? "ring-lam" : "ring-transparent opacity-70 hover:opacity-100")}
            >
              <VImage image={img} ratio="1/1" sizes="80px" />
            </button>
          ))}
        </div>
      )}
      {current.credit && (
        <p className="mt-2 text-[11px] text-tro">
          Ảnh: {current.credit.author} · {current.credit.license} ·{" "}
          <a href={current.credit.url} target="_blank" rel="noreferrer" className="underline">nguồn</a>
        </p>
      )}

      {zoom && (
        <div role="dialog" aria-modal="true" aria-label="Xem ảnh lớn" className="fixed inset-0 z-[900] flex items-center justify-center bg-dem/95 p-4" onClick={() => setZoom(false)}>
          <button className="absolute right-4 top-4 text-giay" aria-label="Đóng" onClick={() => setZoom(false)}><X className="size-7" /></button>
          {images.length > 1 && (
            <>
              <button className="absolute left-3 text-giay" aria-label="Ảnh trước" onClick={(e) => { e.stopPropagation(); go(-1); }}><ChevronLeft className="size-9" /></button>
              <button className="absolute right-3 text-giay" aria-label="Ảnh sau" onClick={(e) => { e.stopPropagation(); go(1); }}><ChevronRight className="size-9" /></button>
            </>
          )}
          <div className="relative h-[85vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image src={current.src} alt={current.alt} fill sizes="100vw" className="object-contain" placeholder={current.blurDataURL ? "blur" : "empty"} blurDataURL={current.blurDataURL} />
          </div>
          <p className="absolute bottom-4 text-xs text-giay/70">{index + 1} / {images.length} · {current.alt}</p>
        </div>
      )}
    </div>
  );
}
