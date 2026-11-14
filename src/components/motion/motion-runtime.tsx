"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Bộ chạy chuyển động dùng chung (một lần cho cả ứng dụng, không gắn vào từng thành phần):
 * 1. "Gắn viên": phần tử [data-reveal] được đánh dấu data-in khi cuộn tới → CSS chạy hiệu ứng.
 *    Mặc định luôn hiện; chỉ ẩn chờ khi html có lớp .js (đặt bởi script khởi động).
 * 2. Parallax: [data-parallax="0.15"] trôi lệch theo tốc độ riêng khi cuộn (dùng thuộc tính `translate`
 *    để không đụng `transform` của hiệu ứng gắn viên).
 * 3. Tiến độ: [data-progress] nhận biến --p từ 0 tới 1 khi đi vào màn hình (vẽ hoa văn, thắp lửa…);
 *    [data-progress="through"] chạy 0 → 1 suốt quãng phần tử đi ngang qua màn hình (dải tranh trôi, cửa lò mở).
 * 4. "Bóng men": vệt sáng trên viên .glaze đi theo con trỏ; [data-tilt] nghiêng 3D nhẹ.
 *
 * Hiệu năng: danh sách phần tử được gom một lần mỗi trang (và khi DOM đổi), chỉ phần tử đang ở gần
 * màn hình mới được đo; một vòng requestAnimationFrame duy nhất, chỉ chạy khi có cuộn.
 * Người dùng giảm chuyển động: không parallax, mọi tiến độ đặt sẵn về 1.
 */
export function MotionRuntime() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---- 1. Gắn viên ---- */
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

    /* ---- 2 + 3. Parallax và tiến độ: chỉ theo dõi phần tử gần màn hình ---- */
    const near = new Set<HTMLElement>();
    const nearIo = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) near.add(e.target as HTMLElement);
          else near.delete(e.target as HTMLElement);
        }
        schedule();
      },
      { rootMargin: "35% 0px 35% 0px" },
    );

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const narrow = window.innerWidth < 768;
      const y = window.scrollY;
      for (const el of near) {
        if (el.dataset.parallax !== undefined) {
          const speed = Number(el.dataset.parallax) || 0.1;
          if (el.dataset.parallaxAnchor === "top") {
            // Bức ghép mở màn: đứng yên khi chưa cuộn rồi tách lớp dần; màn hẹp giữ nguyên vì nó cao hơn màn hình
            el.style.translate = narrow ? "" : `0 ${(-y * speed).toFixed(1)}px`;
          } else {
            const r = el.getBoundingClientRect();
            el.style.translate = `0 ${((r.top + r.height / 2 - vh / 2) * -speed).toFixed(1)}px`;
          }
        }
        if (el.dataset.progress !== undefined) {
          const r = el.getBoundingClientRect();
          let p: number;
          if (el.dataset.progress === "through") {
            p = (vh - r.top) / (vh + r.height);
          } else {
            const span = Math.max(1, Number(el.dataset.progress) || vh * 0.6);
            p = (vh * 0.9 - r.top) / span;
          }
          el.style.setProperty("--p", Math.min(1, Math.max(0, p)).toFixed(4));
        }
      }
    };
    function schedule() {
      if (!raf && !reduce) raf = requestAnimationFrame(update);
    }

    const scan = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>("[data-reveal]:not([data-in])").forEach((el) => {
        if (reduce) el.dataset.in = "";
        else io.observe(el);
      });
      root.querySelectorAll<HTMLElement>("[data-parallax], [data-progress]").forEach((el) => {
        if (reduce) {
          if (el.dataset.progress !== undefined) el.style.setProperty("--p", "1");
        } else nearIo.observe(el);
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

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      io.disconnect();
      nearIo.disconnect();
      mo.disconnect();
      window.clearTimeout(t);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
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
