"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Bộ chạy chuyển động dùng chung (một lần cho cả ứng dụng, không gắn vào từng thành phần):
 * 1. "Gắn viên": phần tử [data-reveal] được đánh dấu data-in khi cuộn tới → CSS chạy hiệu ứng.
 *    Mặc định luôn hiện; chỉ ẩn chờ khi html có lớp .js (đặt bởi script khởi động).
 * 2. Parallax: [data-parallax="0.15"] trôi lệch theo tốc độ riêng khi cuộn (dùng thuộc tính `translate`
 *    để không đụng `transform` của hiệu ứng gắn viên).
 * 3. Tiến độ: [data-progress] nhận biến --p từ 0 tới 1 khi đi qua màn hình (vẽ hoa văn, thắp lửa…).
 * 4. "Bóng men": vệt sáng trên viên .glaze đi theo con trỏ; [data-tilt] nghiêng 3D nhẹ.
 * Một vòng requestAnimationFrame duy nhất, chỉ chạy khi có cuộn; tắt hết khi người dùng giảm chuyển động.
 */
export function MotionRuntime() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.in = "";
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    const scan = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>("[data-reveal]:not([data-in])").forEach((el) => {
        if (reduce) el.dataset.in = "";
        else io.observe(el);
      });
    };
    scan(document);
    const mo = new MutationObserver((muts) => {
      for (const m of muts) m.addedNodes.forEach((n) => n instanceof HTMLElement && scan(n.parentElement ?? n));
    });
    mo.observe(document.body, { childList: true, subtree: true });
    // Lưới an toàn: sau 2,5 giây mọi phần tử đã trong màn hình mà còn chờ đều hiện
    const t = window.setTimeout(
      () =>
        document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-in])").forEach((el) => {
          if (el.getBoundingClientRect().top < window.innerHeight) el.dataset.in = "";
        }),
      2500,
    );

    // Parallax + tiến độ cuộn
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        // Bức ghép mở màn chỉ tách lớp trên màn rộng; màn hẹp nó cao hơn màn hình nên giữ nguyên
        if (el.dataset.parallaxAnchor === "top" && window.innerWidth < 768) {
          el.style.translate = "";
          return;
        }
        const speed = Number(el.dataset.parallax) || 0.1;
        // anchor="top": tính từ đầu trang (bức ghép mở màn đứng yên khi chưa cuộn, rồi tách lớp dần)
        const offset = el.dataset.parallaxAnchor === "top" ? -window.scrollY * speed : (r.top + r.height / 2 - vh / 2) * -speed;
        el.style.translate = `0 ${offset.toFixed(1)}px`;
      });
      document.querySelectorAll<HTMLElement>("[data-progress]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const start = vh * 0.9;
        const span = Math.max(1, Number(el.dataset.progress) || vh * 0.6);
        const p = Math.min(1, Math.max(0, (start - r.top) / span));
        el.style.setProperty("--p", p.toFixed(3));
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    if (!reduce) {
      update();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
    } else {
      document.querySelectorAll<HTMLElement>("[data-progress]").forEach((el) => el.style.setProperty("--p", "1"));
    }

    return () => {
      io.disconnect();
      mo.disconnect();
      window.clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.<HTMLElement>(".glaze");
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.setProperty("--mx", `${x * 100 - 50}%`);
      el.style.setProperty("--my", `${y * 100 - 50}%`);
      if (el.hasAttribute("data-tilt")) {
        el.style.setProperty("--ry", `${((x - 0.5) * 7).toFixed(2)}deg`);
        el.style.setProperty("--rx", `${((0.5 - y) * 7).toFixed(2)}deg`);
      }
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);

  return null;
}
