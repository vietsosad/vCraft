"use client";

import { useEffect } from "react";

const KEY = "vc-tu-mo";

/**
 * Chạy trước khi vẽ trang (chỉ khi tải trang đầy đủ): lần đầu mỗi phiên ở /account thì đóng cánh tủ,
 * để <CabinetDoorsRuntime/> mở ra. Bỏ qua khi người dùng chọn giảm chuyển động.
 */
export const cabinetBootScript = `(function(){try{if(location.pathname==='/account'&&!sessionStorage.getItem('${KEY}')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.dataset.cabinet='closed'}}catch(e){}})();`;

/**
 * Mở cánh tủ: đợi trình duyệt vẽ được khung hình đầu tiên, dừng một nhịp cho người xem thấy tủ đóng,
 * rồi các cánh xoay bản lề lần lượt. Dọn cánh khi mọi hoạt ảnh xong (không đoán bằng đồng hồ).
 */
export function CabinetDoorsRuntime() {
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.cabinet !== "closed") return;
    let cancelled = false;
    let pause = 0;
    const finish = () => {
      if (cancelled) return;
      cancelled = true;
      delete root.dataset.cabinet;
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {
        /* chế độ riêng tư: lần sau tủ lại mở, không sao */
      }
    };
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        pause = window.setTimeout(() => {
          if (cancelled) return;
          root.dataset.cabinet = "opening";
          requestAnimationFrame(() => {
            const anims = [...document.querySelectorAll(".cab-door > i")].flatMap((el) => el.getAnimations());
            if (anims.length === 0) return finish();
            Promise.all(anims.map((a) => a.finished)).then(finish, finish);
          });
        }, 300);
      }),
    );
    // Lưới an toàn: tab bị ẩn thì requestAnimationFrame không chạy
    const safety = window.setTimeout(finish, 7000);
    return () => {
      cancelled = true;
      window.clearTimeout(pause);
      window.clearTimeout(safety);
      delete root.dataset.cabinet;
    };
  }, []);
  return null;
}
